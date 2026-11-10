import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { theme } from '../../src/theme/colors';
import { Button } from '../../src/components/Button';
import { VerifiedBadge } from '../../src/components/VerifiedBadge';
import { apiFetch } from '../../src/api/client';
import { useAuthStore } from '../../src/store/authStore';

export default function LiveScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { data: activeLives, isLoading, refetch } = useQuery({
    queryKey: ['activeLives'],
    queryFn: async () => {
      const res = await apiFetch<any>('/live');
      return res.data;
    },
  });

  const isScholar = user?.roles?.includes('scholar');

  const handleStartLive = async () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }

    if (!user?.twoFA?.enabled) {
      Alert.alert(
        '2FA Required',
        'Two-factor authentication must be enabled before broadcasting live.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Set Up 2FA', onPress: () => router.push('/(tabs)/profile') },
        ]
      );
      return;
    }

    try {
      const res = await apiFetch<any>('/live', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Live Scholarly Q&A & Hadith Study',
          description: 'Open verified session with the community.',
        }),
      });

      router.push({
        pathname: '/live/[id]',
        params: { id: res.data.session.id, isHost: 'true' },
      });
    } catch (err: any) {
      Alert.alert('Unable to Broadcast', err.message || 'Error initializing live session.');
    }
  };

  return (
    <View style={styles.container}>
      {isScholar && (
        <View style={styles.scholarBanner}>
          <View style={styles.bannerInfo}>
            <Text style={styles.bannerTitle}>Host a Live Session</Text>
            <Text style={styles.bannerSub}>
              Conduct real-time scholarly lectures and answer community questions.
            </Text>
          </View>
          <Button
            title="Go Live"
            variant="accent"
            size="sm"
            pill
            onPress={handleStartLive}
          />
        </View>
      )}

      <FlatList
        data={activeLives || []}
        keyExtractor={(item) => item.id || item._id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.liveCard}
            activeOpacity={0.85}
            onPress={() => {
              router.push({
                pathname: '/live/[id]',
                params: { id: item.id || item._id, isHost: 'false' },
              });
            }}
          >
            <View style={styles.livePreview}>
              <View style={styles.liveBadge}>
                <Text style={styles.liveBadgeText}>LIVE</Text>
              </View>
              <Text style={styles.livePreviewText}>Scholarly Broadcast</Text>
            </View>

            <View style={styles.liveDetails}>
              <Text style={styles.liveTitle} numberOfLines={2}>
                {item.title}
              </Text>

              <View style={styles.hostRow}>
                <Text style={styles.hostName}>
                  {item.hostId?.displayName || 'Verified Scholar'}
                </Text>
                <View style={styles.badgeWrap}>
                  <VerifiedBadge size="sm" />
                </View>
              </View>

              {item.hostId?.scholarProfile?.institution ? (
                <Text style={styles.hostInst}>
                  {item.hostId.scholarProfile.institution}
                </Text>
              ) : null}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Live Broadcasts Right Now</Text>
            <Text style={styles.emptySub}>
              Verified scholars broadcast scheduled lectures and live Q&A sessions. Notifications will alert you when followed scholars go live.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.light,
  },
  scholarBanner: {
    backgroundColor: theme.colors.brand.emerald,
    padding: theme.spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerInfo: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: theme.typography.fontSize.base,
  },
  bannerSub: {
    color: '#D8E2DF',
    fontSize: theme.typography.fontSize.xs,
    marginTop: 2,
  },
  listContent: {
    padding: theme.spacing.base,
  },
  liveCard: {
    backgroundColor: theme.colors.surface.light,
    borderRadius: theme.radius.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    marginBottom: theme.spacing.base,
  },
  livePreview: {
    height: 180,
    backgroundColor: '#12231E',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  liveBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: theme.colors.semantic.error,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  liveBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  livePreviewText: {
    color: theme.colors.accent.gold,
    fontSize: 16,
    fontWeight: 'bold',
  },
  liveDetails: {
    padding: theme.spacing.base,
  },
  liveTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: 'bold',
    color: theme.colors.text.primaryLight,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  hostName: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondaryLight,
    fontWeight: '600',
  },
  badgeWrap: {
    marginLeft: 6,
  },
  hostInst: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.muted,
    marginTop: 2,
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
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
});
