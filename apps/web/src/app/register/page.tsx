'use client';

import React from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function RegisterPage() {
  return (
    <>
      <Header />
      <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', padding: '40px 0' }}>
        <div className="container">
          <div
            style={{
              maxWidth: '520px',
              margin: '0 auto',
              backgroundColor: 'var(--color-white)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              padding: '40px',
              boxShadow: 'var(--shadow-md)',
              textAlign: 'center',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/splash-mark.png"
              alt="Sanad Brand"
              style={{ width: '48px', height: '48px', margin: '0 auto 16px', display: 'block' }}
            />
            <div
              style={{
                display: 'inline-block',
                backgroundColor: '#FDE8E8',
                color: '#9B1C1C',
                border: '1px solid #F8B4B4',
                fontSize: '11px',
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                marginBottom: '14px',
              }}
            >
              Registration Disabled
            </div>
            <h1 style={{ fontSize: '24px', color: 'var(--color-emerald)', fontWeight: 700, marginBottom: '12px' }}>
              Administration Console Only
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--color-muted)', lineHeight: 1.6, marginBottom: '28px' }}>
              This platform is reserved strictly for authenticated Sanad governance staff and platform administrators.
              General users, students, and scholars must use the mobile application. Administrator credentials can only be provisioned by authorized systems leadership.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Link href="/login" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '14px' }}>
                Go to Administrator Sign In
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
