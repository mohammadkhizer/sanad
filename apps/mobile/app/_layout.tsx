import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../src/store/authStore';
import { theme } from '../src/theme/colors';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

export default function RootLayout() {
  const loadStoredAuth = useAuthStore((state) => state.loadStoredAuth);

  useEffect(() => {
    loadStoredAuth();
  }, [loadStoredAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" backgroundColor={theme.colors.brand.emerald} />
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
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen
          name="scholar/apply"
          options={{ title: 'Apply for Scholar Verification' }}
        />
        <Stack.Screen
          name="scholar/upload"
          options={{ title: 'Publish Reel or Lecture' }}
        />
        <Stack.Screen
          name="scholar/dashboard"
          options={{ title: 'Scholar Dashboard' }}
        />
        <Stack.Screen
          name="admin/review-queue"
          options={{ title: 'Scholar Verification Queue' }}
        />
        <Stack.Screen
          name="admin/reports"
          options={{ title: 'Moderation Reports' }}
        />
        <Stack.Screen name="chat/[id]" options={{ title: '1:1 Consultation' }} />
        <Stack.Screen name="live/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="call/[id]" options={{ headerShown: false }} />
      </Stack>
    </QueryClientProvider>
  );
}
