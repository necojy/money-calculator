'use client';

import { useState, useEffect, useRef } from 'react';
import { Product, PurchaseRecord } from '@/types';
import RecordStats from '@/components/RecordStats';
import PurchaseCard from '@/components/PurchaseCard';
import MasterProduct from '@/components/MasterProduct';
import RecordBackup from '@/components/RecordBackup';

export default function RecordsPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [history, setHistory] = useState<PurchaseRecord[]>([]);
  
  const STORAGE_KEY = 'shopping-helper-final';

// 1. 篩選與分頁狀態
  const [filterName, setFilterName] = useState(''); 
  const [filterMonth, setFilterMonth] = useState(''); // 新增：月份篩選狀態 (格式: YYYY-MM)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

// 2. 核心篩選邏輯
  const filteredHistory = history.filter(record => {
    const matchName = filterName ? record.purchaser === filterName : true;
    const matchMonth = filterMonth ? record.date.startsWith(filterMonth) : true; // 月份比對
    return matchName && matchMonth;
  });

// 3. 分頁切割
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const pagedHistory = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // --- 資料讀取與存檔 ---
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const { products: p, history: h } = JSON.parse(savedData);
        if (p) setProducts(p);
        if (h) setHistory(h);
      } catch (e) {
        console.error("讀取存檔失敗", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const dataToSave = { products, history };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    }
  }, [products, history, isLoaded]);

// --- 統計計算 (利潤現在與篩選連動) ---
  const unReconciled = filteredHistory.filter(h => !h.isReconciled); // 僅計算篩選範圍內未對帳的
  const totalCost = unReconciled.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalRevenue = unReconciled.reduce((acc, curr) => 
    acc + curr.items.reduce((s, i) => s + (Number(i.sellingPrice || 0) * Number(i.qty)), 0), 0
  );

  // 淨利潤：計算「篩選範圍內」所有紀錄的利潤
  const totalProfit = filteredHistory.reduce((acc, curr) => {
    const revenue = curr.items.reduce((s, i) => s + (Number(i.sellingPrice || 0) * Number(i.qty)), 0);
    return acc + (revenue - curr.totalAmount);
  }, 0);

  // --- 功能處理 ---
  const addMasterProduct = () => {
    const name = prompt("商品名稱:");
    const price = Number(prompt("預期售出價:"));
    if (name) setProducts([...products, { id: Date.now().toString(), name, defaultPrice: price || 0 }]);
  };

  const addRecord = () => {
    setHistory([{
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      items: [], 
      totalAmount: 0,
      isReconciled: false,
      purchaser: '',
      purchaseLocation: '',
      paymentMethod: '信用卡',
      pickupLocation: ''
    }, ...history]);
  };

  const handleExport = () => {
    const data = { products, history };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.products && data.history) {
          if (confirm("匯入將覆蓋目前資料，確定嗎？")) {
            setProducts(data.products);
            setHistory(data.history);
          }
        }
      } catch (err) { alert("檔案格式錯誤"); }
    };
    reader.readAsText(file);
  };

  if (!isLoaded) return <div className="p-10 text-center font-bold">載入中...</div>;

 return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-900">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* 1. 統計看板 (傳入月份) */}
        <RecordStats 
          totalCost={totalCost} 
          totalRevenue={totalRevenue} 
          totalProfit={totalProfit} 
          selectedMonth={filterMonth} 
        />

        <RecordBackup onExport={handleExport} onImport={handleImport} />

        {/* 2. 組合篩選工具列 */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-200 flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">月份篩選:</span>
            <input 
              type="month" 
              value={filterMonth}
              onChange={(e) => { setFilterMonth(e.target.value); setCurrentPage(1); }}
              className="bg-slate-100 p-2 rounded-xl text-xs font-bold outline-none border border-slate-100 focus:border-blue-400"
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">購買人篩選:</span>
            <div className="flex gap-2">
              {['', '宥', '洪', '涵', '崑'].map(name => (
                <button
                  key={name}
                  onClick={() => { setFilterName(name); setCurrentPage(1); }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    filterName === name ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-500'
                  }`}
                >
                  {name || '全部'}
                </button>
              ))}
            </div>
          </div>
          
          {/* 清除篩選按鈕 */}
          {(filterName || filterMonth) && (
            <button 
              onClick={() => { setFilterName(''); setFilterMonth(''); setCurrentPage(1); }}
              className="text-[10px] font-bold text-red-400 hover:text-red-600 self-end md:self-center"
            >
              清除所有篩選 ✕
            </button>
          )}
        </div>

        {/* 常用商品、新增按鈕、紀錄列表與分頁控制項 (與先前代碼一致) */}
        {/* ... */}

      </div>
    </main>
  );
}