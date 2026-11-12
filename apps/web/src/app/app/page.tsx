import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export const metadata = {
  title: 'Sanad Web Application Portal | app.sanad.app',
  description:
    'Web application client for Sanad. Access verified scholar feeds, live halaqat, and scholarly inquiries from any modern browser.',
};

export default function AppPortalPage() {
  return (
    <>
      <Header />
      <main className="section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <div className="container">
          <div style={{ maxWidth: '840px', margin: '0 auto', textAlign: 'center' }}>
            <div className="hero-pill" style={{ margin: '0 auto 20px' }}>
              app.sanad.app - User Web Application
            </div>
            <h1 className="hero-title" style={{ fontSize: '42px', marginBottom: '16px' }}>
              Sanad Web Application Portal
            </h1>
            <p className="hero-subtitle" style={{ marginBottom: '36px' }}>
              Welcome to the official client for Sanad. Explore verified scholar discourses,
              attend interactive halaqat circles, and submit private inquiries.
            </p>

            <div
              style={{
                backgroundColor: 'var(--color-white)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '36px',
                textAlign: 'left',
                marginBottom: '36px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h2 style={{ fontSize: '20px', color: 'var(--color-emerald)', marginBottom: '16px' }}>
                Application Runtime Environments
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                <div style={{ padding: '20px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-ivory)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-emerald)', marginBottom: '6px' }}>
                    Web Browser Client
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '16px' }}>
                    Runs locally on port 8081 via Expo Web bundler or hosted on app.sanad.app.
                  </p>
                  <a
                    href="http://localhost:8081"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ width: '100%', fontSize: '14px', padding: '8px 12px' }}
                  >
                    Open Local Web App (Port 8081)
                  </a>
                </div>

                <div style={{ padding: '20px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-ivory)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-emerald)', marginBottom: '6px' }}>
                    Mobile Development Build
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '16px' }}>
                    Expo SDK 58 development build running with custom native runtimes on Android and iOS.
                  </p>
                  <div style={{ fontSize: '12px', fontFamily: 'monospace', backgroundColor: 'var(--color-white)', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                    npm run dev:mobile
                  </div>
                </div>

                <div style={{ padding: '20px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-ivory)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-emerald)', marginBottom: '6px' }}>
                    Backend REST & Socket API
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '16px' }}>
                    Node.js Express + MongoDB API serving endpoints on port 4000.
                  </p>
                  <a
                    href="http://localhost:4000/api/v1/health"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                    style={{ width: '100%', fontSize: '14px', padding: '8px 12px' }}
                  >
                    API Health Check
                  </a>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
              <Link href="/" className="btn btn-outline">
                Return to Marketing Home
              </Link>
              <Link href="/how-verification-works" className="btn btn-gold">
                Learn About Verification
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

