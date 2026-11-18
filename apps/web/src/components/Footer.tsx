import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-sanad-border bg-[#072924] text-white pt-14 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Classical Epistemology Inscription */}
        <div className="border border-sanad-gold/30 bg-white/5 rounded-2xl p-6 sm:p-8 text-center mb-12 backdrop-blur-sm">
          <div className="font-arabic text-xl sm:text-2xl text-sanad-gold font-bold mb-3 tracking-wide leading-relaxed">
            &ldquo;إِنَّ الْإِسْنَادَ مِنَ الدِّينِ، وَلَوْلَا الْإِسْنَادُ لَقَالَ مَنْ شَاءَ مَا شَاءَ&rdquo;
          </div>
          <div className="text-xs uppercase tracking-[0.16em] text-white/70 font-semibold">
            Classical Hadith Methodology Principle &bull; Sahih Muslim, Introduction
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg border border-sanad-gold bg-sanad-emerald flex items-center justify-center font-arabic text-lg font-bold text-sanad-gold">
                سند
              </div>
              <span className="font-serif text-2xl font-bold tracking-wider text-white">
                SANAD
              </span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              The premier social and pedagogical platform reserved exclusively for verified classical Islamic scholars and serious students of sacred knowledge.
            </p>
          </div>

          {/* Platform Exploration */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-sanad-gold font-extrabold mb-4">
              Knowledge Hub
            </h4>
            <ul className="space-y-2.5 text-xs text-white/80 font-medium">
              <li>
                <Link href="/" className="hover:text-sanad-gold transition-colors">
                  Scholarly Feed
                </Link>
              </li>
              <li>
                <Link href="/explore" className="hover:text-sanad-gold transition-colors">
                  Verified Scholars Directory
                </Link>
              </li>
              <li>
                <Link href="/reels" className="hover:text-sanad-gold transition-colors">
                  Video Lessons &amp; Exegesis
                </Link>
              </li>
              <li>
                <Link href="/how-verification-works" className="hover:text-sanad-gold transition-colors">
                  Isnad Verification Methodology
                </Link>
              </li>
            </ul>
          </div>

          {/* Scholarship & Academy */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-sanad-gold font-extrabold mb-4">
              Academic Faculty
            </h4>
            <ul className="space-y-2.5 text-xs text-white/80 font-medium">
              <li>
                <Link href="/scholar/apply" className="hover:text-sanad-gold transition-colors">
                  Apply for Accreditation
                </Link>
              </li>
              <li>
                <Link href="/scholar/status" className="hover:text-sanad-gold transition-colors">
                  Check Review Status
                </Link>
              </li>
              <li>
                <Link href="/conduct" className="hover:text-sanad-gold transition-colors">
                  Code of Academic Conduct
                </Link>
              </li>
              <li>
                <Link href="/settings" className="hover:text-sanad-gold transition-colors">
                  Account Governance
                </Link>
              </li>
            </ul>
          </div>

          {/* Architectural Attribution & Legal */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-sanad-gold font-extrabold mb-4">
              Architectural Credits
            </h4>
            <div className="text-xs text-white/70 space-y-2 leading-relaxed">
              <div>
                Designed &amp; Architected by{' '}
                <a
                  href="https://mohammedkhizershaikh.netlify.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sanad-gold font-bold hover:underline"
                >
                  Mohammed Khizer Shaikh
                </a>
              </div>
              <div>
                <a
                  href="https://www.linkedin.com/in/mohammed-khizer-shaikh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white transition-colors"
                >
                  Professional Profile on LinkedIn
                </a>
              </div>
              <div className="pt-2 text-[11px] text-white/50">
                Rigorous cryptographic verification &bull; Zero advertising &bull; Pure transmission.
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-white/50 gap-4">
          <div>
            &copy; 2026 Sanad Academic Foundation. All rights reserved.
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/delete-account" className="hover:text-white transition-colors">
              Delete Account
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
