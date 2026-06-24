const DUTY_FREE_THRESHOLD_JPY = 16666;
const DUTY_RATE = 0.1;

export interface OrderCalcInput {
  sourcingCostKRW: number;
  sellingPriceJPY: number;
  jpyToKrwRate: number;
  intlShippingKRW: number;
  domesticShippingKRW: number;
  buymaFeePercent: number;
}

export interface OrderCalcResult {
  sellingPriceKRW: number;
  customsDutyKRW: number;
  buymaFeeKRW: number;
  totalCostKRW: number;
  netProfitKRW: number;
  profitMarginPercent: number;
  isDutyFree: boolean;
}

export function calculateOrder(input: OrderCalcInput): OrderCalcResult {
  const sellingPriceKRW = input.sellingPriceJPY * input.jpyToKrwRate;
  const isDutyFree = input.sellingPriceJPY <= DUTY_FREE_THRESHOLD_JPY;
  const customsDutyKRW = isDutyFree ? 0 : input.sourcingCostKRW * DUTY_RATE;
  const buymaFeeKRW = sellingPriceKRW * (input.buymaFeePercent / 100);

  const totalCostKRW =
    input.sourcingCostKRW + input.intlShippingKRW + input.domesticShippingKRW + customsDutyKRW + buymaFeeKRW;

  const netProfitKRW = sellingPriceKRW - totalCostKRW;
  const profitMarginPercent = sellingPriceKRW > 0 ? (netProfitKRW / sellingPriceKRW) * 100 : 0;

  return {
    sellingPriceKRW,
    customsDutyKRW,
    buymaFeeKRW,
    totalCostKRW,
    netProfitKRW,
    profitMarginPercent,
    isDutyFree,
  };
}
