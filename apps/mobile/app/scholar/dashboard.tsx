import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../src/theme/colors';
import { Button } from '../../src/components/Button';
import { VerifiedBadge } from '../../src/components/VerifiedBadge';
import { useAuthStore } from '../../src/store/authStore';

export default function ScholarDashboardScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Creator & Academic Studio</Text>
          <VerifiedBadge size="md" showLabel />
        </View>

        <Text style={styles.institution}>
          Affiliation: {user?.scholarProfile?.institution || 'Verified Scholar'}
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>1.2K</Text>
            <Text style={styles.statLabel}>Students Following</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>48</Text>
            <Text style={styles.statLabel}>Published Lectures</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Consultations</Text>
          </View>
        </View>

        <View style={styles.actionsBox}>
          <Button
            title="Publish New Reel / Video"
            variant="primary"
            onPress={() => router.push('/scholar/upload')}
            style={styles.actionBtn}
          />
          <Button
            title="Consultation Inquiries"
            variant="accent"
            onPress={() => router.push('/(tabs)/inbox')}
            style={styles.actionBtn}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.base,
    backgroundColor: theme.colors.background.light,
  },
  card: {
    backgroundColor: theme.colors.surface.light,
    borderRadius: theme.radius.card,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text.primaryLight,
  },
  institution: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondaryLight,
    marginBottom: theme.spacing.base,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FAF7EE',
    borderRadius: theme.radius.input,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.brand.emerald,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.text.secondaryLight,
    marginTop: 2,
    textAlign: 'center',
  },
  actionsBox: {
    gap: 10,
  },
  actionBtn: {
    marginBottom: 8,
  },
});
