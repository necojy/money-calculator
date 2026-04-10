// --- components/RecordStats.tsx ---
interface Props {
  totalCost: number;
  totalRevenue: number;
  totalProfit: number;
  selectedMonth: string; // 新增：傳入目前選取的月份
}

export default function RecordStats({ totalCost, totalRevenue, totalProfit, selectedMonth }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-slate-900 p-6 rounded-[32px] text-white shadow-xl">
        <p className="text-[10px] font-bold opacity-50 uppercase mb-1">未對帳成本</p>
        <h2 className="text-3xl font-black">${totalCost}</h2>
      </div>
      <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">未對帳預期營收</p>
        <h2 className="text-3xl font-black text-blue-600">${totalRevenue}</h2>
      </div>
      {/* 綠色看板現在會根據選擇的月份顯示利潤 */}
      <div className="bg-green-500 p-6 rounded-[32px] text-white shadow-lg">
        <p className="text-[10px] font-bold opacity-80 uppercase mb-1">
          {selectedMonth ? `${selectedMonth} 累計獲利` : '所有時間累計獲利'}
        </p>
        <h2 className="text-3xl font-black">${totalProfit}</h2>
      </div>
    </div>
  );
}