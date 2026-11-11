import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../src/api/client';
import { colors } from '../../src/theme/colors';
import { Card } from '../../src/components/Card';
import { Avatar } from '../../src/components/Avatar';
import { VerifiedBadge } from '../../src/components/VerifiedBadge';
import { Input } from '../../src/components/Input';
import { useRouter } from 'expo-router';

export default function ExploreScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const { data: livesData } = useQuery<{ lives: any[] }>({
    queryKey: ['activeLives'],
    queryFn: () => apiClient<{ lives: any[] }>('/live'),
  });

  const lives = livesData?.lives || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Input
        label="Search Knowledge"
        placeholder="Search scholars, topics, fiqh, hadith..."
        value={search}
        onChangeText={setSearch}
      />

      {/* Active Live Streams Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Live Scholarly Circles</Text>
        <Text style={styles.badgeLive}>[LIVE NOW]</Text>
      </View>

      {lives.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            No live sessions active at this moment. Scheduled circles will appear here.
          </Text>
        </Card>
      ) : (
        lives.map((session) => (
          <TouchableOpacity
            key={session._id}
            activeOpacity={0.8}
            onPress={() => router.push(`/live/${session._id}`)}
          >
            <Card style={styles.liveCard}>
              <View style={styles.liveRow}>
                <Avatar
                  name={session.hostId.displayName}
                  url={session.hostId.avatarUrl}
                  size={44}
                />
                <View style={styles.liveInfo}>
                  <Text style={styles.liveTitle}>{session.title}</Text>
                  <Text style={styles.liveHost}>
                    {session.hostId.displayName}
                  </Text>
                  <Text style={styles.viewersCount}>
                    {session.viewerCount} watching
                  </Text>
                </View>
                <View style={styles.joinPill}>
                  <Text style={styles.joinText}>Join</Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ))
      )}

      {/* Topics */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Subjects</Text>
      </View>

      <View style={styles.topicsGrid}>
        {['Quranic Exegesis (Tafsir)', 'Hadith Sciences', 'Islamic Jurisprudence (Fiqh)', 'Creed & Theology (Aqidah)', 'Spiritual Purification (Tazkiyah)'].map(
          (topic, idx) => (
            <Card key={idx} style={styles.topicCard}>
              <Text style={styles.topicTitle}>{topic}</Text>
              <Text style={styles.topicSub}>Verified lessons & reels</Text>
            </Card>
          )
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  content: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light.primary,
  },
  badgeLive: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.light.error,
    letterSpacing: 0.5,
  },
  emptyCard: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.light.textSecondary,
    fontSize: 13,
    textAlign: 'center',
  },
  liveCard: {
    padding: 12,
    marginBottom: 10,
    borderColor: colors.light.accent,
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveInfo: {
    marginLeft: 12,
    flex: 1,
  },
  liveTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.light.text,
  },
  liveHost: {
    fontSize: 13,
    color: colors.light.primary,
    marginTop: 2,
  },
  viewersCount: {
    fontSize: 11,
    color: colors.light.textMuted,
    marginTop: 2,
  },
  joinPill: {
    backgroundColor: colors.light.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  joinText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  topicsGrid: {
    gap: 8,
  },
  topicCard: {
    padding: 14,
    marginBottom: 8,
  },
  topicTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.light.text,
  },
  topicSub: {
    fontSize: 12,
    color: colors.light.textSecondary,
    marginTop: 4,
  },
});

