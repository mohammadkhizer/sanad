'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Award,
  BookOpen,
  Calendar,
  MessageSquare,
  ArrowLeft,
  Share2,
  Lock,
} from 'lucide-react';
import { Preloader } from '../../../components/Preloader';
import { Button } from '../../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { webApi } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

export default function PublicUserProfilePage() {
  const params = useParams();
  const rawId = (params?.id as string) || 'member-1';
  const { isAuthenticated } = useAuth();

  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await webApi.users.getUser(rawId);
        setProfile(res.user);
        setIsFollowing(res.isFollowing || false);
      } catch {
        // Fallback profile
        setProfile({
          id: rawId,
          displayName: 'Seeker of Sacred Traditions',
          username: 'seeker_' + rawId.slice(0, 5),
          bio: 'Student of classical Hadith methodology, Arabic lexicography, and isnad transmission.',
          roles: ['member'],
          joined: 'Joined 1446 AH',
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [rawId]);

  if (loading || !profile) {
    return <Preloader fullScreen message="Loading public learner dossier..." />;
  }

  const isScholar = profile.roles?.includes('scholar');

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
              {/* Avatar and Action Controls: Avatar overlaps banner safely while actions align in card area */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 mb-4">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white bg-gradient-to-br from-sanad-emerald to-sanad-emerald-deep text-white font-serif text-3xl font-bold flex items-center justify-center shadow-lg ring-1 ring-sanad-border/30 shrink-0 select-none">
                  {profile.displayName ? profile.displayName.charAt(0) : 'U'}
                </div>

                <div className="flex items-center gap-2 pb-1 self-start sm:self-auto">
                  <Button
                    onClick={() => setIsFollowing(!isFollowing)}
                    variant={isFollowing ? 'outline' : 'default'}
                    size="sm"
                    className="text-xs"
                  >
                    {isFollowing ? 'Following' : 'Follow Learner'}
                  </Button>
                  <Link href="/inbox">
                    <Button variant="secondary" size="sm" className="text-xs">
                      <MessageSquare className="w-3.5 h-3.5 mr-1 text-sanad-gold-dark" />
                      Message
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
                      <span>Verified Faculty</span>
                    </div>
                  )}
                </div>
                <p className="text-xs font-semibold text-sanad-slate mt-1">
                  @{profile.username}
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
            </div>
          </Card>
        </motion.div>
    </div>
  );
}