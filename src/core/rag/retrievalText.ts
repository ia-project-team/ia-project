type RetrievalTextRecord = {
  legalCategory: string;
  issue: string | null;
  question: string;
  answer: string | null;
  recordType?: string;
  applicabilityGate?: string[];
  userSignals?: string[];
  targetFact?: string;
  whyMaterial?: string;
  statutes?: string[];
};

const RECORD_TYPE_LABELS: Record<string, string> = {
  guidance: "법률 안내",
  standard_qa: "표준 질의응답",
  provider_faq: "기관 질의응답",
  question_trigger: "추가 확인 질문",
  mediation_case: "분쟁조정 사례",
};

export const APPLICABILITY_GATE_TERMS: Record<string, string[]> = {
  auction_or_public_sale: ["경매", "공매", "매각", "배당", "강제경매"],
  leasehold_registration: ["임차권등기", "임차권등기명령", "이사", "퇴거", "대항력"],
  tax_or_seizure: ["국세", "지방세", "세금", "체납", "압류", "세무서"],
  broker_involved: ["공인중개사", "중개사", "중개보조원", "중개", "부동산"],
  return_guarantee: ["전세보증금반환보증", "반환보증", "보증이행", "HUG", "HF", "SGI"],
  trust_property: ["신탁", "신탁회사", "수탁자", "위탁자"],
  multi_tenant_property: ["다가구", "다세대", "공동담보", "선순위임차인", "다수 임차인"],
  restoration_deduction: ["원상회복", "수리비", "수선", "공제", "시설 고장"],
  landlord_insolvency: ["임대인 파산", "임대인 회생", "채무불이행", "지급불능"],
  landlord_death_or_inheritance: ["임대인 사망", "상속인", "상속", "상속포기"],
  jeonse_loan: ["전세대출", "대출", "질권", "채권양도"],
  new_tenant_condition: ["새 세입자", "후속 임차인", "새로운 임차인"],
  auction_completed: ["경매 종료", "공매 종료", "낙찰 후", "매각 완료"],
  auction_or_public_sale_started: ["경매개시결정", "공매 개시", "매각기일", "배당요구"],
  considering_criminal_complaint: ["형사고소", "사기 고소", "무고 맞고소", "기망 정황"],
  considering_forced_auction: ["직접 경매 신청", "강제경매 신청", "보증금 반환 강제집행"],
  considering_litigation: ["소송비용", "변호사 비용", "법률구조 지원"],
  considering_self_purchase: ["피해주택 직접 낙찰", "피해주택 인수", "깡통주택 매수"],
  deposit_unreturned: ["보증금 미반환", "보증금을 돌려받지 못", "보증금이 안 돌아"],
  distribution_shortfall: ["배당 부족", "배당표상 부족액", "미회수 보증금", "배당을 거의 못"],
  eviction_requested: ["명도 요구", "퇴거를 요구", "나가라고 한다", "나가라고 했"],
  has_jeonse_loan: ["전세대출", "전세자금대출"],
  has_priority_purchase_right: ["우선매수권"],
  jeonse_loan_delinquent: ["전세대출 연체", "연체정보", "신용점수가 떨어", "카드가 정지"],
  junior_tenant: ["후순위 임차인", "후순위라 배당"],
  landlord_deceased: ["임대인이 사망", "집주인이 사망", "상속인이 누군지 모르", "상속을 포기"],
  landlord_rehabilitation_or_bankruptcy: ["임대인 회생절차", "임대인 파산", "채권 신고 안내"],
  multifamily_house: ["다가구주택", "다가구", "다른 세입자"],
  multiple_affected_tenants: ["피해 임차인이 여러", "다수 피해 임차인", "다른 세입자도 우선매수권"],
  must_move_before_refund: ["보증금 받기 전에 이사", "직장이 멀어졌", "질병 때문에 다른 지역"],
  needs_relocation_funding: ["이사할 자금이 없", "무이자 대출", "새 보증금을 마련하기 어렵"],
  ownership_transfer_proposed: ["보증금 대신 집을 넘", "피해주택을 인수하라", "깡통주택을 매수"],
  owns_other_home: ["이미 주택이 있", "분양권이 있", "유주택자", "무주택 요건을 잃"],
  priority_purchase_assignment_failed: ["우선매수권을 양도하지 못", "LH가 피해주택을 매입하지 않"],
  self_purchase_at_auction: ["피해주택을 직접 낙찰", "내가 낙찰", "자기가 낙찰"],
  senior_tenant: ["선순위인데", "선순위 임차인"],
  suspected_false_prior_deposit_disclosure: ["선순위 보증금을 속", "선순위 보증금을 잘못 설명", "확인설명서 내용과 실제"],
  victim_decision_pending: ["피해자 결정 전", "피해자 결정을 받지 못", "피해자 신청 중"],
};

