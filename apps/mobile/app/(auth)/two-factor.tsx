import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { AppHeader } from '../../src/components/AppHeader';
import { colors } from '../../src/theme/colors';
import { api } from '../../src/api';

export default function TwoFactorAuthScreen() {
  const router = useRouter();

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
    <View style={styles.screen}>
      <AppHeader
        title="Two-Factor Security"
        subtitle="Cryptographic Verification"
        showBack
      />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Authenticator Verification</Text>
          <Text style={styles.subtitle}>
            Scholarly and staff accounts require mandatory 2FA. Open your authenticator app (Google Authenticator, Aegis, Apple Passwords) and enter the 6-digit code.
          </Text>

          {Boolean(error) && (
            <View style={styles.errorBox}>
              <Text style={styles.errorBanner}>{error}</Text>
            </View>
          )}

          <Input
            label="6-Digit Security Code"
            placeholder="123456"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
          />

          <Button
            title="Authenticate and Continue"
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
