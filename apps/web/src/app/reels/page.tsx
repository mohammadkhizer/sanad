'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Share2,
  Video,
} from 'lucide-react';
import { platformApi, Reel } from '../../lib/api';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import Preloader from '../../components/Preloader';

export default function ReelsPage() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLoading(true);
    platformApi.reels
      .getReels()
      .then((res) => {
        setReels(res.reels || []);
      })
      .catch(() => {
        setReels([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <Preloader label="Loading Pedagogical Reels..." description="Connecting to media transmission network" />
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Card className="p-10 border-dashed border-2 border-sanad-border bg-white shadow-sm">
          <div className="w-14 h-14 rounded-full bg-sanad-ivory-warm border border-sanad-gold/40 flex items-center justify-center text-sanad-gold-dark mx-auto mb-4">
            <Video className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-serif font-bold text-sanad-emerald mb-2">
            No Scholarly Reels Published Yet
          </h2>
          <p className="text-xs text-sanad-muted max-w-md mx-auto mb-6 leading-relaxed">
            The video transmission registry currently has zero published short lessons. Verified scholars can record and broadcast concise Hadith breakdowns into this library.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/explore">
              <Button variant="outline" size="sm" className="text-xs">
                Explore Faculty
              </Button>
            </Link>
            <Link href="/feed">
              <Button variant="default" size="sm" className="text-xs">
                Browse Knowledge Feed
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const currentReel = reels[currentIndex];

  const handleNext = () => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const toggleLike = (id: string) => {
    setLikedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col items-center">
      <div className="text-center mb-6">
        <Badge variant="gold" className="mb-2">Pedagogical Shorts</Badge>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-sanad-emerald">
          Classical Exegesis Video Lessons
        </h1>
        <p className="text-xs text-sanad-muted mt-1">
          Bite-sized scholarly breakdowns of narrator chains, legal maxims, and terminology.
        </p>
      </div>

      {/* Main Reel Stage */}
      <div className="relative w-full max-w-md h-[580px] rounded-2xl overflow-hidden shadow-2xl border-2 border-sanad-border bg-[#072924] text-white flex flex-col justify-between p-6">
        {/* Top Controls */}
        <div className="flex items-center justify-between z-10">
          <Badge variant={currentReel.grade === 'sahih' ? 'sahih' : 'hasan'} className="uppercase">
            {currentReel.grade}
          </Badge>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Video Canvas Simulation */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center select-none opacity-40 pointer-events-none">
          <div className="w-32 h-32 rounded-full border border-sanad-gold/30 flex items-center justify-center font-arabic text-5xl text-sanad-gold">
            سند
          </div>
          <span className="text-xs font-mono text-sanad-gold mt-4 uppercase tracking-widest">
            Sanad Verified Media Stream
          </span>
        </div>

        {/* Bottom Metadata & Controls */}
        <div className="z-10 space-y-3">
          <div>
            <div className="text-xs font-bold text-sanad-gold uppercase tracking-wider mb-1">
              {currentReel.hadithRef}
            </div>
            <h2 className="text-lg font-serif font-bold text-white leading-snug">
              {currentReel.title}
            </h2>
            <p className="text-xs text-white/80 line-clamp-2 mt-1 leading-relaxed">
              {currentReel.summary}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-sanad-gold text-sanad-emerald font-bold flex items-center justify-center text-xs">
                {currentReel.scholar.name.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-xs text-white leading-none">
                  {currentReel.scholar.name}
                </div>
                <div className="text-[10px] text-white/60">{currentReel.scholar.handle}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleLike(currentReel.id)}
                className={`flex items-center gap-1 text-xs ${
                  likedMap[currentReel.id] ? 'text-rose-400 font-bold' : 'text-white/80 hover:text-white'
                }`}
              >
                <Heart className={`h-4 w-4 ${likedMap[currentReel.id] ? 'fill-rose-400' : ''}`} />
                <span>{currentReel.likes + (likedMap[currentReel.id] ? 1 : 0)}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-2 rounded-full bg-black/40 hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-white"
          >
            <ChevronUp className="h-5 w-5" />
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === reels.length - 1}
            className="p-2 rounded-full bg-black/40 hover:bg-black/70 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-white"
          >
            <ChevronDown className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
