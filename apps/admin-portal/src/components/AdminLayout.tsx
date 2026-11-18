'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import Footer from './Footer';
import Preloader from './Preloader';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, isAdmin, isModerator } = useAuth();

  React.useEffect(() => {
    if (!isLoading && (!isAuthenticated || (!isAdmin && !isModerator))) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, isAdmin, isModerator, router]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-ivory)' }}>
        <Preloader label="Loading Administration Dashboard..." description="Verifying security credentials and access permissions" />
      </div>
    );
  }

  if (!isAuthenticated || (!isAdmin && !isModerator)) {
    return (
      <>
        <Header />
        <main className="section" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
          <div className="container" style={{ textAlign: 'center', maxWidth: '500px' }}>
            <h1 style={{ fontSize: '28px', color: '#9B1C1C', marginBottom: '12px' }}>
              Access Restricted
            </h1>
            <p style={{ color: 'var(--color-muted)', marginBottom: '24px', fontSize: '14px' }}>
              You must have an authorized administrator or moderator role to view platform governance tools.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Link href="/login" className="btn btn-primary">
                Sign In as Administrator
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const navItems = [
    { href: '/admin', label: 'Platform Overview' },
    { href: '/admin/users', label: 'User Governance' },
    { href: '/admin/review-queue', label: 'Scholar Review Queue' },
    { href: '/admin/activity', label: 'Scholar Activity & Security' },
    { href: '/admin/reports', label: 'Trust & Safety Queue' },
    { href: '/admin/audit-logs', label: 'Audit Trail' },
  ];

  return (
    <>
      <Header />
      <div style={{ backgroundColor: 'var(--color-ivory)', minHeight: '85vh', padding: '30px 0' }}>
        <div className="container">
          {/* Admin Header Masthead */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--color-border)',
              paddingBottom: '20px',
              marginBottom: '24px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    backgroundColor: 'var(--color-gold-subtle)',
                    color: 'var(--color-gold-hover)',
                    border: '1px solid var(--color-gold)',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                  }}
                >
                  Governance
                </span>
                <h1 style={{ fontSize: '26px', color: 'var(--color-emerald)', fontWeight: 700 }}>
                  {title}
                </h1>
              </div>
              {subtitle && (
                <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginTop: '4px' }}>
                  {subtitle}
                </p>
              )}
            </div>

            <Link
              href={`/profile/${user?.id || user?._id || 'me'}`}
              title="View Administrator Profile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                textDecoration: 'none',
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-white)',
                border: '1px solid var(--color-border)',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-charcoal)' }}>
                  {user?.displayName}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-emerald)', fontWeight: 600 }}>
                  {isAdmin ? 'System Administrator' : 'Platform Moderator'} &bull; View Profile
                </div>
              </div>
              <span
                style={{
                  display: 'inline-block',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: '#31C48D',
                  boxShadow: '0 0 0 3px rgba(49, 196, 141, 0.25)',
                }}
              />
            </Link>
          </div>

          {/* Admin Subnav Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              paddingBottom: '12px',
              marginBottom: '24px',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13px',
                    fontWeight: active ? 700 : 500,
                    backgroundColor: active ? 'var(--color-emerald)' : 'var(--color-white)',
                    color: active ? '#FFFFFF' : 'var(--color-charcoal)',
                    border: '1px solid',
                    borderColor: active ? 'var(--color-emerald)' : 'var(--color-border)',
                    whiteSpace: 'nowrap',
                    textDecoration: 'none',
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Main Content Pane */}
          {children}
        </div>
      </div>
      <Footer />
    </>
  );
}

