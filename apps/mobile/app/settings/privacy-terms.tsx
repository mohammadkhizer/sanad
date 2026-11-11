import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../../src/theme/colors';
import { Card } from '../../src/components/Card';
import { AppHeader } from '../../src/components/AppHeader';

type Section = 'policy' | 'terms' | 'privacy';

export default function PrivacyTermsScreen() {
  const [activeSection, setActiveSection] = useState<Section>('policy');

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Policy and Legal"
        subtitle="Community Standards and Privacy"
        showBack
      />

      <View style={styles.navBar}>
        <TouchableOpacity
          style={[styles.navItem, activeSection === 'policy' && styles.navItemActive]}
          onPress={() => setActiveSection('policy')}
          activeOpacity={0.7}
        >
          <Text style={[styles.navText, activeSection === 'policy' && styles.navTextActive]}>
            Content Policy
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeSection === 'terms' && styles.navItemActive]}
          onPress={() => setActiveSection('terms')}
          activeOpacity={0.7}
        >
          <Text style={[styles.navText, activeSection === 'terms' && styles.navTextActive]}>
            Terms of Service
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeSection === 'privacy' && styles.navItemActive]}
          onPress={() => setActiveSection('privacy')}
          activeOpacity={0.7}
        >
          <Text style={[styles.navText, activeSection === 'privacy' && styles.navTextActive]}>
            Privacy Policy
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {activeSection === 'policy' && (
          <Card style={styles.card}>
            <Text style={styles.title}>Community and Content Policy</Text>

            <Text style={styles.ruleHeading}>1. Verified Scholarly Publishing</Text>
            <Text style={styles.bodyText}>
              Publishing of religious rulings (fatawa), doctrinal positions, and structured curricula is strictly reserved to scholars with verified institutional accreditation or classical ijazah transmission chains.
            </Text>

            <Text style={styles.ruleHeading}>2. Zero Tolerance for Sectarian Hostility</Text>
            <Text style={styles.bodyText}>
              Sectarian condemnation, anathematization (takfir), harassment, and defamatory attacks against scholars or communities are strictly prohibited and result in immediate suspension.
            </Text>

            <Text style={styles.ruleHeading}>3. Respectful Academic Discourse</Text>
            <Text style={styles.bodyText}>
              Members are welcomed to seek clarification and submit sincere scholarly inquiries. Aggressive debate culture, spam, and disrespectful rhetoric are removed.
            </Text>
          </Card>
        )}

        {activeSection === 'terms' && (
          <Card style={styles.card}>
            <Text style={styles.title}>Terms of Service</Text>
            <Text style={styles.bodyText}>
              By registering on Sanad, you agree to access educational material for personal study. Educational lectures provided on Sanad do not substitute personalized pastoral or legal counsel.
            </Text>
            <Text style={styles.ruleHeading}>Accreditation Revocation Authority</Text>
            <Text style={styles.bodyText}>
              Sanad administration reserves the authority to revoke scholar accreditation or suspend member accounts for breaches of trust, fraudulent documentation, or behavioral policy violations.
            </Text>
          </Card>
        )}

        {activeSection === 'privacy' && (
          <Card style={styles.card}>
            <Text style={styles.title}>Privacy and Data Governance</Text>
            <Text style={styles.bodyText}>
              We collect minimal personal data: your name, contact identifier (email/phone), and optional biography. Uploaded credentials for scholar verification are stored in an encrypted private bucket and accessed solely by certified admissions reviewers.
            </Text>
            <Text style={styles.ruleHeading}>Consultation Confidentiality</Text>
            <Text style={styles.bodyText}>
              Direct scholar consultations and LiveKit video sessions are strictly confidential between teacher and student. Recordings without mutual written consent are prohibited.
            </Text>
          </Card>
        )}
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
  navBar: {
    flexDirection: 'row',
    backgroundColor: colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  navItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  navItemActive: {
    borderBottomColor: colors.light.primary,
  },
  navText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.light.textSecondary,
  },
  navTextActive: {
    color: colors.light.primary,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    padding: 18,
    borderRadius: 14,
    gap: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.light.primary,
    marginBottom: 4,
  },
  ruleHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.light.primary,
    marginTop: 8,
  },
  bodyText: {
    fontSize: 13,
    color: colors.light.text,
    lineHeight: 20,
  },
});
