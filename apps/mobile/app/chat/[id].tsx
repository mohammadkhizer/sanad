import React, { useState } from 'react';
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
  Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../src/api';
import { colors } from '../../src/theme/colors';
import { useAuthStore } from '../../src/store/authStore';
import { ReportModal } from '../../src/components/ReportModal';
import { MessageEntity } from '@sanad/shared';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const [text, setText] = useState('');
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const { data, isLoading } = useQuery<MessageEntity[]>({
    queryKey: ['messages', id],
    queryFn: () => api.chat.getMessages(id || 'conv_301'),
    refetchInterval: 5000,
  });

  const sendMutation = useMutation({
    mutationFn: (body: string) =>
      api.chat.sendMessage({
        conversationId: id || 'conv_301',
        body,
        type: 'text',
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

  const handleAttachImage = () => {
    Alert.alert('Attach Document / Image', 'Manuscript or citation image selected for attachment.');
    sendMutation.mutate('[ATTACHMENT: Classical Manuscript Folio Scan (PDF/Image)]');
  };

  const messages = data || [];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={88}
    >
      {/* Consultation Safety Banner */}
      <View style={styles.topBanner}>
        <Text style={styles.bannerText}>
          Sanad Scholarly Consultation: Adhere to respectful academic discourse.
        </Text>
        <TouchableOpacity onPress={() => setReportModalVisible(true)}>
          <Text style={styles.reportLink}>[REPORT]</Text>
        </TouchableOpacity>
      </View>

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
            const sender = typeof item.senderId === 'object' ? item.senderId : null;
            const senderId = sender?._id || item.senderId;
            const isMine = senderId === user?.id;
            const senderName = sender?.displayName || 'Scholar';

            return (
              <View
                style={[
                  styles.messageBubble,
                  isMine ? styles.myBubble : styles.theirBubble,
                ]}
              >
                {!isMine && (
                  <Text style={styles.senderName}>{senderName}</Text>
                )}
                <Text
                  style={[
                    styles.messageText,
                    isMine ? styles.myText : styles.theirText,
                  ]}
                >
                  {item.body}
                </Text>
                <View style={styles.metaRow}>
                  <Text
                    style={[
                      styles.timestampText,
                      isMine ? styles.myTimestamp : styles.theirTimestamp,
                    ]}
                  >
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  {isMine && (
                    <Text style={styles.readReceiptText}>
                      {item.readBy?.length > 1 ? '[READ]' : '[SENT]'}
                    </Text>
                  )}
                </View>
              </View>
            );
          }}
          ListFooterComponent={
            isTyping ? (
              <View style={styles.typingBox}>
                <Text style={styles.typingText}>Scholar is typing...</Text>
              </View>
            ) : undefined
          }
        />
      )}

      {/* Message Input Box */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachBtn} onPress={handleAttachImage}>
          <Text style={styles.attachText}>[+]</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Ask a scholarly question..."
          placeholderTextColor={colors.light.textMuted}
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
          disabled={sendMutation.isPending || !text.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>

      {reportModalVisible && (
        <ReportModal
          visible={reportModalVisible}
          targetType="message"
          targetId={id || 'conv_301'}
          onClose={() => setReportModalVisible(false)}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  topBanner: {
    backgroundColor: colors.light.surfaceElevated,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  bannerText: {
    fontSize: 11,
    color: colors.light.textSecondary,
    flex: 1,
    paddingRight: 8,
  },
  reportLink: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.light.error,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageList: {
    padding: 16,
    gap: 12,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 14,
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
    fontSize: 14,
    lineHeight: 20,
  },
  myText: {
    color: '#FFFFFF',
  },
  theirText: {
    color: colors.light.text,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  timestampText: {
    fontSize: 10,
  },
  myTimestamp: {
    color: '#A2C2BD',
  },
  theirTimestamp: {
    color: colors.light.textMuted,
  },
  readReceiptText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.light.accent,
  },
  typingBox: {
    padding: 8,
  },
  typingText: {
    fontSize: 11,
    color: colors.light.textMuted,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: colors.light.surface,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
    alignItems: 'center',
    gap: 8,
  },
  attachBtn: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: colors.light.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.light.primary,
  },
  input: {
    flex: 1,
    backgroundColor: colors.light.surfaceElevated,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 13,
    color: colors.light.text,
  },
  sendButton: {
    backgroundColor: colors.light.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
