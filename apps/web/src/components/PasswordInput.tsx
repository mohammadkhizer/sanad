'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../lib/utils';

export interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  wrapperClassName?: string;
}

export default function PasswordInput({
  wrapperClassName,
  className,
  placeholder = 'Enter password',
  required = false,
  value,
  onChange,
  autoComplete = 'current-password',
  ...rest
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={cn('relative w-full', wrapperClassName)}>
      <input
        {...rest}
        type={showPassword ? 'text' : 'password'}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={cn(
          'flex h-11 w-full rounded-lg border border-sanad-border bg-white pl-3.5 pr-12 py-2 text-sm text-sanad-charcoal transition-all placeholder:text-sanad-muted/60 focus-visible:outline-none focus-visible:border-sanad-emerald focus-visible:ring-2 focus-visible:ring-sanad-emerald/15 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
      />
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        title={showPassword ? 'Hide password' : 'Show password'}
        className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-md text-sanad-muted transition-colors hover:bg-sanad-ivory-warm hover:text-sanad-emerald focus:outline-none focus-visible:ring-2 focus-visible:ring-sanad-emerald"
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4 stroke-[2.2]" />
        ) : (
          <Eye className="h-4 w-4 stroke-[2.2]" />
        )}
      </button>
    </div>
  );
}
