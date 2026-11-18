'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Award,
  BookOpen,
  MessageSquare,
  Video,
  CheckCircle2,
  Calendar,
  MapPin,
  ArrowLeft,
  Share2,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';

export default function ScholarDossierPage() {
  const params = useParams();
  const scholarId = (params?.id as string) || 'scholar-1';

  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'lessons' | 'ijazahs' | 'halaqat'>('lessons');

  const scholar = {
    id: scholarId,
    name: 'Hadith Studies & Isnad Verification Chair',
    arabicTitle: 'أستاذ الحديث النبوي وعلوم الرواية',
    institution: 'Dar al-Hadith Classical Seminary, Cairo',
    location: 'Cairo, Egypt',
    joined: 'Sanad Faculty Member since 2024',
    bio: 'Dedicated researcher of early canonical Hadith manuscripts, rijal evaluation (Jarh wa Ta’dil), and authentic chains of transmission across North Africa and the Levant. Holding unbroken isnad lineages connecting to the Six Books.',
    stats: {
      lessons: 48,
      ijazahs: 6,
      students: '1,240',
      rating: '4.98',
    },
    ijazahs: [
      {
        title: 'Ijazah in the Six Canonical Compilations (al-Kutub al-Sittah)',
        teacher: 'Traditional Transmission Council of Damascus',
        year: '2016',
        chainType: 'Unbroken Continuous Lineage',
      },
      {
        title: 'Certification in Musnad Ahmad ibn Hanbal',
        teacher: 'Dar al-Hadith Seminary',
        year: '2019',
        chainType: 'Direct Auditory Transmission (Sama’)',
      },
      {
        title: 'Licensure in Al-Muwatta of Imam Malik',
        teacher: 'Faculty of Classical Usul',
        year: '2021',
        chainType: 'Recitation and Endorsement (Qira’ah)',
      },
    ],
    lessons: [
      {
        id: 'post-1',
        title: 'Actions and Intentions in Epistemology',
        reference: 'Sahih al-Bukhari #1',
        arabicSnippet: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ',
        grade: 'Sahih',
      },
      {
        id: 'post-2',
        title: 'The Semantic Depth of Sincere Counsel',
        reference: 'Sahih Muslim #55',
        arabicSnippet: 'الدِّينُ النَّصِيحَةُ',
        grade: 'Sahih',
      },
    ],
  };

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
                navigator.share({ title: scholar.name, url: window.location.href });
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
            <div className="h-32 bg-gradient-to-r from-sanad-emerald via-sanad-emerald-deep to-[#0A332E] relative border-b border-sanad-gold/40">
              <div className="absolute right-6 bottom-4 opacity-15 font-arabic text-6xl text-sanad-gold font-bold select-none">
                سند
              </div>
            </div>

            <div className="px-6 sm:px-8 pb-8 pt-0 relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12 mb-6">
                <div className="flex items-end gap-4">
                  <div className="w-24 h-24 rounded-2xl border-4 border-white bg-gradient-to-br from-sanad-emerald to-sanad-emerald-deep text-white font-serif text-3xl font-bold flex items-center justify-center shadow-md">
                    {scholar.name.charAt(0)}
                  </div>
                  <div className="mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="font-serif text-2xl font-bold text-sanad-emerald">
                        {scholar.name}
                      </h1>
                      <ShieldCheck className="w-5 h-5 text-sanad-gold" />
                    </div>
                    <span className="font-arabic text-sm text-sanad-gold-dark font-medium block">
                      {scholar.arabicTitle}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-stretch sm:self-auto">
                  <Button
                    onClick={() => setIsFollowing(!isFollowing)}
                    variant={isFollowing ? 'outline' : 'default'}
                    className="flex-1 sm:flex-none text-xs"
                  >
                    {isFollowing ? 'Following Scholar' : 'Follow Faculty'}
                  </Button>
                  <Link href="/inbox">
                    <Button variant="secondary" className="text-xs">
                      <MessageSquare className="w-4 h-4 mr-1.5 text-sanad-gold-dark" />
                      Consultation
                    </Button>
                  </Link>
                  <Link href={`/call/${scholar.id}`}>
                    <Button variant="gold" className="text-xs">
                      <Video className="w-4 h-4 mr-1.5" />
                      Video Halaqah
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Bio & Meta */}
              <p className="text-sm text-sanad-charcoal leading-relaxed mb-6 max-w-3xl">
                {scholar.bio}
              </p>

              <div className="flex flex-wrap gap-y-2 gap-x-6 text-xs text-sanad-slate pb-6 border-b border-sanad-border/60">
                <span className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-sanad-gold" />
                  {scholar.institution}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-sanad-emerald" />
                  {scholar.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-sanad-slate" />
                  {scholar.joined}
                </span>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6">
                <div className="p-3.5 rounded-xl border border-sanad-border bg-sanad-ivory-warm/40 text-center">
                  <span className="font-serif text-2xl font-bold text-sanad-emerald block">
                    {scholar.stats.lessons}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sanad-slate">
                    Published Lessons
                  </span>
                </div>
                <div className="p-3.5 rounded-xl border border-sanad-border bg-sanad-ivory-warm/40 text-center">
                  <span className="font-serif text-2xl font-bold text-sanad-emerald block">
                    {scholar.stats.ijazahs}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sanad-slate">
                    Connected Ijazahs
                  </span>
                </div>
                <div className="p-3.5 rounded-xl border border-sanad-border bg-sanad-ivory-warm/40 text-center">
                  <span className="font-serif text-2xl font-bold text-sanad-emerald block">
                    {scholar.stats.students}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sanad-slate">
                    Enrolled Learners
                  </span>
                </div>
                <div className="p-3.5 rounded-xl border border-sanad-border bg-sanad-ivory-warm/40 text-center">
                  <span className="font-serif text-2xl font-bold text-sanad-gold-dark block">
                    {scholar.stats.rating}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sanad-slate">
                    Academic Evaluation
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex border-b border-sanad-border mb-6">
          {[
            { id: 'lessons', label: 'Published Lessons' },
            { id: 'ijazahs', label: 'Verified Ijazahs & Sanad' },
            { id: 'halaqat', label: 'Live Academic Halaqat' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === t.id
                  ? 'border-sanad-emerald text-sanad-emerald'
                  : 'border-transparent text-sanad-slate hover:text-sanad-emerald'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'lessons' && (
          <div className="space-y-4">
            {scholar.lessons.map((lesson) => (
              <Link key={lesson.id} href={`/post/${lesson.id}`} className="block">
                <Card className="border-sanad-border bg-white hover:border-sanad-gold transition-colors p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-sanad-gold-dark">
                      {lesson.reference}
                    </span>
                    <Badge variant={lesson.grade === 'Sahih' ? 'sahih' : 'hasan'}>
                      {lesson.grade}
                    </Badge>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-sanad-emerald mb-1">
                    {lesson.title}
                  </h3>
                  <p className="font-arabic text-lg text-sanad-emerald-deep text-right">
                    {lesson.arabicSnippet}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {activeTab === 'ijazahs' && (
          <div className="space-y-4">
            {scholar.ijazahs.map((ij, idx) => (
              <Card key={idx} className="border-sanad-border bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-sm text-sanad-emerald">{ij.title}</h4>
                    <span className="text-xs text-sanad-slate block mt-0.5">
                      Issued by: {ij.teacher} &bull; Year: {ij.year}
                    </span>
                    <Badge variant="gold" className="text-[10px] mt-2">
                      {ij.chainType}
                    </Badge>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'halaqat' && (
          <Card className="border-sanad-border bg-white p-8 text-center">
            <Video className="w-8 h-8 text-sanad-gold mx-auto mb-2" />
            <h4 className="font-serif text-lg font-bold text-sanad-emerald">
              Upcoming Live Transmission Halaqah
            </h4>
            <p className="text-xs text-sanad-slate mt-1 max-w-md mx-auto">
              Weekly commentary on Kitab al-Iman from Sahih Muslim. Audio and visual transmission available to registered seekers.
            </p>
            <div className="mt-4">
              <Link href={`/call/${scholar.id}`}>
                <Button size="sm">Enter Seminar Room</Button>
              </Link>
            </div>
          </Card>
        )}
    </div>
  );
}
