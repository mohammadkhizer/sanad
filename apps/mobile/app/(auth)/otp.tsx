import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { AppHeader } from '../../src/components/AppHeader';
import { colors } from '../../src/theme/colors';
import { api } from '../../src/api';
import { useAuthStore } from '../../src/store/authStore';

export default function OtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ identifier: string }>();
  const login = useAuthStore((state) => state.login);

  const [code, setCode] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await api.auth.verifyOtp({
        identifier: params.identifier || 'user@example.com',
        code: code.trim(),
      });

      await login(res.accessToken, res.refreshToken, {
        id: res.user._id,
        displayName: res.user.displayName,
        email: res.user.email,
        phone: res.user.phone,
        roles: res.user.roles,
        twoFactorEnabled: res.user.twoFA?.enabled,
      });
      router.replace('/(tabs)/feed');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'OTP verification failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Verify Code"
        subtitle="Account Authentication"
        showBack
      />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Confirm Your Identity</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code transmitted to {params.identifier || 'your device'}.
          </Text>

          {Boolean(error) && (
            <View style={styles.errorBox}>
              <Text style={styles.errorBanner}>{error}</Text>
            </View>
          )}

          <Input
            label="6-Digit Verification Code"
            placeholder="123456"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
          />

          <Button
            title="Verify and Enter Sanad"
            variant="primary"
            onPress={handleVerify}
            loading={loading}
            style={styles.submitBtn}
          />
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
  submitBtn: {
    marginTop: 6,
  },
});
