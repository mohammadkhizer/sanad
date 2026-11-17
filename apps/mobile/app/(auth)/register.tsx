import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { AppHeader } from '../../src/components/AppHeader';
import { BrandLogo } from '../../src/components/BrandLogo';
import { colors } from '../../src/theme/colors';
import { api } from '../../src/api';

export default function RegisterScreen() {
  const router = useRouter();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!displayName.trim() || (!email.trim() && !phone.trim()) || !password.trim() || !dateOfBirth.trim()) {
      setError('Please provide name, email or phone, date of birth, and password');
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth.trim())) {
      setError('Date of birth must be in YYYY-MM-DD format (e.g. 2000-01-15)');
      return;
    }

    const birthDate = new Date(dateOfBirth.trim());
    if (isNaN(birthDate.getTime())) {
      setError('Invalid date of birth provided');
      return;
    }

    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }

    if (calculatedAge < 13) {
      setError('Learners must be at least 13 years of age to register on Sanad');
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
        dateOfBirth: dateOfBirth.trim(),
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
        <BrandLogo size="small" variant="horizontal" style={styles.brandLogoHeader} />
        <View style={styles.card}>
          {Boolean(error) && (
            <View style={styles.errorBox}>
              <Text style={styles.errorBanner}>{error}</Text>
            </View>
          )}

          <Input
            label="Full Name *"
            placeholder="Enter your full name"
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

          <View>
            <Input
              label="Date of Birth (YYYY-MM-DD) *"
              placeholder="e.g. 2000-01-15"
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
              maxLength={10}
            />
            <Text style={styles.hintText}>
              Required for safety and compliance. Learners must be at least 13 years of age.
            </Text>
          </View>

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
  brandLogoHeader: {
    alignSelf: 'center',
    marginBottom: 16,
  },
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
  hintText: {
    fontSize: 11,
    color: colors.light.textSecondary,
    marginTop: 4,
    lineHeight: 15,
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
