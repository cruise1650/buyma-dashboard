"use client";

import { useEffect, useMemo, useState } from "react";
import { calculate, CostCurrency } from "@/lib/calc";
import { fetchRate } from "@/lib/rates";

const CURRENCIES: { value: CostCurrency; label: string }[] = [
  { value: "KRW", label: "KRW ₩" },
  { value: "USD", label: "USD $" },
  { value: "EUR", label: "EUR €" },
  { value: "GBP", label: "GBP £" },
  { value: "JPY", label: "JPY ¥" },
  { value: "CNY", label: "CNY ¥" },
];

const CURRENCY_RATE_HINT: Record<CostCurrency, string> = {
  KRW: "예) KRW→JPY: 1원=0.11엔",
  USD: "예) USD→JPY: 1달러≈155엔",
  EUR: "예) EUR→JPY: 1유로≈163엔",
  GBP: "예) GBP→JPY: 1파운드≈195엔",
  JPY: "JPY는 환율 변환이 필요 없습니다",
  CNY: "예) CNY→JPY: 1위안≈21엔",
};

function formatNumber(n: number, digits = 0) {
  if (!Number.isFinite(n)) return "-";
  return n.toLocaleString("ko-KR", { maximumFractionDigits: digits, minimumFractionDigits: digits });
}

function Field({
  label,
  badge,
  hint,
  children,
}: {
  label: string;
  badge?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-zinc-300">{label}</span>
        {badge && (
          <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-400">{badge}</span>
        )}
      </div>
      {children}
      {hint && <span className="text-xs text-zinc-500">{hint}</span>}
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  suffix,
  step = "any",
}: {
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  step?: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 focus-within:border-zinc-500">
      <input
        type="number"
        step={step}
        value={Number.isFinite(value) ? value : ""}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full bg-transparent text-zinc-100 outline-none"
      />
      {suffix && <span className="shrink-0 text-sm text-zinc-500">{suffix}</span>}
    </div>
  );
}

