import { Item, ResultCombo } from '../types';

export const runCalculator = (
  items: Item[], 
  target: number, 
  tolerance: number,
  discountRate: number,
  threshold: number,
  cashOff: number,
  couponReward: number
): ResultCombo[] => {
  const validItems = items.filter(i => i.name.trim() !== '' && i.price > 0);
  let allValid: ResultCombo[] = [];
  const maxLimit = target + tolerance;

  const backtrack = (index: number, currentSum: number, selected: { [key: string]: number }) => {
    if (currentSum >= target && currentSum <= maxLimit) {
      // 計算優惠後的金額
      let price = currentSum * (discountRate / 100);
      let bonus = "";
      if (currentSum >= threshold) {
        price = price - cashOff;
        if (couponReward > 0) bonus = `回饋 $${couponReward} 卷`;
      }
      const finalPay = Math.max(0, Math.round(price));

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
  return allValid.sort((a, b) => a.subtotal - b.subtotal);
};