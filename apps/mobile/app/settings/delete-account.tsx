import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { AppHeader } from '../../src/components/AppHeader';
import { Icon } from '../../src/components/Icon';
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
    <View style={styles.screen}>
      <AppHeader
        title="Account Termination"
        subtitle="Permanent Data Erasure"
        showBack
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <View style={styles.warningBox}>
            <View style={styles.warningHeader}>
              <Icon name="close" size={18} color={colors.light.error} />
              <Text style={styles.warningTitle}>Irreversible Action</Text>
            </View>
            <Text style={styles.warningBody}>
              In accordance with App Store and Google Play privacy requirements, Sanad guarantees immediate and permanent data erasure.
            </Text>
          </View>

          <Text style={styles.sectionTitle}>What Happens Upon Deletion:</Text>
          <Text style={styles.bulletPoint}>• Your profile, name, and biographical data are permanently erased.</Text>
          <Text style={styles.bulletPoint}>• All active sessions and refresh tokens are terminated immediately.</Text>
          <Text style={styles.bulletPoint}>• Uploaded credential documents are permanently purged from secure storage.</Text>
          <Text style={styles.bulletPoint}>• Verified scholar accreditation and publishing rights are permanently forfeited.</Text>

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
            variant="outline"
            onPress={handleDelete}
            loading={loading}
            style={styles.deleteBtn}
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
  warningBox: {
    backgroundColor: '#FDF2F2',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    gap: 6,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  warningTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.light.error,
  },
  warningBody: {
    fontSize: 12,
    color: '#991B1B',
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.light.primary,
    marginTop: 4,
  },
  bulletPoint: {
    fontSize: 12,
    color: colors.light.text,
    lineHeight: 18,
  },
  inputArea: {
    marginTop: 8,
    gap: 6,
  },
  inputPrompt: {
    fontSize: 12,
    color: colors.light.textSecondary,
  },
  boldText: {
    fontWeight: '800',
    color: colors.light.error,
  },
  deleteBtn: {
    borderColor: colors.light.error,
    marginTop: 8,
  },
});
