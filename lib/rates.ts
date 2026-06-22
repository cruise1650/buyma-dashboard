export interface RateResult {
  rate: number;
  date: string;
}

export async function fetchRate(from: string, to: string): Promise<RateResult> {
  if (from === to) return { rate: 1, date: new Date().toISOString().slice(0, 10) };

  const res = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`);
  if (!res.ok) throw new Error(`Failed to fetch rate ${from}->${to}`);

  const data: { date: string; rates: Record<string, number> } = await res.json();
  const rate = data.rates[to];
  if (typeof rate !== "number") throw new Error(`No rate for ${from}->${to}`);

  return { rate, date: data.date };
}
