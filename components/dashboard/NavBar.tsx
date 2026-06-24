"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getInquiries } from "@/lib/dashboardStorage";

const TABS = [
  { href: "/dashboard", label: "대시보드" },
  { href: "/dashboard/orders/new", label: "주문등록" },
  { href: "/dashboard/orders", label: "주문목록" },
  { href: "/dashboard/inventory", label: "재고관리" },
  { href: "/dashboard/inquiries", label: "문의관리" },
];

export default function NavBar() {
  const pathname = usePathname();
  const [unanswered, setUnanswered] = useState(0);

  useEffect(() => {
    const update = () => {
      setUnanswered(getInquiries().filter((i) => i.status === "미답변").length);
    };
    update();
    window.addEventListener("storage", update);
    window.addEventListener("dashboard-data-changed", update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("dashboard-data-changed", update);
    };
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-10 w-full border-b border-neutral-800 bg-black/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3">
        <span className="mr-4 text-base font-bold text-white">바이마 대시보드</span>
        <div className="flex flex-wrap gap-1">
          {TABS.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`relative rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-emerald-500/20 text-emerald-300"
                    : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
                }`}
              >
                {tab.label}
                {tab.label === "문의관리" && unanswered > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unanswered}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
