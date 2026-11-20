import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Switch } from 'react-native';
import { useAuthStore } from '../../src/store/authStore';
import { colors } from '../../src/theme/colors';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { AppHeader } from '../../src/components/AppHeader';
import { api } from '../../src/api';

export default function AccountSettingsScreen() {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [username, setUsername] = useState(user?.username || '');
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || 'Student of classical sciences');
  const [isPrivate, setIsPrivate] = useState(user?.isPrivate || false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
      const payload: Record<string, unknown> = {
        displayName: displayName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
        isPrivate,
      };

      if (cleanUsername) {
        payload.username = cleanUsername;
      }

      await api.users.updateProfile(payload);
      await updateUser({
        displayName: displayName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
        username: cleanUsername || user?.username,
        isPrivate,
      });

      Alert.alert('Settings Saved', 'Your account profile and privacy configurations have been updated.');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Update failed';
      Alert.alert('Update Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Account Details"
        subtitle="Identity, Username & Privacy"
        showBack
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Scholarly & Member Identity</Text>

          <Input
            label="Public Username Handle"
            value={username}
            onChangeText={(val) => setUsername(val.toLowerCase())}
            placeholder="e.g. khizer_shaikh"
            autoCapitalize="none"
          />
          <Text style={styles.fieldNote}>
            Your unique handle across isnads, citations, and scholarly mentions.
          </Text>

          <Input
            label="Legal / Display Name"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Your full name"
          />

          <Input
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="your.email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Contact Phone"
            value={phone}
            onChangeText={setPhone}
            placeholder="+1234567890"
            keyboardType="phone-pad"
          />

          <Input
            label="Biographical & Academic Summary"
            value={bio}
            onChangeText={setBio}
            placeholder="Brief scholarly or student summary..."
            multiline
            numberOfLines={3}
          />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Social Account Privacy</Text>
          <View style={styles.privacyRow}>
            <View style={styles.privacyTextContainer}>
              <Text style={styles.privacyTitle}>Private Account</Text>
              <Text style={styles.privacyDesc}>
                When enabled, only followers you approve can view your posts, transmissions, and isnad charts.
              </Text>
            </View>
            <Switch
              value={isPrivate}
              onValueChange={setIsPrivate}
              trackColor={{ false: colors.light.border, true: colors.light.primary }}
              thumbColor={isPrivate ? colors.light.surface : '#f4f3f4'}
            />
          </View>
        </Card>

        <Button
          title="Save Account Changes"
          variant="primary"
          onPress={handleSave}
          loading={loading}
          style={styles.saveBtn}
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
  card: {
    padding: 18,
    borderRadius: 14,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.light.primary,
    marginBottom: 4,
  },
  fieldNote: {
    fontSize: 11,
    color: colors.light.textMuted,
    marginTop: -8,
    marginBottom: 4,
    lineHeight: 14,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    gap: 12,
  },
  privacyTextContainer: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: 2,
  },
  privacyDesc: {
    fontSize: 12,
    color: colors.light.textSecondary,
    lineHeight: 16,
  },
  saveBtn: {
    marginTop: 6,
  },
});
