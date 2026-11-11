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
import { AppHeader } from '../../src/components/AppHeader';
import { Icon } from '../../src/components/Icon';
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

  const handleQuickApprove = (id: string, name: string) => {
    Alert.alert(
      'Approve Scholar',
      `Accredit ${name} as a verified scholar and issue official platform credentials?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: () => {
            decisionMutation.mutate({ id, decision: 'approved', reviewNote: 'Approved in quick triage.' });
          },
        },
      ]
    );
  };

  const list = applications || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return { label: 'Approved', bg: 'rgba(15, 76, 69, 0.1)', text: colors.light.primary };
      case 'more_info':
        return { label: 'Needs Info', bg: '#FFFBEB', text: colors.light.accentDark };
      case 'rejected':
        return { label: 'Declined', bg: '#FDF2F2', text: colors.light.error };
      case 'pending':
      default:
        return { label: 'Pending Review', bg: 'rgba(201, 162, 39, 0.15)', text: colors.light.primary };
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Scholar Admissions"
        subtitle="Verification and Dossier Queue"
        showBack
      />

      {/* Filter Tabs */}
      <View style={styles.filterBar}>
        {(['pending', 'more_info', 'all'] as const).map((f) => {
          const isSelected = filter === f;
          return (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, isSelected && styles.filterBtnActive]}
              onPress={() => setFilter(f)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
                {f === 'pending' ? 'Pending Review' : f === 'more_info' ? 'Needs Info' : 'All Dossiers'}
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
            const badge = getStatusBadge(item.status);

            return (
              <Card style={styles.appCard}>
                <TouchableOpacity
                  onPress={() => router.push(`/admin/applications/${item._id}`)}
                  activeOpacity={0.7}
                >
                  <View style={styles.headerRow}>
                    <Text style={styles.applicantName}>{applicantName}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                        {badge.label}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.institution}>{item.institution}</Text>
                  <Text style={styles.specialties}>
                    Specialties: {item.specialties?.join(', ')}
                  </Text>
                  <Text style={styles.statementText} numberOfLines={2}>
                    "{item.statement}"
                  </Text>

                  <View style={styles.credentialsSummary}>
                    <Icon name="paperclip" size={14} color={colors.light.primary} />
                    <Text style={styles.credCountText}>
                      {item.credentials.length} credential document(s) attached
                    </Text>
                  </View>
                </TouchableOpacity>

                {item.status === 'pending' && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.reviewFullBtn}
                      onPress={() => router.push(`/admin/applications/${item._id}`)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.reviewFullText}>View Dossier</Text>
                      <Icon name="chevron-right" size={14} color={colors.light.primary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.quickApproveBtn}
                      onPress={() => handleQuickApprove(item._id, applicantName)}
                      activeOpacity={0.7}
                    >
                      <Icon name="check" size={14} color="#FFFFFF" />
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
  screen: {
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
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.light.background,
    borderWidth: 1,
    borderColor: colors.light.border,
    alignItems: 'center',
  },
  filterBtnActive: {
    backgroundColor: colors.light.primary,
    borderColor: colors.light.primaryDark,
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
    gap: 14,
  },
  appCard: {
    padding: 16,
    borderRadius: 14,
    gap: 10,
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
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  institution: {
    fontSize: 13,
    fontWeight: '700',
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
    lineHeight: 18,
  },
  credentialsSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.light.background,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.light.border,
    marginTop: 2,
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
    paddingTop: 12,
    gap: 10,
  },
  reviewFullBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.light.background,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.light.border,
    gap: 6,
  },
  reviewFullText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.light.primary,
  },
  quickApproveBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.light.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  quickApproveText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
});
