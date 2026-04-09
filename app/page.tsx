'use client';

import { useState, useEffect } from 'react';
import { Item, ResultCombo, DiscountTier } from '../types';
import { runCalculator } from '../utils/calculator';
import DiscountSettings from '../components/DiscountSettings';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // --- 1. 狀態定義 ---
  // 商品清單
  const [items, setItems] = useState<Item[]>([{ id: 'default', name: '', price: 0, maxQty: 1 }]);
  const [discountThreshold, setDiscountThreshold] = useState(0);

  // 目標金額與誤差範圍
  const [target, setTarget] = useState(1500);
  const [tolerance, setTolerance] = useState(200);
  
  // 優惠設定：折扣率、滿額級距、贈送卷
  const [discountRate, setDiscountRate] = useState(100);
  const [discountTiers, setDiscountTiers] = useState<DiscountTier[]>([
    { threshold: 1500, cashOff: 100 }
  ]);
  const [couponReward, setCouponReward] = useState(0);
  
  // 計算結果
  const [bestMatch, setBestMatch] = useState<ResultCombo | null>(null);
  const [validMatches, setValidMatches] = useState<ResultCombo[]>([]);
  const [hasCalculated, setHasCalculated] = useState(false);

  // --- 2. 瀏覽器暫存 (LocalStorage) 邏輯 ---
  useEffect(() => {
    const saved = localStorage.getItem('money-calc-v6');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setItems(data.items || []);
        setTarget(data.target || 1500);
        setTolerance(data.tolerance || 200);
        setDiscountTiers(data.discountTiers || [{ threshold: 1500, cashOff: 100 }]);
        setDiscountRate(data.discountRate || 100);
        setDiscountThreshold(data.discountThreshold || 0); // 加入這行
      } catch (e) {
        console.error("讀取存檔失敗", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const saveData = { items, target, tolerance, discountTiers, discountRate,discountThreshold};
      localStorage.setItem('money-calc-v6', JSON.stringify(saveData));
    }
}, [items, target, tolerance, discountTiers, discountRate, discountThreshold, isLoaded]);

  // --- 3. 處理計算按鈕 ---
  const handleCalculate = () => {
    // 呼叫我們拆分出去的演算法
    const results = runCalculator(
      items, 
      target, 
      tolerance, 
      discountRate, 
      discountThreshold, // 傳入新參數
      discountTiers, 
      couponReward
    );
    
    setValidMatches(results);
    setBestMatch(results.length > 0 ? results[0] : null);
    setHasCalculated(true);
  };

  // 避免伺服器渲染與客戶端不一致
  if (!isLoaded) return <div className="text-center p-10 text-slate-500 font-bold">系統初始化中...</div>;

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-900">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-4xl font-black text-center text-blue-600 mb-10 tracking-tight">
          購物湊單神隊友 🛒
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* --- 左側：設定與優惠 --- */}
          <div className="space-y-6">
            {/* 🎯 目標設定 */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <h2 className="font-black mb-4 flex items-center gap-2 text-slate-800">🎯 目標設定</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">湊單目標金額</label>
                  <input 
                    type="number" 
                    value={target} 
                    onChange={e => setTarget(Number(e.target.value))} 
                    className="w-full border-2 border-slate-100 p-3 rounded-2xl text-black font-bold outline-none focus:border-blue-400 transition-colors" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">容許加購範圍 (+)</label>
                  <input 
                    type="number" 
                    value={tolerance} 
                    onChange={e => setTolerance(Number(e.target.value))} 
                    className="w-full border-2 border-slate-100 p-3 rounded-2xl text-black font-bold outline-none focus:border-blue-400 transition-colors" 
                  />
                </div>
              </div>
            </div>

            {/* 🧧 優惠設定組件 (已拆分) */}
            <DiscountSettings 
              discountRate={discountRate} 
              setDiscountRate={setDiscountRate}
              discountThreshold={discountThreshold} // 新增
              setDiscountThreshold={setDiscountThreshold} // 新增
              discountTiers={discountTiers}
              setDiscountTiers={setDiscountTiers}
              couponReward={couponReward}
              setCouponReward={setCouponReward}
            />
          </div>

          {/* --- 右側：商品清單 --- */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-black text-slate-800 flex items-center gap-2">📦 商品清單</h2>
              <button 
                onClick={() => setItems([...items, { id: Date.now().toString(), name: '', price: 0, maxQty: 1 }])} 
                className="bg-blue-50 text-blue-600 font-black text-xs px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors"
              >
                + 新增品項
              </button>
            </div>
            
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {items.map((item) => (
                <div key={item.id} className="flex gap-2 items-center bg-slate-50 p-3 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all">
                  <input 
                    type="text" 
                    placeholder="品名" 
                    value={item.name} 
                    onChange={e => setItems(items.map(i => i.id === item.id ? {...i, name: e.target.value} : i))} 
                    className="flex-1 bg-transparent text-sm font-bold outline-none text-black px-2" 
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold text-slate-400">$</span>
                    <input 
                      type="number" 
                      placeholder="單價" 
                      value={item.price || ''} 
                      onChange={e => setItems(items.map(i => i.id === item.id ? {...i, price: Number(e.target.value)} : i))} 
                      className="w-16 bg-transparent text-sm font-black text-right outline-none text-blue-600" 
                    />
                  </div>
                  <span className="text-slate-300 font-bold">×</span>
                  <input 
                    type="number" 
                    value={item.maxQty} 
                    onChange={e => setItems(items.map(i => i.id === item.id ? {...i, maxQty: Number(e.target.value)} : i))} 
                    className="w-10 bg-white border border-slate-200 rounded-lg text-sm font-black text-center outline-none text-black shadow-sm" 
                  />
                  <button 
                    onClick={() => setItems(items.filter(i => i.id !== item.id))} 
                    className="text-slate-300 hover:text-red-500 transition-colors px-1 font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- 計算按鈕 --- */}
        <button 
          onClick={handleCalculate} 
          className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl shadow-2xl hover:bg-black hover:scale-[1.01] active:scale-95 transition-all mt-4 text-xl"
        >
          RUN！計算最佳湊單方案
        </button>

        {/* --- 結果顯示區 --- */}
        {hasCalculated && (
          <div className="pt-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {bestMatch ? (
              <div className="space-y-10">
                {/* 🏆 最佳解卡片 */}
                <div className="bg-white border-[6px] border-blue-500 p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-blue-500 text-white px-8 py-2 rounded-bl-3xl font-black text-sm tracking-tighter">
                    🏆 最佳省錢方案
                  </div>
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                    <div>
                      <p className="text-slate-400 font-bold text-sm mb-1 uppercase tracking-widest">優惠後實付金額</p>
                      <h2 className="text-7xl font-black text-black tracking-tighter">
                        ${bestMatch.finalPay}
                      </h2>
                    </div>
                    <div className="text-left md:text-right space-y-1">
                      <p className="text-slate-500 font-bold">原始總額: <span className="line-through text-slate-300">${bestMatch.subtotal}</span></p>
                      {bestMatch.bonusNote && (
                        <p className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full font-black text-xs inline-block">
                          ✨ {bestMatch.bonusNote}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bestMatch.items.map((i, idx) => (
                      <div key={idx} className="bg-blue-50/50 p-4 rounded-2xl flex justify-between items-center border border-blue-100">
                        <span className="font-black text-slate-700">{i.name}</span>
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-xl text-xs font-black">
                          x{i.qty}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 💡 其他備選方案 */}
                {validMatches.length > 1 && (
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black text-slate-800 px-2">💡 其他推薦方案 ({validMatches.length - 1} 組)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {validMatches.slice(1, 13).map((match, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-3xl border-2 border-slate-100 shadow-sm hover:border-blue-200 transition-all group">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-2xl font-black text-slate-800 group-hover:text-blue-600 transition-colors">${match.finalPay}</span>
                            <span className="text-[10px] font-bold text-slate-300 tracking-tighter">原價 ${match.subtotal}</span>
                          </div>
                          <div className="text-xs text-slate-400 font-medium leading-relaxed">
                            {match.items.map(i => `${i.name}x${i.qty}`).join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                    {validMatches.length > 13 && (
                      <p className="text-center text-slate-400 text-xs font-bold pt-4">只顯示最接近目標的前 12 組備選方案</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-red-50 border-4 border-red-100 p-12 rounded-[40px] text-center shadow-inner">
                <p className="text-red-500 text-3xl font-black mb-2">找不到任何組合 😢</p>
                <p className="text-red-300 font-bold">請嘗試調大「容許加購範圍」或是降低「湊單目標」。</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}