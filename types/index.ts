export type Item = {
  id: string;
  name: string;
  price: number;
  maxQty: number;
};

// 新增這段
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

// --- 產品主表 (Master List) ---
export type Product = {
  id: string;
  name: string;
  defaultPrice: number;
};

// --- 單筆購買內容 ---
export type PurchaseItem = {
  productId: string;
  name: string;
  price: number;
  qty: number;
};

// --- 購買紀錄紀錄 ---
export type PurchaseRecord = {
  id: string;
  date: string;
  items: PurchaseItem[];
  totalAmount: number;
  isReconciled: boolean; // 是否對帳
};