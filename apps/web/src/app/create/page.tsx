'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Plus,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Spinner } from '../../components/Preloader';

interface NarratorInput {
  name: string;
  reliability: string;
}

export default function CreateLessonPage() {
  const router = useRouter();
  const { user, isScholar } = useAuth();

  const [hadithArabic, setHadithArabic] = useState('');
  const [hadithTranslation, setHadithTranslation] = useState('');
  const [sourceReference, setSourceReference] = useState('');
  const [grade, setGrade] = useState<'sahih' | 'hasan' | 'daif'>('sahih');
  const [commentary, setCommentary] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['Hadith', 'Epistemology']);
  const [narrators, setNarrators] = useState<NarratorInput[]>([
    { name: 'Imam al-Bukhari', reliability: 'Thiqah Thabt' },
    { name: 'Musaddad ibn Musarhad', reliability: 'Thiqah' },
    { name: 'Yahya ibn Sa’id', reliability: 'Thiqah' },
  ]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddNarrator = () => {
    setNarrators([...narrators, { name: '', reliability: 'Thiqah' }]);
  };

  const handleRemoveNarrator = (index: number) => {
    setNarrators(narrators.filter((_, i) => i !== index));
  };

  const handleUpdateNarrator = (index: number, field: keyof NarratorInput, value: string) => {
    const updated = [...narrators];
    updated[index][field] = value;
    setNarrators(updated);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!hadithArabic.trim()) {
      setError('Please provide the classical Arabic text of the Hadith.');
      return;
    }

    if (!hadithTranslation.trim()) {
      setError('Please provide the authoritative English translation.');
      return;
    }

    if (!sourceReference.trim()) {
      setError('Please specify the primary canonical source reference (e.g. Sahih al-Bukhari #1).');
      return;
    }

    setLoading(true);

    try {
      // Simulate publication dispatch
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSuccess(true);
      setTimeout(() => {
        router.push('/feed');
      }, 1500);
    } catch {
      setError('Publication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/feed"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sanad-slate hover:text-sanad-emerald transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel and Return</span>
          </Link>

          <Badge variant="gold" className="text-xs">
            Scholarly Publishing Studio
          </Badge>
        </div>

        {/* Scholar Verification Alert if not marked as scholar */}
        {!isScholar && (
          <div className="mb-6 p-4 rounded-xl border border-sanad-gold/50 bg-sanad-gold-subtle/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <GraduationCap className="w-5 h-5 text-sanad-gold-dark shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-sm text-sanad-emerald block">
                  Publishing as Candidate Scholar
                </span>
                <p className="text-xs text-sanad-slate mt-0.5">
                  Published lessons are held in academic pre-review until verified faculty credentials are confirmed.
                </p>
              </div>
            </div>
            <Link
              href="/scholar/apply"
              className="text-xs font-bold text-sanad-gold-dark hover:underline whitespace-nowrap"
            >
              Apply for Full Accreditation &rarr;
            </Link>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-sanad-border bg-white shadow-sm overflow-hidden">
            <CardHeader className="border-b border-sanad-border/60 pb-6">
              <CardTitle className="font-serif text-2xl font-bold text-sanad-emerald flex items-center gap-2.5">
                <BookOpen className="w-6 h-6 text-sanad-gold" />
                Publish Authentic Hadith Lesson
              </CardTitle>
              <CardDescription className="text-xs text-sanad-slate">
                Contribute verified traditions accompanied by complete Isnad chains and classical hermeneutics
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 sm:p-8">
              {error && (
                <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="mb-6 p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Lesson published successfully to the Knowledge Feed. Redirecting...</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Arabic Matn */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block">
                      Arabic Matn (Sacred Text) *
                    </label>
                    <span className="text-[11px] font-arabic text-sanad-gold-dark">
                      النص الأصلي بالتشكيل الكامل
                    </span>
                  </div>
                  <textarea
                    value={hadithArabic}
                    onChange={(e) => setHadithArabic(e.target.value)}
                    placeholder="أدخل نص الحديث النبوي الشريف مع التشكيل..."
                    rows={4}
                    dir="rtl"
                    className="w-full p-4 rounded-xl border border-sanad-border bg-sanad-ivory/30 font-arabic text-xl sm:text-2xl leading-[2] text-sanad-emerald-deep focus:outline-none focus:ring-1 focus:ring-sanad-emerald resize-y"
                    required
                  />
                </div>

                {/* English Translation */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block">
                    Accredited English Translation *
                  </label>
                  <textarea
                    value={hadithTranslation}
                    onChange={(e) => setHadithTranslation(e.target.value)}
                    placeholder="Enter the faithful English rendition of the Prophetic text..."
                    rows={3}
                    className="w-full p-3.5 rounded-xl border border-sanad-border bg-white text-sm text-sanad-charcoal focus:outline-none focus:ring-1 focus:ring-sanad-emerald resize-y leading-relaxed font-serif"
                    required
                  />
                </div>

                {/* Primary Reference & Grade */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block">
                      Canonical Reference *
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. Sahih al-Bukhari #1, Sahih Muslim #1907"
                      value={sourceReference}
                      onChange={(e) => setSourceReference(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block">
                      Chain Authenticity Grade *
                    </label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value as 'sahih' | 'hasan' | 'daif')}
                      className="w-full h-10 px-3 rounded-lg border border-sanad-border bg-white text-sm font-semibold text-sanad-charcoal focus:outline-none focus:ring-1 focus:ring-sanad-emerald"
                    >
                      <option value="sahih">Sahih (Rigorous Authenticity)</option>
                      <option value="hasan">Hasan (Good / Sound)</option>
                      <option value="daif">Da&apos;if (Weak Chain - Classical Morals Only)</option>
                    </select>
                  </div>
                </div>

                {/* Isnad Transmission Chain Builder */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block">
                        Isnad Transmission Chain (Narrator Lineage)
                      </label>
                      <span className="text-[11px] text-sanad-slate">
                        Sequence from final author back to the Prophet (pbuh)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddNarrator}
                      className="text-xs"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add Link
                    </Button>
                  </div>

                  <div className="space-y-2.5">
                    {narrators.map((n, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg border border-sanad-border bg-sanad-ivory/40 flex items-center gap-3"
                      >
                        <span className="w-6 h-6 rounded-full bg-sanad-emerald text-white text-xs font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <Input
                          placeholder="Narrator name (e.g. Yahya ibn Sa'id)"
                          value={n.name}
                          onChange={(e) => handleUpdateNarrator(i, 'name', e.target.value)}
                          className="flex-1 h-9 text-xs"
                        />
                        <select
                          value={n.reliability}
                          onChange={(e) => handleUpdateNarrator(i, 'reliability', e.target.value)}
                          className="h-9 px-2.5 rounded-lg border border-sanad-border bg-white text-xs text-sanad-charcoal"
                        >
                          <option value="Thiqah Thabt">Thiqah Thabt</option>
                          <option value="Thiqah">Thiqah</option>
                          <option value="Saduq">Saduq</option>
                          <option value="Sahabi">Sahabi</option>
                        </select>
                        {narrators.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveNarrator(i)}
                            className="p-1.5 text-sanad-slate hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scholarly Commentary (Sharh) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block">
                    Scholarly Commentary &amp; Hermeneutics (Sharh)
                  </label>
                  <textarea
                    value={commentary}
                    onChange={(e) => setCommentary(e.target.value)}
                    placeholder="Provide classical legal implications, linguistic nuances, or moral synthesis..."
                    rows={4}
                    className="w-full p-3.5 rounded-xl border border-sanad-border bg-white text-sm text-sanad-charcoal focus:outline-none focus:ring-1 focus:ring-sanad-emerald resize-y leading-relaxed"
                  />
                </div>

                {/* Topics & Tags */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-sanad-emerald uppercase tracking-wider block">
                    Disciplinary Tags
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tag (e.g. Fiqh, Usul, Ethics)"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      className="h-9 text-xs"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={handleAddTag}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sanad-ivory-warm text-sanad-emerald text-xs font-semibold border border-sanad-border"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-sanad-slate hover:text-red-600 text-xs font-bold"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-4 border-t border-sanad-border/60 flex items-center justify-between">
                  <span className="text-xs text-sanad-slate">
                    All transmissions adhere to the Sanad Authenticity Standard
                  </span>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Spinner size={16} />
                        Publishing...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-sanad-gold" />
                        Publish Lesson
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
    </div>
  );
}
