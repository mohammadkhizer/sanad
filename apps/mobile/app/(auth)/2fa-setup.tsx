import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { api } from '../../src/api';

export default function TwoFactorSetupScreen() {
  const router = useRouter();
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadSecret() {
      try {
        const res = await api.auth.setup2FA();
        setSecret(res.secret);
        setBackupCodes(res.backupCodes);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Failed to generate 2FA credentials';
        Alert.alert('Error', msg);
      }
    }
    loadSecret();
  }, []);

  const handleVerify = async () => {
    if (verificationCode.trim().length !== 6) {
      Alert.alert('Invalid Code', 'Please enter a 6-digit TOTP code from your authenticator app.');
      return;
    }
    setLoading(true);
    try {
      await api.auth.verify2FA(verificationCode.trim());
      Alert.alert(
        '2FA Activated',
        'Two-factor authentication is now active on your account. Keep your backup codes safe.',
        [{ text: 'Continue', onPress: () => router.replace('/(tabs)/profile') }]
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Verification failed';
      Alert.alert('Verification Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Two-Factor Authentication Setup</Text>
      <Text style={styles.desc}>
        Mandatory security control for scholars and administrators. Adds a second layer of verification to protect authentic publishing lineage.
      </Text>

      <Card style={styles.card}>
        <Text style={styles.stepTitle}>Step 1: Add to Authenticator App</Text>
        <Text style={styles.stepDesc}>
          Enter this secret key manually into Google Authenticator, Authy, or 1Password:
        </Text>
        <View style={styles.secretBox}>
          <Text style={styles.secretText}>{secret || 'GENERATING...'}</Text>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.stepTitle}>Step 2: Save Emergency Backup Codes</Text>
        <Text style={styles.stepDesc}>
          Save these one-time codes in a safe place. You will need them if you lose access to your device:
        </Text>
        <View style={styles.codesGrid}>
          {backupCodes.map((code, idx) => (
            <View key={idx} style={styles.codePill}>
              <Text style={styles.codeText}>{code}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.stepTitle}>Step 3: Confirm 6-Digit Code</Text>
        <Text style={styles.stepDesc}>
          Enter the current 6-digit code from your authenticator app to confirm setup:
        </Text>
        <Input
          label="Verification Code"
          value={verificationCode}
          onChangeText={setVerificationCode}
          placeholder="e.g. 123456"
          keyboardType="number-pad"
          maxLength={6}
        />
        <Button
          title="Verify and Enable 2FA"
          onPress={handleVerify}
          loading={loading}
          style={styles.verifyBtn}
        />
      </Card>
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
    paddingBottom: 40,
    gap: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.light.primary,
  },
  desc: {
    fontSize: 14,
    color: colors.light.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  card: {
    padding: 16,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.light.primary,
    marginBottom: 6,
  },
  stepDesc: {
    fontSize: 13,
    color: colors.light.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  secretBox: {
    backgroundColor: colors.light.surfaceElevated,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.light.border,
    alignItems: 'center',
  },
  secretText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.light.accentText,
    letterSpacing: 2,
  },
  codesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  codePill: {
    backgroundColor: colors.light.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  codeText: {
    fontSize: 13,
    fontFamily: 'monospace',
    fontWeight: '600',
    color: colors.light.text,
  },
  verifyBtn: {
    marginTop: 12,
  },
});

