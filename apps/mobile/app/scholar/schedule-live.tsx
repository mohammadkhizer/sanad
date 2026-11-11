import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { colors } from '../../src/theme/colors';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
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
        [{ text: 'Return to Dashboard', onPress: () => router.replace('/scholar/dashboard') }]
      );
    },
    onError: (e: Error) => {
      Alert.alert('Error', e.message);
    },
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Schedule Live Broadcast</Text>
      <Text style={styles.subHeader}>
        Host an authentic study circle, book reading, or interactive legal Q&A session.
      </Text>

      <Card style={styles.card}>
        <Input
          label="Session Title *"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Critical Analysis of Sahih Bukhari Narrations"
        />

        <Input
          label="Syllabus & Topics Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Outline the texts to be examined and target audience..."
          multiline
          numberOfLines={4}
        />

        <Input
          label="Scheduled Date and Time"
          value={scheduledTime}
          onChangeText={setScheduledTime}
          placeholder="e.g. 2026-11-15 17:00 UTC"
        />

        <View style={styles.noticeBox}>
          <Text style={styles.noticeTitle}>[BROADCAST GUIDELINES]</Text>
          <Text style={styles.noticeText}>
            All live sessions are recorded for the Sanad scholarly archive. Respect prayer times and adhere to the Sanad Content Policy against sectarian condemnation.
          </Text>
        </View>

        <Button
          title="Schedule Broadcast"
          onPress={() => scheduleMutation.mutate()}
          loading={scheduleMutation.isPending}
          style={styles.submitBtn}
        />
      </Card>
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
  header: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.light.primary,
  },
  subHeader: {
    fontSize: 13,
    color: colors.light.textSecondary,
    lineHeight: 18,
  },
  card: {
    padding: 16,
    gap: 14,
  },
  noticeBox: {
    backgroundColor: colors.light.surfaceElevated,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.light.accent,
  },
  noticeTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.light.accentText,
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 12,
    color: colors.light.textSecondary,
    lineHeight: 16,
  },
  submitBtn: {
    marginTop: 6,
  },
});

