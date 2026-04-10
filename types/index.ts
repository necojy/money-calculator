// --- 修正後的 types/index.ts ---

export type Item = {
  id: string;
  name: string;
  price: number;
  maxQty: number;
};

export type DiscountTier = {
  threshold: number;
  cashOff: number;
};

export type ResultCombo = {
  items: { name: string; price: number; qty: number }[];
  subtotal: number;
  finalPay: number;
  bonusNote: string;
};

export type Product = {
  id: string;
  name: string;
  defaultPrice: number;
};

// --- 重點修正：加入 sellingPrice 並讓 productId 變選填 ---
export type PurchaseItem = {
  productId?: string; // 加個問號變成選填
  name: string;
  price: number;        // 進貨成本
  sellingPrice: number; // 售出單價 (新增這行)
  qty: number;
};

export type PurchaseRecord = {
  id: string;
  date: string;
  items: PurchaseItem[];
  totalAmount: number; // 總支出成本
  isReconciled: boolean;
};