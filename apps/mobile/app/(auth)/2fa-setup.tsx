import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { AppHeader } from '../../src/components/AppHeader';
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
    <View style={styles.screen}>
      <AppHeader
        title="2FA Enrolment"
        subtitle="Mandatory Scholar Security"
        showBack
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.desc}>
          Mandatory security control for scholars and administrators. Adds a second cryptographic layer of verification to protect authentic publishing lineage.
        </Text>

        <Card style={styles.card}>
          <Text style={styles.stepTitle}>Step 1: Add to Authenticator App</Text>
          <Text style={styles.stepDesc}>
            Enter this secret key manually into Google Authenticator, Aegis, or Apple Passwords:
          </Text>
          <View style={styles.secretBox}>
            <Text style={styles.secretText} selectable>{secret || 'GENERATING...'}</Text>
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
          <Text style={styles.stepTitle}>Step 3: Confirm Enrolment</Text>
          <Input
            label="6-Digit Code from Authenticator"
            value={verificationCode}
            onChangeText={setVerificationCode}
            placeholder="123456"
            keyboardType="number-pad"
            maxLength={6}
          />
          <Button
            title="Activate Two-Factor Protection"
            variant="accent"
            onPress={handleVerify}
            loading={loading}
            style={styles.activateBtn}
          />
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
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  desc: {
    fontSize: 13,
    color: colors.light.textSecondary,
    lineHeight: 19,
  },
  card: {
    padding: 18,
    borderRadius: 14,
    gap: 10,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.light.primary,
  },
  stepDesc: {
    fontSize: 12,
    color: colors.light.textSecondary,
    lineHeight: 18,
  },
  secretBox: {
    backgroundColor: colors.light.background,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.light.border,
    alignItems: 'center',
    marginTop: 4,
  },
  secretText: {
    fontSize: 15,
    fontFamily: 'monospace',
    fontWeight: '800',
    color: colors.light.primary,
    letterSpacing: 2,
  },
  codesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  codePill: {
    backgroundColor: colors.light.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.light.border,
    width: '48%',
    alignItems: 'center',
  },
  codeText: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '700',
    color: colors.light.primary,
  },
  activateBtn: {
    marginTop: 6,
  },
});
