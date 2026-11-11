import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { colors } from '../../src/theme/colors';
import { apiClient } from '../../src/api/client';
import { useAuthStore } from '../../src/store/authStore';

export default function OtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ identifier: string }>();
  const login = useAuthStore((state) => state.login);

  const [code, setCode] = useState('');
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

      const res = await apiClient<{
        accessToken: string;
        refreshToken: string;
        user: any;
      }>('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({
          identifier: params.identifier,
          code: code.trim(),
        }),
      });

      await login(res.accessToken, res.refreshToken, res.user);
      router.replace('/(tabs)/feed');
    } catch (err: any) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Verification Code</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to {params.identifier || 'your device'}.
        </Text>

        {Boolean(error) && <Text style={styles.errorBanner}>{error}</Text>}

        <Input
          label="Verification Code"
          placeholder="123456"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          maxLength={6}
          style={styles.otpInput}
        />

        <Button
          title="Verify & Enter"
          onPress={handleVerify}
          loading={loading}
          style={styles.submitBtn}
        />
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
  form: {
    backgroundColor: colors.light.surface,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.light.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.light.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    color: colors.light.error,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 13,
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 22,
    letterSpacing: 6,
    fontWeight: '700',
  },
  submitBtn: {
    marginTop: 8,
  },
});

