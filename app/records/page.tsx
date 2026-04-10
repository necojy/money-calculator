// --- app/records/page.tsx ---
'use client';

import { useState, useEffect, useRef } from 'react';
import { Product, PurchaseRecord } from '@/types';
import RecordStats from '@/components/RecordStats';
import PurchaseCard from '@/components/PurchaseCard';

export default function RecordsPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [history, setHistory] = useState<PurchaseRecord[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const STORAGE_KEY = 'shopping-helper-final';

  // --- 資料讀取與存檔 (useEffect) 邏輯 ---
  // ... (同你原本的 LocalStorage 邏輯)

  // --- 統計計算 ---
  const unReconciled = history.filter(h => !h.isReconciled);
  const totalCost = unReconciled.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalRevenue = unReconciled.reduce((acc, curr) => acc + curr.items.reduce((s, i) => s + (Number(i.sellingPrice) * Number(i.qty)), 0), 0);
  const totalProfit = history.reduce((acc, curr) => {
    const revenue = curr.items.reduce((s, i) => s + (Number(i.sellingPrice) * Number(i.qty)), 0);
    return acc + (revenue - curr.totalAmount);
  }, 0);

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-900">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* 使用抽離出的統計組件 */}
        <RecordStats totalCost={totalCost} totalRevenue={totalRevenue} totalProfit={totalProfit} />

        {/* 備份與管理區塊 ... */}

        {/* 紀錄列表 */}
        <section className="space-y-6">
          {history.map(record => (
            <PurchaseCard 
              key={record.id} 
              record={record} 
              products={products}
              onUpdate={(updated) => setHistory(history.map(h => h.id === updated.id ? updated : h))}
              onDelete={(id) => setHistory(history.filter(h => h.id !== id))}
            />
          ))}
        </section>
      </div>
    </main>
  );
}