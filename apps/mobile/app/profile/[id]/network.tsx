import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { colors } from '../../../src/theme/colors';
import { api } from '../../../src/api';
import { Avatar } from '../../../src/components/Avatar';
import { VerifiedBadge } from '../../../src/components/VerifiedBadge';
import { AppHeader } from '../../../src/components/AppHeader';
import { UserEntity } from '@sanad/shared';

export default function ScholarlyNetworkScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>('followers');

  const { data, isLoading } = useQuery<{ followers: UserEntity[]; following: UserEntity[] }>({
    queryKey: ['network', id],
    queryFn: () => api.users.getNetwork(id || 'usr_scholar_1'),
  });

  const followMutation = useMutation({
    mutationFn: (targetId: string) => api.users.follow(targetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['network', id] });
    },
  });

  const list = activeTab === 'followers' ? data?.followers || [] : data?.following || [];

  const renderItem = ({ item }: { item: UserEntity }) => {
    const isScholar = Boolean(item.scholarProfile?.verified || item.roles.includes('scholar'));

    return (
      <View style={styles.userRow}>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => router.push(isScholar ? `/scholar/${item._id}` : `/profile/${item._id}`)}
          activeOpacity={0.7}
        >
          <Avatar name={item.displayName} url={item.avatarUrl} size={46} />
          <View style={styles.nameContainer}>
            <View style={styles.nameRow}>
              <Text style={styles.displayName}>{item.displayName}</Text>
              {isScholar && <VerifiedBadge size="small" />}
            </View>
            <Text style={styles.bioText} numberOfLines={1}>
              {item.scholarProfile?.institution || item.bio || 'Seeker of knowledge'}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.followBtn}
          onPress={() => followMutation.mutate(item._id)}
          activeOpacity={0.8}
        >
          <Text style={styles.followBtnText}>Follow</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Scholarly Network"
        subtitle="Students and Chains of Transmission"
        showBack
      />

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'followers' && styles.tabItemActive]}
          onPress={() => setActiveTab('followers')}
        >
          <Text style={[styles.tabText, activeTab === 'followers' && styles.tabTextActive]}>
            Followers ({data?.followers.length || 0})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'following' && styles.tabItemActive]}
          onPress={() => setActiveTab('following')}
        >
          <Text style={[styles.tabText, activeTab === 'following' && styles.tabTextActive]}>
            Following ({data?.following.length || 0})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={list}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Members Found</Text>
            <Text style={styles.emptyText}>This directory does not currently have registered connections.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: colors.light.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.light.textSecondary,
  },
  tabTextActive: {
    color: colors.light.primary,
    fontWeight: '800',
  },
  listContent: {
    padding: 16,
    gap: 10,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.light.surface,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  nameContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  displayName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.light.text,
  },
  bioText: {
    fontSize: 12,
    color: colors.light.textSecondary,
    marginTop: 2,
  },
  followBtn: {
    backgroundColor: colors.light.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  followBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.light.primary,
  },
  emptyText: {
    color: colors.light.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
});
