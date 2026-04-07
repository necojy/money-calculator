import { Item, ResultCombo, DiscountTier } from '../types';

export const runCalculator = (
  items: Item[], 
  target: number, 
  tolerance: number,
  discountRate: number,
  discountTiers: DiscountTier[],
  couponReward: number
): ResultCombo[] => {
  const validItems = items.filter(i => i.name.trim() !== '' && i.price > 0);
  let allValid: ResultCombo[] = [];
  const maxLimit = target + tolerance;

  const backtrack = (index: number, currentSum: number, selected: { [key: string]: number }) => {
    // 注意：這裡的判斷基礎仍然是原價總和是否在目標範圍內
    if (currentSum >= target && currentSum <= maxLimit) {
      
      // 1. 【關鍵修正】先計算打完折後的金額
      // 這就是用來判斷「是否符合滿額現折條件」的基礎金額
      const discountedSubtotal = currentSum * (discountRate / 100);
      
      // 2. 用「折扣後的金額」去尋找符合條件且折抵最高的級距
      let bestCashOff = 0;
      discountTiers.forEach(tier => {
        // 修改這裡：從 currentSum 改成 discountedSubtotal
        if (discountedSubtotal >= tier.threshold && tier.cashOff > bestCashOff) {
          bestCashOff = tier.cashOff;
        }
      });
      
      // 3. 最終應付金額 = 折扣後金額 - 滿額現折
      const finalPay = Math.max(0, Math.round(discountedSubtotal - bestCashOff));
      
      // 4. 贈品卷通常也是看折扣後是否達標
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
  
  // 排序：實付金額越低越前面
  return allValid.sort((a, b) => a.finalPay - b.finalPay);
};