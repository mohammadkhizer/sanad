import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../src/api';
import { colors } from '../../src/theme/colors';
import { Avatar } from '../../src/components/Avatar';
import { Card } from '../../src/components/Card';
import { EmptyState } from '../../src/components/EmptyState';
import { AppHeader } from '../../src/components/AppHeader';
import { Icon } from '../../src/components/Icon';
import { useAuthStore } from '../../src/store/authStore';
import { useRouter } from 'expo-router';
import { ConversationEntity } from '@sanad/shared';

export default function InboxScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [activeTab, setActiveTab] = useState<'all' | 'requests'>('all');

  const { data, isLoading, refetch } = useQuery<ConversationEntity[]>({
    queryKey: ['conversations', activeTab],
    queryFn: () => api.chat.getConversations(activeTab),
    enabled: isAuthenticated,
  });

  const respondMutation = useMutation({
    mutationFn: async ({ id, decision }: { id: string; decision: 'accepted' | 'declined' }) => {
      return api.chat.respondChatRequest(id, decision);
    },
    onSuccess: (_, { decision }) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      Alert.alert('Request Updated', `Consultation request has been ${decision}.`);
    },
  });

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <AppHeader title="Consultations" subtitle="Scholarly correspondence" />
        <View style={styles.center}>
          <Icon name="lock" size={40} color={colors.light.primary} />
          <Text style={styles.title}>Consultation Inbox</Text>
          <Text style={styles.sub}>
            Sign in to participate in 1:1 scholarly consultations and advisory inquiries.
          </Text>
          <TouchableOpacity
            style={styles.loginPill}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.loginText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const conversations = data || [];

  return (
    <View style={styles.container}>
      <AppHeader
        title="Consultations"
        subtitle="Direct scholarly correspondence"
        rightIcon="search"
      />

      {/* Classical Segmented Tab Switcher */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'all' && styles.tabItemActive]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
            Active Chats
          </Text>
          {activeTab === 'all' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'requests' && styles.tabItemActive]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[styles.tabText, activeTab === 'requests' && styles.tabTextActive]}>
            Inquiry Requests
          </Text>
          {activeTab === 'requests' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const other = item.participants.find((p) => p._id !== user?.id) || item.participants[0];
          const isRequest = item.isRequest && item.requestStatus === 'pending';

          return (
            <Card style={styles.itemCard}>
              <TouchableOpacity
                style={styles.itemTouch}
                activeOpacity={0.8}
                onPress={() => router.push(`/chat/${other?._id || item._id}`)}
              >
                <Avatar name={other?.displayName || 'User'} url={other?.avatarUrl} size={46} />
                <View style={styles.info}>
                  <View style={styles.topRow}>
                    <Text style={styles.name}>{other?.displayName || 'Scholar'}</Text>
                    {item.lastMessageAt && (
                      <Text style={styles.time}>
                        {new Date(item.lastMessageAt).toLocaleDateString()}
                      </Text>
                    )}
                  </View>

                  <Text style={styles.lastMsg} numberOfLines={1}>
                    {item.lastMessage?.body || 'Consultation initiated.'}
                  </Text>
                </View>

                {item.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{item.unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Scholar Action controls for pending inquiries */}
              {isRequest && (
                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={styles.declineBtn}
                    onPress={() => respondMutation.mutate({ id: item._id, decision: 'declined' })}
                  >
                    <Icon name="close" size={15} color="#B3261E" />
                    <Text style={styles.declineText}>Decline</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.acceptBtn}
                    onPress={() => respondMutation.mutate({ id: item._id, decision: 'accepted' })}
                  >
                    <Icon name="check" size={15} color={colors.light.accentText} />
                    <Text style={styles.acceptText}>Accept Inquiry</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Card>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            title={activeTab === 'requests' ? 'No Pending Requests' : 'Inbox Clear'}
            subtitle={
              activeTab === 'requests'
                ? 'Member inquiries awaiting scholarly consultation will appear here.'
                : 'No active conversations. Start a consultation from a scholar profile.'
            }
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
    backgroundColor: colors.light.background,
  },
  tabItem: {
    paddingVertical: 12,
    position: 'relative',
  },
  tabItemActive: {},
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.textMuted,
    letterSpacing: 0.3,
  },
  tabTextActive: {
    color: colors.light.primary,
    fontWeight: '700',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: colors.light.accent,
    borderRadius: 2,
  },
  list: {
    padding: 16,
    paddingBottom: 90,
  },
  itemCard: {
    padding: 14,
    marginBottom: 10,
    borderRadius: 12,
  },
  itemTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  info: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.light.text,
  },
  time: {
    fontSize: 11,
    color: colors.light.textMuted,
  },
  lastMsg: {
    fontSize: 13,
    color: colors.light.textSecondary,
    lineHeight: 18,
  },
  unreadBadge: {
    backgroundColor: colors.light.primary,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
    marginTop: 12,
    paddingTop: 12,
  },
  declineBtn: {
    flex: 1,
    height: 36,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#B3261E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  declineText: {
    color: '#B3261E',
    fontSize: 13,
    fontWeight: '700',
  },
  acceptBtn: {
    flex: 2,
    height: 36,
    borderRadius: 6,
    backgroundColor: colors.light.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  acceptText: {
    color: colors.light.accentText,
    fontSize: 13,
    fontWeight: '700',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light.text,
    marginTop: 8,
  },
  sub: {
    fontSize: 14,
    color: colors.light.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  loginPill: {
    marginTop: 16,
    backgroundColor: colors.light.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
