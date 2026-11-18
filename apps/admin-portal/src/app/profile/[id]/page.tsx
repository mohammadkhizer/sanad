'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import Preloader from '../../../components/Preloader';
import { webApi } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

export default function WebProfilePage() {
  const params = useParams();
  const rawId = params?.id as string;
  const { user: currentUser, isAuthenticated, isAdmin: currentIsAdmin, isModerator: currentIsMod } = useAuth();

  const [profile, setProfile] = useState<any | null>(null);
  const [counts, setCounts] = useState<{ followers: number; following: number; lessons: number }>({
    followers: 0,
    following: 0,
    lessons: 0,
  });
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowedBy, setIsFollowedBy] = useState(false);
  const [relation, setRelation] = useState('none');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProfile = async () => {
    if (!rawId) return;
    setLoading(true);
    try {
      const res = await webApi.users.getUser(rawId);
      setProfile(res.user);
      setCounts(res.counts || { followers: 0, following: 0, lessons: 0 });
      setIsFollowing(res.isFollowing ?? false);
      setIsFollowedBy(res.isFollowedBy ?? false);
      setRelation(res.relation || 'none');
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [rawId]);

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    if (!profile) return;
    setActionLoading(true);
    try {
      if (isFollowing) {
        await webApi.users.unfollow(profile._id);
        setIsFollowing(false);
        setCounts((prev) => ({ ...prev, followers: Math.max(0, prev.followers - 1) }));
      } else {
        await webApi.users.follow(profile._id);
        setIsFollowing(true);
        setCounts((prev) => ({ ...prev, followers: prev.followers + 1 }));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed';
      alert(msg);
    } finally {
      setActionLoading(false);
    }
  };

  if (!isAuthenticated || (!currentIsAdmin && !currentIsMod)) {
    return (
      <>
        <Header />
        <main className="section" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
          <div className="container" style={{ textAlign: 'center', maxWidth: '500px' }}>
            <h1 style={{ fontSize: '28px', color: '#9B1C1C', marginBottom: '12px' }}>
              Access Restricted
            </h1>
            <p style={{ color: 'var(--color-muted)', marginBottom: '24px', fontSize: '14px' }}>
              You must have an authorized administrator or moderator role to inspect user profiles on this portal.
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

  const isScholar = Boolean(
    profile?.scholarProfile?.verified || profile?.roles?.includes('scholar')
  );
  const isAdmin = Boolean(profile?.roles?.includes('admin'));
  const isMod = Boolean(profile?.roles?.includes('moderator'));
  const isSelf = currentUser && profile && (currentUser.id === profile._id || currentUser.username === profile.username);

  return (
    <>
      <Header />
      <div style={{ backgroundColor: 'var(--color-ivory)', minHeight: '85vh', padding: '40px 0' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          {loading ? (
            <Preloader label="Loading Profile Records..." description="Retrieving verified user profile from Sanad identity store" />
          ) : !profile ? (
            <div
              style={{
                backgroundColor: 'var(--color-white)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                padding: '40px',
                textAlign: 'center',
              }}
            >
              <h2 style={{ fontSize: '20px', color: '#9B1C1C', marginBottom: '8px' }}>
                User Profile Not Found
              </h2>
              <p style={{ color: 'var(--color-muted)', fontSize: '13px', marginBottom: '20px' }}>
                No active registered user was found matching identifier "{rawId}".
              </p>
              <Link href="/explore" className="btn btn-primary">
                Return to Directory
              </Link>
            </div>
          ) : (
            <div
              style={{
                backgroundColor: 'var(--color-white)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                padding: '36px',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              {/* Profile Masthead */}
              <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '24px' }}>
                <div
                  style={{
                    width: '84px',
                    height: '84px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-emerald)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {profile.displayName ? profile.displayName[0].toUpperCase() : 'U'}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-charcoal)' }}>
                      {profile.displayName}
                    </h1>

                    {isScholar && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: '#FAF5EC',
                          border: '1px solid #E6D29A',
                          color: '#8C6C0A',
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          letterSpacing: '0.6px',
                          textTransform: 'uppercase',
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                          <rect x="3" y="3" width="18" height="18" rx="2.5" fill="#C9A227" transform="rotate(0 12 12)" />
                          <rect x="3" y="3" width="18" height="18" rx="2.5" fill="#C9A227" transform="rotate(45 12 12)" />
                          <circle cx="12" cy="12" r="7.5" stroke="rgba(255,255,255,0.45)" strokeWidth="1" />
                          <path d="M8.2 12.2L10.7 14.7L15.8 9.3" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Accredited Scholar
                      </span>
                    )}

                    {isAdmin && (
                      <span
                        style={{
                          backgroundColor: '#FEF7E0',
                          color: '#B06000',
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                        }}
                      >
                        Administrator
                      </span>
                    )}

                    {isMod && (
                      <span
                        style={{
                          backgroundColor: '#E8F0FE',
                          color: '#1A73E8',
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                        }}
                      >
                        Moderator
                      </span>
                    )}

                    {profile.isPrivate && (
                      <span
                        style={{
                          backgroundColor: '#FDE8E8',
                          color: '#C81E1E',
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '4px',
                        }}
                      >
                        Private Account
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '13px', alignItems: 'center' }}>
                    {profile.username && (
                      <span style={{ color: 'var(--color-emerald)', fontWeight: 700 }}>
                        @{profile.username}
                      </span>
                    )}
                  </div>

                  {Boolean(profile.scholarProfile?.institution) && (
                    <div style={{ fontSize: '13px', color: 'var(--color-gold-hover)', fontWeight: 600, marginTop: '6px' }}>
                      {profile.scholarProfile.institution}
                    </div>
                  )}

                  {Boolean(profile.bio) && (
                    <p style={{ fontSize: '14px', color: 'var(--color-charcoal)', marginTop: '12px', lineHeight: 1.6 }}>
                      {profile.bio}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Bar */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', padding: '16px 0', alignItems: 'center' }}>
                {!isSelf ? (
                  <button
                    disabled={actionLoading}
                    onClick={handleFollowToggle}
                    className={isFollowing ? 'btn btn-outline' : 'btn btn-primary'}
                    style={{
                      fontSize: '14px',
                      padding: '8px 24px',
                      backgroundColor: !isFollowing && isFollowedBy ? 'var(--color-gold)' : undefined,
                      borderColor: !isFollowing && isFollowedBy ? 'var(--color-gold)' : undefined,
                      color: !isFollowing && isFollowedBy ? '#FFFFFF' : undefined,
                    }}
                  >
                    {isFollowing ? 'Following' : isFollowedBy ? 'Follow Back' : 'Follow'}
                  </button>
                ) : (
                  <span style={{ fontSize: '13px', color: 'var(--color-muted)', fontStyle: 'italic' }}>
                    This is your public account profile.
                  </span>
                )}

                <div
                  style={{
                    marginLeft: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '24px',
                    backgroundColor: '#FAF7F0',
                    border: '1px solid #E6E0D2',
                    borderRadius: '10px',
                    padding: '8px 20px',
                  }}
                >
                  <div style={{ textAlign: 'center', minWidth: '60px' }}>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-emerald)', lineHeight: 1.2 }}>
                      {counts.followers}
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-muted)', letterSpacing: '0.6px', textTransform: 'uppercase', marginTop: '2px' }}>
                      Followers
                    </div>
                  </div>
                  <div style={{ width: '1px', height: '24px', backgroundColor: '#E2DDD0' }} />
                  <div style={{ textAlign: 'center', minWidth: '60px' }}>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-emerald)', lineHeight: 1.2 }}>
                      {counts.following}
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-muted)', letterSpacing: '0.6px', textTransform: 'uppercase', marginTop: '2px' }}>
                      Following
                    </div>
                  </div>
                  <div style={{ width: '1px', height: '24px', backgroundColor: '#E2DDD0' }} />
                  <div style={{ textAlign: 'center', minWidth: '60px' }}>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-emerald)', lineHeight: 1.2 }}>
                      {counts.lessons}
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-muted)', letterSpacing: '0.6px', textTransform: 'uppercase', marginTop: '2px' }}>
                      Lessons
                    </div>
                  </div>
                </div>
              </div>

              {/* Scholar Details (if scholar) */}
              {isScholar && profile.scholarProfile && (
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-emerald)', marginBottom: '12px' }}>
                    Academic Credentials & Specialties
                  </h3>

                  {Boolean(profile.scholarProfile.specialties?.length) && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                      {profile.scholarProfile.specialties.map((spec: string) => (
                        <span
                          key={spec}
                          style={{
                            backgroundColor: 'var(--color-ivory)',
                            border: '1px solid var(--color-border)',
                            fontSize: '12px',
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-sm)',
                          }}
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  )}

                  {Boolean(profile.scholarProfile.languages?.length) && (
                    <div style={{ fontSize: '13px', color: 'var(--color-muted)' }}>
                      <strong>Teaching Languages:</strong> {profile.scholarProfile.languages.join(', ')}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

