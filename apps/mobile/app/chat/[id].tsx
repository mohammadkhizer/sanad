import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { theme } from '../../src/theme/colors';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { apiFetch } from '../../src/api/client';
import { useAuthStore } from '../../src/store/authStore';

export default function ChatRoomScreen() {
  const router = useRouter();
  const { id: conversationId, recipientName } = useLocalSearchParams<{
    id: string;
    recipientName?: string;
  }>();

  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [inputText, setInputText] = useState('');

  const { data: messages } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const res = await apiFetch<any>(`/conversations/${conversationId}/messages`);
      return res.data;
    },
    refetchInterval: 3000, // Light polling fallback alongside Socket.io
  });

  const sendMutation = useMutation({
    mutationFn: async (body: string) => {
      return apiFetch(`/conversations/${conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ body, type: 'text' }),
      });
    },
    onSuccess: () => {
      setInputText('');
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    },
  });

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMutation.mutate(inputText.trim());
  };

  const handleStartCall = () => {
    router.push({
      pathname: '/call/[id]',
      params: { id: conversationId },
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.topBar}>
        <View>
          <Text style={styles.partnerName}>{recipientName || 'Consultation Room'}</Text>
          <Text style={styles.securityBadge}>Private Scholarly Consultation</Text>
        </View>

        <Button
          title="Video Call"
          variant="accent"
          size="sm"
          pill
          onPress={handleStartCall}
        />
      </View>

      <FlatList
        data={messages || []}
        keyExtractor={(item) => item.id || item._id}
        contentContainerStyle={styles.messagesList}
        renderItem={({ item }) => {
          const isMe = item.senderId?.id === user?.id || item.senderId?._id === user?.id;

          return (
            <View
              style={[
                styles.messageBubble,
                isMe ? styles.myBubble : styles.partnerBubble,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  isMe ? styles.myMessageText : styles.partnerMessageText,
                ]}
              >
                {item.body}
              </Text>
              <Text
                style={[
                  styles.timeText,
                  isMe ? styles.myTimeText : styles.partnerTimeText,
                ]}
              >
                {new Date(item.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              Consultation room initiated. Ask your question with proper Islamic etiquette.
            </Text>
          </View>
        }
      />

      <View style={styles.inputBar}>
        <Input
          placeholder="Type your question or response..."
          value={inputText}
          onChangeText={setInputText}
          containerStyle={styles.inputContainer}
          style={styles.input}
        />
        <Button
          title="Send"
          variant="primary"
          size="sm"
          onPress={handleSend}
          loading={sendMutation.isPending}
          style={styles.sendButton}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.light,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.base,
    backgroundColor: theme.colors.surface.light,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  partnerName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: 'bold',
    color: theme.colors.text.primaryLight,
  },
  securityBadge: {
    fontSize: 10,
    color: theme.colors.text.secondaryLight,
    marginTop: 2,
  },
  messagesList: {
    padding: theme.spacing.base,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: theme.spacing.md,
    borderRadius: theme.radius.card,
    marginBottom: theme.spacing.sm,
  },
  myBubble: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.brand.emerald,
    borderBottomRightRadius: 4,
  },
  partnerBubble: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.surface.light,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  partnerMessageText: {
    color: theme.colors.text.primaryLight,
  },
  timeText: {
    fontSize: 9,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myTimeText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  partnerTimeText: {
    color: theme.colors.text.secondaryLight,
  },
  empty: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondaryLight,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  inputBar: {
    flexDirection: 'row',
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface.light,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    alignItems: 'center',
  },
  inputContainer: {
    flex: 1,
    marginBottom: 0,
    marginRight: 8,
  },
  input: {
    minHeight: 44,
  },
  sendButton: {
    height: 44,
    minWidth: 70,
  },
});

