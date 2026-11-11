import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { api, realtime } from '../../src/api';
import { colors } from '../../src/theme/colors';
import { useAuthStore } from '../../src/store/authStore';
import { Icon } from '../../src/components/Icon';
import { ReportModal } from '../../src/components/ReportModal';
import { LiveSessionEntity } from '@sanad/shared';

interface ChatMessage {
  id: string;
  user: string;
  text: string;
}

export default function LiveRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const insets = useSafeAreaInsets();

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', user: 'Zaid al-Dimashqi', text: 'Peace be upon you, honored Sheikh.' },
    { id: '2', user: 'Fatima Zahra', text: 'Can you clarify the chain of transmission mentioned for this narration?' },
    { id: '3', user: 'Hamza Farooq', text: 'May Allah reward your tireless dedication to transmission sciences.' },
  ]);
  const [comment, setComment] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [viewerCount, setViewerCount] = useState(342);
  const [reportModalVisible, setReportModalVisible] = useState(false);

  const { data: session } = useQuery<LiveSessionEntity>({
    queryKey: ['liveSession', id],
    queryFn: () => api.live.getLiveSession(id || 'live_401'),
  });

  const isHost = user?.roles.includes('scholar') || user?.roles.includes('admin');

  useEffect(() => {
    realtime.connect();
    realtime.joinRoom('live_room');
    const unsub = realtime.on('live:viewer_count', (data: any) => {
      if (data?.count) setViewerCount(data.count);
    });
    return () => {
      unsub();
      realtime.leaveRoom('live_room');
    };
  }, []);

  const handleSendComment = () => {
    if (!comment.trim()) return;
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      user: user?.displayName || 'Student',
      text: comment.trim(),
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setComment('');
  };

  const handleEndSession = () => {
    Alert.alert(
      'Conclude Broadcast',
      'Are you sure you want to conclude this live halaqah? The recording will be archived into the permanent curriculum.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Conclude',
          style: 'destructive',
          onPress: async () => {
            await api.live.endLiveSession(id || 'live_401');
            Alert.alert('Halaqah Concluded', 'Live circle ended and archived into your profile.');
            router.replace('/(tabs)/feed');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top || 16 }]}>
      {/* Viewport Area */}
      <View style={styles.videoPlayer}>
        {/* Top Floating Header */}
        <View style={styles.topOverlayBar}>
          <View style={styles.liveBadge}>
            <View style={styles.livePulse} />
            <Text style={styles.liveText}>LIVE HALAQAH</Text>
          </View>

          <View style={styles.viewerBadge}>
            <Text style={styles.viewerCount}>{viewerCount} Students</Text>
          </View>

          {isHost ? (
            <TouchableOpacity style={styles.endPill} onPress={handleEndSession}>
              <Text style={styles.endPillText}>End Broadcast</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.viewerActions}>
              <TouchableOpacity
                style={styles.actionCircle}
                onPress={() => setReportModalVisible(true)}
              >
                <Icon name="shield" size={16} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionCircle}
                onPress={() => router.back()}
              >
                <Icon name="close" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Video Center Stage */}
        <View style={styles.videoCenter}>
          <Text style={styles.videoTitle}>
            {session?.title || 'Live Scholarly Study Circle'}
          </Text>
          <Text style={styles.videoHost}>
            Instructor: {typeof session?.hostId === 'object' ? session.hostId.displayName : 'Accredited Scholar'}
          </Text>
          <View style={styles.webrtcPill}>
            <Icon name="lock" size={12} color={colors.light.accent} />
            <Text style={styles.webrtcText}>LiveKit WebRTC · sanad-room-101</Text>
          </View>
        </View>

        {/* Host Stream Controls */}
        {isHost && (
          <View style={styles.hostControls}>
            <TouchableOpacity
              style={[styles.hostControlBtn, isMuted && styles.hostControlBtnActive]}
              onPress={() => setIsMuted(!isMuted)}
            >
              <Icon name={isMuted ? 'mic-off' : 'mic'} size={18} color="#FFFFFF" />
              <Text style={styles.hostControlText}>{isMuted ? 'Muted' : 'Mic On'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.hostControlBtn, isVideoOff && styles.hostControlBtnActive]}
              onPress={() => setIsVideoOff(!isVideoOff)}
            >
              <Icon name="camera" size={18} color="#FFFFFF" />
              <Text style={styles.hostControlText}>{isVideoOff ? 'Video Off' : 'Video On'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Interactive Q&A and Questions Panel */}
      <View style={[styles.chatSection, { paddingBottom: insets.bottom || 16 }]}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatHeaderTitle}>Scholarly Q&A Dialogue</Text>
          <Text style={styles.chatRules}>Adhere to authenticated references</Text>
        </View>

        <FlatList
          data={chatMessages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatListContent}
          renderItem={({ item }) => (
            <View style={styles.chatRow}>
              <Text style={styles.chatUser}>{item.user}</Text>
              <Text style={styles.chatMessage}>{item.text}</Text>
            </View>
          )}
          style={styles.chatList}
        />

        <View style={styles.chatInputRow}>
          <TextInput
            style={styles.chatInput}
            placeholder="Submit a question to the halaqah..."
            placeholderTextColor={colors.light.textMuted}
            value={comment}
            onChangeText={setComment}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !comment.trim() && styles.sendBtnDisabled]}
            onPress={handleSendComment}
            disabled={!comment.trim()}
          >
            <Icon name="send" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {reportModalVisible && (
        <ReportModal
          visible={reportModalVisible}
          targetType="live"
          targetId={id || 'live_401'}
          onClose={() => setReportModalVisible(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#071613',
  },
  videoPlayer: {
    flex: 0.52,
    backgroundColor: '#0C221D',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#183D35',
  },
  topOverlayBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.light.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  viewerBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  viewerCount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  endPill: {
    backgroundColor: colors.light.error,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  endPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  viewerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoCenter: {
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
  },
  videoTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  videoHost: {
    color: colors.light.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  webrtcPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 76, 69, 0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 6,
  },
  webrtcText: {
    color: '#C6DDD8',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  hostControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  hostControlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  hostControlBtnActive: {
    backgroundColor: colors.light.error,
  },
  hostControlText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  chatSection: {
    flex: 0.48,
    backgroundColor: colors.light.background,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  chatHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.light.primary,
  },
  chatRules: {
    fontSize: 11,
    color: colors.light.textMuted,
  },
  chatList: {
    flex: 1,
  },
  chatListContent: {
    padding: 14,
    gap: 10,
  },
  chatRow: {
    backgroundColor: colors.light.surface,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  chatUser: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.light.primary,
    marginBottom: 2,
  },
  chatMessage: {
    fontSize: 13,
    color: colors.light.text,
    lineHeight: 18,
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
    backgroundColor: colors.light.surface,
  },
  chatInput: {
    flex: 1,
    backgroundColor: colors.light.background,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.light.text,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
});
