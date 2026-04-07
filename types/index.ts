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