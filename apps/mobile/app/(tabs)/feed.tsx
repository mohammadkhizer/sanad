import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../src/api/client';
import { colors } from '../../src/theme/colors';
import { VerifiedBadge } from '../../src/components/VerifiedBadge';
import { Avatar } from '../../src/components/Avatar';
import { Card } from '../../src/components/Card';
import { EmptyState } from '../../src/components/EmptyState';
import { useAuthStore } from '../../src/store/authStore';
import { useRouter } from 'expo-router';

interface PostItem {
  _id: string;
  type: 'reel' | 'video' | 'text';
  caption: string;
  tags: string[];
  counts: {
    likes: number;
    comments: number;
    views: number;
    shares: number;
  };
  authorId: {
    _id: string;
    displayName: string;
    avatarUrl?: string;
    scholarProfile?: {
      verified: boolean;
      institution?: string;
    };
  };
  createdAt: string;
}

export default function FeedScreen() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const { data, isLoading, refetch, isRefetching } = useQuery<{ posts: PostItem[] }>({
    queryKey: ['feed'],
    queryFn: () => apiClient<{ posts: PostItem[] }>('/feed?limit=20'),
  });

  const likeMutation = useMutation({
    mutationFn: (postId: string) =>
      apiClient(`/posts/${postId}/like`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });

  const renderPost = ({ item }: { item: PostItem }) => {
    const isScholar = Boolean(item.authorId?.scholarProfile?.verified);

    return (
      <Card style={styles.postCard}>
        {/* Header */}
        <View style={styles.authorRow}>
          <Avatar name={item.authorId.displayName} url={item.authorId.avatarUrl} size={40} />
          <View style={styles.authorInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.authorName}>{item.authorId.displayName}</Text>
              {isScholar && <VerifiedBadge size="small" />}
            </View>
            {Boolean(item.authorId.scholarProfile?.institution) && (
              <Text style={styles.institution}>
                {item.authorId.scholarProfile?.institution}
              </Text>
            )}
          </View>
        </View>

        {/* Media / Content placeholder */}
        <View style={styles.mediaContainer}>
          <Text style={styles.mediaTypeLabel}>
            [{item.type.toUpperCase()}]
          </Text>
          <Text style={styles.captionText}>{item.caption}</Text>
        </View>

        {/* Tags */}
        {item.tags?.length > 0 && (
          <View style={styles.tagsRow}>
            {item.tags.map((tag, idx) => (
              <Text key={idx} style={styles.tagText}>
                #{tag}
              </Text>
            ))}
          </View>
        )}

        {/* Interaction Bar */}
        <View style={styles.actionsBar}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              if (!isAuthenticated) {
                router.push('/(auth)/login');
                return;
              }
              likeMutation.mutate(item._id);
            }}
          >
            <Text style={styles.actionLabel}>Like ({item.counts.likes})</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionLabel}>Comments ({item.counts.comments})</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionLabel}>Share</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.light.primary} />
      </View>
    );
  }

  const posts = data?.posts || [];

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={renderPost}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.light.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            title="No verified content yet"
            subtitle="Verified scholars will publish authentic reels and lessons here."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.light.background,
  },
  list: {
    padding: 16,
  },
  postCard: {
    padding: 16,
    marginBottom: 16,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorInfo: {
    marginLeft: 12,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.light.text,
  },
  institution: {
    fontSize: 12,
    color: colors.light.textSecondary,
    marginTop: 2,
  },
  mediaContainer: {
    backgroundColor: colors.light.surfaceElevated,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  mediaTypeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.light.primary,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  captionText: {
    fontSize: 15,
    color: colors.light.text,
    lineHeight: 22,
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
  actionsBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
    paddingTop: 12,
    justifyContent: 'space-between',
  },
  actionBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionLabel: {
    fontSize: 13,
    color: colors.light.textSecondary,
    fontWeight: '600',
  },
});

