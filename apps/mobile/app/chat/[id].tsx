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
import { AppHeader } from '../../src/components/AppHeader';
import { Icon } from '../../src/components/Icon';
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
    Alert.alert('Attach Document or Citation', 'Select classical manuscript folio scan or citation image to attach to the consultation.');
    sendMutation.mutate('Attachment: Classical Manuscript Folio Scan (Verified Citation)');
  };

  const messages = data || [];

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <AppHeader
        title="Scholarly Consultation"
        subtitle="Confidential and Encrypted"
        showBack
        rightIcon="shield"
        onRightPress={() => setReportModalVisible(true)}
      />

      {/* Advisory Banner */}
      <View style={styles.advisoryBanner}>
        <Icon name="shield" size={14} color={colors.light.primary} />
        <Text style={styles.advisoryText}>
          Academic Consultation: Adhere to verified sources and respectful discourse.
        </Text>
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
            const isRead = item.readBy && item.readBy.length > 1;

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
                    <View style={styles.receiptRow}>
                      <Icon
                        name="check"
                        size={12}
                        color={isRead ? colors.light.accent : 'rgba(255, 255, 255, 0.6)'}
                      />
                      {isRead && (
                        <Icon
                          name="check"
                          size={12}
                          color={colors.light.accent}
                        />
                      )}
                    </View>
                  )}
                </View>
              </View>
            );
          }}
          ListFooterComponent={
            isTyping ? (
              <View style={styles.typingBox}>
                <Text style={styles.typingText}>Scholar is reviewing sources...</Text>
              </View>
            ) : undefined
          }
        />
      )}

      {/* Input Bar */}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.attachBtn}
          onPress={handleAttachImage}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon name="paperclip" size={20} color={colors.light.primary} />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Type scholarly inquiry or response..."
          placeholderTextColor={colors.light.textMuted}
          value={text}
          onChangeText={setText}
          multiline
        />

        <TouchableOpacity
          style={[styles.sendButton, (!text.trim() || sendMutation.isPending) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={sendMutation.isPending || !text.trim()}
          activeOpacity={0.8}
        >
          <Icon name="send" size={18} color="#FFFFFF" />
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
  screen: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  advisoryBanner: {
    backgroundColor: 'rgba(15, 76, 69, 0.06)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  advisoryText: {
    fontSize: 11,
    color: colors.light.primary,
    flex: 1,
    fontWeight: '600',
    lineHeight: 16,
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
    maxWidth: '82%',
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
    marginTop: 6,
    gap: 6,
  },
  timestampText: {
    fontSize: 10,
  },
  myTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  theirTimestamp: {
    color: colors.light.textMuted,
  },
  receiptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: -4,
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
    gap: 10,
  },
  attachBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.light.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 13,
    color: colors.light.text,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
