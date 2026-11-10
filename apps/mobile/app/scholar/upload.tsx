import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../src/theme/colors';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { apiFetch, ApiError } from '../../src/api/client';
import { useAuthStore } from '../../src/store/authStore';

export default function ScholarUploadScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [type, setType] = useState<'reel' | 'video'>('reel');
  const [caption, setCaption] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleUpload = async () => {
    if (!caption.trim()) {
      setErrorMsg('Please enter a descriptive caption for your scholarly content.');
      return;
    }

    // Per SDD: Scholar must have 2FA enabled
    if (!user?.twoFA?.enabled) {
      Alert.alert(
        '2FA Mandate',
        'In accordance with Sanad security rules, verified scholars must have Two-Factor Authentication enabled before publishing content.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Setup 2FA', onPress: () => router.push('/(tabs)/profile') },
        ]
      );
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Request direct upload URL
      await apiFetch<any>('/posts/upload-url', { method: 'POST' });

      // 2. Publish post record
      const tags = tagsStr
        .split(',')
        .map((t) => t.trim().toLowerCase().replace(/^#/, ''))
        .filter(Boolean);

      await apiFetch('/posts', {
        method: 'POST',
        body: JSON.stringify({
          type,
          caption,
          tags: tags.length ? tags : ['hadith', 'fiqh'],
          language,
          visibility: 'public',
        }),
      });

      Alert.alert(
        'Lecture Published',
        'Your content is live on the Sanad feed for community learning.',
        [{ text: 'View Feed', onPress: () => router.replace('/(tabs)/feed') }]
      );
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Failed to publish content. Please check your network.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Publish Scholarly Media</Text>
        <Text style={styles.subtext}>
          Share verified knowledge with students and followers worldwide.
        </Text>

        {errorMsg ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        {/* Media Type Selector */}
        <Text style={styles.label}>Content Format</Text>
        <View style={styles.typeSelectorRow}>
          <TouchableOpacity
            style={[styles.typeBtn, type === 'reel' ? styles.typeBtnActive : null]}
            onPress={() => setType('reel')}
          >
            <Text style={[styles.typeText, type === 'reel' ? styles.typeTextActive : null]}>
              Short Reel (Vertical)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, type === 'video' ? styles.typeBtnActive : null]}
            onPress={() => setType('video')}
          >
            <Text style={[styles.typeText, type === 'video' ? styles.typeTextActive : null]}>
              Standard Lecture (16:9)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Video Attachment Simulator */}
        <View style={styles.attachmentBox}>
          <Text style={styles.attachmentTitle}>Video Media</Text>
          <Text style={styles.attachmentSub}>
            Direct Mux & Cloudflare Stream transcoding pipeline. Adaptive HLS playback enabled.
          </Text>
          <Button
            title="Attach Video File (MP4/MOV)"
            variant="outline"
            size="sm"
            onPress={() => Alert.alert('Video Attached', 'Sample media ready for processing.')}
            style={{ marginTop: 8 }}
          />
        </View>

        <Input
          label="Caption / Topic Summary"
          placeholder="State the core Hadith, Ayah, or Fiqh question addressed in this lecture..."
          value={caption}
          onChangeText={setCaption}
          multiline
          numberOfLines={4}
          style={{ minHeight: 100 }}
        />

        <Input
          label="Topics & Tags"
          placeholder="e.g. hadith, purification, salah, zakat"
          value={tagsStr}
          onChangeText={setTagsStr}
          helperText="Comma-separated topics for student discovery."
        />

        <Input
          label="Spoken Language"
          placeholder="e.g. Arabic, English, Urdu"
          value={language}
          onChangeText={setLanguage}
        />

        <Button
          title="Publish Content"
          variant="primary"
          loading={loading}
          onPress={handleUpload}
          style={styles.publishBtn}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.base,
    backgroundColor: theme.colors.background.light,
  },
  card: {
    backgroundColor: theme.colors.surface.light,
    borderRadius: theme.radius.card,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text.primaryLight,
  },
  subtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondaryLight,
    marginTop: 4,
    marginBottom: theme.spacing.base,
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text.primaryLight,
    marginBottom: theme.spacing.xs,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.base,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#F3EFE6',
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderRadius: theme.radius.input,
    marginRight: 6,
  },
  typeBtnActive: {
    backgroundColor: theme.colors.brand.emerald,
    borderColor: theme.colors.brand.emeraldDark,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text.primaryLight,
  },
  typeTextActive: {
    color: '#FFFFFF',
  },
  attachmentBox: {
    backgroundColor: '#F9F7F1',
    padding: theme.spacing.base,
    borderRadius: theme.radius.input,
    borderWidth: 1,
    borderColor: '#E6E1D6',
    marginBottom: theme.spacing.base,
  },
  attachmentTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: 'bold',
    color: theme.colors.text.primaryLight,
  },
  attachmentSub: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondaryLight,
    marginTop: 2,
  },
  publishBtn: {
    marginTop: theme.spacing.base,
  },
  errorBox: {
    backgroundColor: '#FDF2F2',
    borderColor: theme.colors.semantic.error,
    borderWidth: 1,
    borderRadius: theme.radius.input,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.base,
  },
  errorText: {
    color: theme.colors.semantic.error,
    fontSize: theme.typography.fontSize.sm,
  },
});

