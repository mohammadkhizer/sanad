'use client';

import React from 'react';

interface SpinnerProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export function Spinner({
  size = 16,
  color = 'currentColor',
  strokeWidth = 2.5,
  style,
}: SpinnerProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      className="animate-spin"
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        ...style,
      }}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke={color} strokeOpacity="0.2" fill="none" />
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}

interface PreloaderProps {
  label?: string;
  description?: string;
  inline?: boolean;
  minHeight?: string | number;
  style?: React.CSSProperties;
}

export default function Preloader({
  label = 'Loading...',
  description,
  inline = false,
  minHeight,
  style,
}: PreloaderProps) {
  const containerHeight = minHeight || (inline ? '180px' : '65vh');

  return (
    <div
      style={{
        minHeight: containerHeight,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: inline ? '24px 16px' : '48px 24px',
        textAlign: 'center',
        width: '100%',
        boxSizing: 'border-box',
        ...style,
      }}
      role="status"
      aria-live="polite"
    >
      {/* Outer dual-ring orbital spinner with Sanad brand crest */}
      <div
        style={{
          position: 'relative',
          width: '56px',
          height: '56px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Subtle gold outer glow ring */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2px solid rgba(201, 151, 39, 0.2)',
          }}
        />

        {/* Animated Emerald spinning arc */}
        <svg
          width="56"
          height="56"
          viewBox="0 0 56 56"
          fill="none"
          className="animate-spin"
          style={{ position: 'absolute', inset: 0 }}
        >
          <circle
            cx="28"
            cy="28"
            r="26"
            stroke="var(--color-emerald)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="40 120"
          />
        </svg>

        {/* Center geometric motif pulsing gently */}
        <div
          className="animate-pulse-glow"
          style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-ivory-warm)',
            border: '1px solid var(--color-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-gold-dark)',
            fontSize: '11px',
            fontWeight: 800,
            userSelect: 'none',
          }}
        >
          سند
        </div>
      </div>

      {label && (
        <div
          style={{
            fontSize: '14px',
            fontWeight: 700,
            color: 'var(--color-emerald)',
            letterSpacing: '0.3px',
          }}
        >
          {label}
        </div>
      )}

      {description && (
        <div
          style={{
            fontSize: '12px',
            color: 'var(--color-muted)',
            marginTop: '4px',
            maxWidth: '340px',
            lineHeight: 1.5,
          }}
        >
          {description}
        </div>
      )}
    </div>
  );
}
