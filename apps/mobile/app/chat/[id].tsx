import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../src/api/client';
import { colors } from '../../src/theme/colors';
import { useAuthStore } from '../../src/store/authStore';

interface MessageItem {
  _id: string;
  senderId: {
    _id: string;
    displayName: string;
  };
  body: string;
  createdAt: string;
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const [text, setText] = useState('');

  const { data, isLoading } = useQuery<{ messages: MessageItem[] }>({
    queryKey: ['messages', id],
    queryFn: () => apiClient<{ messages: MessageItem[] }>(`/conversations/${id}/messages`),
    refetchInterval: 4000,
  });

  const sendMutation = useMutation({
    mutationFn: (body: string) =>
      apiClient(`/conversations/${id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ body, type: 'text' }),
      }),
    onSuccess: () => {
      setText('');
      queryClient.invalidateQueries({ queryKey: ['messages', id] });
    },
  });

  const handleSend = () => {
    if (!text.trim() || sendMutation.isPending) return;
    sendMutation.mutate(text.trim());
  };

  const messages = data?.messages || [];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.light.primary} />
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.messageList}
          renderItem={({ item }) => {
            const isMine = item.senderId._id === user?.id;
            return (
              <View
                style={[
                  styles.messageBubble,
                  isMine ? styles.myBubble : styles.theirBubble,
                ]}
              >
                {!isMine && (
                  <Text style={styles.senderName}>{item.senderId.displayName}</Text>
                )}
                <Text
                  style={[
                    styles.messageText,
                    isMine ? styles.myText : styles.theirText,
                  ]}
                >
                  {item.body}
                </Text>
              </View>
            );
          }}
        />
      )}

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Type your question or response..."
          placeholderTextColor={colors.light.textMuted}
          value={text}
          onChangeText={setText}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!text.trim() || sendMutation.isPending}
        >
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  },
  messageList: {
    padding: 16,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
  },
  myBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.light.primary,
    borderBottomRightRadius: 2,
  },
  theirBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.light.surface,
    borderWidth: 1,
    borderColor: colors.light.border,
    borderBottomLeftRadius: 2,
  },
  senderName: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.light.primary,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myText: {
    color: '#FFFFFF',
  },
  theirText: {
    color: colors.light.text,
  },
  inputBar: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: colors.light.surface,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: colors.light.background,
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 15,
    color: colors.light.text,
  },
  sendBtn: {
    marginLeft: 10,
    backgroundColor: colors.light.primary,
    paddingHorizontal: 18,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#D1D5DB',
  },
  sendText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});

