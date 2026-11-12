import Link from 'next/link';

export default function Header() {
  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" className="brand-group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/splash-mark.png" alt="Sanad" className="brand-icon" />
          <div>
            <div className="brand-title">Sanad</div>
            <div className="brand-subtitle">Authentic Isnad Platform</div>
          </div>
        </Link>

        <nav className="nav-links">
          <Link href="/how-verification-works" className="nav-link">
            Verification Protocol
          </Link>
          <Link href="/#features" className="nav-link">
            Features
          </Link>
          <Link href="/#faq" className="nav-link">
            FAQ
          </Link>
          <Link href="/app" className="nav-link">
            App Portal
          </Link>
        </nav>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link href="/app" className="btn btn-outline" style={{ fontSize: '14px', padding: '8px 14px' }}>
            app.sanad.app
          </Link>
          <Link href="/app" className="btn btn-primary" style={{ fontSize: '14px', padding: '8px 16px' }}>
            Launch App
          </Link>
        </div>
      </div>
    </header>
  );
}

