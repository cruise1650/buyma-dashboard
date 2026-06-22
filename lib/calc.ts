export type CostCurrency = "EUR" | "USD" | "GBP" | "KRW" | "JPY" | "CNY";

export interface CalcInput {
  costCurrency: CostCurrency;
  costAmount: number;
  sourcingToJpyRate: number;
  jpyToKrwRate: number;
  intlShippingKRW: number;
  domesticShippingKRW: number;
  packagingKRW: number;
  sellingPriceJPY: number;
  buymaFeeRatePercent: number;
}

export interface CalcResult {
  costJPY: number;
  intlShippingJPY: number;
  domesticShippingJPY: number;
  packagingJPY: number;
  customsDutyJPY: number;
  buymaFeeJPY: number;
  totalCostJPY: number;
  receivedAmountJPY: number;
  netProfitJPY: number;
  netProfitKRW: number;
  profitMarginPercent: number;
  roiPercent: number;
  isDutyFree: boolean;
}

const DUTY_FREE_THRESHOLD_JPY = 16666;
const DUTY_RATE = 0.1;

export function calculate(input: CalcInput): CalcResult {
  const sourcingRate = input.costCurrency === "JPY" ? 1 : input.sourcingToJpyRate;

  const costJPY = input.costAmount * sourcingRate;
  const intlShippingJPY = input.jpyToKrwRate > 0 ? input.intlShippingKRW / input.jpyToKrwRate : 0;
  const domesticShippingJPY = input.jpyToKrwRate > 0 ? input.domesticShippingKRW / input.jpyToKrwRate : 0;
  const packagingJPY = input.jpyToKrwRate > 0 ? input.packagingKRW / input.jpyToKrwRate : 0;

  const isDutyFree = input.sellingPriceJPY <= DUTY_FREE_THRESHOLD_JPY;
  const customsDutyJPY = isDutyFree ? 0 : costJPY * DUTY_RATE;

  const buymaFeeJPY = input.sellingPriceJPY * (input.buymaFeeRatePercent / 100);

  const totalCostJPY = costJPY + intlShippingJPY + domesticShippingJPY + packagingJPY + customsDutyJPY;
  const receivedAmountJPY = input.sellingPriceJPY - buymaFeeJPY;

  const netProfitJPY = receivedAmountJPY - totalCostJPY;
  const netProfitKRW = netProfitJPY * input.jpyToKrwRate;

  const profitMarginPercent = input.sellingPriceJPY > 0 ? (netProfitJPY / input.sellingPriceJPY) * 100 : 0;
  const roiPercent = totalCostJPY > 0 ? (netProfitJPY / totalCostJPY) * 100 : 0;

  return {
    costJPY,
    intlShippingJPY,
    domesticShippingJPY,
    packagingJPY,
    customsDutyJPY,
    buymaFeeJPY,
    totalCostJPY,
    receivedAmountJPY,
    netProfitJPY,
    netProfitKRW,
    profitMarginPercent,
    roiPercent,
    isDutyFree,
  };
}
