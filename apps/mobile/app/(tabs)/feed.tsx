import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../src/api';
import { colors } from '../../src/theme/colors';
import { VerifiedBadge } from '../../src/components/VerifiedBadge';
import { Avatar } from '../../src/components/Avatar';
import { Card } from '../../src/components/Card';
import { EmptyState } from '../../src/components/EmptyState';
import { ReportModal } from '../../src/components/ReportModal';
import { Icon } from '../../src/components/Icon';
import { useAuthStore } from '../../src/store/authStore';
import { useRouter } from 'expo-router';
import { PostEntity } from '@sanad/shared';

export default function FeedScreen() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [activeTab, setActiveTab] = useState<'following' | 'discover'>('discover');
  const [reportTarget, setReportTarget] = useState<{ id: string; type: 'post' | 'user' } | null>(null);

  const { data, isLoading, refetch, isRefetching } = useQuery<{ items: PostEntity[] }>({
    queryKey: ['feed', activeTab],
    queryFn: () => api.content.getFeed({ tab: activeTab, limit: 20 }),
  });

  const likeMutation = useMutation({
    mutationFn: (postId: string) => api.content.likePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });

  const saveMutation = useMutation({
    mutationFn: (postId: string) => api.content.savePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });

  const handleShare = async (item: PostEntity) => {
    try {
      await Share.share({
        message: `Sanad Lesson: "${item.caption}"`,
      });
    } catch {
      // share dismissed
    }
  };

  const renderPost = ({ item }: { item: PostEntity }) => {
    const author = typeof item.authorId === 'object' ? item.authorId : null;
    const authorName = author?.displayName || 'Scholar Teacher';
    const isScholar = Boolean(author?.scholarProfile?.verified);
    const institution = author?.scholarProfile?.institution;

    return (
      <Card style={styles.postCard}>
        {/* Author Header */}
        <View style={styles.authorRow}>
          <TouchableOpacity
            style={styles.authorTouch}
            onPress={() =>
              router.push(
                isScholar
                  ? `/scholar/${author?._id || 'usr_scholar_1'}`
                  : `/profile/${author?._id || 'usr_scholar_1'}`
              )
            }
          >
            <Avatar name={authorName} url={author?.avatarUrl} size={42} />
            <View style={styles.authorInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.authorName}>{authorName}</Text>
                {isScholar && <VerifiedBadge size="small" />}
              </View>
              {Boolean(institution) && (
                <Text style={styles.institution} numberOfLines={1}>
                  {institution}
                </Text>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setReportTarget({ id: item._id, type: 'post' })}
            style={styles.moreBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="more-vertical" size={18} color={colors.light.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Video / Reel Media Area */}
        {item.type !== 'text' && (
          <TouchableOpacity
            style={styles.mediaContainer}
            activeOpacity={0.9}
            onPress={() => router.push(`/post/${item._id}`)}
          >
            <View style={styles.mediaPlaceholder}>
              <View style={styles.playIconCircle}>
                <Icon name="play" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.mediaNotice}>
                {item.type === 'reel' ? 'Short-Form Reel (90s)' : 'Masterclass Lecture'}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Post Caption */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push(`/post/${item._id}`)}
          style={styles.captionTouch}
        >
          <Text style={styles.captionText}>{item.caption}</Text>
        </TouchableOpacity>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagRow}>
            {item.tags.map((tag) => (
              <Text key={tag} style={styles.tagText}>
                #{tag}
              </Text>
            ))}
          </View>
        )}

        {/* Classical Action Rail with Real Vector Icons */}
        <View style={styles.actionsRail}>
          <View style={styles.actionsLeft}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => likeMutation.mutate(item._id)}
              disabled={likeMutation.isPending}
            >
              <Icon
                name={item.isLiked ? 'heart' : 'heart-outline'}
                size={20}
                color={item.isLiked ? '#B3261E' : colors.light.textSecondary}
              />
              <Text style={[styles.actionCount, item.isLiked && styles.actionCountLiked]}>
                {item.counts.likes}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => router.push(`/post/${item._id}`)}
            >
              <Icon name="comment" size={19} color={colors.light.textSecondary} />
              <Text style={styles.actionCount}>{item.counts.comments}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={() => handleShare(item)}>
              <Icon name="share" size={19} color={colors.light.textSecondary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => saveMutation.mutate(item._id)}
            disabled={saveMutation.isPending}
          >
            <Icon
              name={item.isSaved ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={item.isSaved ? colors.light.accent : colors.light.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {/* Classical Top Masthead */}
      <View style={[styles.masthead, { paddingTop: insets.top || 14 }]}>
        <View style={styles.mastheadRow}>
          {/* Logo Mark */}
          <View style={styles.logoRow}>
            <Icon name="verified" size={24} color={colors.light.accent} />
            <Text style={styles.logoTitle}>SANAD</Text>
          </View>

          {/* Quick Actions */}
          <View style={styles.mastheadActions}>
            <TouchableOpacity
              style={styles.mastheadBtn}
              onPress={() => router.push('/(tabs)/explore')}
            >
              <Icon name="search" size={20} color={colors.light.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.mastheadBtn}
              onPress={() => router.push('/settings/notifications')}
            >
              <Icon name="bell" size={20} color={colors.light.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Classical Segmented Tab Switcher */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'discover' && styles.tabItemActive]}
            onPress={() => setActiveTab('discover')}
          >
            <Text style={[styles.tabText, activeTab === 'discover' && styles.tabTextActive]}>
              Discover
            </Text>
            {activeTab === 'discover' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'following' && styles.tabItemActive]}
            onPress={() => setActiveTab('following')}
          >
            <Text style={[styles.tabText, activeTab === 'following' && styles.tabTextActive]}>
              Following
            </Text>
            {activeTab === 'following' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        </View>
      </View>

      {/* Feed List */}
      <FlatList
        data={data?.items || []}
        keyExtractor={(item) => item._id}
        renderItem={renderPost}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              refetch();
            }}
            tintColor={colors.light.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            title={activeTab === 'following' ? 'No Followed Scholars Yet' : 'Feed Initializing'}
            subtitle={
              activeTab === 'following'
                ? 'Follow verified scholars in Discover to see their curated lessons and circles.'
                : 'Scholarly lessons and circles will appear here.'
            }
          />
        }
      />

      {/* Report Modal */}
      {reportTarget && (
        <ReportModal
          visible={Boolean(reportTarget)}
          targetId={reportTarget.id}
          targetType={reportTarget.type}
          onClose={() => setReportTarget(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  masthead: {
    backgroundColor: colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  mastheadRow: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.light.primary,
    letterSpacing: 2,
  },
  mastheadActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mastheadBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.light.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 24,
  },
  tabItem: {
    paddingVertical: 10,
    position: 'relative',
  },
  tabItemActive: {},
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.textMuted,
    letterSpacing: 0.3,
  },
  tabTextActive: {
    color: colors.light.primary,
    fontWeight: '700',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: colors.light.accent,
    borderRadius: 2,
  },
  listContent: {
    padding: 16,
    paddingBottom: 90,
  },
  postCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.light.border,
    backgroundColor: colors.light.surface,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  authorTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  authorInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.light.text,
  },
  institution: {
    fontSize: 12,
    color: colors.light.textMuted,
    marginTop: 2,
  },
  moreBtn: {
    padding: 4,
  },
  mediaContainer: {
    height: 200,
    backgroundColor: '#0D1A17',
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  mediaPlaceholder: {
    alignItems: 'center',
    gap: 8,
  },
  playIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.light.accent,
  },
  mediaNotice: {
    color: '#D4DDD9',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  captionTouch: {
    marginBottom: 8,
  },
  captionText: {
    fontSize: 15,
    color: colors.light.text,
    lineHeight: 22,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  tagText: {
    color: colors.light.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  actionsRail: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
    paddingTop: 12,
    marginTop: 4,
  },
  actionsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  actionCount: {
    fontSize: 13,
    color: colors.light.textSecondary,
    fontWeight: '600',
  },
  actionCountLiked: {
    color: '#B3261E',
  },
});