// 문서 설명용 어휘보다 보수적인 쿼리 감지어를 쓴다. 예를 들어 "장기수선충당금"의
// "수선"을 원상회복·수리비 사건으로 잘못 분류하거나, 단순 "이사"를 모두
// 임차권등기 사건으로 분류하지 않도록 한다.
const APPLICABILITY_GATE_TRIGGERS: Record<string, string[]> = {
  auction_or_public_sale: ["경매", "공매", "강제경매", "매각", "배당"],
  leasehold_registration: ["임차권등기", "임차권등기명령", "대항력"],
  tax_or_seizure: ["국세", "지방세", "세금 체납", "체납", "압류", "세무서"],
  broker_involved: ["공인중개사", "중개사", "중개보조원"],
  return_guarantee: ["전세보증금반환보증", "반환보증", "보증이행", "HUG", "HF", "SGI"],
  trust_property: ["신탁", "신탁회사", "수탁자", "위탁자"],
  multi_tenant_property: ["다가구", "다세대", "공동담보", "선순위임차인"],
  restoration_deduction: ["원상회복", "수리비", "보일러", "시설 고장", "고장"],
  landlord_insolvency: ["임대인 파산", "임대인 회생", "지급불능"],
  landlord_death_or_inheritance: ["임대인 사망", "상속인", "상속포기"],
  jeonse_loan: ["전세대출", "질권", "채권양도"],
  new_tenant_condition: ["새 세입자", "후속 임차인", "새로운 임차인"],
  auction_completed: ["경매가 이미 끝", "공매가 이미 끝", "낙찰 후", "경매 종료"],
  auction_or_public_sale_started: ["경매개시결정", "공매로 넘어", "매각기일", "배당요구"],
  considering_criminal_complaint: ["사기로 고소", "형사고소", "무고로 맞고소", "기망 정황"],
  considering_forced_auction: ["직접 경매를 신청", "강제경매를 신청", "보증금 반환 강제집행"],
  considering_litigation: ["소송비용이 부담", "변호사 비용", "법률구조 지원"],
  considering_self_purchase: ["피해주택을 인수", "피해주택을 낙찰받고 싶", "깡통주택을 매수", "집을 넘기겠"],
  deposit_unreturned: ["보증금 미반환", "보증금을 돌려받지 못", "보증금이 안 돌아"],
  distribution_shortfall: ["배당표상 부족액", "미회수 보증금", "배당을 거의 못", "보증금 전액을 배당받지 못"],
  eviction_requested: ["명도 요구", "퇴거를 요구", "낙찰자가 나가라", "신탁사가 퇴거"],
  has_jeonse_loan: ["전세대출", "전세자금대출"],
  has_priority_purchase_right: ["우선매수권"],
  jeonse_loan_delinquent: ["전세대출 연체", "연체정보", "신용점수가 떨어", "카드가 정지"],
  junior_tenant: ["후순위라 배당", "후순위 임차인"],
  landlord_deceased: ["임대인이 사망", "집주인이 사망", "상속인이 누군지 모르", "상속을 포기"],
  landlord_rehabilitation_or_bankruptcy: ["임대인이 회생절차", "임대인이 파산", "채권 신고 안내"],
  multifamily_house: ["다가구주택", "다가구 선순위 보증금"],
  multiple_affected_tenants: ["피해 임차인이 여러", "다른 세입자도 우선매수권"],
  must_move_before_refund: ["보증금 받기 전에 이사", "직장이 멀어졌", "질병 때문에 다른 지역"],
  needs_relocation_funding: ["이사할 자금이 없", "무이자 대출", "새 보증금을 마련하기 어렵"],
  ownership_transfer_proposed: ["보증금 대신 집을 넘", "피해주택을 인수하라", "깡통주택을 매수"],
  owns_other_home: ["이미 주택이나 분양권", "유주택자라", "무주택 요건을 잃"],
  priority_purchase_assignment_failed: ["우선매수권을 양도하지 못", "LH가 피해주택을 매입하지 않"],
  self_purchase_at_auction: ["피해주택을 직접 낙찰", "내가 낙찰받", "자기가 낙찰받"],
  senior_tenant: ["선순위인데", "선순위 임차인"],
  suspected_false_prior_deposit_disclosure: ["선순위 보증금을 속", "선순위 보증금을 잘못 설명", "확인설명서 내용과 실제"],
  victim_decision_pending: ["피해자 결정 전", "피해자 결정을 받지 못", "피해자 신청 중"],
};

