'use client';

import { useState, useEffect } from 'react';
import { Product, PurchaseRecord, PurchaseItem } from '@/types';

export default function RecordsPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [history, setHistory] = useState<PurchaseRecord[]>([]);

  useEffect(() => {
    const savedProducts = localStorage.getItem('master-products-v2');
    const savedHistory = localStorage.getItem('purchase-history-v2');
    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('master-products-v2', JSON.stringify(products));
      localStorage.setItem('purchase-history-v2', JSON.stringify(history));
    }
  }, [products, history, isLoaded]);

  // --- 常用商品管理 ---
  const addMasterProduct = () => {
    const name = prompt("商品名稱:");
    const price = Number(prompt("預期售出價:"));
    if (name) {
      setProducts([...products, { id: Date.now().toString(), name, defaultPrice: price || 0 }]);
    }
  };

  const deleteMasterProduct = (id: string) => {
    if (confirm("確定刪除此常用商品？")) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  // --- 購買紀錄功能 ---
  const addRecord = () => {
    const newRecord: PurchaseRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      items: [], 
      totalAmount: 0, // 這是總支出(成本)
      isReconciled: false
    };
    setHistory([newRecord, ...history]);
  };

  // 核心：更新品項並計算利潤
  const updateItemDetail = (recordId: string, itemIdx: number, field: string, value: any) => {
    setHistory(history.map(record => {
      if (record.id === recordId) {
        const newItems = record.items.map((item: any, i) => 
          i === itemIdx ? { ...item, [field]: value } : item
        );
        const newTotalCost = newItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.qty)), 0);
        return { ...record, items: newItems, totalAmount: newTotalCost };
      }
      return record;
    }));
  };

  // 快速從常用清單加入品項
  const quickAddItem = (recordId: string, product: Product) => {
    setHistory(history.map(h => {
      if (h.id === recordId) {
        // 我們假設預設進貨價是 0，由你手動填入，而售價(sellingPrice)由常用清單帶入
        const newItem = { productId: product.id, name: product.name, price: 0, sellingPrice: product.defaultPrice, qty: 1 };
        const newItems = [...h.items, newItem];
        return { ...h, items: newItems };
      }
      return h;
    }));
  };

  const deleteRecord = (id: string) => {
    if (confirm("確定要刪除這筆紀錄嗎？")) setHistory(history.filter(h => h.id !== id));
  };

  // --- 計算統計數據 ---
  const totalCost = history.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalRevenue = history.reduce((acc, curr) => {
    return acc + curr.items.reduce((sum: number, item: any) => sum + (Number(item.sellingPrice || 0) * Number(item.qty)), 0);
  }, 0);
  const totalProfit = totalRevenue - totalCost;

  if (!isLoaded) return <div className="p-10 text-center font-bold">載入中...</div>;

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-900">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* 1. 利潤統計看板 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 p-6 rounded-[32px] text-white shadow-xl">
            <p className="text-xs font-bold opacity-60 mb-1 tracking-widest uppercase">總支出 (進貨成本)</p>
            <h2 className="text-3xl font-black">${totalCost}</h2>
          </div>
          <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 mb-1 tracking-widest uppercase">總營收 (售價合計)</p>
            <h2 className="text-3xl font-black text-blue-600">${totalRevenue}</h2>
          </div>
          <div className="bg-green-500 p-6 rounded-[32px] text-white shadow-lg">
            <p className="text-xs font-bold opacity-80 mb-1 tracking-widest uppercase">總賺取 (淨利潤)</p>
            <h2 className="text-3xl font-black">${totalProfit}</h2>
          </div>
        </div>

        {/* 2. 常用商品管理區 */}
        <section className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">常用商品與預設售價</h2>
            <button onClick={addMasterProduct} className="text-blue-600 font-bold text-xs">+ 新增商品</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {products.map(p => (
              <div key={p.id} className="flex items-center bg-slate-50 px-3 py-2 rounded-2xl border border-slate-100 group">
                <span className="text-sm font-bold text-slate-700">{p.name} <span className="text-blue-500 font-black ml-1">${p.defaultPrice}</span></span>
                <button onClick={() => deleteMasterProduct(p.id)} className="ml-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">✕</button>
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-between items-center pt-4">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">購買與獲利紀錄 📑</h1>
          <button onClick={addRecord} className="bg-blue-600 text-white px-8 py-4 rounded-[24px] font-black shadow-xl hover:scale-105 transition-all">
            + 開始新紀錄
          </button>
        </div>

        {/* 3. 紀錄列表 */}
        <section className="space-y-6">
          {history.map(record => {
            // 計算單筆紀錄的利潤
            const recordRevenue = record.items.reduce((sum: number, item: any) => sum + (Number(item.sellingPrice || 0) * Number(item.qty)), 0);
            const recordProfit = recordRevenue - record.totalAmount;

            return (
              <div key={record.id} className={`bg-white p-8 rounded-[40px] border-2 transition-all shadow-xl ${record.isReconciled ? 'border-green-200 opacity-80' : 'border-slate-100'}`}>
                
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                  <div className="space-y-2">
                    <input type="date" value={record.date} onChange={(e) => setHistory(history.map(h => h.id === record.id ? {...h, date: e.target.value} : h))} className="bg-slate-100 text-xs font-black p-2 rounded-xl outline-none" />
                    <div className="flex items-end gap-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">總支出</p>
                        <h3 className="text-3xl font-black">${record.totalAmount}</h3>
                      </div>
                      <div className="pb-1">
                        <p className="text-[10px] font-bold text-green-500 uppercase">本筆賺取</p>
                        <h3 className="text-xl font-black text-green-500">+${recordProfit}</h3>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-3xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500">對帳完成</span>
                      <input type="checkbox" checked={record.isReconciled} onChange={() => setHistory(history.map(h => h.id === record.id ? {...h, isReconciled: !h.isReconciled} : h))} className="w-6 h-6 accent-green-600" />
                    </div>
                    <button onClick={() => deleteRecord(record.id)} className="text-red-400 hover:text-red-600 font-bold text-xs">刪除 ✕</button>
                  </div>
                </div>

                {/* 品項編輯：加入「成本」與「售價」 */}
                <div className="space-y-4">
                  <div className="grid grid-cols-12 gap-2 text-[10px] font-black text-slate-400 uppercase px-2">
                    <div className="col-span-4">商品</div>
                    <div className="col-span-2 text-right text-orange-400">進貨單價</div>
                    <div className="col-span-2 text-right text-blue-500">售出單價</div>
                    <div className="col-span-2 text-center">數量</div>
                    <div className="col-span-2 text-right">小計利潤</div>
                  </div>

                  {record.items.map((item: any, idx: number) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                      <input type="text" value={item.name} onChange={(e) => updateItemDetail(record.id, idx, 'name', e.target.value)} className="col-span-4 bg-white p-2 rounded-xl text-sm font-bold outline-none" />
                      <input type="number" value={item.price || ''} onChange={(e) => updateItemDetail(record.id, idx, 'price', e.target.value)} className="col-span-2 bg-white p-2 rounded-xl text-sm font-black text-right outline-none text-orange-600" />
                      <input type="number" value={item.sellingPrice || ''} onChange={(e) => updateItemDetail(record.id, idx, 'sellingPrice', e.target.value)} className="col-span-2 bg-white p-2 rounded-xl text-sm font-black text-right outline-none text-blue-600" />
                      <input type="number" value={item.qty} onChange={(e) => updateItemDetail(record.id, idx, 'qty', e.target.value)} className="col-span-2 bg-white p-2 rounded-xl text-sm font-black text-center outline-none" />
                      <div className="col-span-2 text-right text-xs font-black text-slate-400">
                        ${(Number(item.sellingPrice) - Number(item.price)) * Number(item.qty)}
                      </div>
                    </div>
                  ))}

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                    <p className="w-full text-[10px] font-bold text-slate-400 mb-1">快速加入常用商品：</p>
                    {products.map(p => (
                      <button key={p.id} onClick={() => quickAddItem(record.id, p)} className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-2 rounded-xl hover:bg-blue-100 transition-colors">
                        + {p.name}
                      </button>
                    ))}
                    <button onClick={() => setHistory(history.map(h => h.id === record.id ? {...h, items: [...h.items, { name: '新商品', price: 0, sellingPrice: 0, qty: 1 }]} : h))} className="bg-slate-200 text-slate-600 text-xs font-bold px-3 py-2 rounded-xl">
                      + 手動新增
                    </button>
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