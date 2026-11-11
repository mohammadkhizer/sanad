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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../src/api';
import { colors } from '../../src/theme/colors';
import { VerifiedBadge } from '../../src/components/VerifiedBadge';
import { Avatar } from '../../src/components/Avatar';
import { Card } from '../../src/components/Card';
import { EmptyState } from '../../src/components/EmptyState';
import { ReportModal } from '../../src/components/ReportModal';
import { useAuthStore } from '../../src/store/authStore';
import { useRouter } from 'expo-router';
import { PostEntity } from '@sanad/shared';

export default function FeedScreen() {
  const queryClient = useQueryClient();
  const router = useRouter();
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
            onPress={() => router.push(isScholar ? `/scholar/${author?._id || 'usr_scholar_1'}` : `/profile/${author?._id || 'usr_scholar_1'}`)}
          >
            <Avatar name={authorName} url={author?.avatarUrl} size={40} />
            <View style={styles.authorInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.authorName}>{authorName}</Text>
                {isScholar && <VerifiedBadge size="small" />}
              </View>
              {Boolean(institution) && (
                <Text style={styles.institution}>{institution}</Text>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setReportTarget({ id: item._id, type: 'post' })}
            style={styles.moreBtn}
          >
            <Text style={styles.moreText}>[REPORT]</Text>
          </TouchableOpacity>
        </View>

        {/* Lesson Media Preview */}
        <TouchableOpacity
          style={styles.mediaContainer}
          activeOpacity={0.9}
          onPress={() => router.push(`/post/${item._id}`)}
        >
          <View style={styles.mediaHeaderRow}>
            <View style={styles.mediaBadge}>
              <Text style={styles.mediaBadgeText}>[{item.type.toUpperCase()} LESSON]</Text>
            </View>
            <Text style={styles.playbackIdText}>HLS Playback Ready</Text>
          </View>
          <Text style={styles.captionText}>{item.caption}</Text>
        </TouchableOpacity>

        {/* Topic Tags */}
        {item.tags?.length > 0 && (
          <View style={styles.tagsRow}>
            {item.tags.map((tag, idx) => (
              <Text key={idx} style={styles.tagText}>
                #{tag}
              </Text>
            ))}
          </View>
        )}

        {/* Social Actions Rail */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => likeMutation.mutate(item._id)}
          >
            <Text style={[styles.actionBtnText, item.isLiked && styles.actionBtnActive]}>
              {item.isLiked ? '[LIKED]' : '[LIKE]'} {item.counts.likes}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push(`/post/${item._id}`)}
          >
            <Text style={styles.actionBtnText}>
              [COMMENTS] {item.counts.comments}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleShare(item)}
          >
            <Text style={styles.actionBtnText}>[SHARE]</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => saveMutation.mutate(item._id)}
          >
            <Text style={[styles.actionBtnText, item.isSaved && styles.actionBtnActive]}>
              {item.isSaved ? '[SAVED]' : '[SAVE]'}
            </Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {/* Feed Tabs: Following vs Discover */}
      <View style={styles.feedTabs}>
        <TouchableOpacity
          style={[styles.feedTab, activeTab === 'discover' && styles.feedTabActive]}
          onPress={() => setActiveTab('discover')}
        >
          <Text style={[styles.feedTabText, activeTab === 'discover' && styles.feedTabTextActive]}>
            Discover Verified
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.feedTab, activeTab === 'following' && styles.feedTabActive]}
          onPress={() => setActiveTab('following')}
        >
          <Text style={[styles.feedTabText, activeTab === 'following' && styles.feedTabTextActive]}>
            Following
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data?.items || []}
        keyExtractor={(item) => item._id}
        renderItem={renderPost}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.light.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            title="Scholarly Feed Empty"
            description="Follow verified scholars or explore accredited lectures to populate your feed."
          />
        }
      />

      {reportTarget && (
        <ReportModal
          visible={Boolean(reportTarget)}
          targetType={reportTarget.type}
          targetId={reportTarget.id}
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
  feedTabs: {
    flexDirection: 'row',
    backgroundColor: colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  feedTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  feedTabActive: {
    borderBottomColor: colors.light.primary,
  },
  feedTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.light.textSecondary,
  },
  feedTabTextActive: {
    color: colors.light.primary,
    fontWeight: '800',
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  postCard: {
    padding: 16,
  },
  authorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorInfo: {
    marginLeft: 12,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.light.text,
  },
  institution: {
    fontSize: 12,
    color: colors.light.textSecondary,
    marginTop: 2,
  },
  moreBtn: {
    padding: 4,
  },
  moreText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.light.error,
  },
  mediaContainer: {
    backgroundColor: colors.light.surfaceElevated,
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.light.border,
    marginBottom: 10,
  },
  mediaHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mediaBadge: {
    backgroundColor: colors.light.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mediaBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.light.accentText,
  },
  playbackIdText: {
    fontSize: 10,
    color: colors.light.textMuted,
    fontFamily: 'monospace',
  },
  captionText: {
    fontSize: 13,
    color: colors.light.text,
    lineHeight: 19,
  },
  tagsRow: {
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
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
    paddingTop: 10,
  },
  actionBtn: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.light.textSecondary,
  },
  actionBtnActive: {
    color: colors.light.primary,
    fontWeight: '800',
  },
});
