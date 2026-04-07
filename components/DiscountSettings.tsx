import { DiscountTier } from '../types';

interface Props {
  discountRate: number;
  setDiscountRate: (v: number) => void;
  discountTiers: DiscountTier[];
  setDiscountTiers: (v: DiscountTier[]) => void;
  couponReward: number;
  setCouponReward: (v: number) => void;
}

export default function DiscountSettings({
  discountRate, setDiscountRate, discountTiers, setDiscountTiers, couponReward, setCouponReward
}: Props) {
  
  const addTier = () => {
    setDiscountTiers([...discountTiers, { threshold: 0, cashOff: 0 }]);
  };

  const updateTier = (index: number, field: keyof DiscountTier, value: number) => {
    const newTiers = [...discountTiers];
    newTiers[index][field] = value;
    setDiscountTiers(newTiers);
  };

  const removeTier = (index: number) => {
    setDiscountTiers(discountTiers.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-blue-600 p-5 rounded-2xl shadow-lg text-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold">🧧 優惠活動設定</h2>
        <button onClick={addTier} className="text-xs bg-blue-400 hover:bg-blue-500 px-2 py-1 rounded-lg font-bold transition-colors">
          + 新增級距
        </button>
      </div>

      <div className="space-y-4">
        {/* 全館折扣 */}
        <div className="flex items-center justify-between">
          <span className="text-sm">全館折扣</span>
          <select 
            value={discountRate} 
            onChange={e => setDiscountRate(Number(e.target.value))}
            className="w-28 bg-white text-blue-600 p-2 rounded-xl font-bold text-center outline-none shadow-md"
          >
            <option value="100">無折扣</option>
            <option value="88">88 折</option>
            <option value="85">85 折</option>
          </select>
        </div>

        <hr className="border-blue-400 opacity-30" />

        {/* 滿額現折列表 */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-blue-200 uppercase">滿額現折 (可多筆)</p>
          {discountTiers.map((tier, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-blue-700/30 p-2 rounded-xl">
              <span className="text-xs shrink-0">滿</span>
              <input 
                type="number" 
                value={tier.threshold || ''} 
                onChange={e => updateTier(idx, 'threshold', Number(e.target.value))}
                className="w-full min-w-[60px] bg-white text-blue-600 p-1.5 rounded-lg font-bold text-center text-sm outline-none"
                placeholder="1500"
              />
              <span className="text-xs shrink-0">扣</span>
              <input 
                type="number" 
                value={tier.cashOff || ''} 
                onChange={e => updateTier(idx, 'cashOff', Number(e.target.value))}
                className="w-full min-w-[60px] bg-white text-blue-600 p-1.5 rounded-lg font-bold text-center text-sm outline-none"
                placeholder="100"
              />
              <button onClick={() => removeTier(idx)} className="text-blue-200 hover:text-white px-1">✕</button>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-sm">滿額再送卷 ($)</span>
          <input 
            type="number" 
            value={couponReward || ''} 
            onChange={e => setCouponReward(Number(e.target.value))} 
            className="w-20 bg-white text-blue-600 p-2 rounded-xl font-bold text-center text-sm outline-none"
          />
        </div>
      </div>
    </div>
  );
}