'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, CheckCircle2, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Spinner } from '../../../components/Preloader';

export default function EditProfilePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName || 'Seeker of Sacred Knowledge');
  const [username, setUsername] = useState(user?.username || 'ilm_seeker');
  const [bio, setBio] = useState(
    user?.bio || 'Dedicated student of classical Islamic Hadith methodology and Arabic linguistics.'
  );
  const [location, setLocation] = useState('Global Community');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setSaved(true);
      setTimeout(() => {
        router.push('/profile');
      }, 1000);
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
                Update your public learner dossier and presentation
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 sm:p-8">
              {saved && (
                <div className="mb-6 p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Profile updated successfully! Redirecting...</span>
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
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block">
                    Username
                  </label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block">
                    Biography / Academic Pursuits
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    className="w-full p-3 rounded-xl border border-sanad-border bg-white text-sm focus:outline-none focus:ring-1 focus:ring-sanad-emerald resize-y leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block">
                    Location
                  </label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
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
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Spinner size={16} />
                        Saving...
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
