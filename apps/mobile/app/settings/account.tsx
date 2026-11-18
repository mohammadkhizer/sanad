import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAuthStore } from '../../src/store/authStore';
import { colors } from '../../src/theme/colors';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { AppHeader } from '../../src/components/AppHeader';
import { api } from '../../src/api';

export default function AccountSettingsScreen() {
  const user = useAuthStore((state) => state.user);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState('Student of classical sciences');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.users.updateProfile({
        displayName,
        email,
        phone,
        bio,
      });
      Alert.alert('Success', 'Your account details have been updated.');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Update failed';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Account Details"
        subtitle="Personal Profile and Bio"
        showBack
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Personal Identity</Text>
          <Input
            label="Display Name"
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
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="+1234567890"
            keyboardType="phone-pad"
          />
          <Input
            label="Biographical Summary"
            value={bio}
            onChangeText={setBio}
            placeholder="Brief scholarly or student summary..."
            multiline
            numberOfLines={3}
          />
          <Button
            title="Save Account Changes"
            variant="primary"
            onPress={handleSave}
            loading={loading}
            style={styles.saveBtn}
          />
        </Card>
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
  saveBtn: {
    marginTop: 6,
  },
});
