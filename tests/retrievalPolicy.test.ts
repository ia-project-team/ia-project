import { describe, expect, it } from "vitest";

import {
  buildRagSearchQuery,
  isQuestionTriggerApplicable,
  selectRagCandidates,
} from "@/core/rag/retrievalPolicy";
import {
  buildRetrievalText,
  detectApplicabilityGates,
} from "@/core/rag/retrievalText";
import type { RetrievedCase } from "@/core/rag/types";

function ragCase(
  id: string,
  issue: string,
  score: number,
  hybrid = true,
): RetrievedCase {
  return {
    id,
    dataset: "test",
    sourceRow: Number(id.replace(/\D/g, "")) || 1,
    legalCategory: "주택임대차",
    issue,
    serviceFit: "direct",
    question: `${issue} 질문`,
    answer: `${issue} 답변`,
    answerStatus: "complete",
    decisionReason: null,
    score,
    ...(hybrid ? { vectorRank: 1, lexicalRank: 1 } : {}),
  };
}

describe("RAG 검색어 구성", () => {
  it("현재 사용자 문장을 한 번만 넣고 동일한 과거 문장을 제거한다", () => {
    const currentMessage = "집주인의 세금 체납으로 집이 압류됐습니다.";
    const query = buildRagSearchQuery({
      currentMessage,
      recentUserMessages: ["계약서는 있어요.", currentMessage, currentMessage],
      collectedFacts: ["has_contract_doc: 있음"],
      ragFacts: ["전세사기피해자 결정: 받음"],
    });

    expect(query.split(currentMessage)).toHaveLength(2);
    expect(query).toContain("현재 진술:");
    expect(query).toContain("이전 사용자 진술:");
    expect(query).toContain("확인된 기본 사실:");
    expect(query).toContain("확인된 특이 사실:");
  });

  it("일반적인 이사·장기수선 표현을 임차권등기나 원상회복 조건으로 오인하지 않는다", () => {
    expect(
      detectApplicabilityGates("장기수선충당금은 이사할 때 돌려받을 수 있나요?"),
    ).toEqual([]);
  });

  it("수식어가 끼어든 사용자 표현에서도 질문 트리거 조건을 감지한다", () => {
    expect(detectApplicabilityGates(
      "보증금을 못 받은 채 전세대출 만기가 다가와요.",
    )).toEqual(expect.arrayContaining(["deposit_unreturned", "has_jeonse_loan"]));
    expect(detectApplicabilityGates(
      "다가구 계약 때 선순위 임차보증금 총액을 속인 것 같아요.",
    )).toEqual(expect.arrayContaining([
      "multifamily_house",
      "suspected_false_prior_deposit_disclosure",
    ]));
  });

  it("질문 트리거의 사용자 단서·확인 사실·이유를 검색 텍스트에 포함한다", () => {
    const text = buildRetrievalText({
      legalCategory: "전세피해 특이사례 질문",
      issue: "임대인 사망",
      question: "임대인의 상속인이 누구인지 현재 확정된 상태인가요?",
      answer: null,
      recordType: "question_trigger",
      applicabilityGate: ["landlord_deceased"],
      userSignals: ["임대인이 사망했다", "상속인이 누군지 모른다"],
      targetFact: "상속인 확정 여부",
      whyMaterial: "반환 요구 상대를 정하는 데 필요하다.",
    });

    expect(text).toContain("사용자 단서: 임대인이 사망했다 / 상속인이 누군지 모른다");
    expect(text).toContain("확인할 사실: 상속인 확정 여부");
    expect(text).toContain("질문 이유: 반환 요구 상대를 정하는 데 필요하다.");
  });
});

