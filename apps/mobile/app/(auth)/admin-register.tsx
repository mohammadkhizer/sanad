import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { AppHeader } from '../../src/components/AppHeader';
import { Card } from '../../src/components/Card';
import { Icon } from '../../src/components/Icon';
import { BrandLogo } from '../../src/components/BrandLogo';
import { colors } from '../../src/theme/colors';
import { api } from '../../src/api';
import { useAuthStore } from '../../src/store/authStore';

export default function AdminRegisterScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [password, setPassword] = useState('');
  const [adminSecret, setAdminSecret] = useState('SanadAdminSetup2026!');
  const [institution, setInstitution] = useState('Sanad Academic & Governance Council');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdminRegister = async () => {
    if (!displayName.trim() || !email.trim() || !password.trim() || !dateOfBirth.trim() || !adminSecret.trim()) {
      setError('Please provide full name, email, date of birth, password, and admin secret key');
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth.trim())) {
      setError('Date of birth must be in YYYY-MM-DD format (e.g. 1990-01-15)');
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
      setError('Administrators must be at least 13 years of age');
      return;
    }

    if (password.length < 10) {
      setError('Password must be at least 10 characters long');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await api.auth.adminRegister({
        displayName: displayName.trim(),
        username: username.trim() ? username.trim().toLowerCase() : undefined,
        email: email.trim().toLowerCase(),
        phone: phone.trim() ? phone.trim() : undefined,
        dateOfBirth: dateOfBirth.trim(),
        password,
        adminSecret: adminSecret.trim(),
        institution: institution.trim() || undefined,
      });

      if (res.accessToken && res.refreshToken && res.user) {
        await login(res.accessToken, res.refreshToken, {
          id: res.user._id || (res.user as any).id,
          displayName: res.user.displayName,
          email: res.user.email,
          phone: res.user.phone,
          roles: res.user.roles,
          twoFactorEnabled: (res.user as any).twoFactorEnabled ?? res.user.twoFA?.enabled,
        });

        Alert.alert(
          'Administrator Provisioned',
          `Welcome, ${res.user.displayName}. System administrator privileges and governance tools have been granted.`,
          [{ text: 'Proceed to Platform', onPress: () => router.replace('/(tabs)/feed') }]
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Admin registration failed. Please verify the provisioning secret.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Admin Provisioning"
        subtitle="System Administrator Registration"
        showBack
      />

      <ScrollView contentContainerStyle={styles.container}>
        <BrandLogo size="small" variant="horizontal" style={{ alignSelf: 'center', marginBottom: 16 }} />
        <View style={styles.banner}>
          <View style={styles.badgeBox}>
            <Icon name="shield" size={28} color={colors.light.primary} />
          </View>
          <Text style={styles.bannerTitle}>Governance & Administration Gateway</Text>
          <Text style={styles.bannerText}>
            Provisioning an administrator grants unrestricted oversight: reviewing scholar credentials, moderating content, executing suspensions, and managing role assignments.
          </Text>
        </View>

        <Card style={styles.formCard}>
          {Boolean(error) && (
            <View style={styles.errorBox}>
              <Text style={styles.errorBanner}>{error}</Text>
            </View>
          )}

          <Input
            label="Full Administrator Name *"
            placeholder="e.g. Mohammed Khizer Shaikh"
            value={displayName}
            onChangeText={setDisplayName}
          />

          <Input
            label="Administrator Username (Optional)"
            placeholder="e.g. khizer_admin"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <Input
            label="System Email Address *"
            placeholder="admin@sanad.app"
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
            label="Date of Birth (YYYY-MM-DD) *"
            placeholder="1995-06-15"
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
          />

          <Input
            label="Password (Min 10 characters) *"
            placeholder="Secure passkey"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Input
            label="Admin Provisioning Secret Key *"
            placeholder="Server bootstrap secret key"
            value={adminSecret}
            onChangeText={setAdminSecret}
            secureTextEntry
          />

          <Input
            label="Institution / Governance Affiliation"
            placeholder="Sanad Academic & Governance Council"
            value={institution}
            onChangeText={setInstitution}
          />

          <Button
            title="Provision System Administrator"
            variant="primary"
            onPress={handleAdminRegister}
            loading={loading}
            style={styles.submitBtn}
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have credentials? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.footerLink}>Return to Login</Text>
            </TouchableOpacity>
          </View>
        </Card>
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
    padding: 16,
    paddingBottom: 40,
  },
  banner: {
    backgroundColor: colors.light.surfaceElevated,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.light.border,
    alignItems: 'center',
  },
  badgeBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E6F4EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.light.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  bannerText: {
    fontSize: 12,
    color: colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  formCard: {
    padding: 16,
    gap: 10,
  },
  errorBox: {
    backgroundColor: '#FDF2F2',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginBottom: 4,
  },
  errorBanner: {
    color: colors.light.error,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  submitBtn: {
    marginTop: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
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

