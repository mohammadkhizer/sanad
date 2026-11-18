'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Share2,
  Bookmark,
  Heart,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Send,
  Sparkles,
} from 'lucide-react';
import { webApi, HadithPost } from '../../../lib/api';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Preloader } from '../../../components/Preloader';

interface NarratorNode {
  step: number;
  name: string;
  arabicName: string;
  role: string;
  reliability: 'Thiqah (Trustworthy)' | 'Thiqah Thabt' | 'Saduq' | 'Sahabi (Companion)' | 'Prophet of Allah';
  era: string;
  deathYear?: string;
}

export default function PostDetailPage() {
  const params = useParams();
  const postId = (params?.id as string) || 'post-1';

  const [post, setPost] = useState<HadithPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<
    Array<{ id: string; author: string; role: string; text: string; date: string }>
  >([
    {
      id: 'c-1',
      author: 'Graduate Fellow of Usul',
      role: 'Student of Knowledge',
      text: 'Notice how Imam al-Bukhari deliberately placed this Hadith at the opening of his Jami to caution researchers that without purity of intention, scholarly exertion bears no sacred fruit.',
      date: '2 hours ago',
    },
    {
      id: 'c-2',
      author: 'Comparative Jurisprudence Chair',
      role: 'Verified Scholar',
      text: 'Indeed. The Hanafi and Shafi scholars also draw foundational rulings on conditional transactions and acts of worship from this single narration.',
      date: '5 hours ago',
    },
  ]);

  useEffect(() => {
    async function loadPost() {
      setLoading(true);
      const data = await webApi.posts.getById(postId);
      if (data) {
        setPost(data);
        setIsLiked(Boolean(data.isLiked));
        setLikesCount(data.likesCount || 0);
        setIsBookmarked(Boolean(data.isBookmarked));
      }
      setLoading(false);
    }
    loadPost();
  }, [postId]);

  const isnadChain: NarratorNode[] = [
    {
      step: 1,
      name: 'Imam al-Bukhari',
      arabicName: 'الإمام البخاري',
      role: 'Compiler & Author of Sahih',
      reliability: 'Thiqah Thabt',
      era: 'Transmitted in Nishapur / Bukhara',
      deathYear: '256 AH',
    },
    {
      step: 2,
      name: 'al-Humaydi (Abdullah ibn al-Zubayr)',
      arabicName: 'عبد الله بن الزبير الحميدي',
      role: 'Direct Teacher of al-Bukhari in Mecca',
      reliability: 'Thiqah Thabt',
      era: 'Mecca al-Mukarramah',
      deathYear: '219 AH',
    },
    {
      step: 3,
      name: "Sufyan ibn 'Uyaynah",
      arabicName: 'سفيان بن عيينة',
      role: 'Major Scholar of the Tabi al-Tabi’in',
      reliability: 'Thiqah (Trustworthy)',
      era: 'Kufa & Mecca',
      deathYear: '198 AH',
    },
    {
      step: 4,
      name: "Yahya ibn Sa'id al-Ansari",
      arabicName: 'يحيى بن سعيد الأنصاري',
      role: 'Jurist of Madinah al-Munawwarah',
      reliability: 'Thiqah (Trustworthy)',
      era: 'Madinah al-Munawwarah',
      deathYear: '143 AH',
    },
    {
      step: 5,
      name: 'Muhammad ibn Ibrahim al-Taymi',
      arabicName: 'محمد بن إبراهيم التيمي',
      role: 'Distinguished Successor (Tabi’i)',
      reliability: 'Thiqah (Trustworthy)',
      era: 'Madinah al-Munawwarah',
      deathYear: '120 AH',
    },
    {
      step: 6,
      name: "Alqama ibn Waqqas al-Laythi",
      arabicName: 'علقمة بن وقاص الليثي',
      role: 'Elder Successor (Senior Tabi’i)',
      reliability: 'Thiqah (Trustworthy)',
      era: 'Madinah al-Munawwarah',
      deathYear: 'Early 1st Century AH',
    },
    {
      step: 7,
      name: "Umar ibn al-Khattab",
      arabicName: 'عمر بن الخطاب رضي الله عنه',
      role: 'Second Rightly Guided Caliph',
      reliability: 'Sahabi (Companion)',
      era: 'Companions of the Prophet',
      deathYear: '23 AH',
    },
    {
      step: 8,
      name: 'The Messenger of Allah (pbuh)',
      arabicName: 'رسول الله صلى الله عليه وسلم',
      role: 'Direct Prophetic Utterance',
      reliability: 'Prophet of Allah',
      era: 'Madinah al-Munawwarah',
    },
  ];

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setComments([
      ...comments,
      {
        id: `c-${Date.now()}`,
        author: 'Knowledge Seeker',
        role: 'Registered Learner',
        text: newComment.trim(),
        date: 'Just now',
      },
    ]);
    setNewComment('');
  };

  if (loading || !post) {
    return <Preloader fullScreen message="Loading verified transmission and isnad chain..." />;
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 max-w-5xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/feed"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sanad-slate hover:text-sanad-emerald transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Knowledge Feed</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className="p-2 rounded-lg border border-sanad-border bg-white hover:bg-sanad-ivory-warm text-sanad-slate transition-colors"
              title={isBookmarked ? 'Saved to Bookmarks' : 'Bookmark this Lesson'}
            >
              <Bookmark
                className={`w-4 h-4 ${isBookmarked ? 'fill-sanad-gold text-sanad-gold' : ''}`}
              />
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: 'Sanad Hadith Lesson', url: window.location.href });
                }
              }}
              className="p-2 rounded-lg border border-sanad-border bg-white hover:bg-sanad-ivory-warm text-sanad-slate transition-colors"
              title="Share Lesson"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Master Hadith Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-sanad-border bg-white shadow-sm overflow-hidden mb-8">
            <div className="p-6 sm:p-8">
              {/* Header Attribution & Grade Badge */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-sanad-border/60">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full border border-sanad-gold/50 bg-sanad-ivory-warm flex items-center justify-center font-serif text-lg font-bold text-sanad-emerald">
                    {post.author.displayName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sanad-emerald text-base">
                        {post.author.displayName}
                      </span>
                      {post.author.isScholar && (
                        <ShieldCheck className="w-4 h-4 text-sanad-gold" />
                      )}
                    </div>
                    <span className="text-xs text-sanad-slate block">
                      {post.author.institution || 'Verified Sanad Faculty'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="gold" className="text-xs">
                    {post.sourceReference}
                  </Badge>
                  <Badge variant={post.chainVerificationStatus as 'sahih' | 'hasan' | 'daif'}>
                    Grade: {post.chainVerificationStatus.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Classical Arabic Matn */}
              <div className="my-8 p-6 sm:p-8 rounded-2xl border border-sanad-gold/40 bg-gradient-to-b from-sanad-ivory to-sanad-ivory-warm/40 shadow-inner">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-sanad-gold-dark block text-right mb-2 font-sans">
                  The Sacred Matn (Arabic Tradition)
                </span>
                <p className="font-arabic text-2xl sm:text-3xl lg:text-4xl leading-[2.1] text-sanad-emerald-deep text-right font-medium">
                  {post.hadithTextArabic}
                </p>
              </div>

              {/* English Translation */}
              <div className="mb-6 p-5 rounded-xl border border-sanad-border bg-white">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sanad-slate block mb-1">
                  Accredited Translation
                </span>
                <p className="font-serif text-lg text-sanad-charcoal italic leading-relaxed">
                  &ldquo;{post.hadithTextTranslation}&rdquo;
                </p>
              </div>

              {/* Scholarly Sharh / Commentary */}
              <div className="space-y-3 mb-6">
                <h3 className="font-serif text-lg font-bold text-sanad-emerald flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-sanad-gold" />
                  Scholarly Commentary (Sharh)
                </h3>
                <p className="text-sm text-sanad-slate leading-relaxed">
                  {post.body}
                </p>
              </div>

              {/* Tags & Interaction Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-sanad-border/60">
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-md text-xs font-semibold bg-sanad-ivory-warm text-sanad-emerald border border-sanad-border"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${
                      isLiked
                        ? 'border-red-200 bg-red-50 text-red-600'
                        : 'border-sanad-border bg-white text-sanad-slate hover:bg-sanad-ivory-warm'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-600 text-red-600' : ''}`} />
                    <span>{likesCount} Likes</span>
                  </button>

                  <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border border-sanad-border bg-sanad-ivory-warm/40 text-sanad-slate">
                    <MessageSquare className="w-4 h-4" />
                    <span>{comments.length} Reflections</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Isnad Transmission Chain Explorer */}
        <section className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold text-sanad-emerald flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sanad-gold" />
                Verified Isnad Chain &amp; Narrator Lineage
              </h2>
              <p className="text-xs text-sanad-slate mt-0.5">
                Sequential unbroken transmission analyzed under classical Jarh wa Ta&apos;dil criteria
              </p>
            </div>
            <Badge variant="gold" className="text-xs">
              8 Continuous Links
            </Badge>
          </div>

          <div className="space-y-3">
            {isnadChain.map((node, index) => {
              const isFirst = index === 0;
              const isLast = index === isnadChain.length - 1;

              return (
                <div key={node.step} className="relative">
                  {/* Vertical connector line */}
                  {!isLast && (
                    <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gradient-to-b from-sanad-gold to-sanad-border z-0" />
                  )}

                  <div className="relative z-10 p-4 sm:p-5 rounded-xl border border-sanad-border bg-white hover:border-sanad-gold transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-start sm:items-center gap-3.5">
                      <div className="w-10 h-10 rounded-full border border-sanad-gold/60 bg-gradient-to-br from-sanad-emerald to-sanad-emerald-deep text-white font-serif text-sm font-bold flex items-center justify-center shrink-0">
                        {node.step}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm sm:text-base text-sanad-emerald">
                            {node.name}
                          </span>
                          <span className="font-arabic text-sm text-sanad-gold font-semibold">
                            {node.arabicName}
                          </span>
                        </div>
                        <span className="text-xs text-sanad-slate block mt-0.5">
                          {node.role} &bull; {node.era}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 sm:self-center shrink-0">
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-sanad-ivory-warm border border-sanad-border text-sanad-emerald">
                        {node.reliability}
                      </span>
                      {node.deathYear && (
                        <span className="text-[10px] font-semibold text-sanad-slate">
                          d. {node.deathYear}
                        </span>
                      )}
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Discussion / Halaqah Commentary Section */}
        <section>
          <div className="mb-4">
            <h2 className="font-serif text-xl font-bold text-sanad-emerald flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-sanad-gold" />
              Scholarly Reflections &amp; Halaqah Discussion
            </h2>
            <p className="text-xs text-sanad-slate mt-0.5">
              Reflections are monitored strictly for classical decorum and respectful discourse
            </p>
          </div>

          {/* Add Reflection Form */}
          <Card className="border-sanad-border bg-white shadow-sm mb-6">
            <CardContent className="p-4 sm:p-5">
              <form onSubmit={handleAddComment} className="space-y-3">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Contribute a verified scholarly inquiry or linguistic reflection..."
                  rows={3}
                  className="w-full p-3 rounded-lg border border-sanad-border bg-sanad-ivory/50 text-sm focus:outline-none focus:ring-1 focus:ring-sanad-emerald resize-none"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-sanad-slate">
                    Please cite classical sources where applicable
                  </span>
                  <Button type="submit" size="sm" disabled={!newComment.trim()}>
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    Post Reflection
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Comments List */}
          <div className="space-y-3">
            {comments.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-xl border border-sanad-border bg-white shadow-sm space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-sanad-emerald">{c.author}</span>
                    <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                      {c.role}
                    </Badge>
                  </div>
                  <span className="text-[10px] text-sanad-slate">{c.date}</span>
                </div>
                <p className="text-xs text-sanad-charcoal leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
        </section>
    </div>
  );
}