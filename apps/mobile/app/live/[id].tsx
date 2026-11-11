import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';

interface ChatMessage {
  id: string;
  user: string;
  text: string;
}

export default function LiveRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', user: 'Zaid', text: 'Assalamu Alaykum Sheikh' },
    { id: '2', user: 'Fatima', text: 'May Allah reward you for this lesson' },
  ]);
  const [comment, setComment] = useState('');

  const handleSendComment = () => {
    if (!comment.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), user: 'You', text: comment.trim() },
    ]);
    setComment('');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Video Viewport Simulated */}
      <View style={styles.videoPlayer}>
        <View style={styles.liveBadgeRow}>
          <View style={styles.liveBadge}>
            <Text style={styles.liveText}>LIVE</Text>
          </View>
          <Text style={styles.viewerCount}>142 Watching</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <Text style={styles.closeText}>Leave</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.videoCenter}>
          <Text style={styles.videoHostText}>Live Scholarly Broadcast</Text>
          <Text style={styles.videoSubText}>Session ID: {id}</Text>
        </View>
      </View>

      {/* Live Chat Overlay */}
      <View style={styles.chatSection}>
        <FlatList
          data={chatMessages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.chatRow}>
              <Text style={styles.chatUser}>{item.user}: </Text>
              <Text style={styles.chatMessage}>{item.text}</Text>
            </View>
          )}
          style={styles.chatList}
        />

        <View style={styles.chatInputRow}>
          <TextInput
            style={styles.chatInput}
            placeholder="Ask a question respectfully..."
            placeholderTextColor={colors.light.textMuted}
            value={comment}
            onChangeText={setComment}
          />
          <TouchableOpacity
            style={styles.sendPill}
            onPress={handleSendComment}
          >
            <Text style={styles.sendPillText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  videoPlayer: {
    flex: 0.6,
    backgroundColor: '#111827',
    justifyContent: 'space-between',
    padding: 16,
  },
  liveBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  liveBadge: {
    backgroundColor: colors.light.error,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  liveText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  viewerCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  closeBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  videoCenter: {
    alignItems: 'center',
  },
  videoHostText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  videoSubText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
  },
  chatSection: {
    flex: 0.4,
    backgroundColor: 'rgba(17, 24, 39, 0.95)',
    padding: 12,
  },
  chatList: {
    flex: 1,
  },
  chatRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  chatUser: {
    color: colors.light.accent,
    fontWeight: '700',
    fontSize: 13,
  },
  chatMessage: {
    color: '#FFFFFF',
    fontSize: 13,
    flex: 1,
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  chatInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 14,
  },
  sendPill: {
    marginLeft: 8,
    backgroundColor: colors.light.primary,
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendPillText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});

