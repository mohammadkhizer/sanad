import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { theme } from '../../src/theme/colors';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { apiFetch, ApiError } from '../../src/api/client';
import { useAuthStore } from '../../src/store/authStore';

export default function TwoFactorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string; password?: string }>();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleVerify = async () => {
    if (code.length !== 6) {
      setErrorMsg('Please enter a valid 6-digit code.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const response = await apiFetch<any>('/auth/login', {
        method: 'POST',
        skipAuth: true,
        body: JSON.stringify({
          email: params.email,
          password: params.password,
          twoFactorCode: code,
        }),
      });

      const { user, tokens } = response.data;
      await setAuth(user, tokens.accessToken, tokens.refreshToken);
      router.replace('/(tabs)/feed');
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Authentication verification failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Two-Factor Authentication</Text>
        <Text style={styles.subtext}>
          Open your authenticator app (such as Google Authenticator) and enter the 6-digit code.
        </Text>

        {errorMsg ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        <Input
          label="6-Digit Verification Code"
          placeholder="000000"
          keyboardType="number-pad"
          maxLength={6}
          value={code}
          onChangeText={setCode}
          style={styles.codeInput}
        />

        <Button
          title="Verify & Continue"
          variant="primary"
          onPress={handleVerify}
          loading={loading}
          style={styles.verifyBtn}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
    backgroundColor: theme.colors.background.light,
  },
  card: {
    backgroundColor: theme.colors.surface.light,
    borderRadius: theme.radius.card,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text.primaryLight,
  },
  subtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondaryLight,
    marginTop: 4,
    marginBottom: theme.spacing.base,
  },
  codeInput: {
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 6,
    fontWeight: 'bold',
  },
  errorBox: {
    backgroundColor: '#FDF2F2',
    borderColor: theme.colors.semantic.error,
    borderWidth: 1,
    borderRadius: theme.radius.input,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.base,
  },
  errorText: {
    color: theme.colors.semantic.error,
    fontSize: theme.typography.fontSize.sm,
  },
  verifyBtn: {
    marginTop: theme.spacing.sm,
  },
});
