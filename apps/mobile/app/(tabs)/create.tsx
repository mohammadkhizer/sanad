import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { colors } from '../../src/theme/colors';
import { apiClient } from '../../src/api/client';
import { useAuthStore } from '../../src/store/authStore';

export default function CreateScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [type, setType] = useState<'reel' | 'video' | 'text'>('reel');
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isScholar = Boolean(user?.roles?.includes('scholar') || user?.roles?.includes('admin'));

  if (!isScholar) {
    return (
      <View style={styles.restrictedContainer}>
        <Text style={styles.restrictedTitle}>Scholar Publishing Only</Text>
        <Text style={styles.restrictedDesc}>
          Only verified religious scholars with authenticated credentials can publish reels,
          lectures, and initiate live circles on Sanad.
        </Text>
        <Button
          title="Apply for Scholar Verification"
          onPress={() => router.push('/scholar/apply')}
          variant="accent"
        />
      </View>
    );
  }

  const handlePublish = async () => {
    if (!caption.trim()) {
      setError('Please provide a caption or lesson title');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const parsedTags = tags
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean);

      // Request upload slot
      let muxAssetId: string | undefined;
      let playbackId: string | undefined;

      if (type !== 'text') {
        const uploadSlot = await apiClient<{ uploadUrl: string; assetId: string }>(
          '/posts/upload-url',
          { method: 'POST' }
        );
        muxAssetId = uploadSlot.assetId;
        playbackId = `playback_${muxAssetId}`;
      }

      await apiClient('/posts', {
        method: 'POST',
        body: JSON.stringify({
          type,
          caption: caption.trim(),
          tags: parsedTags,
          muxAssetId,
          playbackId,
          visibility: 'public',
        }),
      });

      Alert.alert('Published', 'Your scholarly content has been published to the feed.');
      router.replace('/(tabs)/feed');
    } catch (err: any) {
      setError(err.message || 'Failed to publish content');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Publish Knowledge</Text>

      {/* Content Type Selector */}
      <View style={styles.selectorRow}>
        {(['reel', 'video', 'text'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.typeOption, type === t && styles.typeOptionActive]}
            onPress={() => setType(t)}
          >
            <Text style={[styles.typeText, type === t && styles.typeTextActive]}>
              {t === 'reel' ? 'Short Reel (90s)' : t === 'video' ? 'Lecture (60m)' : 'Written Text'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.form}>
        {Boolean(error) && <Text style={styles.errorBanner}>{error}</Text>}

        <Input
          label="Caption / Lesson Explanation"
          placeholder="Share your verified commentary, hadith explanation, or fatwa..."
          value={caption}
          onChangeText={setCaption}
          multiline
          numberOfLines={4}
          style={styles.captionInput}
        />

        <Input
          label="Tags (Comma separated)"
          placeholder="fiqh, purification, hadith"
          value={tags}
          onChangeText={setTags}
        />

        <Button
          title={type === 'text' ? 'Publish Article' : `Upload & Publish ${type.toUpperCase()}`}
          onPress={handlePublish}
          loading={loading}
          style={styles.publishBtn}
        />

        <View style={styles.divider} />

        <Button
          title="Go Live (Start Scholarly Circle)"
          variant="outline"
          onPress={() => router.push('/scholar/dashboard')}
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
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.light.primary,
    marginBottom: 16,
  },
  selectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  typeOption: {
    flex: 1,
    backgroundColor: colors.light.surface,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  typeOptionActive: {
    backgroundColor: colors.light.primary,
    borderColor: colors.light.primary,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.light.textSecondary,
  },
  typeTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  form: {
    backgroundColor: colors.light.surface,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  captionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    color: colors.light.error,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 13,
  },
  publishBtn: {
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: colors.light.border,
    marginVertical: 16,
  },
  restrictedContainer: {
    flex: 1,
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.light.background,
  },
  restrictedTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.light.primary,
    marginBottom: 12,
  },
  restrictedDesc: {
    fontSize: 14,
    color: colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
});

