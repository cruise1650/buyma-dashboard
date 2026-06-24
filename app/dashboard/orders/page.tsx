"use client";

import { useEffect, useMemo, useState } from "react";
import { getOrders, saveOrders } from "@/lib/dashboardStorage";
import type { Order, OrderStatus } from "@/lib/dashboardTypes";

const STATUSES: OrderStatus[] = ["결제대기", "소싱중", "배송중", "완료", "취소"];

function fmt(n: number) {
  return Math.round(n).toLocaleString("ko-KR");
}

const STATUS_STYLE: Record<OrderStatus, string> = {
  결제대기: "bg-neutral-700 text-neutral-200",
  소싱중: "bg-amber-500/20 text-amber-300",
  배송중: "bg-blue-500/20 text-blue-300",
  완료: "bg-emerald-500/20 text-emerald-300",
  취소: "bg-red-500/20 text-red-300",
};

export default function OrdersListPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "전체">("전체");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setOrders(getOrders());
  }, []);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== "전체" && o.status !== statusFilter) return false;
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return o.productName.toLowerCase().includes(q) || o.brand.toLowerCase().includes(q);
    });
  }, [orders, statusFilter, search]);

  function updateStatus(id: string, status: OrderStatus) {
    const next = orders.map((o) => (o.id === id ? { ...o, status } : o));
    setOrders(next);
    saveOrders(next);
  }

  function remove(id: string) {
    const next = orders.filter((o) => o.id !== id);
    setOrders(next);
    saveOrders(next);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold">주문 목록</h1>

      <div className="flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "전체")}
          className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
        >
          <option value="전체">전체 상태</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="상품명 또는 브랜드 검색"
          className="flex-1 min-w-[200px] rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-neutral-800">
        <table className="w-full min-w-[800px] text-sm">
          <thead className="bg-neutral-900 text-left text-xs uppercase text-neutral-400">
            <tr>
              <th className="px-3 py-2">상품명</th>
              <th className="px-3 py-2">브랜드</th>
              <th className="px-3 py-2">판매가(JPY)</th>
              <th className="px-3 py-2">순이익(KRW)</th>
              <th className="px-3 py-2">상태</th>
              <th className="px-3 py-2">바이어</th>
              <th className="px-3 py-2">액션</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {filtered.map((o) => (
              <tr key={o.id}>
                <td className="px-3 py-2">{o.productName}</td>
                <td className="px-3 py-2 text-neutral-400">{o.brand}</td>
                <td className="px-3 py-2">¥{fmt(o.sellingPriceJPY)}</td>
                <td className={`px-3 py-2 font-semibold ${o.netProfitKRW >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  ₩{fmt(o.netProfitKRW)}
                </td>
                <td className="px-3 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[o.status]}`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-neutral-400">{o.buyerName}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value as OrderStatus)}
                      className="rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1 text-xs"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => remove(o.id)}
                      className="rounded-md border border-red-500/40 px-2 py-1 text-xs text-red-300 hover:bg-red-500/10"
                    >
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-neutral-500">
                  주문이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
