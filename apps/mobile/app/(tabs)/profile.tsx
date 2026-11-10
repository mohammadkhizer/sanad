import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../src/theme/colors';
import { Button } from '../../src/components/Button';
import { VerifiedBadge } from '../../src/components/VerifiedBadge';
import { useAuthStore } from '../../src/store/authStore';
import { apiFetch } from '../../src/api/client';

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [loading2Fa, setLoading2Fa] = useState(false);

  if (!isAuthenticated || !user) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.guestTitle}>Welcome to Sanad</Text>
        <Text style={styles.guestSub}>
          Sign in to interact with verified religious scholars, save lectures, and customize your study preferences.
        </Text>
        <Button
          title="Sign In"
          variant="primary"
          onPress={() => router.push('/(auth)/login')}
          style={styles.guestBtn}
        />
        <Button
          title="Create Account"
          variant="outline"
          onPress={() => router.push('/(auth)/register')}
          style={[styles.guestBtn, { marginTop: 12 }]}
        />
      </View>
    );
  }

  const isScholar = user.roles.includes('scholar');
  const isModerator = user.roles.includes('moderator');
  const isAdmin = user.roles.includes('admin');

  const handleSetup2FA = async () => {
    setLoading2Fa(true);
    try {
      const res = await apiFetch<any>('/auth/2fa/setup', { method: 'POST' });
      Alert.prompt
        ? Alert.prompt(
            'Two-Factor Setup',
            `Secret key: ${res.data.secret}\n\nAdd this key to Google Authenticator or 1Password, then enter the 6-digit verification code:`,
            async (code) => {
              try {
                await apiFetch('/auth/2fa/verify', {
                  method: 'POST',
                  body: JSON.stringify({ code }),
                });
                updateUser({ twoFA: { enabled: true } });
                Alert.alert('2FA Enabled', 'Two-factor authentication is active on your account.');
              } catch (verifyErr: any) {
                Alert.alert('Verification Failed', verifyErr.message || 'Invalid code.');
              }
            }
          )
        : Alert.alert(
            'Two-Factor Setup',
            `Secret key: ${res.data.secret}\n\nPlease enter the verification code in your settings to finalize.`
          );
    } catch (err: any) {
      Alert.alert('2FA Setup Error', err.message || 'Failed to initialize 2FA.');
    } finally {
      setLoading2Fa(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your Sanad account? This will permanently deactivate your profile, comments, and sessions per privacy guidelines.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiFetch('/users/me', { method: 'DELETE' });
              await logout();
              Alert.alert('Account Deleted', 'Your account has been deleted.');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Could not delete account.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>
            {user.displayName.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.displayName}>{user.displayName}</Text>
            {isScholar && (
              <View style={styles.badgeWrap}>
                <VerifiedBadge size="md" />
              </View>
            )}
          </View>
          <Text style={styles.emailText}>{user.email}</Text>
          <View style={styles.rolesRow}>
            {user.roles.map((role) => (
              <View key={role} style={styles.rolePill}>
                <Text style={styles.roleText}>{role.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Scholar Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Scholarly Authority</Text>
        {isScholar ? (
          <View style={styles.scholarCard}>
            <View style={styles.scholarCardHeader}>
              <VerifiedBadge size="md" showLabel />
            </View>
            <Text style={styles.scholarInst}>
              Institution: {user.scholarProfile?.institution || 'Verified Academy'}
            </Text>
            <Button
              title="Scholar Creator Dashboard"
              variant="outline"
              size="sm"
              onPress={() => router.push('/scholar/dashboard')}
              style={styles.actionBtn}
            />
          </View>
        ) : (
          <View style={styles.applyCard}>
            <Text style={styles.applyTitle}>Are you a qualified Islamic scholar or academic?</Text>
            <Text style={styles.applySub}>
              Apply for transparent verification with your credentials, degrees, or ijazahs to publish authentic lectures.
            </Text>
            <Button
              title="Apply for Verification"
              variant="accent"
              size="sm"
              onPress={() => router.push('/scholar/apply')}
              style={styles.actionBtn}
            />
          </View>
        )}
      </View>

      {/* Staff & Moderation Panel */}
      {(isModerator || isAdmin) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Administration & Moderation</Text>
          <Button
            title="Scholar Verification Queue"
            variant="primary"
            size="sm"
            onPress={() => router.push('/admin/review-queue')}
            style={styles.actionBtn}
          />
          <Button
            title="Moderation & Reports Triage"
            variant="outline"
            size="sm"
            onPress={() => router.push('/admin/reports')}
            style={[styles.actionBtn, { marginTop: 8 }]}
          />
        </View>
      )}

      {/* Security & 2FA */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Security</Text>
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>Two-Factor Authentication (TOTP)</Text>
            <Text style={styles.settingDesc}>
              {user.twoFA?.enabled
                ? 'Active (mandatory for verified scholars and moderators)'
                : 'Not enabled. Recommended for all accounts.'}
            </Text>
          </View>
          {!user.twoFA?.enabled && (
            <Button
              title="Enable 2FA"
              variant="primary"
              size="sm"
              onPress={handleSetup2FA}
              loading={loading2Fa}
            />
          )}
        </View>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <Button
          title="Sign Out"
          variant="outline"
          onPress={() => logout()}
          style={styles.actionBtn}
        />

        <TouchableOpacity
          onPress={handleDeleteAccount}
          style={styles.deleteBtn}
          accessibilityRole="button"
          accessibilityLabel="Delete Account Permanently"
        >
          <Text style={styles.deleteText}>Delete Account Permanently</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.base,
    backgroundColor: theme.colors.background.light,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  guestTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text.primaryLight,
  },
  guestSub: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondaryLight,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  guestBtn: {
    width: 220,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface.light,
    padding: theme.spacing.base,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    marginBottom: theme.spacing.base,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.brand.emerald,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerInfo: {
    marginLeft: theme.spacing.base,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  displayName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text.primaryLight,
  },
  badgeWrap: {
    marginLeft: 6,
  },
  emailText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondaryLight,
    marginTop: 2,
  },
  rolesRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  rolePill: {
    backgroundColor: '#EAE6DC',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.pill,
    marginRight: 6,
  },
  roleText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.text.primaryLight,
  },
  section: {
    backgroundColor: theme.colors.surface.light,
    padding: theme.spacing.base,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    marginBottom: theme.spacing.base,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: 'bold',
    color: theme.colors.text.primaryLight,
    marginBottom: theme.spacing.sm,
  },
  scholarCard: {
    backgroundColor: '#F7F4EC',
    padding: theme.spacing.md,
    borderRadius: theme.radius.input,
  },
  scholarCardHeader: {
    marginBottom: 6,
  },
  scholarInst: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondaryLight,
    marginBottom: theme.spacing.sm,
  },
  applyCard: {
    backgroundColor: '#F3EFE3',
    padding: theme.spacing.md,
    borderRadius: theme.radius.input,
  },
  applyTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: 'bold',
    color: theme.colors.text.primaryLight,
  },
  applySub: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondaryLight,
    marginTop: 4,
    marginBottom: theme.spacing.sm,
    lineHeight: 18,
  },
  actionBtn: {
    marginTop: 4,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  settingLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text.primaryLight,
  },
  settingDesc: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondaryLight,
    marginTop: 2,
    maxWidth: 240,
  },
  deleteBtn: {
    marginTop: theme.spacing.base,
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  deleteText: {
    color: theme.colors.semantic.error,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
  },
});
