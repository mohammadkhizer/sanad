import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';

export default function CallScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.callHeader}>
        <Text style={styles.callNotice}>[RECORDING NOTICE]</Text>
        <Text style={styles.noticeText}>
          Scholarly video calls are confidential. Recording without mutual consent is strictly
          prohibited.
        </Text>
      </View>

      <View style={styles.videoStage}>
        <Text style={styles.stageTitle}>1:1 Video Session</Text>
        <Text style={styles.roomLabel}>Room ID: {id}</Text>
      </View>

      {/* Call controls */}
      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={[styles.controlBtn, isMuted && styles.controlBtnActive]}
          onPress={() => setIsMuted((prev) => !prev)}
        >
          <Text style={styles.controlText}>{isMuted ? 'Unmute' : 'Mute'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlBtn, isVideoOff && styles.controlBtnActive]}
          onPress={() => setIsVideoOff((prev) => !prev)}
        >
          <Text style={styles.controlText}>{isVideoOff ? 'Start Video' : 'Stop Video'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.endCallBtn} onPress={() => router.back()}>
          <Text style={styles.endCallText}>End Call</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'space-between',
    padding: 20,
  },
  callHeader: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 12,
    borderRadius: 8,
  },
  callNotice: {
    color: colors.light.accent,
    fontWeight: '800',
    fontSize: 11,
    marginBottom: 4,
  },
  noticeText: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 16,
  },
  videoStage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  roomLabel: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 6,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  controlBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  controlBtnActive: {
    backgroundColor: colors.light.warning,
  },
  controlText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  endCallBtn: {
    backgroundColor: colors.light.error,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  endCallText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});

