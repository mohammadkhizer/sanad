import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { colors } from '../../src/theme/colors';
import { apiClient } from '../../src/api/client';
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

      const res = await apiClient<{
        requires2FA?: boolean;
        accessToken?: string;
        refreshToken?: string;
        user?: any;
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          identifier: identifier.trim(),
          password,
          twoFactorCode: requires2FA ? twoFactorCode.trim() : undefined,
        }),
      });

      if (res.requires2FA) {
        setRequires2FA(true);
        return;
      }

      if (res.accessToken && res.refreshToken && res.user) {
        await login(res.accessToken, res.refreshToken, res.user);
        router.replace('/(tabs)/feed');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sanad</Text>
        <Text style={styles.subtitle}>Knowledge, with a chain of trust</Text>
      </View>

      <View style={styles.form}>
        {Boolean(error) && <Text style={styles.errorBanner}>{error}</Text>}

        <Input
          label="Email or Phone"
          placeholder="scholar@example.com"
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
            label="2FA Code"
            placeholder="6-digit code"
            value={twoFactorCode}
            onChangeText={setTwoFactorCode}
            keyboardType="number-pad"
            maxLength={6}
          />
        )}

        <Button
          title={requires2FA ? 'Verify and Log In' : 'Log In'}
          onPress={handleLogin}
          loading={loading}
          style={styles.submitBtn}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Do not have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.footerLink}>Register</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.guestLink} onPress={() => router.replace('/(tabs)/feed')}>
          <Text style={styles.guestText}>Continue as Guest (Read Only)</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.light.background,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.light.primary,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 15,
    color: colors.light.textSecondary,
    marginTop: 6,
  },
  form: {
    backgroundColor: colors.light.surface,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    color: colors.light.error,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 13,
  },
  submitBtn: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: colors.light.textSecondary,
    fontSize: 14,
  },
  footerLink: {
    color: colors.light.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  guestLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  guestText: {
    color: colors.light.textMuted,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});

