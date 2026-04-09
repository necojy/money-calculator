import { Item, ResultCombo, DiscountTier } from '../types';

export const runCalculator = (
  items: Item[], 
  target: number, 
  tolerance: number,
  discountRate: number,
  discountThreshold: number, // 新增：打折門檻
  discountTiers: DiscountTier[],
  couponReward: number
): ResultCombo[] => {
  const validItems = items.filter(i => i.name.trim() !== '' && i.price > 0);
  let allValid: ResultCombo[] = [];
  const maxLimit = target + tolerance;

  const backtrack = (index: number, currentSum: number, selected: { [key: string]: number }) => {
    if (currentSum >= target && currentSum <= maxLimit) {
      
      // 1. 【核心修改】判斷是否達到打折門檻
      let discountedSubtotal = currentSum;
      if (currentSum >= discountThreshold) {
        discountedSubtotal = currentSum * (discountRate / 100);
      }
      
      // 2. 用「折扣後金額」判斷滿額現折 (邏輯維持不變)
      let bestCashOff = 0;
      discountTiers.forEach(tier => {
        if (discountedSubtotal >= tier.threshold && tier.cashOff > bestCashOff) {
          bestCashOff = tier.cashOff;
        }
      });
      
      const finalPay = Math.max(0, Math.round(discountedSubtotal - bestCashOff));
      const bonus = discountedSubtotal >= target && couponReward > 0 ? `回饋 $${couponReward} 卷` : "";

      allValid.push({
        items: validItems.filter(i => selected[i.id] > 0).map(i => ({ 
          name: i.name, 
          price: i.price, 
          qty: selected[i.id] 
        })),
        subtotal: currentSum,
        finalPay,
        bonusNote: bonus
      });
    }

    if (index >= validItems.length || currentSum > maxLimit) return;

    const item = validItems[index];
    for (let q = 0; q <= item.maxQty; q++) {
      const nextSum = currentSum + item.price * q;
      if (nextSum > maxLimit) break;
      selected[item.id] = q;
      backtrack(index + 1, nextSum, selected);
      selected[item.id] = 0;
    }
  };

  backtrack(0, 0, {});
  return allValid.sort((a, b) => a.finalPay - b.finalPay);
};