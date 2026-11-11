import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { colors } from '../../src/theme/colors';
import { apiClient } from '../../src/api/client';

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

      const res = await apiClient<{ message: string; identifier: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          displayName: displayName.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          password,
        }),
      });

      router.push({
        pathname: '/(auth)/otp',
        params: { identifier: res.identifier },
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Join Sanad</Text>
        <Text style={styles.subtitle}>Verified scholarship and trustworthy knowledge</Text>
      </View>

      <View style={styles.form}>
        {Boolean(error) && <Text style={styles.errorBanner}>{error}</Text>}

        <Input
          label="Full Name"
          placeholder="Abdullah Al-Mansoor"
          value={displayName}
          onChangeText={setDisplayName}
        />

        <Input
          label="Email Address"
          placeholder="learner@example.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Input
          label="Phone Number (Optional)"
          placeholder="+1234567890"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <Input
          label="Password"
          placeholder="Min 10 characters"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Button
          title="Create Account"
          onPress={handleRegister}
          loading={loading}
          style={styles.submitBtn}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.footerLink}>Log In</Text>
          </TouchableOpacity>
        </View>
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
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.light.primary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.light.textSecondary,
    marginTop: 4,
    textAlign: 'center',
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
});

