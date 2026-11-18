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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { api } from '../../src/api';
import { colors } from '../../src/theme/colors';
import { VerifiedBadge } from '../../src/components/VerifiedBadge';
import { Avatar } from '../../src/components/Avatar';
import { Icon } from '../../src/components/Icon';
import { PostEntity } from '@sanad/shared';

const { height: WINDOW_HEIGHT } = Dimensions.get('window');
const REEL_HEIGHT = WINDOW_HEIGHT - 64; // minus bottom tab bar

export default function ReelsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
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

  const saveMutation = useMutation({
    mutationFn: (postId: string) => api.content.savePost(postId),
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
                <Icon name="play" size={28} color="#FFFFFF" />
              </View>
              <Text style={styles.videoMetaText}>
                HLS Stream Verified
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
          <View style={[styles.topControls, { paddingTop: insets.top || 16 }]}>
            <Text style={styles.topHeader}>Short Lessons</Text>
            <View style={styles.topButtonsRow}>
              <TouchableOpacity
                style={[styles.pillButton, showCaptions && styles.pillButtonActive]}
                onPress={() => setShowCaptions(!showCaptions)}
              >
                <Text style={[styles.pillButtonText, showCaptions && styles.pillButtonTextActive]}>
                  CC
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.pillButton, isMuted && styles.pillButtonActive]}
                onPress={() => setIsMuted(!isMuted)}
              >
                <Icon
                  name={isMuted ? 'volume-mute' : 'volume-high'}
                  size={16}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Right Action Rail with Vector Icons */}
          <View style={styles.rightRail}>
            <TouchableOpacity
              style={styles.railItem}
              onPress={() => {
                if (author?._id) {
                  router.push(`/scholar/${author._id}`);
                }
              }}
            >
              <Avatar name={authorName} url={author?.avatarUrl} size={48} />
              <View style={styles.railBadge}>
                <VerifiedBadge size="small" showLabel={false} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.railItem}
              onPress={() => likeMutation.mutate(item._id)}
            >
              <View style={[styles.iconCircle, item.isLiked && styles.iconCircleActive]}>
                <Icon
                  name={item.isLiked ? 'heart' : 'heart-outline'}
                  size={24}
                  color={item.isLiked ? '#B3261E' : '#FFFFFF'}
                />
              </View>
              <Text style={styles.railCount}>{item.counts.likes}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.railItem}
              onPress={() => router.push(`/post/${item._id}`)}
            >
              <View style={styles.iconCircle}>
                <Icon name="comment" size={22} color="#FFFFFF" />
              </View>
              <Text style={styles.railCount}>{item.counts.comments}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.railItem}
              onPress={() => saveMutation.mutate(item._id)}
            >
              <View style={[styles.iconCircle, item.isSaved && styles.iconCircleActive]}>
                <Icon
                  name={item.isSaved ? 'bookmark' : 'bookmark-outline'}
                  size={22}
                  color={item.isSaved ? colors.light.accent : '#FFFFFF'}
                />
              </View>
              <Text style={styles.railCount}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.railItem} onPress={() => handleShare(item)}>
              <View style={styles.iconCircle}>
                <Icon name="share" size={22} color="#FFFFFF" />
              </View>
              <Text style={styles.railCount}>Share</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Scholar Info Overlay */}
          <View style={styles.bottomInfo}>
            <TouchableOpacity
              onPress={() => {
                if (author?._id) {
                  router.push(`/scholar/${author._id}`);
                }
              }}
            >
              <View style={styles.bottomAuthorRow}>
                <Text style={styles.bottomAuthorName}>{authorName}</Text>
                <VerifiedBadge size="small" />
              </View>
              <Text style={styles.bottomInstitution}>{institution}</Text>
            </TouchableOpacity>

            <Text style={styles.bottomCaption} numberOfLines={2}>
              {item.caption}
            </Text>

            {item.tags && item.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {item.tags.map((tag) => (
                  <Text key={tag} style={styles.bottomTag}>
                    #{tag}
                  </Text>
                ))}
              </View>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={data?.items || []}
        keyExtractor={(item) => item._id}
        renderItem={renderReel}
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
    backgroundColor: '#07100D',
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
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(15, 76, 69, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.light.accent,
    marginBottom: 12,
  },
  videoMetaText: {
    color: '#D0DDD7',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  captionsContainer: {
    position: 'absolute',
    bottom: 150,
    left: 20,
    right: 80,
    backgroundColor: 'rgba(7, 16, 13, 0.75)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(201, 162, 39, 0.3)',
  },
  captionsText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  topControls: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  topHeader: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  topButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pillButton: {
    backgroundColor: 'rgba(15, 76, 69, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillButtonActive: {
    backgroundColor: colors.light.accent,
    borderColor: colors.light.accent,
  },
  pillButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pillButtonTextActive: {
    color: colors.light.accentText,
  },
  rightRail: {
    position: 'absolute',
    right: 14,
    bottom: 40,
    alignItems: 'center',
    gap: 16,
    zIndex: 10,
  },
  railItem: {
    alignItems: 'center',
    position: 'relative',
  },
  railBadge: {
    position: 'absolute',
    bottom: -4,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(15, 76, 69, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 4,
  },
  iconCircleActive: {
    backgroundColor: 'rgba(201, 162, 39, 0.3)',
    borderColor: colors.light.accent,
  },
  railCount: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  bottomInfo: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    width: '80%',
    zIndex: 10,
  },
  bottomAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  bottomAuthorName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  bottomInstitution: {
    color: colors.light.accent,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  bottomCaption: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  bottomTag: {
    color: '#E0EDE8',
    fontSize: 12,
    fontWeight: '600',
  },
});
