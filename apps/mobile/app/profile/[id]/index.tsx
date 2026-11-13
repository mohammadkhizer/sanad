import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../src/api';
import { colors } from '../../../src/theme/colors';
import { Avatar } from '../../../src/components/Avatar';
import { VerifiedBadge } from '../../../src/components/VerifiedBadge';
import { Card } from '../../../src/components/Card';
import { Button } from '../../../src/components/Button';
import { AppHeader } from '../../../src/components/AppHeader';
import { Icon } from '../../../src/components/Icon';
import { ReportModal } from '../../../src/components/ReportModal';
import { useAuthStore } from '../../../src/store/authStore';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();

  const [reportModalVisible, setReportModalVisible] = useState(false);
  const targetIdentifier = id as string;

  const { data: userData, isLoading } = useQuery<any>({
    queryKey: ['userProfile', targetIdentifier],
    queryFn: () => api.users.getUser(targetIdentifier),
    enabled: Boolean(targetIdentifier),
  });

  const user = userData?.user || userData;
  const isSelf = Boolean(
    currentUser &&
      user &&
      (currentUser.id === user._id || currentUser.username === user.username)
  );

  const isScholar = Boolean(
    user?.scholarProfile?.verified || user?.roles?.includes('scholar')
  );
  const isAdmin = Boolean(user?.roles?.includes('admin'));
  const isMod = Boolean(user?.roles?.includes('moderator'));

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!user?._id) return;
      if (userData?.isFollowing) {
        return api.users.unfollow(user._id);
      } else {
        return api.users.follow(user._id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', targetIdentifier] });
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Action failed';
      Alert.alert('Notice', msg);
    },
  });

  const handleMessage = async () => {
    if (!currentUser) {
      router.push('/(auth)/login');
      return;
    }
    if (isScholar) {
      try {
        await api.chat.sendChatRequest({
          scholarId: user._id,
          message: 'As-salamu alaykum, I am reaching out through your scholarly profile.',
        });
        Alert.alert(
          'Inquiry Submitted',
          'Your inquiry has been delivered to the scholar consultation queue.',
          [{ text: 'View Inbox', onPress: () => router.push('/(tabs)/inbox') }]
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to send message';
        Alert.alert('Error', msg);
      }
    } else {
      router.push(`/chat/${user._id}`);
    }
  };

  const handleBlockUser = () => {
    Alert.alert(
      'Block User',
      `Are you sure you want to block @${user?.username || user?.displayName}? You will no longer interact on the platform.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.users.blockUser(user._id);
              Alert.alert('User Blocked', 'This account has been blocked.');
              router.replace('/(tabs)/explore');
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : 'Failed to block user';
              Alert.alert('Error', msg);
            }
          },
        },
      ]
    );
  };

  if (isLoading || !user) {
    return (
      <View style={styles.screen}>
        <AppHeader title="Profile" showBack />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.light.primary} />
        </View>
      </View>
    );
  }

  const primaryRoleLabel = isAdmin
    ? 'System Administrator'
    : isScholar
      ? 'Accredited Scholar'
      : isMod
        ? 'Platform Moderator'
        : 'Registered Member';

  return (
    <View style={styles.screen}>
      <AppHeader
        title={user.displayName}
        subtitle={user.username ? `@${user.username}` : primaryRoleLabel}
        showBack
        rightIcon="share"
        onRightPress={() => {
          Alert.alert(
            'Share Profile',
            `Profile handle: @${user.username || user.displayName}`
          );
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Main Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <Avatar name={user.displayName} url={user.avatarUrl} size={72} />
            <View style={styles.userDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{user.displayName}</Text>
                {isScholar && <VerifiedBadge size="small" />}
              </View>

              {Boolean(user.username) && (
                <Text style={styles.userHandle}>@{user.username}</Text>
              )}

              {Boolean(user.publicId) && (
                <Text style={styles.publicIdText}>Public ID: {user.publicId}</Text>
              )}

              <View style={styles.roleBadgeRow}>
                <View
                  style={[
                    styles.roleBadge,
                    isAdmin && styles.roleBadgeAdmin,
                    isScholar && styles.roleBadgeScholar,
                    isMod && styles.roleBadgeMod,
                  ]}
                >
                  <Text
                    style={[
                      styles.roleBadgeText,
                      isAdmin && styles.roleBadgeAdminText,
                      isScholar && styles.roleBadgeScholarText,
                      isMod && styles.roleBadgeModText,
                    ]}
                  >
                    {primaryRoleLabel}
                  </Text>
                </View>

                {Boolean(user.isPrivate) && (
                  <View style={styles.privateBadge}>
                    <Text style={styles.privateBadgeText}>Private</Text>
                  </View>
                )}

                {Boolean(userData?.relation === 'mutual') && (
                  <View style={styles.mutualBadge}>
                    <Text style={styles.mutualBadgeText}>Mutual</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {Boolean(user.bio) && (
            <Text style={styles.userBio}>{user.bio}</Text>
          )}

          {/* Action Row */}
          <View style={styles.actionRow}>
            {isSelf ? (
              <Button
                title="Edit Profile"
                onPress={() => router.push('/profile/edit')}
                variant="outline"
                style={styles.actionBtn}
              />
            ) : (
              <>
                <Button
                  title={
                    userData?.isFollowing
                      ? 'Following'
                      : userData?.isFollowedBy
                        ? 'Follow Back'
                        : 'Follow'
                  }
                  onPress={() => followMutation.mutate()}
                  variant={userData?.isFollowing ? 'outline' : 'primary'}
                  loading={followMutation.isPending}
                  style={styles.actionBtn}
                />
                <Button
                  title={isScholar ? 'Inquire' : 'Message'}
                  onPress={handleMessage}
                  variant="outline"
                  style={styles.actionBtn}
                />
              </>
            )}
          </View>

          {/* Metrics Row */}
          <View style={styles.statsRow}>
            <TouchableOpacity
              style={styles.statCol}
              onPress={() => router.push(`/profile/${user._id}/network`)}
            >
              <Text style={styles.statNumber}>{userData?.counts?.followers ?? 0}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity
              style={styles.statCol}
              onPress={() => router.push(`/profile/${user._id}/network`)}
            >
              <Text style={styles.statNumber}>{userData?.counts?.following ?? 0}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statNumber}>{userData?.counts?.lessons ?? 0}</Text>
              <Text style={styles.statLabel}>Lessons</Text>
            </View>
          </View>
        </Card>

        {/* Scholar Metadata Card */}
        {isScholar && user.scholarProfile && (
          <Card style={styles.scholarCard}>
            <Text style={styles.sectionHeading}>Academic Accreditation</Text>

            {Boolean(user.scholarProfile.institution) && (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Institution:</Text>
                <Text style={styles.metaValue}>{user.scholarProfile.institution}</Text>
              </View>
            )}

            {Boolean(user.scholarProfile.specialties?.length) && (
              <View style={styles.specialtiesBlock}>
                <Text style={styles.metaLabel}>Specialties:</Text>
                <View style={styles.chipsRow}>
                  {user.scholarProfile.specialties.map((spec: string) => (
                    <View key={spec} style={styles.chip}>
                      <Text style={styles.chipText}>{spec}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {Boolean(user.scholarProfile.languages?.length) && (
              <View style={styles.specialtiesBlock}>
                <Text style={styles.metaLabel}>Teaching Languages:</Text>
                <Text style={styles.metaValue}>
                  {user.scholarProfile.languages.join(', ')}
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* Safety & Moderation Options */}
        {!isSelf && (
          <Card style={styles.safetyCard}>
            <TouchableOpacity
              style={styles.safetyRow}
              onPress={() => setReportModalVisible(true)}
            >
              <Icon name="shield" size={16} color={colors.light.textMuted} />
              <Text style={styles.safetyText}>Report this account to Trust & Safety</Text>
            </TouchableOpacity>

            <View style={styles.safetyDivider} />

            <TouchableOpacity style={styles.safetyRow} onPress={handleBlockUser}>
              <Icon name="close" size={16} color={colors.light.error} />
              <Text style={[styles.safetyText, styles.safetyDanger]}>
                Block @{user.username || user.displayName}
              </Text>
            </TouchableOpacity>
          </Card>
        )}
      </ScrollView>

      {/* Safety Report Modal */}
      <ReportModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
        targetId={user._id}
        targetType="user"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    padding: 16,
    marginBottom: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 14,
  },
  userDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
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
  publicIdText: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: colors.light.textMuted,
    marginBottom: 4,
  },
  roleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: '#EAEAEA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.light.textMuted,
  },
  roleBadgeAdmin: {
    backgroundColor: '#FEF7E0',
  },
  roleBadgeAdminText: {
    color: '#B06000',
  },
  roleBadgeScholar: {
    backgroundColor: '#E6F4EA',
  },
  roleBadgeScholarText: {
    color: '#137333',
  },
  roleBadgeMod: {
    backgroundColor: '#E8F0FE',
  },
  roleBadgeModText: {
    color: '#1A73E8',
  },
  privateBadge: {
    backgroundColor: '#FDE8E8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  privateBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#C81E1E',
  },
  mutualBadge: {
    backgroundColor: '#E1F8EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  mutualBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0E9F6E',
  },
  userBio: {
    fontSize: 13,
    color: colors.light.text,
    lineHeight: 18,
    marginBottom: 14,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  actionBtn: {
    flex: 1,
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
  scholarCard: {
    padding: 16,
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.light.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.light.textMuted,
  },
  metaValue: {
    fontSize: 13,
    color: colors.light.text,
  },
  specialtiesBlock: {
    marginTop: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  chip: {
    backgroundColor: colors.light.surfaceElevated,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  chipText: {
    fontSize: 12,
    color: colors.light.text,
  },
  safetyCard: {
    padding: 12,
    marginBottom: 16,
  },
  safetyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  safetyText: {
    fontSize: 13,
    color: colors.light.textMuted,
  },
  safetyDanger: {
    color: colors.light.error,
    fontWeight: '600',
  },
  safetyDivider: {
    height: 1,
    backgroundColor: colors.light.border,
    marginVertical: 6,
  },
});
