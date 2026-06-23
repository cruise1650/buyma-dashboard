"use client";

import { useState } from "react";
import { SOURCING_TABS, type SourcingTab } from "@/lib/sourcing";

export default function SourcingResearch() {
  const [activeTab, setActiveTab] = useState<SourcingTab>(SOURCING_TABS[0].id);
  const [inputs, setInputs] = useState<Record<SourcingTab, Record<string, string>>>(() =>
    Object.fromEntries(SOURCING_TABS.map((t) => [t.id, {}])) as Record<SourcingTab, Record<string, string>>
  );
  const [results, setResults] = useState<Record<SourcingTab, string>>(() =>
    Object.fromEntries(SOURCING_TABS.map((t) => [t.id, ""])) as Record<SourcingTab, string>
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tabConfig = SOURCING_TABS.find((t) => t.id === activeTab)!;
  const currentInput = inputs[activeTab];
  const currentResult = results[activeTab];

  function setField(key: string, value: string) {
    setInputs((prev) => ({ ...prev, [activeTab]: { ...prev[activeTab], [key]: value } }));
  }

  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tab: activeTab, input: currentInput }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "분석에 실패했습니다.");
      }
      setResults((prev) => ({ ...prev, [activeTab]: data.result }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "분석 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-50">소싱 리서치 도구</h1>
        <p className="text-sm text-zinc-500">조건을 입력하고 AI 분석을 요청하세요.</p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-3">
        {SOURCING_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id);
              setError(null);
            }}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-emerald-500 text-black"
                : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <section className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <p className="text-sm text-zinc-400">{tabConfig.description}</p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {tabConfig.fields.map((field) => (
            <div
              key={field.key}
              className={`flex flex-col gap-1.5 ${field.type === "textarea" ? "sm:col-span-2" : ""}`}
            >
              <span className="text-sm font-medium text-zinc-300">{field.label}</span>
              {field.type === "textarea" ? (
                <textarea
                  value={currentInput[field.key] ?? ""}
                  onChange={(e) => setField(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  rows={3}
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-zinc-500"
                />
              ) : (
                <input
                  type="text"
                  value={currentInput[field.key] ?? ""}
                  onChange={(e) => setField(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-zinc-500"
                />
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full max-w-xs self-start rounded-lg bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-emerald-400 disabled:opacity-50"
        >
          {loading ? "분석 중..." : "AI 분석 요청"}
        </button>

        {error && <p className="text-sm text-red-400">{error}</p>}
      </section>

      {currentResult && (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="mb-3 text-base font-semibold text-zinc-100">분석 결과</h2>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">{currentResult}</div>
        </section>
      )}
    </div>
  );
}
