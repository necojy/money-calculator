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
  const [isExpanded, setIsExpanded] = useState(false);

  const recordRevenue = record.items.reduce((sum, item) => sum + (Number(item.sellingPrice || 0) * Number(item.qty)), 0);
  const recordProfit = recordRevenue - (record.total_amount || 0);

  const handleUpdateItems = (newItems: PurchaseItem[]) => {
    const newTotalCost = newItems.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.qty)), 0);
    onUpdate({ ...record, items: newItems, total_amount: newTotalCost });
  };

  // 修正：將 value 的型別從 any 改為具體型別
  const updateDetail = (idx: number, field: keyof PurchaseItem, value: string | number) => {
    const newItems = record.items.map((item, i) => i === idx ? { ...item, [field]: value } : item);
    handleUpdateItems(newItems);
  };

  return (
    <div className={`bg-white rounded-[32px] border-2 transition-all shadow-md overflow-hidden ${record.is_reconciled ? 'border-green-100 opacity-80' : 'border-slate-50'}`}>
      <div onClick={() => setIsExpanded(!isExpanded)} className="p-6 cursor-pointer hover:bg-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{record.date}</span>
          <div className="flex gap-4">
            <h3 className="text-xl font-black text-slate-800">成本: ${record.total_amount}</h3>
            <h3 className="text-xl font-black text-green-500">獲利: +${recordProfit}</h3>
          </div>
        </div>
        <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
          <span className="text-[10px] font-bold text-slate-500">對帳</span>
          <input 
            type="checkbox" 
            checked={record.is_reconciled} 
            onChange={() => onUpdate({ ...record, is_reconciled: !record.is_reconciled })} 
            className="w-5 h-5 accent-green-600" 
          />
        </div>
      </div>

      {isExpanded && (
        <div className="p-8 pt-2 border-t border-slate-50 space-y-4">
          {record.items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-3 rounded-2xl">
              <span className="col-span-4 font-bold">{item.name}</span>
              <input 
                type="number" 
                value={item.price} 
                onChange={(e) => updateDetail(idx, 'price', Number(e.target.value))} 
                className="col-span-3 bg-white p-2 rounded-lg text-right"
              />
              <span className="col-span-3 text-right text-blue-500">${item.sellingPrice}</span>
              <button onClick={() => handleUpdateItems(record.items.filter((_, i) => i !== idx))} className="col-span-2 text-red-400">✕</button>
            </div>
          ))}
          <div className="flex justify-end pt-4">
             <button onClick={() => onDelete(record.id)} className="text-red-500 font-bold">刪除整筆紀錄 ✕</button>
          </div>
        </div>
      )}
    </div>
  );
}