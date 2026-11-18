'use client';

import React, { useState } from 'react';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  wrapperStyle?: React.CSSProperties;
}

export default function PasswordInput({
  wrapperStyle,
  style,
  id,
  placeholder = 'Enter password',
  required = false,
  value,
  onChange,
  autoComplete = 'current-password',
  onFocus,
  onBlur,
  ...rest
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        ...wrapperStyle,
      }}
    >
      <input
        {...rest}
        id={id}
        type={showPassword ? 'text' : 'password'}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        style={{
          width: '100%',
          height: '46px',
          padding: '0 48px 0 14px',
          borderRadius: 'var(--radius-sm)',
          border: isFocused ? '1.5px solid var(--color-emerald)' : '1px solid var(--color-border)',
          boxShadow: isFocused ? '0 0 0 3px rgba(13, 69, 62, 0.12)' : 'var(--shadow-sm)',
          fontSize: '14px',
          color: 'var(--color-charcoal)',
          backgroundColor: 'var(--color-white)',
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          ...style,
        }}
      />

      {/* Styled Eye Icon Visibility Button */}
      <button
        type="button"
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        title={showPassword ? 'Hide password' : 'Show password'}
        onClick={() => setShowPassword((prev) => !prev)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'absolute',
          right: '7px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '34px',
          height: '34px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isHovered
            ? 'rgba(13, 69, 62, 0.08)'
            : showPassword
            ? 'rgba(13, 69, 62, 0.05)'
            : 'transparent',
          border: '1px solid transparent',
          borderRadius: 'var(--radius-sm)',
          cursor: 'pointer',
          outline: 'none',
          color: showPassword
            ? 'var(--color-emerald)'
            : isHovered
            ? 'var(--color-emerald)'
            : 'var(--color-muted)',
          transition: 'all 0.18s ease',
          padding: 0,
        }}
      >
        {showPassword ? (
          /* Eye-slash (Hide password) */
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
            <line x1="2" y1="2" x2="22" y2="22" />
          </svg>
        ) : (
          /* Eye (Show password) */
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}
