import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { theme } from '../../src/theme/colors';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { VerifiedBadge } from '../../src/components/VerifiedBadge';
import { useAuthStore } from '../../src/store/authStore';

interface ChatMessage {
  id: string;
  sender: string;
  isScholar: boolean;
  text: string;
}

export default function LiveRoomScreen() {
  const router = useRouter();
  const { id: liveId, isHost } = useLocalSearchParams<{ id: string; isHost?: string }>();
  const user = useAuthStore((s) => s.user);

  const isHostScholar = isHost === 'true';

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'Dr. Ahmad',
      isScholar: true,
      text: 'Assalamu alaikum wa rahmatullah. We are discussing the authentic chain of transmission today.',
    },
    {
      id: '2',
      sender: 'Student Bilal',
      isScholar: false,
      text: 'May Allah reward you Sheikh. Question regarding hadith terminology.',
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: user?.displayName || 'Learner',
        isScholar: !!user?.roles?.includes('scholar'),
        text: chatInput.trim(),
      },
    ]);
    setChatInput('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Video Viewport */}
      <View style={styles.videoPlayer}>
        <View style={styles.topControls}>
          <View style={styles.liveBadge}>
            <Text style={styles.liveText}>LIVE</Text>
          </View>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => router.back()}
            accessibilityRole="button"
          >
            <Text style={styles.closeText}>Leave</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.placeholderCenter}>
          <Text style={styles.streamLabel}>
            {isHostScholar ? 'You are Broadcasting Live' : 'Live Scholarly Stream'}
          </Text>
          <Text style={styles.sfuSub}>LiveKit SFU WebRTC Low-Latency Stream</Text>
        </View>

        {isHostScholar && (
          <View style={styles.hostControlBar}>
            <Button
              title="End Stream"
              variant="danger"
              size="sm"
              onPress={() => {
                router.back();
              }}
            />
          </View>
        )}
      </View>

      {/* Live Chat & Q&A Stream */}
      <View style={styles.chatSection}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatTitle}>Live Scholarly Q&A</Text>
          <Text style={styles.rulesNotice}>Respectful discourse enforced</Text>
        </View>

        <FlatList
          data={chatMessages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatList}
          renderItem={({ item }) => (
            <View style={styles.commentRow}>
              <View style={styles.commentHeader}>
                <Text
                  style={[
                    styles.commentSender,
                    item.isScholar ? styles.scholarSender : null,
                  ]}
                >
                  {item.sender}
                </Text>
                {item.isScholar && (
                  <View style={styles.badgeWrap}>
                    <VerifiedBadge size="sm" />
                  </View>
                )}
              </View>
              <Text style={styles.commentBody}>{item.text}</Text>
            </View>
          )}
        />

        <View style={styles.inputRow}>
          <Input
            placeholder="Ask a question respectfully..."
            value={chatInput}
            onChangeText={setChatInput}
            containerStyle={styles.inputContainer}
            style={styles.input}
          />
          <Button
            title="Ask"
            variant="accent"
            size="sm"
            onPress={handleSendChat}
            style={styles.sendBtn}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E1512',
  },
  videoPlayer: {
    height: 320,
    backgroundColor: '#16231E',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topControls: {
    position: 'absolute',
    top: 44,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  liveBadge: {
    backgroundColor: theme.colors.semantic.error,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  liveText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 11,
  },
  closeBtn: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  placeholderCenter: {
    alignItems: 'center',
  },
  streamLabel: {
    color: theme.colors.accent.gold,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: 'bold',
  },
  sfuSub: {
    color: '#9BB0A8',
    fontSize: 11,
    marginTop: 4,
  },
  hostControlBar: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  chatSection: {
    flex: 1,
    backgroundColor: theme.colors.surface.light,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  chatTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: 'bold',
    color: theme.colors.text.primaryLight,
  },
  rulesNotice: {
    fontSize: 10,
    color: theme.colors.text.secondaryLight,
  },
  chatList: {
    padding: theme.spacing.base,
  },
  commentRow: {
    marginBottom: theme.spacing.sm,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentSender: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: 'bold',
    color: theme.colors.text.primaryLight,
  },
  scholarSender: {
    color: theme.colors.brand.emerald,
  },
  badgeWrap: {
    marginLeft: 4,
  },
  commentBody: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.primaryLight,
    marginTop: 2,
    lineHeight: 18,
  },
  inputRow: {
    flexDirection: 'row',
    padding: theme.spacing.sm,
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
  sendBtn: {
    height: 44,
  },
});

