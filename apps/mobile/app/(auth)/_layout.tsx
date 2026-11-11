import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '../../src/theme/colors';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.light.background },
        headerTintColor: colors.light.primary,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="login" options={{ title: 'Log In', headerBackVisible: false }} />
      <Stack.Screen name="register" options={{ title: 'Create Account' }} />
      <Stack.Screen name="otp" options={{ title: 'Verify OTP' }} />
      <Stack.Screen name="two-factor" options={{ title: 'Two-Factor Authentication' }} />
      <Stack.Screen name="forgot-password" options={{ title: 'Forgot Password' }} />
    </Stack>
  );
}

