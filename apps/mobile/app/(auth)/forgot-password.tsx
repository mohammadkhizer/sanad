import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { AppHeader } from '../../src/components/AppHeader';
import { BrandLogo } from '../../src/components/BrandLogo';
import { colors } from '../../src/theme/colors';
import { api } from '../../src/api';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [identifier, setIdentifier] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResetRequest = async () => {
    if (!identifier.trim()) {
      setError('Please provide your registered email address or phone number');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await api.auth.forgotPassword(identifier.trim());
      setStep('reset');
      Alert.alert(
        'Recovery Code Dispatched',
        'If an account exists with this credential, a single-use verification code has been dispatched. Enter it below along with your new password.'
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Password recovery request failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!recoveryCode.trim()) {
      setError('Please enter the 6-digit recovery code');
      return;
    }
    if (!newPassword || newPassword.length < 10) {
      setError('New password must be at least 10 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await api.auth.resetPassword(recoveryCode.trim(), newPassword, identifier.trim());
      Alert.alert(
        'Password Updated',
        'Your password has been reset successfully. Please log in with your new credentials.',
        [
          {
            text: 'Sign In',
            onPress: () => router.replace('/(auth)/login'),
          },
        ]
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Password reset failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Account Recovery"
        subtitle={step === 'request' ? 'Request Recovery Code' : 'Set New Password'}
        showBack
        onBack={() => {
          if (step === 'reset') {
            setStep('request');
          } else {
            router.back();
          }
        }}
      />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.masthead}>
          <BrandLogo size="medium" />
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>
            {step === 'request' ? 'Reset Your Password' : 'Enter Verification Code'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 'request'
              ? 'Enter your registered email address or phone number to receive a secure recovery code.'
              : `Enter the recovery code sent for ${identifier.trim()} and create a new secure password.`}
          </Text>

          {Boolean(error) && (
            <View style={styles.errorBox}>
              <Text style={styles.errorBanner}>{error}</Text>
            </View>
          )}

          {step === 'request' ? (
            <>
              <Input
                label="Email or Phone Number"
                placeholder="scholar@institution.edu"
                value={identifier}
                onChangeText={(val) => {
                  setIdentifier(val);
                  setError(null);
                }}
                autoCapitalize="none"
              />

              <Button
                title="Send Recovery Code"
                variant="primary"
                onPress={handleResetRequest}
                loading={loading}
                style={styles.submitBtn}
              />
            </>
          ) : (
            <>
              <Input
                label="Recovery Code / Token"
                placeholder="6-digit code or reset token"
                value={recoveryCode}
                onChangeText={(val) => {
                  setRecoveryCode(val);
                  setError(null);
                }}
                autoCapitalize="none"
              />

              <Input
                label="New Password"
                placeholder="Min 10 characters"
                value={newPassword}
                onChangeText={(val) => {
                  setNewPassword(val);
                  setError(null);
                }}
                secureTextEntry
              />

              <Input
                label="Confirm New Password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChangeText={(val) => {
                  setConfirmPassword(val);
                  setError(null);
                }}
                secureTextEntry
              />

              <Button
                title="Update Password"
                variant="primary"
                onPress={handlePasswordUpdate}
                loading={loading}
                style={styles.submitBtn}
              />

              <Button
                title="Resend Recovery Code"
                variant="outline"
                onPress={handleResetRequest}
                disabled={loading}
                style={styles.resendBtn}
              />
            </>
          )}

          <TouchableOpacity
            style={styles.cancelLink}
            onPress={() => router.replace('/(auth)/login')}
          >
            <Text style={styles.cancelText}>Return to Sign In</Text>
          </TouchableOpacity>
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
    justifyContent: 'center',
    flexGrow: 1,
  },
  masthead: {
    alignItems: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: colors.light.surface,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.light.border,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.light.primary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.light.textSecondary,
    lineHeight: 18,
  },
  errorBox: {
    backgroundColor: '#FFF2F0',
    borderColor: '#FFCCC7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  errorBanner: {
    color: '#CF1322',
    fontSize: 12,
    fontWeight: '600',
  },
  submitBtn: {
    marginTop: 6,
  },
  resendBtn: {
    marginTop: 2,
  },
  cancelLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.light.textMuted,
  },
});
