import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Share,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { api } from '../../src/api';
import { colors } from '../../src/theme/colors';
import { VerifiedBadge } from '../../src/components/VerifiedBadge';
import { Avatar } from '../../src/components/Avatar';
import { PostEntity } from '@sanad/shared';

const { height: WINDOW_HEIGHT } = Dimensions.get('window');
const REEL_HEIGHT = WINDOW_HEIGHT - 60; // minus bottom tab bar

export default function ReelsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isMuted, setIsMuted] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const lastTapRef = useRef<number>(0);

  const { data, isLoading } = useQuery<{ items: PostEntity[] }>({
    queryKey: ['reels'],
    queryFn: () => api.content.getReels({ limit: 20 }),
  });

  const likeMutation = useMutation({
    mutationFn: (postId: string) => api.content.likePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reels'] });
    },
  });

  const handleDoubleTap = (postId: string) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      likeMutation.mutate(postId);
    }
    lastTapRef.current = now;
  };

  const handleShare = async (item: PostEntity) => {
    try {
      await Share.share({
        message: `Sanad Lesson by ${typeof item.authorId === 'object' ? item.authorId.displayName : 'Verified Scholar'}: "${item.caption}"`,
      });
    } catch {
      // share dismissed
    }
  };

  const renderReel = ({ item }: { item: PostEntity }) => {
    const author = typeof item.authorId === 'object' ? item.authorId : null;
    const authorName = author?.displayName || 'Accredited Scholar';
    const institution = author?.scholarProfile?.institution || 'Verified Academy';

    return (
      <TouchableWithoutFeedback onPress={() => handleDoubleTap(item._id)}>
        <View style={styles.reelContainer}>
          {/* Simulated HLS Video Stream Container */}
          <View style={styles.videoPlayerArea}>
            <View style={styles.videoPlaceholder}>
              <View style={styles.playBadge}>
                <Text style={styles.playBadgeText}>[PLAYING HLS STREAM]</Text>
              </View>
              <Text style={styles.videoMetaText}>
                Mux Playback ID: {item.playbackId || 'hls_stream_verified_sanad'}
              </Text>
            </View>

            {/* Captions Overlay */}
            {showCaptions && (
              <View style={styles.captionsContainer}>
                <Text style={styles.captionsText}>"{item.caption}"</Text>
              </View>
            )}
          </View>

          {/* Top Bar Controls */}
          <View style={styles.topControls}>
            <Text style={styles.topHeader}>Sanad Short Lessons</Text>
            <View style={styles.topButtonsRow}>
              <TouchableOpacity
                style={styles.pillButton}
                onPress={() => setShowCaptions(!showCaptions)}
              >
                <Text style={styles.pillButtonText}>
                  {showCaptions ? '[CC ON]' : '[CC OFF]'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.pillButton}
                onPress={() => setIsMuted(!isMuted)}
              >
                <Text style={styles.pillButtonText}>
                  {isMuted ? '[MUTED]' : '[AUDIO ON]'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Right Action Rail */}
          <View style={styles.rightRail}>
            <TouchableOpacity
              style={styles.railItem}
              onPress={() => router.push(`/scholar/${author?._id || 'usr_scholar_1'}`)}
            >
              <Avatar name={authorName} url={author?.avatarUrl} size={48} />
              <View style={styles.railBadge}>
                <VerifiedBadge size="small" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.railItem}
              onPress={() => likeMutation.mutate(item._id)}
            >
              <View style={[styles.iconCircle, item.isLiked && styles.iconCircleActive]}>
                <Text style={[styles.iconText, item.isLiked && styles.iconTextActive]}>
                  {item.isLiked ? '[LIKED]' : '[LIKE]'}
                </Text>
              </View>
              <Text style={styles.railCount}>{item.counts.likes}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.railItem}
              onPress={() => router.push(`/post/${item._id}`)}
            >
              <View style={styles.iconCircle}>
                <Text style={styles.iconText}>[COMMENTS]</Text>
              </View>
              <Text style={styles.railCount}>{item.counts.comments}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.railItem} onPress={() => handleShare(item)}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconText}>[SHARE]</Text>
              </View>
              <Text style={styles.railCount}>{item.counts.shares}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.railItem}
              onPress={() => api.content.savePost(item._id)}
            >
              <View style={styles.iconCircle}>
                <Text style={styles.iconText}>[SAVE]</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Bottom Info Bar */}
          <View style={styles.bottomInfo}>
            <TouchableOpacity
              onPress={() => router.push(`/scholar/${author?._id || 'usr_scholar_1'}`)}
            >
              <View style={styles.authorRow}>
                <Text style={styles.authorName}>{authorName}</Text>
                <VerifiedBadge size="small" />
              </View>
              <Text style={styles.institutionText}>{institution}</Text>
            </TouchableOpacity>

            <Text style={styles.captionText} numberOfLines={2}>
              {item.caption}
            </Text>

            <View style={styles.tagsRow}>
              {item.tags.map((tag, idx) => (
                <Text key={idx} style={styles.tagPill}>
                  #{tag}
                </Text>
              ))}
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={data?.items || []}
        renderItem={renderReel}
        keyExtractor={(item) => item._id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={REEL_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E1512',
  },
  reelContainer: {
    height: REEL_HEIGHT,
    width: '100%',
    position: 'relative',
    backgroundColor: '#0E1512',
    justifyContent: 'space-between',
  },
  videoPlayerArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#122824',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholder: {
    alignItems: 'center',
    padding: 24,
  },
  playBadge: {
    backgroundColor: colors.light.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 8,
  },
  playBadgeText: {
    color: '#1F2933',
    fontWeight: '800',
    fontSize: 12,
  },
  videoMetaText: {
    color: '#A2B0A9',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  captionsContainer: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 80,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 8,
  },
  captionsText: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 54,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  topHeader: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  topButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pillButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#32473E',
  },
  pillButtonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  rightRail: {
    position: 'absolute',
    right: 12,
    bottom: 80,
    alignItems: 'center',
    gap: 16,
    zIndex: 10,
  },
  railItem: {
    alignItems: 'center',
  },
  railBadge: {
    marginTop: -8,
  },
  iconCircle: {
    backgroundColor: 'rgba(27, 59, 53, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#32473E',
    minWidth: 44,
    alignItems: 'center',
  },
  iconCircleActive: {
    backgroundColor: colors.light.accent,
    borderColor: colors.light.accentDark,
  },
  iconText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  iconTextActive: {
    color: '#1F2933',
  },
  railCount: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 3,
  },
  bottomInfo: {
    padding: 16,
    paddingBottom: 24,
    width: '78%',
    zIndex: 10,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  authorName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  institutionText: {
    color: '#A2B0A9',
    fontSize: 11,
    marginBottom: 8,
  },
  captionText: {
    color: '#F2EFE6',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagPill: {
    color: colors.light.accent,
    fontSize: 11,
    fontWeight: '600',
  },
});

