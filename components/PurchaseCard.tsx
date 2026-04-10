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

  const handleUpdateItems = (newItems: PurchaseItem[]) => {
    const newTotalCost = newItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.qty)), 0);
    onUpdate({ ...record, items: newItems, totalAmount: newTotalCost });
  };

  return (
    <div className={`bg-white p-8 rounded-[40px] border-2 transition-all shadow-xl ${record.isReconciled ? 'border-green-100 bg-green-50/10' : 'border-slate-100'}`}>
      
      {/* 1. 頂部資訊與控制列 */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
        <div className="space-y-2">
          <input 
            type="date" 
            value={record.date} 
            onChange={(e) => onUpdate({ ...record, date: e.target.value })} 
            className="bg-slate-100 text-xs font-black p-2 rounded-xl outline-none text-black" 
          />
          <div className="flex items-end gap-6">
            <div><p className="text-[10px] font-bold text-slate-400 uppercase">本筆成本</p><h3 className="text-4xl font-black text-slate-800">${record.totalAmount}</h3></div>
            <div className="pb-1"><p className="text-[10px] font-bold text-green-500 uppercase">本筆獲利</p><h3 className="text-2xl font-black text-green-500 tracking-tighter">+${recordProfit}</h3></div>
          </div>
        </div>
        
        <div className="flex items-center gap-6 bg-slate-50 p-4 rounded-3xl">
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs font-bold text-slate-500">對帳完成</span>
            <input type="checkbox" checked={record.isReconciled} onChange={() => onUpdate({ ...record, isReconciled: !record.isReconciled })} className="w-6 h-6 accent-green-600" />
          </label>
          <button onClick={() => { if(confirm("確定刪除？")) onDelete(record.id); }} className="text-red-400 font-bold text-xs">刪除 ✕</button>
        </div>
      </div>

      {/* 2. 新增：購買與配送資訊 (4個欄位) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 bg-slate-50 p-5 rounded-[24px]">
        <div>
          <label className="text-[10px] font-bold text-slate-400 block mb-1">購買人</label>
          <input type="text" value={record.purchaser || ''} onChange={(e) => onUpdate({ ...record, purchaser: e.target.value })} placeholder="姓名" className="w-full bg-white p-2 rounded-xl text-xs font-bold outline-none border border-slate-100 focus:border-blue-400 text-black" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 block mb-1">購買地方</label>
          <input type="text" value={record.purchaseLocation || ''} onChange={(e) => onUpdate({ ...record, purchaseLocation: e.target.value })} placeholder="例如：屈臣氏" className="w-full bg-white p-2 rounded-xl text-xs font-bold outline-none border border-slate-100 focus:border-blue-400 text-black" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 block mb-1">付款方式</label>
          <select value={record.paymentMethod || '信用卡'} onChange={(e) => onUpdate({ ...record, paymentMethod: e.target.value })} className="w-full bg-white p-2 rounded-xl text-xs font-bold outline-none border border-slate-100 focus:border-blue-400 text-black">
            <option value="信用卡">信用卡</option>
            <option value="貨到付款">貨到付款</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 block mb-1">取貨地點</label>
          <input type="text" value={record.pickupLocation || ''} onChange={(e) => onUpdate({ ...record, pickupLocation: e.target.value })} placeholder="例如：7-11草屯店" className="w-full bg-white p-2 rounded-xl text-xs font-bold outline-none border border-slate-100 focus:border-blue-400 text-black" />
        </div>
      </div>

      {/* 3. 品項編輯區 (原本的代碼) */}
      <div className="space-y-4">
        {/* ... 保留原本的 grid 表頭與 record.items.map ... */}
        {record.items.map((item, idx) => (
          <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
            <input type="text" value={item.name} onChange={(e) => {
              const newItems = record.items.map((it, i) => i === idx ? { ...it, name: e.target.value } : it);
              handleUpdateItems(newItems);
            }} className="col-span-4 bg-white p-2 rounded-xl text-sm font-bold outline-none text-black" />
            <input type="number" value={item.price || ''} onChange={(e) => {
              const newItems = record.items.map((it, i) => i === idx ? { ...it, price: Number(e.target.value) } : it);
              handleUpdateItems(newItems);
            }} className="col-span-2 bg-white p-2 rounded-xl text-sm font-black text-right text-orange-600 outline-none" />
            <input type="number" value={item.sellingPrice || ''} onChange={(e) => {
              const newItems = record.items.map((it, i) => i === idx ? { ...it, sellingPrice: Number(e.target.value) } : it);
              handleUpdateItems(newItems);
            }} className="col-span-2 bg-white p-2 rounded-xl text-sm font-black text-right text-blue-600 outline-none" />
            <input type="number" value={item.qty} onChange={(e) => {
              const newItems = record.items.map((it, i) => i === idx ? { ...it, qty: Number(e.target.value) } : it);
              handleUpdateItems(newItems);
            }} className="col-span-2 bg-white p-2 rounded-xl text-sm font-black text-center text-black outline-none" />
            <div className="col-span-1 text-right text-xs font-black text-slate-400">${(Number(item.sellingPrice) - Number(item.price)) * Number(item.qty)}</div>
            <button onClick={() => handleUpdateItems(record.items.filter((_, i) => i !== idx))} className="col-span-1 text-red-300 hover:text-red-600 font-bold text-center">✕</button>
          </div>
        ))}
        {/* ... 下方的快速加入按鈕 ... */}
      </div>
    </div>
  );
}