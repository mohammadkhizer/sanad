import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuthStore } from '../../src/store/authStore';
import { colors } from '../../src/theme/colors';
import { Avatar } from '../../src/components/Avatar';
import { VerifiedBadge } from '../../src/components/VerifiedBadge';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
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
      <View style={styles.center}>
        <Text style={styles.guestTitle}>Guest Mode</Text>
        <Text style={styles.guestSub}>
          Log in or create an account to follow scholars, participate in Q&A, and verify credentials.
        </Text>
        <Button
          title="Sign In / Register"
          onPress={() => router.push('/(auth)/login')}
          style={styles.guestBtn}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Header with Settings Shortcut */}
      <View style={styles.topBar}>
        <Text style={styles.topBarRole}>[{user.roles.join(', ').toUpperCase()}]</Text>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => router.push('/settings')}
        >
          <Text style={styles.settingsBtnText}>[SETTINGS]</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Header */}
      <Card style={styles.profileCard}>
        <View style={styles.avatarRow}>
          <Avatar name={user.displayName} size={64} />
          <View style={styles.userDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{user.displayName}</Text>
              {isScholar && <VerifiedBadge />}
            </View>
            <Text style={styles.userRole}>
              {isScholar ? 'Accredited Religious Scholar' : 'Registered Learner'}
            </Text>
            {Boolean(user.email) && <Text style={styles.userEmail}>{user.email}</Text>}
          </View>
        </View>

        {/* Network Metrics */}
        <View style={styles.networkRow}>
          <TouchableOpacity
            style={styles.metricItem}
            onPress={() => router.push(`/profile/${user.id}/network`)}
          >
            <Text style={styles.metricVal}>142</Text>
            <Text style={styles.metricLabel}>Followers</Text>
          </TouchableOpacity>

          <View style={styles.metricDivider} />

          <TouchableOpacity
            style={styles.metricItem}
            onPress={() => router.push(`/profile/${user.id}/network`)}
          >
            <Text style={styles.metricVal}>38</Text>
            <Text style={styles.metricLabel}>Following</Text>
          </TouchableOpacity>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <Text style={styles.metricVal}>12</Text>
            <Text style={styles.metricLabel}>Lessons</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.profileActions}>
          <Button
            title="Edit Profile"
            variant="outline"
            onPress={() => router.push('/settings/account')}
            style={styles.actionBtnFlex}
          />
          {isScholar ? (
            <Button
              title="Scholar Dashboard"
              onPress={() => router.push('/scholar/dashboard')}
              style={styles.actionBtnFlex}
            />
          ) : (
            <Button
              title="Application Status"
              variant="outline"
              onPress={() => router.push('/scholar/status')}
              style={styles.actionBtnFlex}
            />
          )}
        </View>
      </Card>

      {/* Scholar Application Prompt for Members */}
      {!isScholar && (
        <Card style={styles.scholarCard}>
          <Text style={styles.scholarCardTitle}>Are you an accredited religious scholar?</Text>
          <Text style={styles.scholarCardDesc}>
            Sanad restricts publishing to verified ulama and academics. Submit your institutional degree or classical ijazah for committee review.
          </Text>
          <View style={styles.scholarBtnRow}>
            <Button
              title="Apply for Verification"
              variant="accent"
              onPress={() => router.push('/scholar/apply')}
              style={styles.actionBtnFlex}
            />
            <Button
              title="Check Status"
              variant="outline"
              onPress={() => router.push('/scholar/status')}
              style={styles.actionBtnFlex}
            />
          </View>
        </Card>
      )}

      {/* Staff Management Panel */}
      {isModOrAdmin && (
        <Card style={styles.adminCard}>
          <Text style={styles.adminTitle}>Administrative Governance</Text>
          <TouchableOpacity
            style={styles.adminLink}
            onPress={() => router.push('/admin/review-queue')}
          >
            <Text style={styles.adminLinkText}>Scholar Verification Dossiers</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.adminLink}
            onPress={() => router.push('/admin/reports')}
          >
            <Text style={styles.adminLinkText}>Trust & Safety Queue (P0/P1/P2)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.adminLink}
            onPress={() => router.push('/admin/audit-logs')}
          >
            <Text style={styles.adminLinkText}>Audit Trail & Event Log</Text>
          </TouchableOpacity>
        </Card>
      )}

      {/* Content Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'reels' && styles.tabItemActive]}
          onPress={() => setActiveTab('reels')}
        >
          <Text style={[styles.tabText, activeTab === 'reels' && styles.tabTextActive]}>
            Reels (8)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'videos' && styles.tabItemActive]}
          onPress={() => setActiveTab('videos')}
        >
          <Text style={[styles.tabText, activeTab === 'videos' && styles.tabTextActive]}>
            Masterclasses (4)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'saved' && styles.tabItemActive]}
          onPress={() => setActiveTab('saved')}
        >
          <Text style={[styles.tabText, activeTab === 'saved' && styles.tabTextActive]}>
            Saved (15)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Preview Grid */}
      <View style={styles.contentGrid}>
        {(postsData?.items || []).slice(0, 3).map((post) => (
          <TouchableOpacity
            key={post._id}
            style={styles.gridItem}
            onPress={() => router.push(`/post/${post._id}`)}
          >
            <Text style={styles.gridBadge}>[{post.type.toUpperCase()}]</Text>
            <Text style={styles.gridCaption} numberOfLines={2}>
              {post.caption}
            </Text>
            <Text style={styles.gridCounts}>
              {post.counts.likes} likes · {post.counts.comments} comments
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.light.background,
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.light.primary,
    marginBottom: 8,
  },
  guestSub: {
    fontSize: 13,
    color: colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  guestBtn: {
    width: '100%',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topBarRole: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.light.primary,
    letterSpacing: 0.5,
  },
  settingsBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: colors.light.surfaceElevated,
  },
  settingsBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.light.primary,
  },
  profileCard: {
    padding: 16,
    gap: 14,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  userDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.light.text,
  },
  userRole: {
    fontSize: 12,
    color: colors.light.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  userEmail: {
    fontSize: 11,
    color: colors.light.textSecondary,
    marginTop: 2,
  },
  networkRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: colors.light.surfaceElevated,
    borderRadius: 8,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricVal: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.light.primary,
  },
  metricLabel: {
    fontSize: 11,
    color: colors.light.textSecondary,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.light.border,
  },
  profileActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtnFlex: {
    flex: 1,
  },
  scholarCard: {
    backgroundColor: colors.light.surfaceElevated,
    borderColor: colors.light.accent,
    padding: 16,
    gap: 8,
  },
  scholarCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.light.text,
  },
  scholarCardDesc: {
    fontSize: 12,
    color: colors.light.textSecondary,
    lineHeight: 18,
  },
  scholarBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  adminCard: {
    padding: 16,
    gap: 8,
  },
  adminTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.light.primary,
    marginBottom: 4,
  },
  adminLink: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  adminLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.light.primary,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
    backgroundColor: colors.light.surface,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: colors.light.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.light.textSecondary,
  },
  tabTextActive: {
    color: colors.light.primary,
    fontWeight: '800',
  },
  contentGrid: {
    gap: 10,
  },
  gridItem: {
    backgroundColor: colors.light.surface,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.light.border,
    gap: 4,
  },
  gridBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.light.primary,
  },
  gridCaption: {
    fontSize: 13,
    color: colors.light.text,
    lineHeight: 18,
  },
  gridCounts: {
    fontSize: 11,
    color: colors.light.textSecondary,
    marginTop: 2,
  },
});
