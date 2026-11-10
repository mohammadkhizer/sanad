import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { theme } from '../../src/theme/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.accent.gold,
        tabBarInactiveTintColor: '#A0B2AC',
        tabBarStyle: {
          backgroundColor: theme.colors.brand.emerald,
          borderTopColor: theme.colors.brand.emeraldDark,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: theme.colors.brand.emerald,
        },
        headerTintColor: theme.colors.text.onEmerald,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Feed',
          tabBarLabel: ({ color }) => (
            <Text style={{ color, fontSize: 11, fontWeight: '600' }}>Feed</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Scholars',
          tabBarLabel: ({ color }) => (
            <Text style={{ color, fontSize: 11, fontWeight: '600' }}>Scholars</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="live"
        options={{
          title: 'Live',
          tabBarLabel: ({ color }) => (
            <Text style={{ color, fontSize: 11, fontWeight: '600' }}>Live</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Inbox',
          tabBarLabel: ({ color }) => (
            <Text style={{ color, fontSize: 11, fontWeight: '600' }}>Inbox</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: ({ color }) => (
            <Text style={{ color, fontSize: 11, fontWeight: '600' }}>Profile</Text>
          ),
        }}
      />
    </Tabs>
  );
}

