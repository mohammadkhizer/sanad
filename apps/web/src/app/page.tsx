import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        {/* HERO SECTION */}
        <section className="hero">
          <div className="container">
            <div className="hero-pill">
              Authentic Scholarship Only - Zero Unverified Content
            </div>
            <h1 className="hero-title">
              Preserving Sacred Knowledge <br />
              Through Verified Chains of Transmission
            </h1>
            <p className="hero-subtitle">
              Sanad is the verified-scholars-only social and learning platform. Every teaching, reel,
              and masterclass is authored exclusively by verified scholars holding accredited isnad
              and academic credentials.
            </p>

            <div className="hero-actions">
              <Link href="/app" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '16px' }}>
                Launch Web App (app.sanad.app)
              </Link>
              <Link href="/how-verification-works" className="btn btn-outline" style={{ padding: '14px 24px', fontSize: '16px' }}>
                How Verification Works
              </Link>
            </div>

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
            </div>
          </div>
        </section>

        {/* VERIFICATION PROTOCOL OVERVIEW */}
        <section className="section section-alt">
          <div className="container">
            <div className="section-header">
              <div className="section-tag">Rigorous Standards</div>
              <h2 className="section-title">The 4-Stage Isnad Verification Protocol</h2>
              <p className="section-desc">
                Only scholars who successfully complete all four stages receive the Verified Green Badge
                and authorization to publish content or conduct live halaqat.
              </p>
            </div>

            <div className="step-grid">
              <div className="step-card">
                <div className="step-num">1</div>
                <h3 className="step-title">Dossier Submission</h3>
                <p className="step-body">
                  Scholars submit formal ijazahs, graduate degrees from recognized Islamic universities,
                  and documentation of traditional madrasa lineages.
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

            <div style={{ textAlign: 'center', marginTop: '36px' }}>
              <Link href="/how-verification-works" className="btn btn-gold">
                Read Full Verification Guidelines
              </Link>
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section id="features" className="section">
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
                <div className="feature-icon-badge">Interactive</div>
                <h3 className="feature-title">Live Halaqat & Masterclasses</h3>
                <p className="feature-desc">
                  Interactive real-time audio and video sessions hosted by scholars. High-fidelity
                  streaming infrastructure for crystal-clear recitations and live Q&A.
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon-badge">Mentorship</div>
                <h3 className="feature-title">Scholarly Inquiries</h3>
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
                <h3 className="feature-title">RTL & Multilingual Core</h3>
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
              <Link href="/app" className="btn btn-gold" style={{ flexShrink: 0, padding: '14px 24px', fontSize: '15px' }}>
                Open Web Application
              </Link>
            </div>
          </div>
        </section>

        {/* DEVELOPER ATTRIBUTION */}
        <section className="section section-alt">
          <div className="container">
            <div className="dev-banner">
              <div>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-gold)', fontWeight: 700, marginBottom: '4px' }}>
                  Engineering Leadership & Architecture
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
        <section id="faq" className="section">
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
                  Regular members can comment respectfully, ask questions, join halaqat, and save curricula.
                </div>
              </div>

              <div className="faq-item">
                <div className="faq-q">What credentials are accepted for verification?</div>
                <div className="faq-a">
                  We accept traditional sanad/ijazah certifications in specific disciplines (Hadith, Fiqh,
                  Tafsir, Qira&apos;at), as well as graduate degrees (MA, PhD, or equivalent) in Islamic Studies
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
                  or monetize user viewing habits. All media is encrypted in transit and at rest.
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

