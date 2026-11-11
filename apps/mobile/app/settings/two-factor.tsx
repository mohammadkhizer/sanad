import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { colors } from '../../src/theme/colors';
import { Card } from '../../src/components/Card';
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Two-Factor Security (TOTP)</Text>

      {Boolean(error) && <Text style={styles.errorBanner}>{error}</Text>}

      {step === 'init' && (
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Protect Your Sanad Authority</Text>
          <Text style={styles.cardText}>
            Two-factor authentication adds an essential layer of security. Scholars are required
            to have 2FA enabled before broadcasting live or publishing lessons.
          </Text>
          <Button
            title="Generate 2FA Secret Key"
            onPress={handleStartSetup}
            loading={loading}
            style={styles.actionBtn}
          />
        </Card>
      )}

      {step === 'verify' && (
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Step 1: Add Secret to Authenticator</Text>
          <Text style={styles.cardText}>
            Copy this secret key into Google Authenticator, Aegis, or your preferred authenticator
            app:
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
            style={styles.codeInput}
          />

          <Button
            title="Confirm & Enable 2FA"
            onPress={handleVerify}
            loading={loading}
            style={styles.actionBtn}
          />
        </Card>
      )}

      {step === 'completed' && (
        <Card style={styles.card}>
          <Text style={styles.successTitle}>Two-Factor Authentication Active</Text>
          <Text style={styles.cardText}>
            Store these emergency backup codes in a safe place. You can use them to recover access if
            you lose your device:
          </Text>

          <View style={styles.backupGrid}>
            {backupCodes.map((c, idx) => (
              <View key={idx} style={styles.backupItem}>
                <Text style={styles.backupText}>{c}</Text>
              </View>
            ))}
          </View>

          <Button
            title="Done"
            onPress={() => router.replace('/(tabs)/profile')}
            style={styles.actionBtn}
          />
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  content: {
    padding: 20,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.light.primary,
    marginBottom: 16,
  },
  card: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 13,
    color: colors.light.textSecondary,
    lineHeight: 18,
    marginBottom: 16,
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    color: colors.light.error,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 13,
  },
  secretBox: {
    backgroundColor: colors.light.surfaceElevated,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  secretText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.light.primary,
    letterSpacing: 2,
  },
  codeInput: {
    textAlign: 'center',
    fontSize: 22,
    letterSpacing: 6,
    fontWeight: '700',
  },
  actionBtn: {
    marginTop: 8,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.light.success,
    marginBottom: 8,
  },
  backupGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  backupItem: {
    backgroundColor: colors.light.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    width: '48%',
    alignItems: 'center',
  },
  backupText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.light.text,
    letterSpacing: 1,
  },
});

