import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../src/theme/colors';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { apiFetch, ApiError } from '../../src/api/client';
import { useAuthStore } from '../../src/store/authStore';

export default function RegisterScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async () => {
    if (!displayName || !email || !password) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    if (password.length < 10) {
      setErrorMsg('Password must be at least 10 characters long.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const response = await apiFetch<any>('/auth/register', {
        method: 'POST',
        skipAuth: true,
        body: JSON.stringify({
          displayName,
          email,
          password,
          phone: phone || undefined,
        }),
      });

      const { user, tokens } = response.data;
      await setAuth(user, tokens.accessToken, tokens.refreshToken);
      router.replace('/(tabs)/feed');
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('An error occurred during account creation.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.formCard}>
        <Text style={styles.title}>Join Sanad</Text>
        <Text style={styles.subtext}>
          Learn from verified scholars in an authenticated, respectful environment.
        </Text>

        {errorMsg ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        <Input
          label="Full Name"
          placeholder="e.g. Abdullah bin Khalid"
          value={displayName}
          onChangeText={setDisplayName}
        />

        <Input
          label="Email Address"
          placeholder="your.email@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Input
          label="Phone Number (optional)"
          placeholder="+1234567890"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <Input
          label="Password (min 10 characters)"
          placeholder="Create a strong password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          helperText="Requires at least 10 characters for platform security."
        />

        <Button
          title="Create Account"
          variant="primary"
          onPress={handleRegister}
          loading={loading}
          style={styles.submitBtn}
        />

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Already registered?</Text>
          <Button
            title="Sign In"
            variant="outline"
            size="sm"
            onPress={() => router.push('/(auth)/login')}
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
  },
  subtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondaryLight,
    marginTop: 4,
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
  submitBtn: {
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

