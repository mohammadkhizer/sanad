import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { Icon } from '../../src/components/Icon';
import { colors } from '../../src/theme/colors';

export default function TabsLayout() {
  const user = useAuthStore((state) => state.user);
  const isScholar = Boolean(user?.roles?.includes('scholar') || user?.roles?.includes('admin'));

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.light.surface,
          borderTopWidth: 1,
          borderTopColor: colors.light.border,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.04,
          shadowRadius: 4,
        },
        tabBarActiveTintColor: colors.light.primary,
        tabBarInactiveTintColor: colors.light.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.3,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Sanad',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name={focused ? 'home' : 'home-outline'}
              size={22}
              color={focused ? colors.light.primary : (color as string)}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="reels"
        options={{
          title: 'Reels',
          tabBarLabel: 'Reels',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name={focused ? 'reels' : 'reels-outline'}
              size={22}
              color={focused ? colors.light.primary : (color as string)}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarLabel: 'Discover',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name={focused ? 'explore' : 'explore-outline'}
              size={22}
              color={focused ? colors.light.primary : (color as string)}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Publish',
          tabBarLabel: 'Publish',
          href: isScholar ? '/(tabs)/create' : null,
          tabBarIcon: ({ focused }) => (
            <View style={styles.createButtonContainer}>
              <Icon name="create" size={24} color="#FFFFFF" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Inbox',
          tabBarLabel: 'Inbox',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name={focused ? 'inbox' : 'inbox-outline'}
              size={22}
              color={focused ? colors.light.primary : (color as string)}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Icon
              name={focused ? 'profile' : 'profile-outline'}
              size={22}
              color={focused ? colors.light.primary : (color as string)}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  createButtonContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
    borderWidth: 1.5,
    borderColor: colors.light.accent,
  },
});
