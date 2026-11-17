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
        <Link href="/admin" className="brand-group">
          <div className="brand-crest">
            <span className="brand-crest-arabic">سند</span>
          </div>
          <div>
            <div className="brand-title">
              <span>Sanad Admin</span>
              <span style={{ fontSize: '12px', color: 'var(--color-gold)' }}>&#9670;</span>
            </div>
            <div className="brand-subtitle">Platform Governance Suite</div>
          </div>
        </Link>

        {isAuthenticated && (isAdmin || isModerator) && (
          <nav className="nav-links">
            <Link href="/admin" className="nav-link">
              Overview
            </Link>
            <Link href="/admin/users" className="nav-link">
              User Governance
            </Link>
            <Link href="/admin/review-queue" className="nav-link">
              Scholar Review
            </Link>
            <Link href="/admin/activity" className="nav-link">
              Security Monitor
            </Link>
            <Link href="/admin/reports" className="nav-link">
              Safety Queue
            </Link>
            <Link href="/admin/audit-logs" className="nav-link">
              Audit Logs
            </Link>
          </nav>
        )}

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {isAuthenticated && user ? (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--color-emerald)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span
                  style={{
                    backgroundColor: 'var(--color-gold-subtle)',
                    color: 'var(--color-gold-hover)',
                    border: '1px solid var(--color-gold)',
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                  }}
                >
                  Admin
                </span>
                <span>{user.displayName}</span>
              </div>
              <button
                onClick={logout}
                className="btn btn-outline"
                style={{ fontSize: '13px', padding: '6px 14px' }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="btn btn-primary"
              style={{ fontSize: '13px', padding: '8px 18px' }}
            >
              Admin Sign In
            </Link>
          )}

          {isAuthenticated && (isAdmin || isModerator) && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-menu-btn"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? 'Close' : 'Menu'}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && isAuthenticated && (isAdmin || isModerator) && (
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
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-emerald)' }}
          >
            Platform Overview
          </Link>
          <Link
            href="/admin/users"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-emerald)' }}
          >
            User Governance
          </Link>
          <Link
            href="/admin/review-queue"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-emerald)' }}
          >
            Scholar Review Queue
          </Link>
          <Link
            href="/admin/activity"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-emerald)' }}
          >
            Security Activity Monitor
          </Link>
          <Link
            href="/admin/reports"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-emerald)' }}
          >
            Trust &amp; Safety Queue
          </Link>
          <Link
            href="/admin/audit-logs"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-emerald)' }}
          >
            Audit Trail
          </Link>
        </div>
      )}
    </header>
  );
}
