import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../src/theme/colors';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { apiFetch, ApiError } from '../../src/api/client';
import { useAuthStore } from '../../src/store/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const response = await apiFetch<any>('/auth/login', {
        method: 'POST',
        skipAuth: true,
        body: JSON.stringify({ email, password }),
      });

      if (response.data.twoFactorRequired) {
        router.push({
          pathname: '/(auth)/two-factor',
          params: { email, password },
        });
        return;
      }

      const { user, tokens } = response.data;
      await setAuth(user, tokens.accessToken, tokens.refreshToken);
      router.replace('/(tabs)/feed');
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('An error occurred during authentication.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.brandBox}>
        <Text style={styles.brandTitle}>Sanad</Text>
        <Text style={styles.tagline}>Knowledge, with a chain of trust.</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.title}>Sign In</Text>

        {errorMsg ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        <Input
          label="Email Address"
          placeholder="your.email@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Input
          label="Password"
          placeholder="Enter your password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Button
          title="Sign In"
          variant="primary"
          onPress={handleLogin}
          loading={loading}
          style={styles.loginBtn}
        />

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Do not have an account?</Text>
          <Button
            title="Create Account"
            variant="outline"
            size="sm"
            onPress={() => router.push('/(auth)/register')}
            style={styles.switchBtn}
          />
        </View>
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
  brandBox: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: theme.colors.brand.emerald,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondaryLight,
    marginTop: 4,
    fontStyle: 'italic',
  },
  formCard: {
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
    marginBottom: theme.spacing.base,
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
  loginBtn: {
    marginTop: theme.spacing.sm,
  },
  switchRow: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    paddingTop: theme.spacing.base,
  },
  switchText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondaryLight,
    marginBottom: theme.spacing.sm,
  },
  switchBtn: {
    width: '100%',
  },
});

