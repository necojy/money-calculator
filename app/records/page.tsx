'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product, PurchaseRecord } from '@/types';

export default function RecordsPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [history, setHistory] = useState<PurchaseRecord[]>([]);

  useEffect(() => {
    const savedProducts = localStorage.getItem('master-products');
    const savedHistory = localStorage.getItem('purchase-history');
    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('master-products', JSON.stringify(products));
      localStorage.setItem('purchase-history', JSON.stringify(history));
    }
  }, [products, history, isLoaded]);

  // --- 功能函式 ---

  const addProduct = () => {
    const name = prompt("請輸入產品名稱:");
    const price = Number(prompt("請輸入預設售價:"));
    if (name && !isNaN(price)) {
      setProducts([...products, { id: Date.now().toString(), name, defaultPrice: price }]);
    }
  };

  const deleteProduct = (id: string) => {
    if (confirm("確定要刪除這個常用產品嗎？")) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const addRecord = () => {
    const newRecord: PurchaseRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      items: [],
      totalAmount: 0,
      isReconciled: false
    };
    setHistory([newRecord, ...history]);
  };

  const deleteRecord = (id: string) => {
    if (confirm("確定要刪除這筆購買紀錄嗎？")) {
      setHistory(history.filter(h => h.id !== id));
    }
  };

  const toggleReconcile = (id: string) => {
    setHistory(history.map(h => h.id === id ? { ...h, isReconciled: !h.isReconciled } : h));
  };

  // 計算總支出
  const totalExpense = history.reduce((acc, curr) => acc + curr.totalAmount, 0);

  if (!isLoaded) return <div className="p-10 text-center text-slate-500 font-bold">載入中...</div>;

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-900">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* 消費統計區 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-600 p-6 rounded-[32px] text-white shadow-lg">
            <p className="text-xs font-bold opacity-70 uppercase tracking-widest mb-1">總累計支出</p>
            <h2 className="text-3xl font-black">${totalExpense}</h2>
          </div>
          <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col justify-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">紀錄筆數</p>
            <h2 className="text-3xl font-black text-slate-800">{history.length} <span className="text-sm">筆</span></h2>
          </div>
          <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col justify-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">未對帳金額</p>
            <h2 className="text-3xl font-black text-orange-500">
              ${history.filter(h => !h.isReconciled).reduce((acc, curr) => acc + curr.totalAmount, 0)}
            </h2>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4">
          <h1 className="text-3xl font-black text-slate-800">購買紀錄管理 📑</h1>
          <button onClick={addRecord} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all">新增本次購買</button>
        </div>

        {/* 常用產品管理 */}
        <section className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-200">
          <div className="flex justify-between mb-4">
            <h2 className="font-black text-slate-400 uppercase tracking-widest text-[10px]">常用產品清單 (點擊 ✕ 刪除)</h2>
            <button onClick={addProduct} className="text-blue-600 text-xs font-black">+ 新增常用項</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {products.map(p => (
              <div key={p.id} className="group flex items-center bg-slate-100 pl-4 pr-2 py-1.5 rounded-full border border-slate-200 hover:border-blue-300 transition-colors">
                <span className="text-sm font-bold text-slate-700">{p.name} (${p.defaultPrice})</span>
                <button 
                onClick={() => deleteProduct(p.id)}
                className="ml-2 text-red-400 hover:text-red-600 font-bold p-1 leading-none"
                >
                ✕
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 紀錄列表 */}
        <section className="space-y-4">
          {history.map(record => (
            <div key={record.id} className={`group relative bg-white p-6 rounded-[32px] border-2 transition-all ${record.isReconciled ? 'border-green-200 bg-green-50/20 opacity-80' : 'border-slate-100 shadow-md'}`}>
              
              {/* 刪除紀錄按鈕 (右上角) */}
              <button 
                onClick={() => deleteRecord(record.id)}
                className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition-colors font-bold p-2 text-xs"
                >
                刪除紀錄 ✕
                </button>

              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="text-[10px] font-black text-slate-400 mb-1 block uppercase tracking-tighter">{record.date}</span>
                  <h3 className="text-2xl font-black text-slate-800">總計 ${record.totalAmount}</h3>
                </div>
                <div className="flex items-center gap-3 pr-10">
                  <span className="text-xs font-bold text-slate-500">已對帳</span>
                  <input 
                    type="checkbox" 
                    checked={record.isReconciled} 
                    onChange={() => toggleReconcile(record.id)}
                    className="w-7 h-7 rounded-xl accent-green-600 cursor-pointer shadow-sm"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                {record.items.length === 0 ? (
                  <p className="text-sm text-slate-300 italic">尚未添加具體品項...</p>
                ) : (
                  record.items.map((item, idx) => (
                    <span key={idx} className="bg-white px-3 py-1 rounded-xl border border-slate-100 text-[10px] font-bold text-slate-500">
                      {item.name} x{item.qty} (${item.price * item.qty})
                    </span>
                  ))
                )}
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}