import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { useAuthStore } from '../../src/store/authStore';
import { api } from '../../src/api';

export default function DeleteAccountScreen() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [confirmPhrase, setConfirmPhrase] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDelete = () => {
    if (confirmPhrase.trim().toUpperCase() !== 'DELETE') {
      Alert.alert('Confirmation Required', 'Please type DELETE exactly to confirm account termination.');
      return;
    }

    Alert.alert(
      'Permanent Account Deletion',
      'This action cannot be undone. All your posts, comments, consultation history, and scholar credentials will be immediately purged.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await api.users.deleteAccount('DELETE');
              await logout();
              Alert.alert('Account Deleted', 'Your account has been permanently removed.');
              router.replace('/(auth)/login');
            } catch (e: unknown) {
              const msg = e instanceof Error ? e.message : 'Deletion failed';
              Alert.alert('Error', msg);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>[PERMANENT DATA ERASURE]</Text>
          <Text style={styles.warningBody}>
            In accordance with App Store & Google Play privacy requirements, Sanad guarantees immediate and permanent data erasure.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>What Happens Upon Deletion:</Text>
        <Text style={styles.bulletPoint}>- Your profile, name, and bio are removed immediately.</Text>
        <Text style={styles.bulletPoint}>- All active sessions and refresh tokens are permanently revoked.</Text>
        <Text style={styles.bulletPoint}>- Uploaded credential documents are securely shredded from storage.</Text>
        <Text style={styles.bulletPoint}>- Verified scholar badge and publishing permissions are forfeited.</Text>

        <View style={styles.inputArea}>
          <Text style={styles.inputPrompt}>
            Type <Text style={styles.boldText}>DELETE</Text> in capital letters to confirm:
          </Text>
          <Input
            value={confirmPhrase}
            onChangeText={setConfirmPhrase}
            placeholder="DELETE"
            autoCapitalize="characters"
          />
        </View>

        <Button
          title="Permanently Delete Account"
          onPress={handleDelete}
          loading={loading}
          style={styles.deleteBtn}
        />
      </Card>
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
    gap: 12,
  },
  warningBox: {
    backgroundColor: '#FDE8E8',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.light.error,
  },
  warningTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.light.error,
    marginBottom: 4,
  },
  warningBody: {
    fontSize: 12,
    color: '#9B1C1C',
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.light.text,
    marginTop: 4,
  },
  bulletPoint: {
    fontSize: 13,
    color: colors.light.textSecondary,
    lineHeight: 18,
  },
  inputArea: {
    marginTop: 8,
  },
  inputPrompt: {
    fontSize: 13,
    color: colors.light.text,
    marginBottom: 8,
  },
  boldText: {
    fontWeight: '800',
    color: colors.light.error,
  },
  deleteBtn: {
    backgroundColor: colors.light.error,
    marginTop: 8,
  },
});
