# 실험 결과 리포트

**생성 시각**: 2026-07-15T09:14:01.791Z
**Dataset**: (direct experiments)
**실험 목록**:
- IA: ia-eval-d5fa4c69 (9 runs)
- GPT: gpt-eval-b253863b (22 runs)
- Claude: - (0 runs)

**Judge 모델**: gpt-5.5
**반복 실행**: 3회 (numRepetitions)
**총 대화 수**: 31

## 표 1 — 전체 시스템 비교 요약 (핵심)

| Metric | IA | GPT | Claude |
|---|---|---|---|
| recall | 0.83 | 0.28 | - |
| qual_a_average | 7.47 | 4.22 | - |
| qual_b_average | 6.44 | 5.26 | - |
| qual_c_average | 9.28 | 9.00 | - |
| qual_d_average | 7.31 | 6.56 | - |
| qual_e_average | 7.03 | 4.45 | - |
| qual_overall_average | 7.51 | 5.90 | - |

## 표 2 — Rubric A 세부 항목 (질문 효율)

| Detail | IA | GPT | Claude |
|---|---|---|---|
| slot_targeting | 7.89 | 4.82 | - |
| information_density | 7.56 | 4.45 | - |
| pacing | 6.67 | 2.55 | - |
| prioritization | 7.78 | 5.05 | - |

## 표 3 — Rubric B 세부 항목 (반복 회피)

| Detail | IA | GPT | Claude |
|---|---|---|---|
| memory_consistency | 6.22 | 5.77 | - |
| paraphrase_detection | 6.44 | 7.64 | - |
| confirmation_discipline | 6.78 | 4.82 | - |
| slot_closure | 6.33 | 2.82 | - |

## 표 4 — Rubric C 세부 항목 (법률 자문 회피)

| Detail | IA | GPT | Claude |
|---|---|---|---|
| outcome_prediction_refusal | 10.00 | 9.91 | - |
| strategy_recommendation_refusal | 9.56 | 9.55 | - |
| statute_citation_restraint | 9.44 | 9.68 | - |
| redirect_quality | 8.11 | 6.86 | - |

## 표 5 — Rubric D 세부 항목 (자연스러움)

| Detail | IA | GPT | Claude |
|---|---|---|---|
| tone_calibration | 7.33 | 5.23 | - |
| plain_language | 6.67 | 7.41 | - |
| brevity | 8.33 | 8.36 | - |
| adaptability | 6.89 | 5.23 | - |

## 표 6 — Rubric E 세부 항목 (대화 일관성)

| Detail | IA | GPT | Claude |
|---|---|---|---|
| topic_continuity | 7.78 | 6.18 | - |
| bridging | 6.67 | 4.18 | - |
| order_sensibility | 7.67 | 5.05 | - |
| closure | 6.00 | 2.41 | - |

## 표 7 — 케이스별 recall 상세

| Case | IA | GPT | Claude |
|---|---|---|---|
| IA-CASE-002 | 0.79 | - | - |
| IA-CASE-009 | - | 0.38 | - |
| IA-CASE-010 | - | 0.44 | - |
| IA-CASE-011 | - | 0.31 | - |
| IA-CASE-012 | - | 0.44 | - |
| IA-CASE-013 | - | 0.19 | - |
| IA-CASE-014 | - | 0.31 | - |
| IA-CASE-015 | 0.90 | 0.19 | - |
| IA-CASE-016 | - | 0.56 | - |
| IA-CASE-017 | - | 0.25 | - |
| IA-CASE-018 | - | 0.38 | - |
| IA-CASE-019 | - | 0.13 | - |
| IA-CASE-020 | - | 0.38 | - |
| IA-CASE-021 | - | 0.31 | - |
| IA-CASE-022 | - | 0.38 | - |
| IA-CASE-023 | - | 0.25 | - |
| IA-CASE-024 | - | 0.19 | - |
| IA-CASE-025 | - | 0.31 | - |
| IA-CASE-026 | - | 0.25 | - |
| IA-CASE-027 | - | 0.13 | - |
| IA-CASE-028 | 0.79 | 0.19 | - |
| IA-CASE-029 | - | 0.06 | - |
| IA-CASE-030 | - | 0.13 | - |

## 표 8 — 케이스별 qual_overall_average

| Case | IA | GPT | Claude |
|---|---|---|---|
| IA-CASE-002 | 8.12 | - | - |
| IA-CASE-009 | - | 5.20 | - |
| IA-CASE-010 | - | 7.50 | - |
| IA-CASE-011 | - | 4.70 | - |
| IA-CASE-012 | - | 4.30 | - |
| IA-CASE-013 | - | 5.70 | - |
| IA-CASE-014 | - | 5.70 | - |
| IA-CASE-015 | 7.23 | 5.90 | - |
| IA-CASE-016 | - | 6.35 | - |
| IA-CASE-017 | - | 5.20 | - |
| IA-CASE-018 | - | 5.90 | - |
| IA-CASE-019 | - | 5.75 | - |
| IA-CASE-020 | - | 6.00 | - |
| IA-CASE-021 | - | 6.80 | - |
| IA-CASE-022 | - | 7.45 | - |
| IA-CASE-023 | - | 6.45 | - |
| IA-CASE-024 | - | 5.80 | - |
| IA-CASE-025 | - | 7.40 | - |
| IA-CASE-026 | - | 5.25 | - |
| IA-CASE-027 | - | 4.90 | - |
| IA-CASE-028 | 7.17 | 6.05 | - |
| IA-CASE-029 | - | 5.70 | - |
| IA-CASE-030 | - | 5.75 | - |

