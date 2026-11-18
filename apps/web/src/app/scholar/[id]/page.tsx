'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  BookOpen,
  MessageSquare,
  Video,
  Calendar,
  ArrowLeft,
  Share2,
  Bookmark,
} from 'lucide-react';
import { platformApi, Post } from '../../../lib/api';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import Preloader from '../../../components/Preloader';

export default function ScholarDossierPage() {
  const params = useParams();
  const scholarId = params?.id as string;

  const [scholar, setScholar] = useState<any | null>(null);
  const [counts, setCounts] = useState({ followers: 0, following: 0, lessons: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [lessons, setLessons] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'lessons' | 'credentials'>('lessons');

  useEffect(() => {
    if (!scholarId) return;

    async function loadScholar() {
      setLoading(true);
      try {
        const res = await platformApi.users.getUser(scholarId);
        setScholar(res.user);
        if (res.counts) setCounts(res.counts);
        setIsFollowing(Boolean(res.isFollowing));
      } catch {
        setScholar(null);
      }

      try {
        const feedRes = await platformApi.feed.getPosts(undefined, scholarId);
        setLessons(feedRes.posts || []);
      } catch {
        setLessons([]);
      } finally {
        setLoading(false);
      }
    }

    loadScholar();
  }, [scholarId]);

  const toggleFollow = async () => {
    if (!scholar) return;
    const next = !isFollowing;
    setIsFollowing(next);
    setCounts((prev) => ({
      ...prev,
      followers: next ? prev.followers + 1 : Math.max(0, prev.followers - 1),
    }));

    try {
      if (next) {
        await platformApi.users.follow(scholarId);
      } else {
        await platformApi.users.unfollow(scholarId);
      }
    } catch {
      setIsFollowing(!next);
    }
  };

  if (loading) {
    return <Preloader fullScreen label="Auditing Scholar Credentials..." description="Retrieving verified accreditation records" />;
  }

  if (!scholar) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-xl font-serif font-bold text-sanad-emerald mb-2">Scholar Not Found</h2>
        <p className="text-xs text-sanad-muted mb-6">The requested teacher profile does not exist in the faculty directory.</p>
        <Link href="/explore">
          <Button variant="default" size="sm">Back to Faculty Directory</Button>
        </Link>
      </div>
    );
  }

  const isScholar = Boolean(scholar.scholarProfile?.verified || scholar.roles?.includes('scholar'));
  const institution = scholar.scholarProfile?.institution || 'Sanad Academic Foundation';

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sanad-slate hover:text-sanad-emerald transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Scholar Directory</span>
        </Link>
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: scholar.displayName, url: window.location.href });
            }
          }}
          className="p-2 rounded-lg border border-sanad-border bg-white text-sanad-slate hover:bg-sanad-ivory-warm"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Scholar Master Dossier Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-sanad-border bg-white shadow-sm overflow-hidden mb-8">
          <div className="h-32 sm:h-36 bg-gradient-to-r from-sanad-emerald via-sanad-emerald-deep to-[#0A332E] relative border-b border-sanad-gold/40">
            <div className="absolute right-6 bottom-4 opacity-15 font-arabic text-6xl text-sanad-gold font-bold select-none">
              سند
            </div>
          </div>

          <div className="px-6 sm:px-8 pb-8 pt-0 relative">
            {/* Avatar and Action Controls */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 mb-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white bg-gradient-to-br from-sanad-emerald to-sanad-emerald-deep text-white font-serif text-3xl font-bold flex items-center justify-center shadow-lg ring-1 ring-sanad-border/30 shrink-0 select-none">
                {scholar.displayName ? scholar.displayName.charAt(0) : 'S'}
              </div>

              <div className="flex flex-wrap items-center gap-2 pb-1 self-start sm:self-auto">
                <Button
                  onClick={toggleFollow}
                  variant={isFollowing ? 'outline' : 'default'}
                  size="sm"
                  className="text-xs"
                >
                  {isFollowing ? 'Following Scholar' : '+ Follow Faculty'}
                </Button>
                <Link href={`/inbox?userId=${scholarId}`}>
                  <Button variant="secondary" size="sm" className="text-xs">
                    <MessageSquare className="w-3.5 h-3.5 mr-1 text-sanad-gold-dark" />
                    Consultation
                  </Button>
                </Link>
                <Link href={`/call/${scholarId}`}>
                  <Button variant="gold" size="sm" className="text-xs">
                    <Video className="w-3.5 h-3.5 mr-1" />
                    Video Halaqah
                  </Button>
                </Link>
              </div>
            </div>

            {/* Scholar Identity Block: 100% on white card background */}
            <div className="mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-sanad-emerald tracking-tight">
                  {scholar.displayName}
                </h1>
                {isScholar && (
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sanad-gold/15 text-sanad-gold-dark text-xs font-semibold border border-sanad-gold/30">
                    <ShieldCheck className="w-3.5 h-3.5 text-sanad-gold-dark shrink-0" />
                    <span>Verified Faculty</span>
                  </div>
                )}
              </div>
              <p className="text-xs font-semibold text-sanad-slate mt-1">
                @{scholar.username || 'scholar'} &bull; {institution}
              </p>
            </div>

            {/* Bio & Meta */}
            <p className="text-sm text-sanad-charcoal leading-relaxed mb-6 max-w-3xl">
              {scholar.bio || 'Accredited teacher of traditional Hadith literature, textual criticism, and unbroken transmission chains.'}
            </p>

            <div className="flex flex-wrap gap-y-2 gap-x-6 text-xs text-sanad-slate pb-6 border-b border-sanad-border/60">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-sanad-slate" />
                Active Sanad Scholar
              </span>
            </div>

            {/* Stats directly from database */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-6">
              <div className="p-4 rounded-xl border border-sanad-border bg-sanad-ivory-warm/40 text-center">
                <span className="font-serif text-2xl font-bold text-sanad-emerald block">
                  {counts.lessons}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sanad-slate">
                  Published Lessons
                </span>
              </div>
              <div className="p-4 rounded-xl border border-sanad-border bg-sanad-ivory-warm/40 text-center">
                <span className="font-serif text-2xl font-bold text-sanad-emerald block">
                  {counts.followers}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sanad-slate">
                  Students &amp; Followers
                </span>
              </div>
              <div className="p-4 rounded-xl border border-sanad-border bg-sanad-ivory-warm/40 text-center col-span-2 sm:col-span-1">
                <span className="font-serif text-2xl font-bold text-sanad-emerald block">
                  {counts.following}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sanad-slate">
                  Scholars Followed
                </span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Tabs */}
      <div className="flex border-b border-sanad-border mb-6">
        <button
          onClick={() => setActiveTab('lessons')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'lessons'
              ? 'border-sanad-emerald text-sanad-emerald'
              : 'border-transparent text-sanad-slate hover:text-sanad-emerald'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Authored Lessons ({lessons.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('credentials')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'credentials'
              ? 'border-sanad-emerald text-sanad-emerald'
              : 'border-transparent text-sanad-slate hover:text-sanad-emerald'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Accreditation &amp; Specialties</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'lessons' ? (
        lessons.length === 0 ? (
          <Card className="p-10 text-center border-dashed border-2 border-sanad-border bg-white shadow-sm">
            <h3 className="font-serif text-base font-bold text-sanad-emerald mb-1">
              No Lessons Authored Yet
            </h3>
            <p className="text-xs text-sanad-muted max-w-sm mx-auto">
              This scholar has not authored any public Hadith commentaries in the repository yet.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {lessons.map((lesson) => (
              <Link key={lesson.id} href={`/post/${lesson.id}`} className="block">
                <Card className="border-sanad-border bg-white hover:border-sanad-gold transition-colors p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-sanad-gold-dark">{lesson.sourceReference}</span>
                    <Badge variant={lesson.chainVerificationStatus}>{lesson.chainVerificationStatus}</Badge>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-sanad-emerald mb-1.5">
                    {lesson.body?.slice(0, 90) || 'Authored Treatise'}
                  </h3>
                  <div className="text-xs text-sanad-slate">
                    Published on {new Date(lesson.createdAt).toLocaleDateString()}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )
      ) : (
        <Card className="p-6 border-sanad-border bg-white shadow-sm space-y-4">
          <h3 className="font-serif text-base font-bold text-sanad-emerald">Specialized Academic Fields</h3>
          {Array.isArray(scholar.scholarProfile?.specialties) && scholar.scholarProfile.specialties.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {scholar.scholarProfile.specialties.map((s: string) => (
                <span key={s} className="px-3 py-1 rounded-lg bg-sanad-ivory text-sanad-emerald border border-sanad-border text-xs font-medium">
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-sanad-muted">No specific specialties declared.</p>
          )}

          <div className="pt-4 border-t border-sanad-border">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sanad-slate mb-1">Institutional Seal</h4>
            <p className="text-sm font-semibold text-sanad-charcoal">{institution}</p>
          </div>
        </Card>
      )}
    </div>
  );
}
