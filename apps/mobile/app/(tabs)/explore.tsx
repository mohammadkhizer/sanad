import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../src/theme/colors';
import { ScholarCard } from '../../src/components/ScholarCard';
import { Input } from '../../src/components/Input';
import { useAuthStore } from '../../src/store/authStore';

const SPECIALTIES = ['All', 'Hadith', 'Fiqh', 'Tafsir', 'Aqeedah', 'Seerah', 'Ethics'];

// Sample verified scholars catalogue for discovery
const SAMPLE_SCHOLARS = [
  {
    id: 'scholar-1',
    displayName: 'Dr. Ahmad Al-Qadi',
    institution: 'Al-Azhar University, Faculty of Shariah',
    specialties: ['Fiqh', 'Hadith', 'Ethics'],
    avatarUrl: undefined,
    isFollowing: false,
  },
  {
    id: 'scholar-2',
    displayName: 'Sheikh Omar Al-Madani',
    institution: 'Islamic University of Madinah',
    specialties: ['Hadith', 'Seerah'],
    avatarUrl: undefined,
    isFollowing: true,
  },
  {
    id: 'scholar-3',
    displayName: 'Ustadh Tariq Al-Hashimi',
    institution: 'Zaytuna College & Research Institute',
    specialties: ['Tafsir', 'Aqeedah'],
    avatarUrl: undefined,
    isFollowing: false,
  },
  {
    id: 'scholar-4',
    displayName: 'Dr. Maryam Al-Bukhari',
    institution: 'Al-Qarawiyyin University',
    specialties: ['Hadith Sciences', 'Women in Fiqh'],
    avatarUrl: undefined,
    isFollowing: false,
  },
];

export default function ExploreScreen() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [search, setSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [scholars, setScholars] = useState(SAMPLE_SCHOLARS);

  const filteredScholars = scholars.filter((s) => {
    const matchesSearch =
      s.displayName.toLowerCase().includes(search.toLowerCase()) ||
      s.institution.toLowerCase().includes(search.toLowerCase());
    const matchesSpecialty =
      selectedSpecialty === 'All' || s.specialties.includes(selectedSpecialty);
    return matchesSearch && matchesSpecialty;
  });

  const toggleFollow = (id: string) => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    setScholars((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isFollowing: !s.isFollowing } : s))
    );
  };

  const handleRequestChat = (scholar: typeof SAMPLE_SCHOLARS[0]) => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }
    Alert.prompt
      ? Alert.prompt(
          'Request Consultation',
          `Submit a formal question or consultation request to ${scholar.displayName}:`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Submit Request',
              onPress: () => {
                Alert.alert(
                  'Request Submitted',
                  'Your request has been delivered to the scholar for review.'
                );
              },
            },
          ]
        )
      : Alert.alert(
          'Request Consultation',
          `Would you like to send a 1:1 question request to ${scholar.displayName}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Send Request',
              onPress: () => {
                Alert.alert(
                  'Request Submitted',
                  'Your consultation request has been forwarded to the scholar.'
                );
              },
            },
          ]
        );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchSection}>
        <Input
          placeholder="Search verified scholars, faculties, or credentials..."
          value={search}
          onChangeText={setSearch}
          containerStyle={styles.searchInputContainer}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
        >
          {SPECIALTIES.map((spec) => {
            const isSelected = selectedSpecialty === spec;
            return (
              <TouchableOpacity
                key={spec}
                style={[styles.filterPill, isSelected ? styles.filterPillActive : null]}
                onPress={() => setSelectedSpecialty(spec)}
              >
                <Text
                  style={[styles.filterText, isSelected ? styles.filterTextActive : null]}
                >
                  {spec}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={filteredScholars}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <ScholarCard
            id={item.id}
            displayName={item.displayName}
            institution={item.institution}
            specialties={item.specialties}
            isFollowing={item.isFollowing}
            onFollowPress={() => toggleFollow(item.id)}
            onRequestChatPress={() => handleRequestChat(item)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.light,
  },
  searchSection: {
    padding: theme.spacing.base,
    backgroundColor: theme.colors.surface.light,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  searchInputContainer: {
    marginBottom: theme.spacing.sm,
  },
  filterScroll: {
    marginTop: 4,
  },
  filterContainer: {
    paddingRight: theme.spacing.base,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: '#EAE6DC',
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: theme.colors.brand.emerald,
  },
  filterText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.primaryLight,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: theme.spacing.base,
  },
});

