'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, isAuthenticated, isAdmin, isModerator, logout } = useAuth();

  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" className="brand-group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/splash-mark.png" alt="Sanad" className="brand-icon" />
          <div>
            <div className="brand-title">Sanad</div>
            <div className="brand-subtitle">Authentic Isnad Platform</div>
          </div>
        </Link>

        <nav className="nav-links">
          <Link href="/explore" className="nav-link">
            Explore Users
          </Link>
          <Link href="/how-verification-works" className="nav-link">
            Verification Protocol
          </Link>
          <Link href="/#features" className="nav-link">
            Features
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
              style={{ color: 'var(--color-gold)', fontWeight: 700 }}
            >
              Admin Dashboard
            </Link>
          )}
        </nav>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
                style={{ fontSize: '13px', padding: '6px 12px' }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="btn btn-outline"
                style={{ fontSize: '14px', padding: '8px 14px' }}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="btn btn-primary"
                style={{ fontSize: '14px', padding: '8px 16px' }}
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
