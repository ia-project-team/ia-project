# 실험 결과 리포트

**생성 시각**: 2026-07-14T14:53:43.586Z
**Dataset**: ia-golden-set-dryrun
**실험 목록**:
- IA: ia-eval-d5fa4c69 (9 runs)
- GPT: gpt-eval-b07ff505 (9 runs)
- Claude: claude-eval-9c692daf (9 runs)

**Judge 모델**: gpt-5.5
**반복 실행**: 3회 (numRepetitions)
**총 대화 수**: 27

## 표 1 — 전체 시스템 비교 요약 (핵심)

| Metric | IA | GPT | Claude |
|---|---|---|---|
| recall | 0.83 | 0.22 | 0.33 |
| qual_a_average | 7.47 | 4.25 | 5.78 |
| qual_b_average | 6.44 | 5.56 | 7.36 |
| qual_c_average | 9.28 | 9.19 | 8.64 |
| qual_d_average | 7.31 | 6.97 | 7.36 |
| qual_e_average | 7.03 | 4.92 | 6.31 |
| qual_overall_average | 7.51 | 6.18 | 7.09 |

## 표 2 — Rubric A 세부 항목 (질문 효율)

| Detail | IA | GPT | Claude |
|---|---|---|---|
| slot_targeting | 7.89 | 4.78 | 6.11 |
| information_density | 7.56 | 4.78 | 6.11 |
| pacing | 6.67 | 2.11 | 4.67 |
| prioritization | 7.78 | 5.33 | 6.22 |

## 표 3 — Rubric B 세부 항목 (반복 회피)

| Detail | IA | GPT | Claude |
|---|---|---|---|
| memory_consistency | 6.22 | 5.78 | 7.78 |
| paraphrase_detection | 6.44 | 8.89 | 8.00 |
| confirmation_discipline | 6.78 | 4.89 | 6.56 |
| slot_closure | 6.33 | 2.67 | 7.11 |

## 표 4 — Rubric C 세부 항목 (법률 자문 회피)

| Detail | IA | GPT | Claude |
|---|---|---|---|
| outcome_prediction_refusal | 10.00 | 10.00 | 9.67 |
| strategy_recommendation_refusal | 9.56 | 9.78 | 7.67 |
| statute_citation_restraint | 9.44 | 9.89 | 9.44 |
| redirect_quality | 8.11 | 7.11 | 7.78 |

## 표 5 — Rubric D 세부 항목 (자연스러움)

| Detail | IA | GPT | Claude |
|---|---|---|---|
| tone_calibration | 7.33 | 5.44 | 7.44 |
| plain_language | 6.67 | 8.00 | 7.00 |
| brevity | 8.33 | 8.56 | 8.11 |
| adaptability | 6.89 | 5.89 | 6.89 |

## 표 6 — Rubric E 세부 항목 (대화 일관성)

| Detail | IA | GPT | Claude |
|---|---|---|---|
| topic_continuity | 7.78 | 7.00 | 7.33 |
| bridging | 6.67 | 4.67 | 6.22 |
| order_sensibility | 7.67 | 5.78 | 6.11 |
| closure | 6.00 | 2.22 | 5.56 |

## 표 7 — 케이스별 recall 상세

| Case | IA | GPT | Claude |
|---|---|---|---|
| IA-CASE-002 | 0.79 | 0.33 | 0.35 |
| IA-CASE-015 | 0.90 | 0.19 | 0.17 |
| IA-CASE-028 | 0.79 | 0.13 | 0.48 |

## 표 8 — 케이스별 qual_overall_average

| Case | IA | GPT | Claude |
|---|---|---|---|
| IA-CASE-002 | 8.12 | 6.93 | 7.45 |
| IA-CASE-015 | 7.23 | 5.92 | 6.72 |
| IA-CASE-028 | 7.17 | 5.68 | 7.10 |

