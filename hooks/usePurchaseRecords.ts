import { useState, useEffect } from 'react';
import { Product, PurchaseRecord } from '@/types';

export function usePurchaseRecords() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [history, setHistory] = useState<PurchaseRecord[]>([]);
  
  // 篩選與分頁狀態
  const [filterName, setFilterName] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const STORAGE_KEY = 'shopping-helper-final';

  // --- 資料自動讀取與存檔 ---
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const { products: p, history: h } = JSON.parse(savedData);
        if (p) setProducts(p);
        if (h) setHistory(h);
      } catch (e) { console.error("讀取失敗", e); }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ products, history }));
    }
  }, [products, history, isLoaded]);

  // --- 篩選後的紀錄 ---
  const filteredHistory = history.filter(record => {
    const matchName = filterName ? record.purchaser === filterName : true;
    const matchMonth = filterMonth ? record.date.startsWith(filterMonth) : true;
    return matchName && matchMonth;
  });

  // --- 分頁資料 ---
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const pagedHistory = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // --- 統計數據計算 ---
  const unReconciled = filteredHistory.filter(h => !h.isReconciled);
  const totalCost = unReconciled.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalRevenue = unReconciled.reduce((acc, curr) => 
    acc + curr.items.reduce((s, i) => s + (Number(i.sellingPrice || 0) * Number(i.qty)), 0), 0
  );

  const totalProfit = filteredHistory.reduce((acc, curr) => {
    const revenue = curr.items.reduce((s, i) => s + (Number(i.sellingPrice || 0) * Number(i.qty)), 0);
    return acc + (revenue - curr.totalAmount);
  }, 0);

return {
    isLoaded,
    products, setProducts,
    history, setHistory,
    filterName, setFilterName,
    filterMonth, setFilterMonth,
    currentPage, setCurrentPage,
    totalPages,
    pagedHistory,
    filteredHistory, // <--- 補上這一行，報錯就會消失！
    stats: { totalCost, totalRevenue, totalProfit }
  };
}