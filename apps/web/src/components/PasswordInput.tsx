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
          padding: '0 108px 0 14px',
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

      {/* Luxury Styled Toggle Switch Capsule */}
      <button
        type="button"
        role="switch"
        aria-checked={showPassword}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        title={showPassword ? 'Hide password' : 'Show password'}
        onClick={() => setShowPassword((prev) => !prev)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'absolute',
          right: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: showPassword
            ? 'rgba(13, 69, 62, 0.08)'
            : isHovered
            ? 'rgba(0, 0, 0, 0.06)'
            : 'rgba(0, 0, 0, 0.03)',
          border: `1px solid ${
            showPassword
              ? 'rgba(13, 69, 62, 0.35)'
              : isHovered
              ? 'var(--color-border-gold)'
              : 'var(--color-border)'
          }`,
          borderRadius: '999px',
          padding: '4px 8px 4px 10px',
          cursor: 'pointer',
          outline: 'none',
          userSelect: 'none',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <span
          style={{
            fontSize: '10px',
            fontWeight: 800,
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
            color: showPassword ? 'var(--color-emerald)' : 'var(--color-muted)',
            fontFamily: 'var(--font-sans)',
            transition: 'color 0.2s ease',
          }}
        >
          {showPassword ? 'Hide' : 'Show'}
        </span>

        {/* Tactile Switch Track */}
        <span
          style={{
            width: '32px',
            height: '18px',
            backgroundColor: showPassword ? 'var(--color-emerald)' : '#CBD5E1',
            borderRadius: '999px',
            display: 'inline-flex',
            alignItems: 'center',
            padding: '2px',
            transition: 'background-color 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            boxSizing: 'border-box',
            boxShadow: showPassword
              ? 'inset 0 1px 2px rgba(0, 0, 0, 0.2)'
              : 'inset 0 1px 2px rgba(0, 0, 0, 0.12)',
          }}
        >
          {/* Tactile Sliding Knob */}
          <span
            style={{
              width: '14px',
              height: '14px',
              backgroundColor: '#FFFFFF',
              borderRadius: '50%',
              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.3)',
              transform: showPassword ? 'translateX(14px)' : 'translateX(0)',
              transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              display: 'block',
            }}
          />
        </span>
      </button>
    </div>
  );
}
