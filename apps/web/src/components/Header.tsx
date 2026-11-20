'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Compass,
  MessageSquare,
  PlaySquare,
  BookOpen,
  User as UserIcon,
  Settings,
  GraduationCap,
  PlusSquare,
  Shield,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { cn } from '../lib/utils';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isScholar, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    logout();
    router.push('/login');
  };

  const navLinks = [
    { href: '/', label: 'Feed', icon: BookOpen },
    { href: '/explore', label: 'Explore', icon: Compass },
    { href: '/reels', label: 'Reels', icon: PlaySquare },
    { href: '/inbox', label: 'Inbox', icon: MessageSquare },
    { href: '/profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-sanad-border bg-sanad-ivory/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          {/* Brand Logo & Typography */}
          <Link href="/" className="flex items-center gap-3 select-none group">
            <div
              className="relative w-11 h-11 rounded-xl border border-sanad-gold bg-gradient-to-br from-sanad-emerald to-sanad-emerald-deep flex items-center justify-center shadow-sm overflow-hidden shrink-0 group-hover:scale-105 transition-transform"
              style={{ width: '44px', height: '44px', minWidth: '44px', minHeight: '44px' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/splash-mark.png"
                alt="Sanad Crest"
                width={44}
                height={44}
                style={{ width: '44px', height: '44px', objectFit: 'cover', display: 'block' }}
                className="w-full h-full object-cover block"
              />
            </div>
            <div className="flex flex-col justify-center leading-tight">
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl sm:text-2xl font-extrabold text-sanad-emerald tracking-wider leading-snug">
                  SANAD
                </span>
                <span className="text-xs text-sanad-gold font-bold">&#9670;</span>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-sanad-emerald/80 font-sans">
                  Platform
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-sanad-gold-dark mt-0.5">
                Authentic Transmission &amp; Scholarship
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {isAuthenticated ? (
              <>
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all',
                        isActive
                          ? 'bg-sanad-emerald text-white shadow-sm'
                          : 'text-sanad-slate hover:bg-sanad-ivory-warm hover:text-sanad-emerald'
                      )}
                    >
                      <Icon className="h-4 w-4 stroke-[2.2]" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}

                {isScholar ? (
                  <Link
                    href="/create"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold text-sanad-gold-dark hover:bg-sanad-gold-subtle transition-colors ml-2"
                  >
                    <PlusSquare className="h-4 w-4" />
                    <span>New Lesson</span>
                  </Link>
                ) : (
                  <Link
                    href="/scholar/apply"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-extrabold uppercase tracking-wider text-sanad-gold-dark bg-sanad-gold-subtle border border-sanad-gold/40 hover:bg-sanad-gold/20 transition-colors ml-2"
                  >
                    <GraduationCap className="h-4 w-4" />
                    <span>Apply as Scholar</span>
                  </Link>
                )}
              </>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-sanad-slate">
                <Link
                  href="/how-verification-works"
                  className={cn(
                    'px-3 py-2 rounded-lg transition-colors',
                    pathname === '/how-verification-works'
                      ? 'bg-sanad-emerald text-white'
                      : 'hover:text-sanad-emerald hover:bg-sanad-ivory-warm'
                  )}
                >
                  Verification
                </Link>
                <Link
                  href="/conduct"
                  className={cn(
                    'px-3 py-2 rounded-lg transition-colors',
                    pathname === '/conduct'
                      ? 'bg-sanad-emerald text-white'
                      : 'hover:text-sanad-emerald hover:bg-sanad-ivory-warm'
                  )}
                >
                  Code of Conduct
                </Link>
                <Link
                  href="/terms"
                  className={cn(
                    'px-3 py-2 rounded-lg transition-colors',
                    pathname === '/terms'
                      ? 'bg-sanad-emerald text-white'
                      : 'hover:text-sanad-emerald hover:bg-sanad-ivory-warm'
                  )}
                >
                  Terms
                </Link>
              </div>
            )}
          </nav>

          {/* User Controls */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <a
                    href={
                      process.env.NEXT_PUBLIC_ADMIN_URL ||
                      (typeof window !== 'undefined' && window.location.hostname === 'localhost'
                        ? 'http://localhost:3000'
                        : 'https://app-admin-sanad.netlify.app')
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-900 bg-amber-100 border border-amber-300 hover:bg-amber-200 transition-colors shadow-sm"
                    title="Open Platform Governance & Admin Portal"
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-700" />
                    <span className="hidden sm:inline">Admin Portal</span>
                  </a>
                )}

                <Link
                  href="/settings"
                  className="p-2 text-sanad-muted hover:text-sanad-emerald hover:bg-sanad-ivory-warm rounded-lg transition-colors hidden sm:flex"
                  title="Settings"
                >
                  <Settings className="h-5 w-5 stroke-[2]" />
                </Link>

                <Link
                  href="/profile"
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-sanad-border bg-white hover:bg-sanad-ivory-warm transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-sanad-ivory-warm border border-sanad-gold/60 flex items-center justify-center text-xs font-bold text-sanad-emerald overflow-hidden shrink-0">
                    {user.avatarUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={user.avatarUrl}
                        alt={user.displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user.displayName.charAt(0)
                    )}
                  </div>
                  <div className="hidden lg:block text-left">
                    <div className="text-xs font-bold text-sanad-charcoal leading-none">
                      {user.displayName}
                    </div>
                    <div className="text-[10px] font-semibold text-sanad-gold-dark capitalize mt-0.5">
                      {user.username ? `@${user.username}` : (isScholar ? 'Accredited Scholar' : 'Verified Member')}
                    </div>
                  </div>
                </Link>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="text-sanad-muted hover:text-rose-700 hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="default" size="sm">
                    Join Sanad
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-sanad-charcoal hover:bg-sanad-ivory-warm"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-sanad-border bg-white px-4 py-4 space-y-2">
            {isAuthenticated ? (
              <>
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors',
                        isActive
                          ? 'bg-sanad-emerald text-white'
                          : 'text-sanad-charcoal hover:bg-sanad-ivory-warm'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
                {isAdmin && (
                  <a
                    href="https://app-admin-sanad.netlify.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-amber-900 bg-amber-100 border border-amber-300"
                  >
                    <Shield className="h-5 w-5 text-amber-700" />
                    <span>Admin Governance Portal</span>
                  </a>
                )}
                {isScholar ? (
                  <Link
                    href="/create"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-sanad-gold-dark bg-sanad-gold-subtle"
                  >
                    <PlusSquare className="h-5 w-5" />
                    <span>New Lesson</span>
                  </Link>
                ) : (
                  <Link
                    href="/scholar/apply"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-sanad-gold-dark bg-sanad-gold-subtle"
                  >
                    <GraduationCap className="h-5 w-5" />
                    <span>Scholar Accreditation</span>
                  </Link>
                )}
                <Link
                  href="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-sanad-charcoal hover:bg-sanad-ivory-warm"
                >
                  <Settings className="h-5 w-5" />
                  <span>Settings &amp; Privacy</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-rose-700 hover:bg-rose-50 w-full text-left"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="space-y-2 pt-1">
                <Link
                  href="/how-verification-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold text-sanad-charcoal hover:bg-sanad-ivory-warm"
                >
                  <span>Verification Methodology</span>
                </Link>
                <Link
                  href="/conduct"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold text-sanad-charcoal hover:bg-sanad-ivory-warm"
                >
                  <span>Code of Academic Conduct</span>
                </Link>
                <Link
                  href="/terms"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold text-sanad-charcoal hover:bg-sanad-ivory-warm"
                >
                  <span>Terms of Service</span>
                </Link>
                <div className="pt-3 border-t border-sanad-border/60 flex flex-col gap-2">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="default" className="w-full">
                      Join Sanad
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
}
