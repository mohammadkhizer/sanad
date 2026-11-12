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
import { AppHeader } from '../../src/components/AppHeader';
import { Icon } from '../../src/components/Icon';
import { useRouter } from 'expo-router';
import { UserEntity } from '@sanad/shared';

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
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const { data: scholarsData } = useQuery<UserEntity[]>({
    queryKey: ['exploreScholars', search],
    queryFn: () => api.moderation.getUsers(search),
  });

  const scholars = (scholarsData || []).filter((u) => u.roles.includes('scholar'));

  return (
    <View style={styles.container}>
      <AppHeader
        title="Discover Knowledge"
        subtitle="Accredited teachers and authentic curriculum"
        rightIcon="filter"
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Search Input Box with Vector Icon */}
        <View style={styles.searchBox}>
          <Icon name="search" size={18} color={colors.light.textMuted} />
          <Input
            placeholder="Search scholars, disciplines, Hadith, Fiqh..."
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>

        {/* Popular Disciplines Horizontal Scroll */}
        <View style={styles.topicsSection}>
          <Text style={styles.sectionTitle}>Curated Disciplines</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topicsScroll}>
            {POPULAR_TOPICS.map((topic) => {
              const isSelected = selectedTopic === topic;
              return (
                <TouchableOpacity
                  key={topic}
                  style={[styles.topicChip, isSelected && styles.topicChipActive]}
                  onPress={() => setSelectedTopic(isSelected ? null : topic)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.topicChipText, isSelected && styles.topicChipTextActive]}>
                    {topic}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Accredited Scholars Directory */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Accredited Scholars</Text>
          <TouchableOpacity onPress={() => router.push('/scholar/apply')}>
            <Text style={styles.applyLinkText}>Apply as Scholar</Text>
          </TouchableOpacity>
        </View>

        {scholars.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              Scholars registered in the database will appear here once accredited.
            </Text>
          </Card>
        ) : (
          scholars.map((scholar) => (
            <Card key={scholar._id} style={styles.scholarCard}>
              <TouchableOpacity
                style={styles.scholarRow}
                onPress={() => router.push(`/scholar/${scholar._id}`)}
                activeOpacity={0.8}
              >
                <Avatar name={scholar.displayName} url={scholar.avatarUrl} size={50} />
                <View style={styles.scholarDetails}>
                  <View style={styles.scholarNameRow}>
                    <Text style={styles.scholarName}>{scholar.displayName}</Text>
                    <VerifiedBadge size="small" />
                  </View>
                  {Boolean(scholar.scholarProfile?.institution) && (
                    <Text style={styles.scholarInst}>
                      {scholar.scholarProfile?.institution}
                    </Text>
                  )}
                  {Boolean(scholar.bio) && (
                    <Text style={styles.scholarBio} numberOfLines={2}>
                      {scholar.bio}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>

              <View style={styles.scholarActions}>
                <TouchableOpacity
                  style={styles.actionBtnOutline}
                  onPress={() => router.push(`/chat/${scholar._id}`)}
                >
                  <Icon name="inbox" size={15} color={colors.light.primary} />
                  <Text style={styles.actionBtnOutlineText}>Consultation</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionBtnFill}
                  onPress={() => router.push(`/call/${scholar._id}`)}
                >
                  <Icon name="call" size={15} color={colors.light.accentText} />
                  <Text style={styles.actionBtnFillText}>Video Call</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

// Simple internal inline input to maintain styling
import { TextInput } from 'react-native';

interface InputWrapperProps {
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  style?: any;
}
function Input({ placeholder, value, onChangeText, style }: InputWrapperProps) {
  return (
    <TextInput
      placeholder={placeholder}
      placeholderTextColor={colors.light.textMuted}
      value={value}
      onChangeText={onChangeText}
      style={[
        {
          flex: 1,
          fontSize: 14,
          color: colors.light.text,
          paddingVertical: 10,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  content: {
    padding: 16,
    paddingBottom: 90,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.light.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.light.border,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  searchInput: {},
  topicsSection: {
    marginBottom: 20,
  },
  topicsScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  topicChip: {
    backgroundColor: colors.light.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  topicChipActive: {
    backgroundColor: colors.light.primary,
    borderColor: colors.light.primary,
  },
  topicChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.light.textSecondary,
  },
  topicChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.light.primary,
    letterSpacing: 0.2,
  },
  badgeLive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#B3261E',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeLiveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  applyLinkText: {
    color: colors.light.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyCard: {
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 13,
    color: colors.light.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  liveCard: {
    marginBottom: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(201, 162, 39, 0.4)',
    backgroundColor: colors.light.surface,
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  liveInfo: {
    flex: 1,
  },
  liveTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: 2,
  },
  liveHost: {
    fontSize: 13,
    color: colors.light.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  viewersCount: {
    fontSize: 11,
    color: colors.light.textMuted,
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.light.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  scholarCard: {
    marginBottom: 14,
    padding: 16,
  },
  scholarRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  scholarDetails: {
    flex: 1,
  },
  scholarNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  scholarName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.light.text,
  },
  scholarInst: {
    fontSize: 12,
    color: colors.light.accent,
    fontWeight: '600',
    marginBottom: 4,
  },
  scholarBio: {
    fontSize: 13,
    color: colors.light.textSecondary,
    lineHeight: 18,
  },
  scholarActions: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
    paddingTop: 12,
  },
  actionBtnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 38,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.light.primary,
  },
  actionBtnOutlineText: {
    color: colors.light.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  actionBtnFill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 38,
    borderRadius: 8,
    backgroundColor: colors.light.accent,
  },
  actionBtnFillText: {
    color: colors.light.accentText,
    fontSize: 13,
    fontWeight: '700',
  },
});
