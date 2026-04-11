'use client';

import { useState } from 'react';
import { PurchaseRecord, Product, PurchaseItem } from '../types';

interface Props {
  record: PurchaseRecord;
  products: Product[];
  onUpdate: (updatedRecord: PurchaseRecord) => void;
  onDelete: (id: string) => void;
}

export default function PurchaseCard({ record, products, onUpdate, onDelete }: Props) {
  // 1. 摺疊狀態
  const [isExpanded, setIsExpanded] = useState(false);

  // 2. 計算邏輯 (確保使用底線命名)
  const recordRevenue = record.items.reduce((sum, item) => sum + (Number(item.sellingPrice || 0) * Number(item.qty)), 0);
  const recordProfit = recordRevenue - (record.total_amount || 0);

  const handleUpdateItems = (newItems: PurchaseItem[]) => {
    const newTotalCost = newItems.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.qty)), 0);
    onUpdate({ ...record, items: newItems, total_amount: newTotalCost });
  };

const updateDetail = (idx: number, field: keyof PurchaseItem, value: string | number) => {
  // 將 value 的型別從 any 改為具體的類型
  const newItems = record.items.map((item, i) => i === idx ? { ...item, [field]: value } : item);
  handleUpdateItems(newItems);
};

  return (
    <div className={`bg-white rounded-[32px] border-2 transition-all shadow-md overflow-hidden ${record.is_reconciled ? 'border-green-100 opacity-80' : 'border-slate-50'}`}>
      
      {/* --- 摺疊標題列 --- */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-6 cursor-pointer hover:bg-slate-50 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 flex-1">
          <div className="bg-blue-50 px-3 py-1 rounded-full">
            <span className="text-[10px] font-black text-blue-600">{record.date}</span>
          </div>
          
          <div className="flex gap-6">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">成本</p>
              <h3 className="text-xl font-black text-slate-800">${record.total_amount}</h3>
            </div>
            <div>
              <p className="text-[10px] font-bold text-green-500 uppercase tracking-tighter">獲利</p>
              <h3 className="text-xl font-black text-green-500">+${recordProfit}</h3>
            </div>
          </div>

          <div className="flex gap-2">
            {record.purchaser && (
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg text-[10px] font-bold">👤 {record.purchaser}</span>
            )}
            {record.purchase_location && (
              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg text-[10px] font-bold">📍 {record.purchase_location}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 self-end md:self-center">
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-xl" onClick={(e) => e.stopPropagation()}>
            <span className="text-[10px] font-bold text-slate-500">對帳</span>
            <input 
              type="checkbox" 
              checked={record.is_reconciled} 
              onChange={() => onUpdate({ ...record, is_reconciled: !record.is_reconciled })} 
              className="w-5 h-5 accent-green-600 cursor-pointer" 
            />
          </div>
          <span className={`text-blue-600 font-black transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
            {isExpanded ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {/* --- 展開內容 --- */}
      {isExpanded && (
        <div className="p-8 pt-2 border-t border-slate-50 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-5 rounded-[24px]">
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">購買人</label>
              <select value={record.purchaser || ''} onChange={(e) => onUpdate({ ...record, purchaser: e.target.value })} className="w-full bg-white p-2 rounded-xl text-xs font-bold outline-none border border-slate-100 text-black">
                <option value="">請選擇</option>
                <option value="宥">宥</option><option value="洪">洪</option><option value="涵">涵</option><option value="崑">崑</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">購買地方</label>
              <select value={record.purchase_location || ''} onChange={(e) => onUpdate({ ...record, purchase_location: e.target.value })} className="w-full bg-white p-2 rounded-xl text-xs font-bold outline-none border border-slate-100 text-black">
                <option value="">請選擇</option>
                <option value="蝦皮">蝦皮</option><option value="屈臣氏">屈臣氏</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">付款方式</label>
              <select value={record.payment_method || '信用卡'} onChange={(e) => onUpdate({ ...record, payment_method: e.target.value })} className="w-full bg-white p-2 rounded-xl text-xs font-bold outline-none border border-slate-100 text-black">
                <option value="信用卡">信用卡</option><option value="貨到付款">貨到付款</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">取貨地點</label>
              <input type="text" value={record.pickup_location || ''} onChange={(e) => onUpdate({ ...record, pickup_location: e.target.value })} placeholder="地點" className="w-full bg-white p-2 rounded-xl text-xs font-bold outline-none border border-slate-100 text-black" />
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
                <input 
                  type="text" 
                  value={item.name} 
                  readOnly 
                  className="col-span-4 bg-slate-100 p-2 rounded-xl text-sm font-bold outline-none text-slate-500 cursor-not-allowed" 
                />                
                <input 
                  type="number" 
                  value={item.price || ''} 
                  onChange={(e) => updateDetail(idx, 'price', Number(e.target.value))} 
                  className="col-span-2 bg-white p-2 rounded-xl text-sm font-black text-right text-orange-600 outline-none" 
                />
                <input 
                  type="number" 
                  value={item.sellingPrice || ''} 
                  readOnly 
                  className="col-span-2 bg-slate-100 p-2 rounded-xl text-sm font-black text-right text-blue-400 outline-none cursor-not-allowed" 
                />
                <input type="number" value={item.qty} onChange={(e) => updateDetail(idx, 'qty', Number(e.target.value))} className="col-span-2 bg-white p-2 rounded-xl text-sm font-black text-center text-black outline-none" />
                <div className="col-span-1 text-right text-xs font-black text-slate-400">
                  ${(Number(item.sellingPrice) - Number(item.price)) * Number(item.qty)}
                </div>
                <button onClick={() => handleUpdateItems(record.items.filter((_, i) => i !== idx))} className="col-span-1 text-red-300 hover:text-red-600 font-bold text-center">✕</button>
              </div>
            ))}

            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
              {products.map(p => (
                <button 
                  key={p.id} 
                  // 注意：這裡使用 p.default_price 同步雲端商品屬性
                  onClick={() => handleUpdateItems([...record.items, { name: p.name, price: 0, sellingPrice: p.default_price || 0, qty: 1 }])} 
                  className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-2 rounded-xl hover:bg-blue-100 transition-colors"
                >
                  + {p.name}
                </button>
              ))}
              <button 
                onClick={() => handleUpdateItems([...record.items, { name: '新商品', price: 0, sellingPrice: 0, qty: 1 }])} 
                className="bg-slate-200 text-slate-600 text-xs font-bold px-3 py-2 rounded-xl"
              >
                + 手動新增
              </button>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              onClick={() => { if(confirm("確定刪除這整筆紀錄？")) onDelete(record.id); }} 
              className="text-red-400 hover:text-red-600 font-bold text-xs bg-red-50 px-4 py-2 rounded-xl transition-colors"
            >
              刪除整筆紀錄 ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}