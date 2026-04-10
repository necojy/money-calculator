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

// --- types/index.ts ---
export type Product = {
  id: string;
  name: string;
  defaultPrice: number;
};

export type PurchaseItem = {
  productId?: string;
  name: string;
  price: number;        // 進貨成本
  sellingPrice: number; // 售出單價
  qty: number;
};

export type PurchaseRecord = {
  id: string;
  date: string;
  items: PurchaseItem[];
  totalAmount: number;  // 總進貨成本
  isReconciled: boolean;
};