import Link from 'next/link';

export const metadata = {
  title: 'Isnad Verification Protocol | Sanad',
  description:
    'Comprehensive documentation of the 4-stage verification process required for scholars to publish on Sanad.',
};

export default function VerificationPage() {
  return (
    <div className="py-12 px-4 sm:px-6 max-w-4xl mx-auto">
      <div className="legal-content">
            <div className="legal-header">
              <h1 className="legal-h1">How Verification Works</h1>
              <div className="legal-date">The 4-Stage Scholarly Authentication Protocol</div>
            </div>

            <div className="legal-section">
              <h2 className="legal-h2">Purpose and Scope</h2>
              <p className="legal-p">
                Sanad was conceived to solve the widespread proliferation of unauthorized, misleading,
                and context-deprived religious statements on algorithmic social feeds. To preserve the
                traditional transmission of sacred Islamic sciences, Sanad strictly limits public publishing
                privileges to scholars who have demonstrated traditional lineage (isnad) and formal mastery.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-h2">Stage 1: Primary Dossier Submission</h2>
              <p className="legal-p">
                Prospective scholars submit a comprehensive digital dossier through the Sanad application.
                This includes:
              </p>
              <ul className="legal-list">
                <li>Formal Ijazah certificates in specific disciplines with readable teacher seals.</li>
                <li>Transcripts or degree verification from recognized Islamic universities (e.g. Al-Azhar, Islamic University of Madinah, Darul Uloom, Zaytuna).</li>
                <li>Detailed biographical sketch and curriculum of studied classical texts.</li>
                <li>Government-issued photographic identification for identity binding.</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2 className="legal-h2">Stage 2: Lineage Cross-Verification</h2>
              <p className="legal-p">
                Our academic verification committee examines the provided chain of transmission (isnad)
                against our historical scholarly registry. We verify:
              </p>
              <ul className="legal-list">
                <li>Contiguity of teachers in the claimed isnad back to recognized classical authors.</li>
                <li>Direct contact with issuing institutions or living shuyukh to confirm certification validity.</li>
                <li>Absence of repudiation or formal revocations by certifying authorities.</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2 className="legal-h2">Stage 3: Oral Examination & Peer Assessment</h2>
              <p className="legal-p">
                Candidates undergo a scheduled structured interview with senior council members.
                The review covers:
              </p>
              <ul className="legal-list">
                <li>Competence in foundational usul, grammar, and methodology.</li>
                <li>Commitment to classical adab al-ikhtilaf (etiquette of disagreement).</li>
                <li>Agreement to adhere strictly to the Sanad Content Integrity Policy.</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2 className="legal-h2">Stage 4: Council Ratification & Badge Issuance</h2>
              <p className="legal-p">
                Upon unanimous recommendation, the Academic Council issues the verified scholar cryptographic
                credential. The scholar is granted:
              </p>
              <ul className="legal-list">
                <li>The Verified Scholar Badge (Emerald and Gold seal) on their public profile.</li>
                <li>Full access to post video reels, articles, and curriculum paths.</li>
                <li>Authorization to schedule and host live interactive halaqat circles.</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2 className="legal-h2">Ongoing Auditing and Revocation</h2>
              <p className="legal-p">
                Verification is not a permanent title without accountability. If a scholar violates platform
                guidelines, engages in sectarian incitement, or if their certifying credentials are challenged,
                the council conducts an immediate review with potential badge suspension or revocation.
              </p>
            </div>

        <div style={{ marginTop: '40px', display: 'flex', gap: '16px' }}>
          <Link href="/scholar/apply" className="px-4 py-2 rounded-lg bg-sanad-emerald text-white text-xs font-bold hover:bg-sanad-emerald-deep">
            Apply for Scholar Accreditation
          </Link>
          <Link href="/feed" className="px-4 py-2 rounded-lg border border-sanad-border text-xs font-bold text-sanad-slate hover:bg-sanad-ivory-warm">
            Return to Feed
          </Link>
        </div>
      </div>
    </div>
  );
}

