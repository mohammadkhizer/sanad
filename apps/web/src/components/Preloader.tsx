'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface PreloaderProps {
  label?: string;
  message?: string;
  description?: string;
  inline?: boolean;
  fullScreen?: boolean;
  className?: string;
}

export function Preloader({
  label = 'Loading...',
  message,
  description,
  inline = false,
  fullScreen = false,
  className,
}: PreloaderProps) {
  const displayLabel = message || label;
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center w-full',
        fullScreen ? 'fixed inset-0 z-50 bg-sanad-ivory/90 backdrop-blur-sm' : inline ? 'py-8' : 'min-h-[60vh] py-16',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="relative w-14 h-14 mb-4 flex items-center justify-center">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border-2 border-sanad-gold/20" />

        {/* Animated Emerald Arc */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-2 border-t-sanad-emerald border-r-transparent border-b-transparent border-l-transparent"
        />

        {/* Center Arabic Crest */}
        <motion.div
          animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-7 h-7 rounded-full bg-sanad-ivory-warm border border-sanad-gold flex items-center justify-center text-sanad-gold-dark font-black text-xs select-none"
        >
          سند
        </motion.div>
      </div>

      {displayLabel && (
        <h4 className="text-sm font-bold text-sanad-emerald tracking-wide">
          {displayLabel}
        </h4>
      )}

      {description && (
        <p className="text-xs text-sanad-muted mt-1 max-w-xs leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}

export default Preloader;

export function Spinner({
  size = 16,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      className={cn('inline-block shrink-0', className)}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" fill="none" />
      <path d="M12 2a10 10 0 0 1 10 10" />
    </motion.svg>
  );
}
