import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../../src/theme/colors';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';

interface SessionItem {
  id: string;
  device: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

const mockSessions: SessionItem[] = [
  {
    id: 'sess_1',
    device: 'iPhone 16 Pro (iOS 27)',
    location: 'Riyadh, Saudi Arabia',
    ip: '176.28.19.42',
    lastActive: 'Active now',
    isCurrent: true,
  },
  {
    id: 'sess_2',
    device: 'MacBook Pro (Chrome)',
    location: 'Cairo, Egypt',
    ip: '197.34.82.11',
    lastActive: '2 hours ago',
    isCurrent: false,
  },
  {
    id: 'sess_3',
    device: 'Samsung Galaxy S24',
    location: 'London, United Kingdom',
    ip: '82.165.197.1',
    lastActive: '3 days ago',
    isCurrent: false,
  },
];

export default function ActiveSessionsScreen() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [sessions, setSessions] = useState<SessionItem[]>(mockSessions);

  const handleRevoke = (id: string) => {
    Alert.alert('Revoke Session', 'Are you sure you want to log out this device?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Revoke',
        style: 'destructive',
        onPress: () => {
          setSessions((prev) => prev.filter((s) => s.id !== id));
          Alert.alert('Session Terminated', 'The device session has been revoked.');
        },
      },
    ]);
  };

  const handleLogoutAll = () => {
    Alert.alert(
      'Logout All Devices',
      'This will revoke all active refresh tokens and terminate all sessions across every phone and computer.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out Everywhere',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.desc}>
        Manage all phones and computers currently authorized to access your Sanad account.
      </Text>

      <View style={styles.list}>
        {sessions.map((sess) => (
          <Card key={sess.id} style={styles.card}>
            <View style={styles.sessionHeader}>
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceName}>{sess.device}</Text>
                {sess.isCurrent && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>[CURRENT DEVICE]</Text>
                  </View>
                )}
              </View>
              {!sess.isCurrent && (
                <TouchableOpacity
                  style={styles.revokeBtn}
                  onPress={() => handleRevoke(sess.id)}
                >
                  <Text style={styles.revokeBtnText}>Revoke</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.metaText}>Location: {sess.location}</Text>
            <Text style={styles.metaText}>IP Address: {sess.ip}</Text>
            <Text style={styles.metaText}>Last Active: {sess.lastActive}</Text>
          </Card>
        ))}
      </View>

      <Button
        title="Log Out of All Devices"
        variant="outline"
        onPress={handleLogoutAll}
        style={styles.logoutAllBtn}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  desc: {
    fontSize: 13,
    color: colors.light.textSecondary,
    lineHeight: 18,
  },
  list: {
    gap: 12,
  },
  card: {
    padding: 16,
    gap: 6,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  deviceName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.light.text,
  },
  currentBadge: {
    backgroundColor: colors.light.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  currentBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.light.accentText,
  },
  revokeBtn: {
    backgroundColor: '#FDE8E8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  revokeBtnText: {
    color: colors.light.error,
    fontSize: 11,
    fontWeight: '700',
  },
  metaText: {
    fontSize: 12,
    color: colors.light.textSecondary,
  },
  logoutAllBtn: {
    marginTop: 8,
    borderColor: colors.light.error,
  },
});

