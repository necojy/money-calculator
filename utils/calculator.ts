import { Item, ResultCombo, DiscountTier } from '../types';

export const runCalculator = (
  items: Item[], 
  target: number, 
  tolerance: number,
  discountRate: number,
  discountTiers: DiscountTier[], // 改為陣列
  couponReward: number
): ResultCombo[] => {
  const validItems = items.filter(i => i.name.trim() !== '' && i.price > 0);
  let allValid: ResultCombo[] = [];
  const maxLimit = target + tolerance;

  const backtrack = (index: number, currentSum: number, selected: { [key: string]: number }) => {
    if (currentSum >= target && currentSum <= maxLimit) {
      // 1. 先算打折
      let price = currentSum * (discountRate / 100);
      
      // 2. 找出符合條件且折抵金額最高的級距
      let bestCashOff = 0;
      discountTiers.forEach(tier => {
        if (currentSum >= tier.threshold && tier.cashOff > bestCashOff) {
          bestCashOff = tier.cashOff;
        }
      });
      
      price = price - bestCashOff;
      const finalPay = Math.max(0, Math.round(price));
      const bonus = currentSum >= target && couponReward > 0 ? `回饋 $${couponReward} 卷` : "";

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