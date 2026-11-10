import React, { useState } from 'react';
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

export default function InboxScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [activeTab, setActiveTab] = useState<'chats' | 'requests'>('chats');

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await apiFetch<any>('/conversations');
      return res.data;
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.authTitle}>Direct Scholarly Consultations</Text>
        <Text style={styles.authSub}>
          Sign in to ask verified religious scholars personal questions, request 1:1 guidance, or view consultations.
        </Text>
        <Button
          title="Sign In / Register"
          variant="primary"
          onPress={() => router.push('/(auth)/login')}
          style={styles.authBtn}
        />
      </View>
    );
  }

  const isScholar = user?.roles?.includes('scholar');

  return (
    <View style={styles.container}>
      {isScholar && (
        <View style={styles.segmentRow}>
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'chats' ? styles.segmentActive : null]}
            onPress={() => setActiveTab('chats')}
          >
            <Text
              style={[
                styles.segmentText,
                activeTab === 'chats' ? styles.segmentTextActive : null,
              ]}
            >
              Active Chats
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentBtn, activeTab === 'requests' ? styles.segmentActive : null]}
            onPress={() => setActiveTab('requests')}
          >
            <Text
              style={[
                styles.segmentText,
                activeTab === 'requests' ? styles.segmentTextActive : null,
              ]}
            >
              Pending Requests
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={conversations || []}
        keyExtractor={(item) => item.id || item._id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const otherParticipant =
            item.participants?.find((p: any) => p.id !== user?.id) || {
              displayName: 'Scholar / Learner',
            };

          return (
            <TouchableOpacity
              style={styles.chatCard}
              activeOpacity={0.85}
              onPress={() => {
                router.push({
                  pathname: '/chat/[id]',
                  params: {
                    id: item.id || item._id,
                    recipientName: otherParticipant.displayName,
                  },
                });
              }}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarInitial}>
                  {otherParticipant.displayName?.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={styles.chatInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{otherParticipant.displayName}</Text>
                  {otherParticipant.scholarProfile?.verified && (
                    <View style={styles.badgeWrap}>
                      <VerifiedBadge size="sm" />
                    </View>
                  )}
                </View>
                <Text style={styles.lastMessage} numberOfLines={1}>
                  {item.lastMessage || 'Consultation session started'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Consultations Yet</Text>
            <Text style={styles.emptySub}>
              Members can initiate consultation requests directly from a scholar profile card in the Scholars tab.
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  authTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text.primaryLight,
    textAlign: 'center',
  },
  authSub: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondaryLight,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    lineHeight: 22,
  },
  authBtn: {
    width: 220,
  },
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface.light,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  segmentActive: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.brand.emerald,
  },
  segmentText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondaryLight,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: theme.colors.brand.emerald,
    fontWeight: 'bold',
  },
  listContent: {
    padding: theme.spacing.base,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface.light,
    padding: theme.spacing.base,
    borderRadius: theme.radius.card,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.colors.brand.emerald,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  chatInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: 'bold',
    color: theme.colors.text.primaryLight,
  },
  badgeWrap: {
    marginLeft: 6,
  },
  lastMessage: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondaryLight,
    marginTop: 3,
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
