'use client';

import { PurchaseRecord, Product, PurchaseItem } from '../types';

interface Props {
  record: PurchaseRecord;
  products: Product[];
  onUpdate: (updatedRecord: PurchaseRecord) => void;
  onDelete: (id: string) => void;
}

export default function PurchaseCard({ record, products, onUpdate, onDelete }: Props) {
  const recordRevenue = record.items.reduce((sum, item) => sum + (Number(item.sellingPrice || 0) * Number(item.qty)), 0);
  const recordProfit = recordRevenue - record.totalAmount;

  // 統一更新邏輯並重新計算成本
  const handleUpdateItems = (newItems: PurchaseItem[]) => {
    const newTotalCost = newItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.qty)), 0);
    onUpdate({ ...record, items: newItems, totalAmount: newTotalCost });
  };

  const updateDetail = (idx: number, field: keyof PurchaseItem, value: any) => {
    const newItems = record.items.map((item, i) => i === idx ? { ...item, [field]: value } : item);
    handleUpdateItems(newItems);
  };

  return (
    <div className={`bg-white p-8 rounded-[40px] border-2 transition-all shadow-xl ${record.isReconciled ? 'border-green-100 bg-green-50/10 opacity-80' : 'border-slate-50'}`}>
      
      {/* 頂部控制列 */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
        <div className="space-y-2">
          <input 
            type="date" 
            value={record.date} 
            onChange={(e) => onUpdate({ ...record, date: e.target.value })} 
            className="bg-slate-100 text-xs font-black p-2 rounded-xl outline-none text-black" 
          />
          <div className="flex items-end gap-6">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">本筆成本</p>
              <h3 className="text-4xl font-black text-slate-800">${record.totalAmount}</h3>
            </div>
            <div className="pb-1">
              <p className="text-[10px] font-bold text-green-500 uppercase">本筆獲利</p>
              <h3 className="text-2xl font-black text-green-500 tracking-tighter">+${recordProfit}</h3>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6 bg-slate-50 p-4 rounded-3xl">
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs font-bold text-slate-500">對帳完成</span>
            <input 
              type="checkbox" 
              checked={record.isReconciled} 
              onChange={() => onUpdate({ ...record, isReconciled: !record.isReconciled })} 
              className="w-6 h-6 accent-green-600" 
            />
          </label>
          <button onClick={() => { if(confirm("確定刪除這筆紀錄？")) onDelete(record.id); }} className="text-red-400 hover:text-red-600 font-bold text-xs">刪除 ✕</button>
        </div>
      </div>

      {/* 品項編輯清單 */}
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
            <input type="text" value={item.name} onChange={(e) => updateDetail(idx, 'name', e.target.value)} className="col-span-4 bg-white p-2 rounded-xl text-sm font-bold outline-none text-black" />
            <input type="number" value={item.price || ''} onChange={(e) => updateDetail(idx, 'price', Number(e.target.value))} className="col-span-2 bg-white p-2 rounded-xl text-sm font-black text-right outline-none text-orange-600" />
            <input type="number" value={item.sellingPrice || ''} onChange={(e) => updateDetail(idx, 'sellingPrice', Number(e.target.value))} className="col-span-2 bg-white p-2 rounded-xl text-sm font-black text-right outline-none text-blue-600" />
            <input type="number" value={item.qty} onChange={(e) => updateDetail(idx, 'qty', Number(e.target.value))} className="col-span-2 bg-white p-2 rounded-xl text-sm font-black text-center outline-none text-black" />
            <div className="col-span-1 text-right text-xs font-black text-slate-400">
              ${(Number(item.sellingPrice) - Number(item.price)) * Number(item.qty)}
            </div>
            <button onClick={() => handleUpdateItems(record.items.filter((_, i) => i !== idx))} className="col-span-1 text-red-300 hover:text-red-600 font-bold text-center">✕</button>
          </div>
        ))}

        <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
          <p className="w-full text-[10px] font-bold text-slate-400 uppercase mb-1">快速加入常用商品：</p>
          {products.map(p => (
            <button 
              key={p.id} 
              onClick={() => handleUpdateItems([...record.items, { name: p.name, price: 0, sellingPrice: p.defaultPrice, qty: 1 }])} 
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
    </div>
  );
}