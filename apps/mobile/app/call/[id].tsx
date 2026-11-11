import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { Avatar } from '../../src/components/Avatar';
import { Button } from '../../src/components/Button';
import { api } from '../../src/api';

export default function CallScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [callState, setCallState] = useState<'ringing' | 'connected' | 'ended'>('ringing');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [durationSecs, setDurationSecs] = useState(0);

  useEffect(() => {
    // Simulate connection after ringing for 2 seconds
    const timer = setTimeout(() => {
      setCallState('connected');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (callState === 'connected') {
      interval = setInterval(() => {
        setDurationSecs((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callState]);

  const handleEndCall = async () => {
    await api.calls.endCall(id || 'call_1');
    setCallState('ended');
  };

  const formatDuration = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (callState === 'ended') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerBox}>
          <Text style={styles.endedTitle}>Consultation Concluded</Text>
          <Text style={styles.durationSummary}>Duration: {formatDuration(durationSecs)}</Text>
          <Text style={styles.endedNote}>
            Your direct consultation has ended. Follow-up notes may be exchanged in the chat inbox.
          </Text>
          <Button
            title="Return to Inbox"
            onPress={() => router.replace('/(tabs)/inbox')}
            style={styles.returnBtn}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Notice */}
      <View style={styles.callHeader}>
        <Text style={styles.callNotice}>[SANAD SCHOLARLY CONSULTATION]</Text>
        <Text style={styles.noticeText}>
          Video calls are confidential and encrypted. Recording without mutual consent is strictly prohibited.
        </Text>
      </View>

      {/* Main Video Viewport */}
      {callState === 'ringing' ? (
        <View style={styles.centerBox}>
          <Avatar name="Dr. Omar Farooq" size={80} />
          <Text style={styles.callerName}>Dr. Omar Farooq</Text>
          <Text style={styles.ringingStatus}>Connecting secure LiveKit channel...</Text>
        </View>
      ) : (
        <View style={styles.videoStage}>
          <View style={styles.webrtcBadge}>
            <Text style={styles.webrtcBadgeText}>[LIVEKIT WEBRTC CONNECTED]</Text>
          </View>
          <Text style={styles.callTimer}>{formatDuration(durationSecs)}</Text>
          <Text style={styles.roomLabel}>Channel: sanad-consultation-{id || '101'}</Text>
          <Text style={styles.cameraLabel}>
            Camera: {isFrontCamera ? 'Front Facing' : 'Rear Facing'} · Video: {isVideoOff ? 'Disabled' : 'Streaming'}
          </Text>
        </View>
      )}

      {/* Call Controls */}
      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
          onPress={() => setIsMuted((prev) => !prev)}
        >
          <Text style={styles.controlText}>{isMuted ? '[UNMUTE]' : '[MUTE]'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlBtn, isVideoOff && styles.controlBtnActive]}
          onPress={() => setIsVideoOff((prev) => !prev)}
        >
          <Text style={styles.controlText}>{isVideoOff ? '[CAM ON]' : '[CAM OFF]'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlBtn}
          onPress={() => setIsFrontCamera((prev) => !prev)}
        >
          <Text style={styles.controlText}>[FLIP]</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.endCallBtn} onPress={handleEndCall}>
          <Text style={styles.endCallText}>[END CALL]</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E1512',
    justifyContent: 'space-between',
    padding: 20,
  },
  callHeader: {
    backgroundColor: 'rgba(27, 59, 53, 0.7)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#32473E',
  },
  callNotice: {
    color: colors.light.accent,
    fontWeight: '800',
    fontSize: 11,
    marginBottom: 4,
  },
  noticeText: {
    color: '#A2B0A9',
    fontSize: 11,
    lineHeight: 16,
  },
  centerBox: {
    alignItems: 'center',
    gap: 12,
    padding: 20,
  },
  callerName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  ringingStatus: {
    color: colors.light.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  videoStage: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  webrtcBadge: {
    backgroundColor: colors.light.success,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  webrtcBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  callTimer: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 1,
  },
  roomLabel: {
    color: '#A2B0A9',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  cameraLabel: {
    color: '#687870',
    fontSize: 11,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  controlBtn: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#32473E',
  },
  controlBtnActive: {
    backgroundColor: colors.light.error,
  },
  controlText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
  },
  endCallBtn: {
    backgroundColor: colors.light.error,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  endCallText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
  },
  endedTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.light.accent,
  },
  durationSummary: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  endedNote: {
    fontSize: 13,
    color: '#A2B0A9',
    textAlign: 'center',
    lineHeight: 19,
    marginVertical: 12,
  },
  returnBtn: {
    width: '100%',
    marginTop: 8,
  },
});
