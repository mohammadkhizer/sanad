import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../../src/theme/colors';
import { Card } from '../../src/components/Card';

type Section = 'policy' | 'terms' | 'privacy';

export default function PrivacyTermsScreen() {
  const [activeSection, setActiveSection] = useState<Section>('policy');

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity
          style={[styles.navItem, activeSection === 'policy' && styles.navItemActive]}
          onPress={() => setActiveSection('policy')}
        >
          <Text style={[styles.navText, activeSection === 'policy' && styles.navTextActive]}>
            Content Policy
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeSection === 'terms' && styles.navItemActive]}
          onPress={() => setActiveSection('terms')}
        >
          <Text style={[styles.navText, activeSection === 'terms' && styles.navTextActive]}>
            Terms
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeSection === 'privacy' && styles.navItemActive]}
          onPress={() => setActiveSection('privacy')}
        >
          <Text style={[styles.navText, activeSection === 'privacy' && styles.navTextActive]}>
            Privacy
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeSection === 'policy' && (
          <Card style={styles.card}>
            <Text style={styles.title}>Sanad Community & Content Policy</Text>
            <Text style={styles.ruleHeading}>1. Verified Scholarly Publishing</Text>
            <Text style={styles.bodyText}>
              Publishing of legal opinions (fatawa), religious rulings, and structured lessons is strictly restricted to scholars with verified institutional accreditation or classical ijazah transmission chains.
            </Text>

            <Text style={styles.ruleHeading}>2. Zero Tolerance for Sectarian Takfir & Hate</Text>
            <Text style={styles.bodyText}>
              Sectarian condemnation, anathematization (takfir), harassment, and defamatory attacks against scholars or communities are strictly prohibited and result in immediate suspension.
            </Text>

            <Text style={styles.ruleHeading}>3. Respectful Discourse in Comments & Chat</Text>
            <Text style={styles.bodyText}>
              Members may seek clarification and ask sincere questions. Unsolicited debate hostility, trolling, and promotional spam will be removed.
            </Text>
          </Card>
        )}

        {activeSection === 'terms' && (
          <Card style={styles.card}>
            <Text style={styles.title}>Terms of Service</Text>
            <Text style={styles.bodyText}>
              By registering on Sanad, you agree to access content for personal educational purposes. Educational material provided on Sanad does not replace personalized legal or pastoral guidance.
            </Text>
            <Text style={styles.ruleHeading}>Account Revocation</Text>
            <Text style={styles.bodyText}>
              Sanad administrators reserve the authority to revoke scholar accreditation or suspend member accounts for violations of trust, forged credentials, or policy breaches.
            </Text>
          </Card>
        )}

        {activeSection === 'privacy' && (
          <Card style={styles.card}>
            <Text style={styles.title}>Privacy Policy</Text>
            <Text style={styles.bodyText}>
              We collect minimal personal data: your name, contact identifier (email/phone), and accreditation documents. Uploaded credentials for scholar verification are stored in an encrypted private bucket and accessed solely by certified committee reviewers.
            </Text>
            <Text style={styles.ruleHeading}>Data Ownership & In-App Deletion</Text>
            <Text style={styles.bodyText}>
              You retain full ownership of your contributions. You may request a complete data export or immediate in-app account deletion at any time via Settings.
            </Text>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  navItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  navItemActive: {
    borderBottomColor: colors.light.primary,
  },
  navText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.light.textSecondary,
  },
  navTextActive: {
    color: colors.light.primary,
    fontWeight: '800',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    padding: 16,
    gap: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.light.primary,
    marginBottom: 6,
  },
  ruleHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.light.text,
    marginTop: 8,
  },
  bodyText: {
    fontSize: 13,
    color: colors.light.textSecondary,
    lineHeight: 19,
  },
});
