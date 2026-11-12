import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../src/store/authStore';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../src/theme/colors';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.light.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="scholar/apply" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="scholar/status" options={{ headerShown: false }} />
          <Stack.Screen name="scholar/dashboard" options={{ headerShown: false }} />
          <Stack.Screen name="scholar/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="post/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="profile/[id]/network" options={{ headerShown: false }} />
          <Stack.Screen name="settings/index" options={{ headerShown: false }} />
          <Stack.Screen name="settings/account" options={{ headerShown: false }} />
          <Stack.Screen name="settings/sessions" options={{ headerShown: false }} />
          <Stack.Screen name="settings/two-factor" options={{ headerShown: false }} />
          <Stack.Screen name="settings/notifications" options={{ headerShown: false }} />
          <Stack.Screen name="settings/language-theme" options={{ headerShown: false }} />
          <Stack.Screen name="settings/privacy-terms" options={{ headerShown: false }} />
          <Stack.Screen name="settings/delete-account" options={{ headerShown: false }} />
          <Stack.Screen name="settings/data-export" options={{ headerShown: false }} />
          <Stack.Screen name="settings/blocked-users" options={{ headerShown: false }} />
          <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="call/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="admin/review-queue" options={{ headerShown: false }} />
          <Stack.Screen name="admin/applications/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="admin/reports" options={{ headerShown: false }} />
          <Stack.Screen name="admin/reports/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="admin/audit-logs" options={{ headerShown: false }} />
          <Stack.Screen name="admin/roles" options={{ headerShown: false }} />
          <Stack.Screen name="admin/config" options={{ headerShown: false }} />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
