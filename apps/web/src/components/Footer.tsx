import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-inner">
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', fontWeight: 700, color: 'var(--color-ivory)', marginBottom: '8px' }}>
              Sanad
            </div>
            <p style={{ fontSize: '14px', color: '#A3B2AF', lineHeight: 1.6, maxWidth: '320px', marginBottom: '16px' }}>
              The authentic verified-scholars-only platform for classical Islamic sciences, isnad methodology, masterclasses, and halaqah circles.
            </p>
            <p style={{ fontSize: '13px', color: '#7A8E8A' }}>
              Designed with 60% Ivory, 30% Emerald, and 10% Gold.
            </p>
          </div>

          <div>
            <div className="footer-col-title">Platform</div>
            <ul className="footer-links">
              <li><Link href="/app" className="footer-link">App Portal (app.sanad.app)</Link></li>
              <li><Link href="/how-verification-works" className="footer-link">Verification Protocol</Link></li>
              <li><Link href="/#features" className="footer-link">Features</Link></li>
              <li><Link href="/#faq" className="footer-link">Scholar Application FAQ</Link></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Legal & Trust</div>
            <ul className="footer-links">
              <li><Link href="/terms" className="footer-link">Terms of Service</Link></li>
              <li><Link href="/privacy" className="footer-link">Privacy Policy</Link></li>
              <li><Link href="/conduct" className="footer-link">Code of Conduct</Link></li>
              <li><Link href="/delete-account" className="footer-link">Account Deletion</Link></li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Engineering</div>
            <ul className="footer-links">
              <li>
                <a
                  href="https://mohammedkhizershaikh.netlify.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link"
                >
                  Mohammed Khizer Shaikh (Portfolio)
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/mohammed-khizer-shaikh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link"
                >
                  Developer LinkedIn
                </a>
              </li>
              <li><span style={{ fontSize: '13px', color: '#7A8E8A' }}>Architecture: Expo SDK 58 + Node.js 22 + Next.js</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div>(C) 2026 Sanad Platform. All rights reserved. Authentic Isnad Network.</div>
          <div>Crafted by Mohammed Khizer Shaikh</div>
        </div>
      </div>
    </footer>
  );
}

