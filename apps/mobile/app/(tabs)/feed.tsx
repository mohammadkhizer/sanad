import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { theme } from '../../src/theme/colors';
import { ReelCard } from '../../src/components/ReelCard';
import { ReportModal } from '../../src/components/ReportModal';
import { apiFetch } from '../../src/api/client';
import { useAuthStore } from '../../src/store/authStore';
import { ReportReason } from '@sanad/types';

export default function FeedScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [reportingPostId, setReportingPostId] = useState<string | null>(null);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['feed'],
    queryFn: async () => {
      const res = await apiFetch<any>('/feed?limit=20');
      return res.data;
    },
  });

  const likeMutation = useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: string; isLiked: boolean }) => {
      const method = isLiked ? 'DELETE' : 'POST';
      return apiFetch(`/posts/${postId}/like`, { method });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (postId: string) => {
      return apiFetch(`/posts/${postId}/save`, { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });

  const submitReportMutation = useMutation({
    mutationFn: async ({ reason, details }: { reason: ReportReason; details?: string }) => {
      if (!reportingPostId) return;
      return apiFetch('/reports', {
        method: 'POST',
        body: JSON.stringify({
          targetType: 'post',
          targetId: reportingPostId,
          reason,
          details,
        }),
      });
    },
    onSuccess: () => {
      Alert.alert(
        'Report Received',
        'Thank you. Our moderation team reviews all reports against verified scholarly standards within 24 hours.'
      );
    },
  });

  const isScholar = user?.roles?.includes('scholar');

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.brand.emerald} />
          <Text style={styles.loadingText}>Loading verified scholarly feed...</Text>
        </View>
      ) : (
        <FlatList
          data={data || []}
          keyExtractor={(item) => item.id || item._id}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={theme.colors.brand.emerald}
            />
          }
          renderItem={({ item }) => (
            <ReelCard
              id={item.id || item._id}
              author={
                item.authorId || {
                  id: 'unknown',
                  displayName: 'Verified Scholar',
                  institution: 'Institution',
                }
              }
              type={item.type || 'reel'}
              caption={item.caption || ''}
              tags={item.tags || []}
              counts={
                item.counts || {
                  likes: 0,
                  comments: 0,
                  views: 0,
                  shares: 0,
                }
              }
              onLikePress={() => {
                if (!isAuthenticated) {
                  router.push('/(auth)/login');
                  return;
                }
                likeMutation.mutate({ postId: item.id || item._id, isLiked: false });
              }}
              onCommentPress={() => {
                Alert.alert('Comments', 'Scholarly discussions are moderated for etiquette.');
              }}
              onSavePress={() => {
                if (!isAuthenticated) {
                  router.push('/(auth)/login');
                  return;
                }
                saveMutation.mutate(item.id || item._id);
              }}
              onSharePress={() => {
                Alert.alert('Share Link', 'Link to verified lecture copied.');
              }}
              onReportPress={() => setReportingPostId(item.id || item._id)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Published Content Yet</Text>
              <Text style={styles.emptySub}>
                Only verified religious scholars are permitted to publish content on Sanad.
              </Text>
            </View>
          }
        />
      )}

      {/* Floating Action Button for Verified Scholars */}
      {isScholar && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/scholar/upload')}
          accessibilityRole="button"
          accessibilityLabel="Publish new lecture or reel"
        >
          <Text style={styles.fabText}>+ Post</Text>
        </TouchableOpacity>
      )}

      {/* Report Modal */}
      <ReportModal
        visible={!!reportingPostId}
        targetType="post"
        targetId={reportingPostId || ''}
        onClose={() => setReportingPostId(null)}
        onSubmit={async (reason, details) => {
          await submitReportMutation.mutateAsync({ reason, details });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.light,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  loadingText: {
    color: theme.colors.text.secondaryLight,
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.sm,
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text.primaryLight,
  },
  emptySub: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondaryLight,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    backgroundColor: theme.colors.accent.gold,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: theme.radius.pill,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabText: {
    color: theme.colors.text.onGold,
    fontWeight: 'bold',
    fontSize: 15,
  },
});
