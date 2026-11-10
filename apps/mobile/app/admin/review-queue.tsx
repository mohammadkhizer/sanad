import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { theme } from '../../src/theme/colors';
import { Button } from '../../src/components/Button';
import { apiFetch } from '../../src/api/client';
import { useAuthStore } from '../../src/store/authStore';

export default function ReviewQueueScreen() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const isAdmin = user?.roles?.includes('admin');
  const isModerator = user?.roles?.includes('moderator');

  const { data: applications, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['adminApplications'],
    queryFn: async () => {
      const res = await apiFetch<any>('/admin/applications?status=pending');
      return res.data;
    },
  });

  const decisionMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      reviewNote,
    }: {
      id: string;
      status: 'approved' | 'rejected' | 'more_info';
      reviewNote?: string;
    }) => {
      return apiFetch(`/admin/applications/${id}/decision`, {
        method: 'POST',
        body: JSON.stringify({ status, reviewNote }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminApplications'] });
      Alert.alert('Decision Recorded', 'Scholar application updated successfully.');
    },
    onError: (err: any) => {
      Alert.alert('Action Denied', err.message || 'Operation failed.');
    },
  });

  const handleDecision = (id: string, status: 'approved' | 'rejected' | 'more_info') => {
    if (status === 'approved' && !isAdmin) {
      Alert.alert(
        'Policy Restriction',
        'Separation of Duties: Only administrators hold authority to approve scholar verification.'
      );
      return;
    }

    Alert.alert(
      'Confirm Decision',
      `Record application status as "${status}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            decisionMutation.mutate({
              id,
              status,
              reviewNote: `Decision by ${user?.displayName} (${isAdmin ? 'Admin' : 'Moderator'})`,
            });
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBanner}>
        <Text style={styles.bannerTitle}>Scholar Verification Queue</Text>
        <Text style={styles.bannerSub}>
          Separation of duties: Moderators verify documents; Administrators grant publishing authority.
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.brand.emerald} />
        </View>
      ) : (
        <FlatList
          data={applications || []}
          keyExtractor={(item) => item.id || item._id}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={theme.colors.brand.emerald}
            />
          }
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.applicantName}>
                  {item.userId?.displayName || 'Applicant'}
                </Text>
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingText}>PENDING REVIEW</Text>
                </View>
              </View>

              <Text style={styles.email}>{item.userId?.email}</Text>
              <Text style={styles.institution}>Institution: {item.institution}</Text>

              <View style={styles.specialtiesRow}>
                {item.specialties?.map((spec: string, idx: number) => (
                  <View key={idx} style={styles.specPill}>
                    <Text style={styles.specText}>{spec}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.statementLabel}>Lineage & Statement:</Text>
              <Text style={styles.statementText}>{item.statement}</Text>

              <View style={styles.buttonRow}>
                {isAdmin && (
                  <Button
                    title="Approve Scholar"
                    variant="primary"
                    size="sm"
                    onPress={() => handleDecision(item.id || item._id, 'approved')}
                    style={styles.decisionBtn}
                  />
                )}

                <Button
                  title="Request Info"
                  variant="outline"
                  size="sm"
                  onPress={() => handleDecision(item.id || item._id, 'more_info')}
                  style={styles.decisionBtn}
                />

                <Button
                  title="Reject"
                  variant="danger"
                  size="sm"
                  onPress={() => handleDecision(item.id || item._id, 'rejected')}
                  style={styles.decisionBtn}
                />
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>Queue Clear</Text>
              <Text style={styles.emptySub}>
                There are no pending scholar applications awaiting verification.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.light,
  },
  headerBanner: {
    backgroundColor: theme.colors.brand.emeraldDark,
    padding: theme.spacing.base,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: theme.typography.fontSize.base,
  },
  bannerSub: {
    color: '#C0D2CC',
    fontSize: theme.typography.fontSize.xs,
    marginTop: 2,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: theme.spacing.base,
  },
  card: {
    backgroundColor: theme.colors.surface.light,
    borderRadius: theme.radius.card,
    padding: theme.spacing.base,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    marginBottom: theme.spacing.base,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  applicantName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: 'bold',
    color: theme.colors.text.primaryLight,
  },
  pendingBadge: {
    backgroundColor: '#FAF3E0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.accent.gold,
  },
  pendingText: {
    color: theme.colors.accent.goldDark,
    fontSize: 10,
    fontWeight: 'bold',
  },
  email: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondaryLight,
    marginTop: 2,
  },
  institution: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.brand.emerald,
    marginTop: 6,
  },
  specialtiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  specPill: {
    backgroundColor: '#EAE6DC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.pill,
    marginRight: 6,
    marginBottom: 4,
  },
  specText: {
    fontSize: 11,
    color: theme.colors.text.primaryLight,
  },
  statementLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: 'bold',
    color: theme.colors.text.secondaryLight,
    marginTop: 8,
  },
  statementText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.primaryLight,
    backgroundColor: '#FAF8F3',
    padding: theme.spacing.sm,
    borderRadius: 6,
    marginTop: 4,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: theme.spacing.base,
  },
  decisionBtn: {
    flex: 1,
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text.primaryLight,
  },
  emptySub: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondaryLight,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
});
