'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, CheckCircle2, AlertCircle, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { platformApi } from '../../../lib/api';
import { Button } from '../../../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Spinner } from '../../../components/Preloader';

export default function EditProfilePage() {
  const router = useRouter();
  const { user, updateUser } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [isPrivate, setIsPrivate] = useState(Boolean(user?.isPrivate));
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMe() {
      try {
        const res = await platformApi.users.getMe();
        if (res.user) {
          setDisplayName(res.user.displayName || '');
          setUsername(res.user.username || '');
          setBio(res.user.bio || '');
          setIsPrivate(Boolean(res.user.isPrivate));
          updateUser(res.user);
        }
      } catch {
        if (user) {
          setDisplayName(user.displayName || '');
          setUsername(user.username || '');
          setBio(user.bio || '');
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

    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername || cleanUsername.length < 3 || cleanUsername.length > 30) {
      setError('Username must be 3 to 30 characters in length.');
      return;
    }

    if (!/^[a-z0-9_]+$/.test(cleanUsername)) {
      setError('Username may only contain lowercase alphanumeric characters and underscores.');
      return;
    }

    setLoading(true);

    try {
      const res = await platformApi.users.updateMe({
        displayName: displayName.trim(),
        username: cleanUsername,
        bio: bio.trim(),
        isPrivate,
      });

      if (res.user) {
        updateUser(res.user);
      }
      setSaved(true);
      setTimeout(() => {
        router.push('/profile');
      }, 900);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 max-w-2xl mx-auto">
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
          <CardHeader className="border-b border-sanad-border/60 pb-6">
            <CardTitle className="font-serif text-2xl font-bold text-sanad-emerald flex items-center gap-2.5">
              <UserIcon className="w-6 h-6 text-sanad-gold" />
              Edit Profile
            </CardTitle>
            <CardDescription className="text-xs text-sanad-slate">
              Update your public learner dossier, username, and biography on the Sanad network.
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
                <span>Public username and profile updated successfully! Redirecting...</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block">
                  Display Name
                </label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your scholarly or student name"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block">
                  Public Username
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
                  />
                </div>
                <p className="text-[11px] text-sanad-muted">
                  Your public handle (e.g. @{username || 'username'}). Must be 3-30 lowercase characters or underscores.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block">
                  Biography &amp; Academic Pursuits
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  placeholder="Describe your teachers, fields of study (Hadith, Fiqh, Usul, Arabic), or scholarly interests..."
                  className="w-full p-3 rounded-xl border border-sanad-border bg-white text-sm focus:outline-none focus:ring-1 focus:ring-sanad-emerald resize-y leading-relaxed"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs text-sanad-slate select-none">
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="rounded border-sanad-border text-sanad-emerald focus:ring-sanad-emerald accent-[#0D453E]"
                  />
                  <span>Make my learning bookmarks and profile private to non-followers</span>
                </label>
              </div>

              <div className="pt-4 border-t border-sanad-border/60 flex justify-end">
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
