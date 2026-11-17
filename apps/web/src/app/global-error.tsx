'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
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
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          background: '#0D1B1E',
          color: '#F4F1DE',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '480px', padding: '32px 24px' }}>
          <div
            style={{
              display: 'inline-block',
              padding: '6px 16px',
              borderRadius: '999px',
              background: 'rgba(201, 162, 77, 0.15)',
              border: '1px solid #C9A24D',
              color: '#C9A24D',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '16px',
            }}
          >
            Sanad Platform
          </div>
          <h1 style={{ fontSize: '28px', margin: '0 0 14px', color: '#F4F1DE' }}>
            Application Reload Required
          </h1>
          <p
            style={{
              fontSize: '15px',
              color: '#A3B2AF',
              lineHeight: 1.6,
              margin: '0 0 24px',
            }}
          >
            A fresh client bundle was deployed. Refresh your browser to continue navigating the verified scholars portal.
          </p>
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
            style={{
              background: '#C9A24D',
              color: '#0D1B1E',
              border: 'none',
              padding: '12px 28px',
              fontSize: '15px',
              fontWeight: 700,
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Refresh Interface
          </button>
        </div>
      </body>
    </html>
  );
}
