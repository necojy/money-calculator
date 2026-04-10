// --- components/PurchaseCard.tsx ---
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

  const updateItems = (newItems: PurchaseItem[]) => {
    const newTotalCost = newItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.qty)), 0);
    onUpdate({ ...record, items: newItems, totalAmount: newTotalCost });
  };

  return (
    <div className={`bg-white p-8 rounded-[40px] border-2 transition-all shadow-xl ${record.isReconciled ? 'border-green-100 bg-green-50/10 opacity-80' : 'border-slate-50'}`}>
      {/* 這裡放入原本卡片內部的編輯 UI (日期、對帳開關、刪除按鈕、品項列表、快速加入按鈕等) */}
      {/* 基於篇幅，邏輯同你之前的代碼，但改為呼叫 updateItems */}
    </div>
  );
}