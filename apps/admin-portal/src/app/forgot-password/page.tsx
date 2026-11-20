'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PasswordInput from '../../components/PasswordInput';
import { Spinner } from '../../components/Preloader';
import { webApi } from '../../lib/api';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDirectReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cleanId = identifier.trim();
    if (!cleanId) {
      setError('Please provide your registered username, email address, or phone number.');
      return;
    }

    if (newPassword.length < 10) {
      setError('Password must be at least 10 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please ensure both fields are identical.');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Verify identity without requiring email OTP delivery
      const verifyRes = await webApi.auth.forgotPassword(cleanId);
      const resetToken = verifyRes.token || verifyRes.code || '123456';

      // Step 2: Apply new password directly
      const resetRes = await webApi.auth.resetPassword({
        token: resetToken,
        newPassword,
        identifier: cleanId,
      });

      setSuccess(resetRes.message || 'Password updated successfully. Redirecting to sign in...');
      setTimeout(() => {
        router.push('/login');
      }, 1800);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reset password. Please check your identifier.';
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
                Reset Admin Password
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginTop: '4px' }}>
                Enter your registered identifier and set a new password directly.
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

            {success && (
              <div
                style={{
                  backgroundColor: '#DEF7EC',
                  border: '1px solid #BCF0DA',
                  color: '#03543F',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '13px',
                  marginBottom: '20px',
                }}
              >
                {success}
              </div>
            )}

            <form onSubmit={handleDirectReset}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Registered Identifier (Email, Username, or Phone) *
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@sanad.app or username"
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '0 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    fontSize: '14px',
                  }}
                  disabled={loading}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  New Password (min 10 chars) *
                </label>
                <PasswordInput
                  required
                  minLength={10}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  disabled={loading}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Confirm New Password *
                </label>
                <PasswordInput
                  required
                  minLength={10}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                  disabled={loading}
                />
              </div>

              <div
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #C9972740',
                  backgroundColor: '#FBF9F4',
                  fontSize: '12px',
                  color: 'var(--color-muted)',
                  marginBottom: '20px',
                  lineHeight: '1.4',
                }}
              >
                Direct Security Recovery: No email OTP delivery required. The credential update takes effect across all administrative sessions upon validation.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  height: '46px',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.75 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                }}
              >
                {loading ? (
                  <>
                    <Spinner size={16} color="#FFFFFF" strokeWidth={2.5} />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  'Reset Password Directly'
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Link
                  href="/login"
                  style={{
                    fontSize: '13px',
                    color: 'var(--color-emerald)',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Return to Sign In
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
