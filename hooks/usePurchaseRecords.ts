import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { Product, PurchaseRecord } from '@/types';

export function usePurchaseRecords() {
  // --- 狀態管理 ---
  const [isLoaded, setIsLoaded] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [history, setHistory] = useState<PurchaseRecord[]>([]);
  const [filterName, setFilterName] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // --- 1. 從雲端讀取資料 (Read) ---
  useEffect(() => {
    async function fetchData() {
      // 讀取常用商品
      const { data: pData } = await supabase.from('products').select('*');
      // 讀取購買紀錄，按日期降冪排序
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

  // --- 2. 購買紀錄同步函式 (Purchase Records CRUD) ---
  const syncAddRecord = async (newRecord: any) => {
    const { data, error } = await supabase.from('purchase_records').insert([newRecord]).select();
    if (data) setHistory([data[0], ...history]);
    if (error) console.error('新增紀錄失敗:', error);
  };

  const syncUpdateRecord = async (id: string, updates: any) => {
    const { error } = await supabase.from('purchase_records').update(updates).eq('id', id);
    if (!error) {
      setHistory(history.map(h => h.id === id ? { ...h, ...updates } : h));
    }
  };

  const syncDeleteRecord = async (id: string) => {
    const { error } = await supabase.from('purchase_records').delete().eq('id', id);
    if (!error) {
      setHistory(history.filter(h => h.id !== id));
    }
  };

  // --- 3. 常用商品同步函式 (Products CRUD) ---
  const syncAddProduct = async (newProduct: any) => {
    const { data, error } = await supabase.from('products').insert([newProduct]).select();
    if (data) setProducts([...products, data[0]]);
    if (error) console.error('新增商品失敗:', error);
  };

  const syncUpdateProduct = async (id: string, updates: Partial<Product>) => {
    const { error } = await supabase.from('products').update(updates).eq('id', id);
    if (!error) {
      setProducts(products.map(p => p.id === id ? { ...p, ...updates } : p));
    }
  };

  const syncDeleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  // --- 4. 篩選與分頁邏輯 ---
  const filteredHistory = history.filter(record => {
    const matchName = filterName ? record.purchaser === filterName : true;
    const matchMonth = filterMonth ? record.date.startsWith(filterMonth) : true;
    return matchName && matchMonth;
  });

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const pagedHistory = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  // --- 5. 獲利統計計算 ---
  // 過濾出尚未對帳 (is_reconciled = false) 的項目進行計算
  const unReconciled = filteredHistory.filter(h => !h.is_reconciled);
  
  const stats = {
    // 總進貨成本 (使用底線命名 total_amount)
    totalCost: unReconciled.reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0),
    
    // 總預期收入 (加總所有項目的 sellingPrice * qty)
    totalRevenue: unReconciled.reduce((acc, curr) => 
      acc + (curr.items?.reduce((s: number, i: any) => s + (Number(i.sellingPrice) * Number(i.qty)), 0) || 0), 0),
    
    // 總利潤公式: $$TotalProfit = \sum (Revenue - Total\_Amount)$$
    totalProfit: filteredHistory.reduce((acc, curr) => {
      const revenue = curr.items?.reduce((s: number, i: any) => s + (Number(i.sellingPrice) * Number(i.qty)), 0) || 0;
      return acc + (revenue - Number(curr.total_amount || 0));
    }, 0)
  };

  // --- 6. 回傳所有狀態與函式 ---
  return {
    isLoaded,
    products, setProducts, // 回傳此項以修正 page.tsx 紅線
    history, setHistory,   // 回傳此項以修正 page.tsx 紅線
    filterName, setFilterName,
    filterMonth, setFilterMonth,
    currentPage, setCurrentPage,
    totalPages,
    pagedHistory,
    filteredHistory,
    stats,
    // 導出雲端同步函式
    syncAddRecord, syncUpdateRecord, syncDeleteRecord,
    syncAddProduct, syncUpdateProduct, syncDeleteProduct
  };
}