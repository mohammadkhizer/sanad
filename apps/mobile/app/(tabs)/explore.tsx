import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../src/api';
import { colors } from '../../src/theme/colors';
import { Card } from '../../src/components/Card';
import { Avatar } from '../../src/components/Avatar';
import { VerifiedBadge } from '../../src/components/VerifiedBadge';
import { Input } from '../../src/components/Input';
import { useRouter } from 'expo-router';
import { LiveSessionEntity, UserEntity } from '@sanad/shared';

const POPULAR_TOPICS = [
  'Hadith Sciences',
  'Usul al-Fiqh',
  'Tafsir al-Quran',
  'Islamic Finance',
  'Manuscript Heritage',
  'Classical Arabic',
];

export default function ExploreScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const { data: livesData } = useQuery<LiveSessionEntity[]>({
    queryKey: ['activeLives'],
    queryFn: () => api.live.getLiveSessions(),
  });

  const { data: scholarsData } = useQuery<UserEntity[]>({
    queryKey: ['exploreScholars', search],
    queryFn: () => api.moderation.getUsers(search),
  });

  const lives = livesData || [];
  const scholars = (scholarsData || []).filter((u) => u.roles.includes('scholar'));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Input
        label="Search Verified Knowledge"
        placeholder="Search accredited scholars, Hadith, Fiqh, topics..."
        value={search}
        onChangeText={setSearch}
      />

      {/* Active Live Broadcasts */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Active Study Circles</Text>
        <View style={styles.badgeLive}>
          <Text style={styles.badgeLiveText}>[LIVE NOW]</Text>
        </View>
      </View>

      {lives.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            No live study circles currently broadcasting. Scheduled sessions will appear here.
          </Text>
        </Card>
      ) : (
        lives.map((session) => {
          const host = typeof session.hostId === 'object' ? session.hostId : null;
          return (
            <TouchableOpacity
              key={session._id}
              activeOpacity={0.8}
              onPress={() => router.push(`/live/${session._id}`)}
            >
              <Card style={styles.liveCard}>
                <View style={styles.liveRow}>
                  <Avatar
                    name={host?.displayName || 'Host Scholar'}
                    url={host?.avatarUrl}
                    size={44}
                  />
                  <View style={styles.liveInfo}>
                    <Text style={styles.liveTitle}>{session.title}</Text>
                    <Text style={styles.liveHost}>
                      {host?.displayName || 'Accredited Teacher'}
                    </Text>
                    <Text style={styles.viewersCount}>
                      {session.viewerCount} verified learners watching
                    </Text>
                  </View>
                  <View style={styles.joinPill}>
                    <Text style={styles.joinText}>Join</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          );
        })
      )}

      {/* Verified Scholars Directory */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Verified Scholars</Text>
      </View>

      <View style={styles.scholarsList}>
        {scholars.map((sch) => (
          <TouchableOpacity
            key={sch._id}
            onPress={() => router.push(`/scholar/${sch._id}`)}
          >
            <Card style={styles.scholarCard}>
              <View style={styles.scholarRow}>
                <Avatar name={sch.displayName} url={sch.avatarUrl} size={42} />
                <View style={styles.scholarInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.scholarName}>{sch.displayName}</Text>
                    <VerifiedBadge size="small" />
                  </View>
                  <Text style={styles.scholarInst} numberOfLines={1}>
                    {sch.scholarProfile?.institution || 'Accredited Institution'}
                  </Text>
                  <Text style={styles.scholarSpecialties} numberOfLines={1}>
                    {sch.scholarProfile?.specialties?.join(', ') || 'Classical Islamic Sciences'}
                  </Text>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </View>

      {/* Featured Topics */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Curated Fields of Study</Text>
      </View>

      <View style={styles.topicsGrid}>
        {POPULAR_TOPICS.map((topic, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.topicCard}
            onPress={() => setSearch(topic)}
          >
            <Text style={styles.topicTitle}>{topic}</Text>
            <Text style={styles.topicSub}>Explore verified lessons</Text>
          </TouchableOpacity>
        ))}
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
    paddingBottom: 40,
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.light.primary,
  },
  badgeLive: {
    backgroundColor: colors.light.error,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeLiveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  emptyCard: {
    padding: 14,
  },
  emptyText: {
    fontSize: 12,
    color: colors.light.textSecondary,
    lineHeight: 18,
  },
  liveCard: {
    padding: 12,
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
    fontSize: 14,
    fontWeight: '700',
    color: colors.light.text,
  },
  liveHost: {
    fontSize: 12,
    color: colors.light.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  viewersCount: {
    fontSize: 11,
    color: colors.light.textSecondary,
    marginTop: 2,
  },
  joinPill: {
    backgroundColor: colors.light.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  joinText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  scholarsList: {
    gap: 10,
  },
  scholarCard: {
    padding: 12,
  },
  scholarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scholarInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scholarName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.light.text,
  },
  scholarInst: {
    fontSize: 12,
    color: colors.light.primary,
    fontWeight: '600',
    marginTop: 1,
  },
  scholarSpecialties: {
    fontSize: 11,
    color: colors.light.textSecondary,
    marginTop: 2,
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  topicCard: {
    width: '48%',
    backgroundColor: colors.light.surface,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.light.border,
    gap: 4,
  },
  topicTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.light.primary,
  },
  topicSub: {
    fontSize: 11,
    color: colors.light.textSecondary,
  },
});
