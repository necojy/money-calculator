'use client';

import { useRef } from 'react';
import { usePurchaseRecords } from '@/hooks/usePurchaseRecords';
import { PurchaseItem, PurchaseRecord } from '@/types'; // 引入型別以解決 any 報錯
import RecordStats from '@/components/RecordStats';
import PurchaseCard from '@/components/PurchaseCard';
import MasterProduct from '@/components/MasterProduct';
import RecordBackup from '@/components/RecordBackup';

export default function RecordsPage() {
  const {
    isLoaded,
    products,
    history, setHistory,
    filterName, setFilterName,
    filterMonth, setFilterMonth,
    currentPage, setCurrentPage,
    totalPages,
    pagedHistory,
    filteredHistory,
    stats,
    // 雲端同步函式
    syncAddRecord, 
    syncUpdateRecord, 
    syncDeleteRecord,
    syncAddProduct,    
    syncUpdateProduct, 
    syncDeleteProduct
  } = usePurchaseRecords();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 1. 常用商品動作處理 (修正為同步雲端) ---

  const addMasterProduct = async () => {
    const name = prompt("商品名稱:");
    const price = Number(prompt("預期售出價:"));
    if (name) {
      // 呼叫同步函式
      await syncAddProduct({ 
        name, 
        default_price: price || 0 
      });
    }
  };

  const updateMasterProduct = async (id: string) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const oldName = product.name;
    const newName = prompt("修改商品名稱:", product.name);
    const newPrice = Number(prompt("修改預期售價:", product.default_price?.toString()));

    if (newName && !isNaN(newPrice)) {
      // 1. 同步更新商品主表
      await syncUpdateProduct(id, { name: newName, default_price: newPrice });

      // 2. 修正 TypeScript 報錯：將 any 替換為 PurchaseItem
      const updatedHistory = history.map(record => ({
        ...record,
        items: record.items.map((item: PurchaseItem) => 
          item.name === oldName 
            ? { ...item, name: newName, sellingPrice: newPrice } 
            : item
        )
      }));
      setHistory(updatedHistory);
    }
  };

  // --- 2. 購買紀錄動作處理 (同步雲端) ---

  const addRecord = async () => {
    const newObj = {
      date: new Date().toISOString().split('T')[0],
      items: [],
      total_amount: 0, // 配合 SQL 底線命名
      is_reconciled: false,
      purchaser: '',
      purchase_location: '',
      payment_method: '信用卡',
      pickup_location: ''
    };
    await syncAddRecord(newObj);
  };

  // --- 3. 備份與匯入 (修正 unused vars 報錯) ---

  const handleExport = () => {
    const data = { products, history };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.products && data.history) {
          if (confirm("這將會把舊資料匯入雲端，確定嗎？")) {
            for (const p of data.products) await syncAddProduct(p);
            for (const h of data.history) await syncAddRecord(h);
            alert("雲端同步完成！");
          }
        }
      } catch (error) { // 修正為 error 並印出以解決 unused 警告
        console.error("匯入失敗:", error);
        alert("檔案格式錯誤"); 
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!isLoaded) return <div className="p-10 text-center font-bold">載入中...</div>;

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-900">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <RecordStats {...stats} selectedMonth={filterMonth} />

        <RecordBackup onExport={handleExport} onImport={handleImport} />

        {/* 常用商品清單 */}
        <MasterProduct 
          products={products} 
          onAdd={addMasterProduct} 
          onUpdate={updateMasterProduct} 
          onDelete={(id) => syncDeleteProduct(id)} 
        />

        {/* 篩選列 */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-200 flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">月份篩選:</span>
            <input 
              type="month" 
              value={filterMonth}
              onChange={(e) => { setFilterMonth(e.target.value); setCurrentPage(1); }}
              className="bg-slate-100 p-2 rounded-xl text-xs font-bold outline-none border border-slate-100 focus:border-blue-400 text-black"
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">購買人篩選:</span>
            <div className="flex gap-2">
              {['', '宥', '洪', '涵', '崑'].map(name => (
                <button
                  key={name}
                  onClick={() => { setFilterName(name); setCurrentPage(1); }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    filterName === name ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {name || '全部'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4">
          <h1 className="text-3xl font-black text-slate-800">購買與獲利紀錄 📑</h1>
          <button onClick={addRecord} className="bg-blue-600 text-white px-8 py-4 rounded-[24px] font-black shadow-xl hover:scale-105 transition-all">
            + 開始新紀錄
          </button>
        </div>

        {/* 紀錄清單 */}
        <section className="space-y-6">
          {pagedHistory.map(record => (
            <PurchaseCard 
              key={record.id} 
              record={record} 
              products={products}
              onUpdate={(updated: PurchaseRecord) => syncUpdateRecord(updated.id, updated)}
              onDelete={(id: string) => syncDeleteRecord(id)}
            />
          ))}
        </section>

        {/* 分頁 */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-6 pt-8 pb-10">
            <button disabled={currentPage === 1} onClick={() => { setCurrentPage(prev => prev - 1); window.scrollTo(0, 0); }} className="font-black text-blue-600 disabled:opacity-20 p-2">← 上一頁</button>
            <div className="bg-white px-6 py-2 rounded-full border border-slate-200 shadow-sm text-black text-sm font-bold">第 {currentPage} / {totalPages} 頁</div>
            <button disabled={currentPage === totalPages} onClick={() => { setCurrentPage(prev => prev + 1); window.scrollTo(0, 0); }} className="font-black text-blue-600 disabled:opacity-20 p-2">下一頁 →</button>
          </div>
        )}
      </div>
    </main>
  );
}