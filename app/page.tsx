import ProfitCalculator from "@/components/ProfitCalculator";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-black px-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-bold text-zinc-50">바이마 수익률 계산기</h1>
        <p className="text-sm text-zinc-500">원가, 배송비, 관세, 수수료를 입력하면 실시간으로 순이익을 계산합니다.</p>
      </div>
      <ProfitCalculator />
    </div>
  );
}
