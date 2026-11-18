'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { GraduationCap, AlertCircle, CheckCircle2 } from 'lucide-react';
import PasswordInput from '../../components/PasswordInput';
import { Spinner } from '../../components/Preloader';
import { webApi } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Input } from '../../components/ui/input';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!displayName.trim() || (!email.trim() && !phone.trim()) || !password.trim() || !dateOfBirth.trim()) {
      setError('Please provide your full name, email or phone, date of birth, and password.');
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth.trim())) {
      setError('Date of birth must be in YYYY-MM-DD format (e.g. 2000-01-15).');
      return;
    }

    const birthDate = new Date(dateOfBirth.trim());
    if (isNaN(birthDate.getTime())) {
      setError('Invalid date of birth provided.');
      return;
    }

    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }

    if (calculatedAge < 13) {
      setError('Learners must be at least 13 years of age to register on Sanad.');
      return;
    }

    if (password.length < 10) {
      setError('Password must contain at least 10 characters.');
      return;
    }

    if (!agreeTerms) {
      setError('Please accept the Sanad Scholarly Terms of Service and Code of Conduct.');
      return;
    }

    try {
      setLoading(true);
      const res: { message?: string; identifier?: string; accessToken?: string; user?: any } =
        await webApi.auth.register({
          displayName: displayName.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          dateOfBirth: dateOfBirth.trim(),
          password,
        });

      if (res?.accessToken && res?.user) {
        login(res.accessToken, res.user);
        router.push('/feed');
      } else {
        router.push('/login');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-lg"
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
                Create Member Account
              </CardTitle>
              <CardDescription className="text-xs text-sanad-slate">
                Join our verified scholarly community to study authentic Hadith transmissions and halaqat
              </CardDescription>
            </CardHeader>

            <CardContent>
              {error && (
                <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block">
                    Full Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your full legal or scholarly name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      placeholder="student@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block">
                      Phone Number (Optional)
                    </label>
                    <Input
                      type="tel"
                      placeholder="+966 50 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block">
                    Date of Birth (YYYY-MM-DD) *
                  </label>
                  <Input
                    type="text"
                    placeholder="2000-01-15"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    pattern="\d{4}-\d{2}-\d{2}"
                    required
                    disabled={loading}
                  />
                  <span className="text-[10px] text-sanad-slate block">
                    Required for age verification. Learners must be at least 13 years of age.
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block">
                    Create Password *
                  </label>
                  <PasswordInput
                    id="register-password"
                    name="password"
                    placeholder="Minimum 10 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-sanad-slate select-none">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 rounded border-sanad-border text-sanad-emerald focus:ring-sanad-emerald accent-[#0D453E]"
                    />
                    <span>
                      I affirm that I will uphold classical decorum and abide by the{' '}
                      <Link href="/terms" className="font-bold text-sanad-emerald hover:underline">
                        Terms of Service
                      </Link>
                      ,{' '}
                      <Link href="/conduct" className="font-bold text-sanad-emerald hover:underline">
                        Code of Conduct
                      </Link>
                      , and{' '}
                      <Link href="/privacy" className="font-bold text-sanad-emerald hover:underline">
                        Privacy Policy
                      </Link>
                      .
                    </span>
                  </label>
                </div>

                <Button type="submit" className="w-full mt-2" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Spinner size={16} />
                      Registering Account...
                    </span>
                  ) : (
                    'Create Sanad Account'
                  )}
                </Button>
              </form>

              {/* Scholar Accreditation Notice */}
              <div className="mt-6 p-3.5 rounded-xl border border-sanad-gold/40 bg-sanad-gold-subtle/50 flex items-start gap-3">
                <GraduationCap className="w-5 h-5 text-sanad-gold-dark shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-sanad-emerald block">Are you an Islamic Scholar or Professor?</span>
                  <p className="text-sanad-slate mt-0.5">
                    Scholars require academic credential review and isnad validation before public publishing rights are granted.
                  </p>
                  <Link
                    href="/scholar/apply"
                    className="inline-flex items-center gap-1 font-bold text-sanad-gold-dark hover:underline mt-1.5"
                  >
                    <span>Apply for Verified Scholar Status</span>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-center pt-0 pb-6 text-xs text-sanad-slate">
              <span>
                Already have an account?{' '}
                <Link href="/login" className="font-bold text-sanad-emerald hover:underline">
                  Sign In
                </Link>
              </span>
            </CardFooter>
          </Card>
        </motion.div>
    </div>
  );
}