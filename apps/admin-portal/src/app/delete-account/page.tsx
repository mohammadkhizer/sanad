import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export const metadata = {
  title: 'Delete Your Account | Sanad',
  description:
    'Instructions and self-service process to delete your account and personal data from Sanad.',
};

export default function DeleteAccountPage() {
  return (
    <>
      <Header />
      <main className="section">
        <div className="container">
          <div className="legal-content">
            <div className="legal-header">
              <h1 className="legal-h1">Account and Data Deletion</h1>
              <div className="legal-date">User Privacy & GDPR/CCPA Compliance</div>
            </div>

            <div className="legal-section">
              <h2 className="legal-h2">Commitment to Data Minimization</h2>
              <p className="legal-p">
                At Sanad, we believe that users retain ultimate ownership over their identity and personal
                data. In accordance with Apple App Store guidelines, Google Play developer policies, and global
                privacy standards (GDPR, CCPA), you may permanently delete your account and all associated
                personal records at any time.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-h2">Method 1: Direct In-App Deletion (Instant)</h2>
              <p className="legal-p">
                You can delete your account immediately within the Sanad mobile or web client without contacting support:
              </p>
              <ul className="legal-list">
                <li>Open the Sanad application on your mobile device or at <strong>app.sanad.app</strong>.</li>
                <li>Navigate to your <strong>Profile</strong> tab (bottom right navigation bar).</li>
                <li>Tap the <strong>Settings</strong> gear icon in the top right corner.</li>
                <li>Scroll down to the <strong>Account & Security</strong> section.</li>
                <li>Tap <strong>Delete Account</strong> and confirm your password when prompted.</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2 className="legal-h2">Method 2: Web Request Form</h2>
              <p className="legal-p">
                If you no longer have access to the mobile application or your device, you can submit an account
                deletion request via email to our data privacy team at:
              </p>
              <div
                style={{
                  backgroundColor: 'var(--color-ivory-alt)',
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'monospace',
                  fontSize: '15px',
                  color: 'var(--color-emerald)',
                  marginBottom: '20px',
                  border: '1px solid var(--color-border)',
                }}
              >
                support@sanad.app (Subject: Account Deletion Request)
              </div>
              <p className="legal-p">
                Please send your request from the email address registered with your Sanad account. Our automated
                data processing service will verify your identity and finalize deletion within 48 business hours.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-h2">What Data is Deleted?</h2>
              <ul className="legal-list">
                <li><strong>Identity Information:</strong> Full name, username, email address, date of birth, bio, avatar, and credentials.</li>
                <li><strong>Social Activity:</strong> Saved bookmarks, likes, comments, and follow relationships.</li>
                <li><strong>Private Messages:</strong> Chat history, direct inquiry records, and temporary audio logs.</li>
                <li><strong>Authentication Tokens:</strong> Active sessions, refresh tokens, and device push notification tokens are instantly revoked and purged.</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2 className="legal-h2">What Data is Retained?</h2>
              <p className="legal-p">
                To satisfy legal and anti-fraud regulations, anonymized cryptographic transaction logs
                and records of resolved security abuse incidents may be retained in an immutable hash ledger
                for up to 90 days before final cryptographic purge. No personal identifiers are attached to these hashes.
              </p>
            </div>

            <div style={{ marginTop: '40px', display: 'flex', gap: '16px' }}>
              <Link href="/app" className="btn btn-primary">
                Open App Settings
              </Link>
              <Link href="/" className="btn btn-outline">
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

