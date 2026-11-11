import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { colors } from '../../src/theme/colors';
import { api } from '../../src/api';
import { useAuthStore } from '../../src/store/authStore';

export default function TwoFactorAuthScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ identifier?: string }>();
  const login = useAuthStore((state) => state.login);

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError('Please enter the 6-digit authenticator code');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await api.auth.verify2FA(code.trim());
      router.replace('/(tabs)/feed');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Two-factor verification failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Two-Factor Authentication</Text>
        <Text style={styles.subtitle}>
          Scholarly and staff accounts require mandatory 2FA. Open your authenticator app
          (Google Authenticator, Aegis, 1Password) and enter the 6-digit code.
        </Text>

        {Boolean(error) && <Text style={styles.errorBanner}>{error}</Text>}

        <Input
          label="Security Code"
          placeholder="123456"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          maxLength={6}
          style={styles.codeInput}
        />

        <Button
          title="Authenticate"
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
    fontSize: 22,
    fontWeight: '800',
    color: colors.light.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: colors.light.textSecondary,
    marginBottom: 20,
    lineHeight: 18,
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    color: colors.light.error,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 13,
  },
  codeInput: {
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 6,
    fontWeight: '700',
  },
  submitBtn: {
    marginTop: 8,
  },
});

