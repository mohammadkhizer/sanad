import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../src/store/authStore';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

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
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="scholar/apply" options={{ presentation: 'modal', title: 'Apply as Scholar', headerShown: true }} />
          <Stack.Screen name="scholar/dashboard" options={{ headerShown: true, title: 'Scholar Panel' }} />
          <Stack.Screen name="scholar/[id]" options={{ headerShown: true, title: 'Scholar Profile' }} />
          <Stack.Screen name="post/[id]" options={{ headerShown: true, title: 'Lesson / Reel' }} />
          <Stack.Screen name="settings/index" options={{ headerShown: true, title: 'Settings' }} />
          <Stack.Screen name="settings/two-factor" options={{ headerShown: true, title: '2FA Setup' }} />
          <Stack.Screen name="chat/[id]" options={{ headerShown: true, title: 'Chat' }} />
          <Stack.Screen name="live/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="call/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="admin/review-queue" options={{ headerShown: true, title: 'Review Queue' }} />
          <Stack.Screen name="admin/reports" options={{ headerShown: true, title: 'Reports' }} />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

