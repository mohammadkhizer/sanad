'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, KeyRound, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PasswordInput from '../../components/PasswordInput';
import { Spinner } from '../../components/Preloader';
import { webApi } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Input } from '../../components/ui/input';

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
      setSuccess('A 6-digit recovery code has been dispatched directly to your registered email address. Please inspect your inbox or spam directory.');
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
      setError('Password must contain at least 10 characters.');
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
      <main className="min-h-[82vh] flex items-center justify-center py-12 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <Card className="border-sanad-border bg-white shadow-md">
            <CardHeader className="text-center pb-6">
              <div className="w-12 h-12 rounded-xl border border-sanad-gold bg-gradient-to-br from-sanad-emerald to-sanad-emerald-deep flex items-center justify-center mx-auto mb-3 shadow-sm overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/splash-mark.png"
                  alt="Sanad Crest"
                  className="w-full h-full object-cover block"
                />
              </div>
              <CardTitle className="font-serif text-2xl font-bold text-sanad-emerald">
                {step === 'request' ? 'Password Recovery' : 'Reset Account Password'}
              </CardTitle>
              <CardDescription className="text-xs text-sanad-slate">
                {step === 'request'
                  ? 'Enter your registered email address to receive an official authentication OTP'
                  : 'Enter the 6-digit code received via email and define a new secure password'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {error && (
                <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="mb-5 p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{success}</span>
                </div>
              )}

              {step === 'request' ? (
                <form onSubmit={handleRequestCode} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block">
                      Email Address or Username
                    </label>
                    <Input
                      type="text"
                      placeholder="scholar@institution.edu"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="p-3 rounded-lg border border-sanad-gold/30 bg-sanad-gold-subtle/40 text-xs text-sanad-slate flex items-start gap-2.5">
                    <Mail className="w-4 h-4 text-sanad-gold-dark shrink-0 mt-0.5" />
                    <span>
                      The security code is dispatched strictly to your external email account. It will never be displayed in-app or on web.
                    </span>
                  </div>

                  <Button type="submit" className="w-full mt-2" disabled={loading}>
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Spinner size={16} />
                        Dispatching Code...
                      </span>
                    ) : (
                      'Send Recovery Code via Email'
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-sanad-gold" />
                      6-Digit Email Code
                    </label>
                    <Input
                      type="text"
                      placeholder="000000"
                      maxLength={6}
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      className="text-center tracking-[0.3em] font-mono text-lg font-bold"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block">
                      New Password *
                    </label>
                    <PasswordInput
                      id="reset-new-password"
                      name="newPassword"
                      placeholder="Minimum 10 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block">
                      Confirm New Password *
                    </label>
                    <PasswordInput
                      id="reset-confirm-password"
                      name="confirmPassword"
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <Button type="submit" className="w-full mt-2" disabled={loading}>
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Spinner size={16} />
                        Updating Password...
                      </span>
                    ) : (
                      'Update Password'
                    )}
                  </Button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('request');
                        setError(null);
                        setSuccess(null);
                      }}
                      className="text-xs font-semibold text-sanad-slate hover:text-sanad-emerald inline-flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      Re-enter email address
                    </button>
                  </div>
                </form>
              )}
            </CardContent>

            <CardFooter className="flex justify-center pt-0 pb-6 text-xs text-sanad-slate">
              <Link href="/login" className="font-bold text-sanad-emerald hover:underline inline-flex items-center gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" />
                Return to Sign In
              </Link>
            </CardFooter>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </>
  );
}