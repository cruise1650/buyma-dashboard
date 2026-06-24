"use client";

import { useEffect, useState } from "react";
import { getInventory, makeId, saveInventory } from "@/lib/dashboardStorage";
import type { InventoryItem } from "@/lib/dashboardTypes";

function fmt(n: number) {
  return Math.round(n).toLocaleString("ko-KR");
}

const inputClass =
  "w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-emerald-500";

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);

  const [productName, setProductName] = useState("");
  const [brand, setBrand] = useState("");
  const [variant, setVariant] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [minQuantity, setMinQuantity] = useState(1);
  const [sourcingCostKRW, setSourcingCostKRW] = useState(0);
  const [location, setLocation] = useState("");

  useEffect(() => {
    setItems(getInventory());
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const item: InventoryItem = {
      id: makeId(),
      productName,
      brand,
      variant,
      quantity,
      minQuantity,
      sourcingCostKRW,
      location,
      createdAt: new Date().toISOString(),
    };
    const next = [item, ...items];
    setItems(next);
    saveInventory(next);
    setProductName("");
    setBrand("");
    setVariant("");
    setQuantity(0);
    setMinQuantity(1);
    setSourcingCostKRW(0);
    setLocation("");
  }

  function changeQuantity(id: string, delta: number) {
    const next = items.map((it) => (it.id === id ? { ...it, quantity: Math.max(0, it.quantity + delta) } : it));
    setItems(next);
    saveInventory(next);
  }

  function remove(id: string) {
    const next = items.filter((it) => it.id !== id);
    setItems(next);
    saveInventory(next);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-bold">재고 관리</h1>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-lg border border-neutral-800 bg-neutral-900/40 p-5 sm:grid-cols-3"
      >
        <label className="space-y-1 sm:col-span-1">
          <span className="text-xs font-medium text-neutral-400">상품명</span>
          <input required value={productName} onChange={(e) => setProductName(e.target.value)} className={inputClass} />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-neutral-400">브랜드</span>
          <input value={brand} onChange={(e) => setBrand(e.target.value)} className={inputClass} />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-neutral-400">사이즈/옵션</span>
          <input value={variant} onChange={(e) => setVariant(e.target.value)} className={inputClass} />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-neutral-400">현재 재고 수량</span>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className={inputClass}
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-neutral-400">최소 재고 알림 수량</span>
          <input
            type="number"
            value={minQuantity}
            onChange={(e) => setMinQuantity(Number(e.target.value))}
            className={inputClass}
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-neutral-400">소싱 원가 (KRW)</span>
          <input
            type="number"
            value={sourcingCostKRW}
            onChange={(e) => setSourcingCostKRW(Number(e.target.value))}
            className={inputClass}
          />
        </label>
        <label className="space-y-1 sm:col-span-2">
          <span className="text-xs font-medium text-neutral-400">보관위치/메모</span>
          <input value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} />
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full rounded-md bg-emerald-500 py-2.5 font-semibold text-black hover:bg-emerald-400"
          >
            재고 등록
          </button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-lg border border-neutral-800">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="bg-neutral-900 text-left text-xs uppercase text-neutral-400">
            <tr>
              <th className="px-3 py-2">상품명</th>
              <th className="px-3 py-2">브랜드</th>
              <th className="px-3 py-2">사이즈</th>
              <th className="px-3 py-2">재고</th>
              <th className="px-3 py-2">원가</th>
              <th className="px-3 py-2">상태</th>
              <th className="px-3 py-2">삭제</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {items.map((it) => {
              const low = it.quantity <= it.minQuantity;
              return (
                <tr key={it.id}>
                  <td className="px-3 py-2">{it.productName}</td>
                  <td className="px-3 py-2 text-neutral-400">{it.brand}</td>
                  <td className="px-3 py-2 text-neutral-400">{it.variant}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => changeQuantity(it.id, -1)}
                        className="rounded-md border border-neutral-700 px-2 text-xs hover:bg-neutral-800"
                      >
                        -
                      </button>
                      <span className="w-6 text-center">{it.quantity}</span>
                      <button
                        onClick={() => changeQuantity(it.id, 1)}
                        className="rounded-md border border-neutral-700 px-2 text-xs hover:bg-neutral-800"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-2">₩{fmt(it.sourcingCostKRW)}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        low ? "bg-red-500/20 text-red-300" : "bg-emerald-500/20 text-emerald-300"
                      }`}
                    >
                      {low ? "부족" : "정상"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => remove(it.id)}
                      className="rounded-md border border-red-500/40 px-2 py-1 text-xs text-red-300 hover:bg-red-500/10"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-neutral-500">
                  재고가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
