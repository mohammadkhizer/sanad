import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { colors } from '../../src/theme/colors';
import { apiClient } from '../../src/api/client';

export default function ScholarDashboardScreen() {
  const router = useRouter();

  const [liveTitle, setLiveTitle] = useState('');
  const [liveDesc, setLiveDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartLive = async () => {
    if (!liveTitle.trim()) {
      setError('Please provide a title for your live circle');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await apiClient<{ session: any; token: string }>('/live', {
        method: 'POST',
        body: JSON.stringify({
          title: liveTitle.trim(),
          description: liveDesc.trim() || undefined,
        }),
      });

      router.push(`/live/${res.session._id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to start live stream');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Scholar Control Panel</Text>

      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Start Live Circle</Text>
        <Text style={styles.sectionSubtitle}>
          Broadcast live video lectures to your followers with real-time moderated chat.
        </Text>

        {Boolean(error) && <Text style={styles.errorBanner}>{error}</Text>}

        <Input
          label="Live Circle Title"
          placeholder="e.g. Explanation of Sahih Al-Bukhari Book of Knowledge"
          value={liveTitle}
          onChangeText={setLiveTitle}
        />

        <Input
          label="Description (Optional)"
          placeholder="Topics covered, Q&A guidelines..."
          value={liveDesc}
          onChangeText={setLiveDesc}
          multiline
        />

        <Button
          title="Go Live Now"
          variant="accent"
          onPress={handleStartLive}
          loading={loading}
          style={styles.liveBtn}
        />
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
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.light.primary,
    marginBottom: 20,
  },
  form: {
    backgroundColor: colors.light.surface,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.light.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    color: colors.light.error,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 13,
  },
  liveBtn: {
    marginTop: 8,
  },
});

