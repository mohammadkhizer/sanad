import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { api } from '../../src/api';
import { colors } from '../../src/theme/colors';
import { Card } from '../../src/components/Card';
import { EmptyState } from '../../src/components/EmptyState';
import { ScholarApplicationEntity } from '@sanad/shared';

export default function ReviewQueueScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'pending' | 'more_info' | 'all'>('pending');

  const { data: applications, isLoading } = useQuery<ScholarApplicationEntity[]>({
    queryKey: ['adminApplications', filter],
    queryFn: () => api.verification.getApplications(filter),
  });

  const decisionMutation = useMutation({
    mutationFn: ({ id, decision, reviewNote }: { id: string; decision: 'approved' | 'rejected' | 'more_info'; reviewNote?: string }) =>
      api.verification.reviewApplication(id, { decision, reviewNote }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminApplications'] });
      Alert.alert('Decision Recorded', 'The scholar application status has been updated.');
    },
    onError: (err: Error) => {
      Alert.alert('Error', err.message || 'Failed to process decision');
    },
  });

  const handleQuickApprove = (id: string) => {
    decisionMutation.mutate({ id, decision: 'approved', reviewNote: 'Approved in quick triage.' });
  };

  const list = applications || [];

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterBar}>
        {(['pending', 'more_info', 'all'] as const).map((f) => {
          const isSelected = filter === f;
          return (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, isSelected && styles.filterBtnActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
                {f === 'pending' ? 'Pending Review' : f === 'more_info' ? 'Needs Info' : 'All Applications'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.light.primary} />
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const applicant = typeof item.userId === 'object' ? item.userId : null;
            const applicantName = applicant?.displayName || 'Applicant';

            return (
              <Card style={styles.appCard}>
                <TouchableOpacity
                  onPress={() => router.push(`/admin/applications/${item._id}`)}
                >
                  <View style={styles.headerRow}>
                    <Text style={styles.applicantName}>{applicantName}</Text>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusBadgeText}>[{item.status.toUpperCase()}]</Text>
                    </View>
                  </View>

                  <Text style={styles.institution}>
                    Institution: {item.institution}
                  </Text>
                  <Text style={styles.specialties}>
                    Specialties: {item.specialties?.join(', ')}
                  </Text>
                  <Text style={styles.statementText} numberOfLines={2}>
                    "{item.statement}"
                  </Text>

                  <View style={styles.credentialsSummary}>
                    <Text style={styles.credCountText}>
                      Documents: {item.credentials.length} credential file(s) attached
                    </Text>
                  </View>
                </TouchableOpacity>

                {item.status === 'pending' && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.reviewFullBtn}
                      onPress={() => router.push(`/admin/applications/${item._id}`)}
                    >
                      <Text style={styles.reviewFullText}>View Full Dossier</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.quickApproveBtn}
                      onPress={() => handleQuickApprove(item._id)}
                    >
                      <Text style={styles.quickApproveText}>Approve</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </Card>
            );
          }}
          ListEmptyComponent={
            <EmptyState
              title="Queue Clear"
              description="No applications currently awaiting verification review."
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  filterBar: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
    gap: 8,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: colors.light.surfaceElevated,
    alignItems: 'center',
  },
  filterBtnActive: {
    backgroundColor: colors.light.primary,
  },
  filterText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.light.textSecondary,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
    gap: 12,
  },
  appCard: {
    padding: 16,
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  applicantName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.light.primary,
  },
  statusBadge: {
    backgroundColor: colors.light.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.light.accentText,
  },
  institution: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.light.text,
  },
  specialties: {
    fontSize: 12,
    color: colors.light.textSecondary,
  },
  statementText: {
    fontSize: 12,
    color: colors.light.text,
    fontStyle: 'italic',
    lineHeight: 17,
  },
  credentialsSummary: {
    backgroundColor: colors.light.surfaceElevated,
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  credCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.light.primary,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
    paddingTop: 10,
    marginTop: 4,
    gap: 10,
  },
  reviewFullBtn: {
    flex: 1,
    backgroundColor: colors.light.surfaceElevated,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  reviewFullText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.light.text,
  },
  quickApproveBtn: {
    flex: 1,
    backgroundColor: colors.light.success,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  quickApproveText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
});
