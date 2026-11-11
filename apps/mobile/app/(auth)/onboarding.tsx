import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { Button } from '../../src/components/Button';

interface Slide {
  title: string;
  subtitle: string;
  detail: string;
  badge: string;
}

const slides: Slide[] = [
  {
    badge: '[CHAIN OF AUTHORITY]',
    title: 'Authentic Knowledge, Verified Lineage',
    subtitle: 'Sanad connects you directly with accredited traditional and academic scholars.',
    detail: 'Only verified scholars can publish lessons, host live sessions, and answer legal questions.',
  },
  {
    badge: '[SCHOLARLY REELS & LIVE]',
    title: 'Focused, Non-Addictive Learning',
    subtitle: 'Benefit from bite-sized reels and deep masterclasses without algorithmic noise.',
    detail: 'No engagement traps or unverified opinions. Every post has a verifiable author.',
  },
  {
    badge: '[DIRECT CONSULTATION]',
    title: 'Respectful 1:1 Inquiries',
    subtitle: 'Seek counsel through formal chat requests and scheduled video consultations.',
    detail: 'Clear boundaries, mutual respect, and prayer-time quiet hours built-in.',
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
        <Text style={styles.brandTitle}>SANAD</Text>
        <Text style={styles.brandArabic}>سند</Text>
        <Text style={styles.tagline}>Knowledge with a chain of trust</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{current.badge}</Text>
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
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={activeSlide === slides.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
        />
        <View style={styles.authLinks}>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginLink}>Already have an account? Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.light.primary,
    letterSpacing: 2,
  },
  brandArabic: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.light.accent,
    marginTop: -4,
  },
  tagline: {
    fontSize: 13,
    color: colors.light.textSecondary,
    marginTop: 4,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: colors.light.surface,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  badgeContainer: {
    backgroundColor: colors.light.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.light.accentText,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.light.primary,
    marginBottom: 12,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: 10,
    lineHeight: 22,
  },
  detail: {
    fontSize: 13,
    color: colors.light.textSecondary,
    lineHeight: 20,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
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
    backgroundColor: colors.light.primary,
  },
  footer: {
    padding: 24,
    gap: 12,
  },
  authLinks: {
    alignItems: 'center',
    marginTop: 4,
  },
  loginLink: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.light.primary,
  },
});

