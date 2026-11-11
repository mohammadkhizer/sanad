import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { AppHeader } from '../../src/components/AppHeader';
import { Icon, IconName } from '../../src/components/Icon';
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

  const renderLink = (icon: IconName, title: string, subtitle: string, route: string) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => router.push(route as any)}
      activeOpacity={0.7}
    >
      <View style={styles.menuIconContainer}>
        <Icon name={icon} size={18} color={colors.light.primary} />
      </View>
      <View style={styles.menuTextCol}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <Icon name="chevron-right" size={16} color={colors.light.textMuted} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <AppHeader
        title="Settings & Privacy"
        subtitle="Security, preferences and governance"
        showBack
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Account & Profile */}
        <Card style={styles.card}>
          <Text style={styles.cardHeader}>Account & Credentials</Text>
          {renderLink('profile', 'Personal Details', 'Display name, contact, biographical summary', '/settings/account')}
          <View style={styles.divider} />
          {renderLink('lock', 'Active Devices & Sessions', 'Review authorized phones and browsers', '/settings/sessions')}
          <View style={styles.divider} />
          {renderLink('shield', 'Two-Factor Authentication (TOTP)', user?.twoFactorEnabled ? 'Active (Secured)' : 'Not configured', '/settings/two-factor')}
          <View style={styles.divider} />
          {renderLink('close', 'Blocked Accounts', 'Manage blocked profiles and restricted users', '/settings/blocked-users')}
        </Card>

        {/* Preferences */}
        <Card style={styles.card}>
          <Text style={styles.cardHeader}>Preferences</Text>
          {renderLink('bell', 'Notifications & Quiet Hours', 'Configure prayer-time quiet windows', '/settings/notifications')}
          <View style={styles.divider} />
          {renderLink('explore', 'Language & Theme', 'English, Arabic (RTL), Urdu (RTL), Dark mode', '/settings/language-theme')}
        </Card>

        {/* Staff & Governance (Role-Gated) */}
        {isStaff && (
          <Card style={styles.card}>
            <Text style={styles.cardHeader}>Staff Governance Tools</Text>
            {renderLink('verified', 'Scholar Application Queue', 'Review incoming credential dossiers', '/admin/review-queue')}
            <View style={styles.divider} />
            {renderLink('filter', 'Trust & Safety Reports', 'Review user and content reports (P0/P1/P2)', '/admin/reports')}
            {isAdmin && (
              <>
                <View style={styles.divider} />
                {renderLink('lock', 'Immutable Audit Logs', 'Chronological compliance and action trail', '/admin/audit-logs')}
                <View style={styles.divider} />
                {renderLink('profile', 'Role Management & Revocation', 'Assign roles and revoke scholar badges', '/admin/roles')}
                <View style={styles.divider} />
                {renderLink('settings', 'System Configuration', 'Platform parameters, limits and SLAs', '/admin/config')}
              </>
            )}
          </Card>
        )}

        {/* Legal, Privacy & Data Compliance */}
        <Card style={styles.card}>
          <Text style={styles.cardHeader}>Legal & Data Rights</Text>
          {renderLink('shield', 'Content Policy & Guidelines', 'Takfir prohibition, dignity standards and ethics', '/settings/privacy-terms')}
          <View style={styles.divider} />
          {renderLink('share', 'Export My Data', 'Request a complete archive of your account records', '/settings/data-export')}
          <View style={styles.divider} />
          {renderLink('close', 'Delete Account Permanently', 'GDPR / App Store compliant irrevocable account deletion', '/settings/delete-account')}
        </Card>

        {/* Logout */}
        <Button
          title="Sign Out of Sanad"
          variant="outline"
          onPress={handleLogout}
          style={styles.logoutBtn}
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
  card: {
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.light.primary,
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.light.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  menuTextCol: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: colors.light.textMuted,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.light.border,
    marginVertical: 4,
  },
  logoutBtn: {
    marginTop: 8,
    marginBottom: 24,
  },
});
