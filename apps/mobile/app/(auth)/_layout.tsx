import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '../../src/theme/colors';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.light.background },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="admin-register" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="two-factor" />
      <Stack.Screen name="2fa-setup" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="onboarding" />
    </Stack>
  );
}
