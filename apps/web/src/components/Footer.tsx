import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        {/* Classical Scholarship Quotation */}
        <div className="footer-quote-box">
          <div className="footer-quote-arabic">
            &ldquo;إِنَّ الْإِسْنَادَ مِنَ الدِّينِ، وَلَوْلَا الْإِسْنَادُ لَقَالَ مَنْ شَاءَ مَا شَاءَ&rdquo;
          </div>
          <div className="footer-quote-trans">
            &mdash; Classical Hadith Methodology Principle &bull; Sahih Muslim, Introduction
          </div>
        </div>

        <div className="footer-inner">
          <div>
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '24px',
                fontWeight: 700,
                color: 'var(--color-ivory)',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>Sanad</span>
              <span style={{ fontSize: '12px', color: 'var(--color-gold)' }}>&#9670;</span>
              <span style={{ fontFamily: 'var(--font-arabic)', fontSize: '20px', color: 'var(--color-gold)' }}>
                سند
              </span>
            </div>
            <p
              style={{
                fontSize: '14px',
                color: '#A3B2AF',
                lineHeight: 1.65,
                maxWidth: '340px',
                marginBottom: '18px',
              }}
            >
              The authentic verified-scholars-only sanctuary for classical Islamic sciences, isnad
              preservation, accredited masterclasses, and peer-reviewed religious discourse.
            </p>
          </div>

          <div>
            <div className="footer-col-title">Platform</div>
            <ul className="footer-links">
              <li>
                <Link href="/explore" className="footer-link">
                  Scholar Directory
                </Link>
              </li>
              <li>
                <Link href="/app" className="footer-link">
                  User Portal (app.sanad.app)
                </Link>
              </li>
              <li>
                <Link href="/how-verification-works" className="footer-link">
                  4-Stage Isnad Protocol
                </Link>
              </li>
              <li>
                <Link href="/#features" className="footer-link">
                  Platform Capabilities
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="footer-link">
                  Scholar Application FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="footer-col-title">Trust & Legal</div>
            <ul className="footer-links">
              <li>
                <Link href="/terms" className="footer-link">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="footer-link">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/conduct" className="footer-link">
                  Code of Scholarly Conduct
                </Link>
              </li>
              <li>
                <Link href="/delete-account" className="footer-link">
                  Account Deletion
                </Link>
              </li>
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
                  style={{ color: 'var(--color-gold-bright)', fontWeight: 600 }}
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
                  Lead Architect LinkedIn
                </a>
              </li>
              <li style={{ fontSize: '12px', color: '#7A8E8A', marginTop: '6px' }}>
                Engineered with Next.js, Express &amp; MongoDB Atlas
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div>&copy; 2026 Sanad Platform. All rights reserved. Authentic Isnad Network.</div>
          <div>Architected and Developed by Mohammed Khizer Shaikh</div>
        </div>
      </div>
    </footer>
  );
}
