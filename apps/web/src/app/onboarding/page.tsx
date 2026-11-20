'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
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
import { Spinner } from '../../components/Preloader';
import { platformApi } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { PRESET_AVATARS } from '../../lib/avatars';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, updateUser } = useAuth();

  // Multi-step: 1 (Contact & DOB), 2 (Username & Bio), 3 (Profile Picture)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [phone, setPhone] = useState(user?.phone || '');
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || PRESET_AVATARS[0].url);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadMe() {
      try {
        const res = await platformApi.users.getMe();
        if (res?.user) {
          updateUser(res.user);
          if (res.user.phone) setPhone(res.user.phone);
          if (res.user.dateOfBirth) setDateOfBirth(res.user.dateOfBirth.slice(0, 10));
          if (res.user.username) setUsername(res.user.username);
          if (res.user.bio) setBio(res.user.bio);
          if (res.user.avatarUrl) setAvatarUrl(res.user.avatarUrl);
        }
      } catch {
        // Continue with context
      }
    }
    loadMe();
  }, []);

  // STEP 1 SUBMIT: Contact & Age Verification
  const handleStep1Submit = async (e: React.FormEvent) => {
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

      setStep(2);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save contact details.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // STEP 2 SUBMIT: Username & Academic Bio
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanHandle = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!cleanHandle || cleanHandle.length < 3 || cleanHandle.length > 30) {
      setError('Public username handle must be between 3 and 30 characters.');
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

      setStep(3);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update username or academic biography.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // STEP 3 SUBMIT: Profile Picture & Completion
  const handleStep3Submit = async (e: React.FormEvent) => {
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

      setSuccess('Profile configuration saved! Welcome to Sanad.');
      setTimeout(() => {
        router.push('/feed');
      }, 900);
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
              {step === 1 && 'Personal & Contact Information'}
              {step === 2 && 'Scholarly Identity & Biography'}
              {step === 3 && 'Academic Insignia & Crest'}
            </CardTitle>
            <CardDescription className="text-xs text-sanad-slate max-w-md mx-auto">
              {step === 1 && 'Configure your contact number and birthdate (never asked again).'}
              {step === 2 && 'Set your public handle (@username) and describe your areas of study.'}
              {step === 3 && 'Pick a classical scholar insignia to represent your presence on Sanad.'}
            </CardDescription>

            <div className="flex items-center justify-center gap-2 pt-4 max-w-xs mx-auto">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex-1 flex items-center gap-1.5">
                  <div
                    className={`h-1.5 w-full rounded-full transition-all duration-300 ${
                      step >= s ? 'bg-sanad-emerald' : 'bg-sanad-border'
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
              {/* STEP 1: Contact & DOB */}
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
                  </div>

                  <div className="flex items-center gap-3 pt-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-1/3"
                      disabled={loading}
                      onClick={() => setStep(2)}
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

              {/* STEP 2: Username & Bio */}
              {step === 2 && (
                <motion.form
                  key="step-2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleStep2Submit}
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
                          <span>Continue to Crest</span>
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      )}
                    </Button>
                  </div>
                </motion.form>
              )}

              {/* STEP 3: Profile Picture */}
              {step === 3 && (
                <motion.form
                  key="step-3"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleStep3Submit}
                  className="space-y-5"
                >
                  <div>
                    <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-sanad-gold" />
                      Select Profile Insignia
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
                            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                              isSelected
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
                      placeholder="https://example.com/portrait.jpg"
                      value={customAvatarUrl}
                      onChange={(e) => setCustomAvatarUrl(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-1/3"
                      disabled={loading}
                      onClick={() => router.push('/feed')}
                    >
                      Skip
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
                          <span>Complete Onboarding</span>
                        </span>
                      )}
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </CardContent>

          <CardFooter className="flex justify-center pt-0 pb-6 text-xs text-sanad-slate">
            {step > 1 && (
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
