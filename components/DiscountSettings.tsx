import { DiscountTier } from '../types';

interface Props {
  discountRate: number;
  setDiscountRate: (v: number) => void;
  discountThreshold: number; // 已定義
  setDiscountThreshold: (v: number) => void; // 已定義
  discountTiers: DiscountTier[];
  setDiscountTiers: (v: DiscountTier[]) => void;
  couponReward: number;
  setCouponReward: (v: number) => void;
}

// 修正點：要在這裡解構 discountThreshold 和 setDiscountThreshold
export default function DiscountSettings({
  discountRate, setDiscountRate, 
  discountThreshold, setDiscountThreshold, 
  discountTiers, setDiscountTiers, 
  couponReward, setCouponReward
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
        <h2 className="font-bold text-lg">🧧 優惠活動設定</h2>
        <button 
          onClick={addTier} 
          className="text-xs bg-blue-500 hover:bg-blue-400 px-3 py-1.5 rounded-xl font-bold transition-all shadow-sm active:scale-95"
        >
          + 新增滿額級距
        </button>
      </div>

      <div className="space-y-4">
        {/* 1. 全館折扣區塊 (新增了門檻輸入) */}
        <div className="bg-blue-700/30 p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-bold">全館打折條件</span>
              <span className="text-[10px] text-blue-200">未達門檻則不執行折扣</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs">滿</span>
              <input 
                type="number" 
                value={discountThreshold || ''} 
                onChange={e => setDiscountThreshold(Number(e.target.value))}
                className="w-20 bg-white text-blue-600 p-2 rounded-xl font-black text-center outline-none"
                placeholder="0"
              />
              <span className="text-xs">元</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between border-t border-blue-500/30 pt-3">
            <span className="text-sm font-bold">打折額度</span>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                value={discountRate || ''} 
                onChange={e => setDiscountRate(Number(e.target.value))}
                className="w-20 bg-white text-blue-600 p-2 rounded-xl font-black text-center outline-none"
                placeholder="100"
              />
              <span className="font-bold text-sm">折</span>
            </div>
          </div>
        </div>

        <hr className="border-blue-400 opacity-20" />

        {/* 2. 滿額現折列表 */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-blue-200 uppercase tracking-wider">滿額現折自定義 (打折後才判斷)</p>
          {discountTiers.map((tier, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-blue-700/30 p-2 rounded-xl">
              <span className="text-xs font-bold shrink-0 ml-1">滿</span>
              <input 
                type="number" 
                value={tier.threshold || ''} 
                onChange={e => updateTier(idx, 'threshold', Number(e.target.value))}
                className="w-full bg-white text-blue-600 p-2 rounded-lg font-bold text-center text-sm outline-none shadow-inner"
                placeholder="金額"
              />
              <span className="text-xs font-bold shrink-0">扣</span>
              <input 
                type="number" 
                value={tier.cashOff || ''} 
                onChange={e => updateTier(idx, 'cashOff', Number(e.target.value))}
                className="w-full bg-white text-blue-600 p-2 rounded-lg font-bold text-center text-sm outline-none shadow-inner"
                placeholder="現折"
              />
              <button 
                onClick={() => removeTier(idx)} 
                className="text-blue-200 hover:text-white p-1 transition-colors"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* 3. 滿額贈送 */}
        <div className="flex items-center justify-between pt-2 border-t border-blue-400/20">
          <span className="text-sm font-medium">滿額再送折價卷 ($)</span>
          <input 
            type="number" 
            value={couponReward || ''} 
            onChange={e => setCouponReward(Number(e.target.value))} 
            className="w-20 bg-white text-blue-600 p-2 rounded-xl font-black text-center text-sm outline-none shadow-inner"
            placeholder="0"
          />
        </div>
      </div>
    </div>
  );
}