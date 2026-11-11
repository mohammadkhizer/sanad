import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../src/api/client';
import { colors } from '../../src/theme/colors';
import { Avatar } from '../../src/components/Avatar';
import { Card } from '../../src/components/Card';
import { EmptyState } from '../../src/components/EmptyState';
import { useAuthStore } from '../../src/store/authStore';
import { useRouter } from 'expo-router';

export default function InboxScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const { data, isLoading, refetch } = useQuery<{ conversations: any[] }>({
    queryKey: ['conversations'],
    queryFn: () => apiClient<{ conversations: any[] }>('/conversations'),
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Inbox</Text>
        <Text style={styles.sub}>Please log in to view your conversations and requests.</Text>
        <TouchableOpacity
          style={styles.loginPill}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.loginText}>Log In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.light.primary} />
      </View>
    );
  }

  const conversations = data?.conversations || [];

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const otherParticipant = item.participants.find(
            (p: any) => p._id !== user?.id
          ) || { displayName: 'Participant' };

          return (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push(`/chat/${item._id}`)}
            >
              <Card style={styles.convCard}>
                <View style={styles.row}>
                  <Avatar
                    name={otherParticipant.displayName}
                    url={otherParticipant.avatarUrl}
                    size={48}
                  />
                  <View style={styles.info}>
                    <Text style={styles.name}>{otherParticipant.displayName}</Text>
                    <Text style={styles.lastMsg} numberOfLines={1}>
                      {item.lastMessageText || 'Direct Q&A session started'}
                    </Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            title="No conversations yet"
            subtitle="Engage in verified Q&A sessions with scholars. Send a request from any scholar profile."
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
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.light.background,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.light.primary,
    marginBottom: 8,
  },
  sub: {
    fontSize: 14,
    color: colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  loginPill: {
    backgroundColor: colors.light.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  loginText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  list: {
    padding: 16,
  },
  convCard: {
    padding: 12,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.light.text,
  },
  lastMsg: {
    fontSize: 13,
    color: colors.light.textSecondary,
    marginTop: 4,
  },
});

