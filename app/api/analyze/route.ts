import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { buildPrompt, SOURCING_TABS, type SourcingTab } from "@/lib/sourcing";

const VALID_TABS = new Set(SOURCING_TABS.map((t) => t.id));

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "서버에 ANTHROPIC_API_KEY가 설정되어 있지 않습니다." },
      { status: 500 }
    );
  }

  let body: { tab?: string; input?: Record<string, string> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "요청 본문이 올바르지 않습니다." }, { status: 400 });
  }

  const tab = body.tab;
  if (!tab || !VALID_TABS.has(tab as SourcingTab)) {
    return NextResponse.json({ error: "유효하지 않은 탭입니다." }, { status: 400 });
  }

  const input = body.input ?? {};
  const prompt = buildPrompt(tab as SourcingTab, input);

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    return NextResponse.json({ result: text });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI 분석 중 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
