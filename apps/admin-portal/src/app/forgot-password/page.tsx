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

  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [identifier, setIdentifier] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await webApi.auth.forgotPassword(identifier.trim());
      setStep('reset');
      setSuccess('A 6-digit verification code has been dispatched to your email address. Please check your inbox and enter the code below.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Password recovery request failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 10) {
      setError('Password must be at least 10 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await webApi.auth.resetPassword({
        token: token.trim(),
        newPassword,
        identifier: identifier.trim() || undefined,
      });

      setSuccess(res.message || 'Password reset successfully. Redirecting to sign in...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reset password. Please check your recovery code.';
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
                {step === 'request' ? 'Recover Account' : 'Reset Password'}
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginTop: '4px' }}>
                {step === 'request'
                  ? 'Enter your registered email, phone, or username'
                  : 'Enter your 6-digit recovery code and new password'}
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

            {step === 'request' ? (
              <form onSubmit={handleRequestCode}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Registered Identifier
                  </label>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="email@sanad.app or username"
                    style={{
                      width: '100%',
                      height: '44px',
                      padding: '0 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                      fontSize: '14px',
                    }}
                  />
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
                      <span>Dispatching Code to Mail...</span>
                    </>
                  ) : (
                    'Send Recovery Code via Email'
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Email Recovery Code
                  </label>
                  <input
                    type="text"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Enter 6-digit code from email"
                    maxLength={8}
                    style={{
                      width: '100%',
                      height: '46px',
                      padding: '0 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-border)',
                      fontSize: '16px',
                      textAlign: 'center',
                      letterSpacing: '3px',
                      fontFamily: 'monospace',
                    }}
                  />
                  <span style={{ fontSize: '11px', color: 'var(--color-muted)', display: 'block', marginTop: '5px' }}>
                    Check your email inbox (and spam/junk folder) for the verification code
                  </span>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    New Password (min 10 chars)
                  </label>
                  <PasswordInput
                    required
                    minLength={10}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    autoComplete="new-password"
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Confirm New Password
                  </label>
                  <PasswordInput
                    required
                    minLength={10}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                  />
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
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            )}

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
              Remember your password?{' '}
              <Link href="/login" style={{ color: 'var(--color-emerald)', fontWeight: 700 }}>
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

