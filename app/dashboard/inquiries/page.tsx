"use client";

import { useEffect, useMemo, useState } from "react";
import { getInquiries, makeId, saveInquiries } from "@/lib/dashboardStorage";
import type { Inquiry, InquiryStatus, InquiryType } from "@/lib/dashboardTypes";

const TYPES: InquiryType[] = ["사이즈/옵션", "배송문의", "반품/교환", "가격협상", "기타"];
const STATUSES: InquiryStatus[] = ["미답변", "진행중", "답변완료"];

const STATUS_STYLE: Record<InquiryStatus, string> = {
  미답변: "bg-red-500/20 text-red-300",
  진행중: "bg-amber-500/20 text-amber-300",
  답변완료: "bg-emerald-500/20 text-emerald-300",
};

const inputClass =
  "w-full rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-emerald-500";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | "전체">("전체");
  const [typeFilter, setTypeFilter] = useState<InquiryType | "전체">("전체");
  const [search, setSearch] = useState("");
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [buyerName, setBuyerName] = useState("");
  const [productName, setProductName] = useState("");
  const [type, setType] = useState<InquiryType>("사이즈/옵션");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<InquiryStatus>("미답변");
  const [date, setDate] = useState(today());

  useEffect(() => {
    setInquiries(getInquiries());
  }, []);

  const filtered = useMemo(() => {
    return inquiries.filter((i) => {
      if (statusFilter !== "전체" && i.status !== statusFilter) return false;
      if (typeFilter !== "전체" && i.type !== typeFilter) return false;
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        i.buyerName.toLowerCase().includes(q) ||
        i.productName.toLowerCase().includes(q) ||
        i.content.toLowerCase().includes(q)
      );
    });
  }, [inquiries, statusFilter, typeFilter, search]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const inquiry: Inquiry = {
      id: makeId(),
      buyerName,
      productName,
      type,
      content,
      status,
      date,
      aiReply: "",
      createdAt: new Date().toISOString(),
    };
    const next = [inquiry, ...inquiries];
    setInquiries(next);
    saveInquiries(next);
    setBuyerName("");
    setProductName("");
    setType("사이즈/옵션");
    setContent("");
    setStatus("미답변");
    setDate(today());
  }

  function updateInquiry(id: string, patch: Partial<Inquiry>) {
    const next = inquiries.map((i) => (i.id === id ? { ...i, ...patch } : i));
    setInquiries(next);
    saveInquiries(next);
  }

  function remove(id: string) {
    const next = inquiries.filter((i) => i.id !== id);
    setInquiries(next);
    saveInquiries(next);
  }

  async function generateReply(inquiry: Inquiry) {
    setGeneratingId(inquiry.id);
    try {
      const prompt = `바이마 해외구매대행 셀러로서 아래 바이어 문의에 일본어로 정중하게 2~4문장 답변해줘.\n문의유형: ${inquiry.type}, 상품: ${inquiry.productName}, 내용: ${inquiry.content}`;
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "답변 생성에 실패했습니다.");
      updateInquiry(inquiry.id, { aiReply: data.text });
    } catch (err) {
      updateInquiry(inquiry.id, {
        aiReply: err instanceof Error ? `오류: ${err.message}` : "답변 생성 중 오류가 발생했습니다.",
      });
    } finally {
      setGeneratingId(null);
    }
  }

  async function copyReply(inquiry: Inquiry) {
    await navigator.clipboard.writeText(inquiry.aiReply);
    setCopiedId(inquiry.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-bold">문의 관리</h1>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-lg border border-neutral-800 bg-neutral-900/40 p-5 sm:grid-cols-2"
      >
        <label className="space-y-1">
          <span className="text-xs font-medium text-neutral-400">바이어 이름</span>
          <input required value={buyerName} onChange={(e) => setBuyerName(e.target.value)} className={inputClass} />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-neutral-400">관련 상품명</span>
          <input value={productName} onChange={(e) => setProductName(e.target.value)} className={inputClass} />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-neutral-400">문의 유형</span>
          <select value={type} onChange={(e) => setType(e.target.value as InquiryType)} className={inputClass}>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-neutral-400">문의 상태</span>
          <select value={status} onChange={(e) => setStatus(e.target.value as InquiryStatus)} className={inputClass}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 sm:col-span-2">
          <span className="text-xs font-medium text-neutral-400">문의 내용</span>
          <textarea
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className={inputClass}
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-neutral-400">문의 날짜</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
        </label>
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full rounded-md bg-emerald-500 py-2.5 font-semibold text-black hover:bg-emerald-400"
          >
            문의 등록
          </button>
        </div>
      </form>

      <div className="flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as InquiryStatus | "전체")}
          className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
        >
          <option value="전체">전체 상태</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as InquiryType | "전체")}
          className="rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
        >
          <option value="전체">전체 유형</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="바이어/상품/내용 검색"
          className="flex-1 min-w-[200px] rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-3">
        {filtered.map((i) => (
          <div key={i.id} className="space-y-3 rounded-lg border border-neutral-800 bg-neutral-900/40 p-4">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold">{i.buyerName}</span>
              <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-xs text-neutral-300">{i.type}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[i.status]}`}>
                {i.status}
              </span>
              <span className="text-xs text-neutral-500">{i.date}</span>
            </div>
            {i.productName && <p className="text-sm text-neutral-400">관련 상품: {i.productName}</p>}
            <p className="text-sm text-neutral-200">{i.content}</p>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={i.status}
                onChange={(e) => updateInquiry(i.id, { status: e.target.value as InquiryStatus })}
                className="rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1 text-xs"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button
                onClick={() => generateReply(i)}
                disabled={generatingId === i.id}
                className="rounded-md border border-emerald-500/40 px-3 py-1 text-xs font-medium text-emerald-300 hover:bg-emerald-500/10 disabled:opacity-50"
              >
                {generatingId === i.id ? "생성 중..." : "AI 일본어 답변 생성"}
              </button>
              <button
                onClick={() => remove(i.id)}
                className="rounded-md border border-red-500/40 px-3 py-1 text-xs text-red-300 hover:bg-red-500/10"
              >
                삭제
              </button>
            </div>

            {i.aiReply && (
              <div className="space-y-2 rounded-md border border-neutral-800 bg-neutral-950 p-3">
                <p className="whitespace-pre-wrap text-sm text-neutral-200">{i.aiReply}</p>
                <button
                  onClick={() => copyReply(i)}
                  className="rounded-md border border-neutral-700 px-2 py-1 text-xs hover:bg-neutral-800"
                >
                  {copiedId === i.id ? "복사됨!" : "복사"}
                </button>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <p className="py-8 text-center text-neutral-500">문의가 없습니다.</p>}
      </div>
    </div>
  );
}
