import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { colors } from '../../src/theme/colors';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { AppHeader } from '../../src/components/AppHeader';
import { Icon } from '../../src/components/Icon';
import { Avatar } from '../../src/components/Avatar';
import { VerifiedBadge } from '../../src/components/VerifiedBadge';

const DEVELOPER_PROFILE = {
  name: 'Mohammed Khizer Shaikh',
  title: 'Lead Software Architect & Senior Engineer',
  role: 'Creator & Architect of Sanad Platform',
  portfolioUrl: 'https://mohammedkhizershaikh.netlify.app',
  linkedinUrl: 'https://www.linkedin.com/in/mohammed-khizer-shaikh',
  githubUrl: 'https://github.com/mohammedkhizer',
  location: 'Global / Remote',
  specializations: [
    'Resilient Monorepos & Distributed Systems',
    'Strict Role-Based Access Control (RBAC)',
    'Classical Isnad Chain-of-Transmission Verification',
    'Zero-Tolerance Security & Content Governance',
    'Cross-Platform React Native (Expo SDK 58)',
    'TypeScript Strict Architecture & Fastify/Express APIs',
  ],
  bio: 'Senior software engineer and systems architect dedicated to constructing high-integrity platforms. Architected Sanad from foundational protocols to frontend execution, uniting classical Islamic verification traditions with resilient modern cloud engineering.',
};

export default function DeveloperInfoScreen() {
  const handleOpenLink = async (url: string, label: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Unable to Open Link', `Could not navigate to ${label} URL: ${url}`);
      }
    } catch {
      Alert.alert('Navigation Error', `An error occurred while launching ${url}`);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Developer & Engineering"
        subtitle="Architectural leadership and credentials"
        showBack
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Developer Bio Card */}
        <Card style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <Avatar name={DEVELOPER_PROFILE.name} size={64} />
            <View style={styles.headerInfo}>
              <View style={styles.nameBadgeRow}>
                <Text style={styles.nameText}>{DEVELOPER_PROFILE.name}</Text>
                <VerifiedBadge size="small" />
              </View>
              <Text style={styles.titleText}>{DEVELOPER_PROFILE.title}</Text>
              <Text style={styles.roleText}>{DEVELOPER_PROFILE.role}</Text>
            </View>
          </View>
          <Text style={styles.bioText}>{DEVELOPER_PROFILE.bio}</Text>
        </Card>

        {/* Verified Links */}
        <Card style={styles.card}>
          <Text style={styles.cardHeader}>Verified Profiles & Portfolios</Text>

          {/* Portfolio */}
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => handleOpenLink(DEVELOPER_PROFILE.portfolioUrl, 'Portfolio')}
            activeOpacity={0.7}
            accessibilityRole="link"
            accessibilityLabel="Open Mohammed Khizer Shaikh Portfolio"
          >
            <View style={styles.iconBox}>
              <Icon name="explore" size={20} color={colors.light.primary} />
            </View>
            <View style={styles.linkTextCol}>
              <Text style={styles.linkTitle}>Portfolio Website</Text>
              <Text style={styles.linkUrl}>mohammedkhizershaikh.netlify.app</Text>
            </View>
            <Icon name="chevron-right" size={16} color={colors.light.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* LinkedIn */}
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => handleOpenLink(DEVELOPER_PROFILE.linkedinUrl, 'LinkedIn')}
            activeOpacity={0.7}
            accessibilityRole="link"
            accessibilityLabel="Open LinkedIn Profile"
          >
            <View style={styles.iconBox}>
              <Icon name="share" size={20} color={colors.light.primary} />
            </View>
            <View style={styles.linkTextCol}>
              <Text style={styles.linkTitle}>LinkedIn Profile</Text>
              <Text style={styles.linkUrl}>linkedin.com/in/mohammedkhizershaikh</Text>
            </View>
            <Icon name="chevron-right" size={16} color={colors.light.textMuted} />
          </TouchableOpacity>
        </Card>

        {/* Architectural Pillars */}
        <Card style={styles.card}>
          <Text style={styles.cardHeader}>Core Technical Pillars</Text>
          {DEVELOPER_PROFILE.specializations.map((spec, index) => (
            <View key={index} style={styles.specRow}>
              <View style={styles.bulletPoint} />
              <Text style={styles.specText}>{spec}</Text>
            </View>
          ))}
        </Card>

        {/* Platform Specifications */}
        <Card style={styles.card}>
          <Text style={styles.cardHeader}>System Specification</Text>
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>Platform</Text>
            <Text style={styles.specVal}>Sanad Monorepo</Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>Client Engine</Text>
            <Text style={styles.specVal}>Expo SDK 58 / React Native 0.88</Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>Design System</Text>
            <Text style={styles.specVal}>60:30:10 (Ivory / Emerald / Gold)</Text>
          </View>
          <View style={styles.specItem}>
            <Text style={styles.specLabel}>Active Persona</Text>
            <Text style={styles.specVal}>Platform Admin (Full CRUD Unlocked)</Text>
          </View>
        </Card>

        {/* Action Button */}
        <Button
          title="Visit Portfolio"
          variant="primary"
          onPress={() => handleOpenLink(DEVELOPER_PROFILE.portfolioUrl, 'Portfolio')}
          style={styles.actionBtn}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  content: {
    padding: 16,
    paddingBottom: 90,
  },
  profileCard: {
    padding: 16,
    marginBottom: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  headerInfo: {
    flex: 1,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.light.primary,
  },
  titleText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: 2,
  },
  roleText: {
    fontSize: 12,
    color: colors.light.accent,
    fontWeight: '600',
  },
  bioText: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.light.textSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
    paddingTop: 12,
  },
  card: {
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.light.primary,
    marginBottom: 12,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.light.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  linkTextCol: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: 2,
  },
  linkUrl: {
    fontSize: 12,
    color: colors.light.primary,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: colors.light.border,
    marginVertical: 4,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.light.accent,
  },
  specText: {
    fontSize: 13,
    color: colors.light.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  specItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  specLabel: {
    fontSize: 13,
    color: colors.light.textMuted,
  },
  specVal: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.light.text,
  },
  actionBtn: {
    marginTop: 8,
    marginBottom: 24,
  },
});

