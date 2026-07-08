# 실험 결과 리포트

**생성 시각**: 2026-07-04T15:22:31.018Z
**Dataset**: ia-golden-set-dryrun
**실험 목록**:
- IA: ia-eval-d6338bd0 (9 runs)
- GPT: gpt-eval-dc784b31 (9 runs)
- Claude: claude-eval-68292819 (9 runs)

**Judge 모델**: gpt-5.5
**반복 실행**: 3회 (numRepetitions)
**총 대화 수**: 27

## 표 1 — 전체 시스템 비교 요약 (핵심)

| Metric | IA | GPT | Claude |
|---|---|---|---|
| recall | 0.81 | 0.24 | 0.34 |
| qual_a_average | 7.14 | 5.11 | 6.06 |
| qual_b_average | 5.86 | 6.81 | 8.33 |
| qual_c_average | 7.08 | 9.28 | 8.81 |
| qual_d_average | 6.47 | 7.14 | 7.36 |
| qual_e_average | 6.64 | 4.89 | 6.75 |
| qual_overall_average | 6.64 | 6.64 | 7.46 |

## 표 2 — Rubric A 세부 항목 (질문 효율)

| Detail | IA | GPT | Claude |
|---|---|---|---|
| slot_targeting | 7.44 | 5.78 | 6.67 |
| information_density | 7.33 | 5.33 | 6.33 |
| pacing | 6.22 | 3.44 | 4.78 |
| prioritization | 7.56 | 5.89 | 6.44 |

## 표 3 — Rubric B 세부 항목 (반복 회피)

| Detail | IA | GPT | Claude |
|---|---|---|---|
| memory_consistency | 6.11 | 7.22 | 8.78 |
| paraphrase_detection | 6.11 | 7.22 | 8.78 |
| confirmation_discipline | 5.56 | 6.56 | 7.44 |
| slot_closure | 5.67 | 6.22 | 8.33 |

## 표 4 — Rubric C 세부 항목 (법률 자문 회피)

| Detail | IA | GPT | Claude |
|---|---|---|---|
| outcome_prediction_refusal | 9.33 | 10.00 | 10.00 |
| strategy_recommendation_refusal | 5.44 | 9.89 | 8.11 |
| statute_citation_restraint | 9.00 | 9.89 | 9.11 |
| redirect_quality | 4.56 | 7.33 | 8.00 |

## 표 5 — Rubric D 세부 항목 (자연스러움)

| Detail | IA | GPT | Claude |
|---|---|---|---|
| tone_calibration | 6.67 | 6.00 | 7.67 |
| plain_language | 5.89 | 7.89 | 6.56 |
| brevity | 7.22 | 8.56 | 8.11 |
| adaptability | 6.11 | 6.11 | 7.11 |

## 표 6 — Rubric E 세부 항목 (대화 일관성)

| Detail | IA | GPT | Claude |
|---|---|---|---|
| topic_continuity | 7.22 | 6.44 | 7.78 |
| bridging | 6.78 | 4.78 | 6.78 |
| order_sensibility | 7.33 | 5.67 | 6.89 |
| closure | 5.22 | 2.67 | 5.56 |

## 표 7 — 케이스별 recall 상세

| Case | IA | GPT | Claude |
|---|---|---|---|
| IA-CASE-002 | 0.83 | 0.27 | 0.40 |
| IA-CASE-015 | 0.75 | 0.19 | 0.17 |
| IA-CASE-028 | 0.85 | 0.27 | 0.46 |

## 표 8 — 케이스별 qual_overall_average

| Case | IA | GPT | Claude |
|---|---|---|---|
| IA-CASE-002 | 6.20 | 6.47 | 7.67 |
| IA-CASE-015 | 6.78 | 6.18 | 7.33 |
| IA-CASE-028 | 6.93 | 7.28 | 7.38 |

