'use client';

import { useState, useEffect, useRef } from 'react';
import { Product, PurchaseRecord, PurchaseItem } from '@/types';

export default function RecordsPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [history, setHistory] = useState<PurchaseRecord[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const STORAGE_KEY = 'shopping-helper-final-v4'; // 更新 Key 以避免結構衝突

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
  const totalCost = history.filter(h => !h.isReconciled).reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalRevenue = history.filter(h => !h.isReconciled).reduce((acc, curr) => 
    acc + curr.items.reduce((sum, item) => sum + (Number(item.sellingPrice || 0) * Number(item.qty)), 0), 0);
  const totalProfit = history.reduce((acc, curr) => {
    const rev = curr.items.reduce((sum, item) => sum + (Number(item.sellingPrice || 0) * Number(item.qty)), 0);
    return acc + (rev - curr.totalAmount);
  }, 0);

  // --- 資料操作 ---
  const addRecord = () => {
    const newRecord: PurchaseRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      buyer: '',          // 預設購買人
      store: '',          // 預設購買地方
      paymentMethod: '信用卡', // 預設付款方式
      pickupLocation: '', // 預設取貨地點
      items: [], 
      totalAmount: 0,
      isReconciled: false
    };
    setHistory([newRecord, ...history]);
  };

  const updateRecordField = (id: string, field: keyof PurchaseRecord, value: any) => {
    setHistory(history.map(h => h.id === id ? { ...h, [field]: value } : h));
  };

  const updateItemDetail = (recordId: string, itemIdx: number, field: keyof PurchaseItem, value: any) => {
    setHistory(history.map(record => {
      if (record.id === recordId) {
        const newItems = record.items.map((item, i) => i === itemIdx ? { ...item, [field]: value } : item);
        const newCost = newItems.reduce((sum, it) => sum + (Number(it.price) * Number(it.qty)), 0);
        return { ...record, items: newItems, totalAmount: newCost };
      }
      return record;
    }));
  };

  if (!isLoaded) return <div className="p-10 text-center font-bold">載入中...</div>;

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-900">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* 看板與備份功能保持不變 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 p-6 rounded-[32px] text-white shadow-xl">
            <p className="text-[10px] font-bold opacity-50 uppercase mb-1">未對帳成本</p>
            <h2 className="text-3xl font-black">${totalCost}</h2>
          </div>
          <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">未對帳預期營收</p>
            <h2 className="text-3xl font-black text-blue-600">${totalRevenue}</h2>
          </div>
          <div className="bg-green-500 p-6 rounded-[32px] text-white shadow-lg">
            <p className="text-[10px] font-bold opacity-80 uppercase mb-1">累計總獲利</p>
            <h2 className="text-3xl font-black">${totalProfit}</h2>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4">
          <h1 className="text-3xl font-black text-slate-800">購買與獲利紀錄 📑</h1>
          <button onClick={addRecord} className="bg-blue-600 text-white px-8 py-4 rounded-[24px] font-black shadow-xl hover:scale-105 transition-all">+ 開始新紀錄</button>
        </div>

        {/* 紀錄列表 */}
        <section className="space-y-6">
          {history.map(record => {
            const recordProfit = record.items.reduce((sum, item) => sum + (Number(item.sellingPrice) * Number(item.qty)), 0) - record.totalAmount;

            return (
              <div key={record.id} className={`bg-white p-8 rounded-[40px] border-2 transition-all shadow-xl ${record.isReconciled ? 'border-green-100 bg-green-50/10' : 'border-slate-50'}`}>
                
                {/* 1. 訂單基本詳情 (新加入的欄位) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 rounded-3xl border border-slate-100">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">購買日期</label>
                    <input type="date" value={record.date} onChange={(e) => updateRecordField(record.id, 'date', e.target.value)} className="w-full bg-white text-xs font-bold p-2 rounded-xl border-none outline-none text-black" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">購買人</label>
                    <input type="text" placeholder="姓名" value={record.buyer} onChange={(e) => updateRecordField(record.id, 'buyer', e.target.value)} className="w-full bg-white text-xs font-bold p-2 rounded-xl outline-none text-black" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">購買地方</label>
                    <input type="text" placeholder="商店名稱" value={record.store} onChange={(e) => updateRecordField(record.id, 'store', e.target.value)} className="w-full bg-white text-xs font-bold p-2 rounded-xl outline-none text-black" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">付款方式</label>
                    <select value={record.paymentMethod} onChange={(e) => updateRecordField(record.id, 'paymentMethod', e.target.value)} className="w-full bg-white text-xs font-bold p-2 rounded-xl outline-none text-black cursor-pointer">
                      <option value="信用卡">信用卡</option>
                      <option value="貨到付款">貨到付款</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">取貨地點</label>
                    <input type="text" placeholder="地址或櫃點" value={record.pickupLocation} onChange={(e) => updateRecordField(record.id, 'pickupLocation', e.target.value)} className="w-full bg-white text-xs font-bold p-2 rounded-xl outline-none text-black" />
                  </div>
                </div>

                {/* 2. 獲利統計資訊 */}
                <div className="flex justify-between items-end mb-8 px-2">
                  <div className="flex gap-8">
                    <div><p className="text-[10px] font-bold text-slate-400 uppercase">本筆成本</p><h3 className="text-4xl font-black">${record.totalAmount}</h3></div>
                    <div><p className="text-[10px] font-bold text-green-500 uppercase">本筆獲利</p><h3 className="text-2xl font-black text-green-500 tracking-tighter">+${recordProfit}</h3></div>
                  </div>
                  <div className="flex items-center gap-6 bg-slate-50 p-4 rounded-3xl">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs font-bold text-slate-500">對帳完成</span>
                      <input type="checkbox" checked={record.isReconciled} onChange={() => updateRecordField(record.id, 'isReconciled', !record.isReconciled)} className="w-6 h-6 accent-green-600" />
                    </label>
                    <button onClick={() => {if(confirm("確定刪除？")) setHistory(history.filter(h=>h.id!==record.id))}} className="text-red-400 font-bold text-xs hover:text-red-600 transition-colors">刪除 ✕</button>
                  </div>
                </div>

                {/* 3. 品項細項清單 */}
                <div className="space-y-3">
                  {record.items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                      <input type="text" value={item.name} onChange={(e) => updateItemDetail(record.id, idx, 'name', e.target.value)} className="col-span-4 bg-white p-2 rounded-xl text-sm font-bold outline-none text-black" />
                      <input type="number" value={item.price || ''} onChange={(e) => updateItemDetail(record.id, idx, 'price', e.target.value)} className="col-span-2 bg-white p-2 rounded-xl text-sm font-black text-right text-orange-600" />
                      <input type="number" value={item.sellingPrice || ''} onChange={(e) => updateItemDetail(record.id, idx, 'sellingPrice', e.target.value)} className="col-span-2 bg-white p-2 rounded-xl text-sm font-black text-right text-blue-600" />
                      <input type="number" value={item.qty} onChange={(e) => updateItemDetail(record.id, idx, 'qty', e.target.value)} className="col-span-2 bg-white p-2 rounded-xl text-sm font-black text-center text-black" />
                      <div className="col-span-1 text-right text-xs font-black text-slate-400">${(Number(item.sellingPrice) - Number(item.price)) * Number(item.qty)}</div>
                      <button onClick={() => {
                        const newItems = record.items.filter((_, i) => i !== idx);
                        setHistory(history.map(h => h.id === record.id ? {...h, items: newItems, totalAmount: newItems.reduce((s, it) => s + (Number(it.price) * Number(it.qty)), 0)} : h));
                      }} className="col-span-1 text-red-300 hover:text-red-500 font-bold">✕</button>
                    </div>
                  ))}
                  {/* 快速加入常用商品按鈕保持不變 */}
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}