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
  const [isExpanded, setIsExpanded] = useState(false); // 控制摺疊
  const recordRevenue = record.items.reduce((sum, item) => sum + (Number(item.sellingPrice || 0) * Number(item.qty)), 0);
  const recordProfit = recordRevenue - record.totalAmount;

  const handleUpdateItems = (newItems: PurchaseItem[]) => {
    const newTotalCost = newItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.qty)), 0);
    onUpdate({ ...record, items: newItems, totalAmount: newTotalCost });
  };

  return (
    <div className={`bg-white rounded-[32px] border-2 transition-all shadow-md overflow-hidden ${record.isReconciled ? 'border-green-100 bg-green-50/10 opacity-80' : 'border-slate-50'}`}>
      {/* 點擊標題可以展開/收合 */}
      <div onClick={() => setIsExpanded(!isExpanded)} className="p-6 cursor-pointer hover:bg-slate-50 flex justify-between items-center">
        <div className="flex gap-6 items-center">
          <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">{record.date}</span>
          <h3 className="text-xl font-black text-slate-800">成本 ${record.totalAmount} / 獲利 <span className="text-green-500">+${recordProfit}</span></h3>
          <span className="text-xs font-bold text-slate-400">👤 {record.purchaser || '未填'}</span>
        </div>
        <span className="text-blue-600 font-black">{isExpanded ? '▲' : '▼'}</span>
      </div>

      {isExpanded && (
        <div className="p-8 pt-0 space-y-4 border-t border-slate-50">
          {/* 這裡放入選單 (購買人、地點) 和 商品列表 (跟先前給你的程式碼一樣) */}
          <button onClick={() => onDelete(record.id)} className="text-red-400 text-xs font-bold">刪除紀錄 ✕</button>
        </div>
      )}
    </div>
  );
}