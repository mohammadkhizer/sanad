'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Heart,
  Bookmark,
  Share2,
  ArrowLeft,
  BookOpen,
  Calendar,
  Send,
} from 'lucide-react';
import { platformApi, Post, CommentItem } from '../../../lib/api';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import Preloader from '../../../components/Preloader';

export default function PostDetailPage() {
  const params = useParams();
  const postId = params?.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (!postId) return;

    async function loadPost() {
      setLoading(true);
      try {
        const data = await platformApi.feed.getPost(postId);
        if (data.post) {
          setPost(data.post);
          setIsLiked(Boolean(data.isLiked));
          setLikesCount(data.post.likesCount || 0);
          setIsBookmarked(Boolean(data.isSaved));
        }
      } catch {
        setPost(null);
      }

      try {
        const cRes = await platformApi.feed.getComments(postId);
        setComments(cRes.comments || []);
      } catch {
        setComments([]);
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, [postId]);

  const handleLike = async () => {
    if (!post) return;
    const willLike = !isLiked;
    setIsLiked(willLike);
    setLikesCount(willLike ? likesCount + 1 : Math.max(0, likesCount - 1));

    try {
      if (willLike) {
        await platformApi.posts.like(postId);
      } else {
        await platformApi.posts.unlike(postId);
      }
    } catch {
      setIsLiked(!willLike);
    }
  };

  const handleBookmark = async () => {
    if (!post) return;
    const willBookmark = !isBookmarked;
    setIsBookmarked(willBookmark);

    try {
      await platformApi.posts.save(postId);
    } catch {
      setIsBookmarked(!willBookmark);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submittingComment) return;

    const text = newComment.trim();
    setSubmittingComment(true);

    try {
      await platformApi.posts.addComment(postId, text);
      setNewComment('');
      const cRes = await platformApi.feed.getComments(postId);
      setComments(cRes.comments || []);
    } catch {
      // Revert or refresh
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return <Preloader fullScreen label="Loading Verified Transmission..." description="Retrieving canonical tradition and isnad verification from database" />;
  }

  if (!post) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-xl font-serif font-bold text-sanad-emerald mb-2">Tradition Not Found</h2>
        <p className="text-xs text-sanad-muted mb-6">The requested Hadith lesson does not exist in the platform registry.</p>
        <Link href="/feed">
          <Button variant="default" size="sm">Back to Knowledge Feed</Button>
        </Link>
      </div>
    );
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
            onClick={handleBookmark}
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
                <div className="w-12 h-12 rounded-full border border-sanad-gold/50 bg-sanad-ivory-warm flex items-center justify-center font-serif text-lg font-bold text-sanad-emerald select-none">
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
                {post.sourceReference && (
                  <Badge variant="gold" className="text-xs">
                    {post.sourceReference}
                  </Badge>
                )}
                <Badge variant={post.chainVerificationStatus as 'sahih' | 'hasan' | 'daif'}>
                  Grade: {post.chainVerificationStatus.toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* Inscribed Arabic Text */}
            {post.hadithTextArabic && (
              <div className="my-6 p-6 rounded-2xl bg-sanad-ivory-warm/60 border border-sanad-border-gold/40 text-right">
                <p className="font-arabic text-2xl sm:text-3xl text-sanad-emerald-deep leading-loose tracking-wide">
                  {post.hadithTextArabic}
                </p>
              </div>
            )}

            {/* Translation */}
            {post.hadithTextTranslation && (
              <div className="mb-6 p-4 rounded-xl border-l-4 border-sanad-gold bg-sanad-ivory/50">
                <span className="text-xs font-bold text-sanad-gold-dark uppercase tracking-wider block mb-1">
                  Authoritative Translation
                </span>
                <p className="text-sm sm:text-base font-serif italic text-sanad-charcoal leading-relaxed">
                  &ldquo;{post.hadithTextTranslation}&rdquo;
                </p>
              </div>
            )}

            {/* Commentary Body */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-sanad-slate mb-2">
                Scholarly Exegesis &amp; Legal Deduction
              </h3>
              <p className="text-sm text-sanad-charcoal leading-relaxed">
                {post.body}
              </p>
            </div>

            {/* Tags and Interaction Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-sanad-border/60">
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-md bg-sanad-ivory text-xs font-semibold text-sanad-emerald border border-sanad-border/80"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4 text-xs font-bold">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-colors ${
                    isLiked
                      ? 'bg-rose-50 border-rose-200 text-rose-600'
                      : 'border-sanad-border hover:bg-sanad-ivory text-sanad-slate'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
                  <span>{likesCount} Likes</span>
                </button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Discussion & Academic Comments Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl font-bold text-sanad-emerald flex items-center gap-2">
            <span>Academic Reflections</span>
            <span className="text-xs font-sans font-bold px-2 py-0.5 rounded-full bg-sanad-gold/20 text-sanad-gold-dark">
              {comments.length}
            </span>
          </h3>
        </div>

        {/* Comment Submission Form */}
        <Card className="p-4 sm:p-5 border-sanad-border bg-white shadow-sm">
          <form onSubmit={handleAddComment} className="space-y-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Contribute scholarly notes, linguistic nuances, or transmission questions..."
              rows={3}
              className="w-full p-3 rounded-xl border border-sanad-border text-xs leading-relaxed focus:outline-none focus:border-sanad-emerald resize-none"
            />
            <div className="flex justify-end">
              <Button type="submit" size="sm" disabled={submittingComment || !newComment.trim()}>
                <Send className="w-3.5 h-3.5 mr-1.5" />
                {submittingComment ? 'Posting...' : 'Post Commentary'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Comments Feed */}
        {comments.length === 0 ? (
          <Card className="p-8 text-center border-dashed border-2 border-sanad-border bg-white shadow-sm">
            <h4 className="font-serif text-sm font-bold text-sanad-emerald mb-1">
              No Commentary Posted Yet
            </h4>
            <p className="text-xs text-sanad-muted max-w-sm mx-auto">
              Be the first accredited scholar or student of knowledge to add reflections on this tradition.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {comments.map((c) => (
              <Card key={c.id} className="p-4 sm:p-5 border-sanad-border bg-white shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-sanad-charcoal">{c.author}</span>
                    {c.role && (
                      <Badge variant="secondary" className="text-[10px]">
                        {c.role}
                      </Badge>
                    )}
                  </div>
                  <span className="text-[11px] text-sanad-slate">{c.date}</span>
                </div>
                <p className="text-xs text-sanad-slate leading-relaxed">{c.text}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
