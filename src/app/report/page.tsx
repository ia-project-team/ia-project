import type { Metadata } from "next";
import Link from "next/link";

import { ReportActions, ReportShareButton } from "./ReportActions";
import styles from "./report.module.css";

export const metadata: Metadata = {
  title: "정리 리포트 | LawPre",
  description: "상담 전 사실관계와 준비 자료를 한눈에 확인하세요.",
};

export default function ReportPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerBack}>
          <Link
            href="/chat"
            className={styles.backButton}
            aria-label="채팅으로 돌아가기"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </Link>
          <Link href="/" aria-label="LawPre 홈">
            <svg
              className={styles.logo}
              viewBox="0 0 230 64"
              role="img"
              aria-label="LawPre"
            >
              <path
                d="M 6 26 L 22 40 L 50 6"
                stroke="currentColor"
                strokeWidth="6.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <text x="56" y="42" className={styles.logoText}>
                LawPre
              </text>
              <path
                d="M 22 40 Q 22 58 42 58 L 208 58"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                opacity="0.6"
              />
            </svg>
          </Link>
        </div>
        <ReportActions />
      </header>

      <div className={styles.pageContent}>
        <article className={styles.document}>
          <header className={styles.documentTop}>
            <h1>정리 리포트</h1>
            <p className={styles.meta}>
              2026.08.24 · 대화 12분
              <span className={styles.desktopMeta}> · 최유진 님</span>
            </p>
            <div className={styles.summary}>
              <p className={styles.summaryLabel}>사건 요약</p>
              <p className={styles.summaryText}>
                전세 보증금 8,000만원 미반환 사건. 계약 종료 후 5개월 경과,
                대항력·우선변제권 확보 상태로 파악됩니다.
              </p>
            </div>
          </header>

          <div className={styles.documentBody}>
            <section className={styles.reportSection}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIcon} aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </span>
                <h2>계약 정보</h2>
              </div>
              <dl className={styles.rows}>
                <div className={styles.row}>
                  <dt>계약 기간</dt>
                  <dd>
                    <strong>2022.04.01 ~ 2024.03.31</strong> (2년)
                  </dd>
                </div>
                <div className={styles.row}>
                  <dt>임대인</dt>
                  <dd>김ㅇㅇ (개인)</dd>
                </div>
                <div className={styles.row}>
                  <dt>계약서 원본</dt>
                  <dd>
                    PDF 보유 <span className={styles.okPill}>✓ 확보</span>
                  </dd>
                </div>
              </dl>
            </section>

            <section className={styles.reportSection}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIcon} aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                </span>
                <h2>금전 관계</h2>
              </div>
              <dl className={styles.rows}>
                <div className={styles.row}>
                  <dt>보증금</dt>
                  <dd>
                    <strong>8,000만원</strong>
                  </dd>
                </div>
                <div className={styles.row}>
                  <dt>반환액</dt>
                  <dd>0원</dd>
                </div>
                <div className={styles.row}>
                  <dt>미반환액</dt>
                  <dd>
                    <strong>8,000만원 (전액)</strong>
                  </dd>
                </div>
              </dl>
            </section>

            <section className={styles.reportSection}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIcon} aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </span>
                <h2>거주 정보 · 대항력</h2>
              </div>
              <dl className={styles.rows}>
                <div className={styles.row}>
                  <dt>전입 신고</dt>
                  <dd>
                    2022.04.05
                    <span className={styles.okPill}>✓ 대항력 확보</span>
                  </dd>
                </div>
                <div className={styles.row}>
                  <dt>확정일자</dt>
                  <dd>
                    2022.04.05
                    <span className={styles.okPill}>✓ 우선변제권 확보</span>
                  </dd>
                </div>
                <div className={styles.row}>
                  <dt>거주 여부</dt>
                  <dd>
                    계속 거주 중
                    <span className={styles.okPill}>✓ 대항력 유지</span>
                  </dd>
                </div>
              </dl>
            </section>

            <section className={styles.reportSection}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIcon} aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </span>
                <h2>통보 이력</h2>
              </div>
              <dl className={styles.rows}>
                <div className={styles.row}>
                  <dt>1차 통보</dt>
                  <dd>2024.03.15 · 카톡</dd>
                </div>
                <div className={styles.row}>
                  <dt>2차 통보</dt>
                  <dd>2024.04.10 · 문자</dd>
                </div>
                <div className={styles.row}>
                  <dt>임대인 응답</dt>
                  <dd>&quot;곧 돌려주겠다&quot; (구두)</dd>
                </div>
              </dl>
            </section>

            <section className={styles.reportSection}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIcon} aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                </span>
                <h2>증거 자료</h2>
              </div>
              <dl className={styles.rows}>
                <div className={styles.row}>
                  <dt>카톡 기록</dt>
                  <dd>
                    <span className={styles.okPill}>✓ 확보</span>
                  </dd>
                </div>
                <div className={styles.row}>
                  <dt>이체 기록</dt>
                  <dd>
                    보증금 입금 <span className={styles.okPill}>✓ 확보</span>
                  </dd>
                </div>
                <div className={styles.row}>
                  <dt>내용증명</dt>
                  <dd>
                    <span className={styles.missingPill}>✕ 미발송</span>
                  </dd>
                </div>
              </dl>
            </section>

            <section className={styles.reportSection}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIcon} aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </span>
                <h2>권리 보전</h2>
              </div>
              <dl className={styles.rows}>
                <div className={styles.row}>
                  <dt>임차권 등기</dt>
                  <dd>
                    <span className={styles.missingPill}>✕ 미신청</span>
                  </dd>
                </div>
                <div className={styles.row}>
                  <dt>등기부 확인</dt>
                  <dd>
                    최근 미확인
                    <span className={styles.missingPill}>✕ 필요</span>
                  </dd>
                </div>
              </dl>
            </section>

            <section className={styles.nextSteps}>
              <h2>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                AI가 제안하는 다음 단계
              </h2>
              <ul>
                <li>
                  <strong>내용증명 발송</strong> — 증거력 강화. 지금까지
                  카톡·문자 통보만 있어 서면 통보 이력이 없음.
                </li>
                <li>
                  <strong>등기부 최신본 발급</strong> — 선순위 저당권 확인 후
                  우선변제 실익 판단 필요.
                </li>
                <li>
                  <strong>임차권 등기 명령 신청 검토</strong> — 향후 이사 필요
                  시 대항력 유지 위해.
                </li>
              </ul>
            </section>
          </div>

          <footer className={styles.documentFooter}>
            <p>
              이 리포트를 변호사님께 공유하면
              <br className={styles.mobileBreak} /> 상담 시간이 훨씬
              짧아집니다.
            </p>
            <ReportShareButton />
          </footer>
        </article>
      </div>
    </main>
  );
}
