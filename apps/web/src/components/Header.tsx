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
        <Link href="/admin" className="brand-group" title="Sanad Admin - Platform Governance Suite">
          <div
            style={{
              position: 'relative',
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              border: '1.5px solid var(--color-gold)',
              boxShadow: 'var(--shadow-sm)',
              overflow: 'hidden',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, var(--color-emerald) 0%, var(--color-emerald-deep) 100%)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/splash-mark.png"
              alt="Sanad Crest"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', lineHeight: 1.15 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '22px',
                  fontWeight: 800,
                  color: 'var(--color-emerald)',
                  letterSpacing: '0.06em',
                  lineHeight: 1.1,
                }}
              >
                SANAD
              </span>
              <span
                style={{
                  backgroundColor: 'var(--color-gold-subtle)',
                  color: 'var(--color-gold-dark)',
                  border: '1px solid var(--color-gold)',
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '4px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  lineHeight: 1.2,
                }}
              >
                ADMIN
              </span>
            </div>
            <div
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: 'var(--color-gold-dark)',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                marginTop: '4px',
                whiteSpace: 'nowrap',
              }}
            >
              Platform Governance Suite
            </div>
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
              <Link
                href={`/profile/${user.id || user._id || 'me'}`}
                title="View Administrator Profile"
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--color-emerald)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-ivory-warm)',
                  border: '1px solid var(--color-border)',
                  transition: 'all 0.15s ease',
                  textDecoration: 'none',
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
                <span style={{ fontWeight: 700, color: 'var(--color-charcoal)' }}>
                  {user.displayName}
                </span>
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
            href={`/profile/${user?.id || user?._id || 'me'}`}
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-gold-dark)' }}
          >
            My Admin Profile ({user?.displayName})
          </Link>
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
