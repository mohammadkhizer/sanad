import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export const metadata = {
  title: 'Privacy Policy | Sanad',
  description: 'Sanad privacy policy, data minimization, and protection guidelines.',
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="section">
        <div className="container">
          <div className="legal-content">
            <div className="legal-header">
              <h1 className="legal-h1">Privacy Policy</h1>
              <div className="legal-date">Last Updated: November 2026</div>
            </div>

            <div className="legal-section">
              <h2 className="legal-h2">1. Our Commitment</h2>
              <p className="legal-p">
                Sanad operates on a principle of sacred trust and data minimization. We do not sell your personal
                information, run commercial ad-tracking networks, or profile your learning patterns for third-party advertisers.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-h2">2. Information We Collect</h2>
              <ul className="legal-list">
                <li><strong>Account Information:</strong> Name, username, email address, password hash (Argon2), and date of birth (to enforce our minimum 13+ age requirement).</li>
                <li><strong>Scholar Dossiers:</strong> Ijazah scans, degrees, academic references, and identity documents submitted strictly for verification.</li>
                <li><strong>Usage Data:</strong> Operational telemetry, error crash logs, and minimal device tokens required for push notifications.</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2 className="legal-h2">3. Storage & Infrastructure</h2>
              <p className="legal-p">
                All data is encrypted in transit using modern TLS 1.3 encryption and stored in secure, hardened
                data centers. Media files and document scans are securely stored in Cloudflare R2 object storage with
                strict private access permissions.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-h2">4. Third-Party Processors</h2>
              <p className="legal-p">
                We utilize minimal, privacy-respecting infrastructure providers:
              </p>
              <ul className="legal-list">
                <li><strong>LiveKit Cloud:</strong> Real-time audio and video streaming for live halaqat sessions.</li>
                <li><strong>Mux Video:</strong> Video transcoding and streaming delivery for scholar reels.</li>
                <li><strong>MongoDB Atlas:</strong> Hardened document database storage.</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2 className="legal-h2">5. Your Privacy Rights</h2>
              <p className="legal-p">
                You have the right to inspect, export, or permanently delete your personal data at any time.
                Visit our <Link href="/delete-account" style={{ color: 'var(--color-emerald)', textDecoration: 'underline' }}>Account Deletion</Link> page for complete self-service instructions.
              </p>
            </div>

            <div style={{ marginTop: '40px' }}>
              <Link href="/" className="btn btn-outline">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

