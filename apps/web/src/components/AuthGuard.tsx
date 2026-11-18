'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, GraduationCap, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Preloader } from './Preloader';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';

const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/how-verification-works',
  '/conduct',
  '/privacy',
  '/terms',
  '/delete-account',
];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, isScholar } = useAuth();

  const isPublicPath = PUBLIC_PATHS.some((p) => pathname === p || pathname?.startsWith(p + '/'));

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && !isPublicPath) {
        // Redirect unauthenticated visitor to login
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
        // Authenticated users shouldn't see login or register again
        router.push('/feed');
      }
    }
  }, [isLoading, isAuthenticated, isPublicPath, pathname, router]);

  // While resolving auth state, show preloader
  if (isLoading) {
    return <Preloader fullScreen message="Authenticating session..." />;
  }

  // If unauthenticated and on a protected page, wait for redirect
  if (!isAuthenticated && !isPublicPath) {
    return <Preloader fullScreen message="Authentication required. Redirecting to sign in..." />;
  }

  // Route-level authorization check: e.g. /create requires scholar accreditation
  if (pathname === '/create' && !isScholar) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6">
        <Card className="w-full max-w-lg border-sanad-border bg-white shadow-md text-center p-6 sm:p-8">
          <CardHeader className="pb-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-3 text-amber-600">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <CardTitle className="font-serif text-2xl font-bold text-sanad-emerald">
              Scholar Accreditation Required
            </CardTitle>
            <CardDescription className="text-xs text-sanad-slate mt-1 max-w-md mx-auto leading-relaxed">
              To preserve authentic Islamic transmission, authoring and publishing official Hadith lessons, Isnad chains, and legal exegesis is strictly restricted to verified scholars.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="p-4 rounded-xl border border-sanad-gold/40 bg-sanad-gold-subtle/50 text-left text-xs text-sanad-slate space-y-1.5">
              <span className="font-bold text-sanad-emerald block flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-sanad-gold-dark" />
                Are you an accredited Islamic teacher or university faculty?
              </span>
              <p>
                Submit your traditional Ijazahs, university credentials, and teacher chains to request publishing accreditation.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link href="/scholar/apply" className="w-full sm:w-auto">
                <Button className="w-full">
                  <span>Apply for Scholar Accreditation</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link href="/feed" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  <span>Return to Knowledge Feed</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}