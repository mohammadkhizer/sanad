import Link from 'next/link';

export const metadata = {
  title: 'Community Code of Conduct | Sanad',
  description: 'Ethical standards, etiquette of disagreement, and community guidelines for Sanad.',
};

export default function ConductPage() {
  return (
    <div className="py-12 px-4 sm:px-6 max-w-4xl mx-auto">
      <div className="legal-content">
            <div className="legal-header">
              <h1 className="legal-h1">Community Code of Conduct</h1>
              <div className="legal-date">Traditional Adab & Etiquette of Learning</div>
            </div>

            <div className="legal-section">
              <h2 className="legal-h2">1. Foundations of Sacred Adab</h2>
              <p className="legal-p">
                Knowledge in classical Islam is indivisible from character and humility. Sanad exists
                to revive the sacred etiquette that historically governed scholarly discourse and student-teacher relations.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-h2">2. Etiquette of Disagreement (Adab al-Ikhtilaf)</h2>
              <p className="legal-p">
                Differences of opinion among legitimate, recognized schools of jurisprudence (Madhahib)
                and theology (Aqidah) are a recognized historical reality. Disagreements must be articulated
                with academic evidence, respectful tone, and total absence of ad hominem attacks.
              </p>
            </div>

            <div className="legal-section">
              <h2 className="legal-h2">3. Prohibited Conduct</h2>
              <ul className="legal-list">
                <li><strong>Takfir & Sectarian Vilification:</strong> Accusing believers of apostasy, heresy, or blasphemy outside established judicial due process.</li>
                <li><strong>Harassment & Trolling:</strong> Deliberately provocative questioning designed to incite anger or disrespect scholars.</li>
                <li><strong>Commercial Spam:</strong> Solicitation of funds, unverified charitable campaigns, or commercial product promotions.</li>
                <li><strong>Impersonation:</strong> Creating false personas or claiming unaccredited religious authority.</li>
              </ul>
            </div>

            <div className="legal-section">
              <h2 className="legal-h2">4. Reporting Violations</h2>
              <p className="legal-p">
                If you encounter content or conduct that violates this code, use the in-app report button
                on any reel, comment, or profile. Reports are triaged by our human moderation committee
                under strict P0/P1/P2 priority queues.
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

