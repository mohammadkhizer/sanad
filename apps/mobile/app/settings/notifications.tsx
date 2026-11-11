import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { colors } from '../../src/theme/colors';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { api } from '../../src/api';

export default function NotificationsSettingsScreen() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [prayerQuietHours, setPrayerQuietHours] = useState(true);
  const [liveAlerts, setLiveAlerts] = useState(true);
  const [chatRequests, setChatRequests] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.notifications.updatePreferences({
        pushEnabled,
        prayerQuietHours,
        quietHoursEnabled: prayerQuietHours,
      });
      Alert.alert('Preferences Saved', 'Your notification and quiet hours settings have been updated.');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Save failed';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>General Notifications</Text>

        <View style={styles.settingRow}>
          <View style={styles.textContainer}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Text style={styles.settingSub}>Receive updates for followed scholars and consultations</Text>
          </View>
          <Switch
            value={pushEnabled}
            onValueChange={setPushEnabled}
            trackColor={{ false: colors.light.border, true: colors.light.primary }}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.settingRow}>
          <View style={styles.textContainer}>
            <Text style={styles.settingLabel}>Scholar Live Broadcasts</Text>
            <Text style={styles.settingSub}>Alerts when followed teachers begin broadcasting</Text>
          </View>
          <Switch
            value={liveAlerts}
            onValueChange={setLiveAlerts}
            trackColor={{ false: colors.light.border, true: colors.light.primary }}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.settingRow}>
          <View style={styles.textContainer}>
            <Text style={styles.settingLabel}>Consultation Messages</Text>
            <Text style={styles.settingSub}>Direct scholarly chat inquiries and responses</Text>
          </View>
          <Switch
            value={chatRequests}
            onValueChange={setChatRequests}
            trackColor={{ false: colors.light.border, true: colors.light.primary }}
          />
        </View>
      </Card>

      <Card style={styles.card}>
        <View style={styles.badgeRow}>
          <Text style={styles.sectionTitle}>Prayer-Time Quiet Hours</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>[RESPECTFUL DESIGN]</Text>
          </View>
        </View>

        <Text style={styles.quietDesc}>
          Automatically silences non-urgent alerts during canonical prayer times (Fajr, Dhuhr, Asr, Maghrib, Isha) based on your regional coordinates.
        </Text>

        <View style={styles.settingRow}>
          <View style={styles.textContainer}>
            <Text style={styles.settingLabel}>Enable Prayer Quiet Hours</Text>
            <Text style={styles.settingSub}>Mute notifications 15 min before and after prayer</Text>
          </View>
          <Switch
            value={prayerQuietHours}
            onValueChange={setPrayerQuietHours}
            trackColor={{ false: colors.light.border, true: colors.light.primary }}
          />
        </View>
      </Card>

      <Button
        title="Save Preferences"
        onPress={handleSave}
        loading={loading}
        style={styles.saveBtn}
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
    gap: 16,
  },
  card: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.light.primary,
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: colors.light.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.light.accentText,
  },
  quietDesc: {
    fontSize: 13,
    color: colors.light.textSecondary,
    lineHeight: 18,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  textContainer: {
    flex: 1,
    paddingRight: 16,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.text,
  },
  settingSub: {
    fontSize: 12,
    color: colors.light.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.light.border,
    marginVertical: 8,
  },
  saveBtn: {
    marginTop: 8,
  },
});
