'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { webApi } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await webApi.auth.login({
        identifier: identifier.trim(),
        password,
        twoFactorCode: requires2FA ? twoFactorCode.trim() : undefined,
      });

      if (res.requires2FA) {
        setRequires2FA(true);
        setLoading(false);
        return;
      }

      if (res.accessToken && res.user) {
        const userObj = {
          id: res.user._id || res.user.id,
          _id: res.user._id || res.user.id,
          publicId: res.user.publicId,
          displayName: res.user.displayName,
          username: res.user.username,
          email: res.user.email,
          phone: res.user.phone,
          roles: res.user.roles || ['member'],
          bio: res.user.bio,
          avatarUrl: res.user.avatarUrl,
          isPrivate: res.user.isPrivate,
          scholarProfile: res.user.scholarProfile,
        };

        const hasAdminAccess = userObj.roles.includes('admin') || userObj.roles.includes('moderator');
        if (!hasAdminAccess) {
          setError('Access Denied: Your account does not possess administrator permissions for this governance portal.');
          setLoading(false);
          return;
        }

        login(res.accessToken, userObj, res.refreshToken);
        router.push('/admin');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', padding: '40px 0' }}>
        <div className="container">
          <div
            style={{
              maxWidth: '440px',
              margin: '0 auto',
              backgroundColor: 'var(--color-white)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              padding: '36px',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/splash-mark.png"
                alt="Sanad Brand"
                style={{ width: '48px', height: '48px', margin: '0 auto 12px', display: 'block' }}
              />
              <div
                style={{
                  display: 'inline-block',
                  backgroundColor: 'var(--color-gold-subtle)',
                  color: 'var(--color-gold-hover)',
                  border: '1px solid var(--color-gold)',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  marginBottom: '10px',
                }}
              >
                Governance Console
              </div>
              <h1 style={{ fontSize: '24px', color: 'var(--color-emerald)', fontWeight: 700 }}>
                Administrator Sign In
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginTop: '4px' }}>
                Sanad Platform Governance &amp; Security Command Center
              </p>
            </div>

            {error && (
              <div
                style={{
                  backgroundColor: '#FDE8E8',
                  border: '1px solid #F8B4B4',
                  color: '#9B1C1C',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  marginBottom: '20px',
                  lineHeight: 1.45,
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    marginBottom: '6px',
                    color: 'var(--color-charcoal)',
                  }}
                >
                  Admin Username, Email, or Handle
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. admin@sanad.app or admin"
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    fontSize: '14px',
                    color: 'var(--color-charcoal)',
                    backgroundColor: 'var(--color-white)',
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--color-charcoal)',
                    }}
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    style={{ fontSize: '12px', color: 'var(--color-emerald)', fontWeight: 600 }}
                  >
                    Forgot Password?
                  </Link>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    fontSize: '14px',
                    color: 'var(--color-charcoal)',
                    backgroundColor: 'var(--color-white)',
                  }}
                />
              </div>

              {requires2FA && (
                <div style={{ marginBottom: '20px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 600,
                      marginBottom: '6px',
                      color: 'var(--color-charcoal)',
                    }}
                  >
                    Two-Factor Authentication Code (TOTP)
                  </label>
                  <input
                    type="text"
                    required
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    placeholder="6-digit authenticator code"
                    maxLength={6}
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '0 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                      fontSize: '16px',
                      letterSpacing: '4px',
                      textAlign: 'center',
                      fontFamily: 'monospace',
                    }}
                  />
                  <span style={{ fontSize: '11px', color: 'var(--color-muted)', display: 'block', marginTop: '4px' }}>
                    Enter the code from your authenticator app
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  height: '44px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Authenticating...' : 'Sign In as Administrator'}
              </button>
            </form>

            <div
              style={{
                textAlign: 'center',
                marginTop: '24px',
                paddingTop: '20px',
                borderTop: '1px solid var(--color-border)',
                fontSize: '12px',
                color: 'var(--color-muted)',
                lineHeight: 1.5,
              }}
            >
              Strictly restricted to authorized platform administrators and governance staff. All authentication attempts are logged.
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
