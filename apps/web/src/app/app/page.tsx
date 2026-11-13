'use client';

import React from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';

export default function AppPortalPage() {
  const { user, isAuthenticated, isAdmin, isModerator } = useAuth();

  return (
    <>
      <Header />
      <main className="section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <div className="container">
          <div style={{ maxWidth: '840px', margin: '0 auto', textAlign: 'center' }}>
            <div className="hero-pill" style={{ margin: '0 auto 20px' }}>
              app.sanad.app - User Web Application
            </div>

            <h1 className="hero-title" style={{ fontSize: '38px', marginBottom: '14px' }}>
              {isAuthenticated && user
                ? `Welcome back, ${user.displayName}`
                : 'Sanad Web Application Portal'}
            </h1>

            <p className="hero-subtitle" style={{ marginBottom: '32px' }}>
              {isAuthenticated && user
                ? `Logged in as @${user.username || 'user'} (Public ID: ${user.publicId || user.id}). Explore verified discourse, connect with scholars, and participate in academic circles.`
                : 'Explore verified scholar discourses, attend interactive halaqat circles, and connect with peers.'}
            </p>

            {/* Authenticated Quick Status */}
            {isAuthenticated && user && (
              <div
                style={{
                  backgroundColor: '#FAF5EC',
                  border: '1px solid var(--color-gold)',
                  borderRadius: 'var(--radius-md)',
                  padding: '18px 24px',
                  marginBottom: '28px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  textAlign: 'left',
                }}
              >
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-emerald)' }}>
                    Active Persona: {user.displayName}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '2px' }}>
                    Roles: {user.roles.join(', ')} | Public ID: {user.publicId || user.id}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link
                    href={`/profile/${user.username || user.id}`}
                    className="btn btn-primary"
                    style={{ fontSize: '13px', padding: '6px 14px' }}
                  >
                    View My Profile
                  </Link>

                  {(isAdmin || isModerator) && (
                    <Link
                      href="/admin"
                      className="btn btn-gold"
                      style={{ fontSize: '13px', padding: '6px 14px' }}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                </div>
              </div>
            )}

            <div
              style={{
                backgroundColor: 'var(--color-white)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '36px',
                textAlign: 'left',
                marginBottom: '36px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h2 style={{ fontSize: '20px', color: 'var(--color-emerald)', marginBottom: '16px' }}>
                Application Runtime Environments
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                <div style={{ padding: '20px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-ivory)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-emerald)', marginBottom: '6px' }}>
                    Directory & Search
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '16px' }}>
                    Search across all users by their unique username, public ID, and discipline.
                  </p>
                  <Link
                    href="/explore"
                    className="btn btn-primary"
                    style={{ width: '100%', fontSize: '14px', padding: '8px 12px', display: 'block', textAlign: 'center' }}
                  >
                    Explore Community
                  </Link>
                </div>

                <div style={{ padding: '20px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-ivory)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-emerald)', marginBottom: '6px' }}>
                    Mobile App (Expo Go)
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '16px' }}>
                    Native iOS & Android mobile build with real-time video calls and feed.
                  </p>
                  <div style={{ fontSize: '12px', fontFamily: 'monospace', backgroundColor: 'var(--color-white)', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}>
                    npm run dev:mobile
                  </div>
                </div>

                <div style={{ padding: '20px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-ivory)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-emerald)', marginBottom: '6px' }}>
                    Backend REST & Socket API
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '16px' }}>
                    Node.js Express + MongoDB API serving endpoints on port 4000.
                  </p>
                  <a
                    href="http://localhost:4000/health"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                    style={{ width: '100%', fontSize: '14px', padding: '8px 12px', display: 'block', textAlign: 'center' }}
                  >
                    API Health Status
                  </a>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
              <Link href="/" className="btn btn-outline">
                Marketing Home
              </Link>
              <Link href="/explore" className="btn btn-gold">
                Discover Users
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
