'use client';

import { useState, useEffect } from 'react';

type Item = {
  id: string;
  name: string;
  price: number;
  maxQty: number;
};

type ResultCombo = {
  items: { name: string; price: number; qty: number }[];
  subtotal: number; // 原始總額
  finalPay: number; // 優惠後實付
  bonusNote: string; // 贈品/點數備註
};

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [target, setTarget] = useState<number>(1500); // 目標金額
  const [tolerance, setTolerance] = useState<number>(200); // 誤差
  
  // 優惠設定
  const [discountRate, setDiscountRate] = useState<number>(100); // 折扣 (例如 85 代表 85 折)
  const [threshold, setThreshold] = useState<number>(1500); // 滿額門檻
  const [cashOff, setCashOff] = useState<number>(100); // 現折金額
  const [couponReward, setCouponReward] = useState<number>(0); // 贈送卷

  const [items, setItems] = useState<Item[]>([
    { id: 'default', name: '', price: 0, maxQty: 1 }
  ]);

  const [bestMatch, setBestMatch] = useState<ResultCombo | null>(null);
  const [validMatches, setValidMatches] = useState<ResultCombo[]>([]);
  const [hasCalculated, setHasCalculated] = useState(false);

  // 初始化與存檔 (LocalStorage)
  useEffect(() => {
    const saved = localStorage.getItem('calc-pro-v3');
    if (saved) {
      const data = JSON.parse(saved);
      setItems(data.items);
      setTarget(data.target);
      setTolerance(data.tolerance);
      setDiscountRate(data.discountRate || 100);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('calc-pro-v3', JSON.stringify({ items, target, tolerance, discountRate }));
    }
  }, [items, target, tolerance, discountRate, isLoaded]);

  // 輔助函式：計算單一組合的優惠後價格
  const applyDiscounts = (subtotal: number): { finalPay: number; bonus: string } => {
    let price = subtotal;
    let bonus = "";

    // 1. 先算打折 (例如 88 折)
    price = price * (discountRate / 100);

    // 2. 判斷是否滿足滿額現折
    if (subtotal >= threshold) {
      price = price - cashOff;
      if (couponReward > 0) bonus = `回饋 $${couponReward} 卷`;
    }

    return { finalPay: Math.max(0, Math.round(price)), bonus };
  };

  const calculateCombinations = () => {
    const validItems = items.filter(item => item.name.trim() !== '' && item.price > 0);
    if (validItems.length === 0) return alert('請輸入有效品項！');

    let allValid: ResultCombo[] = [];
    const maxLimit = target + tolerance;

    const backtrack = (index: number, currentSum: number, selected: { [key: string]: number }) => {
      // 搜尋條件：以「原始總價」是否達標為準
      if (currentSum >= target && currentSum <= maxLimit) {
        const { finalPay, bonus } = applyDiscounts(currentSum);
        allValid.push({
          items: validItems.filter(i => selected[i.id] > 0).map(i => ({ name: i.name, price: i.price, qty: selected[i.id] })),
          subtotal: currentSum,
          finalPay,
          bonusNote: bonus
        });
      }

      if (index >= validItems.length || currentSum > maxLimit) return;

      const item = validItems[index];
      for (let q = 0; q <= item.maxQty; q++) {
        const nextSum = currentSum + item.price * q;
        if (nextSum > maxLimit) break;
        selected[item.id] = q;
        backtrack(index + 1, nextSum, selected);
        selected[item.id] = 0;
      }
    };

    backtrack(0, 0, {});
    allValid.sort((a, b) => (a.subtotal - target) - (b.subtotal - target)); // 依最接近目標排序

    setBestMatch(allValid.length > 0 ? allValid[0] : null);
    setValidMatches(allValid);
    setHasCalculated(true);
  };

  if (!isLoaded) return <div className="text-center p-10">載入中...</div>;

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-900">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-black text-center text-blue-600 mb-8">購物湊單神隊友 🛒</h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* 左側：目標與優惠設定 */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="font-bold mb-4 flex items-center gap-2">🎯 目標設定</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500">湊單目標 (下限)</label>
                  <input type="number" value={target} onChange={e => setTarget(Number(e.target.value))} className="w-full border-2 border-slate-100 p-2 rounded-xl focus:border-blue-400 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500">容許加購範圍 (+)</label>
                  <input type="number" value={tolerance} onChange={e => setTolerance(Number(e.target.value))} className="w-full border-2 border-slate-100 p-2 rounded-xl focus:border-blue-400 outline-none" />
                </div>
              </div>
            </div>

            <div className="bg-blue-600 p-5 rounded-2xl shadow-lg text-white">
              <h2 className="font-bold mb-4">🧧 優惠活動設定</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">全館折扣 (如: 85折填85)</span>
                  <input type="number" value={discountRate} onChange={e => setDiscountRate(Number(e.target.value))} className="w-20 text-blue-600 p-1 rounded font-bold text-center" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">滿額門檻 (現折用)</span>
                  <input type="number" value={threshold} onChange={e => setThreshold(Number(e.target.value))} className="w-20 text-blue-600 p-1 rounded font-bold text-center" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">現折金額 (-$)</span>
                  <input type="number" value={cashOff} onChange={e => setCashOff(Number(e.target.value))} className="w-20 text-blue-600 p-1 rounded font-bold text-center" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">滿額再送 (折價卷$)</span>
                  <input type="number" value={couponReward} onChange={e => setCouponReward(Number(e.target.value))} className="w-20 text-blue-600 p-1 rounded font-bold text-center" />
                </div>
              </div>
            </div>
          </div>

          {/* 右側：品項清單 */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold">📦 商品清單</h2>
              <button onClick={() => setItems([...items, { id: Date.now().toString(), name: '', price: 0, maxQty: 1 }])} className="text-blue-600 font-bold text-sm">+ 新增</button>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {items.map((item, idx) => (
                <div key={item.id} className="flex gap-2 items-center bg-slate-50 p-2 rounded-xl">
                  <input type="text" placeholder="品名" value={item.name} onChange={e => setItems(items.map(i => i.id === item.id ? {...i, name: e.target.value} : i))} className="flex-1 bg-transparent text-sm outline-none" />
                  <input type="number" placeholder="單價" value={item.price || ''} onChange={e => setItems(items.map(i => i.id === item.id ? {...i, price: Number(e.target.value)} : i))} className="w-16 bg-transparent text-sm font-bold text-right outline-none" />
                  <span className="text-slate-300">x</span>
                  <input type="number" value={item.maxQty} onChange={e => setItems(items.map(i => i.id === item.id ? {...i, maxQty: Number(e.target.value)} : i))} className="w-10 bg-transparent text-sm text-center outline-none" />
                  <button onClick={() => setItems(items.filter(i => i.id !== item.id))} className="text-red-300 hover:text-red-500">✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button onClick={calculateCombinations} className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
          RUN 計算最佳湊單方案
        </button>

        {/* 結果顯示區 */}
        {hasCalculated && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {bestMatch ? (
              <div className="space-y-6">
                <div className="bg-white border-4 border-blue-500 p-6 rounded-3xl shadow-xl">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">Best Choice</span>
                      <h2 className="text-4xl font-black mt-2">實付 ${bestMatch.finalPay}</h2>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 text-sm font-bold">原始總額: ${bestMatch.subtotal}</p>
                      {bestMatch.bonusNote && <p className="text-orange-500 font-bold text-sm">✨ {bestMatch.bonusNote}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {bestMatch.items.map((i, idx) => (
                      <div key={idx} className="bg-slate-50 p-3 rounded-xl flex justify-between items-center">
                        <span className="font-bold text-sm">{i.name}</span>
                        <span className="bg-slate-200 px-2 py-1 rounded text-xs font-bold">x{i.qty}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {validMatches.length > 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {validMatches.slice(1, 5).map((m, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 opacity-80 hover:opacity-100 transition-opacity">
                        <div className="flex justify-between font-bold mb-2">
                          <span>實付 ${m.finalPay}</span>
                          <span className="text-slate-400 text-xs">原始: ${m.subtotal}</span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">{m.items.map(i => `${i.name}x${i.qty}`).join(', ')}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-red-100 text-red-600 p-8 rounded-3xl text-center font-bold">找不到符合條件的組合 😢</div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}