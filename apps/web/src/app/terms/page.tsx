import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | Sanad',
  description: 'Sanad platform terms of service, user agreement, and end user license terms.',
};

export default function TermsPage() {
  return (
    <div className="py-12 px-4 sm:px-6 max-w-4xl mx-auto">
      <div className="legal-content">
            <div className="legal-header">
              <h1 className="legal-h1">Terms of Service & EULA</h1>
              <div className="legal-date">Last Updated: November 2026</div>
            </div>

            <div className="legal-section">
              <h2 className="legal-h2">1. Agreement to Terms</h2>
              <p className="legal-p">
                By downloading, accessing, or using Sanad through our mobile application or web portal
                (sanad.app and app.sanad.app), you agree to be bound by these Terms of Service.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-h2">2. Eligibility & Age Requirements</h2>
              <p className="legal-p">
                You must be at least 13 years of age to register an account on Sanad. Users between 13 and
                the age of majority in their jurisdiction may only use Sanad under the direct supervision
                of a parent or legal guardian.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-h2">3. Verified Scholarly Publishing</h2>
              <p className="legal-p">
                Publishing reels, public curricular guides, and broadcasting live halaqat is restricted
                exclusively to accounts that have been vetted and approved through our 4-Stage Isnad Verification
                Protocol. Misrepresentation of academic qualifications or fraudulent ijazahs results in immediate
                and permanent account termination.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-h2">4. User Conduct & Content Standards</h2>
              <p className="legal-p">
                All users must observe respectful discourse and traditional Islamic adab. Harassment, sectarian
                vilification, hate speech, defamation, and promotion of extremism are strictly prohibited and subject
                to immediate moderation action.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-h2">5. Intellectual Property</h2>
              <p className="legal-p">
                Scholars retain moral authorship and copyright of their original educational lectures and commentaries.
                By posting on Sanad, scholars grant the platform a non-exclusive license to host, display, and stream
                their content to enrolled learners.
              </p>
            </div>

        <div style={{ marginTop: '40px' }}>
          <Link href="/feed" className="text-xs font-bold text-sanad-emerald hover:underline">
            &larr; Return to Knowledge Feed
          </Link>
        </div>
      </div>
    </div>
  );
}

