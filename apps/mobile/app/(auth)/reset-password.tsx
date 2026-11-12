import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { AppHeader } from '../../src/components/AppHeader';
import { BrandLogo } from '../../src/components/BrandLogo';
import { colors } from '../../src/theme/colors';
import { api } from '../../src/api';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string; identifier?: string }>();

  const [identifier, setIdentifier] = useState(params.identifier || '');
  const [token, setToken] = useState(params.token || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async () => {
    if (!token.trim()) {
      setError('Please provide the recovery code or reset token');
      return;
    }
    if (!newPassword || newPassword.length < 10) {
      setError('Password must be at least 10 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await api.auth.resetPassword(token.trim(), newPassword, identifier.trim() || undefined);
      Alert.alert(
        'Password Reset Successful',
        'Your password has been changed. Please sign in with your new credentials.',
        [
          {
            text: 'Sign In',
            onPress: () => router.replace('/(auth)/login'),
          },
        ]
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Reset failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Reset Password"
        subtitle="Account Security"
        showBack
        onBack={() => router.back()}
      />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.masthead}>
          <BrandLogo size="medium" />
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Create New Password</Text>
          <Text style={styles.subtitle}>
            Enter the recovery verification code or reset token sent to your contact address.
          </Text>

          {Boolean(error) && (
            <View style={styles.errorBox}>
              <Text style={styles.errorBanner}>{error}</Text>
            </View>
          )}

          <Input
            label="Email or Phone Number (Optional)"
            placeholder="scholar@institution.edu"
            value={identifier}
            onChangeText={(val) => {
              setIdentifier(val);
              setError(null);
            }}
            autoCapitalize="none"
          />

          <Input
            label="Recovery Code or Token"
            placeholder="6-digit code or reset token"
            value={token}
            onChangeText={(val) => {
              setToken(val);
              setError(null);
            }}
            autoCapitalize="none"
          />

          <Input
            label="New Password"
            placeholder="Min 10 characters"
            value={newPassword}
            onChangeText={(val) => {
              setNewPassword(val);
              setError(null);
            }}
            secureTextEntry
          />

          <Input
            label="Confirm New Password"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChangeText={(val) => {
              setConfirmPassword(val);
              setError(null);
            }}
            secureTextEntry
          />

          <Button
            title="Set New Password"
            variant="primary"
            onPress={handleReset}
            loading={loading}
            style={styles.submitBtn}
          />

          <TouchableOpacity
            style={styles.cancelLink}
            onPress={() => router.replace('/(auth)/login')}
          >
            <Text style={styles.cancelText}>Return to Sign In</Text>
          </TouchableOpacity>
        </View>
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
    padding: 20,
    justifyContent: 'center',
    flexGrow: 1,
  },
  masthead: {
    alignItems: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: colors.light.surface,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.light.border,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.light.primary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.light.textSecondary,
    lineHeight: 18,
  },
  errorBox: {
    backgroundColor: '#FFF2F0',
    borderColor: '#FFCCC7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  errorBanner: {
    color: '#CF1322',
    fontSize: 12,
    fontWeight: '600',
  },
  submitBtn: {
    marginTop: 6,
  },
  cancelLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.light.textMuted,
  },
});
