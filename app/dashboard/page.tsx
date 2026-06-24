"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getInquiries, getInventory, getOrders } from "@/lib/dashboardStorage";
import type { Inquiry, InventoryItem, Order } from "@/lib/dashboardTypes";

function fmt(n: number) {
  return Math.round(n).toLocaleString("ko-KR");
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  useEffect(() => {
    setOrders(getOrders());
    setInventory(getInventory());
    setInquiries(getInquiries());
  }, []);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const inProgress = orders.filter((o) => o.status !== "완료" && o.status !== "취소").length;

    const now = new Date();
    const monthlyProfit = orders
      .filter((o) => {
        if (o.status !== "완료") return false;
        const d = new Date(o.createdAt);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      })
      .reduce((sum, o) => sum + o.netProfitKRW, 0);

    const avgMargin =
      orders.length > 0 ? orders.reduce((sum, o) => sum + o.profitMarginPercent, 0) / orders.length : 0;

    const unanswered = inquiries.filter((i) => i.status === "미답변").length;

    return { totalOrders, inProgress, monthlyProfit, avgMargin, unanswered };
  }, [orders, inquiries]);

  const recentOrders = orders.slice(0, 4);
  const recentInquiries = inquiries.filter((i) => i.status === "미답변").slice(0, 3);
  const lowStock = inventory.filter((it) => it.quantity <= it.minQuantity);

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-bold">대시보드</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard label="총 주문 수" value={`${stats.totalOrders}건`} />
        <StatCard label="진행 중" value={`${stats.inProgress}건`} />
        <StatCard
          label="이번 달 순이익"
          value={`₩${fmt(stats.monthlyProfit)}`}
          highlight={stats.monthlyProfit >= 0 ? "text-emerald-400" : "text-red-400"}
        />
        <StatCard label="평균 수익률" value={`${stats.avgMargin.toFixed(1)}%`} />
        <StatCard label="미답변 문의 수" value={`${stats.unanswered}건`} highlight="text-red-400" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="space-y-2 rounded-lg border border-neutral-800 bg-neutral-900/40 p-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-300">최근 주문</h2>
            <Link href="/dashboard/orders" className="text-xs text-emerald-400 hover:text-emerald-300">
              전체보기 →
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-neutral-500">
              <tr>
                <th className="py-1">상품명</th>
                <th className="py-1">판매가(JPY)</th>
                <th className="py-1">순이익(KRW)</th>
                <th className="py-1">상태</th>
                <th className="py-1">등록일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {recentOrders.map((o) => (
                <tr key={o.id}>
                  <td className="py-1.5">{o.productName}</td>
                  <td className="py-1.5">¥{fmt(o.sellingPriceJPY)}</td>
                  <td className={`py-1.5 ${o.netProfitKRW >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    ₩{fmt(o.netProfitKRW)}
                  </td>
                  <td className="py-1.5">{o.status}</td>
                  <td className="py-1.5 text-neutral-500">{o.createdAt.slice(0, 10)}</td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-neutral-500">
                    주문이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="space-y-2 rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-300">미답변 문의</h2>
            <Link href="/dashboard/inquiries" className="text-xs text-emerald-400 hover:text-emerald-300">
              전체보기 →
            </Link>
          </div>
          <ul className="space-y-2 text-sm">
            {recentInquiries.map((i) => (
              <li key={i.id} className="rounded-md border border-neutral-800 p-2">
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span className="font-medium text-neutral-300">
                    {i.buyerName} · {i.type}
                  </span>
                  <span>{i.date}</span>
                </div>
                <p className="mt-1 text-neutral-300">{i.content.slice(0, 40)}</p>
              </li>
            ))}
            {recentInquiries.length === 0 && <li className="py-4 text-center text-neutral-500">없음</li>}
          </ul>
        </section>
      </div>

      <section className="space-y-2 rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-300">재고 부족 알림</h2>
          <Link href="/dashboard/inventory" className="text-xs text-emerald-400 hover:text-emerald-300">
            전체보기 →
          </Link>
        </div>
        <ul className="flex flex-wrap gap-2 text-sm">
          {lowStock.map((it) => (
            <li
              key={it.id}
              className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-red-300"
            >
              {it.productName} {it.variant && `(${it.variant})`} — 재고 {it.quantity}
            </li>
          ))}
          {lowStock.length === 0 && <li className="py-2 text-neutral-500">부족한 재고가 없습니다.</li>}
        </ul>
      </section>
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: string }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className={`mt-1 text-lg font-bold ${highlight ?? "text-neutral-100"}`}>{value}</p>
    </div>
  );
}
