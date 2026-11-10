import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { theme } from '../../src/theme/colors';
import { Button } from '../../src/components/Button';

export default function VideoCallScreen() {
  const router = useRouter();
  const { id: callId } = useLocalSearchParams<{ id: string }>();

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);

  const handleEndCall = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Remote Video Stream Viewport */}
      <View style={styles.remoteViewport}>
        <View style={styles.remotePlaceholder}>
          <Text style={styles.participantLabel}>Verified Scholar Consultation</Text>
          <Text style={styles.securitySub}>End-to-End Encrypted WebRTC LiveKit Session</Text>
        </View>

        {/* Local Participant Preview */}
        <View style={styles.localPreview}>
          <Text style={styles.localLabel}>You</Text>
        </View>
      </View>

      {/* In-Call Controls */}
      <View style={styles.controlsBar}>
        <TouchableOpacity
          style={[styles.controlBtn, isMuted ? styles.controlBtnActive : null]}
          onPress={() => setIsMuted(!isMuted)}
          accessibilityRole="button"
        >
          <Text style={styles.controlText}>{isMuted ? 'Unmute' : 'Mute'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlBtn, isVideoDisabled ? styles.controlBtnActive : null]}
          onPress={() => setIsVideoDisabled(!isVideoDisabled)}
          accessibilityRole="button"
        >
          <Text style={styles.controlText}>{isVideoDisabled ? 'Start Video' : 'Stop Video'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.endCallBtn}
          onPress={handleEndCall}
          accessibilityRole="button"
        >
          <Text style={styles.endCallText}>End Call</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E1512',
  },
  remoteViewport: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  remotePlaceholder: {
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  participantLabel: {
    color: theme.colors.accent.gold,
    fontSize: theme.typography.fontSize.xl,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  securitySub: {
    color: '#8C9A94',
    fontSize: theme.typography.fontSize.xs,
    marginTop: 6,
    textAlign: 'center',
  },
  localPreview: {
    position: 'absolute',
    top: 50,
    right: 16,
    width: 100,
    height: 140,
    backgroundColor: '#1B3B35',
    borderRadius: theme.radius.input,
    borderWidth: 1.5,
    borderColor: theme.colors.accent.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  localLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  controlsBar: {
    height: 100,
    backgroundColor: '#0A0E0C',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.base,
    borderTopWidth: 1,
    borderTopColor: '#1B2E27',
  },
  controlBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: theme.radius.pill,
    backgroundColor: '#1E332B',
  },
  controlBtnActive: {
    backgroundColor: theme.colors.semantic.warning,
  },
  controlText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  endCallBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.semantic.error,
  },
  endCallText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
