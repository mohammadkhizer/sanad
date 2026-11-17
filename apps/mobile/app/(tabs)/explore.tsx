import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../src/api';
import { colors } from '../../src/theme/colors';
import { Card } from '../../src/components/Card';
import { Avatar } from '../../src/components/Avatar';
import { VerifiedBadge } from '../../src/components/VerifiedBadge';
import { AppHeader } from '../../src/components/AppHeader';
import { Icon } from '../../src/components/Icon';
import { useAuthStore } from '../../src/store/authStore';
import { useRouter } from 'expo-router';
import { UserEntity } from '@sanad/shared';

const POPULAR_TOPICS = [
  'Hadith Sciences',
  'Usul al-Fiqh',
  'Tafsir al-Quran',
  'Islamic Finance',
  'Manuscript Heritage',
  'Classical Arabic',
];

export default function ExploreScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'scholars'>('all');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const effectiveQuery = search.trim() || (selectedTopic ? selectedTopic : '');

  const { data: usersData, isLoading } = useQuery<UserEntity[]>({
    queryKey: ['exploreUsers', effectiveQuery, activeFilter],
    queryFn: async () => {
      const roleParam = activeFilter === 'scholars' ? 'scholar' : undefined;
      return api.users.searchUsers(effectiveQuery, roleParam);
    },
  });

  const followMutation = useMutation({
    mutationFn: async (target: { id: string; isFollowing?: boolean }) => {
      if (target.isFollowing) {
        return api.users.unfollow(target.id);
      } else {
        return api.users.follow(target.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exploreUsers'] });
    },
  });

  const users = usersData || [];

  const getRoleBadgeInfo = (roles: string[] = []) => {
    if (roles.includes('admin')) {
      return { label: 'Admin', style: styles.badgeAdmin, textStyle: styles.badgeAdminText };
    }
    if (roles.includes('scholar')) {
      return { label: 'Scholar', style: styles.badgeScholar, textStyle: styles.badgeScholarText };
    }
    if (roles.includes('moderator')) {
      return { label: 'Moderator', style: styles.badgeMod, textStyle: styles.badgeModText };
    }
    return { label: 'Member', style: styles.badgeMember, textStyle: styles.badgeMemberText };
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Discover & Connect"
        subtitle="Search users by username, scholars, and disciplines"
      />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Search Input Box */}
        <View style={styles.searchBox}>
          <Icon name="search" size={18} color={colors.light.textMuted} />
          <TextInput
            placeholder="Search by @username, name, or specialty..."
            placeholderTextColor={colors.light.textMuted}
            value={search}
            onChangeText={(text) => {
              setSearch(text);
              if (selectedTopic) setSelectedTopic(null);
            }}
            style={styles.searchInput}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {Boolean(search) && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Icon name="close" size={16} color={colors.light.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Segment Tabs: All Users vs Scholars */}
        <View style={styles.filterTabsRow}>
          <TouchableOpacity
            style={[styles.filterTab, activeFilter === 'all' && styles.filterTabActive]}
            onPress={() => setActiveFilter('all')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterTabText, activeFilter === 'all' && styles.filterTabTextActive]}>
              All Users
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, activeFilter === 'scholars' && styles.filterTabActive]}
            onPress={() => setActiveFilter('scholars')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterTabText, activeFilter === 'scholars' && styles.filterTabTextActive]}>
              Scholars Only
            </Text>
          </TouchableOpacity>
        </View>

        {/* Curated Disciplines Chips */}
        <View style={styles.topicsSection}>
          <Text style={styles.sectionSubtitle}>Curated Disciplines</Text>
          <View style={styles.topicsScroll}>
            {POPULAR_TOPICS.map((topic) => {
              const isSelected = selectedTopic === topic;
              return (
                <TouchableOpacity
                  key={topic}
                  style={[styles.topicChip, isSelected && styles.topicChipActive]}
                  onPress={() => {
                    if (isSelected) {
                      setSelectedTopic(null);
                    } else {
                      setSelectedTopic(topic);
                      setSearch('');
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.topicChipText, isSelected && styles.topicChipTextActive]}>
                    {topic}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Results Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {search.trim()
              ? `Search Results for "${search.trim()}"`
              : activeFilter === 'scholars'
                ? 'Accredited Scholars'
                : 'Sanad Community Members'}
          </Text>
          <Text style={styles.resultCountText}>{users.length} found</Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={colors.light.primary} />
          </View>
        ) : users.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No Users Found</Text>
            <Text style={styles.emptyText}>
              {search.trim()
                ? `No user matching "${search.trim()}" was found across any roles.`
                : 'No users registered under this criteria yet.'}
            </Text>
          </Card>
        ) : (
          users.map((item) => {
            const isScholar = Boolean(
              item.scholarProfile?.verified || item.roles?.includes('scholar')
            );
            const isSelf = Boolean(
              currentUser && (currentUser.id === item._id || currentUser.username === item.username)
            );
            const badge = getRoleBadgeInfo(item.roles);

            return (
              <Card key={item._id} style={styles.userCard}>
                <TouchableOpacity
                  style={styles.userRow}
                  onPress={() => (isSelf ? router.push('/(tabs)/profile') : router.push(`/profile/${item._id}`))}
                  activeOpacity={0.8}
                >
                  <Avatar name={item.displayName} url={item.avatarUrl} size={50} />

                  <View style={styles.userDetails}>
                    <View style={styles.nameHeaderRow}>
                      <Text style={styles.displayName}>{item.displayName}</Text>
                      {isSelf && (
                        <View style={styles.selfBadge}>
                          <Text style={styles.selfBadgeText}>You</Text>
                        </View>
                      )}
                      {isScholar && <VerifiedBadge size="small" />}
                      <View style={[styles.badgeBase, badge.style]}>
                        <Text style={[styles.badgeBaseText, badge.textStyle]}>
                          {badge.label}
                        </Text>
                      </View>
                    </View>

                    {Boolean(item.username) && (
                      <Text style={styles.usernameHandle}>@{item.username}</Text>
                    )}

                    {Boolean(item.scholarProfile?.institution) && (
                      <Text style={styles.institutionText}>
                        {item.scholarProfile?.institution}
                      </Text>
                    )}

                    {Boolean(item.bio) && (
                      <Text style={styles.bioText} numberOfLines={2}>
                        {item.bio}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>

                {/* Profile Quick Actions */}
                <View style={styles.cardActionsRow}>
                  {isSelf ? (
                    <TouchableOpacity
                      style={[styles.followBtn, styles.followBtnOutline]}
                      onPress={() => router.push('/(tabs)/profile')}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.followBtnText, styles.followBtnOutlineText]}>
                        View Profile
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.followBtn,
                        item.isFollowing && styles.followBtnOutline,
                        !item.isFollowing && item.isFollowedBy && styles.followBackBtn,
                      ]}
                      onPress={() =>
                        followMutation.mutate({
                          id: item._id,
                          isFollowing: item.isFollowing,
                        })
                      }
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.followBtnText,
                          item.isFollowing && styles.followBtnOutlineText,
                          !item.isFollowing && item.isFollowedBy && styles.followBackBtnText,
                        ]}
                      >
                        {item.isFollowing
                          ? 'Following'
                          : item.isFollowedBy
                            ? 'Follow Back'
                            : 'Follow'}
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.actionBtnOutline}
                    onPress={() => router.push(`/profile/${item._id}`)}
                    activeOpacity={0.7}
                  >
                    <Icon name="profile" size={14} color={colors.light.primary} />
                    <Text style={styles.actionBtnOutlineText}>Profile</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionBtnFill}
                    onPress={() =>
                      router.push({
                        pathname: `/chat/${item._id}`,
                        params: {
                          recipientName: item.displayName,
                          recipientId: item._id,
                        },
                      })
                    }
                    activeOpacity={0.7}
                  >
                    <Icon name="send" size={14} color={colors.light.accentText} />
                    <Text style={styles.actionBtnFillText}>Chat</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            );
          })
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.light.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.light.border,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.light.text,
    paddingVertical: 10,
  },
  filterTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: colors.light.surface,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  filterTabActive: {
    backgroundColor: colors.light.primary,
    borderColor: colors.light.primary,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.light.textSecondary,
  },
  filterTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  topicsSection: {
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.light.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  topicsScroll: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 2,
  },
  topicChip: {
    backgroundColor: colors.light.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  topicChipActive: {
    backgroundColor: '#FAF5EC',
    borderColor: colors.light.primary,
  },
  topicChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.light.textSecondary,
  },
  topicChipTextActive: {
    color: colors.light.primary,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.light.primary,
    letterSpacing: 0.2,
  },
  resultCountText: {
    fontSize: 12,
    color: colors.light.textMuted,
    fontWeight: '600',
  },
  loadingBox: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 13,
    color: colors.light.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  userCard: {
    marginBottom: 12,
    padding: 14,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  userDetails: {
    flex: 1,
  },
  nameHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 2,
  },
  displayName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.light.text,
  },
  usernameHandle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.light.primary,
    marginBottom: 2,
  },
  publicIdHandle: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: colors.light.textMuted,
    marginBottom: 2,
  },
  badgeBase: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeBaseText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  selfBadge: {
    backgroundColor: '#FAF5EC',
    borderWidth: 1,
    borderColor: '#E6D29A',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  selfBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8C6C0A',
    textTransform: 'uppercase',
  },
  badgeAdmin: {
    backgroundColor: '#FEF7E0',
  },
  badgeAdminText: {
    color: '#B06000',
  },
  badgeScholar: {
    backgroundColor: '#E6F4EA',
  },
  badgeScholarText: {
    color: '#137333',
  },
  badgeMod: {
    backgroundColor: '#E8F0FE',
  },
  badgeModText: {
    color: '#1A73E8',
  },
  badgeMember: {
    backgroundColor: '#F1F3F4',
  },
  badgeMemberText: {
    color: '#5F6368',
  },
  institutionText: {
    fontSize: 12,
    color: colors.light.accent,
    fontWeight: '600',
    marginBottom: 2,
  },
  bioText: {
    fontSize: 12,
    color: colors.light.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
    paddingTop: 10,
  },
  actionBtnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 34,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.light.border,
    backgroundColor: colors.light.surface,
  },
  actionBtnOutlineText: {
    color: colors.light.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  actionBtnFill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 34,
    borderRadius: 6,
    backgroundColor: colors.light.accent,
  },
  actionBtnFillText: {
    color: colors.light.accentText,
    fontSize: 12,
    fontWeight: '700',
  },
  followBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 34,
    borderRadius: 6,
    backgroundColor: colors.light.primary,
  },
  followBtnOutline: {
    backgroundColor: colors.light.surface,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  followBackBtn: {
    backgroundColor: colors.light.accent,
  },
  followBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  followBtnOutlineText: {
    color: colors.light.textSecondary,
    fontWeight: '600',
  },
  followBackBtnText: {
    color: colors.light.accentText,
    fontWeight: '700',
  },
});