describe("RAG 후보 동적 선택", () => {
  const DISTINCT_ISSUES = [
    "임차권등기 후 이사",
    "노후 보일러 수선 비용",
    "국세 압류 주택 매각 유예",
    "주택 소부분 전대차",
    "장기수선충당금 반환",
    "임대주택 소유자 변경",
    "확정일자와 우선변제",
    "계약 종료 의사 통지",
    "보증금 증액 제한",
    "임대인 사망과 상속",
  ];

  it("같은 쟁점의 안내문과 Q&A가 후보를 독점하지 못하게 한다", () => {
    const selection = selectRagCandidates([
      ragCase("c1", "장기수선충당금", 1),
      ragCase("c2", "장기수선충당금의 반환 청구", 0.98),
      ragCase("c3", "임차권등기명령의 신청", 0.9),
      ragCase("c4", "보증금 반환 청구", 0.86),
    ]);

    expect(selection.cases.map((item) => item.id)).toEqual(["c1", "c3", "c4"]);
  });

  it("같은 쟁점의 일반 자료와 질문 트리거를 둘 다 선택기에 전달한다", () => {
    const general = ragCase("c1", "임대인 사망 후 상속인 확인", 1);
    const trigger = {
      ...ragCase("c2", "임대인 사망 후 상속인 확인 여부", 0.9),
      recordType: "question_trigger",
      applicabilityGate: ["landlord_deceased"],
      matchedGates: ["landlord_deceased"],
      targetFact: "상속인 확정 여부",
    };

    const selection = selectRagCandidates([
      general,
      trigger,
      ragCase("c3", "임차권등기명령의 신청", 0.85),
    ]);

    expect(selection.cases.map((item) => item.id)).toEqual(["c2", "c1", "c3"]);
  });

  it("질문 트리거는 저장된 적용 조건이 모두 맞아야 통과한다", () => {
    const trigger = {
      ...ragCase("c1", "피해주택 직접 낙찰", 1),
      recordType: "question_trigger",
      applicabilityGate: ["self_purchase_at_auction", "has_jeonse_loan"],
      matchedGates: ["has_jeonse_loan"],
    };

    expect(isQuestionTriggerApplicable(trigger)).toBe(false);
    expect(selectRagCandidates([trigger]).cases).toEqual([]);
    expect(isQuestionTriggerApplicable({
      ...trigger,
      matchedGates: ["self_purchase_at_auction", "has_jeonse_loan"],
    })).toBe(true);
  });

  it("적용 가능한 질문 트리거는 점수가 낮아도 후보에서 보존한다", () => {
    const trigger = {
      ...ragCase("trigger", "긴급 경매 매각기일", 0.02),
      recordType: "question_trigger",
      applicabilityGate: ["victim_decision_pending", "auction_or_public_sale_started"],
      matchedGates: ["victim_decision_pending", "auction_or_public_sale_started"],
      targetFact: "가장 가까운 매각기일",
    };
    const selection = selectRagCandidates([
      ...Array.from({ length: 9 }, (_, index) =>
        ragCase(`c${index + 1}`, DISTINCT_ISSUES[index], 1 - index * 0.03)),
      trigger,
    ]);

    expect(selection.cases[0].id).toBe("trigger");
    expect(selection.cases).toContainEqual(expect.objectContaining({ id: "trigger" }));
  });

  it("같은 쟁점이어도 조건을 충족한 질문 트리거끼리는 합치지 않는다", () => {
    const triggers = ["t1", "t2"].map((id, index) => ({
      ...ragCase(id, "경매 배당 부족", 0.1 - index * 0.01),
      recordType: "question_trigger",
      applicabilityGate: ["auction_completed", "distribution_shortfall"],
      matchedGates: ["auction_completed", "distribution_shortfall"],
      targetFact: `${id} 추가 사실`,
    }));

    const selection = selectRagCandidates(triggers);

    expect(selection.cases.map((item) => item.id)).toEqual(["t1", "t2"]);
  });

  it("1위가 뚜렷하면 최대 6건으로 제한한다", () => {
    const selection = selectRagCandidates([
      ragCase("c1", DISTINCT_ISSUES[0], 1),
      ...Array.from({ length: 9 }, (_, index) =>
        ragCase(`c${index + 2}`, DISTINCT_ISSUES[index + 1], 0.8 - index * 0.01)),
    ]);

    expect(selection.maximumCount).toBe(6);
    expect(selection.cases).toHaveLength(6);
    expect(selection.cutoffReason).toBe("maximum");
  });

  it("상위 점수가 혼잡하면 최대 8건까지 허용한다", () => {
    const selection = selectRagCandidates(
      Array.from({ length: 10 }, (_, index) =>
        ragCase(`c${index + 1}`, DISTINCT_ISSUES[index], 1 - index * 0.02)),
    );

    expect(selection.maximumCount).toBe(8);
    expect(selection.cases).toHaveLength(8);
  });

  it("기존 코사인 검색에는 0.35 하한을 유지한다", () => {
    const selection = selectRagCandidates([
      ragCase("c1", "쟁점 하나", 0.52, false),
      ragCase("c2", "쟁점 둘", 0.41, false),
      ragCase("c3", "쟁점 셋", 0.35, false),
      ragCase("c4", "쟁점 넷", 0.34, false),
    ]);

    expect(selection.cases.map((item) => item.id)).toEqual(["c1", "c2", "c3"]);
    expect(selection.scoreFloor).toBe(0.35);
  });
});
