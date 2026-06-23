export type SourcingTab = "trend" | "competitor" | "sourcing" | "keyword";

export interface SourcingField {
  key: string;
  label: string;
  placeholder: string;
  type?: "text" | "textarea";
}

export interface SourcingTabConfig {
  id: SourcingTab;
  label: string;
  description: string;
  fields: SourcingField[];
}

export const SOURCING_TABS: SourcingTabConfig[] = [
  {
    id: "trend",
    label: "트렌드발굴",
    description: "바이마에서 잘 팔릴 만한 신규 트렌드 아이템을 발굴합니다.",
    fields: [
      { key: "category", label: "카테고리", placeholder: "예) 여성 가방, 남성 아웃도어" },
      { key: "targetMarket", label: "타겟 시장/연령대", placeholder: "예) 20-30대 여성, 한국 거주" },
      { key: "budget", label: "예산대 (원가 기준)", placeholder: "예) 10만원~30만원" },
      { key: "notes", label: "추가 조건", placeholder: "예) 일본 현지 한정판 선호", type: "textarea" },
    ],
  },
  {
    id: "competitor",
    label: "경쟁분석",
    description: "특정 상품·셀러의 경쟁 구도를 분석합니다.",
    fields: [
      { key: "productOrSeller", label: "상품명 또는 셀러명", placeholder: "예) 메종마르지엘라 카드케이스" },
      { key: "priceRange", label: "판매가 범위 (JPY)", placeholder: "예) ¥15,000 ~ ¥25,000" },
      { key: "notes", label: "추가 조건", placeholder: "예) 상위 5개 셀러 위주로 분석", type: "textarea" },
    ],
  },
  {
    id: "sourcing",
    label: "소싱처추천",
    description: "원하는 상품의 소싱 채널과 루트를 추천받습니다.",
    fields: [
      { key: "product", label: "상품명/브랜드", placeholder: "예) 폴로 랄프로렌 니트" },
      { key: "originCountry", label: "선호 소싱 국가", placeholder: "예) 미국, 유럽, 일본" },
      { key: "quantity", label: "예상 소싱 수량/주기", placeholder: "예) 월 5~10개" },
      { key: "notes", label: "추가 조건", placeholder: "예) 정품 인증 가능한 채널 우선", type: "textarea" },
    ],
  },
  {
    id: "keyword",
    label: "키워드전략",
    description: "바이마 노출을 위한 검색 키워드 전략을 제안받습니다.",
    fields: [
      { key: "product", label: "상품명/카테고리", placeholder: "예) 구찌 GG 마몬트 숄더백" },
      { key: "currentKeywords", label: "현재 사용 중인 키워드", placeholder: "예) 구찌 가방, 명품 숄더백" },
      { key: "notes", label: "추가 조건", placeholder: "예) 일본어 검색 키워드도 포함", type: "textarea" },
    ],
  },
];

export function buildPrompt(tab: SourcingTab, input: Record<string, string>): string {
  const lines = Object.entries(input)
    .filter(([, v]) => v && v.trim())
    .map(([k, v]) => `- ${k}: ${v}`)
    .join("\n");

  const intros: Record<SourcingTab, string> = {
    trend:
      "당신은 일본 패션 리셀 플랫폼 '바이마(BUYMA)' 소싱 전문가입니다. 아래 조건을 바탕으로 잘 팔릴 만한 트렌드 아이템 후보를 구체적으로 발굴해주세요. 각 후보마다 추천 이유, 예상 수요, 주의할 점을 포함해주세요.",
    competitor:
      "당신은 바이마 셀러를 위한 경쟁분석 전문가입니다. 아래 상품/셀러 조건을 바탕으로 경쟁 구도, 가격대, 차별화 포인트, 진입 난이도를 분석해주세요.",
    sourcing:
      "당신은 바이마 셀러를 위한 소싱 루트 전문가입니다. 아래 조건을 바탕으로 신뢰할 수 있는 소싱처와 구체적인 루트(현지 매장, 아울렛, 온라인 채널 등)를 추천해주세요. 정품 확인 방법과 리스크도 함께 안내해주세요.",
    keyword:
      "당신은 바이마 SEO/키워드 전략 전문가입니다. 아래 조건을 바탕으로 검색 노출에 효과적인 키워드 조합(한국어/일본어 포함)과 상품명·태그 작성 전략을 제안해주세요.",
  };

  return `${intros[tab]}\n\n[입력 조건]\n${lines || "(추가 입력 없음)"}\n\n한국어로 답변하고, 실행 가능한 항목 위주로 정리해주세요.`;
}