// 조사·부사·수식어가 중간에 끼어도 같은 조건을 인식하기 위한 보수적 변형 패턴.
const APPLICABILITY_GATE_PATTERNS: Record<string, RegExp[]> = {
  deposit_unreturned: [
    /보증금.{0,14}(?:못\s*받|돌려받지\s*못|안\s*돌아|미반환)/u,
  ],
  has_jeonse_loan: [/전세(?:자금)?대출/u],
  jeonse_loan_delinquent: [
    /(?:전세)?대출.{0,20}연체/u,
    /연체.{0,20}(?:전세)?대출/u,
  ],
  landlord_deceased: [/(?:임대인|집주인).{0,8}(?:사망|돌아가|죽)/u],
  multifamily_house: [/다가구/u],
  suspected_false_prior_deposit_disclosure: [
    /선순위.{0,14}보증금.{0,18}(?:속|허위|잘못|다르)/u,
    /확인설명서.{0,20}(?:실제|다르|잘못)/u,
  ],
};

const QUERY_EXPANSIONS: Array<[RegExp, string[]]> = [
  [/집주인|임대인/u, ["집주인", "임대인"]],
  [/세입자|임차인/u, ["세입자", "임차인"]],
  [/돌려받|못\s*받|반환/u, ["보증금 반환", "미반환"]],
  [/끝내|끝났|만료|종료/u, ["계약 종료", "계약해지", "갱신거절"]],
  [/나가|이사|퇴거/u, ["이사", "퇴거", "대항력", "임차권등기"]],
  [/고치|고장|수리/u, ["수리", "수선", "임대인 수선의무"]],
  [/팔았|매매|새\s*주인/u, ["소유자 변경", "임대인 지위 승계"]],
  [/근저당/u, ["근저당권", "선순위 담보권", "배당"]],
  [/알려|통지|내용증명/u, ["계약 종료 통지", "갱신거절", "내용증명", "배달증명"]],
  [/빈\s*방|친구.*월세|전대/u, ["전대", "전대차", "임대인 동의", "건물 소부분"]],
  [/장기수선/u, ["장기수선충당금", "소유자 부담", "반환 청구"]],
];

function compactWhitespace(value: string): string {
  return value.normalize("NFC").replace(/\s+/g, " ").trim();
}

function answerSummary(answer: string | null): string | null {
  if (!answer) return null;
  const compact = compactWhitespace(answer);
  return compact.length <= 700 ? compact : `${compact.slice(0, 700)}…`;
}

export function gateTerms(gates: string[] | undefined): string[] {
  return [
    ...new Set((gates ?? []).flatMap((gate) => APPLICABILITY_GATE_TERMS[gate] ?? [gate])),
  ];
}

export function detectApplicabilityGates(value: string): string[] {
  const normalized = compactWhitespace(value).toLowerCase();
  return Object.entries(APPLICABILITY_GATE_TRIGGERS)
    .filter(([gate, terms]) =>
      terms.some((term) => normalized.includes(term.toLowerCase())) ||
      (APPLICABILITY_GATE_PATTERNS[gate] ?? []).some((pattern) => pattern.test(normalized))
    )
    .map(([gate]) => gate);
}

