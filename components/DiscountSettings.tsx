interface Props {
  discountRate: number;
  setDiscountRate: (v: number) => void;
  threshold: number;
  setThreshold: (v: number) => void;
  cashOff: number;
  setCashOff: (v: number) => void;
  couponReward: number;
  setCouponReward: (v: number) => void;
}

export default function DiscountSettings({
  discountRate, setDiscountRate, threshold, setThreshold, cashOff, setCashOff, couponReward, setCouponReward
}: Props) {
  return (
    <div className="bg-blue-600 p-5 rounded-2xl shadow-lg text-white">
      <h2 className="font-bold mb-4">🧧 優惠活動設定</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">全館折扣</span>
          <select 
            value={discountRate} 
            onChange={e => setDiscountRate(Number(e.target.value))}
            className="w-28 bg-white text-blue-600 p-2 rounded-xl font-bold text-center outline-none"
          >
            <option value="100">無折扣</option>
            <option value="88">88 折</option>
            <option value="85">85 折</option>
            <option value="90">90 折</option>
          </select>
        </div>
        <hr className="border-blue-400 opacity-30" />
        <div className="space-y-3">
          <p className="text-xs font-bold text-blue-200">滿額現折自定義</p>
          <div className="flex items-center gap-2">
            <span>滿</span>
            <input type="number" value={threshold} onChange={e => setThreshold(Number(e.target.value))} className="flex-1 bg-white text-blue-600 p-2 rounded-xl font-bold text-center outline-none" />
            <span>扣</span>
            <input type="number" value={cashOff} onChange={e => setCashOff(Number(e.target.value))} className="flex-1 bg-white text-blue-600 p-2 rounded-xl font-bold text-center outline-none" />
          </div>
        </div>
      </div>
    </div>
  );
}