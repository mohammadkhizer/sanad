import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuthStore } from '../../src/store/authStore';
import { colors } from '../../src/theme/colors';
import { Avatar } from '../../src/components/Avatar';
import { VerifiedBadge } from '../../src/components/VerifiedBadge';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { AppHeader } from '../../src/components/AppHeader';
import { Icon } from '../../src/components/Icon';
import { useRouter } from 'expo-router';
import { api } from '../../src/api';
import { useQuery } from '@tanstack/react-query';
import { PostEntity } from '@sanad/shared';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'reels' | 'videos' | 'saved'>('reels');

  const isScholar = Boolean(user?.roles?.includes('scholar') || user?.roles?.includes('admin'));
  const isModOrAdmin = Boolean(
    user?.roles?.includes('moderator') || user?.roles?.includes('admin')
  );

  const { data: postsData } = useQuery<{ items: PostEntity[] }>({
    queryKey: ['myPosts', activeTab],
    queryFn: () => api.content.getFeed(),
  });

  const { data: profileData } = useQuery<any>({
    queryKey: ['myProfile'],
    queryFn: () => api.users.getMe(),
  });

  const handleLogout = async () => {
    Alert.alert('Log Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  if (!isAuthenticated || !user) {
    return (
      <View style={styles.container}>
        <AppHeader title="Profile" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.light.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        title="My Profile"
        subtitle={isScholar ? 'Accredited Scholar' : 'Registered Member'}
        rightIcon="settings"
        onRightPress={() => router.push('/settings')}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <Avatar name={user.displayName} url={profileData?.user?.avatarUrl} size={64} />
            <View style={styles.userDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{profileData?.user?.displayName || user.displayName}</Text>
                {isScholar && <VerifiedBadge />}
              </View>
              {Boolean(profileData?.user?.username || user.username) && (
                <Text style={styles.userHandle}>
                  @{profileData?.user?.username || user.username}
                </Text>
              )}
              <Text style={styles.userRole}>
                {isScholar ? 'Accredited Religious Scholar' : 'Registered Member'}
              </Text>
              <Text style={styles.userEmail}>{user.email || user.phone || ''}</Text>
            </View>
          </View>

          {Boolean(profileData?.user?.bio) && (
            <Text style={styles.userBio}>{profileData.user.bio}</Text>
          )}

          {/* Action Row */}
          <View style={styles.profileActionRow}>
            <TouchableOpacity
              style={styles.editProfileBtn}
              onPress={() => router.push('/profile/edit')}
              activeOpacity={0.8}
            >
              <Icon name="pencil" size={15} color={colors.light.primary} />
              <Text style={styles.editProfileBtnText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shareProfileBtn}
              onPress={() => {
                Alert.alert('Share Profile', `Profile handle: @${profileData?.user?.username || user.username || user.displayName}`);
              }}
              activeOpacity={0.8}
            >
              <Icon name="share" size={15} color={colors.light.textMuted} />
              <Text style={styles.shareProfileBtnText}>Share</Text>
            </TouchableOpacity>
          </View>

          {/* Metrics Row */}
          <View style={styles.statsRow}>
            <TouchableOpacity
              style={styles.statCol}
              onPress={() => router.push(`/profile/${user.id}/network`)}
            >
              <Text style={styles.statNumber}>{profileData?.counts?.followers ?? 0}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity
              style={styles.statCol}
              onPress={() => router.push(`/profile/${user.id}/network`)}
            >
              <Text style={styles.statNumber}>{profileData?.counts?.following ?? 0}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statNumber}>
                {profileData?.counts?.lessons ?? postsData?.items?.length ?? 0}
              </Text>
              <Text style={styles.statLabel}>Lessons</Text>
            </View>
          </View>
        </Card>

        {/* Scholar Control Panel CTA */}
        {isScholar && (
          <Card style={styles.scholarHubCard}>
            <View style={styles.hubHeaderRow}>
              <View style={styles.hubIconCircle}>
                <Icon name="verified" size={20} color={colors.light.accentText} />
              </View>
              <View style={styles.hubTextCol}>
                <Text style={styles.hubTitle}>Scholar Studio & Curriculum</Text>
                <Text style={styles.hubSubtitle}>
                  Schedule study circles, publish lessons, and review consultation inquiries
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.hubButton}
              onPress={() => router.push('/scholar/dashboard')}
            >
              <Text style={styles.hubButtonText}>Open Scholar Panel</Text>
              <Icon name="chevron-right" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </Card>
        )}

        {/* Non-scholar member: Application CTA */}
        {!isScholar && (
          <Card style={styles.applyCard}>
            <View style={styles.applyRow}>
              <View style={styles.applyInfo}>
                <Text style={styles.applyTitle}>Apply for Scholar Accreditation</Text>
                <Text style={styles.applySubtitle}>
                  Submit degrees, ijazahs, and institutional credentials to publish lessons and host study circles.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => router.push('/scholar/apply')}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Staff Administration Links for Moderator / Admin */}
        {isModOrAdmin && (
          <Card style={styles.adminCard}>
            <Text style={styles.adminSectionTitle}>Platform Governance</Text>
            <TouchableOpacity
              style={styles.adminLink}
              onPress={() => router.push('/admin/review-queue')}
            >
              <View style={styles.adminLinkLeft}>
                <Icon name="shield" size={18} color={colors.light.primary} />
                <Text style={styles.adminLinkText}>Applicant Verification Queue</Text>
              </View>
              <Icon name="chevron-right" size={16} color={colors.light.textMuted} />
            </TouchableOpacity>

            <View style={styles.adminDivider} />

            <TouchableOpacity
              style={styles.adminLink}
              onPress={() => router.push('/admin/reports')}
            >
              <View style={styles.adminLinkLeft}>
                <Icon name="filter" size={18} color={colors.light.primary} />
                <Text style={styles.adminLinkText}>Trust & Safety Queue (P0/P1/P2)</Text>
              </View>
              <Icon name="chevron-right" size={16} color={colors.light.textMuted} />
            </TouchableOpacity>

            <View style={styles.adminDivider} />

            <TouchableOpacity
              style={styles.adminLink}
              onPress={() => router.push('/admin/audit-logs')}
            >
              <View style={styles.adminLinkLeft}>
                <Icon name="lock" size={18} color={colors.light.primary} />
                <Text style={styles.adminLinkText}>Immutable Audit Trail</Text>
              </View>
              <Icon name="chevron-right" size={16} color={colors.light.textMuted} />
            </TouchableOpacity>
          </Card>
        )}

        {/* Published Media Tabs */}
        <View style={styles.mediaTabsRow}>
          <TouchableOpacity
            style={[styles.mediaTab, activeTab === 'reels' && styles.mediaTabActive]}
            onPress={() => setActiveTab('reels')}
          >
            <Icon
              name="reels"
              size={18}
              color={activeTab === 'reels' ? colors.light.primary : colors.light.textMuted}
            />
            <Text style={[styles.mediaTabText, activeTab === 'reels' && styles.mediaTabTextActive]}>
              Reels
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mediaTab, activeTab === 'videos' && styles.mediaTabActive]}
            onPress={() => setActiveTab('videos')}
          >
            <Icon
              name="play"
              size={18}
              color={activeTab === 'videos' ? colors.light.primary : colors.light.textMuted}
            />
            <Text style={[styles.mediaTabText, activeTab === 'videos' && styles.mediaTabTextActive]}>
              Masterclasses
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mediaTab, activeTab === 'saved' && styles.mediaTabActive]}
            onPress={() => setActiveTab('saved')}
          >
            <Icon
              name="bookmark"
              size={18}
              color={activeTab === 'saved' ? colors.light.primary : colors.light.textMuted}
            />
            <Text style={[styles.mediaTabText, activeTab === 'saved' && styles.mediaTabTextActive]}>
              Saved
            </Text>
          </TouchableOpacity>
        </View>

        {/* Lessons Grid Preview */}
        {(postsData?.items || []).length === 0 ? (
          <View style={styles.emptyLessonsContainer}>
            <Text style={styles.emptyLessonsTitle}>No Lessons Published</Text>
            <Text style={styles.emptyLessonsSub}>
              Lessons published to the feed will appear in your curriculum portfolio.
            </Text>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {(postsData?.items || []).slice(0, 6).map((post) => (
              <TouchableOpacity
                key={post._id}
                style={styles.gridItem}
                onPress={() => router.push(`/post/${post._id}`)}
                activeOpacity={0.8}
              >
                <View style={styles.gridPlaceholder}>
                  <Icon name="play" size={20} color={colors.light.accent} />
                </View>
                <Text style={styles.gridCaption} numberOfLines={2}>
                  {post.caption}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  content: {
    padding: 16,
    paddingBottom: 90,
  },
  profileCard: {
    padding: 16,
    marginBottom: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  userDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light.text,
  },
  userHandle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.light.primary,
    marginBottom: 2,
  },
  userRole: {
    fontSize: 13,
    color: colors.light.textMuted,
    fontWeight: '500',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: colors.light.textMuted,
  },
  userBio: {
    fontSize: 13,
    color: colors.light.text,
    lineHeight: 18,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  profileActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  editProfileBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.light.primary,
    backgroundColor: '#FAF5EC',
  },
  editProfileBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.light.primary,
  },
  shareProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.light.border,
    backgroundColor: colors.light.surface,
  },
  shareProfileBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.light.text,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
    paddingTop: 12,
  },
  statCol: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.light.text,
  },
  statLabel: {
    fontSize: 11,
    color: colors.light.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.light.border,
  },
  scholarHubCard: {
    backgroundColor: colors.light.primary,
    padding: 16,
    marginBottom: 16,
  },
  hubHeaderRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  hubIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.light.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hubTextCol: {
    flex: 1,
  },
  hubTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  hubSubtitle: {
    fontSize: 12,
    color: '#CDE0DA',
    lineHeight: 16,
  },
  hubButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  hubButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  applyCard: {
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.light.accent,
  },
  applyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  applyInfo: {
    flex: 1,
  },
  applyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.light.primary,
    marginBottom: 4,
  },
  applySubtitle: {
    fontSize: 12,
    color: colors.light.textMuted,
    lineHeight: 16,
  },
  applyButton: {
    backgroundColor: colors.light.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  applyButtonText: {
    color: colors.light.accentText,
    fontSize: 13,
    fontWeight: '700',
  },
  adminCard: {
    padding: 16,
    marginBottom: 16,
  },
  adminSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.light.primary,
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  adminLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  adminLinkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  adminLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.text,
  },
  adminDivider: {
    height: 1,
    backgroundColor: colors.light.border,
  },
  mediaTabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
    marginBottom: 16,
    marginTop: 8,
  },
  mediaTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  mediaTabActive: {
    borderBottomColor: colors.light.primary,
  },
  mediaTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.light.textMuted,
  },
  mediaTabTextActive: {
    color: colors.light.primary,
    fontWeight: '700',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  emptyLessonsContainer: {
    padding: 24,
    borderRadius: 12,
    backgroundColor: colors.light.surface,
    borderWidth: 1,
    borderColor: colors.light.border,
    alignItems: 'center',
    marginVertical: 8,
  },
  emptyLessonsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: 4,
  },
  emptyLessonsSub: {
    fontSize: 12,
    color: colors.light.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  gridItem: {
    width: '48%',
    backgroundColor: colors.light.surface,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.light.border,
    padding: 10,
  },
  gridPlaceholder: {
    height: 90,
    backgroundColor: '#0D1A17',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridCaption: {
    fontSize: 12,
    color: colors.light.text,
    lineHeight: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  guestTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light.text,
  },
  guestSub: {
    fontSize: 14,
    color: colors.light.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  guestBtn: {
    marginTop: 12,
    width: '100%',
  },
});
