import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { AppHeader } from '../../src/components/AppHeader';
import { Icon } from '../../src/components/Icon';
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
      <View style={styles.screen}>
        <AppHeader title="Scholarly Studio" subtitle="Accredited Publication Gate" />
        <View style={styles.restrictedContainer}>
          <View style={styles.restrictedIconBox}>
            <Icon name="verified" size={48} color={colors.light.accent} />
          </View>
          <Text style={styles.restrictedTitle}>Accredited Scholars Only</Text>
          <Text style={styles.restrictedDesc}>
            Sanad strictly reserves publication privileges to verified religious scholars and accredited academics to protect authenticity and preserve unbroken chains of transmission.
          </Text>
          <Button
            title="Apply for Scholar Verification"
            onPress={() => router.push('/scholar/apply')}
            variant="accent"
            style={styles.applyBtn}
          />
        </View>
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
      await new Promise((r) => setTimeout(r, 350));
      setUploadProgress(50);
      await new Promise((r) => setTimeout(r, 350));
      setUploadProgress(85);
      await new Promise((r) => setTimeout(r, 250));
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
    <View style={styles.screen}>
      <AppHeader
        title="Scholarly Studio"
        subtitle="Publish Verified Lesson"
        rightIcon="shield"
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Format Selector */}
        <View style={styles.selectorContainer}>
          <TouchableOpacity
            style={[styles.typeOption, type === 'reel' && styles.typeOptionActive]}
            onPress={() => setType('reel')}
            activeOpacity={0.7}
          >
            <Icon
              name="reels"
              size={18}
              color={type === 'reel' ? '#FFFFFF' : colors.light.primary}
            />
            <Text style={[styles.typeText, type === 'reel' && styles.typeTextActive]}>
              Short Reel
            </Text>
            <Text style={[styles.typeSubText, type === 'reel' && styles.typeSubTextActive]}>
              Max 90s
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeOption, type === 'video' && styles.typeOptionActive]}
            onPress={() => setType('video')}
            activeOpacity={0.7}
          >
            <Icon
              name="play"
              size={18}
              color={type === 'video' ? '#FFFFFF' : colors.light.primary}
            />
            <Text style={[styles.typeText, type === 'video' && styles.typeTextActive]}>
              Masterclass
            </Text>
            <Text style={[styles.typeSubText, type === 'video' && styles.typeSubTextActive]}>
              Up to 60m
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeOption, type === 'text' && styles.typeOptionActive]}
            onPress={() => setType('text')}
            activeOpacity={0.7}
          >
            <Icon
              name="bookmark"
              size={18}
              color={type === 'text' ? '#FFFFFF' : colors.light.primary}
            />
            <Text style={[styles.typeText, type === 'text' && styles.typeTextActive]}>
              Text Ruling
            </Text>
            <Text style={[styles.typeSubText, type === 'text' && styles.typeSubTextActive]}>
              2200 chars
            </Text>
          </TouchableOpacity>
        </View>

        {/* Media Selection / Capture */}
        {type !== 'text' && (
          <Card style={styles.card}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.cardHeader}>Video Lesson Media</Text>
              <Text style={styles.specBadge}>
                {type === 'reel' ? '9:16 Vertical · 100MB' : '1080p HLS · 2GB'}
              </Text>
            </View>

            {selectedFile ? (
              <View style={styles.selectedBox}>
                <View style={styles.fileDetailsRow}>
                  <View style={styles.fileIconBox}>
                    <Icon name="check" size={20} color={colors.light.primary} />
                  </View>
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName}>{selectedFile}</Text>
                    <Text style={styles.fileMeta}>Encoded for streaming · Duration {trimDuration}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setSelectedFile(null)}
                    style={styles.removeFileBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Icon name="trash" size={18} color={colors.light.error} />
                  </TouchableOpacity>
                </View>

                {/* Trimmer Controls */}
                <View style={styles.trimmerContainer}>
                  <View style={styles.trimmerLabelRow}>
                    <Text style={styles.trimmerLabel}>Playback Range</Text>
                    <Text style={styles.trimmerRange}>{trimDuration}</Text>
                  </View>
                  <View style={styles.trimmerTrack}>
                    <View style={styles.trimmerHandle} />
                    <View style={styles.trimmerActiveRange} />
                    <View style={styles.trimmerHandle} />
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.pickerGrid}>
                <TouchableOpacity
                  style={styles.mediaActionCard}
                  onPress={() => handlePickMedia('record')}
                  activeOpacity={0.7}
                >
                  <View style={styles.mediaActionIconBox}>
                    <Icon name="camera" size={26} color={colors.light.primary} />
                  </View>
                  <Text style={styles.mediaActionTitle}>Record Lesson</Text>
                  <Text style={styles.mediaActionSub}>Open camera studio</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.mediaActionCard}
                  onPress={() => handlePickMedia('gallery')}
                  activeOpacity={0.7}
                >
                  <View style={styles.mediaActionIconBox}>
                    <Icon name="paperclip" size={26} color={colors.light.primary} />
                  </View>
                  <Text style={styles.mediaActionTitle}>Choose File</Text>
                  <Text style={styles.mediaActionSub}>Upload from device</Text>
                </TouchableOpacity>
              </View>
            )}
          </Card>
        )}

        {/* Metadata Details */}
        <Card style={styles.card}>
          <Text style={styles.cardHeader}>Lesson Classification</Text>

          <Input
            label="Title / Core Thesis *"
            value={caption}
            onChangeText={setCaption}
            placeholder="State the theological or jurisprudential inquiry..."
            multiline
            numberOfLines={3}
          />

          <Input
            label="Subject Disciplines (Comma-separated)"
            value={tags}
            onChangeText={setTags}
            placeholder="e.g. Usul al-Fiqh, Hadith Sciences, Bukhari"
          />

          <Text style={styles.fieldLabel}>Distribution Visibility</Text>
          <View style={styles.visibilityRow}>
            <TouchableOpacity
              style={[styles.visBtn, visibility === 'public' && styles.visBtnActive]}
              onPress={() => setVisibility('public')}
              activeOpacity={0.7}
            >
              <Icon
                name="globe"
                size={16}
                color={visibility === 'public' ? colors.light.accent : colors.light.textMuted}
              />
              <Text style={[styles.visText, visibility === 'public' && styles.visTextActive]}>
                Public (Global Sanad Feed)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.visBtn, visibility === 'followers' && styles.visBtnActive]}
              onPress={() => setVisibility('followers')}
              activeOpacity={0.7}
            >
              <Icon
                name="lock"
                size={16}
                color={visibility === 'followers' ? colors.light.accent : colors.light.textMuted}
              />
              <Text style={[styles.visText, visibility === 'followers' && styles.visTextActive]}>
                Registered Students Only
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Upload Progress */}
        {isUploading && (
          <Card style={styles.card}>
            <View style={styles.uploadingHeader}>
              <Text style={styles.uploadingText}>Transcoding and Publishing</Text>
              <Text style={styles.uploadPercent}>{uploadProgress}%</Text>
            </View>
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

        <Button
          title={isUploading ? 'Transcoding...' : 'Publish to Authenticated Feed'}
          onPress={handlePublish}
          loading={isUploading}
          disabled={isUploading}
          variant="primary"
          style={styles.publishBtn}
        />
      </ScrollView>
    </View>
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
  restrictedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  restrictedIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.light.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.light.accent,
    marginBottom: 20,
  },
  restrictedTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.light.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  restrictedDesc: {
    fontSize: 14,
    color: colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    maxWidth: 320,
  },
  applyBtn: {
    width: '100%',
    maxWidth: 320,
  },
  selectorContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: colors.light.surface,
    borderWidth: 1,
    borderColor: colors.light.border,
    alignItems: 'center',
    gap: 4,
  },
  typeOptionActive: {
    backgroundColor: colors.light.primary,
    borderColor: colors.light.primaryDark,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.light.text,
  },
  typeTextActive: {
    color: '#FFFFFF',
  },
  typeSubText: {
    fontSize: 10,
    color: colors.light.textMuted,
  },
  typeSubTextActive: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  card: {
    padding: 16,
    borderRadius: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.light.primary,
  },
  specBadge: {
    fontSize: 11,
    color: colors.light.textMuted,
    fontWeight: '600',
  },
  pickerGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  mediaActionCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.light.background,
    borderWidth: 1,
    borderColor: colors.light.border,
    alignItems: 'center',
    gap: 6,
  },
  mediaActionIconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.light.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  mediaActionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.light.primary,
  },
  mediaActionSub: {
    fontSize: 11,
    color: colors.light.textMuted,
  },
  selectedBox: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: colors.light.background,
    borderWidth: 1,
    borderColor: colors.light.border,
    gap: 14,
  },
  fileDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fileIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.light.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.light.primary,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.light.text,
  },
  fileMeta: {
    fontSize: 11,
    color: colors.light.textMuted,
    marginTop: 2,
  },
  removeFileBtn: {
    padding: 6,
  },
  trimmerContainer: {
    gap: 8,
  },
  trimmerLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trimmerLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.light.textSecondary,
  },
  trimmerRange: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.light.primary,
  },
  trimmerTrack: {
    height: 28,
    borderRadius: 6,
    backgroundColor: colors.light.surface,
    borderWidth: 1,
    borderColor: colors.light.border,
    position: 'relative',
    justifyContent: 'center',
  },
  trimmerActiveRange: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: 4,
    bottom: 4,
    backgroundColor: 'rgba(15, 76, 69, 0.15)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.light.primary,
  },
  trimmerHandle: {
    width: 10,
    height: 20,
    backgroundColor: colors.light.accent,
    borderRadius: 2,
    position: 'absolute',
    left: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.light.primary,
    marginBottom: 8,
    marginTop: 4,
  },
  visibilityRow: {
    gap: 8,
  },
  visBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor: colors.light.background,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  visBtnActive: {
    backgroundColor: 'rgba(15, 76, 69, 0.08)',
    borderColor: colors.light.primary,
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
  uploadingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  uploadingText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.light.textSecondary,
  },
  uploadPercent: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.light.primary,
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.light.border,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.light.accent,
  },
  errorBox: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FDF2F2',
    borderWidth: 1,
    borderColor: '#F87171',
    gap: 8,
  },
  errorText: {
    fontSize: 12,
    color: colors.light.error,
    fontWeight: '600',
  },
  retryBtn: {
    alignSelf: 'flex-start',
  },
  publishBtn: {
    marginTop: 4,
  },
});
