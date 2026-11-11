import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { AppHeader } from '../../src/components/AppHeader';
import { colors } from '../../src/theme/colors';
import { api } from '../../src/api';

export default function RegisterScreen() {
  const router = useRouter();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!displayName.trim() || (!email.trim() && !phone.trim()) || !password.trim()) {
      setError('Please provide name, password, and email or phone');
      return;
    }

    if (password.length < 10) {
      setError('Password must be at least 10 characters long');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const targetIdentifier = email.trim() || phone.trim();
      await api.auth.register({
        displayName: displayName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        password,
      });

      router.push({
        pathname: '/(auth)/otp',
        params: { identifier: targetIdentifier },
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Create Account"
        subtitle="Join the Sanad Learning Community"
        showBack
      />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          {Boolean(error) && (
            <View style={styles.errorBox}>
              <Text style={styles.errorBanner}>{error}</Text>
            </View>
          )}

          <Input
            label="Full Name *"
            placeholder="e.g. Abdullah Al-Mansoor"
            value={displayName}
            onChangeText={setDisplayName}
          />

          <Input
            label="Email Address"
            placeholder="learner@institution.edu"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Input
            label="Phone Number (Optional)"
            placeholder="+966 50 123 4567"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Input
            label="Password (Minimum 10 Characters) *"
            placeholder="Create a strong password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button
            title="Create Student Account"
            variant="primary"
            onPress={handleRegister}
            loading={loading}
            style={styles.submitBtn}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
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
    paddingBottom: 40,
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
  submitBtn: {
    marginTop: 6,
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
});
