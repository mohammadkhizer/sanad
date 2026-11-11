import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api, realtime } from '../../src/api';
import { colors } from '../../src/theme/colors';
import { useAuthStore } from '../../src/store/authStore';
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

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', user: 'Zaid', text: 'Peace be upon you, honored Sheikh.' },
    { id: '2', user: 'Fatima', text: 'Can you clarify the chain of transmission mentioned?' },
    { id: '3', user: 'Hamza', text: 'May Allah reward your tireless teaching.' },
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
      user: user?.displayName || 'Learner',
      text: comment.trim(),
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setComment('');
  };

  const handleEndSession = () => {
    Alert.alert(
      'End Broadcast',
      'Are you sure you want to conclude this live circle? A recording will be archived.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Conclude',
          style: 'destructive',
          onPress: async () => {
            await api.live.endLiveSession(id || 'live_401');
            Alert.alert('Session Concluded', 'Live circle ended and saved to archives.');
            router.replace('/(tabs)/feed');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Video Viewport Area */}
      <View style={styles.videoPlayer}>
        {/* Top Header Overlay */}
        <View style={styles.liveBadgeRow}>
          <View style={styles.liveBadge}>
            <Text style={styles.liveText}>[LIVE CIRCLE]</Text>
          </View>
          <Text style={styles.viewerCount}>{viewerCount} Watching</Text>

          {isHost ? (
            <TouchableOpacity style={styles.endPill} onPress={handleEndSession}>
              <Text style={styles.endPillText}>End Broadcast</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.viewerHeaderBtns}>
              <TouchableOpacity
                style={styles.reportPill}
                onPress={() => setReportModalVisible(true)}
              >
                <Text style={styles.reportPillText}>[REPORT]</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => router.back()}
              >
                <Text style={styles.closeText}>Leave</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Video Surface Preview */}
        <View style={styles.videoCenter}>
          <Text style={styles.videoHostText}>
            {session?.title || 'Live Scholarly Study Circle'}
          </Text>
          <Text style={styles.videoSubText}>
            Host: {typeof session?.hostId === 'object' ? session.hostId.displayName : 'Verified Scholar'}
          </Text>
          <Text style={styles.webrtcText}>
            WebRTC Engine: LiveKit Room ({session?.roomName || 'sanad-live-room'})
          </Text>
        </View>

        {/* Host In-Stream Controls */}
        {isHost && (
          <View style={styles.hostControls}>
            <TouchableOpacity
              style={[styles.hostControlBtn, isMuted && styles.hostControlBtnActive]}
              onPress={() => setIsMuted(!isMuted)}
            >
              <Text style={styles.hostControlText}>{isMuted ? '[MIC MUTED]' : '[MIC ON]'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.hostControlBtn, isVideoOff && styles.hostControlBtnActive]}
              onPress={() => setIsVideoOff(!isVideoOff)}
            >
              <Text style={styles.hostControlText}>{isVideoOff ? '[CAM OFF]' : '[CAM ON]'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Live Chat & Q&A Stream */}
      <View style={styles.chatSection}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatHeaderTitle}>Live Questions & Dialogue</Text>
          <Text style={styles.chatRules}>Sectarian hostility is strictly filtered</Text>
        </View>

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
            placeholder="Ask a scholarly question respectfully..."
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

      {reportModalVisible && (
        <ReportModal
          visible={reportModalVisible}
          targetType="live"
          targetId={id || 'live_401'}
          onClose={() => setReportModalVisible(false)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E1512',
  },
  videoPlayer: {
    flex: 0.55,
    backgroundColor: '#122824',
    position: 'relative',
    justifyContent: 'space-between',
    padding: 16,
  },
  liveBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
    marginTop: 8,
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
    fontSize: 10,
  },
  viewerCount: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  viewerHeaderBtns: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  reportPill: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  reportPillText: {
    color: colors.light.error,
    fontSize: 10,
    fontWeight: '800',
  },
  closeBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  endPill: {
    backgroundColor: colors.light.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  endPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  videoCenter: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
  },
  videoHostText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  videoSubText: {
    color: colors.light.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  webrtcText: {
    color: '#A2B0A9',
    fontSize: 10,
    fontFamily: 'monospace',
    marginTop: 4,
  },
  hostControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 8,
  },
  hostControlBtn: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#32473E',
  },
  hostControlBtnActive: {
    backgroundColor: colors.light.error,
  },
  hostControlText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  chatSection: {
    flex: 0.45,
    backgroundColor: colors.light.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 12,
    justifyContent: 'space-between',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  chatHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.light.primary,
  },
  chatRules: {
    fontSize: 10,
    color: colors.light.textSecondary,
  },
  chatList: {
    flex: 1,
    marginVertical: 8,
  },
  chatRow: {
    flexDirection: 'row',
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  chatUser: {
    fontWeight: '700',
    color: colors.light.primary,
    fontSize: 12,
  },
  chatMessage: {
    color: colors.light.text,
    fontSize: 12,
    flex: 1,
  },
  chatInputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  chatInput: {
    flex: 1,
    backgroundColor: colors.light.surfaceElevated,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: colors.light.text,
  },
  sendPill: {
    backgroundColor: colors.light.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
  },
  sendPillText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
});
