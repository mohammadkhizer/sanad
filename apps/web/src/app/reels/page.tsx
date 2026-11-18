'use client';

import React, { useState } from 'react';
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
  Award,
  CheckCircle2,
  Bookmark,
  Share2,
} from 'lucide-react';
import { platformApi, Reel } from '../../lib/api';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';

export default function ReelsPage() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});

  React.useEffect(() => {
    platformApi.reels.getReels().then((res) => setReels(res.reels));
  }, []);

  if (reels.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center font-bold text-sanad-emerald">Loading Scholarly Reels...</div>
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

        {/* Video Canvas Simulation (with ornate Islamic motif) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center select-none opacity-40 pointer-events-none">
          <div className="w-32 h-32 rounded-full border border-sanad-gold/30 flex items-center justify-center font-arabic text-5xl text-sanad-gold">
            سند
          </div>
          <div className="text-xs uppercase tracking-widest text-sanad-gold mt-4 font-bold">
            Classical Transmission Stream
          </div>
        </div>

        {/* Bottom Metadata Overlay */}
        <div className="z-10 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-sanad-ivory-warm text-sanad-emerald font-bold flex items-center justify-center text-xs">
              {currentReel.scholar.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1 font-bold text-sm">
                <span>{currentReel.scholar.name}</span>
                <CheckCircle2 className="h-3.5 w-3.5 text-sanad-gold fill-sanad-gold/20" />
              </div>
              <div className="text-[11px] text-white/70">{currentReel.scholar.institution}</div>
            </div>
          </div>

          <h3 className="font-serif font-bold text-lg text-white leading-snug">
            {currentReel.title}
          </h3>

          <p className="text-xs text-white/80 line-clamp-3 leading-relaxed">
            {currentReel.summary}
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-white/20 text-xs">
            <span className="text-sanad-gold font-bold">
              {currentReel.hadithRef} &bull; {currentReel.duration}
            </span>

            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleLike(currentReel.id)}
                className={`flex items-center gap-1 font-bold ${
                  likedMap[currentReel.id] ? 'text-rose-400' : 'text-white'
                }`}
              >
                <Heart className={`h-4 w-4 ${likedMap[currentReel.id] ? 'fill-rose-400' : ''}`} />
                <span>{currentReel.likes + (likedMap[currentReel.id] ? 1 : 0)}</span>
              </button>
              <button className="text-white hover:text-sanad-gold">
                <Bookmark className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Vertical Nav Arrows */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-2 rounded-full bg-black/50 text-white hover:bg-black/80 disabled:opacity-30 disabled:pointer-events-none"
            title="Previous Reel"
          >
            <ChevronUp className="h-5 w-5" />
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === reels.length - 1}
            className="p-2 rounded-full bg-black/50 text-white hover:bg-black/80 disabled:opacity-30 disabled:pointer-events-none"
            title="Next Reel"
          >
            <ChevronDown className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