/** 새 데이터의 검색용 필드를 빠짐없이 반영한 임베딩 전용 텍스트. */
export function buildRetrievalText(record: RetrievalTextRecord): string {
  const summary = answerSummary(record.answer);
  const gates = gateTerms(record.applicabilityGate);
  const userSignals = (record.userSignals ?? [])
    .map(compactWhitespace)
    .filter(Boolean);
  const recordType = record.recordType
    ? RECORD_TYPE_LABELS[record.recordType] ?? record.recordType
    : null;

  return [
    `법률분류: ${record.legalCategory}`,
    recordType ? `문서유형: ${recordType}` : null,
    record.issue ? `핵심쟁점: ${record.issue}` : null,
    gates.length > 0 ? `적용조건: ${gates.join(", ")}` : null,
    userSignals.length > 0 ? `사용자 단서: ${userSignals.join(" / ")}` : null,
    record.targetFact ? `확인할 사실: ${compactWhitespace(record.targetFact)}` : null,
    `질문: ${record.question}`,
    record.whyMaterial ? `질문 이유: ${compactWhitespace(record.whyMaterial)}` : null,
    summary ? `핵심내용: ${summary}` : null,
    record.statutes && record.statutes.length > 0
      ? `관련법령: ${record.statutes.join(", ")}`
      : null,
  ].filter((line): line is string => line !== null).join("\n");
}

/** 사용자 표현과 법률 용어의 간극을 문자 검색에서만 보완한다. */
export function expandRetrievalQuery(value: string): string {
  const additions = QUERY_EXPANSIONS
    .filter(([pattern]) => pattern.test(value))
    .flatMap(([, terms]) => terms);
  const gates = detectApplicabilityGates(value);
  additions.push(...gateTerms(gates));
  return compactWhitespace(`${value} ${[...new Set(additions)].join(" ")}`);
}

export function normalizeRetrievalText(value: string): string {
  return compactWhitespace(value)
    .toLowerCase()
    .replace(/[^0-9a-z가-힣]+/gu, " ")
    .trim();
}

export function characterNgrams(value: string): Set<string> {
  const compact = normalizeRetrievalText(value).replace(/\s+/g, "");
  const grams = new Set<string>();
  for (const size of [2, 3, 4]) {
    for (let index = 0; index <= compact.length - size; index += 1) {
      grams.add(`${size}:${compact.slice(index, index + size)}`);
    }
  }
  return grams;
}

export function issueFamilyMatches(
  left: string | null,
  right: string | null,
): boolean {
  if (!left || !right) return false;
  const normalizedLeft = normalizeRetrievalText(left).replace(/\s+/g, "");
  const normalizedRight = normalizeRetrievalText(right).replace(/\s+/g, "");
  if (normalizedLeft === normalizedRight) return true;

  const shorter = normalizedLeft.length <= normalizedRight.length
    ? normalizedLeft
    : normalizedRight;
  const longer = shorter === normalizedLeft ? normalizedRight : normalizedLeft;
  if (shorter.length >= 5 && longer.includes(shorter)) return true;

  // 표현은 비슷하지만 법적 의미가 반대인 쟁점은 한 묶음으로 합치지 않는다.
  const oppositeMarkers: Array<[string, string]> = [
    ["있는", "없는"],
    ["인정", "불인정"],
    ["가능", "불가"],
    ["유효", "무효"],
  ];
  if (oppositeMarkers.some(([positive, negative]) =>
    (normalizedLeft.includes(positive) && normalizedRight.includes(negative)) ||
    (normalizedLeft.includes(negative) && normalizedRight.includes(positive)))) {
    return false;
  }

  if (shorter.length < 7) return false;
  const leftGrams = new Set<string>();
  const rightGrams = new Set<string>();
  for (let index = 0; index <= normalizedLeft.length - 3; index += 1) {
    leftGrams.add(normalizedLeft.slice(index, index + 3));
  }
  for (let index = 0; index <= normalizedRight.length - 3; index += 1) {
    rightGrams.add(normalizedRight.slice(index, index + 3));
  }
  const intersection = [...leftGrams].filter((gram) => rightGrams.has(gram)).length;
  const union = new Set([...leftGrams, ...rightGrams]).size;
  return union > 0 && intersection / union >= 0.62;
}
