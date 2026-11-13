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

        login(res.accessToken, userObj, res.refreshToken);

        if (userObj.roles.includes('admin') || userObj.roles.includes('moderator')) {
          router.push('/admin');
        } else {
          router.push('/app');
        }
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
              <h1 style={{ fontSize: '24px', color: 'var(--color-emerald)', fontWeight: 700 }}>
                Sign In to Sanad
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginTop: '4px' }}>
                Accredited Islamic Scholarship & Community Platform
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
                  Email, Username, or Phone
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. khizer@sanad.app or khizer"
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
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
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
                    Two-Factor Authentication Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    placeholder="6-digit authenticator code"
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '0 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-gold)',
                      fontSize: '16px',
                      letterSpacing: '2px',
                      textAlign: 'center',
                    }}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  height: '44px',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>

            <div
              style={{
                textAlign: 'center',
                marginTop: '24px',
                paddingTop: '20px',
                borderTop: '1px solid var(--color-border)',
                fontSize: '13px',
                color: 'var(--color-muted)',
              }}
            >
              Do not have an account?{' '}
              <Link
                href="/register"
                style={{ color: 'var(--color-emerald)', fontWeight: 700 }}
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
