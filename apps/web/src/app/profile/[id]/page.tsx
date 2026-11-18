'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Calendar,
  Share2,
  ArrowLeft,
  MessageSquare,
} from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import Preloader from '../../../components/Preloader';
import { platformApi } from '../../../lib/api';

export default function PublicUserProfilePage() {
  const params = useParams();
  const rawId = params?.id as string;

  const [profile, setProfile] = useState<any | null>(null);
  const [counts, setCounts] = useState({ followers: 0, following: 0, lessons: 0 });
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    async function load() {
      if (!rawId) return;
      setLoading(true);
      try {
        const res = await platformApi.users.getUser(rawId);
        setProfile(res.user);
        if (res.counts) setCounts(res.counts);
        setIsFollowing(Boolean(res.isFollowing));
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [rawId]);

  const toggleFollow = async () => {
    if (!profile) return;
    const next = !isFollowing;
    setIsFollowing(next);
    setCounts((prev) => ({
      ...prev,
      followers: next ? prev.followers + 1 : Math.max(0, prev.followers - 1),
    }));

    try {
      if (next) {
        await platformApi.users.follow(rawId);
      } else {
        await platformApi.users.unfollow(rawId);
      }
    } catch {
      setIsFollowing(!next);
    }
  };

  if (loading) {
    return <Preloader fullScreen label="Loading Member Dossier..." description="Retrieving public profile from database" />;
  }

  if (!profile) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-xl font-serif font-bold text-sanad-emerald mb-2">Member Not Found</h2>
        <p className="text-xs text-sanad-muted mb-6">The requested member profile does not exist in the database.</p>
        <Link href="/explore">
          <Button variant="default" size="sm">Back to Community</Button>
        </Link>
      </div>
    );
  }

  const isScholar = Boolean(profile.scholarProfile?.verified || profile.roles?.includes('scholar'));

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sanad-slate hover:text-sanad-emerald transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Community</span>
        </Link>
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: profile.displayName, url: window.location.href });
            }
          }}
          className="p-2 rounded-lg border border-sanad-border bg-white text-sanad-slate hover:bg-sanad-ivory-warm"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

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
                {profile.displayName ? profile.displayName.charAt(0) : 'U'}
              </div>

              <div className="flex items-center gap-2 pb-1 self-start sm:self-auto">
                <Button
                  onClick={toggleFollow}
                  variant={isFollowing ? 'outline' : 'default'}
                  size="sm"
                  className="text-xs"
                >
                  {isFollowing ? 'Following' : '+ Follow Learner'}
                </Button>
                <Link href="/inbox">
                  <Button variant="secondary" size="sm" className="text-xs">
                    <MessageSquare className="w-3.5 h-3.5 mr-1 text-sanad-gold-dark" />
                    Message
                  </Button>
                </Link>
              </div>
            </div>

            {/* User Identity Block: 100% on white card background */}
            <div className="mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-sanad-emerald tracking-tight">
                  {profile.displayName}
                </h1>
                {isScholar && (
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sanad-gold/15 text-sanad-gold-dark text-xs font-semibold border border-sanad-gold/30">
                    <ShieldCheck className="w-3.5 h-3.5 text-sanad-gold-dark shrink-0" />
                    <span>Verified Faculty</span>
                  </div>
                )}
              </div>
              <p className="text-xs font-semibold text-sanad-slate mt-1">
                @{profile.username || 'member'}
              </p>
            </div>

            {/* Bio */}
            <p className="text-sm text-sanad-charcoal leading-relaxed mb-5 max-w-2xl">
              {profile.bio || 'Pursuing authentic Islamic knowledge and classical transmission.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-sanad-slate pb-6 border-b border-sanad-border/60">
              <Badge variant={isScholar ? 'gold' : 'outline'} className="text-[11px]">
                {isScholar ? 'Verified Faculty' : 'Registered Learner'}
              </Badge>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-sanad-slate" />
                Active Learner
              </span>
            </div>

            {/* Real Stats */}
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
                  Following
                </span>
              </div>
              <div className="p-3 rounded-xl border border-sanad-border bg-sanad-ivory-warm/40 text-center">
                <span className="font-serif text-xl font-bold text-sanad-emerald block">
                  {counts.lessons}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sanad-slate">
                  Lessons
                </span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
