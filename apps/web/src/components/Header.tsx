'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, isAuthenticated, isAdmin, isModerator, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
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
          <Link href="/explore" className="nav-link">
            Explore Scholars
          </Link>
          <Link href="/how-verification-works" className="nav-link">
            Verification Protocol
          </Link>
          <Link href="/#features" className="nav-link">
            Platform Capabilities
          </Link>
          <Link href="/#faq" className="nav-link">
            FAQ
          </Link>
          {isAuthenticated && (
            <Link href="/app" className="nav-link">
              User Portal
            </Link>
          )}
          {(isAdmin || isModerator) && (
            <Link
              href="/admin"
              className="nav-link"
              style={{ color: 'var(--color-gold-dark)', fontWeight: 700 }}
            >
              Admin Governance
            </Link>
          )}
        </nav>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {isAuthenticated && user ? (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Link
                href={`/profile/${user.username || user.id}`}
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--color-emerald)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>{user.displayName}</span>
                {user.username && (
                  <span style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
                    (@{user.username})
                  </span>
                )}
              </Link>
              <button
                onClick={logout}
                className="btn btn-outline"
                style={{ fontSize: '13px', padding: '6px 14px' }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="btn btn-outline"
                style={{ fontSize: '13px', padding: '8px 16px' }}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="btn btn-gold"
                style={{ fontSize: '13px', padding: '8px 18px' }}
              >
                Create Account
              </Link>
            </>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-menu-btn"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: 'var(--color-white)',
            borderBottom: '1px solid var(--color-border)',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <Link
            href="/explore"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-emerald)' }}
          >
            Explore Scholars & Users
          </Link>
          <Link
            href="/how-verification-works"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-emerald)' }}
          >
            Verification Protocol
          </Link>
          <Link
            href="/#features"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-emerald)' }}
          >
            Features & Capabilities
          </Link>
          <Link
            href="/#faq"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-emerald)' }}
          >
            FAQ
          </Link>
          {isAuthenticated && (
            <Link
              href="/app"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-emerald)' }}
            >
              User Portal
            </Link>
          )}
          {(isAdmin || isModerator) && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-gold-dark)' }}
            >
              Admin Governance
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
