{/* 找到這一段並替換 */}
<div className="bg-blue-600 p-5 rounded-2xl shadow-lg text-white">
  <h2 className="font-bold mb-4">🧧 優惠活動設定</h2>
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <span className="text-sm">全館折扣 (如: 85折填85)</span>
      <input 
        type="number" 
        value={discountRate} 
        onChange={e => setDiscountRate(Number(e.target.value))} 
        className="w-20 bg-white text-blue-600 p-1 rounded-lg font-bold text-center border-none outline-none shadow-inner" 
      />
    </div>
    <div className="flex items-center justify-between">
      <span className="text-sm">滿額門檻 (現折用)</span>
      <input 
        type="number" 
        value={threshold} 
        onChange={e => setThreshold(Number(e.target.value))} 
        className="w-20 bg-white text-blue-600 p-1 rounded-lg font-bold text-center border-none outline-none shadow-inner" 
      />
    </div>
    <div className="flex items-center justify-between">
      <span className="text-sm">現折金額 (-$)</span>
      <input 
        type="number" 
        value={cashOff} 
        onChange={e => setCashOff(Number(e.target.value))} 
        className="w-20 bg-white text-blue-600 p-1 rounded-lg font-bold text-center border-none outline-none shadow-inner" 
      />
    </div>
    <div className="flex items-center justify-between">
      <span className="text-sm">滿額再送 (折價卷$)</span>
      <input 
        type="number" 
        value={couponReward} 
        onChange={e => setCouponReward(Number(e.target.value))} 
        className="w-20 bg-white text-blue-600 p-1 rounded-lg font-bold text-center border-none outline-none shadow-inner" 
      />
    </div>
  </div>
</div>