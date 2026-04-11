'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [items, setItems] = useState<any[]>([]);
  const [target, setTarget] = useState(1500);
  const [tolerance, setTolerance] = useState(200);
  const [discountTiers, setDiscountTiers] = useState([{ threshold: 1500, cashOff: 100 }]);

  useEffect(() => {
    const saved = localStorage.getItem('money-calculator-data');
    if (!saved) return;

    try {
      const data = JSON.parse(saved);
      // 修正：檢查資料是否存在，避免在 Effect 裡無謂的觸發 setState
      if (data.items) setItems(data.items);
      if (data.target) setTarget(data.target);
      if (data.tolerance) setTolerance(data.tolerance);
      if (data.discountTiers) setDiscountTiers(data.discountTiers);
    } catch (error) {
      console.error("讀取本地快取失敗", error);
    }
  }, []);

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold">歡迎使用購物湊單助手</h1>
      <p className="mt-4">請點擊上方導覽列進入「紀錄管理」。</p>
    </main>
  );
}