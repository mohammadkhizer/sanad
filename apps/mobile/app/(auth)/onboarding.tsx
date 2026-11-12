import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { Button } from '../../src/components/Button';
import { Icon, IconName } from '../../src/components/Icon';

interface Slide {
  badge: string;
  icon: IconName;
  title: string;
  subtitle: string;
  detail: string;
}

const slides: Slide[] = [
  {
    badge: 'Chains of Transmission',
    icon: 'verified',
    title: 'Authentic Knowledge, Verified Lineage',
    subtitle: 'Sanad connects you directly with accredited traditional and academic scholars.',
    detail: 'Only verified scholars can publish video lessons and answer legal questions.',
  },
  {
    badge: 'Scholarly Curriculum',
    icon: 'reels',
    title: 'Focused, Non-Addictive Learning',
    subtitle: 'Benefit from bite-sized reels and deep masterclasses without algorithmic noise.',
    detail: 'No engagement traps or unverified opinions. Every post has a verifiable academic author.',
  },
  {
    badge: 'Direct Consultation',
    icon: 'call',
    title: 'Respectful One-on-One Inquiries',
    subtitle: 'Seek counsel through formal inquiries and scheduled encrypted video consultations.',
    detail: 'Clear academic boundaries, mutual respect, and prayer-time quiet hours built-in.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);

  const current = slides[activeSlide];

  const handleNext = () => {
    if (activeSlide < slides.length - 1) {
      setActiveSlide(activeSlide + 1);
    } else {
      router.replace('/(auth)/register');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.emblemBox}>
          <Icon name="verified" size={40} color={colors.light.accent} />
        </View>
        <Text style={styles.brandTitle}>SANAD</Text>
        <Text style={styles.brandArabic}>سند · المعرفة الموثوقة</Text>
        <Text style={styles.tagline}>Knowledge with an unbroken chain of trust</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.badgeRow}>
            <View style={styles.badgeContainer}>
              <Icon name={current.icon} size={14} color={colors.light.primary} />
              <Text style={styles.badgeText}>{current.badge}</Text>
            </View>
          </View>
          <Text style={styles.title}>{current.title}</Text>
          <Text style={styles.subtitle}>{current.subtitle}</Text>
          <Text style={styles.detail}>{current.detail}</Text>
        </View>

        <View style={styles.dotsRow}>
          {slides.map((_, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => setActiveSlide(idx)}
              style={[styles.dot, activeSlide === idx && styles.dotActive]}
              activeOpacity={0.7}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={activeSlide === slides.length - 1 ? 'Begin Your Studies' : 'Continue'}
          variant="primary"
          onPress={handleNext}
          style={styles.nextBtn}
        />

        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => router.replace('/(tabs)/feed')}
        >
          <Text style={styles.skipText}>Explore as Guest</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
    justifyContent: 'space-between',
    paddingVertical: 36,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  emblemBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.light.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.light.accent,
    marginBottom: 8,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.light.primary,
    letterSpacing: 3,
  },
  brandArabic: {
    fontSize: 14,
    color: colors.light.accentDark,
    fontWeight: '600',
    marginTop: 2,
  },
  tagline: {
    fontSize: 12,
    color: colors.light.textSecondary,
    marginTop: 4,
  },
  content: {
    paddingHorizontal: 24,
    justifyContent: 'center',
    flexGrow: 1,
    gap: 20,
  },
  card: {
    backgroundColor: colors.light.surface,
    padding: 24,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.light.border,
    gap: 12,
  },
  badgeRow: {
    flexDirection: 'row',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 76, 69, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(15, 76, 69, 0.15)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.light.primary,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.light.primary,
    lineHeight: 26,
  },
  subtitle: {
    fontSize: 14,
    color: colors.light.text,
    lineHeight: 20,
    fontWeight: '600',
  },
  detail: {
    fontSize: 13,
    color: colors.light.textSecondary,
    lineHeight: 19,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.light.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.light.accent,
  },
  footer: {
    paddingHorizontal: 24,
    gap: 10,
  },
  nextBtn: {
    width: '100%',
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.light.textMuted,
  },
});