export default function ProfitCalculator() {
  const [costCurrency, setCostCurrency] = useState<CostCurrency>("KRW");
  const [costAmount, setCostAmount] = useState(50000);
  const [sourcingToJpyRate, setSourcingToJpyRate] = useState(0.11);
  const [jpyToKrwRate, setJpyToKrwRate] = useState(9.1);
  const [intlShippingKRW, setIntlShippingKRW] = useState(30000);
  const [domesticShippingKRW, setDomesticShippingKRW] = useState(3500);
  const [packagingKRW, setPackagingKRW] = useState(2000);
  const [sellingPriceJPY, setSellingPriceJPY] = useState(80000);
  const [buymaFeeRatePercent, setBuymaFeeRatePercent] = useState(7.7);

  const [ratesLoading, setRatesLoading] = useState(false);
  const [ratesError, setRatesError] = useState<string | null>(null);
  const [ratesDate, setRatesDate] = useState<string | null>(null);

  async function refreshRates(currency: CostCurrency) {
    setRatesLoading(true);
    setRatesError(null);
    try {
      const jpyKrw = await fetchRate("JPY", "KRW");
      setJpyToKrwRate(jpyKrw.rate);

      if (currency === "JPY") {
        setRatesDate(jpyKrw.date);
      } else {
        const sourcing = await fetchRate(currency, "JPY");
        setSourcingToJpyRate(sourcing.rate);
        setRatesDate(sourcing.date);
      }
    } catch {
      setRatesError("환율을 불러오지 못했어요. 직접 입력해주세요.");
    } finally {
      setRatesLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: kicks off a live rate fetch on mount/currency change
    refreshRates(costCurrency);
  }, [costCurrency]);

  const result = useMemo(
    () =>
      calculate({
        costCurrency,
        costAmount,
        sourcingToJpyRate,
        jpyToKrwRate,
        intlShippingKRW,
        domesticShippingKRW,
        packagingKRW,
        sellingPriceJPY,
        buymaFeeRatePercent,
      }),
    [
      costCurrency,
      costAmount,
      sourcingToJpyRate,
      jpyToKrwRate,
      intlShippingKRW,
      domesticShippingKRW,
      packagingKRW,
      sellingPriceJPY,
      buymaFeeRatePercent,
    ]
  );

  const profitColor = result.netProfitJPY >= 0 ? "text-emerald-400" : "text-red-400";
  const isJpyCost = costCurrency === "JPY";

  return (
    <div className="flex w-full max-w-5xl flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-50">바이마 리셀러 수익률 계산기</h1>
          <p className="text-sm text-zinc-500">해외 소싱 → 판매가 기준 순이익·수익률 자동 산출</p>
        </div>
        <button
          type="button"
          onClick={() => refreshRates(costCurrency)}
          disabled={ratesLoading}
          title={
            ratesLoading
              ? "최신 환율 불러오는 중..."
              : ratesError
                ? ratesError
                : ratesDate
                  ? `최신 환율 적용됨 (${ratesDate} 기준) — 클릭해서 새로고침`
                  : "환율 새로고침"
          }
          className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 disabled:opacity-50"
        >
          •••
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard label="순이익 (엔화)" value={`¥${formatNumber(result.netProfitJPY)}`} color={profitColor} />
        <SummaryCard label="순이익 (원화 환산)" value={`₩${formatNumber(result.netProfitKRW)}`} color={profitColor} />
        <SummaryCard label="수익률" value={`${formatNumber(result.profitMarginPercent, 1)}%`} color={profitColor} />
        <SummaryCard label="ROI" value={`${formatNumber(result.roiPercent, 1)}%`} color={profitColor} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="flex flex-col gap-5 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-base font-semibold text-zinc-100">소싱 정보</h2>

          <Field label="상품 원가 (소싱 통화)">
            <div className="flex gap-2">
              <NumberInput value={costAmount} onChange={setCostAmount} />
              <select
                value={costCurrency}
                onChange={(e) => setCostCurrency(e.target.value as CostCurrency)}
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-zinc-500"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </Field>

          <Field
            label="환율 (소싱통화 → JPY)"
            hint={isJpyCost ? CURRENCY_RATE_HINT[costCurrency] : ratesLoading ? "최신 환율 불러오는 중..." : "자동으로 최신 환율이 적용됩니다. 직접 수정도 가능해요."}
          >
            <NumberInput
              value={isJpyCost ? 1 : sourcingToJpyRate}
              onChange={setSourcingToJpyRate}
              suffix={`${costCurrency}/JPY`}
              step="0.001"
            />
          </Field>

          <Field
            label="국제 배송비"
            badge="₩ 원화"
            hint={`≈ ¥${formatNumber(result.intlShippingJPY)} (JPY 환산)`}
          >
            <NumberInput value={intlShippingKRW} onChange={setIntlShippingKRW} suffix="원" />
          </Field>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-zinc-300">관세 / 소비세</span>
            <div
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                result.isDutyFree
                  ? "bg-emerald-950 text-emerald-400"
                  : "bg-amber-950 text-amber-400"
              }`}
            >
              {result.isDutyFree ? "면세 — 판매가 ¥16,666 이하" : "관세 10% 적용 — 판매가 ¥16,666 초과"}
            </div>
            {!result.isDutyFree && (
              <span className="text-xs text-zinc-500">
                원가(¥{formatNumber(result.costJPY)})의 10% = ¥{formatNumber(result.customsDutyJPY)}가 비용에 포함됩니다.
              </span>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-5 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-base font-semibold text-zinc-100">판매 정보 (바이마 기준)</h2>

          <Field label="판매가 (JPY)">
            <NumberInput value={sellingPriceJPY} onChange={setSellingPriceJPY} suffix="¥" />
          </Field>

          <Field label="바이마 수수료 (%)" hint="기본 수수료 7.7% (플랜에 따라 조정 가능)">
            <NumberInput value={buymaFeeRatePercent} onChange={setBuymaFeeRatePercent} suffix="%" step="0.1" />
          </Field>

          <Field
            label="JPY → KRW 환율"
            hint={ratesLoading ? "최신 환율 불러오는 중..." : "자동으로 최신 환율이 적용됩니다. 직접 수정도 가능해요."}
          >
            <NumberInput value={jpyToKrwRate} onChange={setJpyToKrwRate} suffix="KRW/JPY" step="0.01" />
          </Field>

          <Field
            label="국내 배송비"
            badge="₩ 원화"
            hint={`≈ ¥${formatNumber(result.domesticShippingJPY)} (JPY 환산)`}
          >
            <NumberInput value={domesticShippingKRW} onChange={setDomesticShippingKRW} suffix="원" />
          </Field>

          <Field
            label="포장·기타 비용"
            badge="₩ 원화"
            hint={`≈ ¥${formatNumber(result.packagingJPY)} (JPY 환산)`}
          >
            <NumberInput value={packagingKRW} onChange={setPackagingKRW} suffix="원" />
          </Field>
        </section>
      </div>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <h2 className="mb-4 text-base font-semibold text-zinc-100">수익 분석 내역</h2>
        <div className="grid grid-cols-1 gap-x-8 gap-y-2 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <ResultRow label="원가 (JPY 환산)" value={`¥${formatNumber(result.costJPY)}`} />
            <ResultRow label="국제 배송비 (₩→¥)" value={`¥${formatNumber(result.intlShippingJPY)}`} />
            <ResultRow label="관세·소비세" value={`¥${formatNumber(result.customsDutyJPY)}`} />
            <ResultRow label="국내 배송비 (₩→¥)" value={`¥${formatNumber(result.domesticShippingJPY)}`} />
            <ResultRow label="포장·기타 (₩→¥)" value={`¥${formatNumber(result.packagingJPY)}`} />
            <ResultRow label="총 원가" value={`¥${formatNumber(result.totalCostJPY)}`} strong />
          </div>

          <div className="flex flex-col gap-2">
            <ResultRow label="판매가" value={`¥${formatNumber(sellingPriceJPY)}`} />
            <ResultRow label="바이마 수수료" value={`-¥${formatNumber(result.buymaFeeJPY)}`} negative />
            <ResultRow label="실 수취액" value={`¥${formatNumber(result.receivedAmountJPY)}`} strong />
          </div>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <span className="text-xs font-medium text-zinc-500">{label}</span>
      <span className={`text-lg font-bold sm:text-xl ${color}`}>{value}</span>
    </div>
  );
}

function ResultRow({
  label,
  value,
  strong,
  negative,
}: {
  label: string;
  value: string;
  strong?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-1 py-1 text-sm">
      <span className="text-zinc-500">{label}</span>
      <span
        className={
          negative
            ? "font-medium text-red-400"
            : strong
              ? "font-semibold text-zinc-100"
              : "text-zinc-300"
        }
      >
        {value}
      </span>
    </div>
  );
}
