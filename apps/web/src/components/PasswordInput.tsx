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
  ...rest
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

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
        style={{
          width: '100%',
          height: '44px',
          padding: '0 90px 0 12px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-border)',
          fontSize: '14px',
          color: 'var(--color-charcoal)',
          backgroundColor: 'var(--color-white)',
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          ...style,
        }}
      />
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        aria-pressed={showPassword}
        title={showPassword ? 'Hide password' : 'Show password'}
        style={{
          position: 'absolute',
          right: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'transparent',
          border: 'none',
          padding: '4px 6px',
          cursor: 'pointer',
          borderRadius: 'var(--radius-sm)',
          userSelect: 'none',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.6px',
            textTransform: 'uppercase',
            color: showPassword ? 'var(--color-emerald)' : 'var(--color-muted)',
            transition: 'color 0.2s ease',
          }}
        >
          {showPassword ? 'Hide' : 'Show'}
        </span>
        <span
          style={{
            width: '32px',
            height: '18px',
            backgroundColor: showPassword ? 'var(--color-emerald)' : '#D1D5DB',
            borderRadius: '999px',
            display: 'inline-flex',
            alignItems: 'center',
            padding: '2px',
            transition: 'background-color 0.2s ease',
            boxSizing: 'border-box',
          }}
        >
          <span
            style={{
              width: '14px',
              height: '14px',
              backgroundColor: '#FFFFFF',
              borderRadius: '50%',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.25)',
              transform: showPassword ? 'translateX(14px)' : 'translateX(0)',
              transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'block',
            }}
          />
        </span>
      </button>
    </div>
  );
}

