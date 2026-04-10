'use client';

import { useState, useEffect } from 'react';
import { Product, PurchaseRecord, PurchaseItem } from '@/types';

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

  // --- 產品主表功能 ---
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

  // --- 購買紀錄核心功能 ---

  // 1. 新增一筆空白紀錄
  const addRecord = () => {
    const newRecord: PurchaseRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      items: [{ productId: '', name: '新商品', price: 0, qty: 1 }], // 預設給一行輸入
      totalAmount: 0,
      isReconciled: false
    };
    setHistory([newRecord, ...history]);
  };

  // 2. 更新紀錄的日期
  const updateRecordDate = (id: string, newDate: string) => {
    setHistory(history.map(h => h.id === id ? { ...h, date: newDate } : h));
  };

  // 3. 在特定紀錄中新增一個品項細項
  const addItemToRecord = (recordId: string) => {
    setHistory(history.map(h => {
      if (h.id === recordId) {
        return { ...h, items: [...h.items, { productId: '', name: '', price: 0, qty: 1 }] };
      }
      return h;
    }));
  };

  // 4. 更新特定紀錄中的品項內容（名稱、價格、數量）
  const updateItemDetail = (recordId: string, itemIdx: number, field: keyof PurchaseItem, value: any) => {
    const newHistory = history.map(record => {
      if (record.id === recordId) {
        const newItems = record.items.map((item, i) => 
          i === itemIdx ? { ...item, [field]: value } : item
        );
        // 自動重新計算總金額
        const newTotal = newItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.qty)), 0);
        return { ...record, items: newItems, totalAmount: newTotal };
      }
      return record;
    });
    setHistory(newHistory);
  };

  // 5. 刪除紀錄
  const deleteRecord = (id: string) => {
    if (confirm("確定要刪除這筆購買紀錄嗎？")) {
      setHistory(history.filter(h => h.id !== id));
    }
  };

  const toggleReconcile = (id: string) => {
    setHistory(history.map(h => h.id === id ? { ...h, isReconciled: !h.isReconciled } : h));
  };

  // 總累計支出
  const totalExpense = history.reduce((acc, curr) => acc + curr.totalAmount, 0);

  if (!isLoaded) return <div className="p-10 text-center text-slate-500 font-bold">載入中...</div>;

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-900">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* 統計看板 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-600 p-6 rounded-[32px] text-white shadow-lg">
            <p className="text-xs font-bold opacity-70 mb-1">總累計支出</p>
            <h2 className="text-3xl font-black">${totalExpense}</h2>
          </div>
          <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 mb-1">未對帳金額</p>
            <h2 className="text-3xl font-black text-orange-500">
              ${history.filter(h => !h.isReconciled).reduce((acc, curr) => acc + curr.totalAmount, 0)}
            </h2>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4">
          <h1 className="text-3xl font-black text-slate-800">購買紀錄管理 📑</h1>
          <button onClick={addRecord} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all">
            + 新增本次購買
          </button>
        </div>

        {/* 紀錄列表 */}
        <section className="space-y-6">
          {history.map(record => (
            <div key={record.id} className={`relative bg-white p-6 rounded-[40px] border-2 transition-all ${record.isReconciled ? 'border-green-200 bg-green-50/10' : 'border-slate-100 shadow-xl'}`}>
              
              {/* 頂部控制列 */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex flex-col gap-1">
                  <input 
                    type="date" 
                    value={record.date} 
                    onChange={(e) => updateRecordDate(record.id, e.target.value)}
                    className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full outline-none"
                  />
                  <h3 className="text-3xl font-black text-slate-800 mt-1">
                    總計 <span className="text-blue-600">${record.totalAmount}</span>
                  </h3>
                </div>
                
                <div className="flex items-center gap-6 bg-slate-50 px-4 py-2 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">已對帳</span>
                    <input 
                      type="checkbox" 
                      checked={record.isReconciled} 
                      onChange={() => toggleReconcile(record.id)}
                      className="w-6 h-6 rounded-lg accent-green-600 cursor-pointer"
                    />
                  </div>
                  <button onClick={() => deleteRecord(record.id)} className="text-red-400 hover:text-red-600 font-bold text-xs">刪除紀錄 ✕</button>
                </div>
              </div>
              
              {/* 品項編輯區 */}
              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-2 px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <div className="col-span-6">品項名稱</div>
                  <div className="col-span-3 text-right">單價</div>
                  <div className="col-span-2 text-center">數量</div>
                  <div className="col-span-1"></div>
                </div>
                
                {record.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50/50 p-2 rounded-2xl border border-slate-100">
                    <input 
                      type="text" 
                      placeholder="商品名稱" 
                      value={item.name} 
                      onChange={(e) => updateItemDetail(record.id, idx, 'name', e.target.value)}
                      className="col-span-6 bg-white border border-slate-200 p-2 rounded-xl text-sm font-bold outline-none focus:border-blue-400"
                    />
                    <input 
                      type="number" 
                      placeholder="0" 
                      value={item.price || ''} 
                      onChange={(e) => updateItemDetail(record.id, idx, 'price', e.target.value)}
                      className="col-span-3 bg-white border border-slate-200 p-2 rounded-xl text-sm font-black text-right outline-none text-blue-600"
                    />
                    <input 
                      type="number" 
                      value={item.qty} 
                      onChange={(e) => updateItemDetail(record.id, idx, 'qty', e.target.value)}
                      className="col-span-2 bg-white border border-slate-200 p-2 rounded-xl text-sm font-black text-center outline-none"
                    />
                    <button 
                      onClick={() => {
                        const newItems = record.items.filter((_, i) => i !== idx);
                        const newTotal = newItems.reduce((sum, it) => sum + (it.price * it.qty), 0);
                        setHistory(history.map(h => h.id === record.id ? { ...h, items: newItems, totalAmount: newTotal } : h));
                      }}
                      className="col-span-1 text-slate-300 hover:text-red-500 font-bold"
                    >✕</button>
                  </div>
                ))}
                
                <button 
                  onClick={() => addItemToRecord(record.id)}
                  className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-bold hover:bg-slate-50 hover:border-blue-300 hover:text-blue-500 transition-all"
                >
                  + 新增品項細項
                </button>
              </div>
            </div>
          ))}
          
          {history.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[40px] border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-bold">目前沒有任何紀錄，點擊上方按鈕開始記帳吧！</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}