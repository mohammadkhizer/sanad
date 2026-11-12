import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { Icon } from '../../src/components/Icon';
import { BrandLogo } from '../../src/components/BrandLogo';
import { colors } from '../../src/theme/colors';
import { api } from '../../src/api';
import { useAuthStore } from '../../src/store/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      setError('Please provide email/phone and password');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await api.auth.login({
        identifier: identifier.trim(),
        password,
        twoFactorCode: requires2FA ? twoFactorCode.trim() : undefined,
      });

      if (res.requires2FA) {
        setRequires2FA(true);
        return;
      }

      if (res.accessToken && res.refreshToken && res.user) {
        await login(res.accessToken, res.refreshToken, {
          id: res.user._id || (res.user as any).id,
          displayName: res.user.displayName,
          email: res.user.email,
          phone: res.user.phone,
          roles: res.user.roles,
          twoFactorEnabled: (res.user as any).twoFactorEnabled ?? res.user.twoFA?.enabled,
        });
        router.replace('/(tabs)/feed');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Classical Masthead Brand Logo */}
      <BrandLogo size="medium" style={styles.masthead} />

      <View style={styles.card}>
        {Boolean(error) && (
          <View style={styles.errorBox}>
            <Text style={styles.errorBanner}>{error}</Text>
          </View>
        )}

        <Input
          label="Email or Phone Number"
          placeholder="scholar@institution.edu"
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
        />

        <Input
          label="Password"
          placeholder="Min 10 characters"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {requires2FA && (
          <Input
            label="Two-Factor Security Code"
            placeholder="6-digit authenticator code"
            value={twoFactorCode}
            onChangeText={setTwoFactorCode}
            keyboardType="number-pad"
            maxLength={6}
          />
        )}

        <View style={styles.forgotRow}>
          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
            <Text style={styles.forgotLink}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        <Button
          title={requires2FA ? 'Verify Two-Factor and Log In' : 'Sign In to Sanad'}
          variant="primary"
          onPress={handleLogin}
          loading={loading}
          style={styles.submitBtn}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Do not have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.footerLink}>Register Here</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.guestLink} onPress={() => router.replace('/(tabs)/feed')}>
          <Text style={styles.guestText}>Continue as Guest (Read Only)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.adminRegisterLink} onPress={() => router.push('/(auth)/admin-register')}>
          <Text style={styles.adminRegisterText}>Platform Governance: Register System Admin</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.light.background,
    padding: 20,
    justifyContent: 'center',
  },
  masthead: {
    alignItems: 'center',
    marginBottom: 24,
  },
  emblemBox: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.light.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.light.accent,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.light.primary,
    letterSpacing: 3,
  },
  arabicSubtitle: {
    fontSize: 14,
    color: colors.light.accentDark,
    fontWeight: '600',
    marginTop: 2,
  },
  subtitle: {
    fontSize: 13,
    color: colors.light.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.light.surface,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.light.border,
    gap: 12,
  },
  errorBox: {
    backgroundColor: '#FDF2F2',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  errorBanner: {
    color: colors.light.error,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginTop: -4,
  },
  forgotLink: {
    fontSize: 12,
    color: colors.light.primary,
    fontWeight: '600',
  },
  submitBtn: {
    marginTop: 4,
  },
  adminQuickBtn: {
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    fontSize: 13,
    color: colors.light.textSecondary,
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.light.primary,
  },
  guestLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  guestText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.light.textMuted,
  },
  adminRegisterLink: {
    alignItems: 'center',
    paddingVertical: 4,
    marginTop: 4,
  },
  adminRegisterText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.light.primary,
    letterSpacing: 0.3,
  },
});
