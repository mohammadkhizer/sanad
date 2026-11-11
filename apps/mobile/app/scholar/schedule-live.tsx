import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { colors } from '../../src/theme/colors';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { AppHeader } from '../../src/components/AppHeader';
import { AccessGuard } from '../../src/components/AccessGuard';
import { Icon } from '../../src/components/Icon';
import { api } from '../../src/api';

export default function ScheduleLiveScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledTime, setScheduledTime] = useState('Tomorrow at 18:00 UTC');

  const scheduleMutation = useMutation({
    mutationFn: async () => {
      if (title.trim().length < 3) {
        throw new Error('Title must be at least 3 characters');
      }
      return api.live.createLiveSession({
        title: title.trim(),
        description: description.trim(),
      });
    },
    onSuccess: (session) => {
      queryClient.invalidateQueries({ queryKey: ['liveSessions'] });
      Alert.alert(
        'Broadcast Scheduled',
        `Your live session "${session.title}" has been scheduled. Followers will be notified prior to broadcast.`,
        [{ text: 'Return to Studio', onPress: () => router.replace('/scholar/dashboard') }]
      );
    },
    onError: (e: Error) => {
      Alert.alert('Error', e.message);
    },
  });

  return (
    <AccessGuard
      requiredRole="scholar"
      title="Schedule Halaqah"
      subtitle="Accredited Scholar Portal"
    >
      <View style={styles.screen}>
      <AppHeader
        title="Schedule Halaqah"
        subtitle="Plan Live Interactive Session"
        showBack
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.cardIntro}>
            Set up an authentic study circle, book reading, or interactive jurisprudence Q&A session. Registered students will receive notification prior to broadcast.
          </Text>

          <Input
            label="Session Title *"
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Critical Analysis of Sahih Bukhari Narrations"
          />

          <Input
            label="Curriculum and Texts Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Outline texts to be examined, chapters, and Q&A protocols..."
            multiline
            numberOfLines={4}
          />

          <Input
            label="Scheduled Date and Time *"
            value={scheduledTime}
            onChangeText={setScheduledTime}
            placeholder="e.g. 2026-11-15 17:00 UTC"
          />

          <View style={styles.guidelineCard}>
            <View style={styles.guidelineHeader}>
              <Icon name="shield" size={16} color={colors.light.accent} />
              <Text style={styles.guidelineTitle}>Broadcast Standards</Text>
            </View>
            <Text style={styles.guidelineText}>
              All live sessions are automatically archived into the Sanad permanent curriculum. Please ensure respect for regional prayer times and adherence to academic discourse guidelines.
            </Text>
          </View>

          <Button
            title="Confirm Scheduled Broadcast"
            variant="accent"
            onPress={() => scheduleMutation.mutate()}
            loading={scheduleMutation.isPending}
            style={styles.submitBtn}
          />
        </Card>
      </ScrollView>
    </View>
    </AccessGuard>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    padding: 18,
    borderRadius: 14,
    gap: 14,
  },
  cardIntro: {
    fontSize: 13,
    color: colors.light.textSecondary,
    lineHeight: 19,
    marginBottom: 4,
  },
  guidelineCard: {
    backgroundColor: colors.light.background,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.light.border,
    borderLeftWidth: 4,
    borderLeftColor: colors.light.accent,
    gap: 6,
  },
  guidelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  guidelineTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.light.primary,
  },
  guidelineText: {
    fontSize: 12,
    color: colors.light.textSecondary,
    lineHeight: 18,
  },
  submitBtn: {
    marginTop: 6,
  },
});
