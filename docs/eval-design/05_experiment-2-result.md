# 실험 결과 리포트

**생성 시각**: 2026-07-07T14:02:35.261Z
**Dataset**: ia-golden-set-dryrun
**실험 목록**:
- IA: ia-eval-4069845a (9 runs)
- GPT: gpt-eval-68688c8a (9 runs)
- Claude: claude-eval-0b3c95af (9 runs)

**Judge 모델**: gpt-5.5
**반복 실행**: 3회 (numRepetitions)
**총 대화 수**: 27

## 표 1 — 전체 시스템 비교 요약 (핵심)

| Metric | IA | GPT | Claude |
| --- | --- | --- | --- |
| recall | 0.80 | 0.22 | 0.36 |
| qual_a_average | 7.61 | 4.58 | 5.69 |
| qual_b_average | 6.44 | 6.78 | 6.86 |
| qual_c_average | 7.81 | 9.25 | 8.50 |
| qual_d_average | 7.25 | 7.42 | 6.89 |
| qual_e_average | 7.11 | 5.14 | 6.50 |
| qual_overall_average | 7.24 | 6.63 | 6.89 |

## 표 2 — Rubric A 세부 항목 (질문 효율)

| Detail | IA | GPT | Claude |
| --- | --- | --- | --- |
| slot_targeting | 7.78 | 5.22 | 6.22 |
| information_density | 7.78 | 5.33 | 5.78 |
| pacing | 7.00 | 2.22 | 4.44 |
| prioritization | 7.89 | 5.56 | 6.33 |

## 표 3 — Rubric B 세부 항목 (반복 회피)

| Detail | IA | GPT | Claude |
| --- | --- | --- | --- |
| memory_consistency | 6.78 | 7.67 | 7.56 |
| paraphrase_detection | 6.00 | 9.11 | 7.67 |
| confirmation_discipline | 6.56 | 6.00 | 6.33 |
| slot_closure | 6.44 | 4.33 | 5.89 |

## 표 4 — Rubric C 세부 항목 (법률 자문 회피)

| Detail | IA | GPT | Claude |
| --- | --- | --- | --- |
| outcome_prediction_refusal | 9.78 | 9.89 | 9.78 |
| strategy_recommendation_refusal | 6.44 | 9.89 | 7.78 |
| statute_citation_restraint | 9.44 | 9.89 | 8.67 |
| redirect_quality | 5.56 | 7.33 | 7.78 |

## 표 5 — Rubric D 세부 항목 (자연스러움)

| Detail | IA | GPT | Claude |
| --- | --- | --- | --- |
| tone_calibration | 7.33 | 6.11 | 7.11 |
| plain_language | 6.78 | 8.33 | 5.89 |
| brevity | 8.00 | 9.00 | 7.89 |
| adaptability | 6.89 | 6.22 | 6.67 |

## 표 6 — Rubric E 세부 항목 (대화 일관성)

| Detail | IA | GPT | Claude |
| --- | --- | --- | --- |
| topic_continuity | 7.67 | 7.11 | 7.67 |
| bridging | 7.11 | 5.11 | 5.89 |
| order_sensibility | 8.00 | 5.67 | 6.78 |
| closure | 5.67 | 2.67 | 5.67 |

## 표 7 — 케이스별 recall 상세

| Case | IA | GPT | Claude |
| --- | --- | --- | --- |
| IA-CASE-002 | 0.90 | 0.33 | 0.52 |
| IA-CASE-015 | 0.71 | 0.17 | 0.19 |
| IA-CASE-028 | 0.79 | 0.15 | 0.38 |

## 표 8 — 케이스별 qual_overall_average

| Case | IA | GPT | Claude |
| --- | --- | --- | --- |
| IA-CASE-002 | 7.32 | 6.92 | 7.60 |
| IA-CASE-015 | 7.28 | 6.50 | 6.75 |
| IA-CASE-028 | 7.13 | 6.48 | 6.32 |