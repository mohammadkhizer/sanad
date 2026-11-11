import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuthStore } from '../../src/store/authStore';
import { colors } from '../../src/theme/colors';
import { Avatar } from '../../src/components/Avatar';
import { VerifiedBadge } from '../../src/components/VerifiedBadge';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { useRouter } from 'expo-router';
import { apiClient } from '../../src/api/client';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  const isScholar = Boolean(user?.roles?.includes('scholar') || user?.roles?.includes('admin'));
  const isModOrAdmin = Boolean(
    user?.roles?.includes('moderator') || user?.roles?.includes('admin')
  );

  const handleLogout = async () => {
    try {
      await apiClient('/auth/logout', { method: 'POST' });
    } catch {
      // Proceed with local logout regardless
    }
    await logout();
    router.replace('/(auth)/login');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account and all associated data? This action cannot be reversed.',
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

  if (!isAuthenticated || !user) {
    return (
      <View style={styles.center}>
        <Text style={styles.guestTitle}>Guest Mode</Text>
        <Text style={styles.guestSub}>
          Log in or create an account to follow scholars, participate in Q&A, and verify credentials.
        </Text>
        <Button
          title="Log In / Register"
          onPress={() => router.push('/(auth)/login')}
          style={styles.guestBtn}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Header */}
      <Card style={styles.profileCard}>
        <View style={styles.avatarRow}>
          <Avatar name={user.displayName} size={64} />
          <View style={styles.userDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{user.displayName}</Text>
              {isScholar && <VerifiedBadge />}
            </View>
            <Text style={styles.userRole}>
              Role: {user.roles?.join(', ')}
            </Text>
            {Boolean(user.email) && <Text style={styles.userEmail}>{user.email}</Text>}
          </View>
        </View>
      </Card>

      {/* Verification status card if not scholar */}
      {!isScholar && (
        <Card style={styles.scholarCard}>
          <Text style={styles.scholarCardTitle}>Are you a qualified religious scholar?</Text>
          <Text style={styles.scholarCardDesc}>
            Sanad restricts content creation to verified ulama and academics. Submit your
            accreditation documents or ijazah for review.
          </Text>
          <Button
            title="Apply for Scholar Verification"
            variant="accent"
            onPress={() => router.push('/scholar/apply')}
          />
        </Card>
      )}

      {/* Moderator / Admin section if applicable */}
      {isModOrAdmin && (
        <Card style={styles.adminCard}>
          <Text style={styles.adminTitle}>Staff Dashboard</Text>
          <TouchableOpacity
            style={styles.adminLink}
            onPress={() => router.push('/admin/review-queue')}
          >
            <Text style={styles.adminLinkText}>Review Scholar Applications Queue</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.adminLink}
            onPress={() => router.push('/admin/reports')}
          >
            <Text style={styles.adminLinkText}>Triage Content & User Reports</Text>
          </TouchableOpacity>
        </Card>
      )}

      {/* Security & 2FA */}
      <Card style={styles.menuCard}>
        <Text style={styles.menuHeader}>Security & Account</Text>
        <View style={styles.menuItem}>
          <Text style={styles.menuItemText}>Two-Factor Authentication (TOTP)</Text>
          <Text style={styles.menuItemValue}>
            {user.twoFactorEnabled ? 'Enabled' : isScholar ? 'Mandatory - Please Setup' : 'Disabled'}
          </Text>
        </View>
      </Card>

      {/* Actions */}
      <Button
        title="Log Out"
        variant="outline"
        onPress={handleLogout}
        style={styles.actionBtn}
      />

      <Button
        title="Permanently Delete Account"
        variant="danger"
        onPress={handleDeleteAccount}
        style={styles.deleteBtn}
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
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.light.background,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.light.primary,
    marginBottom: 8,
  },
  guestSub: {
    fontSize: 14,
    color: colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  guestBtn: {
    width: '100%',
  },
  profileCard: {
    padding: 20,
    marginBottom: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userDetails: {
    marginLeft: 16,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.light.text,
  },
  userRole: {
    fontSize: 12,
    color: colors.light.primary,
    fontWeight: '700',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  userEmail: {
    fontSize: 13,
    color: colors.light.textSecondary,
    marginTop: 2,
  },
  scholarCard: {
    backgroundColor: colors.light.surfaceElevated,
    borderColor: colors.light.accent,
    padding: 20,
    marginBottom: 16,
  },
  scholarCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: 6,
  },
  scholarCardDesc: {
    fontSize: 13,
    color: colors.light.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  adminCard: {
    padding: 16,
    marginBottom: 16,
  },
  adminTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.light.primary,
    marginBottom: 12,
  },
  adminLink: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  adminLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.primary,
  },
  menuCard: {
    padding: 16,
    marginBottom: 20,
  },
  menuHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.light.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  menuItemText: {
    fontSize: 14,
    color: colors.light.text,
  },
  menuItemValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.primary,
  },
  actionBtn: {
    marginBottom: 12,
  },
  deleteBtn: {
    marginBottom: 24,
  },
});

