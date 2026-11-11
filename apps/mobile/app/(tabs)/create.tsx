import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { colors } from '../../src/theme/colors';
import { api } from '../../src/api';
import { useAuthStore } from '../../src/store/authStore';

export default function CreateScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [type, setType] = useState<'reel' | 'video' | 'text'>('reel');
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('HadithSciences, AuthenticKnowledge');
  const [visibility, setVisibility] = useState<'public' | 'followers'>('public');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [trimDuration, setTrimDuration] = useState('00:00 - 01:25');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const isScholar = Boolean(user?.roles?.includes('scholar') || user?.roles?.includes('admin'));

  if (!isScholar) {
    return (
      <View style={styles.restrictedContainer}>
        <Text style={styles.restrictedTitle}>Accredited Scholar Publishing Only</Text>
        <Text style={styles.restrictedDesc}>
          Sanad strictly reserves publishing rights to verified religious scholars and accredited academics to protect authenticity and prevent unverified legal rulings.
        </Text>
        <Button
          title="Apply for Scholar Verification"
          onPress={() => router.push('/scholar/apply')}
          variant="accent"
        />
      </View>
    );
  }

  const handlePickMedia = (source: 'record' | 'gallery') => {
    setSelectedFile(source === 'record' ? 'recorded_lesson_stream.mp4' : 'gallery_lecture_upload.mp4');
    setUploadError(null);
  };

  const handlePublish = async () => {
    if (!caption.trim()) {
      Alert.alert('Required Field', 'Please provide a lesson title or caption.');
      return;
    }
    if (type !== 'text' && !selectedFile) {
      Alert.alert('Media Required', 'Please select or record a video lesson before publishing.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(15);

    try {
      // Simulate direct upload progress
      await new Promise((r) => setTimeout(r, 400));
      setUploadProgress(50);
      await new Promise((r) => setTimeout(r, 400));
      setUploadProgress(85);
      await new Promise((r) => setTimeout(r, 300));
      setUploadProgress(100);

      const parsedTags = tags
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean);

      await api.content.createPost({
        type,
        caption: caption.trim(),
        tags: parsedTags,
        language: 'en',
        visibility,
        playbackId: type !== 'text' ? 'playback_mux_hls_stream_verified' : undefined,
      });

      setIsUploading(false);
      setUploadProgress(null);
      Alert.alert(
        'Lesson Published',
        'Your scholarly lesson is live on the Sanad feed and archived in your profile.',
        [{ text: 'View Feed', onPress: () => router.replace('/(tabs)/feed') }]
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Publish failed';
      setIsUploading(false);
      setUploadError(msg);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Publish Scholarly Lesson</Text>

      {/* Content Type Selector */}
      <View style={styles.selectorRow}>
        {(['reel', 'video', 'text'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.typeOption, type === t && styles.typeOptionActive]}
            onPress={() => setType(t)}
          >
            <Text style={[styles.typeText, type === t && styles.typeTextActive]}>
              {t === 'reel' ? 'Short Reel (90s)' : t === 'video' ? 'Masterclass (60m)' : 'Scholarly Text'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Constraints Banner */}
      <View style={styles.limitsBanner}>
        <Text style={styles.limitsText}>
          {type === 'reel'
            ? 'Client Limit: Max 90 seconds / 100MB · Vertical 9:16 format'
            : type === 'video'
            ? 'Client Limit: Max 60 minutes / 2GB · 1080p HLS Transcoded'
            : 'Text Statement: Max 2,200 characters with citation references'}
        </Text>
      </View>

      {/* Media Picker & Trimmer UI for video/reel */}
      {type !== 'text' && (
        <Card style={styles.card}>
          <Text style={styles.cardHeader}>Video Lesson Media</Text>

          {selectedFile ? (
            <View style={styles.previewBox}>
              <View style={styles.previewHeader}>
                <Text style={styles.fileNameText}>[SELECTED: {selectedFile}]</Text>
                <TouchableOpacity onPress={() => setSelectedFile(null)}>
                  <Text style={styles.removeText}>[REMOVE]</Text>
                </TouchableOpacity>
              </View>

              {/* Simulated Trimmer Bar */}
              <View style={styles.trimmerContainer}>
                <Text style={styles.trimmerLabel}>Trim Duration: {trimDuration}</Text>
                <View style={styles.trimmerTrack}>
                  <View style={styles.trimmerHandle} />
                  <View style={styles.trimmerActiveRange} />
                  <View style={styles.trimmerHandle} />
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.pickerBtnsRow}>
              <TouchableOpacity
                style={styles.pickerBtn}
                onPress={() => handlePickMedia('record')}
              >
                <Text style={styles.pickerBtnText}>[RECORD CAMERA]</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.pickerBtn}
                onPress={() => handlePickMedia('gallery')}
              >
                <Text style={styles.pickerBtnText}>[SELECT FROM FILE]</Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>
      )}

      {/* Metadata Form */}
      <Card style={styles.card}>
        <Input
          label="Lesson Title / Caption *"
          value={caption}
          onChangeText={setCaption}
          placeholder="State the core legal or theological principle examined..."
          multiline
          numberOfLines={3}
        />

        <Input
          label="Subject Tags (comma-separated)"
          value={tags}
          onChangeText={setTags}
          placeholder="e.g. Usul, Hadith, Bukhari, Fiqh"
        />

        {/* Visibility */}
        <Text style={styles.fieldLabel}>Publishing Visibility</Text>
        <View style={styles.visibilityRow}>
          <TouchableOpacity
            style={[styles.visBtn, visibility === 'public' && styles.visBtnActive]}
            onPress={() => setVisibility('public')}
          >
            <Text style={[styles.visText, visibility === 'public' && styles.visTextActive]}>
              Public (All Members)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.visBtn, visibility === 'followers' && styles.visBtnActive]}
            onPress={() => setVisibility('followers')}
          >
            <Text style={[styles.visText, visibility === 'followers' && styles.visTextActive]}>
              Followers Only
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* Upload Progress & Error Feedback */}
      {isUploading && (
        <Card style={styles.card}>
          <Text style={styles.uploadingText}>Direct Uploading to Mux: {uploadProgress}%</Text>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${uploadProgress || 0}%` }]} />
          </View>
        </Card>
      )}

      {uploadError && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>Upload Error: {uploadError}</Text>
          <Button title="Retry Upload" onPress={handlePublish} style={styles.retryBtn} />
        </View>
      )}

      {/* Submit Button */}
      <Button
        title={isUploading ? 'Uploading Media...' : 'Publish to Verified Feed'}
        onPress={handlePublish}
        loading={isUploading}
        disabled={isUploading}
        style={styles.publishBtn}
      />
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
    gap: 14,
  },
  restrictedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.light.background,
  },
  restrictedTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.light.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  restrictedDesc: {
    fontSize: 13,
    color: colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 19,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.light.primary,
  },
  selectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.light.surface,
    borderWidth: 1,
    borderColor: colors.light.border,
    alignItems: 'center',
  },
  typeOptionActive: {
    backgroundColor: colors.light.primary,
    borderColor: colors.light.primaryDark,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.light.text,
  },
  typeTextActive: {
    color: '#FFFFFF',
  },
  limitsBanner: {
    backgroundColor: colors.light.surfaceElevated,
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  limitsText: {
    fontSize: 11,
    color: colors.light.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  card: {
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.light.primary,
  },
  pickerBtnsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  pickerBtn: {
    flex: 1,
    backgroundColor: colors.light.surfaceElevated,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.light.border,
    alignItems: 'center',
  },
  pickerBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.light.primary,
  },
  previewBox: {
    backgroundColor: colors.light.surfaceElevated,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fileNameText: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: colors.light.primary,
  },
  removeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.light.error,
  },
  trimmerContainer: {
    marginTop: 6,
    gap: 6,
  },
  trimmerLabel: {
    fontSize: 11,
    color: colors.light.textSecondary,
  },
  trimmerTrack: {
    height: 14,
    backgroundColor: colors.light.border,
    borderRadius: 4,
    position: 'relative',
    justifyContent: 'center',
  },
  trimmerActiveRange: {
    position: 'absolute',
    left: '10%',
    right: '15%',
    height: '100%',
    backgroundColor: colors.light.accent,
    borderRadius: 4,
  },
  trimmerHandle: {
    width: 6,
    height: 18,
    backgroundColor: colors.light.primary,
    borderRadius: 3,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.light.text,
  },
  visibilityRow: {
    flexDirection: 'row',
    gap: 10,
  },
  visBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: colors.light.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.light.border,
    alignItems: 'center',
  },
  visBtnActive: {
    borderColor: colors.light.primary,
    backgroundColor: '#EDF5F3',
  },
  visText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.light.textSecondary,
  },
  visTextActive: {
    color: colors.light.primary,
    fontWeight: '700',
  },
  uploadingText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.light.primary,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: colors.light.surfaceElevated,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.light.primary,
  },
  errorBox: {
    backgroundColor: '#FDE8E8',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  errorText: {
    fontSize: 12,
    color: colors.light.error,
    fontWeight: '600',
  },
  retryBtn: {
    backgroundColor: colors.light.error,
  },
  publishBtn: {
    marginTop: 8,
  },
});
