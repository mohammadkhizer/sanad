import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { colors } from '../../src/theme/colors';
import { Card } from '../../src/components/Card';
import { AppHeader } from '../../src/components/AppHeader';
import { Icon } from '../../src/components/Icon';
import { apiClient } from '../../src/api/client';

export default function TwoFactorSetupScreen() {
  const router = useRouter();

  const [step, setStep] = useState<'init' | 'verify' | 'completed'>('init');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartSetup = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient<{ secret: string; uri: string }>('/auth/2fa/setup', {
        method: 'POST',
      });
      setSecret(res.secret);
      setStep('verify');
    } catch (err: any) {
      setError(err.message || 'Failed to initiate 2FA setup');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await apiClient<{ success: boolean; backupCodes: string[] }>(
        '/auth/2fa/verify',
        {
          method: 'POST',
          body: JSON.stringify({ code: code.trim() }),
        }
      );
      setBackupCodes(res.backupCodes || []);
      setStep('completed');
    } catch (err: any) {
      setError(err.message || 'Verification failed. Code may be incorrect or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Two-Factor Security"
        subtitle="TOTP Authenticator Protection"
        showBack
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {Boolean(error) && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {step === 'init' && (
          <Card style={styles.card}>
            <View style={styles.iconCircle}>
              <Icon name="lock" size={32} color={colors.light.primary} />
            </View>
            <Text style={styles.cardTitle}>Protect Your Sanad Authority</Text>
            <Text style={styles.cardText}>
              Two-factor authentication adds cryptographic protection to your credentials. Verified scholars must enable 2FA prior to publishing lessons or hosting live circles.
            </Text>
            <Button
              title="Generate 2FA Secret Key"
              variant="primary"
              onPress={handleStartSetup}
              loading={loading}
              style={styles.actionBtn}
            />
          </Card>
        )}

        {step === 'verify' && (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Step 1: Link Authenticator App</Text>
            <Text style={styles.cardText}>
              Enter this secret key manually into Google Authenticator, Aegis, or Apple Passwords:
            </Text>
            <View style={styles.secretBox}>
              <Text style={styles.secretText} selectable>
                {secret}
              </Text>
            </View>

            <Text style={[styles.cardTitle, { marginTop: 16 }]}>
              Step 2: Enter Verification Code
            </Text>
            <Input
              label="6-Digit Authenticator Code"
              placeholder="123456"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
            />

            <Button
              title="Verify and Enable 2FA"
              variant="primary"
              onPress={handleVerify}
              loading={loading}
              style={styles.actionBtn}
            />
          </Card>
        )}

        {step === 'completed' && (
          <Card style={styles.card}>
            <View style={styles.iconCircle}>
              <Icon name="check" size={32} color={colors.light.primary} />
            </View>
            <Text style={styles.successTitle}>Two-Factor Authentication Active</Text>
            <Text style={styles.cardText}>
              Store these emergency backup codes in a secure archive. Each code can be used once to regain access if you lose your phone:
            </Text>

            <View style={styles.backupGrid}>
              {backupCodes.map((c, idx) => (
                <View key={idx} style={styles.backupItem}>
                  <Text style={styles.backupText}>{c}</Text>
                </View>
              ))}
            </View>

            <Button
              title="Complete Setup"
              variant="accent"
              onPress={() => router.replace('/(tabs)/profile')}
              style={styles.actionBtn}
            />
          </Card>
        )}
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
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    padding: 20,
    borderRadius: 14,
    gap: 12,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.light.background,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    borderWidth: 1.5,
    borderColor: colors.light.primary,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.light.primary,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.light.primary,
    textAlign: 'center',
  },
  cardText: {
    fontSize: 13,
    color: colors.light.textSecondary,
    lineHeight: 19,
  },
  secretBox: {
    backgroundColor: colors.light.background,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.light.border,
    alignItems: 'center',
  },
  secretText: {
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: '800',
    color: colors.light.primary,
    letterSpacing: 2,
  },
  backupGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 8,
  },
  backupItem: {
    backgroundColor: colors.light.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.light.border,
    width: '48%',
    alignItems: 'center',
  },
  backupText: {
    fontFamily: 'monospace',
    fontWeight: '700',
    fontSize: 12,
    color: colors.light.primary,
  },
  actionBtn: {
    marginTop: 8,
  },
  errorBox: {
    backgroundColor: '#FDF2F2',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  errorText: {
    fontSize: 12,
    color: colors.light.error,
    fontWeight: '600',
  },
});
