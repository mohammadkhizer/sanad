import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { AppHeader } from '../../src/components/AppHeader';
import { colors } from '../../src/theme/colors';
import { api } from '../../src/api';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetRequest = async () => {
    if (!identifier.trim()) return;
    setLoading(true);
    try {
      await api.auth.forgotPassword(identifier.trim());
      setSubmitted(true);
      Alert.alert(
        'Recovery Link Sent',
        'If an account exists with this email or phone, a secure single-use recovery code has been dispatched.'
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Reset failed';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Reset Password"
        subtitle="Account Recovery"
        showBack
      />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Account Recovery</Text>
          <Text style={styles.subtitle}>
            Enter your registered email address or phone number to receive a secure password recovery code.
          </Text>

          {!submitted ? (
            <>
              <Input
                label="Email or Phone Number"
                placeholder="scholar@institution.edu"
                value={identifier}
                onChangeText={setIdentifier}
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
            <View style={styles.successBox}>
              <Text style={styles.successText}>
                Recovery instructions dispatched. Please check your inbox or SMS message.
              </Text>
              <Button
                title="Return to Log In"
                variant="outline"
                onPress={() => router.replace('/(auth)/login')}
                style={styles.backBtn}
              />
            </View>
          )}

          <TouchableOpacity style={styles.cancelLink} onPress={() => router.back()}>
            <Text style={styles.cancelText}>Cancel and return</Text>
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
  submitBtn: {
    marginTop: 6,
  },
  successBox: {
    backgroundColor: 'rgba(15, 76, 69, 0.08)',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.light.primary,
    gap: 10,
  },
  successText: {
    fontSize: 13,
    color: colors.light.primary,
    lineHeight: 19,
    fontWeight: '600',
  },
  backBtn: {
    marginTop: 4,
  },
  cancelLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.light.textMuted,
  },
});
