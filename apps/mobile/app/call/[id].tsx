import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../src/theme/colors';
import { Avatar } from '../../src/components/Avatar';
import { Button } from '../../src/components/Button';
import { Icon } from '../../src/components/Icon';
import { api } from '../../src/api';

export default function CallScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const calleeDisplayName = name || 'Scholar Consultation';

  const [callState, setCallState] = useState<'ringing' | 'connected' | 'ended'>('ringing');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [durationSecs, setDurationSecs] = useState(0);

  useEffect(() => {
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
    if (id) {
      await api.calls.endCall(id);
    }
    setCallState('ended');
  };

  const formatDuration = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (callState === 'ended') {
    return (
      <View style={[styles.container, { paddingTop: insets.top || 16, paddingBottom: insets.bottom || 20 }]}>
        <View style={styles.centerBox}>
          <View style={styles.endedIconBox}>
            <Icon name="check" size={32} color={colors.light.primary} />
          </View>
          <Text style={styles.endedTitle}>Consultation Concluded</Text>
          <Text style={styles.durationSummary}>Duration: {formatDuration(durationSecs)}</Text>
          <Text style={styles.endedNote}>
            Your direct academic session has concluded. Follow-up notes and source citations may be exchanged in the consultation inbox.
          </Text>
          <Button
            title="Return to Consultation Inbox"
            variant="accent"
            onPress={() => router.replace('/(tabs)/inbox')}
            style={styles.returnBtn}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top || 16, paddingBottom: insets.bottom || 24 }]}>
      {/* Top Header Bar */}
      <View style={styles.headerBar}>
        <View style={styles.securityPill}>
          <Icon name="lock" size={12} color={colors.light.accent} />
          <Text style={styles.securityText}>End-to-End Encrypted</Text>
        </View>
        <Text style={styles.channelLabel}>LiveKit Channel {id || '101'}</Text>
      </View>

      {/* Main Video / Ringing Stage */}
      {callState === 'ringing' ? (
        <View style={styles.ringingStage}>
          <Avatar name={calleeDisplayName} size={96} />
          <Text style={styles.callerName}>{calleeDisplayName}</Text>
          <Text style={styles.callerSub}>Accredited Scholar Consultation</Text>
          <View style={styles.connectingPill}>
            <Text style={styles.connectingText}>Establishing LiveKit WebRTC Session...</Text>
          </View>
        </View>
      ) : (
        <View style={styles.videoStage}>
          <View style={styles.stageOverlay}>
            <Avatar name={calleeDisplayName} size={80} />
            <Text style={styles.connectedName}>{calleeDisplayName}</Text>
            <View style={styles.timerPill}>
              <View style={styles.timerDot} />
              <Text style={styles.callTimer}>{formatDuration(durationSecs)}</Text>
            </View>
          </View>

          <View style={styles.viewportFooter}>
            <Text style={styles.cameraStatus}>
              Camera: {isFrontCamera ? 'Front-Facing' : 'Rear-Facing'} · Stream: {isVideoOff ? 'Video Muted' : '1080p Active'}
            </Text>
          </View>
        </View>
      )}

      {/* Tactile Circular Controls */}
      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
          onPress={() => setIsMuted((prev) => !prev)}
          activeOpacity={0.7}
        >
          <Icon
            name={isMuted ? 'mic-off' : 'mic'}
            size={22}
            color={isMuted ? colors.light.error : '#FFFFFF'}
          />
          <Text style={styles.controlLabel}>{isMuted ? 'Unmute' : 'Mute'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlBtn, isVideoOff && styles.controlBtnActive]}
          onPress={() => setIsVideoOff((prev) => !prev)}
          activeOpacity={0.7}
        >
          <Icon
            name="camera"
            size={22}
            color={isVideoOff ? colors.light.error : '#FFFFFF'}
          />
          <Text style={styles.controlLabel}>{isVideoOff ? 'Start Cam' : 'Stop Cam'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlBtn}
          onPress={() => setIsFrontCamera((prev) => !prev)}
          activeOpacity={0.7}
        >
          <Icon name="camera-flip" size={22} color="#FFFFFF" />
          <Text style={styles.controlLabel}>Flip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.endCallBtn}
          onPress={handleEndCall}
          activeOpacity={0.7}
        >
          <Icon name="close" size={24} color="#FFFFFF" />
          <Text style={styles.endCallLabel}>End</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#071613',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  securityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(201, 162, 39, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(201, 162, 39, 0.3)',
  },
  securityText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.light.accent,
  },
  channelLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'monospace',
  },
  ringingStage: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 40,
  },
  callerName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 8,
  },
  callerSub: {
    color: colors.light.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  connectingPill: {
    backgroundColor: 'rgba(15, 76, 69, 0.4)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.light.primary,
    marginTop: 16,
  },
  connectingText: {
    color: '#E8F5F1',
    fontSize: 12,
    fontWeight: '600',
  },
  videoStage: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: '#0F2621',
    borderWidth: 1,
    borderColor: '#183D35',
    justifyContent: 'space-between',
    padding: 24,
    marginVertical: 16,
  },
  stageOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: 12,
  },
  connectedName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  timerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.light.error,
  },
  callTimer: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  viewportFooter: {
    alignItems: 'center',
  },
  cameraStatus: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 11,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
  },
  controlBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#183831',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#254E45',
    gap: 3,
  },
  controlBtnActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: colors.light.error,
  },
  controlLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  endCallBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.light.error,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  endCallLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: 24,
    gap: 14,
  },
  endedIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.light.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.light.primary,
    marginBottom: 8,
  },
  endedTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  durationSummary: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.light.accent,
  },
  endedNote: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
    marginBottom: 12,
  },
  returnBtn: {
    width: '100%',
    maxWidth: 280,
  },
});
