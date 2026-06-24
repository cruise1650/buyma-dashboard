"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getOrders, makeId, saveOrders } from "@/lib/dashboardStorage";
import { calculateOrder } from "@/lib/orderCalc";
import type { Order, OrderStatus } from "@/lib/dashboardTypes";

const STATUSES: OrderStatus[] = ["결제대기", "소싱중", "배송중", "완료", "취소"];

function fmt(n: number) {
  return Math.round(n).toLocaleString("ko-KR");
}

export default function NewOrderPage() {
  const router = useRouter();

  const [productName, setProductName] = useState("");
  const [brand, setBrand] = useState("");
  const [sourcingCostKRW, setSourcingCostKRW] = useState(0);
  const [sellingPriceJPY, setSellingPriceJPY] = useState(0);
  const [jpyToKrwRate, setJpyToKrwRate] = useState(9.1);
  const [intlShippingKRW, setIntlShippingKRW] = useState(0);
  const [domesticShippingKRW, setDomesticShippingKRW] = useState(0);
  const [buymaFeePercent, setBuymaFeePercent] = useState(7.7);
  const [buyerName, setBuyerName] = useState("");
  const [status, setStatus] = useState<OrderStatus>("결제대기");
  const [memo, setMemo] = useState("");

  const calc = useMemo(
    () =>
      calculateOrder({
        sourcingCostKRW,
        sellingPriceJPY,
        jpyToKrwRate,
        intlShippingKRW,
        domesticShippingKRW,
        buymaFeePercent,
      }),
    [sourcingCostKRW, sellingPriceJPY, jpyToKrwRate, intlShippingKRW, domesticShippingKRW, buymaFeePercent]
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const order: Order = {
      id: makeId(),
      productName,
      brand,
      sourcingCostKRW,
      sellingPriceJPY,
      jpyToKrwRate,
      intlShippingKRW,
      domesticShippingKRW,
      buymaFeePercent,
      buyerName,
      status,
      memo,
      customsDutyKRW: calc.customsDutyKRW,
      totalCostKRW: calc.totalCostKRW,
      netProfitKRW: calc.netProfitKRW,
      profitMarginPercent: calc.profitMarginPercent,
      createdAt: new Date().toISOString(),
    };
    saveOrders([order, ...getOrders()]);
    router.push("/dashboard/orders");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-neutral-800 bg-neutral-900/40 p-5">
        <h1 className="text-lg font-bold">주문 등록</h1>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="상품명">
            <input
              required
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="브랜드">
            <input value={brand} onChange={(e) => setBrand(e.target.value)} className={inputClass} />
          </Field>
          <Field label="소싱 원가 (KRW)">
            <input
              type="number"
              value={sourcingCostKRW}
              onChange={(e) => setSourcingCostKRW(Number(e.target.value))}
              className={inputClass}
            />
          </Field>
          <Field label="판매가 (JPY)">
            <input
              type="number"
              value={sellingPriceJPY}
              onChange={(e) => setSellingPriceJPY(Number(e.target.value))}
              className={inputClass}
            />
          </Field>
          <Field label="JPY→KRW 환율">
            <input
              type="number"
              step="0.01"
              value={jpyToKrwRate}
              onChange={(e) => setJpyToKrwRate(Number(e.target.value))}
              className={inputClass}
            />
          </Field>
          <Field label="바이마 수수료 (%)">
            <input
              type="number"
              step="0.1"
              value={buymaFeePercent}
              onChange={(e) => setBuymaFeePercent(Number(e.target.value))}
              className={inputClass}
            />
          </Field>
          <Field label="국제 배송비 (KRW)">
            <input
              type="number"
              value={intlShippingKRW}
              onChange={(e) => setIntlShippingKRW(Number(e.target.value))}
              className={inputClass}
            />
          </Field>
          <Field label="국내 배송비 (KRW)">
            <input
              type="number"
              value={domesticShippingKRW}
              onChange={(e) => setDomesticShippingKRW(Number(e.target.value))}
              className={inputClass}
            />
          </Field>
          <Field label="바이어 이름">
            <input value={buyerName} onChange={(e) => setBuyerName(e.target.value)} className={inputClass} />
          </Field>
          <Field label="주문 상태">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              className={inputClass}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="메모">
          <textarea value={memo} onChange={(e) => setMemo(e.target.value)} rows={3} className={inputClass} />
        </Field>

        <button
          type="submit"
          className="w-full rounded-md bg-emerald-500 py-2.5 font-semibold text-black hover:bg-emerald-400"
        >
          주문 등록
        </button>
      </form>

      <aside className="h-fit space-y-3 rounded-lg border border-neutral-800 bg-neutral-900/40 p-5">
        <h2 className="text-sm font-semibold text-neutral-300">수익 미리보기</h2>
        <Row label="판매가 (KRW 환산)" value={`₩${fmt(calc.sellingPriceKRW)}`} />
        <Row label="관세" value={calc.isDutyFree ? "면세" : `₩${fmt(calc.customsDutyKRW)}`} />
        <Row label="바이마 수수료" value={`₩${fmt(calc.buymaFeeKRW)}`} />
        <Row label="총 비용" value={`₩${fmt(calc.totalCostKRW)}`} />
        <hr className="border-neutral-800" />
        <Row
          label="순이익"
          value={`₩${fmt(calc.netProfitKRW)}`}
          highlight={calc.netProfitKRW >= 0 ? "text-emerald-400" : "text-red-400"}
        />
        <Row
          label="수익률"
          value={`${calc.profitMarginPercent.toFixed(1)}%`}
          highlight={calc.netProfitKRW >= 0 ? "text-emerald-400" : "text-red-400"}
        />
      </aside>
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-emerald-500";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-neutral-400">{label}</span>
      {children}
    </label>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-neutral-400">{label}</span>
      <span className={`font-semibold ${highlight ?? "text-neutral-100"}`}>{value}</span>
    </div>
  );
}
