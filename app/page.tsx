'use client';

import { useState, useEffect } from 'react';
// 注意：如果你的 VS Code 找不到 @/，請改回 '../types' 等路徑
import { Item, ResultCombo, DiscountTier } from '../types';
import { runCalculator } from '../utils/calculator';
import DiscountSettings from '../components/DiscountSettings';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // 1. 商品清單狀態
  const [items, setItems] = useState<Item[]>([{ id: 'default', name: '', price: 0, maxQty: 1 }]);
  
  // 2. 目標與誤差狀態
  const [target, setTarget] = useState(1500);
  const [tolerance, setTolerance] = useState(200);
  
  // 3. 優惠設定狀態
  const [discountRate, setDiscountRate] = useState(100);
  const [discountTiers, setDiscountTiers] = useState<DiscountTier[]>([
    { threshold: 1500, cashOff: 100 }
  ]);
  const [couponReward, setCouponReward] = useState(0);
  
  // 4. 計算結果狀態
  const [bestMatch, setBestMatch] = useState<ResultCombo | null>(null);
  const [hasCalculated, setHasCalculated] = useState(false);

  // 初始化與存檔 (LocalStorage)
  useEffect(() => {
    const saved = localStorage.getItem('calc-pro-v5');
    if (saved) {
      const data = JSON.parse(saved);
      setItems(data.items || []);
      setTarget(data.target || 1500);
      setTolerance(data.tolerance || 200);
      setDiscountTiers(data.discountTiers || [{ threshold: 1500, cashOff: 100 }]);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('calc-pro-v5', JSON.stringify({ items, target, tolerance, discountTiers }));
    }
  }, [items, target, tolerance, discountTiers, isLoaded]);

  // 執行計算
  const handleCalculate = () => {
    const results = runCalculator(
      items, 
      target, 
      tolerance, 
      discountRate, 
      discountTiers, 
      couponReward
    );
    setBestMatch(results.length > 0 ? results[0] : null);
    setHasCalculated(true);
  };

  if (!isLoaded) return <div className="text-center p-10">載入中...</div>;

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-900">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-black text-center text-blue-600 mb-8">購物湊單神隊友 🛒</h1>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {/* 🎯 目標設定 */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="font-bold mb-4 flex items-center gap-2 text-black">🎯 目標設定</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500">湊單目標</label>
                  <input type="number" value={target} onChange={e => setTarget(Number(e.target.value))} className="w-full border-2 border-slate-100 p-2 rounded-xl text-black outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500">容許加購 (+)</label>
                  <input type="number" value={tolerance} onChange={e => setTolerance(Number(e.target.value))} className="w-full border-2 border-slate-100 p-2 rounded-xl text-black outline-none focus:border-blue-400" />
                </div>
              </div>
            </div>

            {/* 🧧 優惠設定組件 */}
            <DiscountSettings 
              discountRate={discountRate} 
              setDiscountRate={setDiscountRate}
              discountTiers={discountTiers}
              setDiscountTiers={setDiscountTiers}
              couponReward={couponReward}
              setCouponReward={setCouponReward}
            />
          </div>

          {/* 📦 商品清單 */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-black">📦 商品清單</h2>
              <button onClick={() => setItems([...items, { id: Date.now().toString(), name: '', price: 0, maxQty: 1 }])} className="text-blue-600 font-bold text-sm">+ 新增品項</button>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={item.id} className="flex gap-2 items-center bg-slate-50 p-2 rounded-xl">
                  <input type="text" placeholder="品名" value={item.name} onChange={e => setItems(items.map(i => i.id === item.id ? {...i, name: e.target.value} : i))} className="flex-1 bg-transparent text-sm outline-none text-black px-2" />
                  <input type="number" placeholder="單價" value={item.price || ''} onChange={e => setItems(items.map(i => i.id === item.id ? {...i, price: Number(e.target.value)} : i))} className="w-16 bg-transparent text-sm font-bold text-right outline-none text-black" />
                  <span className="text-slate-300">x</span>
                  <input type="number" value={item.maxQty} onChange={e => setItems(items.map(i => i.id === item.id ? {...i, maxQty: Number(e.target.value)} : i))} className="w-10 bg-transparent text-sm text-center outline-none text-black" />
                  <button onClick={() => setItems(items.filter(i => i.id !== item.id))} className="text-red-300 hover:text-red-500 px-1">✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button onClick={handleCalculate} className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl hover:scale-[1.01] active:scale-95 transition-all">
          RUN 計算最佳湊單方案
        </button>

        {/* 🏆 計算結果 */}
        {hasCalculated && bestMatch && (
          <div className="bg-white border-4 border-blue-500 p-6 rounded-3xl shadow-xl animate-in fade-in slide-in-from-bottom-4 text-black">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">Best Choice</span>
                <h2 className="text-4xl font-black mt-2">實付 ${bestMatch.finalPay}</h2>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-sm font-bold">原始總額: ${bestMatch.subtotal}</p>
                {bestMatch.bonusNote && <p className="text-orange-500 font-bold text-sm">✨ {bestMatch.bonusNote}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {bestMatch.items.map((i, idx) => (
                <div key={idx} className="bg-slate-50 p-3 rounded-xl flex justify-between items-center border border-slate-100">
                  <span className="font-bold text-sm text-slate-700">{i.name}</span>
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs font-black underline decoration-2">x{i.qty}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasCalculated && !bestMatch && (
          <div className="bg-red-50 text-red-600 p-8 rounded-3xl text-center font-bold border-2 border-red-100">
            找不到符合條件的組合 😢 <br/>
            <span className="text-sm font-normal text-red-400">請嘗試調大誤差範圍或減少門檻金額。</span>
          </div>
        )}
      </div>
    </main>
  );
}