import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { theme } from '../theme/colors';
import { VerifiedBadge } from './VerifiedBadge';

interface ReelCardProps {
  id: string;
  author: {
    id: string;
    displayName: string;
    avatarUrl?: string;
    verified?: boolean;
    institution?: string;
  };
  type: 'reel' | 'video';
  caption: string;
  tags?: string[];
  counts: {
    likes: number;
    comments: number;
    views: number;
    shares: number;
  };
  isLiked?: boolean;
  isSaved?: boolean;
  onLikePress: () => void;
  onCommentPress: () => void;
  onSavePress: () => void;
  onSharePress: () => void;
  onReportPress: () => void;
}

const { width } = Dimensions.get('window');

export const ReelCard: React.FC<ReelCardProps> = ({
  author,
  type,
  caption,
  tags = [],
  counts,
  isLiked = false,
  isSaved = false,
  onLikePress,
  onCommentPress,
  onSavePress,
  onSharePress,
  onReportPress,
}) => {
  return (
    <View style={styles.card}>
      {/* Video Viewport Area */}
      <View style={styles.videoViewport}>
        <View style={styles.videoPlaceholder}>
          <Text style={styles.videoTypeLabel}>
            {type === 'reel' ? 'Short Reel' : 'Scholarly Lecture'}
          </Text>
          <Text style={styles.videoPlaceholderSub}>HLS Video Stream</Text>
        </View>

        {/* Action Sidebar */}
        <View style={styles.sidebar}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onLikePress}
            accessibilityRole="button"
            accessibilityLabel={`Like post. Current likes: ${counts.likes}`}
          >
            <View style={[styles.actionIconBox, isLiked ? styles.activeLikeBox : null]}>
              <Text style={[styles.actionIconText, isLiked ? styles.activeLikeText : null]}>
                {isLiked ? 'Liked' : 'Like'}
              </Text>
            </View>
            <Text style={styles.actionCount}>{counts.likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onCommentPress}
            accessibilityRole="button"
            accessibilityLabel={`Comments. Current: ${counts.comments}`}
          >
            <View style={styles.actionIconBox}>
              <Text style={styles.actionIconText}>Chat</Text>
            </View>
            <Text style={styles.actionCount}>{counts.comments}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onSavePress}
            accessibilityRole="button"
            accessibilityLabel="Save post"
          >
            <View style={[styles.actionIconBox, isSaved ? styles.activeSaveBox : null]}>
              <Text style={[styles.actionIconText, isSaved ? styles.activeSaveText : null]}>
                {isSaved ? 'Saved' : 'Save'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onSharePress}
            accessibilityRole="button"
            accessibilityLabel="Share post"
          >
            <View style={styles.actionIconBox}>
              <Text style={styles.actionIconText}>Share</Text>
            </View>
            <Text style={styles.actionCount}>{counts.shares}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={onReportPress}
            accessibilityRole="button"
            accessibilityLabel="Report content"
          >
            <View style={styles.reportBox}>
              <Text style={styles.reportText}>Report</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Content Overlay */}
        <View style={styles.contentOverlay}>
          <View style={styles.authorRow}>
            <View style={styles.authorAvatar}>
              <Text style={styles.authorInitial}>
                {author.displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.authorMeta}>
              <View style={styles.nameBadgeRow}>
                <Text style={styles.authorName}>{author.displayName}</Text>
                <View style={styles.badgeWrap}>
                  <VerifiedBadge size="sm" />
                </View>
              </View>
              {author.institution ? (
                <Text style={styles.authorInst}>{author.institution}</Text>
              ) : null}
            </View>
          </View>

          <Text style={styles.caption} numberOfLines={3}>
            {caption}
          </Text>

          {tags.length > 0 && (
            <View style={styles.tagsRow}>
              {tags.map((tag, idx) => (
                <Text key={idx} style={styles.tagText}>
                  #{tag}
                </Text>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: width,
    height: 520,
    backgroundColor: '#0E1512',
    position: 'relative',
    marginBottom: 12,
  },
  videoViewport: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholder: {
    flex: 1,
    width: '100%',
    backgroundColor: '#16231E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoTypeLabel: {
    color: theme.colors.accent.gold,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  videoPlaceholderSub: {
    color: '#8C9A94',
    fontSize: theme.typography.fontSize.xs,
    marginTop: 4,
  },
  sidebar: {
    position: 'absolute',
    right: 12,
    bottom: 40,
    alignItems: 'center',
    zIndex: 10,
  },
  actionBtn: {
    alignItems: 'center',
    marginBottom: 16,
  },
  actionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(15, 76, 69, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionIconText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  activeLikeBox: {
    backgroundColor: theme.colors.semantic.error,
  },
  activeLikeText: {
    color: '#FFFFFF',
  },
  activeSaveBox: {
    backgroundColor: theme.colors.accent.gold,
  },
  activeSaveText: {
    color: theme.colors.text.onGold,
  },
  reportBox: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  reportText: {
    color: '#E0E0E0',
    fontSize: 10,
  },
  actionCount: {
    color: '#FFFFFF',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  contentOverlay: {
    position: 'absolute',
    left: 16,
    bottom: 20,
    right: 70,
    zIndex: 10,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  authorAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.brand.emerald,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.accent.gold,
  },
  authorInitial: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  authorMeta: {
    marginLeft: 10,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  badgeWrap: {
    marginLeft: 6,
  },
  authorInst: {
    color: '#C0CAC5',
    fontSize: 11,
    marginTop: 1,
  },
  caption: {
    color: '#F8F5EE',
    fontSize: 14,
    lineHeight: 20,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  tagText: {
    color: theme.colors.accent.goldLight,
    fontSize: 12,
    marginRight: 8,
    fontWeight: '500',
  },
});
