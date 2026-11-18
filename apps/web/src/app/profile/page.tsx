'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  User as UserIcon,
  ShieldCheck,
  Bookmark,
  BookOpen,
  Settings,
  Edit3,
  Calendar,
  Share2,
  GraduationCap,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

export default function CurrentUserProfilePage() {
  const { user, isAuthenticated, isScholar } = useAuth();
  const [activeTab, setActiveTab] = useState<'lessons' | 'bookmarks' | 'halaqat'>('bookmarks');

  // Fallback profile if guest or demo
  const profile = {
    displayName: user?.displayName || 'Seeker of Sacred Knowledge',
    username: user?.username || 'ilm_seeker',
    email: user?.email || 'seeker@sanad.app',
    bio: user?.bio || 'Dedicated student of classical Islamic Hadith methodology and Arabic linguistics.',
    joined: 'Joined Safar 1446 AH',
    role: isScholar ? 'Verified Scholar' : 'Knowledge Seeker',
    stats: {
      lessons: isScholar ? 24 : 0,
      bookmarks: 18,
      following: 14,
    },
    bookmarks: [
      {
        id: 'post-1',
        title: 'Actions and Intentions in Epistemology',
        reference: 'Sahih al-Bukhari #1',
        author: 'Hadith Studies & Isnad Verification Chair',
        grade: 'Sahih',
      },
      {
        id: 'post-2',
        title: 'The Semantic Depth of Sincere Counsel',
        reference: 'Sahih Muslim #55',
        author: 'Principles of Jurisprudence Chair',
        grade: 'Sahih',
      },
    ],
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 max-w-4xl mx-auto">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-sanad-border bg-white shadow-sm overflow-hidden mb-8">
            <div className="h-32 sm:h-36 bg-gradient-to-r from-sanad-emerald via-sanad-emerald-deep to-[#0A332E] relative border-b border-sanad-gold/40">
              <div className="absolute right-6 bottom-3 opacity-15 font-arabic text-5xl sm:text-6xl text-sanad-gold font-bold select-none">
                سند
              </div>
            </div>

            <div className="px-6 sm:px-8 pb-8 pt-0 relative">
              {/* Avatar and Action Controls: Avatar overlaps banner safely while actions align in card area */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 mb-4">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white bg-gradient-to-br from-sanad-emerald to-sanad-emerald-deep text-white font-serif text-3xl font-bold flex items-center justify-center shadow-lg ring-1 ring-sanad-border/30 shrink-0 select-none">
                  {profile.displayName.charAt(0)}
                </div>

                <div className="flex items-center gap-2 pb-1 self-start sm:self-auto">
                  <Link href="/profile/edit">
                    <Button variant="outline" size="sm" className="text-xs">
                      <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                      Edit Profile
                    </Button>
                  </Link>
                  <Link href="/settings">
                    <Button variant="secondary" size="sm" className="text-xs">
                      <Settings className="w-3.5 h-3.5 mr-1.5 text-sanad-gold-dark" />
                      Settings
                    </Button>
                  </Link>
                </div>
              </div>

              {/* User Identity Block: Positioned 100% on crisp white card background for maximum contrast */}
              <div className="mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-sanad-emerald tracking-tight">
                    {profile.displayName}
                  </h1>
                  {isScholar && (
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sanad-gold/15 text-sanad-gold-dark text-xs font-semibold border border-sanad-gold/30">
                      <ShieldCheck className="w-3.5 h-3.5 text-sanad-gold-dark shrink-0" />
                      <span>Verified Scholar</span>
                    </div>
                  )}
                </div>
                <p className="text-xs font-semibold text-sanad-slate mt-1">
                  @{profile.username}
                </p>
              </div>

              {/* Bio */}
              <p className="text-sm text-sanad-charcoal leading-relaxed mb-5 max-w-2xl">
                {profile.bio}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-sanad-slate pb-6 border-b border-sanad-border/60">
                <Badge variant={isScholar ? 'gold' : 'outline'} className="text-[11px]">
                  {profile.role}
                </Badge>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-sanad-slate" />
                  {profile.joined}
                </span>
                {!isScholar && (
                  <Link
                    href="/scholar/apply"
                    className="font-bold text-sanad-gold-dark hover:underline flex items-center gap-1"
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Apply for Verified Scholar Status</span>
                  </Link>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 pt-6">
                <div className="p-3 rounded-xl border border-sanad-border bg-sanad-ivory-warm/40 text-center">
                  <span className="font-serif text-xl font-bold text-sanad-emerald block">
                    {profile.stats.bookmarks}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sanad-slate">
                    Saved Hadiths
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-sanad-border bg-sanad-ivory-warm/40 text-center">
                  <span className="font-serif text-xl font-bold text-sanad-emerald block">
                    {profile.stats.following}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sanad-slate">
                    Scholars Followed
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-sanad-border bg-sanad-ivory-warm/40 text-center">
                  <span className="font-serif text-xl font-bold text-sanad-emerald block">
                    {profile.stats.lessons}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sanad-slate">
                    Authored Lessons
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Tab Selection */}
        <div className="flex border-b border-sanad-border mb-6">
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'bookmarks'
                ? 'border-sanad-emerald text-sanad-emerald'
                : 'border-transparent text-sanad-slate hover:text-sanad-emerald'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved Hadiths ({profile.bookmarks.length})</span>
          </button>
          {isScholar && (
            <button
              onClick={() => setActiveTab('lessons')}
              className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'lessons'
                  ? 'border-sanad-emerald text-sanad-emerald'
                  : 'border-transparent text-sanad-slate hover:text-sanad-emerald'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Authored Lessons ({profile.stats.lessons})</span>
            </button>
          )}
        </div>

        {/* Tab Panels */}
        {activeTab === 'bookmarks' && (
          <div className="space-y-3">
            {profile.bookmarks.map((b) => (
              <Link key={b.id} href={`/post/${b.id}`} className="block">
                <Card className="border-sanad-border bg-white hover:border-sanad-gold transition-colors p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-sanad-gold-dark">{b.reference}</span>
                    <Badge variant="sahih">{b.grade}</Badge>
                  </div>
                  <h3 className="font-serif text-base font-bold text-sanad-emerald mb-1">
                    {b.title}
                  </h3>
                  <span className="text-xs text-sanad-slate">Taught by {b.author}</span>
                </Card>
              </Link>
            ))}
          </div>
        )}
    </div>
  );
}