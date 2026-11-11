import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../src/store/authStore';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { DevControlsBar } from '../src/components/DevControlsBar';
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
            headerStyle: { backgroundColor: colors.light.background },
            headerTintColor: colors.light.primary,
            headerTitleStyle: { fontWeight: '700' },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.light.background },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="scholar/apply" options={{ presentation: 'modal', title: 'Apply as Scholar', headerShown: true }} />
          <Stack.Screen name="scholar/status" options={{ headerShown: true, title: 'Application Status' }} />
          <Stack.Screen name="scholar/dashboard" options={{ headerShown: true, title: 'Scholar Panel' }} />
          <Stack.Screen name="scholar/schedule-live" options={{ headerShown: true, title: 'Schedule Live' }} />
          <Stack.Screen name="scholar/[id]" options={{ headerShown: true, title: 'Scholar Profile' }} />
          <Stack.Screen name="post/[id]" options={{ headerShown: true, title: 'Lesson / Reel' }} />
          <Stack.Screen name="profile/[id]/network" options={{ headerShown: true, title: 'Scholarly Network' }} />
          <Stack.Screen name="settings/index" options={{ headerShown: true, title: 'Settings' }} />
          <Stack.Screen name="settings/account" options={{ headerShown: true, title: 'Account Information' }} />
          <Stack.Screen name="settings/sessions" options={{ headerShown: true, title: 'Active Devices' }} />
          <Stack.Screen name="settings/two-factor" options={{ headerShown: true, title: '2FA Authentication' }} />
          <Stack.Screen name="settings/notifications" options={{ headerShown: true, title: 'Notifications & Quiet Hours' }} />
          <Stack.Screen name="settings/language-theme" options={{ headerShown: true, title: 'Language & Theme' }} />
          <Stack.Screen name="settings/privacy-terms" options={{ headerShown: true, title: 'Policy & Terms' }} />
          <Stack.Screen name="settings/delete-account" options={{ headerShown: true, title: 'Delete Account' }} />
          <Stack.Screen name="settings/data-export" options={{ headerShown: true, title: 'Data Export' }} />
          <Stack.Screen name="settings/blocked-users" options={{ headerShown: true, title: 'Blocked Users' }} />
          <Stack.Screen name="chat/[id]" options={{ headerShown: true, title: 'Scholarly Consultation' }} />
          <Stack.Screen name="live/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="call/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="admin/review-queue" options={{ headerShown: true, title: 'Verification Queue' }} />
          <Stack.Screen name="admin/applications/[id]" options={{ headerShown: true, title: 'Application Dossier' }} />
          <Stack.Screen name="admin/reports" options={{ headerShown: true, title: 'Trust & Safety Queue' }} />
          <Stack.Screen name="admin/reports/[id]" options={{ headerShown: true, title: 'Report Review & Action' }} />
          <Stack.Screen name="admin/audit-logs" options={{ headerShown: true, title: 'Audit Trail' }} />
          <Stack.Screen name="admin/roles" options={{ headerShown: true, title: 'Role Governance' }} />
          <Stack.Screen name="admin/config" options={{ headerShown: true, title: 'System Configuration' }} />
        </Stack>
        {__DEV__ && <DevControlsBar />}
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
