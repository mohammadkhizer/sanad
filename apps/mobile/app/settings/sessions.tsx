import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../../src/theme/colors';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { AppHeader } from '../../src/components/AppHeader';
import { Icon } from '../../src/components/Icon';
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
    Alert.alert('Revoke Session', 'Are you sure you want to terminate access for this device?', [
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
      'Terminate All Sessions',
      'This will invalidate all active refresh tokens and log out every device including this one.',
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
    <View style={styles.screen}>
      <AppHeader
        title="Active Sessions"
        subtitle="Authorized Devices and Hardware"
        showBack
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.desc}>
          Review all mobile devices and browsers authorized to access your Sanad account credentials and messages.
        </Text>

        <View style={styles.list}>
          {sessions.map((sess) => (
            <Card key={sess.id} style={styles.card}>
              <View style={styles.sessionHeader}>
                <View style={styles.deviceInfo}>
                  <Text style={styles.deviceName}>{sess.device}</Text>
                  {sess.isCurrent && (
                    <View style={styles.currentBadge}>
                      <Icon name="check" size={10} color="#FFFFFF" />
                      <Text style={styles.currentBadgeText}>Current Device</Text>
                    </View>
                  )}
                </View>
                {!sess.isCurrent && (
                  <TouchableOpacity
                    style={styles.revokeBtn}
                    onPress={() => handleRevoke(sess.id)}
                    activeOpacity={0.7}
                  >
                    <Icon name="trash" size={14} color={colors.light.error} />
                    <Text style={styles.revokeBtnText}>Revoke</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Location: </Text>
                <Text style={styles.metaValue}>{sess.location}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>IP Address: </Text>
                <Text style={styles.metaValue}>{sess.ip}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Last Activity: </Text>
                <Text style={styles.metaValue}>{sess.lastActive}</Text>
              </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  desc: {
    fontSize: 13,
    color: colors.light.textSecondary,
    lineHeight: 19,
  },
  list: {
    gap: 12,
  },
  card: {
    padding: 16,
    borderRadius: 14,
    gap: 6,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.light.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  revokeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FDF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  revokeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.light.error,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.light.textMuted,
  },
  metaValue: {
    fontSize: 12,
    color: colors.light.text,
  },
  logoutAllBtn: {
    borderColor: colors.light.error,
    marginTop: 8,
  },
});
