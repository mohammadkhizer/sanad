import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { AppHeader } from '../../src/components/AppHeader';
import { Icon, IconName } from '../../src/components/Icon';
import { useAuthStore } from '../../src/store/authStore';
import {
  getApiMode,
  setApiMode,
  subscribeApiMode,
  checkBackendHealth,
  getApiBaseUrl,
  AdapterMode,
} from '../../src/api/config';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const isStaff = user?.roles.includes('moderator') || user?.roles.includes('admin');
  const isAdmin = user?.roles.includes('admin');

  const [currentMode, setCurrentMode] = useState<AdapterMode>(getApiMode());
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<{
    tested: boolean;
    ok?: boolean;
    database?: string;
    latencyMs?: number;
    error?: string;
  }>({ tested: false });

  useEffect(() => {
    const unsubscribe = subscribeApiMode((newMode) => {
      setCurrentMode(newMode);
    });
    return unsubscribe;
  }, []);

  const handleToggleMode = () => {
    const nextMode: AdapterMode = currentMode === 'mock' ? 'http' : 'mock';
    setApiMode(nextMode);
    setCurrentMode(nextMode);
    setPingResult({ tested: false });
    Alert.alert(
      'Mode Updated',
      `Sanad API runtime is now using: ${nextMode === 'http' ? 'Live HTTP API (' + getApiBaseUrl() + ')' : 'In-Memory Mock Fixtures'}.`
    );
  };

  const handlePingBackend = async () => {
    setIsPinging(true);
    try {
      const res = await checkBackendHealth();
      setPingResult({
        tested: true,
        ok: res.ok,
        database: res.database,
        latencyMs: res.latencyMs,
        error: res.error,
      });
    } catch (err) {
      setPingResult({
        tested: true,
        ok: false,
        error: err instanceof Error ? err.message : 'Ping failure',
      });
    } finally {
      setIsPinging(false);
    }
  };

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
        {/* Dynamic Runtime & Database Connection Card */}
        <Card style={styles.card}>
          <Text style={styles.cardHeader}>Data Source & Environment</Text>
          <View style={styles.modeRow}>
            <View style={styles.modeTextCol}>
              <Text style={styles.menuTitle}>Active API Mode</Text>
              <Text style={styles.menuSubtitle}>
                {currentMode === 'http'
                  ? `Live Backend: ${getApiBaseUrl()}`
                  : 'In-Memory Mock Adapter with full CRUD state'}
              </Text>
            </View>
            <View
              style={[
                styles.modeBadge,
                currentMode === 'http' ? styles.modeBadgeHttp : styles.modeBadgeMock,
              ]}
            >
              <Text
                style={[
                  styles.modeBadgeText,
                  currentMode === 'http' ? styles.modeBadgeTextHttp : styles.modeBadgeTextMock,
                ]}
              >
                {currentMode === 'http' ? 'LIVE HTTP' : 'MOCK'}
              </Text>
            </View>
          </View>

          <View style={styles.modeActionsRow}>
            <Button
              title={currentMode === 'mock' ? 'Switch to Live API' : 'Switch to Mock Data'}
              variant="outline"
              onPress={handleToggleMode}
              style={styles.modeBtn}
            />
            <Button
              title={isPinging ? 'Pinging...' : 'Test Connection'}
              variant="primary"
              onPress={handlePingBackend}
              loading={isPinging}
              style={styles.modeBtn}
            />
          </View>

          {pingResult.tested && (
            <View
              style={[
                styles.pingResultBox,
                pingResult.ok ? styles.pingSuccessBox : styles.pingErrorBox,
              ]}
            >
              <View style={styles.pingStatusHeader}>
                <Icon
                  name={pingResult.ok ? 'verified' : 'close'}
                  size={16}
                  color={pingResult.ok ? colors.light.success : colors.light.error}
                />
                <Text
                  style={[
                    styles.pingStatusTitle,
                    { color: pingResult.ok ? colors.light.success : colors.light.error },
                  ]}
                >
                  {pingResult.ok ? 'Backend Server Online' : 'Backend Server Unreachable'}
                </Text>
              </View>
              {pingResult.ok ? (
                <Text style={styles.pingDetails}>
                  Database: {pingResult.database} | Latency: {pingResult.latencyMs}ms
                </Text>
              ) : (
                <Text style={styles.pingDetails}>
                  {pingResult.error || 'Connection failed'}. Ensure backend is running at {getApiBaseUrl()}.
                </Text>
              )}
            </View>
          )}
        </Card>

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

        {/* Engineering & Developer Attribution */}
        <Card style={styles.card}>
          <Text style={styles.cardHeader}>Engineering & Architecture</Text>
          {renderLink('profile', 'Lead Architect & Developer', 'Mohammed Khizer Shaikh portfolio & LinkedIn', '/settings/developer-info')}
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
  modeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modeTextCol: {
    flex: 1,
    marginRight: 10,
  },
  modeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  modeBadgeMock: {
    backgroundColor: colors.light.surfaceElevated,
    borderColor: colors.light.border,
  },
  modeBadgeHttp: {
    backgroundColor: '#E6F4EA',
    borderColor: colors.light.success,
  },
  modeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modeBadgeTextMock: {
    color: colors.light.textMuted,
  },
  modeBadgeTextHttp: {
    color: colors.light.success,
  },
  modeActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  modeBtn: {
    flex: 1,
  },
  pingResultBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  pingSuccessBox: {
    backgroundColor: '#F0FBF4',
    borderColor: '#B7EB8F',
  },
  pingErrorBox: {
    backgroundColor: '#FFF2F0',
    borderColor: '#FFCCC7',
  },
  pingStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  pingStatusTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  pingDetails: {
    fontSize: 11,
    color: colors.light.textMuted,
    lineHeight: 16,
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
