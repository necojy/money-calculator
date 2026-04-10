'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product, PurchaseRecord } from '@/types';

export default function RecordsPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  // 產品主表
  const [products, setProducts] = useState<Product[]>([]);
  // 購買紀錄
  const [history, setHistory] = useState<PurchaseRecord[]>([]);

  // LocalStorage 讀取與儲存
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

  // 新增產品到主表
  const addProduct = () => {
    const name = prompt("請輸入產品名稱:");
    const price = Number(prompt("請輸入預設售價:"));
    if (name && !isNaN(price)) {
      setProducts([...products, { id: Date.now().toString(), name, defaultPrice: price }]);
    }
  };

  // 新增購買紀錄
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

  const toggleReconcile = (id: string) => {
    setHistory(history.map(h => h.id === id ? { ...h, isReconciled: !h.isReconciled } : h));
  };

  if (!isLoaded) return <div className="p-10 text-center">載入中...</div>;

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-900">
      <nav className="max-w-4xl mx-auto mb-8 flex gap-4">
        <Link href="/" className="text-blue-600 font-bold hover:underline">← 返回湊單計算機</Link>
      </nav>

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-end">
          <h1 className="text-3xl font-black text-slate-800">購買紀錄管理 📑</h1>
          <button onClick={addRecord} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg">新增本次購買</button>
        </div>

        {/* 產品主表管理 (選填) */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex justify-between mb-4">
            <h2 className="font-bold text-slate-500 uppercase tracking-widest text-xs">常用產品清單</h2>
            <button onClick={addProduct} className="text-blue-600 text-xs font-bold">+ 新增常用項</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {products.map(p => (
              <span key={p.id} className="bg-slate-100 px-3 py-1 rounded-full text-sm font-medium">
                {p.name} (${p.defaultPrice})
              </span>
            ))}
          </div>
        </section>

        {/* 紀錄列表 */}
        <section className="space-y-4">
          {history.map(record => (
            <div key={record.id} className={`bg-white p-6 rounded-3xl border-2 transition-all ${record.isReconciled ? 'border-green-200 opacity-75' : 'border-slate-100 shadow-md'}`}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="text-xs font-black text-slate-400">{record.date}</span>
                  <h3 className="text-xl font-black text-slate-800">總計 ${record.totalAmount}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-bold text-slate-500">已對帳</label>
                  <input 
                    type="checkbox" 
                    checked={record.isReconciled} 
                    onChange={() => toggleReconcile(record.id)}
                    className="w-6 h-6 accent-green-500 cursor-pointer"
                  />
                </div>
              </div>
              
              <p className="text-sm text-slate-400 italic">
                {record.items.length === 0 ? "尚未添加品項..." : record.items.map(i => `${i.name}x${i.qty}`).join(', ')}
              </p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}