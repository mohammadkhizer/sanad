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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../src/api';
import { colors } from '../../src/theme/colors';
import { Avatar } from '../../src/components/Avatar';
import { VerifiedBadge } from '../../src/components/VerifiedBadge';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { ReportModal } from '../../src/components/ReportModal';
import { useAuthStore } from '../../src/store/authStore';
import { UserEntity, PostEntity } from '@sanad/shared';

export default function ScholarProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'reels' | 'videos'>('reels');
  const [isFollowing, setIsFollowing] = useState(false);

  const { data: user, isLoading } = useQuery<UserEntity>({
    queryKey: ['scholarProfile', id],
    queryFn: () => api.users.getUser(id || 'usr_scholar_1'),
  });

  const { data: postsData } = useQuery<{ items: PostEntity[] }>({
    queryKey: ['scholarPosts', id],
    queryFn: () => api.content.getFeed(),
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (isFollowing) {
        return api.users.unfollow(id || 'usr_scholar_1');
      } else {
        return api.users.follow(id || 'usr_scholar_1');
      }
    },
    onSuccess: () => {
      setIsFollowing(!isFollowing);
      queryClient.invalidateQueries({ queryKey: ['scholarProfile', id] });
    },
  });

  const handleRequestChat = async () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }

    try {
      const res = await api.chat.sendChatRequest({
        scholarId: id || 'usr_scholar_1',
        message: 'Respected teacher, I am seeking formal scholarly guidance regarding narrator criticism and legal methodology.',
      });
      Alert.alert(
        'Inquiry Delivered',
        'Your consultation inquiry has been submitted to the scholar queue.',
        [{ text: 'View Inbox', onPress: () => router.push('/(tabs)/inbox') }]
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Request failed';
      Alert.alert('Notice', msg);
    }
  };

  const handleStartCall = async () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    try {
      const session = await api.calls.initiateCall(id || 'usr_scholar_1');
      router.push(`/call/${session._id}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Call initialization failed';
      Alert.alert('Error', msg);
    }
  };

  const handleBlockUser = () => {
    Alert.alert(
      'Block Scholar',
      'Are you sure you want to block this user? You will no longer see their content or circles.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            await api.users.blockUser(id || 'usr_scholar_1');
            Alert.alert('Blocked', 'User has been blocked.');
            router.back();
          },
        },
      ]
    );
  };

  if (isLoading || !user) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.light.primary} />
      </View>
    );
  }

  const isScholar = Boolean(user.scholarProfile?.verified || user.roles.includes('scholar'));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <Card style={styles.profileCard}>
        <View style={styles.avatarRow}>
          <Avatar name={user.displayName} url={user.avatarUrl} size={72} />
          <View style={styles.userDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{user.displayName}</Text>
              {isScholar && <VerifiedBadge />}
            </View>
            {Boolean(user.scholarProfile?.institution) && (
              <Text style={styles.institution}>{user.scholarProfile?.institution}</Text>
            )}
            <Text style={styles.verifiedDate}>
              Verified since: {new Date(user.scholarProfile?.verifiedAt || '2025-01-15').getFullYear()}
            </Text>
          </View>
        </View>

        {/* Bio */}
        <Text style={styles.bioText}>
          {user.bio || 'Accredited scholar with verified chains of transmission in Islamic jurisprudence and Hadith sciences.'}
        </Text>

        {/* Specialties Tags */}
        {user.scholarProfile?.specialties && (
          <View style={styles.specialtiesRow}>
            {user.scholarProfile.specialties.map((spec, idx) => (
              <View key={idx} style={styles.specBadge}>
                <Text style={styles.specText}>{spec}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Network Metrics */}
        <View style={styles.networkRow}>
          <TouchableOpacity
            style={styles.metricItem}
            onPress={() => router.push(`/profile/${user._id}/network`)}
          >
            <Text style={styles.metricVal}>4,820</Text>
            <Text style={styles.metricLabel}>Followers</Text>
          </TouchableOpacity>

          <View style={styles.metricDivider} />

          <TouchableOpacity
            style={styles.metricItem}
            onPress={() => router.push(`/profile/${user._id}/network`)}
          >
            <Text style={styles.metricVal}>64</Text>
            <Text style={styles.metricLabel}>Following</Text>
          </TouchableOpacity>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <Text style={styles.metricVal}>52</Text>
            <Text style={styles.metricLabel}>Lessons</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <Button
            title={isFollowing ? 'Following' : 'Follow Scholar'}
            variant={isFollowing ? 'outline' : 'primary'}
            onPress={() => followMutation.mutate()}
            loading={followMutation.isPending}
            style={styles.flexBtn}
          />
          <Button
            title="Request Q&A"
            variant="accent"
            onPress={handleRequestChat}
            style={styles.flexBtn}
          />
        </View>

        <View style={styles.secondaryActions}>
          <TouchableOpacity style={styles.callLink} onPress={handleStartCall}>
            <Text style={styles.callLinkText}>[INITIATE VIDEO CONSULTATION]</Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Safety Rail: Report and Block */}
      <View style={styles.safetyRow}>
        <TouchableOpacity
          onPress={() => setReportModalVisible(true)}
          style={styles.safetyBtn}
        >
          <Text style={styles.reportText}>[REPORT SCHOLAR / CONTENT]</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleBlockUser} style={styles.safetyBtn}>
          <Text style={styles.blockText}>[BLOCK USER]</Text>
        </TouchableOpacity>
      </View>

      {/* Content Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'reels' && styles.tabItemActive]}
          onPress={() => setActiveTab('reels')}
        >
          <Text style={[styles.tabText, activeTab === 'reels' && styles.tabTextActive]}>
            Short Lessons / Reels
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'videos' && styles.tabItemActive]}
          onPress={() => setActiveTab('videos')}
        >
          <Text style={[styles.tabText, activeTab === 'videos' && styles.tabTextActive]}>
            Masterclasses & Lectures
          </Text>
        </TouchableOpacity>
      </View>

      {/* Published Content Grid */}
      <View style={styles.lessonsGrid}>
        {(postsData?.items || []).map((post) => (
          <TouchableOpacity
            key={post._id}
            style={styles.lessonCard}
            onPress={() => router.push(`/post/${post._id}`)}
          >
            <View style={styles.lessonHeader}>
              <Text style={styles.lessonType}>[{post.type.toUpperCase()}]</Text>
              <Text style={styles.lessonDate}>
                {new Date(post.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.lessonCaption} numberOfLines={2}>
              {post.caption}
            </Text>
            <Text style={styles.lessonStats}>
              {post.counts.likes} likes · {post.counts.comments} comments
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {reportModalVisible && (
        <ReportModal
          visible={reportModalVisible}
          targetType="user"
          targetId={user._id}
          onClose={() => setReportModalVisible(false)}
        />
      )}
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
  },
  profileCard: {
    padding: 16,
    gap: 12,
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
    flexWrap: 'wrap',
    gap: 6,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.light.text,
  },
  institution: {
    fontSize: 13,
    color: colors.light.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  verifiedDate: {
    fontSize: 11,
    color: colors.light.textMuted,
    marginTop: 1,
  },
  bioText: {
    fontSize: 13,
    color: colors.light.text,
    lineHeight: 19,
  },
  specialtiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  specBadge: {
    backgroundColor: colors.light.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  specText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.light.primary,
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
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  flexBtn: {
    flex: 1,
  },
  secondaryActions: {
    alignItems: 'center',
    paddingTop: 4,
  },
  callLink: {
    paddingVertical: 4,
  },
  callLinkText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.light.primary,
    letterSpacing: 0.5,
  },
  safetyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  safetyBtn: {
    padding: 4,
  },
  reportText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.light.textMuted,
  },
  blockText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.light.error,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
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
  lessonsGrid: {
    gap: 10,
  },
  lessonCard: {
    backgroundColor: colors.light.surface,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.light.border,
    gap: 4,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lessonType: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.light.primary,
  },
  lessonDate: {
    fontSize: 10,
    color: colors.light.textSecondary,
  },
  lessonCaption: {
    fontSize: 13,
    color: colors.light.text,
    lineHeight: 18,
  },
  lessonStats: {
    fontSize: 11,
    color: colors.light.textMuted,
    marginTop: 2,
  },
});
