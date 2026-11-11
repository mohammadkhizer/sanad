import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { useAuthStore } from '../../src/store/authStore';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const isStaff = user?.roles.includes('moderator') || user?.roles.includes('admin');
  const isAdmin = user?.roles.includes('admin');

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of Sanad?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const renderLink = (title: string, subtitle: string, route: string) => (
    <TouchableOpacity style={styles.menuItem} onPress={() => router.push(route as any)}>
      <View style={styles.menuTextCol}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.chevron}>{'>'}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Account & Profile */}
      <Card style={styles.card}>
        <Text style={styles.cardHeader}>Account & Credentials</Text>
        {renderLink('Personal Details', 'Display name, contact, biographical summary', '/settings/account')}
        <View style={styles.divider} />
        {renderLink('Active Devices & Sessions', 'Review authorized phones and browsers', '/settings/sessions')}
        <View style={styles.divider} />
        {renderLink('Two-Factor Authentication (TOTP)', user?.twoFactorEnabled ? 'Active (Secured)' : 'Not configured', '/settings/two-factor')}
        <View style={styles.divider} />
        {renderLink('Blocked Accounts', 'Manage blocked profiles and restricted users', '/settings/blocked-users')}
      </Card>

      {/* Preferences */}
      <Card style={styles.card}>
        <Text style={styles.cardHeader}>Preferences</Text>
        {renderLink('Notifications & Quiet Hours', 'Configure prayer-time quiet windows', '/settings/notifications')}
        <View style={styles.divider} />
        {renderLink('Language & Theme', 'English, Arabic (RTL), Urdu (RTL), Dark mode', '/settings/language-theme')}
      </Card>

      {/* Staff & Governance (Role-Gated) */}
      {isStaff && (
        <Card style={styles.card}>
          <Text style={styles.cardHeader}>Staff Governance Tools</Text>
          {renderLink('Scholar Application Queue', 'Review incoming credential dossiers', '/admin/review-queue')}
          <View style={styles.divider} />
          {renderLink('Trust & Safety Reports', 'Review user and content reports (P0/P1/P2)', '/admin/reports')}
          {isAdmin && (
            <>
              <View style={styles.divider} />
              {renderLink('Audit Trail & Event Log', 'Immutable log of administrative actions', '/admin/audit-logs')}
              <View style={styles.divider} />
              {renderLink('Role Management & Badges', 'Assign roles and revoke scholar accreditation', '/admin/roles')}
              <View style={styles.divider} />
              {renderLink('Platform Configuration', 'Verification thresholds, quiet hours defaults', '/admin/config')}
            </>
          )}
        </Card>
      )}

      {/* Legal & Privacy Compliance */}
      <Card style={styles.card}>
        <Text style={styles.cardHeader}>Policy & Data Rights</Text>
        {renderLink('Content Policy & Terms', 'Community rules, sectarian takfir ban', '/settings/privacy-terms')}
        <View style={styles.divider} />
        {renderLink('Export Account Data', 'Download archive of scholarly lessons and chat history', '/settings/data-export')}
        <View style={styles.divider} />
        {renderLink('Delete Account', 'Permanently erase credentials and profile', '/settings/delete-account')}
      </Card>

      <Button
        title="Sign Out"
        variant="outline"
        onPress={handleLogout}
        style={styles.logoutBtn}
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
    gap: 16,
  },
  card: {
    padding: 16,
  },
  cardHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.light.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  menuTextCol: {
    flex: 1,
    paddingRight: 12,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.light.text,
  },
  menuSubtitle: {
    fontSize: 12,
    color: colors.light.textSecondary,
    marginTop: 2,
  },
  chevron: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.light.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.light.border,
  },
  logoutBtn: {
    marginTop: 8,
  },
});
