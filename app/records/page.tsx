'use client';

import { useState, useEffect, useRef } from 'react';
import { Product, PurchaseRecord, PurchaseItem } from '@/types';

export default function RecordsPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [history, setHistory] = useState<PurchaseRecord[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 固定儲存鑰匙，避免版本更新導致資料抓不到
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

  // --- 匯出功能 ---
  const handleExport = () => {
    const data = { products, history };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `shopping-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // --- 匯入功能 ---
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        if (data.products && data.history) {
          if (confirm("匯入將會覆蓋目前的資料，確定嗎？")) {
            setProducts(data.products);
            setHistory(data.history);
            alert("匯入成功！");
          }
        } else {
          alert("檔案格式不正確");
        }
      } catch (err) {
        alert("讀取檔案失敗，請確保檔案是正確的 JSON 格式");
      }
    };
    reader.readAsText(file);
    // 清除選取，讓同一個檔案可以重複選取
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- 原有的管理邏輯 ---
  const addMasterProduct = () => {
    const name = prompt("商品名稱:");
    const price = Number(prompt("預期售出價:"));
    if (name) setProducts([...products, { id: Date.now().toString(), name, defaultPrice: price || 0 }]);
  };

  const deleteMasterProduct = (id: string) => {
    if (confirm("確定刪除此常用商品？")) setProducts(products.filter(p => p.id !== id));
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
        const newTotalCost = newItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.qty)), 0);
        return { ...record, items: newItems, totalAmount: newTotalCost };
      }
      return record;
    }));
  };

  const deleteItemFromRecord = (recordId: string, itemIdx: number) => {
    setHistory(history.map(record => {
      if (record.id === recordId) {
        const newItems = record.items.filter((_, i) => i !== itemIdx);
        return { ...record, items: newItems, totalAmount: newItems.reduce((sum, item) => sum + (item.price * item.qty), 0) };
      }
      return record;
    }));
  };

  const quickAddItem = (recordId: string, product: Product) => {
    setHistory(history.map(h => h.id === recordId ? { ...h, items: [...h.items, { name: product.name, price: 0, sellingPrice: product.defaultPrice, qty: 1 }] } : h));
  };

  // --- 統計計算 ---
  const totalCost = history.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalRevenue = history.reduce((acc, curr) => acc + curr.items.reduce((sum, item) => sum + (Number(item.sellingPrice) * Number(item.qty)), 0), 0);
  const totalProfit = totalRevenue - totalCost;

  if (!isLoaded) return <div className="p-10 text-center font-bold text-slate-400">載入中...</div>;

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-900">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* 1. 統計看板 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 p-6 rounded-[32px] text-white shadow-xl">
            <p className="text-[10px] font-bold opacity-50 uppercase mb-1">成本支出</p>
            <h2 className="text-3xl font-black">${totalCost}</h2>
          </div>
          <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">預期營收</p>
            <h2 className="text-3xl font-black text-blue-600">${totalRevenue}</h2>
          </div>
          <div className="bg-green-500 p-6 rounded-[32px] text-white shadow-lg">
            <p className="text-[10px] font-bold opacity-80 uppercase mb-1">淨利潤</p>
            <h2 className="text-3xl font-black">${totalProfit}</h2>
          </div>
        </div>

        {/* 2. 資料備份與還原 (新增區塊) */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 flex flex-wrap gap-4 items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-700">💾 資料備份管理</h3>
            <p className="text-[10px] text-slate-400 font-bold">若資料遺失，可透過「匯入檔案」還原歷史備份。</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleExport} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-xs font-black hover:bg-slate-200 transition-all">
              匯出檔案 (.json)
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-black transition-all">
              匯入備份檔案
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
          </div>
        </div>

        {/* 3. 常用商品管理 */}
        <section className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest text-black">常用商品清單</h2>
            <button onClick={addMasterProduct} className="text-blue-600 font-bold text-xs">+ 新增商品售價</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {products.map(p => (
              <div key={p.id} className="flex items-center bg-slate-50 px-3 py-2 rounded-2xl border border-slate-100 group">
                <span className="text-sm font-bold text-slate-700">{p.name} <span className="text-blue-500 ml-1 font-black">${p.defaultPrice}</span></span>
                <button onClick={() => deleteMasterProduct(p.id)} className="ml-2 text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all font-bold">✕</button>
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-between items-center pt-4">
          <h1 className="text-3xl font-black text-slate-800">購買與獲利紀錄 📑</h1>
          <button onClick={addRecord} className="bg-blue-600 text-white px-8 py-4 rounded-[24px] font-black shadow-xl hover:scale-105 transition-all">+ 開始新紀錄</button>
        </div>

        {/* 4. 紀錄列表 */}
        <section className="space-y-6">
          {history.map(record => {
            const recordRevenue = record.items.reduce((sum, item) => sum + (Number(item.sellingPrice) * Number(item.qty)), 0);
            const recordProfit = recordRevenue - record.totalAmount;

            return (
              <div key={record.id} className={`bg-white p-8 rounded-[40px] border-2 transition-all shadow-xl ${record.isReconciled ? 'border-green-100 bg-green-50/10 opacity-80' : 'border-slate-50'}`}>
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                  <div className="space-y-2">
                    <input type="date" value={record.date} onChange={(e) => setHistory(history.map(h => h.id === record.id ? {...h, date: e.target.value} : h))} className="bg-slate-100 text-xs font-black p-2 rounded-xl outline-none text-black" />
                    <div className="flex items-end gap-6">
                      <div><p className="text-[10px] font-bold text-slate-400 uppercase">總支出</p><h3 className="text-4xl font-black text-slate-800">${record.totalAmount}</h3></div>
                      <div className="pb-1"><p className="text-[10px] font-bold text-green-500 uppercase">賺取</p><h3 className="text-2xl font-black text-green-500 tracking-tighter">+${recordProfit}</h3></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 bg-slate-50 p-4 rounded-3xl">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs font-bold text-slate-500">對帳完成</span>
                      <input type="checkbox" checked={record.isReconciled} onChange={() => setHistory(history.map(h => h.id === record.id ? {...h, isReconciled: !h.isReconciled} : h))} className="w-6 h-6 accent-green-600" />
                    </label>
                    <button onClick={() => { if(confirm("刪除整筆？")) setHistory(history.filter(h => h.id !== record.id)) }} className="text-red-400 hover:text-red-600 font-bold text-xs">刪除 ✕</button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-12 gap-2 text-[10px] font-black text-slate-400 uppercase px-2">
                    <div className="col-span-4">商品名稱</div>
                    <div className="col-span-2 text-right">進貨單價</div>
                    <div className="col-span-2 text-right">售出單價</div>
                    <div className="col-span-2 text-center">數量</div>
                    <div className="col-span-1 text-right">利潤</div>
                    <div className="col-span-1"></div>
                  </div>
                  {record.items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                      <input type="text" value={item.name} onChange={(e) => updateItemDetail(record.id, idx, 'name', e.target.value)} className="col-span-4 bg-white p-2 rounded-xl text-sm font-bold outline-none text-black" />
                      <input type="number" value={item.price || ''} onChange={(e) => updateItemDetail(record.id, idx, 'price', e.target.value)} className="col-span-2 bg-white p-2 rounded-xl text-sm font-black text-right outline-none text-orange-600" />
                      <input type="number" value={item.sellingPrice || ''} onChange={(e) => updateItemDetail(record.id, idx, 'sellingPrice', e.target.value)} className="col-span-2 bg-white p-2 rounded-xl text-sm font-black text-right outline-none text-blue-600" />
                      <input type="number" value={item.qty} onChange={(e) => updateItemDetail(record.id, idx, 'qty', e.target.value)} className="col-span-2 bg-white p-2 rounded-xl text-sm font-black text-center outline-none text-black" />
                      <div className="col-span-1 text-right text-xs font-black text-slate-400">${(Number(item.sellingPrice) - Number(item.price)) * Number(item.qty)}</div>
                      <button onClick={() => deleteItemFromRecord(record.id, idx)} className="col-span-1 text-red-300 hover:text-red-600 font-bold text-center">✕</button>
                    </div>
                  ))}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                    <p className="w-full text-[10px] font-bold text-slate-400 uppercase mb-1">快速加入常用商品：</p>
                    {products.map(p => (
                      <button key={p.id} onClick={() => quickAddItem(record.id, p)} className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-2 rounded-xl hover:bg-blue-100 transition-colors">+ {p.name}</button>
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