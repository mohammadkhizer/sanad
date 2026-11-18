'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Bookmark,
  BookOpen,
  Settings,
  Edit3,
  Calendar,
  GraduationCap,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { platformApi, Post } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import Preloader from '../../components/Preloader';

export default function CurrentUserProfilePage() {
  const { user, updateUser, isScholar } = useAuth();
  const [activeTab, setActiveTab] = useState<'lessons' | 'bookmarks'>('bookmarks');
  const [counts, setCounts] = useState({ followers: 0, following: 0, lessons: 0 });
  const [authoredPosts, setAuthoredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      try {
        const meRes = await platformApi.users.getMe();
        if (meRes.user) {
          updateUser(meRes.user);
        }
        if (meRes.counts) {
          setCounts(meRes.counts);
        }
      } catch {
        // Fallback to local counts if guest or network delay
      }

      try {
        if (user?.id) {
          const feedRes = await platformApi.feed.getPosts(undefined, user.id);
          setAuthoredPosts(feedRes.posts || []);
        }
      } catch {
        setAuthoredPosts([]);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user?.id]);

  const displayName = user?.displayName || 'Registered Member';
  const username = user?.username || 'member';
  const bio = user?.bio || 'Student of classical Islamic traditions and isnad transmission.';
  const roleName = isScholar ? 'Verified Scholar' : 'Registered Learner';

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
            {/* Avatar and Action Controls */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 mb-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white bg-gradient-to-br from-sanad-emerald to-sanad-emerald-deep text-white font-serif text-3xl font-bold flex items-center justify-center shadow-lg ring-1 ring-sanad-border/30 shrink-0 select-none">
                {displayName.charAt(0)}
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

            {/* User Identity Block: 100% on white card background */}
            <div className="mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-sanad-emerald tracking-tight">
                  {displayName}
                </h1>
                {isScholar && (
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sanad-gold/15 text-sanad-gold-dark text-xs font-semibold border border-sanad-gold/30">
                    <ShieldCheck className="w-3.5 h-3.5 text-sanad-gold-dark shrink-0" />
                    <span>Verified Scholar</span>
                  </div>
                )}
              </div>
              <p className="text-xs font-semibold text-sanad-slate mt-1">
                @{username}
              </p>
            </div>

            {/* Bio */}
            <p className="text-sm text-sanad-charcoal leading-relaxed mb-5 max-w-2xl">
              {bio}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-sanad-slate pb-6 border-b border-sanad-border/60">
              <Badge variant={isScholar ? 'gold' : 'outline'} className="text-[11px]">
                {roleName}
              </Badge>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-sanad-slate" />
                Active Sanad Member
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

            {/* Stats directly from MongoDB */}
            <div className="grid grid-cols-3 gap-3 pt-6">
              <div className="p-3 rounded-xl border border-sanad-border bg-sanad-ivory-warm/40 text-center">
                <span className="font-serif text-xl font-bold text-sanad-emerald block">
                  {counts.followers}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sanad-slate">
                  Followers
                </span>
              </div>
              <div className="p-3 rounded-xl border border-sanad-border bg-sanad-ivory-warm/40 text-center">
                <span className="font-serif text-xl font-bold text-sanad-emerald block">
                  {counts.following}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sanad-slate">
                  Scholars Followed
                </span>
              </div>
              <div className="p-3 rounded-xl border border-sanad-border bg-sanad-ivory-warm/40 text-center">
                <span className="font-serif text-xl font-bold text-sanad-emerald block">
                  {counts.lessons}
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
          <span>Saved Hadiths</span>
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
            <span>Authored Lessons ({authoredPosts.length})</span>
          </button>
        )}
      </div>

      {/* Tab Panels */}
      {loading ? (
        <Preloader label="Loading profile records..." description="Querying transmission archives" />
      ) : activeTab === 'bookmarks' ? (
        <Card className="p-8 text-center border-dashed border-2 border-sanad-border bg-white shadow-sm">
          <div className="w-12 h-12 rounded-full bg-sanad-ivory-warm border border-sanad-gold/30 flex items-center justify-center text-sanad-gold-dark mx-auto mb-3">
            <Bookmark className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-base font-bold text-sanad-emerald mb-1">
            No Saved Hadiths Yet
          </h3>
          <p className="text-xs text-sanad-muted max-w-sm mx-auto mb-4">
            Traditions and scholarly commentaries you bookmark while reading the Knowledge Feed will appear here for review.
          </p>
          <Link href="/feed">
            <Button variant="outline" size="sm" className="text-xs">
              Explore Traditions Feed
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {authoredPosts.length === 0 ? (
            <Card className="p-8 text-center border-dashed border-2 border-sanad-border bg-white shadow-sm">
              <div className="w-12 h-12 rounded-full bg-sanad-ivory-warm border border-sanad-gold/30 flex items-center justify-center text-sanad-gold-dark mx-auto mb-3">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-base font-bold text-sanad-emerald mb-1">
                No Authored Lessons Yet
              </h3>
              <p className="text-xs text-sanad-muted max-w-sm mx-auto mb-4">
                As a verified scholar, you can author Hadith treatises and isnad breakdowns in the Publishing Studio.
              </p>
              <Link href="/create">
                <Button variant="gold" size="sm" className="text-xs">
                  <PlusCircle className="w-3.5 h-3.5 mr-1" />
                  Publish New Tradition
                </Button>
              </Link>
            </Card>
          ) : (
            authoredPosts.map((p) => (
              <Link key={p.id} href={`/post/${p.id}`} className="block">
                <Card className="border-sanad-border bg-white hover:border-sanad-gold transition-colors p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-sanad-gold-dark">{p.sourceReference}</span>
                    <Badge variant={p.chainVerificationStatus}>{p.chainVerificationStatus}</Badge>
                  </div>
                  <h3 className="font-serif text-base font-bold text-sanad-emerald mb-1">
                    {p.body?.slice(0, 80) || 'Authored Treatise'}
                  </h3>
                  <div className="text-xs text-sanad-slate">
                    Published on {new Date(p.createdAt).toLocaleDateString()}
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
