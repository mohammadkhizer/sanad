'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  Image as ImageIcon,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { platformApi } from '../../../lib/api';
import { Button } from '../../../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Spinner } from '../../../components/Preloader';
import { PRESET_AVATARS } from '../../../lib/avatars';

export default function EditProfilePage() {
  const router = useRouter();
  const { user, updateUser } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || PRESET_AVATARS[0].url);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [isPrivate, setIsPrivate] = useState(Boolean(user?.isPrivate));

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMe() {
      try {
        const res = await platformApi.users.getMe();
        if (res?.user) {
          setDisplayName(res.user.displayName || '');
          setUsername(res.user.username || '');
          setBio(res.user.bio || '');
          setPhone(res.user.phone || '');
          setEmail(res.user.email || '');
          if (res.user.dateOfBirth) {
            setDateOfBirth(res.user.dateOfBirth.slice(0, 10));
          }
          if (res.user.avatarUrl) {
            setAvatarUrl(res.user.avatarUrl);
          }
          setIsPrivate(Boolean(res.user.isPrivate));
          updateUser(res.user);
        }
      } catch {
        if (user) {
          setDisplayName(user.displayName || '');
          setUsername(user.username || '');
          setBio(user.bio || '');
          setPhone(user.phone || '');
          setEmail(user.email || '');
          if (user.dateOfBirth) {
            setDateOfBirth(user.dateOfBirth.slice(0, 10));
          }
          if (user.avatarUrl) {
            setAvatarUrl(user.avatarUrl);
          }
        }
      } finally {
        setFetching(false);
      }
    }

    loadMe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!cleanUsername || cleanUsername.length < 3 || cleanUsername.length > 30) {
      setError('Username must be 3 to 30 characters in length (lowercase letters, numbers, and underscores).');
      return;
    }

    if (dateOfBirth && !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth.trim())) {
      setError('Date of birth must be in YYYY-MM-DD format.');
      return;
    }

    setLoading(true);

    try {
      const chosenAvatar = customAvatarUrl.trim() || avatarUrl;
      const res = await platformApi.users.updateMe({
        displayName: displayName.trim(),
        username: cleanUsername,
        bio: bio.trim(),
        phone: phone.trim() || undefined,
        email: email.trim().toLowerCase() || undefined,
        dateOfBirth: dateOfBirth.trim() || undefined,
        avatarUrl: chosenAvatar,
        isPrivate,
      });

      if (res?.user) {
        updateUser(res.user);
      }
      setSaved(true);
      setTimeout(() => {
        router.push('/profile');
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile. Please verify your details.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sanad-slate hover:text-sanad-emerald transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Profile</span>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-sanad-border bg-white shadow-sm overflow-hidden">
          <CardHeader className="border-b border-sanad-border/60 pb-6 bg-gradient-to-b from-sanad-ivory-warm/40 to-transparent">
            <CardTitle className="font-serif text-2xl font-bold text-sanad-emerald flex items-center gap-2.5">
              <UserIcon className="w-6 h-6 text-sanad-gold" />
              Edit Profile &amp; Academic Dossier
            </CardTitle>
            <CardDescription className="text-xs text-sanad-slate">
              Update your public display name, handle, academic pursuits, contact details, and scholar insignia.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 sm:p-8">
            {error && (
              <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {saved && (
              <div className="mb-6 p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Profile, username, and academic dossier updated successfully! Returning to profile...</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Identity & Handle Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-sanad-gold" />
                    Display / Scholarly Name *
                  </label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your legal or scholarly name"
                    required
                    disabled={loading || fetching}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-sanad-gold" />
                    Public Username Handle *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sanad-muted font-mono text-sm">
                      @
                    </span>
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="unique_username"
                      className="pl-8 font-mono text-xs"
                      required
                      disabled={loading || fetching}
                    />
                  </div>
                </div>
              </div>

              {/* Biography & Academic Pursuits */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-sanad-gold" />
                  Biography &amp; Academic Pursuits
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  placeholder="Detail your teachers, foundational texts studied, transmission licenses (Ijazat), or scholarly interests in Hadith, Fiqh, and Usul..."
                  className="w-full p-3 rounded-xl border border-sanad-border bg-white text-xs focus:outline-none focus:ring-1 focus:ring-sanad-emerald resize-y leading-relaxed"
                  disabled={loading || fetching}
                />
              </div>

              {/* Contact Information & Date of Birth */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-sanad-border/60">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-sanad-gold" />
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="scholar@domain.edu"
                    disabled={loading || fetching}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-sanad-gold" />
                    Contact Number
                  </label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+966 50 123 4567"
                    disabled={loading || fetching}
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
                    disabled={loading || fetching}
                  />
                </div>
              </div>

              {/* Profile Picture / Insignia Selection */}
              <div className="space-y-3 pt-2 border-t border-sanad-border/60">
                <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sanad-gold" />
                  Profile Picture &amp; Scholar Insignia
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PRESET_AVATARS.map((preset) => {
                    const isSelected = avatarUrl === preset.url && !customAvatarUrl;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => {
                          setAvatarUrl(preset.url);
                          setCustomAvatarUrl('');
                        }}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all flex flex-col items-center text-center gap-2 ${
                          isSelected
                            ? 'border-sanad-emerald bg-sanad-gold-subtle/70 shadow-sm ring-1 ring-sanad-emerald'
                            : 'border-sanad-border bg-white hover:border-sanad-gold/60'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-xl border border-sanad-gold/60 overflow-hidden bg-sanad-emerald flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-arabic font-bold text-sanad-gold-dark text-xs block">
                          {preset.arabicLabel}
                        </span>
                        <span className="text-[10px] text-sanad-charcoal font-semibold block line-clamp-1">
                          {preset.name}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-sanad-gold" />
                    Or Custom Avatar URL
                  </label>
                  <Input
                    type="url"
                    placeholder="https://example.com/portrait.jpg"
                    value={customAvatarUrl}
                    onChange={(e) => setCustomAvatarUrl(e.target.value)}
                    disabled={loading || fetching}
                  />
                </div>

                {/* Live Preview */}
                <div className="p-3.5 rounded-xl border border-sanad-border bg-sanad-ivory-warm/40 flex items-center gap-3.5 mt-2">
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
                      {displayName || 'Registered Scholar'}
                    </div>
                    <div className="text-xs text-sanad-gold-dark font-mono mt-0.5">
                      @{username || 'handle'}
                    </div>
                    <div className="text-[10px] text-sanad-slate mt-1 line-clamp-1">
                      {bio || 'Verified Member of the Sanad Academic Community'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Privacy Setting */}
              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-sanad-slate select-none">
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="rounded border-sanad-border text-sanad-emerald focus:ring-sanad-emerald accent-[#0D453E]"
                  />
                  <span>Make my bookmarks and full reading activity private to non-followers</span>
                </label>
              </div>

              <div className="pt-4 border-t border-sanad-border/60 flex items-center justify-between">
                <Link href="/profile">
                  <Button variant="ghost" type="button" disabled={loading}>
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={loading || fetching}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Spinner size={16} />
                      Saving Profile...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Save Changes
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
