'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, CheckCircle2, UserPlus, BookOpen, Compass, Award } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';

const VERIFIED_SCHOLARS = [
  {
    id: 'scholar-1',
    name: 'Senior Hadith Department Fellow',
    username: 'hadith_chair',
    institution: 'Dar al-Hadith Classical Seminary',
    specialties: ['Sahihayn Exegesis', 'Narrator Evaluation', 'Manuscript Variants'],
    followers: 1280,
    lessons: 142,
    isFollowing: false,
  },
  {
    id: 'scholar-2',
    name: 'Principles of Jurisprudence Chair',
    username: 'usul_studies',
    institution: 'Faculty of Classical Usul & Hermeneutics',
    specialties: ['Qiyas & Ta’wil', 'Shafi’i & Hanafi Jurisprudence', 'Linguistic Maxims'],
    followers: 940,
    lessons: 96,
    isFollowing: true,
  },
  {
    id: 'scholar-3',
    name: 'Biographical Evaluation & Rijal Researcher',
    username: 'rijal_scholar',
    institution: 'Center for Isnad Heritage & Transmission',
    specialties: ['Tahdhib al-Kamal', 'Early Transmitter Chains', 'Basran Recensions'],
    followers: 2150,
    lessons: 215,
    isFollowing: false,
  },
  {
    id: 'scholar-4',
    name: 'Quranic Exegesis & Balaghah Lecturer',
    username: 'tafsir_fellow',
    institution: 'Institute of Classical Arabic Eloquence',
    specialties: ['I’jaz al-Qur’an', 'Bayan & Ma’ani', 'Tabari Traditions'],
    followers: 780,
    lessons: 64,
    isFollowing: false,
  },
];

const POPULAR_SUBJECTS = [
  { name: 'Ilm al-Rijal', desc: 'Critical verification of narrator trustworthiness and accuracy' },
  { name: 'Sahih al-Bukhari', desc: 'Detailed line-by-line isnad analysis of the primary Sahih' },
  { name: 'Usul al-Hadith', desc: 'Methodological rules governing tradition categorization' },
  { name: 'Mutawatir Traditions', desc: 'Multiply-transmitted narrations with absolute epistemic certainty' },
  { name: 'Fiqh al-Sunnah', desc: 'Deductive legal derivation from authentic prophetic precedent' },
];

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [scholars, setScholars] = useState(VERIFIED_SCHOLARS);

  const toggleFollow = (id: string) => {
    setScholars((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const next = !s.isFollowing;
          return {
            ...s,
            isFollowing: next,
            followers: next ? s.followers + 1 : s.followers - 1,
          };
        }
        return s;
      })
    );
  };

  const filteredScholars = scholars.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.specialties.some((sp) => sp.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.institution.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          Search accredited professors, research fellows, and classical disciplines audited by the Sanad Academic Council.
        </p>

        {/* Search Input */}
        <div className="relative mt-6 max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-sanad-muted" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by scholar title, specialty (e.g. Sahihayn, Rijal, Usul), or institution..."
            className="pl-11 h-12 rounded-xl text-sm shadow-sm"
          />
        </div>
      </div>

      {/* Verified Faculty Grid */}
      <div className="mb-12">
        <h2 className="text-lg font-bold text-sanad-charcoal mb-4 flex items-center gap-2">
          <Award className="h-5 w-5 text-sanad-gold" />
          <span>Accredited Faculty ({filteredScholars.length})</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredScholars.map((sch, i) => (
            <motion.div
              key={sch.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
            >
              <Card className="p-6 border-sanad-border hover:shadow-md transition-all h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-sanad-ivory-warm border border-sanad-gold flex items-center justify-center font-bold text-sanad-emerald text-base shrink-0">
                        {sch.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Link href={`/profile/${sch.id}`} className="font-bold text-base text-sanad-charcoal hover:text-sanad-emerald transition-colors">
                            {sch.name}
                          </Link>
                          <CheckCircle2 className="h-4 w-4 text-sanad-emerald shrink-0" />
                        </div>
                        <div className="text-xs text-sanad-muted">@{sch.username}</div>
                      </div>
                    </div>

                    <Button
                      variant={sch.isFollowing ? 'secondary' : 'default'}
                      size="sm"
                      onClick={() => toggleFollow(sch.id)}
                      className="shrink-0"
                    >
                      {sch.isFollowing ? 'Following' : '+ Follow'}
                    </Button>
                  </div>

                  <div className="text-xs font-semibold text-sanad-gold-dark mb-3">
                    {sch.institution}
                  </div>

                  {/* Specialties Pills */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {sch.specialties.map((sp) => (
                      <span
                        key={sp}
                        className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-sanad-ivory text-sanad-slate border border-sanad-border"
                      >
                        {sp}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-sanad-border flex items-center justify-between text-xs text-sanad-muted">
                  <span>{sch.followers} Students</span>
                  <span>{sch.lessons} Verified Lessons</span>
                  <Link href={`/profile/${sch.id}`} className="font-bold text-sanad-emerald hover:underline">
                    View Faculty Page &rarr;
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Classical Disciplines Overview */}
      <div>
        <h2 className="text-lg font-bold text-sanad-charcoal mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-sanad-emerald" />
          <span>Curated Fields of Specialization</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {POPULAR_SUBJECTS.map((sub, idx) => (
            <Card key={idx} className="p-5 border-sanad-border hover:border-sanad-gold transition-colors">
              <h3 className="font-bold text-sm text-sanad-emerald mb-1">{sub.name}</h3>
              <p className="text-xs text-sanad-muted leading-relaxed">{sub.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
