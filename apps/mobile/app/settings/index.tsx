import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { useAuthStore } from '../../src/store/authStore';
import { apiClient } from '../../src/api/client';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const [quietHours, setQuietHours] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [locale, setLocale] = useState<'en' | 'ar' | 'ur'>('en');

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your profile, credentials, and data according to store compliance standards. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Permanently Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient('/users/me', { method: 'DELETE' });
              await logout();
              router.replace('/(auth)/login');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to delete account');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Settings & Preferences</Text>

      {/* Language Section */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Language / اللغة</Text>
        <View style={styles.langRow}>
          {[
            { id: 'en', label: 'English' },
            { id: 'ar', label: 'العربية (RTL)' },
            { id: 'ur', label: 'اردو (RTL)' },
          ].map((l) => (
            <TouchableOpacity
              key={l.id}
              style={[
                styles.langBtn,
                locale === l.id && styles.langBtnActive,
              ]}
              onPress={() => setLocale(l.id as any)}
            >
              <Text
                style={[
                  styles.langBtnText,
                  locale === l.id && styles.langBtnTextActive,
                ]}
              >
                {l.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      {/* Notifications & Prayer Quiet Hours */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Notifications</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingTextCol}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Text style={styles.settingDesc}>New lectures, Q&A replies, and live circles</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ true: colors.light.primary, false: '#D1D5DB' }}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.settingRow}>
          <View style={styles.settingTextCol}>
            <Text style={styles.settingLabel}>Prayer-Time Quiet Hours</Text>
            <Text style={styles.settingDesc}>
              Automatically silence notifications during local prayer windows
            </Text>
          </View>
          <Switch
            value={quietHours}
            onValueChange={setQuietHours}
            trackColor={{ true: colors.light.primary, false: '#D1D5DB' }}
          />
        </View>
      </Card>

      {/* Security & 2FA */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Security</Text>
        <TouchableOpacity
          style={styles.menuLink}
          onPress={() => router.push('/settings/two-factor')}
        >
          <View>
            <Text style={styles.settingLabel}>Two-Factor Authentication (TOTP)</Text>
            <Text style={styles.settingDesc}>
              {user?.twoFactorEnabled ? 'Status: Active' : 'Status: Not configured'}
            </Text>
          </View>
          <Text style={styles.arrowText}>Configure</Text>
        </TouchableOpacity>
      </Card>

      {/* Privacy and Account Deletion (Store requirement) */}
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Privacy and Account</Text>
        <Text style={styles.complianceDesc}>
          Sanad provides complete data ownership. You can export your data or delete your account
          permanently.
        </Text>
        <Button
          title="Permanently Delete Account"
          variant="danger"
          onPress={handleDeleteAccount}
          style={styles.deleteBtn}
        />
      </Card>
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
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.light.primary,
    marginBottom: 16,
  },
  card: {
    padding: 16,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.light.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  langRow: {
    flexDirection: 'row',
    gap: 8,
  },
  langBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.light.border,
    alignItems: 'center',
    backgroundColor: colors.light.surface,
  },
  langBtnActive: {
    backgroundColor: colors.light.primary,
    borderColor: colors.light.primary,
  },
  langBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.light.text,
  },
  langBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingTextCol: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.light.text,
  },
  settingDesc: {
    fontSize: 12,
    color: colors.light.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.light.border,
    marginVertical: 8,
  },
  menuLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  arrowText: {
    color: colors.light.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  complianceDesc: {
    fontSize: 12,
    color: colors.light.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  deleteBtn: {
    marginTop: 4,
  },
});

