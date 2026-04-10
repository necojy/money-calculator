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
      isReconciled: false
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
        
        {/* 1. 統計看板 */}
        <RecordStats totalCost={totalCost} totalRevenue={totalRevenue} totalProfit={totalProfit} />

        {/* 2. 資料備份 */}
        <RecordBackup onExport={handleExport} onImport={handleImport} />

        {/* 3. 常用商品清單 */}
        <MasterProduct 
          products={products} 
          onAdd={addMasterProduct} 
          onDelete={(id) => setProducts(products.filter(p => p.id !== id))} 
        />

        <div className="flex justify-between items-center pt-4">
          <h1 className="text-3xl font-black text-slate-800">購買與獲利紀錄 📑</h1>
          <button onClick={addRecord} className="bg-blue-600 text-white px-8 py-4 rounded-[24px] font-black shadow-xl hover:scale-105 transition-all">
            + 開始新紀錄
          </button>
        </div>

        {/* 4. 紀錄列表 */}
        <section className="space-y-6">
          {history.map(record => (
            <PurchaseCard 
              key={record.id} 
              record={record} 
              products={products}
              onUpdate={(updated) => setHistory(history.map(h => h.id === updated.id ? updated : h))}
              onDelete={(id) => setHistory(history.filter(h => h.id !== id))}
            />
          ))}
          {history.length === 0 && <p className="text-center py-20 text-slate-400 font-bold">目前沒有紀錄</p>}
        </section>
      </div>
    </main>
  );
}