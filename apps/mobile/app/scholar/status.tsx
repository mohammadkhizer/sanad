import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { api } from '../../src/api';
import { colors } from '../../src/theme/colors';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { AppHeader } from '../../src/components/AppHeader';
import { Icon } from '../../src/components/Icon';
import { ScholarApplicationEntity } from '@sanad/shared';

export default function ScholarApplicationStatusScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [appealText, setAppealText] = useState('');
  const [showAppeal, setShowAppeal] = useState(false);

  const { data: application, isLoading } = useQuery<ScholarApplicationEntity | null>({
    queryKey: ['myScholarApplication'],
    queryFn: () => api.verification.getMyApplication(),
  });

  const appealMutation = useMutation({
    mutationFn: async (_text: string) => {
      if (!application?._id) throw new Error('No active application found');
      return api.verification.endorseApplication(application._id);
    },
    onSuccess: () => {
      Alert.alert('Appeal Submitted', 'Your appeal has been added to the Senior Review Committee dossier.');
      setShowAppeal(false);
      queryClient.invalidateQueries({ queryKey: ['myScholarApplication'] });
    },
  });

  if (isLoading || !application) {
    return (
      <View style={styles.screen}>
        <AppHeader title="Verification Status" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.light.primary} />
          <Text style={styles.loadingText}>Retrieving verification status...</Text>
        </View>
      </View>
    );
  }

  const status = application.status;

  const getStatusConfig = () => {
    switch (status) {
      case 'approved':
        return {
          title: 'Accreditation Approved',
          description: 'Your scholarly lineage and credentials have been verified.',
          bg: 'rgba(15, 76, 69, 0.1)',
          borderColor: colors.light.primary,
          textColor: colors.light.primary,
          icon: 'verified' as const,
        };
      case 'more_info':
        return {
          title: 'Additional Documentation Required',
          description: 'The admissions committee requires secondary verification.',
          bg: '#FFFBEB',
          borderColor: colors.light.accent,
          textColor: colors.light.accentDark,
          icon: 'shield' as const,
        };
      case 'rejected':
        return {
          title: 'Accreditation Declined',
          description: 'Application did not meet committee verification criteria.',
          bg: '#FDF2F2',
          borderColor: colors.light.error,
          textColor: colors.light.error,
          icon: 'close' as const,
        };
      case 'pending':
      default:
        return {
          title: 'Under Formal Review',
          description: 'Admissions committee evaluating academic credentials and transmission lineage.',
          bg: 'rgba(201, 162, 39, 0.12)',
          borderColor: colors.light.accent,
          textColor: colors.light.primary,
          icon: 'shield' as const,
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Verification Status"
        subtitle="Accreditation Dossier"
        showBack
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Status Hero Card */}
        <View style={[styles.statusHero, { backgroundColor: statusConfig.bg, borderColor: statusConfig.borderColor }]}>
          <View style={styles.statusHeroIconBox}>
            <Icon name={statusConfig.icon} size={28} color={statusConfig.textColor} />
          </View>
          <View style={styles.statusHeroInfo}>
            <Text style={[styles.statusHeroTitle, { color: statusConfig.textColor }]}>
              {statusConfig.title}
            </Text>
            <Text style={styles.statusHeroDesc}>
              {statusConfig.description}
            </Text>
          </View>
        </View>

        {/* Verification Timeline */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Verification Milestones</Text>

          <View style={styles.timelineItem}>
            <View style={[styles.timelineIconBox, styles.timelineIconDone]}>
              <Icon name="check" size={14} color="#FFFFFF" />
            </View>
            <View style={styles.timelineDetails}>
              <Text style={styles.timelineHeading}>Application Dossier Submitted</Text>
              <Text style={styles.timelineSub}>Credentials and institution lineage recorded</Text>
            </View>
          </View>

          <View style={styles.timelineConnector} />

          <View style={styles.timelineItem}>
            <View
              style={[
                styles.timelineIconBox,
                (status === 'approved' || status === 'more_info' || status === 'rejected')
                  ? styles.timelineIconDone
                  : styles.timelineIconActive,
              ]}
            >
              {(status === 'approved' || status === 'more_info' || status === 'rejected') ? (
                <Icon name="check" size={14} color="#FFFFFF" />
              ) : (
                <View style={styles.activeDot} />
              )}
            </View>
            <View style={styles.timelineDetails}>
              <Text style={styles.timelineHeading}>Manual Credential Verification</Text>
              <Text style={styles.timelineSub}>Primary source check with institutional registries</Text>
            </View>
          </View>

          <View style={styles.timelineConnector} />

          <View style={styles.timelineItem}>
            <View
              style={[
                styles.timelineIconBox,
                status === 'approved' ? styles.timelineIconDone : styles.timelineIconPending,
              ]}
            >
              {status === 'approved' ? (
                <Icon name="check" size={14} color="#FFFFFF" />
              ) : (
                <View style={styles.pendingDot} />
              )}
            </View>
            <View style={styles.timelineDetails}>
              <Text style={styles.timelineHeading}>Committee Decision and Accreditation</Text>
              <Text style={styles.timelineSub}>
                {status === 'approved'
                  ? 'Accreditation granted. Verified scholar badge issued.'
                  : status === 'more_info'
                  ? 'Clarification requested by review committee'
                  : status === 'rejected'
                  ? 'Application declined by committee'
                  : 'Pending dual-reviewer signoff (within 72 hours)'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Status Specific Actions */}
        {status === 'approved' && (
          <Card style={styles.card}>
            <Text style={styles.actionCardTitle}>Complete Scholar Onboarding</Text>
            <Text style={styles.actionCardText}>
              Sanad policy mandates Two-Factor Authentication (2FA) for all accredited scholars before publishing video lessons or curricula.
            </Text>
            <Button
              title="Configure Mandatory 2FA"
              variant="accent"
              onPress={() => router.push('/(auth)/2fa-setup')}
              style={styles.actionBtn}
            />
          </Card>
        )}

        {status === 'more_info' && (
          <Card style={styles.card}>
            <Text style={styles.actionCardTitle}>Clarification Requested</Text>
            <Text style={styles.actionCardText}>
              Reviewer Note: {application.reviewNote || 'Please submit secondary credential verification.'}
            </Text>
            <Input
              label="Provide Additional Context or Clarification"
              value={appealText}
              onChangeText={setAppealText}
              placeholder="Describe your supplementary accreditations..."
              multiline
              numberOfLines={4}
            />
            <Button
              title="Submit Clarification"
              variant="primary"
              onPress={() => appealMutation.mutate(appealText)}
              loading={appealMutation.isPending}
              style={styles.actionBtn}
            />
          </Card>
        )}

        {status === 'rejected' && (
          <Card style={styles.card}>
            <Text style={styles.actionCardTitle}>Review Details</Text>
            <Text style={styles.actionCardText}>
              Reason: {application.reviewNote || 'Credentials could not be verified against institutional registries.'}
            </Text>
            <Text style={styles.actionCardText}>
              You may file a formal appeal to the Senior Review Committee or reapply after 30 days with accredited documentation.
            </Text>

            {!showAppeal ? (
              <View style={styles.btnRow}>
                <Button
                  title="File Formal Appeal"
                  variant="outline"
                  onPress={() => setShowAppeal(true)}
                  style={styles.flexBtn}
                />
                <Button
                  title="Reapply"
                  variant="primary"
                  onPress={() => router.push('/scholar/apply')}
                  style={styles.flexBtn}
                />
              </View>
            ) : (
              <View style={styles.appealArea}>
                <Input
                  label="Appeal Justification"
                  value={appealText}
                  onChangeText={setAppealText}
                  placeholder="State why this decision should be reviewed..."
                  multiline
                  numberOfLines={3}
                />
                <Button
                  title="Submit Appeal to Committee"
                  variant="accent"
                  onPress={() => appealMutation.mutate(appealText)}
                  loading={appealMutation.isPending}
                  style={styles.actionBtn}
                />
              </View>
            )}
          </Card>
        )}

        {/* Dossier Summary */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Recorded Dossier</Text>
          <View style={styles.dossierRow}>
            <Text style={styles.dossierLabel}>Institution</Text>
            <Text style={styles.dossierValue}>{application.institution}</Text>
          </View>
          <View style={styles.dossierRow}>
            <Text style={styles.dossierLabel}>Specialisations</Text>
            <Text style={styles.dossierValue}>{application.specialties.join(', ')}</Text>
          </View>
          <View style={styles.dossierRow}>
            <Text style={styles.dossierLabel}>Credentials</Text>
            <Text style={styles.dossierValue}>{application.credentials.length} certified document(s)</Text>
          </View>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: colors.light.textSecondary,
    fontWeight: '600',
  },
  statusHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  statusHeroIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.light.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusHeroInfo: {
    flex: 1,
  },
  statusHeroTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  statusHeroDesc: {
    fontSize: 12,
    color: colors.light.textSecondary,
    marginTop: 2,
    lineHeight: 17,
  },
  card: {
    padding: 18,
    borderRadius: 14,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.light.primary,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timelineIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineIconDone: {
    backgroundColor: colors.light.primary,
  },
  timelineIconActive: {
    backgroundColor: colors.light.accent,
  },
  timelineIconPending: {
    backgroundColor: colors.light.border,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.light.primary,
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.light.textMuted,
  },
  timelineDetails: {
    flex: 1,
  },
  timelineHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.light.text,
  },
  timelineSub: {
    fontSize: 11,
    color: colors.light.textMuted,
    marginTop: 1,
  },
  timelineConnector: {
    width: 2,
    height: 20,
    backgroundColor: colors.light.border,
    marginLeft: 13,
  },
  actionCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.light.primary,
  },
  actionCardText: {
    fontSize: 13,
    color: colors.light.textSecondary,
    lineHeight: 19,
  },
  actionBtn: {
    marginTop: 4,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  flexBtn: {
    flex: 1,
  },
  appealArea: {
    gap: 12,
    marginTop: 6,
  },
  dossierRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  dossierLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.light.textMuted,
  },
  dossierValue: {
    fontSize: 12,
    color: colors.light.text,
    fontWeight: '600',
  },
});
