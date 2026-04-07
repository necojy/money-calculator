'use client';

import { useState, useEffect } from 'react';

type Item = {
  id: string;
  name: string;
  price: number;
  maxQty: number; // 新增：數量上限
};

type ResultCombo = {
  items: { name: string; price: number; qty: number }[];
  sum: number;
  diff: number;
};

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [target, setTarget] = useState<number>(1000);
  const [tolerance, setTolerance] = useState<number>(100);
  const [items, setItems] = useState<Item[]>([
    { id: 'default', name: '', price: 0, maxQty: 1 }
  ]);

  const [bestMatch, setBestMatch] = useState<ResultCombo | null>(null);
  const [validMatches, setValidMatches] = useState<ResultCombo[]>([]);
  const [hasCalculated, setHasCalculated] = useState(false);

  useEffect(() => {
    const savedItems = localStorage.getItem('calc-items-v2');
    const savedTarget = localStorage.getItem('calc-target');
    const savedTolerance = localStorage.getItem('calc-tolerance');

    if (savedItems) setItems(JSON.parse(savedItems));
    if (savedTarget) setTarget(Number(savedTarget));
    if (savedTolerance) setTolerance(Number(savedTolerance));

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('calc-items-v2', JSON.stringify(items));
      localStorage.setItem('calc-target', String(target));
      localStorage.setItem('calc-tolerance', String(tolerance));
    }
  }, [items, target, tolerance, isLoaded]);

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), name: '', price: 0, maxQty: 1 }]);
    setHasCalculated(false);
  };

  const updateItem = (id: string, field: keyof Item, value: string | number) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    setHasCalculated(false);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    setHasCalculated(false);
  };

  const calculateCombinations = () => {
    const validItems = items.filter(item => item.name.trim() !== '' && item.price > 0 && item.maxQty > 0);
    if (validItems.length === 0) {
      alert('請輸入有效的品項、金額與數量！');
      return;
    }

    let allValid: ResultCombo[] = [];
    const maxLimit = target + tolerance;

    // 使用回溯法，考慮每個品項的數量
    const backtrack = (index: number, currentSum: number, selected: { [key: string]: number }) => {
      // 判斷條件：總和必須在 [目標, 目標+誤差] 之間
      if (currentSum >= target && currentSum <= maxLimit) {
        const comboItems = validItems
          .filter(item => selected[item.id] > 0)
          .map(item => ({ name: item.name, price: item.price, qty: selected[item.id] }));
        
        allValid.push({
          items: comboItems,
          sum: currentSum,
          diff: currentSum - target // 這裡的 diff 永遠是 >= 0
        });
      }

      if (index >= validItems.length || currentSum > maxLimit) return;

      const item = validItems[index];
      
      // 嘗試選取該品項不同數量 (從 0 到 maxQty)
      for (let q = 0; q <= item.maxQty; q++) {
        const nextSum = currentSum + item.price * q;
        if (nextSum > maxLimit) break; // 超過上限就不用再試更多數量了

        selected[item.id] = q;
        backtrack(index + 1, nextSum, selected);
        selected[item.id] = 0; // 回溯
      }
    };

    backtrack(0, 0, {});

    // 排序：總和越接近目標（diff 越小）越前面
    allValid.sort((a, b) => a.diff - b.diff);

    setBestMatch(allValid.length > 0 ? allValid[0] : null);
    setValidMatches(allValid);
    setHasCalculated(true);
  };

  if (!isLoaded) return <div className="min-h-screen bg-gray-100 flex items-center justify-center text-black">載入中...</div>;

  return (
    <main className="min-h-screen bg-gray-100 p-8 text-black">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center">金額組合計算機 (含數量) 💰</h1>

        <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-blue-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium mb-1">目標金額 (下限)</label>
            <input type="number" value={target} onChange={e => setTarget(Number(e.target.value))} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">容許增加範圍 (+)</label>
            <input type="number" value={tolerance} onChange={e => setTolerance(Number(e.target.value))} className="w-full border p-2 rounded" />
          </div>
          <p className="col-span-2 text-xs text-blue-600 font-medium">※ 程式將尋找金額介於 {target} ~ {target + tolerance} 元之間的組合</p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">品項清單</h2>
            <button onClick={addItem} className="bg-green-500 text-white py-1 px-3 rounded text-sm">+ 新增品項</button>
          </div>
          <div className="space-y-2">
            <div className="flex gap-3 px-2 text-sm font-bold text-gray-500">
              <span className="flex-1 ml-8">品項名稱</span>
              <span className="w-24 text-center">單價</span>
              <span className="w-20 text-center">數量上限</span>
              <span className="w-8"></span>
            </div>
            {items.map((item, index) => (
              <div key={item.id} className="flex gap-3 items-center">
                <span className="text-gray-400 w-5">{index + 1}.</span>
                <input type="text" placeholder="名稱" value={item.name} onChange={e => updateItem(item.id, 'name', e.target.value)} className="flex-1 border p-2 rounded" />
                <input type="number" placeholder="單價" value={item.price || ''} onChange={e => updateItem(item.id, 'price', Number(e.target.value))} className="w-24 border p-2 rounded" />
                <input type="number" min="1" value={item.maxQty} onChange={e => updateItem(item.id, 'maxQty', Number(e.target.value))} className="w-20 border p-2 rounded text-center" />
                <button onClick={() => removeItem(item.id)} disabled={items.length === 1} className="text-red-500 font-bold w-8">✕</button>
              </div>
            ))}
          </div>
        </div>

        <button onClick={calculateCombinations} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors">開始計算組合</button>

        {hasCalculated && (
          <div className="mt-8 pt-8 border-t">
            <h2 className="text-2xl font-bold mb-4">計算結果</h2>
            {bestMatch ? (
              <div className="bg-green-50 border border-green-200 p-5 rounded-lg mb-6 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-bold text-green-800">🏆 最佳方案</h3>
                  <span className="bg-green-200 text-green-800 text-xs font-bold px-2 py-1 rounded">多出 {bestMatch.diff} 元</span>
                </div>
                <p className="text-2xl font-bold text-green-700 mb-4 border-b pb-2">總計: {bestMatch.sum} 元</p>
                <div className="space-y-2">
                  {bestMatch.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-green-800">
                      <span>{item.name} (x{item.qty})</span>
                      <span>${item.price * item.qty}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg">在此範圍內找不到任何組合。請嘗試增加數量上限或調大誤差範圍。</div>
            )}

            {validMatches.length > 1 && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">其他可行方案 ({validMatches.length - 1} 組)</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {validMatches.slice(1, 11).map((match, idx) => (
                    <div key={idx} className="bg-gray-50 border p-3 rounded text-sm">
                      <div className="flex justify-between font-bold mb-1">
                        <span>總計: {match.sum} 元</span>
                        <span className="text-gray-500">多出 {match.diff} 元</span>
                      </div>
                      <p className="text-gray-600 italic">{match.items.map(i => `${i.name}x${i.qty}`).join(', ')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}