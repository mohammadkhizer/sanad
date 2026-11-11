import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { colors } from '../../src/theme/colors';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetRequest = () => {
    if (!identifier.trim()) return;
    setLoading(true);
    // Simulate/Call API
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      Alert.alert(
        'Recovery Link Sent',
        'If an account exists with this email or phone, a secure single-use recovery code has been dispatched.'
      );
    }, 800);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter your registered email address or phone number to receive a secure recovery code.
        </Text>

        {!submitted ? (
          <>
            <Input
              label="Email or Phone"
              placeholder="scholar@example.com"
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
            />

            <Button
              title="Send Recovery Link"
              onPress={handleResetRequest}
              loading={loading}
              style={styles.submitBtn}
            />
          </>
        ) : (
          <View style={styles.successBox}>
            <Text style={styles.successText}>
              Recovery instructions dispatched. Please check your inbox or SMS.
            </Text>
            <Button
              title="Back to Log In"
              variant="outline"
              onPress={() => router.replace('/(auth)/login')}
              style={styles.backBtn}
            />
          </View>
        )}

        <TouchableOpacity style={styles.cancelLink} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
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
  form: {
    backgroundColor: colors.light.surface,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.light.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: colors.light.textSecondary,
    marginBottom: 20,
    lineHeight: 18,
  },
  submitBtn: {
    marginTop: 8,
  },
  successBox: {
    backgroundColor: '#ECFDF5',
    padding: 16,
    borderRadius: 8,
    marginVertical: 12,
  },
  successText: {
    color: colors.light.success,
    fontSize: 13,
    lineHeight: 18,
  },
  backBtn: {
    marginTop: 12,
  },
  cancelLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  cancelText: {
    color: colors.light.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});

