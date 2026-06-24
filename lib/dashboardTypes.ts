export type OrderStatus = "결제대기" | "소싱중" | "배송중" | "완료" | "취소";

export interface Order {
  id: string;
  productName: string;
  brand: string;
  sourcingCostKRW: number;
  sellingPriceJPY: number;
  jpyToKrwRate: number;
  intlShippingKRW: number;
  domesticShippingKRW: number;
  buymaFeePercent: number;
  buyerName: string;
  status: OrderStatus;
  memo: string;
  customsDutyKRW: number;
  totalCostKRW: number;
  netProfitKRW: number;
  profitMarginPercent: number;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  productName: string;
  brand: string;
  variant: string;
  quantity: number;
  minQuantity: number;
  sourcingCostKRW: number;
  location: string;
  createdAt: string;
}

export type InquiryType = "사이즈/옵션" | "배송문의" | "반품/교환" | "가격협상" | "기타";
export type InquiryStatus = "미답변" | "진행중" | "답변완료";

export interface Inquiry {
  id: string;
  buyerName: string;
  productName: string;
  type: InquiryType;
  content: string;
  status: InquiryStatus;
  date: string;
  aiReply: string;
  createdAt: string;
}
