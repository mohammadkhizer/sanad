import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { colors } from '../../../src/theme/colors';
import { Card } from '../../../src/components/Card';
import { Button } from '../../../src/components/Button';
import { Input } from '../../../src/components/Input';
import { Avatar } from '../../../src/components/Avatar';
import { api } from '../../../src/api';
import { ScholarApplicationEntity } from '@sanad/shared';

export default function ApplicationReviewDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [reviewNote, setReviewNote] = useState('');
  const [actionType, setActionType] = useState<'approved' | 'rejected' | 'more_info' | null>(null);

  const { data: application, isLoading } = useQuery<ScholarApplicationEntity>({
    queryKey: ['adminApplication', id],
    queryFn: () => api.verification.getApplication(id || 'app_201'),
  });

  const decisionMutation = useMutation({
    mutationFn: async (decision: 'approved' | 'rejected' | 'more_info') => {
      if (decision === 'rejected' && (!reviewNote || reviewNote.trim().length === 0)) {
        throw new Error('A detailed reason note is mandatory when rejecting an application.');
      }
      return api.verification.reviewApplication(id || 'app_201', {
        decision,
        reviewNote: reviewNote.trim() || undefined,
      });
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['adminApplications'] });
      Alert.alert(
        'Decision Logged',
        `Application has been marked as ${updated.status.toUpperCase()}. Action recorded in audit trail.`,
        [{ text: 'Return to Queue', onPress: () => router.replace('/admin/review-queue') }]
      );
    },
    onError: (e: Error) => {
      Alert.alert('Decision Error', e.message);
    },
  });

  if (isLoading || !application) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading application dossier...</Text>
      </View>
    );
  }

  const applicant = typeof application.userId === 'object' ? application.userId : null;
  const applicantName = applicant?.displayName || 'Scholar Applicant';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Profile Summary */}
      <Card style={styles.card}>
        <View style={styles.profileRow}>
          <Avatar name={applicantName} url={applicant?.avatarUrl} size={54} />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{applicantName}</Text>
            <Text style={styles.email}>{applicant?.email || 'email-verified'}</Text>
            <Text style={styles.institution}>{application.institution}</Text>
          </View>
        </View>

        <View style={styles.dossierMeta}>
          <Text style={styles.metaLabel}>Specialties: </Text>
          <Text style={styles.metaValue}>{application.specialties.join(', ')}</Text>
        </View>
        <View style={styles.dossierMeta}>
          <Text style={styles.metaLabel}>Languages: </Text>
          <Text style={styles.metaValue}>{application.languages.join(', ')}</Text>
        </View>
      </Card>

      {/* Applicant Statement */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Scholarly Statement & Lineage</Text>
        <Text style={styles.statementText}>{application.statement}</Text>
      </Card>

      {/* Uploaded Credential Documents */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>
          Credential Documents ({application.credentials.length})
        </Text>
        {application.credentials.map((cred, idx) => (
          <View key={idx} style={styles.docItem}>
            <View style={styles.docHeader}>
              <View style={styles.docBadge}>
                <Text style={styles.docBadgeText}>[{cred.type.toUpperCase()}]</Text>
              </View>
              <Text style={styles.docYear}>{cred.year}</Text>
            </View>
            <Text style={styles.docInstitution}>{cred.institution}</Text>
            <TouchableOpacity
              style={styles.fileLink}
              onPress={() => Alert.alert('Secure Viewer', `Decrypting signed link for: ${cred.fileKey}`)}
            >
              <Text style={styles.fileLinkText}>[VIEW SECURE DOCUMENT: {cred.fileKey}]</Text>
            </TouchableOpacity>
          </View>
        ))}
      </Card>

      {/* Reviewer Decision Controls */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Accreditation Decision</Text>
        <Text style={styles.instruction}>
          Approve grants verified status and triggers 2FA setup requirement. Rejection requires a formal justification.
        </Text>

        <Input
          label="Review Note / Rejection Reason"
          value={reviewNote}
          onChangeText={setReviewNote}
          placeholder="State reason or clarification requirements..."
          multiline
          numberOfLines={3}
        />

        <View style={styles.actionsGrid}>
          <Button
            title="Approve & Grant Badge"
            onPress={() => decisionMutation.mutate('approved')}
            loading={decisionMutation.isPending && actionType === 'approved'}
            style={styles.approveBtn}
          />

          <View style={styles.splitRow}>
            <Button
              title="Request More Info"
              variant="outline"
              onPress={() => decisionMutation.mutate('more_info')}
              loading={decisionMutation.isPending && actionType === 'more_info'}
              style={styles.halfBtn}
            />
            <Button
              title="Reject Application"
              variant="outline"
              onPress={() => decisionMutation.mutate('rejected')}
              loading={decisionMutation.isPending && actionType === 'rejected'}
              style={[styles.halfBtn, styles.rejectBtn]}
            />
          </View>
        </View>
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
    paddingBottom: 40,
    gap: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.light.background,
  },
  loadingText: {
    color: colors.light.textSecondary,
    fontSize: 14,
  },
  card: {
    padding: 16,
    gap: 10,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.light.text,
  },
  email: {
    fontSize: 12,
    color: colors.light.textSecondary,
    marginTop: 2,
  },
  institution: {
    fontSize: 13,
    color: colors.light.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  dossierMeta: {
    flexDirection: 'row',
    marginTop: 4,
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.light.primary,
  },
  metaValue: {
    fontSize: 12,
    color: colors.light.text,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.light.primary,
    marginBottom: 4,
  },
  statementText: {
    fontSize: 13,
    color: colors.light.text,
    lineHeight: 20,
  },
  docItem: {
    backgroundColor: colors.light.surfaceElevated,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.light.border,
    gap: 4,
  },
  docHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  docBadge: {
    backgroundColor: colors.light.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  docBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.light.accentText,
  },
  docYear: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.light.textSecondary,
  },
  docInstitution: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.light.text,
  },
  fileLink: {
    marginTop: 4,
  },
  fileLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.light.primary,
  },
  instruction: {
    fontSize: 12,
    color: colors.light.textSecondary,
    lineHeight: 16,
    marginBottom: 6,
  },
  actionsGrid: {
    marginTop: 10,
    gap: 10,
  },
  approveBtn: {
    backgroundColor: colors.light.success,
  },
  splitRow: {
    flexDirection: 'row',
    gap: 10,
  },
  halfBtn: {
    flex: 1,
  },
  rejectBtn: {
    borderColor: colors.light.error,
  },
});
