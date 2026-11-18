import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
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
import { NotificationEntity } from '../../src/api/types';

export default function InboxScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [activeTab, setActiveTab] = useState<'notifications' | 'all' | 'requests'>('notifications');

  const { data: notificationsData, isLoading: notificationsLoading, refetch: refetchNotifications } = useQuery<NotificationEntity[]>({
    queryKey: ['notifications'],
    queryFn: () => api.notifications.getNotifications(),
    enabled: isAuthenticated,
  });

  const { data: unreadData, refetch: refetchUnread } = useQuery<{ unreadCount: number }>({
    queryKey: ['notificationsUnread'],
    queryFn: () => api.notifications.getUnreadCount(),
    enabled: isAuthenticated,
  });

  const { data, isLoading, refetch } = useQuery<ConversationEntity[]>({
    queryKey: ['conversations', activeTab],
    queryFn: () => api.chat.getConversations(activeTab === 'requests' ? 'requests' : 'all'),
    enabled: isAuthenticated && activeTab !== 'notifications',
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

  const markAllReadMutation = useMutation({
    mutationFn: () => api.notifications.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationsUnread'] });
    },
  });

  const handleNotificationPress = async (item: NotificationEntity) => {
    if (!item.read) {
      await api.notifications.markAsRead(item._id);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationsUnread'] });
    }

    if (item.type === 'follow') {
      const targetUserId = item.actorId?._id || item.entityId;
      if (targetUserId) {
        router.push(`/profile/${targetUserId}`);
      }
    } else if (item.type === 'like' || item.type === 'comment') {
      if (item.entityId) {
        router.push(`/post/${item.entityId}`);
      }
    } else if (item.type === 'security_warning') {
      Alert.alert(item.title, item.body);
    }
  };

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
  const notifications = notificationsData || [];
  const unreadCount = unreadData?.unreadCount ?? 0;

  return (
    <View style={styles.container}>
      <AppHeader
        title={activeTab === 'notifications' ? 'Notifications' : 'Consultations'}
        subtitle={
          activeTab === 'notifications'
            ? 'Activity, follows, likes & comments'
            : 'Direct scholarly correspondence'
        }
        rightIcon={activeTab === 'notifications' && unreadCount > 0 ? 'check' : 'search'}
        onRightPress={
          activeTab === 'notifications' && unreadCount > 0
            ? () => markAllReadMutation.mutate()
            : undefined
        }
      />

      {/* Classical Segmented Tab Switcher */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'notifications' && styles.tabItemActive]}
          onPress={() => setActiveTab('notifications')}
        >
          <View style={styles.tabLabelRow}>
            <Text style={[styles.tabText, activeTab === 'notifications' && styles.tabTextActive]}>
              Activity
            </Text>
            {unreadCount > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          {activeTab === 'notifications' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'all' && styles.tabItemActive]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
            Chats
          </Text>
          {activeTab === 'all' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'requests' && styles.tabItemActive]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[styles.tabText, activeTab === 'requests' && styles.tabTextActive]}>
            Inquiries
          </Text>
          {activeTab === 'requests' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </View>

      {/* Notifications Tab View */}
      {activeTab === 'notifications' ? (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={notificationsLoading}
              onRefresh={() => {
                refetchNotifications();
                refetchUnread();
              }}
              tintColor={colors.light.primary}
            />
          }
          renderItem={({ item }) => {
            const isFollow = item.type === 'follow';
            const isLike = item.type === 'like';
            const isComment = item.type === 'comment';
            const isSecurity = item.type === 'security_warning';

            return (
              <Card
                style={[
                  styles.itemCard,
                  !item.read && styles.unreadNotificationCard,
                ]}
              >
                <TouchableOpacity
                  style={styles.itemTouch}
                  activeOpacity={0.7}
                  onPress={() => handleNotificationPress(item)}
                >
                  <View style={styles.avatarBadgeWrapper}>
                    <Avatar
                      name={item.actorId?.displayName || item.title || 'Sanad'}
                      url={item.actorId?.avatarUrl}
                      size={44}
                    />
                    <View
                      style={[
                        styles.typeBadgeCircle,
                        isFollow && styles.typeBadgeFollow,
                        isLike && styles.typeBadgeLike,
                        isComment && styles.typeBadgeComment,
                        isSecurity && styles.typeBadgeSecurity,
                      ]}
                    >
                      <Icon
                        name={
                          isFollow
                            ? 'profile'
                            : isLike
                              ? 'heart'
                              : isComment
                                ? 'comment'
                                : 'shield'
                        }
                        size={11}
                        color="#FFFFFF"
                      />
                    </View>
                  </View>

                  <View style={styles.info}>
                    <View style={styles.topRow}>
                      <Text style={styles.name}>{item.title}</Text>
                      <Text style={styles.time}>
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                    </View>

                    <Text style={styles.lastMsg} numberOfLines={2}>
                      {item.body}
                    </Text>
                  </View>

                  {!item.read && <View style={styles.unreadDot} />}
                </TouchableOpacity>
              </Card>
            );
          }}
          ListEmptyComponent={
            <EmptyState
              title="No Notifications Yet"
              subtitle="You will be notified here whenever users follow you, like your posts, or comment on your lessons."
            />
          }
        />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => {
                refetch();
              }}
              tintColor={colors.light.primary}
            />
          }
          renderItem={({ item }) => {
            const other = item.participants.find((p) => p._id !== user?.id) || item.participants[0];
            const isRequest = item.isRequest && item.requestStatus === 'pending';

            return (
              <Card style={styles.itemCard}>
                <TouchableOpacity
                  style={styles.itemTouch}
                  activeOpacity={0.8}
                  onPress={() =>
                    router.push({
                      pathname: `/chat/${item._id}`,
                      params: {
                        recipientName: other?.displayName,
                        recipientId: other?._id,
                      },
                    })
                  }
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
                      {(item as any).lastMessageText || item.lastMessage?.body || 'Consultation initiated.'}
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
      )}
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
    gap: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
    backgroundColor: colors.light.background,
  },
  tabItem: {
    paddingVertical: 12,
    position: 'relative',
  },
  tabLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabBadge: {
    backgroundColor: colors.light.primary,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
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
  unreadNotificationCard: {
    backgroundColor: '#FAF5EC',
    borderColor: '#E6D29A',
  },
  avatarBadgeWrapper: {
    position: 'relative',
  },
  typeBadgeCircle: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  typeBadgeFollow: {
    backgroundColor: '#C9A227',
  },
  typeBadgeLike: {
    backgroundColor: '#E02424',
  },
  typeBadgeComment: {
    backgroundColor: '#0F4C45',
  },
  typeBadgeSecurity: {
    backgroundColor: '#D97706',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.light.primary,
    alignSelf: 'center',
    marginLeft: 6,
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
