'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, CheckCircle2, BookOpen, Compass, Award } from 'lucide-react';
import { platformApi } from '../../lib/api';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import Preloader from '../../components/Preloader';

const POPULAR_SUBJECTS = [
  { name: 'Ilm al-Rijal', desc: 'Critical verification of narrator trustworthiness, biographical integrity, and precision.' },
  { name: 'Sahih al-Bukhari & Muslim', desc: 'Detailed line-by-line isnad analysis of the primary Sahihayn collections.' },
  { name: 'Usul al-Hadith', desc: 'Methodological rules governing tradition categorization, audition, and defect detection.' },
  { name: 'Mutawatir Traditions', desc: 'Multiply-transmitted narrations with absolute epistemic consensus across centuries.' },
  { name: 'Fiqh al-Sunnah', desc: 'Deductive legal derivation and hermeneutics from authentic prophetic precedent.' },
];

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function loadDirectory() {
      setLoading(true);
      try {
        const res = await platformApi.users.listUsers();
        setUsers(res.users || []);
        const initFollow: Record<string, boolean> = {};
        (res.users || []).forEach((u) => {
          if (u.isFollowing) initFollow[u._id || u.id] = true;
        });
        setFollowingMap(initFollow);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }

    loadDirectory();
  }, []);

  const toggleFollow = async (id: string) => {
    const isCurrentlyFollowing = Boolean(followingMap[id]);
    setFollowingMap((prev) => ({ ...prev, [id]: !isCurrentlyFollowing }));

    try {
      if (isCurrentlyFollowing) {
        await platformApi.users.unfollow(id);
      } else {
        await platformApi.users.follow(id);
      }
    } catch {
      setFollowingMap((prev) => ({ ...prev, [id]: isCurrentlyFollowing }));
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const nameMatch = (u.displayName || '').toLowerCase().includes(q);
    const userMatch = (u.username || '').toLowerCase().includes(q);
    const instMatch = (u.scholarProfile?.institution || '').toLowerCase().includes(q);
    const specMatch = Array.isArray(u.scholarProfile?.specialties)
      ? u.scholarProfile.specialties.some((s: string) => s.toLowerCase().includes(q))
      : false;
    return nameMatch || userMatch || instMatch || specMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sanad-gold-subtle text-sanad-gold-dark text-xs font-bold uppercase tracking-wider mb-2">
          <Compass className="h-3.5 w-3.5" />
          <span>Faculty &amp; Traditions Directory</span>
        </div>
        <h1 className="text-3xl font-serif font-bold text-sanad-emerald">
          Explore Verified Scholars &amp; Disciplines
        </h1>
        <p className="text-sm text-sanad-muted mt-1 max-w-2xl">
          Search accredited professors, research fellows, and registered members audited by the Sanad Academic Council.
        </p>

        {/* Search Input */}
        <div className="relative mt-6 max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-sanad-muted" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by scholar name, username, or specialty..."
            className="pl-11 h-12 rounded-xl text-sm shadow-sm"
          />
        </div>
      </div>

      {/* Verified Faculty Grid */}
      <div className="mb-12">
        <h2 className="text-lg font-bold text-sanad-charcoal mb-4 flex items-center gap-2">
          <Award className="h-5 w-5 text-sanad-gold" />
          <span>Directory ({filteredUsers.length})</span>
        </h2>

        {loading ? (
          <Preloader label="Loading Directory..." description="Accessing live members and scholars from database" />
        ) : filteredUsers.length === 0 ? (
          <Card className="p-8 text-center border-dashed border-2 border-sanad-border bg-white shadow-sm">
            <h3 className="font-serif text-base font-bold text-sanad-emerald mb-1">
              No Registered Users Found
            </h3>
            <p className="text-xs text-sanad-muted max-w-sm mx-auto">
              No members or accredited faculty matched your search criteria.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredUsers.map((u, i) => {
              const uId = u._id || u.id;
              const isScholar = Boolean(u.scholarProfile?.verified || u.roles?.includes('scholar'));
              const isFollowing = Boolean(followingMap[uId]);

              return (
                <motion.div
                  key={uId}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                >
                  <Card className="p-6 border-sanad-border bg-white hover:shadow-md transition-all h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-sanad-ivory-warm border border-sanad-gold flex items-center justify-center font-bold text-sanad-emerald text-base shrink-0 select-none">
                            {u.displayName ? u.displayName.charAt(0) : 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <Link
                                href={isScholar ? `/scholar/${uId}` : `/profile/${uId}`}
                                className="font-bold text-base text-sanad-charcoal hover:text-sanad-emerald transition-colors"
                              >
                                {u.displayName}
                              </Link>
                              {isScholar && (
                                <CheckCircle2 className="h-4 w-4 text-sanad-emerald shrink-0" />
                              )}
                            </div>
                            <div className="text-xs text-sanad-muted">@{u.username || 'user'}</div>
                          </div>
                        </div>

                        <Button
                          variant={isFollowing ? 'outline' : 'default'}
                          size="sm"
                          onClick={() => toggleFollow(uId)}
                          className="shrink-0 text-xs"
                        >
                          {isFollowing ? 'Following' : '+ Follow'}
                        </Button>
                      </div>

                      <div className="text-xs font-semibold text-sanad-gold-dark mb-3">
                        {u.scholarProfile?.institution || (isScholar ? 'Verified Faculty' : 'Registered Member')}
                      </div>

                      {u.bio && (
                        <p className="text-xs text-sanad-slate mb-3 line-clamp-2 leading-relaxed">
                          {u.bio}
                        </p>
                      )}

                      {/* Specialties Pills */}
                      {Array.isArray(u.scholarProfile?.specialties) && u.scholarProfile.specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {u.scholarProfile.specialties.map((sp: string) => (
                            <span
                              key={sp}
                              className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-sanad-ivory text-sanad-slate border border-sanad-border"
                            >
                              {sp}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-sanad-border flex items-center justify-between text-xs text-sanad-muted">
                      <Badge variant={isScholar ? 'gold' : 'outline'} className="text-[10px]">
                        {isScholar ? 'Faculty' : 'Member'}
                      </Badge>
                      <Link
                        href={isScholar ? `/scholar/${uId}` : `/profile/${uId}`}
                        className="font-bold text-sanad-emerald hover:underline"
                      >
                        View Dossier &rarr;
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Classical Disciplines Overview */}
      <div>
        <h2 className="text-lg font-bold text-sanad-charcoal mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-sanad-emerald" />
          <span>Curated Fields of Specialization</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {POPULAR_SUBJECTS.map((sub, idx) => (
            <Card key={idx} className="p-5 border-sanad-border bg-white hover:border-sanad-gold transition-colors">
              <h3 className="font-bold text-sm text-sanad-emerald mb-1">{sub.name}</h3>
              <p className="text-xs text-sanad-muted leading-relaxed">{sub.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
