import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { colors } from '../../src/theme/colors';
import { api } from '../../src/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PostEntity } from '@sanad/shared';

export default function ScholarDashboardScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [liveTitle, setLiveTitle] = useState('');
  const [liveDesc, setLiveDesc] = useState('');

  const { data: postsData } = useQuery<{ items: PostEntity[] }>({
    queryKey: ['scholarMyPosts'],
    queryFn: () => api.content.getFeed(),
  });

  const goLiveMutation = useMutation({
    mutationFn: async () => {
      if (!liveTitle.trim()) {
        throw new Error('Please provide a title for your live circle');
      }
      return api.live.createLiveSession({
        title: liveTitle.trim(),
        description: liveDesc.trim() || undefined,
      });
    },
    onSuccess: (session) => {
      router.push(`/live/${session._id}`);
    },
    onError: (e: Error) => {
      Alert.alert('Error', e.message);
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: (id: string) => api.content.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scholarMyPosts'] });
      Alert.alert('Lesson Removed', 'The lesson has been removed from the scholarly feed.');
    },
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Scholar Control Panel</Text>

      {/* Analytics Cards */}
      <View style={styles.metricsRow}>
        <Card style={styles.metricCard}>
          <Text style={styles.metricVal}>18.4K</Text>
          <Text style={styles.metricLabel}>Total Views</Text>
        </Card>
        <Card style={styles.metricCard}>
          <Text style={styles.metricVal}>3.2K</Text>
          <Text style={styles.metricLabel}>Followers</Text>
        </Card>
        <Card style={styles.metricCard}>
          <Text style={styles.metricVal}>142</Text>
          <Text style={styles.metricLabel}>Inquiries</Text>
        </Card>
      </View>

      {/* Broadcast Launch Section */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Host Instant Live Circle</Text>
        <Text style={styles.sectionSubtitle}>
          Broadcast real-time video lectures to your followers with moderated Q&A.
        </Text>

        <Input
          label="Live Circle Title *"
          placeholder="e.g. Sahih al-Bukhari Book of Knowledge Masterclass"
          value={liveTitle}
          onChangeText={setLiveTitle}
        />

        <Input
          label="Description (Optional)"
          placeholder="Topics covered, Q&A guidelines..."
          value={liveDesc}
          onChangeText={setLiveDesc}
          multiline
        />

        <View style={styles.btnRow}>
          <Button
            title="Go Live Now"
            variant="accent"
            onPress={() => goLiveMutation.mutate()}
            loading={goLiveMutation.isPending}
            style={styles.flexBtn}
          />
          <Button
            title="Schedule Later"
            variant="outline"
            onPress={() => router.push('/scholar/schedule-live')}
            style={styles.flexBtn}
          />
        </View>
      </Card>

      {/* Published Content Management */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Published Lessons</Text>
        {(postsData?.items || []).map((post) => (
          <View key={post._id} style={styles.postItem}>
            <View style={styles.postInfo}>
              <View style={styles.postHeader}>
                <Text style={styles.postType}>[{post.type.toUpperCase()}]</Text>
                <Text style={styles.postDate}>
                  {new Date(post.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.postCaption} numberOfLines={2}>
                {post.caption}
              </Text>
              <Text style={styles.postStats}>
                {post.counts.likes} likes · {post.counts.comments} comments · {post.counts.views} views
              </Text>
            </View>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => deletePostMutation.mutate(post._id)}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}
      </Card>
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
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.light.primary,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricCard: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.light.primary,
  },
  metricLabel: {
    fontSize: 11,
    color: colors.light.textSecondary,
    marginTop: 2,
  },
  card: {
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.light.primary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.light.textSecondary,
    lineHeight: 16,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  flexBtn: {
    flex: 1,
  },
  postItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
    gap: 8,
  },
  postInfo: {
    flex: 1,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  postType: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.light.primary,
  },
  postDate: {
    fontSize: 10,
    color: colors.light.textSecondary,
  },
  postCaption: {
    fontSize: 13,
    color: colors.light.text,
    lineHeight: 18,
  },
  postStats: {
    fontSize: 11,
    color: colors.light.textMuted,
    marginTop: 2,
  },
  deleteBtn: {
    backgroundColor: '#FDE8E8',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.light.error,
  },
});
