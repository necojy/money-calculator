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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const STORAGE_KEY = 'shopping-helper-final';

  // 1. 新增搜尋與分頁狀態
  const [filterName, setFilterName] = useState(''); // 篩選購買人
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // 每頁顯示 5 筆

  // 2. 處理篩選後的資料
  const filteredHistory = history.filter(record => {
    const matchName = filterName ? record.purchaser === filterName : true;
    return matchName;
  });

  // 3. 處理分頁切割
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

  // --- 統計計算 ---
  const unReconciled = history.filter(h => !h.isReconciled);
  const totalCost = unReconciled.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalRevenue = unReconciled.reduce((acc, curr) => 
    acc + curr.items.reduce((s, i) => s + (Number(i.sellingPrice || 0) * Number(i.qty)), 0), 0
  );
  const totalProfit = history.reduce((acc, curr) => {
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
        
        <RecordStats totalCost={totalCost} totalRevenue={totalRevenue} totalProfit={totalProfit} />

        <RecordBackup onExport={handleExport} onImport={handleImport} />

        <MasterProduct 
          products={products} 
          onAdd={addMasterProduct} 
          onDelete={(id) => setProducts(products.filter(p => p.id !== id))} 
        />

        {/* 篩選工具列 */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 flex flex-wrap gap-4 items-center">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">篩選購買人:</span>
          <div className="flex gap-2">
            {['', '宥', '洪', '涵', '崑'].map(name => (
              <button
                key={name}
                onClick={() => { setFilterName(name); setCurrentPage(1); }}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterName === name ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {name || '全部'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center pt-4">
          <h1 className="text-3xl font-black text-slate-800">購買與獲利紀錄 📑</h1>
          <button onClick={addRecord} className="bg-blue-600 text-white px-8 py-4 rounded-[24px] font-black shadow-xl hover:scale-105 transition-all">
            + 開始新紀錄
          </button>
        </div>

        {/* 紀錄列表：改用 pagedHistory */}
        <section className="space-y-6">
          {pagedHistory.map(record => (
            <PurchaseCard 
              key={record.id} 
              record={record} 
              products={products}
              onUpdate={(updated) => setHistory(history.map(h => h.id === updated.id ? updated : h))}
              onDelete={(id) => setHistory(history.filter(h => h.id !== id))}
            />
          ))}
          {filteredHistory.length === 0 && <p className="text-center py-20 text-slate-400 font-bold">沒有符合篩選條件的紀錄</p>}
        </section>

        {/* 分頁控制項 */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-6 pt-8 pb-10">
            <button 
              disabled={currentPage === 1}
              onClick={() => { setCurrentPage(prev => prev - 1); window.scrollTo(0, 0); }}
              className="font-black text-blue-600 disabled:opacity-20 transition-opacity p-2"
            >
              ← 上一頁
            </button>
            <div className="bg-white px-6 py-2 rounded-full border border-slate-200 shadow-sm">
              <span className="font-bold text-slate-500 text-sm">第 {currentPage} / {totalPages} 頁</span>
            </div>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => { setCurrentPage(prev => prev + 1); window.scrollTo(0, 0); }}
              className="font-black text-blue-600 disabled:opacity-20 transition-opacity p-2"
            >
              下一頁 →
            </button>
          </div>
        )}
      </div>
    </main>
  );
}