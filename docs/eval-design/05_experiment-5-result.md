# 실험 결과 리포트

**생성 시각**: 2026-07-21T22:53:30.782Z
**Dataset**: ia-golden-set
**실험 목록**:
- IA: ia-eval-1dcb71a4 (88 runs)
- GPT: gpt-eval-55b181ac (90 runs)
- Claude: claude-eval-d23ebe76 (90 runs)

**Judge 모델**: gpt-5.5
**반복 실행**: 3회 (numRepetitions)
**총 대화 수**: 268

## 표 1 — 전체 시스템 비교 요약 (핵심)

| Metric | IA | GPT | Claude |
|---|---|---|---|
| recall | 0.77 | 0.29 | 0.36 |
| qual_a_average | 7.03 | 4.25 | 5.48 |
| qual_b_average | 5.86 | 5.18 | 6.64 |
| qual_c_average | 9.22 | 9.03 | 8.63 |
| qual_d_average | 7.23 | 6.71 | 6.72 |
| qual_e_average | 6.46 | 4.48 | 6.14 |
| qual_overall_average | 7.16 | 5.93 | 6.72 |

## 표 2 — Rubric A 세부 항목 (질문 효율)

| Detail | IA | GPT | Claude |
|---|---|---|---|
| slot_targeting | - | - | - |
| information_density | - | - | - |
| pacing | - | - | - |
| prioritization | - | - | - |

## 표 3 — Rubric B 세부 항목 (반복 회피)

| Detail | IA | GPT | Claude |
|---|---|---|---|
| memory_consistency | - | - | - |
| paraphrase_detection | - | - | - |
| confirmation_discipline | - | - | - |
| slot_closure | - | - | - |

## 표 4 — Rubric C 세부 항목 (법률 자문 회피)

| Detail | IA | GPT | Claude |
|---|---|---|---|
| outcome_prediction_refusal | - | - | - |
| strategy_recommendation_refusal | - | - | - |
| statute_citation_restraint | - | - | - |
| redirect_quality | - | - | - |

## 표 5 — Rubric D 세부 항목 (자연스러움)

| Detail | IA | GPT | Claude |
|---|---|---|---|
| tone_calibration | - | - | - |
| plain_language | - | - | - |
| brevity | - | - | - |
| adaptability | - | - | - |

## 표 6 — Rubric E 세부 항목 (대화 일관성)

| Detail | IA | GPT | Claude |
|---|---|---|---|
| topic_continuity | - | - | - |
| bridging | - | - | - |
| order_sensibility | - | - | - |
| closure | - | - | - |

## 표 7 — 케이스별 recall 상세

| Case | IA | GPT | Claude |
|---|---|---|---|
| IA-CASE-001 | 0.72 | 0.31 | 0.35 |
| IA-CASE-002 | 0.78 | 0.21 | 0.33 |
| IA-CASE-003 | 0.73 | 0.28 | 0.15 |
| IA-CASE-004 | 0.83 | 0.40 | 0.25 |
| IA-CASE-005 | 0.65 | 0.38 | 0.33 |
| IA-CASE-006 | 0.83 | 0.25 | 0.29 |
| IA-CASE-007 | 0.75 | 0.08 | 0.15 |
| IA-CASE-008 | 0.85 | 0.15 | 0.27 |
| IA-CASE-009 | 0.85 | 0.33 | 0.38 |
| IA-CASE-010 | 0.88 | 0.54 | 0.58 |
| IA-CASE-011 | 0.71 | 0.34 | 0.40 |
| IA-CASE-012 | 0.79 | 0.52 | 0.46 |
| IA-CASE-013 | 0.79 | 0.33 | 0.33 |
| IA-CASE-014 | 0.75 | 0.38 | 0.42 |
| IA-CASE-015 | 0.75 | 0.17 | 0.16 |
| IA-CASE-016 | 0.81 | 0.44 | 0.52 |
| IA-CASE-017 | 0.81 | 0.27 | 0.38 |
| IA-CASE-018 | 0.77 | 0.42 | 0.48 |
| IA-CASE-019 | 0.71 | 0.08 | 0.19 |
| IA-CASE-020 | 0.88 | 0.42 | 0.56 |
| IA-CASE-021 | 0.81 | 0.19 | 0.44 |
| IA-CASE-022 | 0.81 | 0.25 | 0.40 |
| IA-CASE-023 | 0.81 | 0.17 | 0.35 |
| IA-CASE-024 | 0.67 | 0.27 | 0.31 |
| IA-CASE-025 | 0.81 | 0.29 | 0.33 |
| IA-CASE-026 | 0.75 | 0.27 | 0.33 |
| IA-CASE-027 | 0.81 | 0.38 | 0.67 |
| IA-CASE-028 | 0.79 | 0.25 | 0.42 |
| IA-CASE-029 | 0.54 | 0.13 | 0.40 |
| IA-CASE-030 | 0.60 | 0.17 | 0.23 |

## 표 8 — 케이스별 qual_overall_average

| Case | IA | GPT | Claude |
|---|---|---|---|
| IA-CASE-001 | 5.78 | 5.22 | 5.52 |
| IA-CASE-002 | 7.45 | 6.58 | 5.97 |
| IA-CASE-003 | 6.85 | 4.75 | 5.92 |
| IA-CASE-004 | 7.90 | 6.67 | 5.77 |
| IA-CASE-005 | 6.95 | 6.08 | 4.92 |
| IA-CASE-006 | 6.95 | 5.82 | 5.58 |
| IA-CASE-007 | 7.85 | 6.25 | 6.05 |
| IA-CASE-008 | 7.58 | 5.80 | 5.97 |
| IA-CASE-009 | 7.22 | 6.27 | 7.02 |
| IA-CASE-010 | 7.58 | 5.57 | 7.42 |
| IA-CASE-011 | 6.48 | 4.10 | 6.50 |
| IA-CASE-012 | 6.67 | 4.65 | 6.63 |
| IA-CASE-013 | 7.17 | 6.28 | 7.28 |
| IA-CASE-014 | 6.87 | 5.27 | 7.32 |
| IA-CASE-015 | 7.32 | 6.00 | 6.73 |
| IA-CASE-016 | 7.60 | 6.47 | 7.65 |
| IA-CASE-017 | 7.68 | 5.58 | 7.52 |
| IA-CASE-018 | 6.92 | 5.35 | 7.23 |
| IA-CASE-019 | 7.15 | 5.57 | 7.00 |
| IA-CASE-020 | 7.42 | 6.35 | 7.30 |
| IA-CASE-021 | 7.23 | 5.97 | 6.67 |
| IA-CASE-022 | 6.68 | 6.85 | 7.82 |
| IA-CASE-023 | 6.88 | 6.68 | 6.73 |
| IA-CASE-024 | 7.52 | 5.97 | 7.00 |
| IA-CASE-025 | 7.57 | 6.50 | 7.38 |
| IA-CASE-026 | 6.95 | 5.67 | 6.25 |
| IA-CASE-027 | 7.38 | 6.62 | 7.63 |
| IA-CASE-028 | 6.98 | 6.92 | 7.45 |
| IA-CASE-029 | 6.72 | 5.80 | 6.37 |
| IA-CASE-030 | 7.55 | 6.33 | 7.07 |

