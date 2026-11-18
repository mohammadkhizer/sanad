'use client';

import React from 'react';
import { cn } from '../lib/utils';

interface PreloaderProps {
  label?: string;
  message?: string;
  description?: string;
  inline?: boolean;
  fullScreen?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function Preloader({
  label = 'Loading...',
  message,
  description,
  inline = false,
  fullScreen = false,
  className,
  style,
}: PreloaderProps) {
  const displayLabel = message || label;
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center w-full',
        fullScreen
          ? 'fixed inset-0 z-50 bg-[#FBF9F4] text-[#121A18]'
          : inline
          ? 'py-8'
          : 'min-h-[60vh] py-16',
        className
      )}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        minHeight: fullScreen ? '100vh' : undefined,
        backgroundColor: fullScreen ? '#FBF9F4' : undefined,
        fontFamily: 'var(--font-sans, system-ui, sans-serif)',
        ...style,
      }}
      role="status"
      aria-live="polite"
    >
      <div
        className="relative w-14 h-14 mb-4 flex items-center justify-center"
        style={{ position: 'relative', width: '56px', height: '56px', marginBottom: '16px' }}
      >
        {/* Outer Ring */}
        <div
          className="absolute inset-0 rounded-full border-2 border-sanad-gold/20"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2px solid rgba(201, 151, 39, 0.25)',
          }}
        />

        {/* Animated Emerald Spinning Arc */}
        <svg
          width="56"
          height="56"
          viewBox="0 0 56 56"
          fill="none"
          className="animate-spin absolute inset-0"
          style={{ position: 'absolute', inset: 0 }}
        >
          <circle
            cx="28"
            cy="28"
            r="26"
            stroke="#0D453E"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="40 120"
          />
        </svg>

        {/* Center Arabic Crest */}
        <div
          className="w-8 h-8 rounded-full bg-[#F4ECE0] border border-[#C99727] flex items-center justify-center text-[#9E7418] font-black text-xs select-none shadow-sm"
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#F4ECE0',
            border: '1px solid #C99727',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9E7418',
            fontWeight: 800,
            fontSize: '12px',
            userSelect: 'none',
          }}
        >
          سند
        </div>
      </div>

      {displayLabel && (
        <h4
          className="text-sm font-bold text-sanad-emerald tracking-wide"
          style={{
            fontSize: '14px',
            fontWeight: 700,
            color: '#0D453E',
            letterSpacing: '0.025em',
            margin: '4px 0 0 0',
          }}
        >
          {displayLabel}
        </h4>
      )}

      {description && (
        <p
          className="text-xs text-sanad-slate/70 mt-1 max-w-xs leading-relaxed"
          style={{
            fontSize: '12px',
            color: 'rgba(40, 55, 51, 0.75)',
            marginTop: '4px',
            maxWidth: '320px',
            lineHeight: 1.5,
          }}
        >
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
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className={cn('inline-block shrink-0 animate-spin', className)}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.2" fill="none" />
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}
