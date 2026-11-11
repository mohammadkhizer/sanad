import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../src/api';
import { colors } from '../../src/theme/colors';
import { Avatar } from '../../src/components/Avatar';
import { VerifiedBadge } from '../../src/components/VerifiedBadge';
import { Card } from '../../src/components/Card';
import { AppHeader } from '../../src/components/AppHeader';
import { Icon } from '../../src/components/Icon';
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

  const handleShare = async () => {
    if (!post) return;
    try {
      await Share.share({
        message: `Sanad Lesson: "${post.caption}"`,
      });
    } catch {
      // share dismissed
    }
  };

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
  const authorName = author?.displayName || 'Accredited Scholar';
  const isPostAuthorScholar = Boolean(author?.scholarProfile?.verified);

  return (
    <View style={styles.container}>
      <AppHeader
        title="Scholarly Lesson"
        subtitle={post.type === 'reel' ? 'Short-Form Reel' : 'Masterclass Lecture'}
        showBack
        rightIcon="share"
        onRightPress={handleShare}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Author Card */}
        <Card style={styles.authorCard}>
          <TouchableOpacity
            style={styles.authorRow}
            onPress={() => router.push(`/scholar/${author?._id || 'usr_scholar_1'}`)}
            activeOpacity={0.8}
          >
            <Avatar name={authorName} url={author?.avatarUrl} size={48} />
            <View style={styles.authorInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.authorName}>{authorName}</Text>
                {isPostAuthorScholar && <VerifiedBadge size="small" />}
              </View>
              <Text style={styles.authorInst}>
                {author?.scholarProfile?.institution || 'Accredited Academy'}
              </Text>
            </View>
          </TouchableOpacity>
        </Card>

        {/* Video Player Mockup Container */}
        {post.type !== 'text' && (
          <View style={styles.playerContainer}>
            <View style={styles.playerBox}>
              <View style={styles.playIconContainer}>
                <Icon name="play" size={28} color="#FFFFFF" />
              </View>
              <Text style={styles.playerNotice}>HLS Stream Active</Text>
              <Text style={styles.playerSub}>Playback ID: {post.playbackId}</Text>
            </View>
          </View>
        )}

        {/* Caption & Post Body */}
        <Card style={styles.bodyCard}>
          <Text style={styles.caption}>{post.caption}</Text>

          {post.tags && post.tags.length > 0 && (
            <View style={styles.tagRow}>
              {post.tags.map((tag) => (
                <Text key={tag} style={styles.tag}>
                  #{tag}
                </Text>
              ))}
            </View>
          )}

          {/* Social Stats and Action Buttons */}
          <View style={styles.actionsBar}>
            <View style={styles.actionsLeft}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => likeMutation.mutate()}
                disabled={likeMutation.isPending}
              >
                <Icon
                  name={post.isLiked ? 'heart' : 'heart-outline'}
                  size={22}
                  color={post.isLiked ? '#B3261E' : colors.light.textSecondary}
                />
                <Text style={[styles.actionCount, post.isLiked && styles.actionCountLiked]}>
                  {post.counts.likes}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
                <Icon name="share" size={20} color={colors.light.textSecondary} />
                <Text style={styles.actionCount}>Share</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
            >
              <Icon
                name={post.isSaved ? 'bookmark' : 'bookmark-outline'}
                size={22}
                color={post.isSaved ? colors.light.accent : colors.light.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Comments Section */}
        <View style={styles.commentsHeader}>
          <Text style={styles.commentsTitle}>Scholarly Notes & Comments ({comments?.length || 0})</Text>
        </View>

        {(comments || []).map((comm) => {
          const commUser = typeof comm.userId === 'object' ? comm.userId : null;
          const commUserName = commUser?.displayName || 'Student of Knowledge';
          const isCommScholar = Boolean(commUser?.scholarProfile?.verified);
          const isPinned = comm.status === 'pinned';

          return (
            <Card
              key={comm._id}
              style={[
                styles.commentCard,
                isPinned && styles.pinnedCommentCard,
              ]}
            >
              <View style={styles.commentHeader}>
                <Avatar name={commUserName} url={commUser?.avatarUrl} size={32} />
                <View style={styles.commentAuthorCol}>
                  <View style={styles.commentNameRow}>
                    <Text style={styles.commentAuthorName}>{commUserName}</Text>
                    {isCommScholar && <VerifiedBadge size="small" />}
                    {isPinned && (
                      <View style={styles.pinnedBadge}>
                        <Icon name="bookmark" size={12} color={colors.light.accentText} />
                        <Text style={styles.pinnedText}>PINNED</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.commentDate}>
                    {new Date(comm.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              <Text style={styles.commentText}>{comm.text}</Text>

              {/* Scholar moderation tools */}
              {isScholar && (
                <View style={styles.moderationRow}>
                  <TouchableOpacity
                    onPress={() => pinCommentMutation.mutate(comm._id)}
                    style={styles.modAction}
                  >
                    <Icon name="bookmark" size={14} color={colors.light.accent} />
                    <Text style={styles.modActionText}>{isPinned ? 'Unpin' : 'Pin Note'}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => hideCommentMutation.mutate(comm._id)}
                    style={styles.modAction}
                  >
                    <Icon name="close" size={14} color="#B3261E" />
                    <Text style={[styles.modActionText, { color: '#B3261E' }]}>Hide</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Card>
          );
        })}
      </ScrollView>

      {/* Comment Input Footer */}
      <View style={styles.commentInputContainer}>
        <TextInput
          placeholder={isAuthenticated ? 'Write a respectful scholarly reflection...' : 'Log in to join the conversation'}
          placeholderTextColor={colors.light.textMuted}
          value={commentText}
          onChangeText={setCommentText}
          style={styles.commentInput}
          editable={isAuthenticated}
        />
        <TouchableOpacity
          style={[styles.sendButton, !commentText.trim() && styles.sendButtonDisabled]}
          onPress={handleAddComment}
          disabled={!commentText.trim() || commentMutation.isPending}
        >
          <Icon name="check" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Report Modal */}
      {reportModalVisible && (
        <ReportModal
          visible={reportModalVisible}
          targetId={post._id}
          targetType="post"
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
    paddingBottom: 90,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorCard: {
    padding: 14,
    marginBottom: 12,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  authorInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.light.text,
  },
  authorInst: {
    fontSize: 12,
    color: colors.light.accent,
    fontWeight: '600',
  },
  playerContainer: {
    height: 220,
    backgroundColor: '#0D1A17',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  playerBox: {
    alignItems: 'center',
    gap: 8,
  },
  playIconContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.light.accent,
  },
  playerNotice: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  playerSub: {
    color: colors.light.textMuted,
    fontSize: 11,
  },
  bodyCard: {
    padding: 16,
    marginBottom: 16,
  },
  caption: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.light.text,
    marginBottom: 12,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  tag: {
    color: colors.light.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
    paddingTop: 14,
  },
  actionsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionCount: {
    fontSize: 13,
    color: colors.light.textSecondary,
    fontWeight: '600',
  },
  actionCountLiked: {
    color: '#B3261E',
  },
  commentsHeader: {
    marginBottom: 12,
  },
  commentsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.light.primary,
  },
  commentCard: {
    padding: 14,
    marginBottom: 10,
  },
  pinnedCommentCard: {
    borderColor: colors.light.accent,
    backgroundColor: '#FAF7EE',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  commentAuthorCol: {
    flex: 1,
  },
  commentNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  commentAuthorName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.light.text,
  },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.light.accent,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  pinnedText: {
    color: colors.light.accentText,
    fontSize: 9,
    fontWeight: '800',
  },
  commentDate: {
    fontSize: 11,
    color: colors.light.textMuted,
    marginTop: 1,
  },
  commentText: {
    fontSize: 14,
    color: colors.light.text,
    lineHeight: 20,
  },
  moderationRow: {
    flexDirection: 'row',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
    marginTop: 10,
    paddingTop: 8,
  },
  modAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modActionText: {
    fontSize: 12,
    color: colors.light.accent,
    fontWeight: '600',
  },
  commentInputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.light.surface,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  commentInput: {
    flex: 1,
    height: 44,
    backgroundColor: colors.light.surfaceElevated,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.light.border,
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.light.text,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.light.border,
  },
});
