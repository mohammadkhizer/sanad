'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Automatically reload if a stale chunk or Webpack factory error occurs
    if (
      error?.message?.includes("reading 'call'") ||
      error?.message?.includes('options.factory') ||
      error?.message?.includes('Loading chunk')
    ) {
      if (typeof window !== 'undefined') {
        const hasReloaded = sessionStorage.getItem('sanad_chunk_retry');
        if (!hasReloaded) {
          sessionStorage.setItem('sanad_chunk_retry', 'true');
          window.location.reload();
        }
      }
    }
  }, [error]);

  return (
    <main
      className="section"
      style={{
        minHeight: '60vh',
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
      }}
    >
      <div className="container" style={{ maxWidth: '540px' }}>
        <div className="hero-pill" style={{ margin: '0 auto 16px' }}>
          Platform Recovery
        </div>
        <h1 className="hero-title" style={{ fontSize: '32px', marginBottom: '16px' }}>
          Temporary Rendering Interruption
        </h1>
        <p className="hero-subtitle" style={{ marginBottom: '28px', fontSize: '15px' }}>
          An updated client resource is being loaded. Please reload the interface or return to the main portal.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                sessionStorage.removeItem('sanad_chunk_retry');
                window.location.reload();
              } else {
                reset();
              }
            }}
            className="btn btn-primary"
            style={{ padding: '12px 24px' }}
          >
            Reload Interface
          </button>
          <Link href="/" className="btn btn-outline" style={{ padding: '12px 24px' }}>
            Return Home
          </Link>
        </div>
      </div>
    </main>
  );
}
