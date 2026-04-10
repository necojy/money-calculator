import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase'; // 引入連線設定
import { Product, PurchaseRecord } from '@/types';

export function usePurchaseRecords() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [history, setHistory] = useState<PurchaseRecord[]>([]);
  const [filterName, setFilterName] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // --- 1. 從雲端讀取資料 ---
  useEffect(() => {
    async function fetchData() {
      // 讀取商品
      const { data: pData } = await supabase.from('products').select('*');
      // 讀取紀錄 (按日期排序)
      const { data: hData } = await supabase
        .from('purchase_records')
        .select('*')
        .order('date', { ascending: false });

      if (pData) setProducts(pData);
      if (hData) setHistory(hData);
      setIsLoaded(true);
    }
    fetchData();
  }, []);

  // --- 2. 雲端同步輔助函式 (給 Page 使用) ---
  const syncAddRecord = async (newRecord: any) => {
    const { data, error } = await supabase.from('purchase_records').insert([newRecord]).select();
    if (data) setHistory([data[0], ...history]);
  };

  const syncUpdateRecord = async (id: string, updates: any) => {
    await supabase.from('purchase_records').update(updates).eq('id', id);
    setHistory(history.map(h => h.id === id ? { ...h, ...updates } : h));
  };

  const syncDeleteRecord = async (id: string) => {
    await supabase.from('purchase_records').delete().eq('id', id);
    setHistory(history.filter(h => h.id !== id));
  };

  // --- 3. 篩選與計算 (邏輯與原本相同) ---
  const filteredHistory = history.filter(record => {
    const matchName = filterName ? record.purchaser === filterName : true;
    const matchMonth = filterMonth ? record.date.startsWith(filterMonth) : true;
    return matchName && matchMonth;
  });

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const pagedHistory = filteredHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const unReconciled = filteredHistory.filter(h => !h.isReconciled);
  const stats = {
    totalCost: unReconciled.reduce((acc, curr) => acc + Number(curr.totalAmount), 0),
    totalRevenue: unReconciled.reduce((acc, curr) => 
      acc + curr.items.reduce((s: number, i: any) => s + (Number(i.sellingPrice) * Number(i.qty)), 0), 0),
    totalProfit: filteredHistory.reduce((acc, curr) => {
      const revenue = curr.items.reduce((s: number, i: any) => s + (Number(i.sellingPrice) * Number(i.qty)), 0);
      return acc + (revenue - Number(curr.totalAmount));
    }, 0)
  };

  // hooks/usePurchaseRecords.ts 內
const syncUpdateProduct = async (id: string, updates: any) => {
  await supabase.from('products').update(updates).eq('id', id);
  setProducts(products.map(p => p.id === id ? { ...p, ...updates } : p));
};

const syncAddProduct = async (newProduct: any) => {
  const { data } = await supabase.from('products').insert([newProduct]).select();
  if (data) setProducts([...products, data[0]]);
};

  return {
    isLoaded, products, setProducts, history, setHistory,
    filterName, setFilterName, filterMonth, setFilterMonth,
    currentPage, setCurrentPage, totalPages,
    pagedHistory, filteredHistory, stats,
    syncAddRecord, syncUpdateRecord, syncDeleteRecord // 把雲端同步功能傳出去
  };
}