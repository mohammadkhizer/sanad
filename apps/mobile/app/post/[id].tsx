import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../src/api/client';
import { colors } from '../../src/theme/colors';
import { Avatar } from '../../src/components/Avatar';
import { VerifiedBadge } from '../../src/components/VerifiedBadge';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { ReportModal } from '../../src/components/ReportModal';
import { useAuthStore } from '../../src/store/authStore';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [commentText, setCommentText] = useState('');
  const [reportModalVisible, setReportModalVisible] = useState(false);

  const { data: postData, isLoading } = useQuery<{
    post: any;
    isLiked: boolean;
    isSaved: boolean;
  }>({
    queryKey: ['post', id],
    queryFn: () => apiClient(`/posts/${id}`),
  });

  const { data: commentsData } = useQuery<{ comments: any[] }>({
    queryKey: ['comments', id],
    queryFn: () => apiClient(`/posts/${id}/comments`),
  });

  const likeMutation = useMutation({
    mutationFn: (currentlyLiked: boolean) =>
      apiClient(`/posts/${id}/like`, {
        method: currentlyLiked ? 'DELETE' : 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', id] });
    },
  });

  const saveMutation = useMutation({
    mutationFn: () => apiClient(`/posts/${id}/save`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', id] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: (text: string) =>
      apiClient(`/posts/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text }),
      }),
    onSuccess: () => {
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
      queryClient.invalidateQueries({ queryKey: ['post', id] });
    },
  });

  const handleAddComment = () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    if (!commentText.trim()) return;
    commentMutation.mutate(commentText.trim());
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.light.primary} />
      </View>
    );
  }

  const post = postData?.post;
  if (!post) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Post not found.</Text>
      </View>
    );
  }

  const comments = commentsData?.comments || [];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Post Card */}
        <Card style={styles.postCard}>
          <TouchableOpacity
            style={styles.authorRow}
            onPress={() => router.push(`/scholar/${post.authorId._id}`)}
          >
            <Avatar name={post.authorId.displayName} url={post.authorId.avatarUrl} size={44} />
            <View style={styles.authorInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{post.authorId.displayName}</Text>
                {post.authorId.scholarProfile?.verified && <VerifiedBadge size="small" />}
              </View>
              {Boolean(post.authorId.scholarProfile?.institution) && (
                <Text style={styles.institution}>{post.authorId.scholarProfile?.institution}</Text>
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.mediaBox}>
            <Text style={styles.typeTag}>[{post.type.toUpperCase()}]</Text>
            <Text style={styles.caption}>{post.caption}</Text>
          </View>

          {/* Action Row */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => likeMutation.mutate(Boolean(postData?.isLiked))}
            >
              <Text
                style={[
                  styles.actionText,
                  postData?.isLiked && styles.actionTextActive,
                ]}
              >
                Like ({post.counts.likes})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => saveMutation.mutate()}
            >
              <Text
                style={[
                  styles.actionText,
                  postData?.isSaved && styles.actionTextActive,
                ]}
              >
                {postData?.isSaved ? 'Saved' : 'Save'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => setReportModalVisible(true)}
            >
              <Text style={styles.actionText}>Report</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Comments Section */}
        <Text style={styles.commentsHeader}>Comments & Inquiries ({comments.length})</Text>

        {comments.map((c: any) => (
          <Card key={c._id} style={styles.commentCard}>
            <View style={styles.commentHeader}>
              <Text style={styles.commentAuthor}>{c.userId.displayName}</Text>
              {c.userId.scholarProfile?.verified && <VerifiedBadge size="small" />}
            </View>
            <Text style={styles.commentBody}>{c.text}</Text>
          </Card>
        ))}
      </ScrollView>

      {/* Add comment input */}
      <View style={styles.commentInputBar}>
        <TextInput
          style={styles.input}
          placeholder="Add a respectful comment or question..."
          placeholderTextColor={colors.light.textMuted}
          value={commentText}
          onChangeText={setCommentText}
        />
        <Button
          title="Post"
          onPress={handleAddComment}
          loading={commentMutation.isPending}
          disabled={!commentText.trim()}
          style={styles.postBtn}
        />
      </View>

      <ReportModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
        targetType="post"
        targetId={id}
      />
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
    paddingBottom: 80,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFound: {
    fontSize: 15,
    color: colors.light.textSecondary,
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
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.light.text,
  },
  institution: {
    fontSize: 12,
    color: colors.light.textSecondary,
    marginTop: 2,
  },
  mediaBox: {
    backgroundColor: colors.light.surfaceElevated,
    padding: 16,
    borderRadius: 8,
    marginBottom: 14,
  },
  typeTag: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.light.primary,
    marginBottom: 6,
  },
  caption: {
    fontSize: 15,
    color: colors.light.text,
    lineHeight: 22,
  },
  actionRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
    paddingTop: 12,
    justifyContent: 'space-around',
  },
  actionBtn: {
    padding: 6,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.light.textSecondary,
  },
  actionTextActive: {
    color: colors.light.primary,
    fontWeight: '700',
  },
  commentsHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.light.primary,
    marginBottom: 12,
  },
  commentCard: {
    padding: 12,
    marginBottom: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.light.text,
  },
  commentBody: {
    fontSize: 14,
    color: colors.light.text,
    lineHeight: 18,
  },
  commentInputBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.light.surface,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: colors.light.background,
    height: 42,
    borderRadius: 21,
    paddingHorizontal: 16,
    fontSize: 14,
    color: colors.light.text,
  },
  postBtn: {
    height: 42,
    paddingHorizontal: 18,
  },
});

