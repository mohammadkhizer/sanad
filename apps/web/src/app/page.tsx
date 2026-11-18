'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Bookmark,
  Share2,
  MessageCircle,
  CheckCircle2,
  Award,
  Sparkles,
  BookOpen,
  Send,
  GraduationCap,
  ArrowRight,
  PlusCircle,
  MessageSquare,
} from 'lucide-react';
import { platformApi, Post, CommentItem } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import Preloader from '../components/Preloader';

const CATEGORIES = [
  { id: 'all', label: 'All Traditions' },
  { id: 'sahih', label: 'Sahih Traditions' },
  { id: 'hasan', label: 'Hasan Traditions' },
  { id: 'text', label: 'Written Treatises' },
  { id: 'reel', label: 'Video Lessons' },
];

export default function FeedPage() {
  const { user, isScholar } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [commentsMap, setCommentsMap] = useState<Record<string, CommentItem[]>>({});
  const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});
  const [sideScholars, setSideScholars] = useState<any[]>([]);

  const fetchPosts = async (cat: string) => {
    setLoading(true);
    try {
      const res = await platformApi.feed.getPosts(cat);
      setPosts(res.posts || []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    platformApi.users.listUsers().then((res) => {
      setSideScholars((res.users || []).slice(0, 4));
    }).catch(() => {
      setSideScholars([]);
    });
  }, []);

  const toggleComments = async (postId: string) => {
    if (activeCommentsPostId === postId) {
      setActiveCommentsPostId(null);
      return;
    }

    setActiveCommentsPostId(postId);
    if (!commentsMap[postId]) {
      setLoadingComments((prev) => ({ ...prev, [postId]: true }));
      try {
        const res = await platformApi.feed.getComments(postId);
        setCommentsMap((prev) => ({ ...prev, [postId]: res.comments || [] }));
      } catch {
        setCommentsMap((prev) => ({ ...prev, [postId]: [] }));
      } finally {
        setLoadingComments((prev) => ({ ...prev, [postId]: false }));
      }
    }
  };

  const toggleLike = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const willLike = !post.isLiked;
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            isLiked: willLike,
            likesCount: willLike ? p.likesCount + 1 : Math.max(0, p.likesCount - 1),
          };
        }
        return p;
      })
    );

    try {
      if (willLike) {
        await platformApi.feed.likePost(postId);
      } else {
        await platformApi.feed.unlikePost(postId);
      }
    } catch {
      // Revert on failure
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? post : p))
      );
    }
  };

  const toggleBookmark = async (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const willBookmark = !post.isBookmarked;
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isBookmarked: willBookmark } : p))
    );

    try {
      await platformApi.feed.savePost(postId);
    } catch {
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? post : p))
      );
    }
  };

  const handleAddComment = async (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const text = newCommentText.trim();
    setNewCommentText('');

    try {
      await platformApi.feed.addComment(postId, text);
      const res = await platformApi.feed.getComments(postId);
      setCommentsMap((prev) => ({ ...prev, [postId]: res.comments }));
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p))
      );
    } catch {
      // Refresh list
      const res = await platformApi.feed.getComments(postId).catch(() => ({ comments: [] }));
      setCommentsMap((prev) => ({ ...prev, [postId]: res.comments }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Platform Banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl border border-sanad-gold/40 bg-gradient-to-r from-sanad-emerald-deep to-sanad-emerald text-white p-6 sm:p-8 mb-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sanad-gold text-xs font-bold uppercase tracking-widest mb-3 border border-white/10">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Sacred Knowledge Transmission Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
            Verified Classical Exegesis &amp; Hadith Science
          </h1>
          <p className="text-sm text-white/80 mt-2 leading-relaxed">
            Every tradition and treatise is peer-reviewed by accredited teachers holding verified unbroken chains of transmission back to classical masters.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isScholar ? (
            <Link href="/create">
              <Button variant="gold" size="lg" className="whitespace-nowrap font-bold">
                <PlusCircle className="h-5 w-5 mr-2" />
                Publish Hadith Lesson
              </Button>
            </Link>
          ) : (
            <Link href="/scholar/apply">
              <Button variant="gold" size="lg" className="whitespace-nowrap font-bold">
                <GraduationCap className="h-5 w-5 mr-2" />
                Apply for Faculty Accreditation
              </Button>
            </Link>
          )}
        </div>
      </motion.div>

      {/* Main Grid: Feed & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Feed Stream */}
        <div className="lg:col-span-2 space-y-6">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedCategory === cat.id
                    ? 'bg-sanad-emerald text-white border-sanad-emerald shadow-sm'
                    : 'bg-white text-sanad-slate border-sanad-border hover:bg-sanad-ivory-warm'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {loading ? (
            <Preloader label="Curating Verified Lessons..." description="Retrieving authenticated traditions from the transmission registry" />
          ) : posts.length === 0 ? (
            <Card className="p-12 text-center border-dashed border-2 border-sanad-border bg-white shadow-sm">
              <div className="w-16 h-16 rounded-full bg-sanad-ivory-warm border border-sanad-gold/40 flex items-center justify-center font-arabic text-3xl text-sanad-gold mx-auto mb-4 select-none">
                سند
              </div>
              <h3 className="text-xl font-serif font-bold text-sanad-emerald mb-2">No Traditions Published Yet</h3>
              <p className="text-sm text-sanad-muted max-w-md mx-auto mb-6 leading-relaxed">
                The transmission repository is currently clear. Accredited scholars can publish classical Hadith commentaries and isnad audits directly into this database.
              </p>
              <div className="flex items-center justify-center gap-3">
                {isScholar ? (
                  <Link href="/create">
                    <Button variant="gold" size="sm">
                      <PlusCircle className="h-4 w-4 mr-1.5" />
                      Publish First Lesson
                    </Button>
                  </Link>
                ) : (
                  <Link href="/explore">
                    <Button variant="outline" size="sm">
                      Explore Scholars Directory
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          ) : (
            <AnimatePresence>
              {posts.map((post, idx) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                >
                  <Card className="overflow-hidden border-sanad-border bg-white hover:shadow-md transition-shadow">
                    <CardHeader className="p-6 pb-4">
                      {/* Author Header */}
                      <div className="flex items-start justify-between gap-4">
                        <Link href={`/profile/${post.author.id}`} className="flex items-center gap-3 group">
                          <div className="w-11 h-11 rounded-full bg-sanad-ivory-warm border border-sanad-gold flex items-center justify-center font-bold text-sanad-emerald text-sm shrink-0 group-hover:scale-105 transition-transform">
                            {post.author.displayName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-sm text-sanad-charcoal group-hover:text-sanad-emerald transition-colors">
                                {post.author.displayName}
                              </span>
                              {post.author.isScholar && (
                                <CheckCircle2 className="h-4 w-4 text-sanad-emerald fill-sanad-emerald/15" />
                              )}
                            </div>
                            <div className="text-xs text-sanad-muted flex items-center gap-2">
                              <span>@{post.author.username}</span>
                              {post.author.institution && (
                                <>
                                  <span>&bull;</span>
                                  <span className="text-[11px] font-medium text-sanad-gold-dark truncate max-w-[200px]">
                                    {post.author.institution}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </Link>

                        {/* Grade Badge */}
                        <Badge
                          variant={
                            post.chainVerificationStatus === 'sahih'
                              ? 'sahih'
                              : post.chainVerificationStatus === 'hasan'
                              ? 'hasan'
                              : 'daif'
                          }
                          className="capitalize shrink-0"
                        >
                          Grade: {post.chainVerificationStatus}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="px-6 pb-6 space-y-4">
                      {/* Hadith Arabic Inscription */}
                      {post.hadithTextArabic && (
                        <div className="rounded-xl border border-sanad-border-gold/40 bg-sanad-ivory-warm/60 p-5 text-right font-arabic text-xl sm:text-2xl text-sanad-emerald-deep leading-loose tracking-wide">
                          {post.hadithTextArabic}
                        </div>
                      )}

                      {/* English Translation */}
                      {post.hadithTextTranslation && (
                        <div className="text-sm font-serif italic text-sanad-charcoal/90 border-l-2 border-sanad-gold pl-3.5 py-1">
                          &ldquo;{post.hadithTextTranslation}&rdquo;
                        </div>
                      )}

                      {/* Source Reference */}
                      {post.sourceReference && (
                        <div className="text-xs font-bold uppercase tracking-wider text-sanad-gold-dark">
                          Source Reference: {post.sourceReference}
                        </div>
                      )}

                      {/* Exegesis Commentary Body */}
                      <p className="text-sm text-sanad-slate leading-relaxed">
                        {post.body}
                      </p>

                      {/* Tags */}
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-block px-2.5 py-0.5 rounded-md bg-sanad-ivory-warm text-sanad-emerald font-semibold text-[11px]"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Action Bar */}
                      <div className="pt-3 border-t border-sanad-border/80 flex items-center justify-between text-xs text-sanad-muted">
                        <div className="flex items-center gap-6">
                          <button
                            onClick={() => toggleLike(post.id)}
                            className={`flex items-center gap-1.5 transition-colors ${
                              post.isLiked ? 'text-rose-600 font-bold' : 'hover:text-rose-600'
                            }`}
                          >
                            <Heart className={`h-4 w-4 ${post.isLiked ? 'fill-rose-600' : ''}`} />
                            <span>{post.likesCount}</span>
                          </button>

                          <button
                            onClick={() => toggleComments(post.id)}
                            className="flex items-center gap-1.5 hover:text-sanad-emerald transition-colors"
                          >
                            <MessageCircle className="h-4 w-4" />
                            <span>{post.commentsCount} Discussions</span>
                          </button>

                          <Link
                            href={`/post/${post.id}`}
                            className="flex items-center gap-1 hover:text-sanad-emerald transition-colors"
                          >
                            <BookOpen className="h-4 w-4" />
                            <span>Sanad Breakdown</span>
                          </Link>

                          {post.author.id && (
                            <Link
                              href={`/inbox?userId=${post.author.id}`}
                              className="flex items-center gap-1 hover:text-sanad-emerald transition-colors text-sanad-gold-dark font-medium"
                              title="Start consultation"
                            >
                              <MessageSquare className="h-4 w-4" />
                              <span>Consult</span>
                            </Link>
                          )}
                        </div>

                        <button
                          onClick={() => toggleBookmark(post.id)}
                          className={`p-1.5 rounded-md hover:bg-sanad-ivory-warm transition-colors ${
                            post.isBookmarked ? 'text-sanad-gold-dark' : 'text-sanad-muted'
                          }`}
                        >
                          <Bookmark className={`h-4 w-4 ${post.isBookmarked ? 'fill-sanad-gold' : ''}`} />
                        </button>
                      </div>

                      {/* Comments Drawer */}
                      {activeCommentsPostId === post.id && (
                        <div className="pt-4 border-t border-dashed border-sanad-border space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-sanad-emerald">
                            Academic Discussions ({commentsMap[post.id]?.length || 0})
                          </h4>

                          {loadingComments[post.id] ? (
                            <div className="text-xs text-sanad-muted py-2">Loading commentary...</div>
                          ) : (commentsMap[post.id] || []).length === 0 ? (
                            <div className="text-xs text-sanad-muted py-2">
                              No scholarly reflections posted yet. Add the first reflection below.
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {(commentsMap[post.id] || []).map((c) => (
                                <div
                                  key={c.id}
                                  className="p-3 rounded-lg bg-sanad-ivory text-xs border border-sanad-border"
                                >
                                  <div className="flex justify-between font-bold text-sanad-charcoal mb-1">
                                    <span>{c.author}</span>
                                    <span className="text-[10px] text-sanad-muted font-normal">{c.date}</span>
                                  </div>
                                  <div className="text-sanad-slate">{c.text}</div>
                                </div>
                              ))}
                            </div>
                          )}

                          <form onSubmit={(e) => handleAddComment(post.id, e)} className="flex gap-2 pt-2">
                            <input
                              type="text"
                              value={newCommentText}
                              onChange={(e) => setNewCommentText(e.target.value)}
                              placeholder="Contribute scholarly note or clarification..."
                              className="flex-1 h-9 px-3 rounded-lg border border-sanad-border text-xs focus:outline-none focus:border-sanad-emerald"
                            />
                            <Button type="submit" size="sm" className="h-9 px-4">
                              <Send className="h-3.5 w-3.5 mr-1" />
                              Submit
                            </Button>
                          </form>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Right Aside: Verified Scholars & Transmission Standards */}
        <div className="space-y-6">
          {/* Verified Scholars Widget */}
          <Card className="p-5 border-sanad-border bg-white shadow-sm">
            <h3 className="font-bold text-sm text-sanad-emerald uppercase tracking-wider flex items-center gap-2 mb-4">
              <Award className="h-4 w-4 text-sanad-gold" />
              <span>Registered Scholars &amp; Faculty</span>
            </h3>

            {sideScholars.length === 0 ? (
              <div className="text-xs text-sanad-muted py-2">
                Scholars directory active. Check the Explore tab to discover registered teachers.
              </div>
            ) : (
              <div className="space-y-3.5">
                {sideScholars.map((sch) => (
                  <Link
                    key={sch._id || sch.id}
                    href={`/profile/${sch._id || sch.id}`}
                    className="flex items-center justify-between text-xs pb-3 border-b border-sanad-border last:border-none last:pb-0 hover:opacity-80 transition-opacity"
                  >
                    <div>
                      <div className="font-bold text-sanad-charcoal">{sch.displayName}</div>
                      <div className="text-[11px] text-sanad-muted">
                        {sch.scholarProfile?.institution || (sch.roles?.includes('scholar') ? 'Verified Faculty' : 'Member Seeker')}
                      </div>
                    </div>
                    <Badge variant={sch.roles?.includes('scholar') ? 'gold' : 'secondary'} className="text-[10px] shrink-0">
                      {sch.roles?.includes('scholar') ? 'Faculty' : 'Member'}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}

            <Link href="/explore" className="inline-flex items-center gap-1.5 text-xs font-bold text-sanad-emerald hover:underline mt-4">
              <span>View Directory</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Card>

          {/* Verification Criteria Info Box */}
          <Card className="p-5 border-sanad-border bg-sanad-ivory-warm/40">
            <h4 className="font-bold text-xs uppercase tracking-wider text-sanad-emerald mb-2">
              The 5 Pillars of Hadith Verification
            </h4>
            <p className="text-xs text-sanad-slate leading-relaxed mb-3">
              All traditions in Sanad are audited against the consensus classical standards:
            </p>
            <ul className="text-xs text-sanad-muted space-y-1.5 list-disc pl-4">
              <li>Itisal al-Sanad (Continuous unbroken transmission)</li>
              <li>Adalah (Moral uprightness of all narrators)</li>
              <li>Dabt (Mnemonic and manuscript precision)</li>
              <li>Adam al-Shudhudh (Absence of contradictory anomaly)</li>
              <li>Adam al-Illah (Absence of subtle hidden defects)</li>
            </ul>
            <Link href="/how-verification-works" className="inline-block text-xs font-bold text-sanad-emerald underline mt-3">
              Read Verification Documentation &rarr;
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
