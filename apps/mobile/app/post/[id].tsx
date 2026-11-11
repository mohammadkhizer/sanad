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
import { api } from '../../src/api';
import { colors } from '../../src/theme/colors';
import { Avatar } from '../../src/components/Avatar';
import { VerifiedBadge } from '../../src/components/VerifiedBadge';
import { Card } from '../../src/components/Card';
import { ReportModal } from '../../src/components/ReportModal';
import { useAuthStore } from '../../src/store/authStore';
import { PostEntity, CommentEntity } from '@sanad/shared';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [commentText, setCommentText] = useState('');
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const isScholar = Boolean(user?.roles?.includes('scholar') || user?.roles?.includes('admin'));

  const { data: post, isLoading } = useQuery<PostEntity>({
    queryKey: ['post', id],
    queryFn: () => api.content.getPost(id || 'post_reel_101'),
  });

  const { data: comments } = useQuery<CommentEntity[]>({
    queryKey: ['comments', id],
    queryFn: () => api.content.getComments(id || 'post_reel_101'),
  });

  const likeMutation = useMutation({
    mutationFn: () => api.content.likePost(id || 'post_reel_101'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', id] });
    },
  });

  const saveMutation = useMutation({
    mutationFn: () => api.content.savePost(id || 'post_reel_101'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', id] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: (text: string) =>
      api.content.addComment(id || 'post_reel_101', { text }),
    onSuccess: () => {
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
      queryClient.invalidateQueries({ queryKey: ['post', id] });
    },
  });

  const pinCommentMutation = useMutation({
    mutationFn: (commentId: string) =>
      api.content.pinComment(id || 'post_reel_101', commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
    },
  });

  const hideCommentMutation = useMutation({
    mutationFn: (commentId: string) =>
      api.content.hideComment(id || 'post_reel_101', commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
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

  if (isLoading || !post) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.light.primary} />
      </View>
    );
  }

  const author = typeof post.authorId === 'object' ? post.authorId : null;
  const authorName = author?.displayName || 'Scholar Teacher';
  const authorIsScholar = Boolean(author?.scholarProfile?.verified);
  const commentsList = comments || [];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Author Header */}
        <Card style={styles.authorCard}>
          <View style={styles.authorRow}>
            <Avatar name={authorName} url={author?.avatarUrl} size={48} />
            <View style={styles.authorInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.authorName}>{authorName}</Text>
                {authorIsScholar && <VerifiedBadge size="small" />}
              </View>
              {Boolean(author?.scholarProfile?.institution) && (
                <Text style={styles.institution}>{author?.scholarProfile?.institution}</Text>
              )}
            </View>
            <TouchableOpacity onPress={() => setReportModalVisible(true)}>
              <Text style={styles.reportText}>[REPORT]</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Media Preview Box */}
        <View style={styles.mediaContainer}>
          <View style={styles.mediaHeader}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>[{post.type.toUpperCase()} LESSON]</Text>
            </View>
            <Text style={styles.hlsText}>HLS Transcoded Stream</Text>
          </View>
          <Text style={styles.captionText}>{post.caption}</Text>

          {post.tags?.length > 0 && (
            <View style={styles.tagsRow}>
              {post.tags.map((tag, idx) => (
                <Text key={idx} style={styles.tagText}>
                  #{tag}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* Social Metrics Bar */}
        <View style={styles.metricsBar}>
          <TouchableOpacity style={styles.metricBtn} onPress={() => likeMutation.mutate()}>
            <Text style={[styles.metricText, post.isLiked && styles.metricTextActive]}>
              {post.isLiked ? '[LIKED]' : '[LIKE]'} {post.counts.likes}
            </Text>
          </TouchableOpacity>

          <View style={styles.metricBtn}>
            <Text style={styles.metricText}>
              [COMMENTS] {post.counts.comments}
            </Text>
          </View>

          <TouchableOpacity style={styles.metricBtn} onPress={() => saveMutation.mutate()}>
            <Text style={[styles.metricText, post.isSaved && styles.metricTextActive]}>
              {post.isSaved ? '[SAVED]' : '[SAVE]'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsHeader}>
            Scholarly Discussion & Inquiries ({commentsList.length})
          </Text>

          {commentsList.map((cmt) => {
            const cmtUser = typeof cmt.userId === 'object' ? cmt.userId : null;
            const cmtName = cmtUser?.displayName || 'Learner';
            const cmtIsScholar = Boolean(cmtUser?.scholarProfile?.verified || cmtUser?.roles?.includes('scholar'));
            const isPinned = cmt.status === 'pinned';
            const isHidden = cmt.status === 'hidden';

            if (isHidden && !isScholar) return null;

            return (
              <Card key={cmt._id} style={[styles.commentCard, isPinned && styles.commentPinned]}>
                <View style={styles.commentHeader}>
                  <View style={styles.commentUser}>
                    <Avatar name={cmtName} url={cmtUser?.avatarUrl} size={32} />
                    <View>
                      <View style={styles.nameRow}>
                        <Text style={styles.commentUserName}>{cmtName}</Text>
                        {cmtIsScholar && <VerifiedBadge size="small" />}
                      </View>
                      <Text style={styles.commentTime}>
                        {new Date(cmt.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>

                  {isPinned && (
                    <View style={styles.pinnedBadge}>
                      <Text style={styles.pinnedText}>[PINNED BY SCHOLAR]</Text>
                    </View>
                  )}
                </View>

                <Text style={[styles.commentBody, isHidden && styles.commentBodyHidden]}>
                  {isHidden ? '[Comment hidden by scholar]' : cmt.text}
                </Text>

                {/* Scholar Moderation Controls */}
                {isScholar && (
                  <View style={styles.scholarControls}>
                    {!isPinned && (
                      <TouchableOpacity onPress={() => pinCommentMutation.mutate(cmt._id)}>
                        <Text style={styles.controlText}>[PIN]</Text>
                      </TouchableOpacity>
                    )}
                    {!isHidden && (
                      <TouchableOpacity onPress={() => hideCommentMutation.mutate(cmt._id)}>
                        <Text style={styles.controlText}>[HIDE]</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </Card>
            );
          })}
        </View>
      </ScrollView>

      {/* Comment Input Bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.inputField}
          placeholder="Ask a scholarly question or provide reference..."
          placeholderTextColor={colors.light.textMuted}
          value={commentText}
          onChangeText={setCommentText}
          multiline
        />
        <TouchableOpacity
          style={styles.sendBtn}
          onPress={handleAddComment}
          disabled={commentMutation.isPending}
        >
          <Text style={styles.sendBtnText}>Post</Text>
        </TouchableOpacity>
      </View>

      {reportModalVisible && (
        <ReportModal
          visible={reportModalVisible}
          targetType="post"
          targetId={post._id}
          onClose={() => setReportModalVisible(false)}
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
  content: {
    padding: 16,
    paddingBottom: 80,
    gap: 14,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorCard: {
    padding: 14,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 15,
    fontWeight: '800',
    color: colors.light.text,
  },
  institution: {
    fontSize: 12,
    color: colors.light.primary,
    marginTop: 2,
  },
  reportText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.light.error,
  },
  mediaContainer: {
    backgroundColor: colors.light.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.light.border,
    gap: 10,
  },
  mediaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: colors.light.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.light.accentText,
  },
  hlsText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: colors.light.textMuted,
  },
  captionText: {
    fontSize: 14,
    color: colors.light.text,
    lineHeight: 21,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.light.primary,
  },
  metricsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.light.surface,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  metricBtn: {
    paddingHorizontal: 8,
  },
  metricText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.light.textSecondary,
  },
  metricTextActive: {
    color: colors.light.primary,
    fontWeight: '800',
  },
  commentsSection: {
    gap: 10,
  },
  commentsHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.light.primary,
    marginTop: 4,
  },
  commentCard: {
    padding: 12,
    gap: 6,
  },
  commentPinned: {
    borderColor: colors.light.accent,
    backgroundColor: '#FAF7EE',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentUserName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.light.text,
  },
  commentTime: {
    fontSize: 10,
    color: colors.light.textMuted,
  },
  pinnedBadge: {
    backgroundColor: colors.light.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pinnedText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.light.accentText,
  },
  commentBody: {
    fontSize: 13,
    color: colors.light.text,
    lineHeight: 18,
  },
  commentBodyHidden: {
    fontStyle: 'italic',
    color: colors.light.textMuted,
  },
  scholarControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 4,
  },
  controlText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.light.primary,
  },
  inputBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.light.surface,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inputField: {
    flex: 1,
    backgroundColor: colors.light.surfaceElevated,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.light.text,
    maxHeight: 80,
  },
  sendBtn: {
    backgroundColor: colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  sendBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
