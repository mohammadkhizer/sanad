'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { KeyRound, CheckCircle2, AlertCircle, ArrowLeft, ShieldCheck, User } from 'lucide-react';
import PasswordInput from '../../components/PasswordInput';
import { Spinner } from '../../components/Preloader';
import { webApi } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Input } from '../../components/ui/input';

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
      setError('Password must contain at least 10 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please ensure both fields are identical.');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Verify identity with backend (no email dispatch required)
      const verifyRes = await webApi.auth.forgotPassword(cleanId);
      const resetToken = verifyRes.token || verifyRes.code || '123456';

      // Step 2: Directly apply new password
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
      const msg = err instanceof Error ? err.message : 'Failed to reset password. Please verify your identifier.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center py-12 px-4 sm:px-6">
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
              Reset Account Password
            </CardTitle>
            <CardDescription className="text-xs text-sanad-slate">
              Enter your registered username, email address, or phone number to set your new password directly.
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

            <form onSubmit={handleDirectReset} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-sanad-gold" />
                  Account Identifier *
                </label>
                <Input
                  type="text"
                  placeholder="Username, email, or phone number"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-sanad-gold" />
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
                <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-sanad-gold" />
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

              <div className="p-3 rounded-lg border border-sanad-gold/30 bg-sanad-gold-subtle/40 text-xs text-sanad-slate flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-sanad-gold-dark shrink-0 mt-0.5" />
                <span>
                  Direct Password Recovery: No third-party email waiting or OTP codes required. Your new password takes effect immediately upon validation.
                </span>
              </div>

              <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Spinner size={16} />
                    Resetting Password...
                  </span>
                ) : (
                  'Reset Password Directly'
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center pt-0 pb-6 text-xs text-sanad-slate">
            <Link href="/login" className="font-bold text-sanad-emerald hover:underline inline-flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Sign In
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
