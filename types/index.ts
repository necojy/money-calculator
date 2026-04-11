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
export interface Product {
  id: string;
  name: string;
  default_price: number; // 將 defaultPrice 改成 default_price
}

export interface PurchaseItem {
  name: string;
  price: number;        // 進貨價
  sellingPrice: number; // 售出價 (建議這裡也統一改底線，看你個人習慣)
  qty: number;
}

export interface PurchaseRecord {
  id: string;
  date: string;
  items: PurchaseItem[];
  total_amount: number;  // 配合資料庫改底線
  is_reconciled: boolean; // 配合資料庫改底線
  purchaser: string;
  purchase_location: string;
  payment_method: string;
  pickup_location: string;
}