'use client';

import { useState, useEffect, useRef } from 'react';
import { Product, PurchaseRecord, PurchaseItem } from '@/types';

export default function RecordsPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [history, setHistory] = useState<PurchaseRecord[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const STORAGE_KEY = 'shopping-helper-final';

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

  // --- 統計計算 (核心邏輯修正) ---

  // 1. 成本支出：僅加總「未對帳」的紀錄
  const totalCost = history
    .filter(h => !h.isReconciled)
    .reduce((acc, curr) => acc + curr.totalAmount, 0);

  // 2. 預期營收：僅加總「未對帳」的紀錄
  const totalRevenue = history
    .filter(h => !h.isReconciled)
    .reduce((acc, curr) => {
      return acc + curr.items.reduce((sum, item) => sum + (Number(item.sellingPrice || 0) * Number(item.qty)), 0);
    }, 0);

  // 3. 淨利潤：累計「所有」紀錄的獲利 (不論是否對帳，利潤都不會消除)
  const totalProfit = history.reduce((acc, curr) => {
    const recordRevenue = curr.items.reduce((sum, item) => sum + (Number(item.sellingPrice || 0) * Number(item.qty)), 0);
    const recordCost = curr.totalAmount;
    return acc + (recordRevenue - recordCost);
  }, 0);

  // --- 備份功能 ---
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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- 資料操作 ---
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

  const updateItemDetail = (recordId: string, itemIdx: number, field: keyof PurchaseItem, value: any) => {
    setHistory(history.map(record => {
      if (record.id === recordId) {
        const newItems = record.items.map((item, i) => i === itemIdx ? { ...item, [field]: value } : item);
        return { ...record, items: newItems, totalAmount: newItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.qty)), 0) };
      }
      return record;
    }));
  };

  if (!isLoaded) return <div className="p-10 text-center font-bold">載入中...</div>;

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-900">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* 1. 統計看板 */}
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
            <p className="text-[10px] font-bold opacity-80 uppercase mb-1">累計總獲利 (淨利潤)</p>
            <h2 className="text-3xl font-black">${totalProfit}</h2>
          </div>
        </div>

        {/* 2. 資料備份 */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 flex flex-wrap gap-4 items-center justify-between">
          <div className="text-xs font-bold text-slate-500">💾 資料備份管理</div>
          <div className="flex gap-2">
            <button onClick={handleExport} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-xs font-black">匯出檔案</button>
            <button onClick={() => fileInputRef.current?.click()} className="bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-black">匯入檔案</button>
            <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
          </div>
        </div>

        {/* 3. 常用商品 */}
        <section className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-black text-slate-400 uppercase">常用商品清單</h2>
            <button onClick={addMasterProduct} className="text-blue-600 font-bold text-xs">+ 新增商品售價</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {products.map(p => (
              <div key={p.id} className="bg-slate-50 px-3 py-2 rounded-2xl border border-slate-100 group">
                <span className="text-sm font-bold text-slate-700">{p.name} <span className="text-blue-500 font-black">${p.defaultPrice}</span></span>
                <button onClick={() => {if(confirm("刪除？")) setProducts(products.filter(i=>i.id!==p.id))}} className="ml-2 text-red-300 opacity-0 group-hover:opacity-100">✕</button>
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-between items-center pt-4">
          <h1 className="text-3xl font-black text-slate-800">購買與獲利紀錄 📑</h1>
          <button onClick={addRecord} className="bg-blue-600 text-white px-8 py-4 rounded-[24px] font-black shadow-xl">+ 開始新紀錄</button>
        </div>

        {/* 4. 紀錄列表 */}
        <section className="space-y-6">
          {history.map(record => {
            const recordRevenue = record.items.reduce((sum, item) => sum + (Number(item.sellingPrice || 0) * Number(item.qty)), 0);
            const recordProfit = recordRevenue - record.totalAmount;

            return (
              <div key={record.id} className={`bg-white p-8 rounded-[40px] border-2 transition-all shadow-xl ${record.isReconciled ? 'border-green-100 bg-green-50/10' : 'border-slate-50'}`}>
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                  <div className="space-y-2">
                    <input type="date" value={record.date} onChange={(e) => setHistory(history.map(h => h.id === record.id ? {...h, date: e.target.value} : h))} className="bg-slate-100 text-xs font-black p-2 rounded-xl outline-none" />
                    <div className="flex items-end gap-6">
                      <div><p className="text-[10px] font-bold text-slate-400 uppercase">本筆成本</p><h3 className="text-4xl font-black">${record.totalAmount}</h3></div>
                      <div className="pb-1"><p className="text-[10px] font-bold text-green-500 uppercase">本筆獲利</p><h3 className="text-2xl font-black text-green-500">+${recordProfit}</h3></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 bg-slate-50 p-4 rounded-3xl">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs font-bold text-slate-500">對帳完成</span>
                      <input type="checkbox" checked={record.isReconciled} onChange={() => setHistory(history.map(h => h.id === record.id ? {...h, isReconciled: !h.isReconciled} : h))} className="w-6 h-6 accent-green-600" />
                    </label>
                    <button onClick={() => {if(confirm("刪除？")) setHistory(history.filter(h=>h.id!==record.id))}} className="text-red-400 font-bold text-xs">刪除 ✕</button>
                  </div>
                </div>

                <div className="space-y-4">
                  {record.items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50/50 p-3 rounded-2xl">
                      <input type="text" value={item.name} onChange={(e) => updateItemDetail(record.id, idx, 'name', e.target.value)} className="col-span-4 bg-white p-2 rounded-xl text-sm font-bold outline-none" />
                      <input type="number" value={item.price || ''} onChange={(e) => updateItemDetail(record.id, idx, 'price', e.target.value)} className="col-span-2 bg-white p-2 rounded-xl text-sm font-black text-right text-orange-600" />
                      <input type="number" value={item.sellingPrice || ''} onChange={(e) => updateItemDetail(record.id, idx, 'sellingPrice', e.target.value)} className="col-span-2 bg-white p-2 rounded-xl text-sm font-black text-right text-blue-600" />
                      <input type="number" value={item.qty} onChange={(e) => updateItemDetail(record.id, idx, 'qty', e.target.value)} className="col-span-2 bg-white p-2 rounded-xl text-sm font-black text-center" />
                      <div className="col-span-1 text-right text-xs font-black text-slate-400">${(Number(item.sellingPrice) - Number(item.price)) * Number(item.qty)}</div>
                      <button onClick={() => {
                        const newItems = record.items.filter((_, i) => i !== idx);
                        setHistory(history.map(h => h.id === record.id ? {...h, items: newItems, totalAmount: newItems.reduce((s, it) => s + (it.price * it.qty), 0)} : h));
                      }} className="col-span-1 text-red-300">✕</button>
                    </div>
                  ))}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                    {products.map(p => (
                      <button key={p.id} onClick={() => setHistory(history.map(h => h.id === record.id ? { ...h, items: [...h.items, { name: p.name, price: 0, sellingPrice: p.defaultPrice, qty: 1 }] } : h))} className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-2 rounded-xl">+ {p.name}</button>
                    ))}
                    <button onClick={() => setHistory(history.map(h => h.id === record.id ? {...h, items: [...h.items, { name: '新商品', price: 0, sellingPrice: 0, qty: 1 }]} : h))} className="bg-slate-200 text-slate-600 text-xs font-bold px-3 py-2 rounded-xl">+ 手動新增</button>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}