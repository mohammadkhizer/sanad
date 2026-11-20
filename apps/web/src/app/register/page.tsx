'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import PasswordInput from '../../components/PasswordInput';
import { Spinner } from '../../components/Preloader';
import { webApi, platformApi } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { PRESET_AVATARS } from '../../lib/avatars';

export default function RegisterAndOnboardingPage() {
  const router = useRouter();
  const { user, login, updateUser } = useAuth();

  // Multi-step state: 1 (Account Credentials), 2 (Contact & Age), 3 (Bio & Username), 4 (Profile Picture)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Account Essentials
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Step 2: Contact Number & Date of Birth
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  // Step 3: Public Username & Academic Biography
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');

  // Step 4: Profile Picture / Scholar Crest
  const [avatarUrl, setAvatarUrl] = useState(PRESET_AVATARS[0].url);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // STEP 1 SUBMIT: Create Account & Authenticate Session
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = displayName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || cleanName.length < 2) {
      setError('Please provide your full legal or scholarly name (at least 2 characters).');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid academic or personal email address.');
      return;
    }

    if (password.length < 10) {
      setError('Password must be at least 10 characters long to satisfy security criteria.');
      return;
    }

    if (!agreeTerms) {
      setError('Please accept the Sanad Code of Academic Conduct and Terms of Service to proceed.');
      return;
    }

    setLoading(true);

    try {
      // Suggest default username from name if not provided
      const autoHandle = cleanName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .slice(0, 20);
      if (!username) {
        setUsername(autoHandle);
      }

      const res = await webApi.auth.register({
        displayName: cleanName,
        email: cleanEmail,
        password,
      });

      if (res?.accessToken && res?.user) {
        login(res.accessToken, res.user, res.refreshToken);
      }

      setSuccess('Account created successfully! Proceeding to your onboarding dossier...');
      setTimeout(() => {
        setSuccess(null);
        setStep(2);
      }, 700);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // STEP 2 SUBMIT: Contact Number & Date of Birth
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (dateOfBirth) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth.trim())) {
        setError('Date of birth must be in YYYY-MM-DD format (e.g. 1998-05-20).');
        return;
      }
      const birthDate = new Date(dateOfBirth.trim());
      if (isNaN(birthDate.getTime())) {
        setError('Invalid date of birth provided.');
        return;
      }
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 13) {
        setError('Members must be at least 13 years of age to participate on Sanad.');
        return;
      }
    }

    setLoading(true);

    try {
      const updatePayload: Record<string, any> = {};
      if (phone.trim()) updatePayload.phone = phone.trim();
      if (dateOfBirth.trim()) updatePayload.dateOfBirth = dateOfBirth.trim();

      if (Object.keys(updatePayload).length > 0) {
        const res = await platformApi.users.updateMe(updatePayload);
        if (res?.user) {
          updateUser(res.user);
        }
      }

      setStep(3);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save contact details.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // STEP 3 SUBMIT: Public Username & Biography
  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanHandle = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!cleanHandle || cleanHandle.length < 3 || cleanHandle.length > 30) {
      setError('Public username handle must be between 3 and 30 characters (letters, numbers, underscores).');
      return;
    }

    setLoading(true);

    try {
      const res = await platformApi.users.updateMe({
        username: cleanHandle,
        bio: bio.trim(),
      });

      if (res?.user) {
        updateUser(res.user);
      }

      setStep(4);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update username or academic biography.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // STEP 4 SUBMIT: Profile Picture & Complete Onboarding
  const handleStep4Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const chosenAvatar = customAvatarUrl.trim() || avatarUrl;
    setLoading(true);

    try {
      const res = await platformApi.users.updateMe({
        avatarUrl: chosenAvatar,
      });

      if (res?.user) {
        updateUser(res.user);
      }

      setSuccess('Onboarding complete! Welcome to the Sanad Knowledge Network.');
      setTimeout(() => {
        router.push('/feed');
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save profile picture.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-xl"
      >
        <Card className="border-sanad-border bg-white shadow-md overflow-hidden">
          {/* Header & Step Tracker */}
          <CardHeader className="text-center pb-4 pt-6 bg-gradient-to-b from-sanad-ivory-warm/60 to-transparent border-b border-sanad-border/60">
            <div className="w-12 h-12 rounded-xl border border-sanad-gold bg-gradient-to-br from-sanad-emerald to-sanad-emerald-deep flex items-center justify-center mx-auto mb-2.5 shadow-sm overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/splash-mark.png"
                alt="Sanad Crest"
                className="w-full h-full object-cover block"
              />
            </div>
            <CardTitle className="font-serif text-2xl font-bold text-sanad-emerald">
              {step === 1 && 'Create Sanad Account'}
              {step === 2 && 'Contact & Age Verification'}
              {step === 3 && 'Academic Dossier & Username'}
              {step === 4 && 'Profile Crest & Identity'}
            </CardTitle>
            <CardDescription className="text-xs text-sanad-slate max-w-md mx-auto">
              {step === 1 && 'Step 1 of 4: Define your account credentials to begin verified scholarship transmission.'}
              {step === 2 && 'Step 2 of 4: Provide verification contact and date of birth (collected once for account safety).'}
              {step === 3 && 'Step 3 of 4: Craft your scholarly username handle and academic areas of study.'}
              {step === 4 && 'Step 4 of 4: Select an authenticated classical crest or provide a custom portrait.'}
            </CardDescription>

            {/* Progress Stepper */}
            <div className="flex items-center justify-center gap-2 pt-4 max-w-xs mx-auto">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex-1 flex items-center gap-1.5">
                  <div
                    className={`h-1.5 w-full rounded-full transition-all duration-300 ${step >= s ? 'bg-sanad-emerald' : 'bg-sanad-border'
                      }`}
                  />
                </div>
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8">
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

            <AnimatePresence mode="wait">
              {/* STEP 1: Account Credentials */}
              {step === 1 && (
                <motion.form
                  key="step-1"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleStep1Submit}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-sanad-gold" />
                      Full Name *
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. Ahmad ibn Muhammad al-Azhari"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-sanad-gold" />
                      Academic or Personal Email *
                    </label>
                    <Input
                      type="email"
                      placeholder="scholar@institution.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block">
                      Secure Password *
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
                        I agree to uphold the{' '}
                        <Link href="/conduct" target="_blank" className="text-sanad-emerald font-bold hover:underline">
                          Code of Academic Conduct
                        </Link>{' '}
                        and{' '}
                        <Link href="/terms" target="_blank" className="text-sanad-emerald font-bold hover:underline">
                          Terms of Service
                        </Link>
                        .
                      </span>
                    </label>
                  </div>

                  <Button type="submit" className="w-full mt-4" disabled={loading}>
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Spinner size={16} />
                        Creating Account...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <span>Continue to Profile Details</span>
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </motion.form>
              )}

              {/* STEP 2: Contact Number & Date of Birth */}
              {step === 2 && (
                <motion.form
                  key="step-2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleStep2Submit}
                  className="space-y-4"
                >
                  <div className="p-3 rounded-lg border border-sanad-gold/30 bg-sanad-gold-subtle/30 text-xs text-sanad-slate flex items-start gap-2.5 mb-2">
                    <ShieldCheck className="w-4 h-4 text-sanad-gold-dark shrink-0 mt-0.5" />
                    <span>
                      Welcome, <strong className="text-sanad-emerald">{displayName || user?.displayName}</strong>. Please enter your contact number and birthdate. These fields verify compliance with academic age standards and are kept private.
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-sanad-gold" />
                      Contact Number
                    </label>
                    <Input
                      type="tel"
                      placeholder="+966 50 123 4567 or +1 555 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={loading}
                    />
                    <p className="text-[11px] text-sanad-muted">
                      Optional: Used for account security alerts and urgent administrative communications.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-sanad-gold" />
                      Date of Birth
                    </label>
                    <Input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      disabled={loading}
                    />
                    <p className="text-[11px] text-sanad-muted">
                      Sanad requires all participating scholars and students to be 13 years of age or older.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-1/3"
                      disabled={loading}
                      onClick={() => setStep(3)}
                    >
                      Skip
                    </Button>
                    <Button type="submit" className="w-2/3" disabled={loading}>
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <Spinner size={16} />
                          Saving...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <span>Continue to Bio</span>
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      )}
                    </Button>
                  </div>
                </motion.form>
              )}

              {/* STEP 3: Public Handle & Academic Pursuits */}
              {step === 3 && (
                <motion.form
                  key="step-3"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleStep3Submit}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-sanad-gold" />
                      Public Username Handle *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sanad-muted font-mono text-sm">
                        @
                      </span>
                      <Input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        placeholder="your_handle"
                        className="pl-8 font-mono text-xs"
                        required
                        disabled={loading}
                      />
                    </div>
                    <p className="text-[11px] text-sanad-muted">
                      Your unique scholarly handle on Sanad (e.g. @{username || 'handle'}). 3-30 lowercase characters.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-sanad-gold" />
                      Biography &amp; Academic Pursuits
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      placeholder="Share your Islamic disciplines of interest (e.g. Hadith sciences, Hanafi/Shafi'i Fiqh, Usul, Arabic philology), teachers, or study objectives..."
                      className="w-full p-3 rounded-xl border border-sanad-border bg-white text-xs focus:outline-none focus:ring-1 focus:ring-sanad-emerald resize-y leading-relaxed"
                      disabled={loading}
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-1/3"
                      disabled={loading}
                      onClick={() => setStep(4)}
                    >
                      Skip
                    </Button>
                    <Button type="submit" className="w-2/3" disabled={loading}>
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <Spinner size={16} />
                          Saving...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <span>Continue to Crest</span>
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      )}
                    </Button>
                  </div>
                </motion.form>
              )}

              {/* STEP 4: Profile Picture / Crest */}
              {step === 4 && (
                <motion.form
                  key="step-4"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleStep4Submit}
                  className="space-y-5"
                >
                  <div>
                    <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-sanad-gold" />
                      Choose Your Classical Insignia or Crest
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {PRESET_AVATARS.map((preset) => {
                        const isSelected = avatarUrl === preset.url && !customAvatarUrl;
                        return (
                          <div
                            key={preset.id}
                            onClick={() => {
                              setAvatarUrl(preset.url);
                              setCustomAvatarUrl('');
                            }}
                            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${isSelected
                                ? 'border-sanad-emerald bg-sanad-gold-subtle/60 shadow-sm ring-1 ring-sanad-emerald'
                                : 'border-sanad-border bg-white hover:border-sanad-gold/60'
                              }`}
                          >
                            <div className="w-12 h-12 rounded-xl border border-sanad-gold/60 overflow-hidden shrink-0 bg-sanad-emerald flex items-center justify-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={preset.url}
                                alt={preset.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="text-left leading-tight">
                              <span className="font-arabic font-bold text-sanad-gold-dark text-sm block">
                                {preset.arabicLabel}
                              </span>
                              <span className="text-[11px] font-bold text-sanad-charcoal block line-clamp-1">
                                {preset.name}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-sanad-gold" />
                      Or Custom Image URL
                    </label>
                    <Input
                      type="url"
                      placeholder="https://example.com/my-portrait.jpg"
                      value={customAvatarUrl}
                      onChange={(e) => setCustomAvatarUrl(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  {/* Live Avatar Preview */}
                  <div className="p-3.5 rounded-xl border border-sanad-border bg-sanad-ivory-warm/40 flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl border-2 border-sanad-gold bg-sanad-emerald text-white flex items-center justify-center font-serif text-xl font-bold shadow-sm overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={customAvatarUrl.trim() || avatarUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-left leading-tight">
                      <div className="font-serif text-sm font-bold text-sanad-emerald">
                        {displayName || user?.displayName || 'Registered Scholar'}
                      </div>
                      <div className="text-xs text-sanad-gold-dark font-mono mt-0.5">
                        @{username || user?.username || 'handle'}
                      </div>
                      <div className="text-[10px] text-sanad-slate mt-1 line-clamp-1">
                        {bio || 'Verified Member of the Sanad Academic Community'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-1/3"
                      disabled={loading}
                      onClick={() => router.push('/feed')}
                    >
                      Finish Later
                    </Button>
                    <Button type="submit" className="w-2/3" disabled={loading}>
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <Spinner size={16} />
                          Finalizing...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4" />
                          <span>Complete &amp; Enter Sanad</span>
                        </span>
                      )}
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </CardContent>

          <CardFooter className="flex justify-center pt-0 pb-6 text-xs text-sanad-slate">
            {step === 1 ? (
              <p>
                Already have an accredited account?{' '}
                <Link href="/login" className="font-bold text-sanad-emerald hover:underline">
                  Sign In
                </Link>
              </p>
            ) : (
              <button
                type="button"
                onClick={() => setStep((prev) => (Math.max(1, prev - 1) as any))}
                className="font-bold text-sanad-emerald hover:underline inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Previous Step
              </button>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
