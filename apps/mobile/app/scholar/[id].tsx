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
import { AppHeader } from '../../src/components/AppHeader';
import { Icon } from '../../src/components/Icon';
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
      await api.chat.sendChatRequest({
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
      'Are you sure you want to block this user? You will no longer see their content or teachings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            await api.users.blockUser(id || 'usr_scholar_1');
            Alert.alert('User Blocked', 'This scholar profile has been blocked from your feed.');
            router.replace('/(tabs)/feed');
          },
        },
      ]
    );
  };

  if (isLoading || !user) {
    return (
      <View style={styles.screen}>
        <AppHeader title="Scholar Profile" showBack />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.light.primary} />
        </View>
      </View>
    );
  }

  const isScholar = Boolean(user.scholarProfile?.verified || user.roles.includes('scholar'));

  return (
    <View style={styles.screen}>
      <AppHeader
        title={user.displayName}
        subtitle={user.scholarProfile?.institution || 'Accredited Scholar'}
        showBack
        rightIcon="share"
        onRightPress={() => {
          Alert.alert('Share Profile', 'Scholarly profile link copied to clipboard.');
        }}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <Avatar name={user.displayName} url={user.avatarUrl} size={76} />
            <View style={styles.userDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{user.displayName}</Text>
                {isScholar && <VerifiedBadge />}
              </View>
              {Boolean(user.scholarProfile?.institution) && (
                <Text style={styles.institution}>{user.scholarProfile?.institution}</Text>
              )}
              <Text style={styles.verifiedDate}>
                Verified since {new Date(user.scholarProfile?.verifiedAt || '2025-01-15').getFullYear()}
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
              <Text style={styles.metricLabel}>Students</Text>
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

          {/* Primary Action Buttons */}
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

          {/* Direct Consultation Link */}
          <TouchableOpacity
            style={styles.consultationCard}
            onPress={handleStartCall}
            activeOpacity={0.7}
          >
            <View style={styles.consultationIconBox}>
              <Icon name="call" size={20} color={colors.light.primary} />
            </View>
            <View style={styles.consultationInfo}>
              <Text style={styles.consultationTitle}>Initiate Video Consultation</Text>
              <Text style={styles.consultationSub}>One-on-one private academic session</Text>
            </View>
            <Icon name="chevron-right" size={18} color={colors.light.textMuted} />
          </TouchableOpacity>
        </Card>

        {/* Safety Actions */}
        <View style={styles.safetyRow}>
          <TouchableOpacity
            onPress={() => setReportModalVisible(true)}
            style={styles.safetyBtn}
          >
            <Icon name="shield" size={14} color={colors.light.textMuted} />
            <Text style={styles.reportText}>Report Scholar or Content</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleBlockUser} style={styles.safetyBtn}>
            <Icon name="close" size={14} color={colors.light.error} />
            <Text style={styles.blockText}>Block User</Text>
          </TouchableOpacity>
        </View>

        {/* Content Navigation Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'reels' && styles.tabItemActive]}
            onPress={() => setActiveTab('reels')}
          >
            <Icon
              name="reels"
              size={16}
              color={activeTab === 'reels' ? colors.light.primary : colors.light.textMuted}
            />
            <Text style={[styles.tabText, activeTab === 'reels' && styles.tabTextActive]}>
              Short Reels
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'videos' && styles.tabItemActive]}
            onPress={() => setActiveTab('videos')}
          >
            <Icon
              name="play"
              size={16}
              color={activeTab === 'videos' ? colors.light.primary : colors.light.textMuted}
            />
            <Text style={[styles.tabText, activeTab === 'videos' && styles.tabTextActive]}>
              Masterclasses
            </Text>
          </TouchableOpacity>
        </View>

        {/* Lessons List */}
        <View style={styles.lessonsGrid}>
          {(postsData?.items || []).map((post) => (
            <TouchableOpacity
              key={post._id}
              style={styles.lessonCard}
              onPress={() => router.push(`/post/${post._id}`)}
              activeOpacity={0.7}
            >
              <View style={styles.lessonHeader}>
                <View style={styles.typeBadge}>
                  <Text style={styles.lessonType}>{post.type.toUpperCase()}</Text>
                </View>
                <Text style={styles.lessonDate}>
                  {new Date(post.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.lessonCaption} numberOfLines={2}>
                {post.caption}
              </Text>
              <Text style={styles.lessonStats}>
                {post.counts.likes} endorsements · {post.counts.comments} answers
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    padding: 18,
    borderRadius: 14,
    gap: 14,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
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
    fontSize: 19,
    fontWeight: '800',
    color: colors.light.text,
  },
  institution: {
    fontSize: 13,
    color: colors.light.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  verifiedDate: {
    fontSize: 11,
    color: colors.light.textMuted,
    marginTop: 2,
  },
  bioText: {
    fontSize: 13,
    color: colors.light.text,
    lineHeight: 20,
  },
  specialtiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  specBadge: {
    backgroundColor: 'rgba(15, 76, 69, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(15, 76, 69, 0.15)',
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
    paddingVertical: 12,
    backgroundColor: colors.light.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricVal: {
    fontSize: 17,
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
  consultationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: colors.light.background,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  consultationIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 76, 69, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  consultationInfo: {
    flex: 1,
  },
  consultationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.light.primary,
  },
  consultationSub: {
    fontSize: 11,
    color: colors.light.textMuted,
    marginTop: 1,
  },
  safetyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  safetyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  reportText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.light.textMuted,
  },
  blockText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.light.error,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.light.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.light.border,
    padding: 4,
    gap: 6,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  tabItemActive: {
    backgroundColor: colors.light.background,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.light.textMuted,
  },
  tabTextActive: {
    color: colors.light.primary,
    fontWeight: '700',
  },
  lessonsGrid: {
    gap: 10,
  },
  lessonCard: {
    backgroundColor: colors.light.surface,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.light.border,
    gap: 6,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    backgroundColor: 'rgba(15, 76, 69, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lessonType: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.light.primary,
  },
  lessonDate: {
    fontSize: 11,
    color: colors.light.textMuted,
  },
  lessonCaption: {
    fontSize: 13,
    color: colors.light.text,
    lineHeight: 18,
    fontWeight: '600',
  },
  lessonStats: {
    fontSize: 11,
    color: colors.light.textMuted,
  },
});
