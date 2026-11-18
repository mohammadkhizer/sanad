import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#0D1B1E',
        color: '#F4F1DE',
      }}
    >
      <header className="header">
        <div className="container header-inner">
          <Link href="/" className="brand-group">
            <div className="brand-crest">
              <span className="brand-crest-arabic">سند</span>
            </div>
            <div>
              <div className="brand-title">
                <span>Sanad</span>
                <span style={{ fontSize: '12px', color: 'var(--color-gold)' }}>&#9670;</span>
              </div>
              <div className="brand-subtitle">Authentic Isnad Platform</div>
            </div>
          </Link>
          <nav className="nav-links">
            <Link href="/" className="nav-link">
              Home
            </Link>
            <Link href="/explore" className="nav-link">
              Explore Scholars
            </Link>
            <Link href="/login" className="nav-link">
              Sign In
            </Link>
          </nav>
        </div>
      </header>
      <main
        className="section"
        style={{
          flex: 1,
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div className="container">
          <div className="hero-pill" style={{ margin: '0 auto 16px' }}>
            404 Not Found
          </div>
          <h1 className="hero-title" style={{ fontSize: '36px', marginBottom: '16px' }}>
            Page Not Found
          </h1>
          <p className="hero-subtitle" style={{ marginBottom: '24px' }}>
            The requested page does not exist or has been relocated within the Sanad platform.
          </p>
          <Link href="/" className="btn btn-primary">
            Return to Home
          </Link>
        </div>
      </main>
    </div>
  );
}

