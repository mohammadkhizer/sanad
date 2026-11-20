'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, BookOpen, KeyRound, AlertCircle, Shield } from 'lucide-react';
import PasswordInput from '../../components/PasswordInput';
import { Spinner } from '../../components/Preloader';
import { webApi } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Input } from '../../components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const dest = params.get('redirect');
      if (dest) setRedirectUrl(dest);
    }
  }, []);

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
          publicId: res.user.publicId || 'usr-sanad',
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
        router.push(redirectUrl || '/feed');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials. Please verify your details.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: 'admin' | 'scholar' | 'seeker') => {
    if (role === 'admin') {
      setIdentifier('khizer');
      setPassword('SanadSecure2026!');
    } else if (role === 'scholar') {
      setIdentifier('scholar.hadith@sanad.app');
      setPassword('SanadFaithSecure10#');
    } else {
      setIdentifier('student.ilm@sanad.app');
      setPassword('SanadLearner2026!');
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
              {requires2FA ? 'Two-Factor Verification' : 'Sign in to Sanad'}
            </CardTitle>
            <CardDescription className="text-xs text-sanad-slate">
              {requires2FA
                ? 'Enter the 6-digit verification code from your authenticator'
                : 'Access verified Hadith transmissions, scholarly halaqat, and direct consultations'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!requires2FA ? (
                <>
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

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider">
                        Password
                      </label>
                      <Link
                        href="/forgot-password"
                        className="text-xs font-semibold text-sanad-gold-dark hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <PasswordInput
                      id="login-password"
                      name="password"
                      placeholder="Enter account password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-sanad-gold" />
                    Authenticator Code
                  </label>
                  <Input
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value)}
                    className="text-center tracking-[0.3em] font-mono text-lg font-bold"
                    required
                    autoFocus
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full mt-2"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Spinner size={16} />
                    Authenticating...
                  </span>
                ) : requires2FA ? (
                  'Confirm Code'
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Fast Demo Credentials Picker */}
            <div className="mt-6 pt-5 border-t border-sanad-border/60">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sanad-slate block text-center mb-2.5">
                Quick Credentials
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin')}
                  className="p-2 rounded-lg border border-sanad-gold/40 bg-sanad-gold-subtle/50 hover:bg-sanad-gold/20 text-left transition-colors"
                >
                  <div className="flex items-center gap-1 text-xs font-bold text-sanad-emerald">
                    <Shield className="w-3.5 h-3.5 text-sanad-gold-dark" />
                    Admin
                  </div>
                  <span className="text-[10px] text-sanad-slate block mt-0.5">Dual Portal</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('scholar')}
                  className="p-2 rounded-lg border border-sanad-border bg-sanad-ivory-warm/60 hover:bg-sanad-ivory-warm text-left transition-colors"
                >
                  <div className="flex items-center gap-1 text-xs font-bold text-sanad-emerald">
                    <ShieldCheck className="w-3.5 h-3.5 text-sanad-gold" />
                    Scholar
                  </div>
                  <span className="text-[10px] text-sanad-slate block mt-0.5">Faculty</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('seeker')}
                  className="p-2 rounded-lg border border-sanad-border bg-sanad-ivory-warm/60 hover:bg-sanad-ivory-warm text-left transition-colors"
                >
                  <div className="flex items-center gap-1 text-xs font-bold text-sanad-emerald">
                    <BookOpen className="w-3.5 h-3.5 text-sanad-emerald" />
                    Student
                  </div>
                  <span className="text-[10px] text-sanad-slate block mt-0.5">Learner</span>
                </button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-2 pt-0 pb-6 text-center text-xs text-sanad-slate">
            <div>
              Don&apos;t have an account yet?{' '}
              <Link href="/register" className="font-bold text-sanad-emerald hover:underline">
                Join Sanad
              </Link>
            </div>
            <div>
              Are you an accredited scholar?{' '}
              <Link href="/scholar/apply" className="font-bold text-sanad-gold-dark hover:underline">
                Submit Faculty Accreditation
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
