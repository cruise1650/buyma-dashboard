import Link from "next/link";
import ProfitCalculator from "@/components/ProfitCalculator";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-black px-4 py-8">
      <div className="mb-4 w-full max-w-5xl">
        <Link
          href="/sourcing"
          className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
        >
          소싱 리서치 도구 →
        </Link>
      </div>
      <ProfitCalculator />
    </div>
  );
}
