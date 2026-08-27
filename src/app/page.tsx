import Link from "next/link";

import styles from "./home.module.css";

export default function HomePage() {
  return (
    <div id="top" className={styles.home}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" aria-label="LawPre 홈">
            <svg
              className={styles.headerLogo}
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

          <nav className={styles.desktopNav} aria-label="주요 메뉴">
            <a href="#features">서비스 소개</a>
            <a href="#process">이용 방법</a>
            <a href="#footer">도움말</a>
            <Link href="/chat" className={styles.headerButton}>
              시작하기
            </Link>
          </nav>

          <details className={styles.mobileMenu}>
            <summary aria-label="메뉴 열기">
              <span />
              <span />
              <span />
            </summary>
            <nav aria-label="모바일 메뉴">
              <a href="#features">서비스 소개</a>
              <a href="#process">이용 방법</a>
              <Link href="/report">샘플 리포트</Link>
              <Link href="/chat">시작하기</Link>
            </nav>
          </details>
        </div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <div>
              <span className={styles.eyebrow}>
                전세 보증금 반환 분쟁 사전 정리
              </span>
              <h1 className={styles.heroTitle}>
                변호사 상담 전,
                <br />
                사실관계 정리부터.
              </h1>
              <p className={styles.heroDescription}>
                AI가 하나씩 물어보면 답만 하세요.
                <br className={styles.desktopBreak} /> 필요한 자료가 무엇인지,
                무엇이 빠졌는지
                <br className={styles.desktopBreak} /> 자동으로 정리해드립니다.
              </p>
              <div className={styles.heroActions}>
                <Link href="/chat" className={styles.primaryButton}>
                  무료로 시작하기 →
                </Link>
                <Link href="/report" className={styles.textButton}>
                  샘플 리포트 보기
                </Link>
              </div>
              <div className={styles.trustMessage}>
                <span aria-hidden="true">✓</span>
                <p>상담 준비 시간 평균 30분 → 5분</p>
              </div>
            </div>

            <div className={styles.chatPreview} aria-label="LawPre 대화 예시">
              <div className={styles.chatHeader}>
                <span className={styles.chatAvatar} aria-hidden="true">
                  ✓
                </span>
                <span className={styles.chatName}>LawPre</span>
              </div>
              <p className={`${styles.chatMessage} ${styles.aiMessage}`}>
                안녕하세요. 시작 전에 몇 가지 확인부터 드릴게요.
                <br className={styles.desktopBreak} /> 임대차 계약서 원본을 갖고
                계신가요?
              </p>
              <div className={`${styles.chatMessage} ${styles.userMessage}`}>
                <span>네, PDF로 있어요</span>
              </div>
              <p className={`${styles.chatMessage} ${styles.aiMessage}`}>
                좋습니다. 계약 종료일이 언제였는지 알려주세요.
              </p>
              <div className={styles.progressRow}>
                <div
                  className={styles.progressTrack}
                  role="progressbar"
                  aria-label="정보 수집 진행률"
                  aria-valuemin={0}
                  aria-valuemax={17}
                  aria-valuenow={6}
                >
                  <span className={styles.progressFill} />
                </div>
                <span className={styles.progressText}>6 / 17 수집</span>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className={styles.featuresSection}>
          <div className={styles.sectionInner}>
            <h2 className={styles.sectionTitle}>왜 LawPre인가요</h2>
            <p className={styles.sectionSubtitle}>
              상담 준비의 방식을 바꿉니다
            </p>

            <div className={styles.featureGrid}>
              <article className={styles.featureCard}>
                <div className={styles.featureIcon} aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h3>답만 하시면 돼요</h3>
                <p>
                  AI가 상황에 맞춰 하나씩 물어봅니다. 어렵게 정리할 필요
                  없어요.
                </p>
              </article>

              <article className={styles.featureCard}>
                <div className={styles.featureIcon} aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <polyline points="9 11 12 14 22 4" />
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                </div>
                <h3>빠진 자료를 짚어드려요</h3>
                <p>
                  계약서, 이체 내역, 카톡 기록. 어떤 자료가 필요한지
                  알려드립니다.
                </p>
              </article>

              <article className={styles.featureCard}>
                <div className={styles.featureIcon} aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="9" y1="15" x2="15" y2="15" />
                    <line x1="9" y1="11" x2="15" y2="11" />
                  </svg>
                </div>
                <h3>상담용 리포트로 정리해요</h3>
                <p>
                  변호사가 바로 이해할 수 있는 형식으로 정리해드립니다.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section id="process" className={styles.processSection}>
          <div className={styles.sectionInner}>
            <h2 className={styles.sectionTitle}>이렇게 진행됩니다</h2>
            <p className={styles.sectionSubtitle}>
              시작에서 리포트까지, 대화 하나로
            </p>

            <div className={styles.processSteps}>
              <article className={styles.processStep}>
                <span className={styles.stepNumber}>01</span>
                <h3>시작</h3>
                <p>
                  지금 어떤 상황인지
                  <br /> 짧게 알려주세요
                </p>
              </article>
              <span className={styles.stepArrow} aria-hidden="true" />
              <article className={styles.processStep}>
                <span className={styles.stepNumber}>02</span>
                <h3>AI와 대화</h3>
                <p>
                  물어보는 대로 답만
                  <br /> 하시면 자동 정리됩니다
                </p>
              </article>
              <span className={styles.stepArrow} aria-hidden="true" />
              <article className={styles.processStep}>
                <span className={styles.stepNumber}>03</span>
                <h3>리포트 완성</h3>
                <p>
                  상담에 바로 쓸 수 있는
                  <br /> 정리본을 받아보세요
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className={styles.finalCta}>
          <h2>5분이면 충분합니다</h2>
          <p>지금 무료로 시작해서 상담을 준비하세요</p>
          <Link href="/chat" className={styles.ctaButton}>
            시작하기 →
          </Link>
        </section>
      </main>

      <footer id="footer" className={styles.footer}>
        <div className={styles.footerInner}>
          <Link href="/" aria-label="LawPre 홈">
            <svg
              className={styles.footerLogo}
              viewBox="0 0 230 64"
              aria-hidden="true"
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
            </svg>
          </Link>
          <nav className={styles.footerLinks} aria-label="하단 메뉴">
            <a href="#features">서비스 소개</a>
            <span>이용약관</span>
            <span>개인정보처리방침</span>
            <span>문의</span>
          </nav>
          <span>© 2026 LawPre</span>
        </div>
      </footer>
    </div>
  );
}
