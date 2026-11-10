import React from 'react';
import { Stack } from 'expo-router';
import { theme } from '../../src/theme/colors';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.brand.emerald,
        },
        headerTintColor: theme.colors.text.onEmerald,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: {
          backgroundColor: theme.colors.background.light,
        },
      }}
    >
      <Stack.Screen name="login" options={{ title: 'Sign In' }} />
      <Stack.Screen name="register" options={{ title: 'Create Account' }} />
      <Stack.Screen name="otp" options={{ title: 'Verify OTP' }} />
      <Stack.Screen name="two-factor" options={{ title: 'Two-Factor Authentication' }} />
    </Stack>
  );
}

