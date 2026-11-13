'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { webApi } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function WebExplorePage() {
  const { user: currentUser, isAuthenticated } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'scholar'>('all');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await webApi.users.searchUsers(search, roleFilter === 'scholar' ? 'scholar' : undefined);
      setUsers(res.users || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const handleFollowToggle = async (targetUser: any) => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    setActionLoadingId(targetUser._id);
    try {
      if (targetUser.isFollowing) {
        await webApi.users.unfollow(targetUser._id);
      } else {
        await webApi.users.follow(targetUser._id);
      }
      fetchUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed';
      alert(msg);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <>
      <Header />
      <div style={{ backgroundColor: 'var(--color-ivory)', minHeight: '85vh', padding: '36px 0' }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h1 style={{ fontSize: '32px', color: 'var(--color-emerald)', fontWeight: 700, marginBottom: '6px' }}>
              Explore Sanad Community
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--color-muted)' }}>
              Search registered scholars, students, and educators by unique @username or public ID
            </p>
          </div>

          {/* Search Box */}
          <div
            style={{
              backgroundColor: 'var(--color-white)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              padding: '16px',
              marginBottom: '20px',
              display: 'flex',
              gap: '12px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by @username, display name, public ID, or discipline..."
              style={{
                flex: 1,
                height: '42px',
                padding: '0 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                fontSize: '14px',
              }}
            />
            {Boolean(search) && (
              <button
                onClick={() => setSearch('')}
                className="btn btn-outline"
                style={{ fontSize: '13px', padding: '8px 14px' }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Segment Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <button
              onClick={() => setRoleFilter('all')}
              style={{
                padding: '6px 16px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: roleFilter === 'all' ? 'var(--color-emerald)' : 'var(--color-white)',
                color: roleFilter === 'all' ? '#FFFFFF' : 'var(--color-charcoal)',
                border: '1px solid var(--color-border)',
              }}
            >
              All Community Users
            </button>
            <button
              onClick={() => setRoleFilter('scholar')}
              style={{
                padding: '6px 16px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: roleFilter === 'scholar' ? 'var(--color-emerald)' : 'var(--color-white)',
                color: roleFilter === 'scholar' ? '#FFFFFF' : 'var(--color-charcoal)',
                border: '1px solid var(--color-border)',
              }}
            >
              Accredited Scholars Only
            </button>
          </div>

          {/* Users List Grid */}
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-muted)' }}>
              Searching directory...
            </div>
          ) : users.length === 0 ? (
            <div
              style={{
                backgroundColor: 'var(--color-white)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                padding: '40px',
                textAlign: 'center',
                color: 'var(--color-muted)',
              }}
            >
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-charcoal)', marginBottom: '6px' }}>
                No Users Found
              </h3>
              <p style={{ fontSize: '13px' }}>
                No registered accounts match your current search query.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {users.map((target) => {
                const isScholar = Boolean(
                  target.scholarProfile?.verified || target.roles?.includes('scholar')
                );
                const isAdmin = Boolean(target.roles?.includes('admin'));
                const isMod = Boolean(target.roles?.includes('moderator'));
                const isSelf = currentUser && (currentUser.id === target._id || currentUser.username === target.username);

                return (
                  <div
                    key={target._id}
                    style={{
                      backgroundColor: 'var(--color-white)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      padding: '20px',
                      boxShadow: 'var(--shadow-sm)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <div
                        style={{
                          width: '52px',
                          height: '52px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-emerald)',
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {target.displayName ? target.displayName[0].toUpperCase() : 'U'}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <Link
                            href={`/profile/${target.username || target._id}`}
                            style={{
                              fontSize: '16px',
                              fontWeight: 700,
                              color: 'var(--color-charcoal)',
                              textDecoration: 'none',
                            }}
                          >
                            {target.displayName}
                          </Link>

                          {isScholar && (
                            <span
                              style={{
                                backgroundColor: '#E6F4EA',
                                color: '#137333',
                                fontSize: '10px',
                                fontWeight: 800,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                textTransform: 'uppercase',
                              }}
                            >
                              Scholar
                            </span>
                          )}

                          {isAdmin && (
                            <span
                              style={{
                                backgroundColor: '#FEF7E0',
                                color: '#B06000',
                                fontSize: '10px',
                                fontWeight: 800,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                textTransform: 'uppercase',
                              }}
                            >
                              Admin
                            </span>
                          )}

                          {isMod && (
                            <span
                              style={{
                                backgroundColor: '#E8F0FE',
                                color: '#1A73E8',
                                fontSize: '10px',
                                fontWeight: 800,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                textTransform: 'uppercase',
                              }}
                            >
                              Moderator
                            </span>
                          )}

                          {target.isPrivate && (
                            <span
                              style={{
                                backgroundColor: '#FDE8E8',
                                color: '#C81E1E',
                                fontSize: '10px',
                                fontWeight: 800,
                                padding: '2px 6px',
                                borderRadius: '4px',
                              }}
                            >
                              Private
                            </span>
                          )}

                          {target.relation === 'mutual' && (
                            <span
                              style={{
                                backgroundColor: '#DEF7EC',
                                color: '#03543F',
                                fontSize: '10px',
                                fontWeight: 800,
                                padding: '2px 6px',
                                borderRadius: '4px',
                              }}
                            >
                              Mutual Follow
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px', fontSize: '12px', alignItems: 'center' }}>
                          {target.username && (
                            <span style={{ color: 'var(--color-emerald)', fontWeight: 600 }}>
                              @{target.username}
                            </span>
                          )}
                          {target.publicId && (
                            <span style={{ color: 'var(--color-muted)', fontFamily: 'monospace' }}>
                              ID: {target.publicId}
                            </span>
                          )}
                        </div>

                        {Boolean(target.scholarProfile?.institution) && (
                          <div style={{ fontSize: '12px', color: 'var(--color-gold-hover)', fontWeight: 600, marginTop: '4px' }}>
                            {target.scholarProfile.institution}
                          </div>
                        )}

                        {Boolean(target.bio) && (
                          <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginTop: '6px', maxWidth: '560px' }}>
                            {target.bio}
                          </p>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {!isSelf && (
                        <button
                          disabled={actionLoadingId === target._id}
                          onClick={() => handleFollowToggle(target)}
                          className={target.isFollowing ? 'btn btn-outline' : 'btn btn-primary'}
                          style={{
                            fontSize: '13px',
                            padding: '6px 16px',
                            backgroundColor:
                              !target.isFollowing && target.isFollowedBy
                                ? 'var(--color-gold)'
                                : undefined,
                            borderColor:
                              !target.isFollowing && target.isFollowedBy
                                ? 'var(--color-gold)'
                                : undefined,
                            color:
                              !target.isFollowing && target.isFollowedBy
                                ? '#FFFFFF'
                                : undefined,
                          }}
                        >
                          {target.isFollowing
                            ? 'Following'
                            : target.isFollowedBy
                              ? 'Follow Back'
                              : 'Follow'}
                        </button>
                      )}

                      <Link
                        href={`/profile/${target.username || target._id}`}
                        className="btn btn-outline"
                        style={{ fontSize: '13px', padding: '6px 14px' }}
                      >
                        Profile
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
