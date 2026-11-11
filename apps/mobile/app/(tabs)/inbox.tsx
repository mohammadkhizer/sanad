import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../src/api';
import { colors } from '../../src/theme/colors';
import { Avatar } from '../../src/components/Avatar';
import { Card } from '../../src/components/Card';
import { EmptyState } from '../../src/components/EmptyState';
import { Button } from '../../src/components/Button';
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
      <View style={styles.center}>
        <Text style={styles.title}>Consultation Inbox</Text>
        <Text style={styles.sub}>
          Please log in to participate in scholarly consultation and Q&A inquiries.
        </Text>
        <TouchableOpacity
          style={styles.loginPill}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.loginText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const conversations = data || [];

  return (
    <View style={styles.container}>
      {/* Tabs: Conversations vs Requests */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'all' && styles.tabItemActive]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
            Active Chats
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'requests' && styles.tabItemActive]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[styles.tabText, activeTab === 'requests' && styles.tabTextActive]}>
            Inquiry Requests
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const otherParticipant = item.participants.find(
            (p) => p._id !== user?.id
          ) || item.participants[0] || { displayName: 'Scholar / Learner' };

          return (
            <Card style={styles.convCard}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => router.push(`/chat/${item._id}`)}
              >
                <View style={styles.row}>
                  <Avatar
                    name={otherParticipant.displayName}
                    url={otherParticipant.avatarUrl}
                    size={48}
                  />
                  <View style={styles.info}>
                    <View style={styles.nameRow}>
                      <Text style={styles.name}>{otherParticipant.displayName}</Text>
                      {item.unreadCount > 0 && (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadText}>[{item.unreadCount} NEW]</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.lastMsg} numberOfLines={2}>
                      {item.lastMessage?.body || 'Consultation session initialized'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {item.isRequest && item.requestStatus === 'pending' && (
                <View style={styles.requestActions}>
                  <Text style={styles.requestNote}>Incoming Scholarly Inquiry:</Text>
                  <View style={styles.actionBtnRow}>
                    <Button
                      title="Accept Inquiry"
                      onPress={() => respondMutation.mutate({ id: item._id, decision: 'accepted' })}
                      loading={respondMutation.isPending}
                      style={styles.flexBtn}
                    />
                    <Button
                      title="Decline"
                      variant="outline"
                      onPress={() => respondMutation.mutate({ id: item._id, decision: 'declined' })}
                      loading={respondMutation.isPending}
                      style={styles.flexBtn}
                    />
                  </View>
                </View>
              )}
            </Card>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            title="No Conversations"
            description="Initiate a consultation inquiry from any verified scholar's profile."
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.light.primary,
    marginBottom: 6,
  },
  sub: {
    fontSize: 13,
    color: colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  loginPill: {
    backgroundColor: colors.light.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  loginText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: colors.light.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.light.textSecondary,
  },
  tabTextActive: {
    color: colors.light.primary,
    fontWeight: '800',
  },
  list: {
    padding: 16,
    gap: 12,
  },
  convCard: {
    padding: 14,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    marginLeft: 12,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.light.text,
  },
  unreadBadge: {
    backgroundColor: colors.light.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  unreadText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.light.accentText,
  },
  lastMsg: {
    fontSize: 12,
    color: colors.light.textSecondary,
    lineHeight: 17,
  },
  requestActions: {
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
    paddingTop: 8,
    marginTop: 4,
    gap: 6,
  },
  requestNote: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.light.primary,
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  flexBtn: {
    flex: 1,
  },
});
