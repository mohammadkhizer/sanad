import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        {/* HERO SECTION WITH ANDALUSIAN PALETTE & ISNAD VISUALIZER */}
        <section className="hero fade-in">
          <div className="container">
            <div className="hero-bismillah">
              بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
            </div>
            <div className="arabic-subtitle">
              سند • شبكة حفظ العلوم الشرعية بالأسانيد المتصلة
            </div>
            <div className="hero-pill">
              <span className="hero-pill-dot" />
              Authentic Scholarship Only • Strict 4-Stage Isnad Protocol
            </div>
            <h1 className="hero-title slide-up">
              Preserving Sacred Knowledge <br />
              Through <span className="hero-title-accent">Verified Chains</span> of Transmission
            </h1>
            <p className="hero-subtitle">
              Sanad is the verified-scholars-only social and learning sanctuary. Every teaching, reel,
              and consultation is authored exclusively by verified scholars holding accredited isnad
              and validated academic credentials.
            </p>

            <div className="hero-actions">
              <Link href="/app" className="btn btn-primary" style={{ padding: '15px 32px', fontSize: '16px' }}>
                Launch Web App (app.sanad.app)
              </Link>
              <Link href="/how-verification-works" className="btn btn-outline" style={{ padding: '15px 28px', fontSize: '16px' }}>
                How Verification Works
              </Link>
            </div>

            {/* INTERACTIVE ISNAD TRANSMISSION CHAIN (HERO VISUALIZER) */}
            <div className="isnad-showcase">
              <div className="isnad-showcase-header">
                <div className="isnad-showcase-title">
                  <span>Golden Chain of Transmission</span>
                  <span className="isnad-badge">Silsilat adh-Dhahab</span>
                </div>
                <span style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
                  Continuous Pedagogical Lineage
                </span>
              </div>

              <div className="isnad-chain-flow">
                <div className="isnad-node">
                  <div className="isnad-node-seal">م</div>
                  <div className="isnad-node-arabic">سيدنا رسول الله</div>
                  <div className="isnad-node-name">Sayyiduna Rasulullah</div>
                  <div className="isnad-node-role">Prophet and Messenger</div>
                </div>

                <div className="isnad-arrow">→</div>

                <div className="isnad-node">
                  <div className="isnad-node-seal">ع</div>
                  <div className="isnad-node-arabic">عبد الله بن عمر</div>
                  <div className="isnad-node-name">Abdullah ibn Umar</div>
                  <div className="isnad-node-role">Sahabi and Jurist</div>
                </div>

                <div className="isnad-arrow">→</div>

                <div className="isnad-node">
                  <div className="isnad-node-seal">ن</div>
                  <div className="isnad-node-arabic">نافع مولى ابن عمر</div>
                  <div className="isnad-node-name">Nafi Mawla Ibn Umar</div>
                  <div className="isnad-node-role">Tabii and Hadith Master</div>
                </div>

                <div className="isnad-arrow">→</div>

                <div className="isnad-node">
                  <div className="isnad-node-seal">م</div>
                  <div className="isnad-node-arabic">الإمام مالك بن أنس</div>
                  <div className="isnad-node-name">Imam Malik ibn Anas</div>
                  <div className="isnad-node-role">Founder of Maliki School</div>
                </div>

                <div className="isnad-arrow">→</div>

                <div className="isnad-node" style={{ borderColor: 'var(--color-gold)', background: 'var(--color-gold-subtle)' }}>
                  <div className="isnad-node-seal" style={{ background: 'var(--color-emerald)', color: 'var(--color-gold)' }}>س</div>
                  <div className="isnad-node-arabic">عالم موثق معتمد</div>
                  <div className="isnad-node-name">Authenticated Scholar</div>
                  <div className="isnad-node-role" style={{ color: 'var(--color-gold-dark)', fontWeight: 700 }}>Sanad Verified Faculty</div>
                </div>
              </div>
            </div>

            {/* HERO PLATFORM METRICS */}
            <div className="hero-stats">
              <div>
                <div className="stat-value">100%</div>
                <div className="stat-label">Verified Authorship</div>
              </div>
              <div>
                <div className="stat-value">4-Stage</div>
                <div className="stat-label">Isnad Chain Protocol</div>
              </div>
              <div>
                <div className="stat-value">Zero</div>
                <div className="stat-label">Unauthorized Feeds</div>
              </div>
              <div>
                <div className="stat-value">256-bit</div>
                <div className="stat-label">Cryptographic Auditing</div>
              </div>
            </div>
          </div>
        </section>

        {/* ORNAMENTAL DIVIDER */}
        <div className="arabesque-divider">
          <div className="arabesque-line" />
          <div className="arabesque-diamond" />
          <div className="arabesque-line" />
        </div>

        {/* VERIFICATION PROTOCOL OVERVIEW */}
        <section className="section section-alt">
          <div className="container">
            <div className="section-header">
              <div className="section-tag">Rigorous Standards</div>
              <h2 className="section-title">The 4-Stage Isnad Verification Protocol</h2>
              <p className="section-desc">
                Only scholars who successfully pass all four stages receive the Verified Green Badge
                and cryptographic authorization to publish sacred content and advise learners.
              </p>
            </div>

            <div className="step-grid">
              <div className="step-card">
                <div className="step-num">1</div>
                <h3 className="step-title">Dossier Submission</h3>
                <p className="step-body">
                  Scholars submit formal ijazahs, graduate degrees from recognized Islamic universities,
                  and official documentation of traditional madrasa lineages.
                </p>
              </div>

              <div className="step-card">
                <div className="step-num">2</div>
                <h3 className="step-title">Isnad Chain Tracing</h3>
                <p className="step-body">
                  Our academic committee verifies lineages back to classical masters, confirming teacher-to-student
                  transmissions and manuscript cross-references.
                </p>
              </div>

              <div className="step-card">
                <div className="step-num">3</div>
                <h3 className="step-title">Oral Peer Review</h3>
                <p className="step-body">
                  Senior faculty conduct a structured live oral interview to assess scientific mastery,
                  adherence to established consensus, and pedagogical adab.
                </p>
              </div>

              <div className="step-card">
                <div className="step-num">4</div>
                <h3 className="step-title">Two-Tier Sign-Off</h3>
                <p className="step-body">
                  Senior academic council grants the Verified Scholar badge, permanently binding publishing
                  privileges to strict cryptographic audit logs.
                </p>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '42px' }}>
              <Link href="/how-verification-works" className="btn btn-gold" style={{ padding: '14px 30px' }}>
                Read Full Verification Guidelines
              </Link>
            </div>
          </div>
        </section>

        {/* VERIFIED SCHOLAR DIRECTORY PREVIEW */}
        <section className="section">
          <div className="container">
            <div className="section-header">
              <div className="section-tag">Eminent Faculty</div>
              <h2 className="section-title">Accredited Scholars on Sanad</h2>
              <p className="section-desc">
                Learn directly from verified scholars across traditional disciplines: Hadith, Fiqh, Tafsir, and Qiraat.
              </p>
            </div>

            <div className="scholar-grid">
              <div className="scholar-card">
                <div className="scholar-avatar-ring">
                  <div className="scholar-initials">أز</div>
                </div>
                <h3 className="scholar-name">Dr. Ahmad Al-Azhari</h3>
                <div className="scholar-origin">Cairo, Egypt • Al-Azhar University</div>
                <div className="scholar-tag">Hadith Sciences and Usul</div>
                <div className="scholar-seal-badge">
                  <span>Verified Isnad Seal</span>
                </div>
              </div>

              <div className="scholar-card">
                <div className="scholar-avatar-ring">
                  <div className="scholar-initials">دم</div>
                </div>
                <h3 className="scholar-name">Fatima Al-Dimashqiyya</h3>
                <div className="scholar-origin">Damascus, Syria • Bilad al-Sham</div>
                <div className="scholar-tag">Ten Qiraat and Tajwid</div>
                <div className="scholar-seal-badge">
                  <span>Verified Isnad Seal</span>
                </div>
              </div>

              <div className="scholar-card">
                <div className="scholar-avatar-ring">
                  <div className="scholar-initials">شن</div>
                </div>
                <h3 className="scholar-name">Muhammad Al-Shinqiti</h3>
                <div className="scholar-origin">Nouakchott, Mauritania • Mahdharah</div>
                <div className="scholar-tag">Maliki Fiqh and Grammar</div>
                <div className="scholar-seal-badge">
                  <span>Verified Isnad Seal</span>
                </div>
              </div>

              <div className="scholar-card">
                <div className="scholar-avatar-ring">
                  <div className="scholar-initials">بخ</div>
                </div>
                <h3 className="scholar-name">Dr. Bilal Al-Bukhari</h3>
                <div className="scholar-origin">Istanbul, Turkey • Marmara Faculty</div>
                <div className="scholar-tag">Hanafi Jurisprudence and Mantiq</div>
                <div className="scholar-seal-badge">
                  <span>Verified Isnad Seal</span>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '36px' }}>
              <Link href="/explore" className="btn btn-outline" style={{ padding: '12px 28px' }}>
                Browse Full Scholar Directory
              </Link>
            </div>
          </div>
        </section>

        {/* ORNAMENTAL DIVIDER */}
        <div className="arabesque-divider">
          <div className="arabesque-line" />
          <div className="arabesque-diamond" />
          <div className="arabesque-line" />
        </div>

        {/* FEATURES GRID */}
        <section id="features" className="section section-alt">
          <div className="container">
            <div className="section-header">
              <div className="section-tag">Core Platform Capabilities</div>
              <h2 className="section-title">Designed for Traditional Islamic Sciences</h2>
              <p className="section-desc">
                Engineered for sacred scholarship, authentic chains of transmission, and structured academic study.
              </p>
            </div>

            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon-badge">Curriculum</div>
                <h3 className="feature-title">Verified Video Reels</h3>
                <p className="feature-desc">
                  Short-form educational videos with synchronous isnad notes, citation overlays,
                  and academic references. Only verified scholars can record and publish.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon-badge">Consultations</div>
                <h3 className="feature-title">1-on-1 Scholarly Inquiries</h3>
                <p className="feature-desc">
                  Direct one-on-one formal inquiry channel between learners and scholars, featuring
                  structured requests, file attachments, and verified fatwa archival.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon-badge">Scholarly Lineage</div>
                <h3 className="feature-title">Interactive Isnad Trees</h3>
                <p className="feature-desc">
                  Trace any teacher or text through centuries of authorized transmission with our
                  dynamic lineage graph visualization.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon-badge">Multilingual</div>
                <h3 className="feature-title">RTL and Multilingual Core</h3>
                <p className="feature-desc">
                  First-class support for Arabic, English, and Urdu with bidirectional layouts,
                  classical typography, and Arabic numeral formatting.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon-badge">Integrity</div>
                <h3 className="feature-title">Cryptographic Audit Trail</h3>
                <p className="feature-desc">
                  Every verification decision, credential check, and moderation action is recorded
                  in immutable audit ledgers to preserve absolute platform trust.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon-badge">Preservation</div>
                <h3 className="feature-title">Archival Islamic Library</h3>
                <p className="feature-desc">
                  Curated classical texts, verified commentary, and pedagogical syllabi accessible
                  with full citation provenance and scholarly annotations.
                </p>
              </div>
            </div>

            {/* APP DOMAIN CALLOUT */}
            <div className="app-portal-banner">
              <div>
                <h3 className="portal-title">Access the User Application at app.sanad.app</h3>
                <p className="portal-desc">
                  Experience Sanad on any modern device. Our responsive client application runs
                  seamlessly on web, iOS, and Android with complete offline persistence and instant synchronization.
                </p>
              </div>
              <Link href="/app" className="btn btn-gold" style={{ flexShrink: 0, padding: '14px 28px', fontSize: '15px' }}>
                Open Web Application
              </Link>
            </div>
          </div>
        </section>

        {/* DEVELOPER ATTRIBUTION */}
        <section className="section">
          <div className="container">
            <div className="dev-banner">
              <div>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-gold)', fontWeight: 700, marginBottom: '6px' }}>
                  Engineering Leadership and Architecture
                </div>
                <h3 className="dev-info-title">Mohammed Khizer Shaikh</h3>
                <p className="dev-subtitle">
                  Lead Software Architect responsible for Sanad verified platform engineering,
                  security architecture, and scholarly verification systems.
                </p>
              </div>
              <div className="dev-actions">
                <a
                  href="https://mohammedkhizershaikh.netlify.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  Portfolio
                </a>
                <a
                  href="https://www.linkedin.com/in/mohammed-khizer-shaikh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="section section-alt">
          <div className="container">
            <div className="section-header">
              <div className="section-tag">Common Questions</div>
              <h2 className="section-title">Frequently Asked Questions</h2>
              <p className="section-desc">
                Everything you need to know about publishing, learning, and verification on Sanad.
              </p>
            </div>

            <div className="faq-list">
              <div className="faq-item">
                <div className="faq-q">Can regular members post video reels or write public articles?</div>
                <div className="faq-a">
                  No. To protect religious discourse from misinformation and uncredentialed opinions,
                  only verified scholars who have passed the 4-Stage Protocol are granted publishing rights.
                  Regular members can comment respectfully, ask questions, participate in consultations, and save curricula.
                </div>
              </div>

              <div className="faq-item">
                <div className="faq-q">What credentials are accepted for verification?</div>
                <div className="faq-a">
                  We accept traditional sanad/ijazah certifications in specific disciplines (Hadith, Fiqh,
                  Tafsir, Qiraat), as well as graduate degrees (MA, PhD, or equivalent) in Islamic Studies
                  from accredited classical seminaries and universities.
                </div>
              </div>

              <div className="faq-item">
                <div className="faq-q">How does the web application at app.sanad.app work?</div>
                <div className="faq-a">
                  The user web portal at app.sanad.app allows authenticated users and scholars to access
                  the complete Sanad experience from any browser, matching the features of our iOS and Android builds.
                </div>
              </div>

              <div className="faq-item">
                <div className="faq-q">How is user privacy protected?</div>
                <div className="faq-a">
                  Sanad adheres to strict data minimization. We do not sell user data, run third-party ad trackers,
                  or monetize user viewing habits. All media is encrypted in transit and at rest on secure Cloudflare R2 storage.
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
