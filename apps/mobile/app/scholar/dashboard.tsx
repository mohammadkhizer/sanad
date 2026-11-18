import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { AppHeader } from '../../src/components/AppHeader';
import { AccessGuard } from '../../src/components/AccessGuard';
import { Icon } from '../../src/components/Icon';
import { colors } from '../../src/theme/colors';
import { api } from '../../src/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PostEntity } from '@sanad/shared';

export default function ScholarDashboardScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: postsData } = useQuery<{ items: PostEntity[] }>({
    queryKey: ['scholarMyPosts'],
    queryFn: () => api.content.getFeed(),
  });

  const { data: profileData } = useQuery<any>({
    queryKey: ['myProfile'],
    queryFn: () => api.users.getMe(),
  });

  const { data: inquiriesData } = useQuery<any[]>({
    queryKey: ['scholarInquiries'],
    queryFn: () => api.chat.getConversations(),
  });

  const totalViews = (postsData?.items || []).reduce((acc, p) => acc + (p.counts?.views || 0), 0);
  const totalStudents = profileData?.counts?.followers ?? 0;
  const totalInquiries = (inquiriesData || []).length;

  const deletePostMutation = useMutation({
    mutationFn: (id: string) => api.content.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scholarMyPosts'] });
      Alert.alert('Lesson Removed', 'The lesson has been removed from the scholarly feed.');
    },
  });

  const handleDeletePrompt = (id: string, caption: string) => {
    Alert.alert(
      'Remove Lesson',
      `Are you sure you want to delete "${caption.slice(0, 40)}..."? This action is recorded.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => deletePostMutation.mutate(id),
        },
      ]
    );
  };

  return (
    <AccessGuard
      requiredRole="scholar"
      title="Scholar Studio"
      subtitle="Accredited Scholar Portal"
    >
      <View style={styles.screen}>
      <AppHeader
        title="Scholar Studio"
        subtitle="Curriculum and Teaching Control"
        showBack
        rightIcon="create"
        onRightPress={() => router.push('/(tabs)/create')}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Metric Cards */}
        <View style={styles.metricsRow}>
          <Card style={styles.metricCard}>
            <Text style={styles.metricVal}>{totalViews > 1000 ? `${(totalViews / 1000).toFixed(1)}K` : totalViews}</Text>
            <Text style={styles.metricLabel}>Total Views</Text>
            <View style={styles.metricAccent} />
          </Card>
          <Card style={styles.metricCard}>
            <Text style={styles.metricVal}>{totalStudents > 1000 ? `${(totalStudents / 1000).toFixed(1)}K` : totalStudents}</Text>
            <Text style={styles.metricLabel}>Students</Text>
            <View style={styles.metricAccent} />
          </Card>
          <Card style={styles.metricCard}>
            <Text style={styles.metricVal}>{totalInquiries}</Text>
            <Text style={styles.metricLabel}>Inquiries</Text>
            <View style={styles.metricAccent} />
          </Card>
        </View>

        {/* Published Curriculum Management */}
        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionTitle}>Published Curriculum</Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/create')}
              style={styles.newLessonLink}
            >
              <Icon name="plus" size={14} color={colors.light.primary} />
              <Text style={styles.newLessonText}>New Lesson</Text>
            </TouchableOpacity>
          </View>

          {(postsData?.items || []).map((post) => (
            <View key={post._id} style={styles.postItem}>
              <View style={styles.postInfo}>
                <View style={styles.postHeader}>
                  <View style={styles.typeBadge}>
                    <Text style={styles.postType}>{post.type.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.postDate}>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.postCaption} numberOfLines={2}>
                  {post.caption}
                </Text>
                <View style={styles.statsRow}>
                  <Text style={styles.postStats}>
                    {post.counts.likes} endorsements · {post.counts.comments} answers · {post.counts.views} views
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDeletePrompt(post._id, post.caption)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Icon name="trash" size={16} color={colors.light.error} />
              </TouchableOpacity>
            </View>
          ))}
        </Card>
      </ScrollView>
    </View>
    </AccessGuard>
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
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    padding: 14,
    alignItems: 'center',
    borderRadius: 12,
    position: 'relative',
  },
  metricVal: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.light.primary,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.light.textSecondary,
    marginTop: 2,
  },
  metricAccent: {
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.light.accent,
    marginTop: 8,
  },
  card: {
    padding: 16,
    borderRadius: 14,
    gap: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.light.error,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.light.primary,
  },
  liveTag: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.light.accentText,
    backgroundColor: colors.light.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.light.textSecondary,
    lineHeight: 18,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  flexBtn: {
    flex: 1,
  },
  newLessonLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(15, 76, 69, 0.08)',
  },
  newLessonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.light.primary,
  },
  postItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
    gap: 12,
  },
  postInfo: {
    flex: 1,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  typeBadge: {
    backgroundColor: 'rgba(15, 76, 69, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  postType: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.light.primary,
  },
  postDate: {
    fontSize: 11,
    color: colors.light.textMuted,
  },
  postCaption: {
    fontSize: 13,
    color: colors.light.text,
    lineHeight: 18,
    fontWeight: '600',
  },
  statsRow: {
    marginTop: 4,
  },
  postStats: {
    fontSize: 11,
    color: colors.light.textMuted,
  },
  deleteBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FDF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
});
