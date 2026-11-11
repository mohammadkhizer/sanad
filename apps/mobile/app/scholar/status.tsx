import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { api } from '../../src/api';
import { colors } from '../../src/theme/colors';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
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
    mutationFn: async (text: string) => {
      // In mock mode, submit clarification or appeal
      return api.verification.endorseApplication(application?._id || 'app_201');
    },
    onSuccess: () => {
      Alert.alert('Appeal Submitted', 'Your appeal has been added to the Senior Review Committee dossier.');
      setShowAppeal(false);
      queryClient.invalidateQueries({ queryKey: ['myScholarApplication'] });
    },
  });

  if (isLoading || !application) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Retrieving verification status...</Text>
      </View>
    );
  }

  const status = application.status;

  const getStatusBadge = () => {
    switch (status) {
      case 'approved':
        return { label: '[STATUS: APPROVED]', bg: colors.light.success, text: '#FFFFFF' };
      case 'more_info':
        return { label: '[STATUS: MORE INFO REQUIRED]', bg: colors.light.warning, text: '#1F2933' };
      case 'rejected':
        return { label: '[STATUS: REJECTED]', bg: colors.light.error, text: '#FFFFFF' };
      case 'pending':
      default:
        return { label: '[STATUS: UNDER REVIEW]', bg: colors.light.accent, text: colors.light.accentText };
    }
  };

  const badge = getStatusBadge();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Status Banner */}
      <View style={[styles.statusBanner, { backgroundColor: badge.bg }]}>
        <Text style={[styles.statusBannerText, { color: badge.text }]}>{badge.label}</Text>
      </View>

      {/* Stepper / Timeline */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Verification Progress</Text>
        <View style={styles.stepRow}>
          <View style={[styles.stepCircle, styles.stepCompleted]}>
            <Text style={styles.stepNum}>1</Text>
          </View>
          <View style={styles.stepInfo}>
            <Text style={styles.stepHeading}>Application Submitted</Text>
            <Text style={styles.stepDetail}>Credentials & institutional dossier received</Text>
          </View>
        </View>

        <View style={styles.stepDivider} />

        <View style={styles.stepRow}>
          <View
            style={[
              styles.stepCircle,
              (status === 'approved' || status === 'more_info' || status === 'rejected') &&
                styles.stepCompleted,
            ]}
          >
            <Text style={styles.stepNum}>2</Text>
          </View>
          <View style={styles.stepInfo}>
            <Text style={styles.stepHeading}>Credential Document Verification</Text>
            <Text style={styles.stepDetail}>Manual review by Trust & Safety moderators</Text>
          </View>
        </View>

        <View style={styles.stepDivider} />

        <View style={styles.stepRow}>
          <View style={[styles.stepCircle, status === 'approved' && styles.stepCompleted]}>
            <Text style={styles.stepNum}>3</Text>
          </View>
          <View style={styles.stepInfo}>
            <Text style={styles.stepHeading}>Accreditation Decision</Text>
            <Text style={styles.stepDetail}>
              {status === 'approved'
                ? 'Accreditation granted. Verified badge issued.'
                : status === 'more_info'
                ? 'Clarification requested by review committee'
                : status === 'rejected'
                ? 'Application not approved at this time'
                : 'Pending two-member reviewer signoff (< 72h)'}
            </Text>
          </View>
        </View>
      </Card>

      {/* Decision-Specific Action Areas */}
      {status === 'approved' && (
        <Card style={styles.card}>
          <Text style={styles.approvedTitle}>Congratulations, Verified Scholar</Text>
          <Text style={styles.approvedBody}>
            Your credentials have been verified by the Sanad Accreditation Committee. Before you can publish lessons or host live streams, policy requires you to enable mandatory Two-Factor Authentication (2FA).
          </Text>
          <Button
            title="Complete 2FA Enrolment"
            onPress={() => router.push('/(auth)/2fa-setup')}
            style={styles.actionBtn}
          />
        </Card>
      )}

      {status === 'more_info' && (
        <Card style={styles.card}>
          <Text style={styles.warningTitle}>Information Required</Text>
          <Text style={styles.warningNote}>
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
            onPress={() => appealMutation.mutate(appealText)}
            loading={appealMutation.isPending}
            style={styles.actionBtn}
          />
        </Card>
      )}

      {status === 'rejected' && (
        <Card style={styles.card}>
          <Text style={styles.rejectedTitle}>Decision Details</Text>
          <Text style={styles.rejectedReason}>
            Reason: {application.reviewNote || 'Credentials could not be verified against institutional registries.'}
          </Text>
          <Text style={styles.rejectedBody}>
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
                onPress={() => appealMutation.mutate(appealText)}
                loading={appealMutation.isPending}
                style={styles.actionBtn}
              />
            </View>
          )}
        </Card>
      )}

      {/* Submitted Dossier Summary */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Submitted Dossier</Text>
        <Text style={styles.dossierItem}>
          <Text style={styles.dossierLabel}>Institution: </Text>
          {application.institution}
        </Text>
        <Text style={styles.dossierItem}>
          <Text style={styles.dossierLabel}>Specialties: </Text>
          {application.specialties.join(', ')}
        </Text>
        <Text style={styles.dossierItem}>
          <Text style={styles.dossierLabel}>Credentials Uploaded: </Text>
          {application.credentials.length} document(s)
        </Text>
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
  statusBanner: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusBannerText: {
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  card: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.light.primary,
    marginBottom: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.light.surfaceElevated,
    borderWidth: 2,
    borderColor: colors.light.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCompleted: {
    backgroundColor: colors.light.primary,
    borderColor: colors.light.primary,
  },
  stepNum: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  stepInfo: {
    flex: 1,
  },
  stepHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.light.text,
  },
  stepDetail: {
    fontSize: 12,
    color: colors.light.textSecondary,
    marginTop: 2,
  },
  stepDivider: {
    width: 2,
    height: 20,
    backgroundColor: colors.light.border,
    marginLeft: 13,
    marginVertical: 4,
  },
  approvedTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.light.success,
    marginBottom: 8,
  },
  approvedBody: {
    fontSize: 13,
    color: colors.light.text,
    lineHeight: 20,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.light.warning,
    marginBottom: 8,
  },
  warningNote: {
    fontSize: 13,
    color: colors.light.text,
    backgroundColor: colors.light.surfaceElevated,
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
  },
  rejectedTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.light.error,
    marginBottom: 8,
  },
  rejectedReason: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.light.error,
    backgroundColor: '#FDE8E8',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
  },
  rejectedBody: {
    fontSize: 13,
    color: colors.light.textSecondary,
    lineHeight: 18,
    marginBottom: 16,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  flexBtn: {
    flex: 1,
  },
  appealArea: {
    marginTop: 8,
    gap: 12,
  },
  actionBtn: {
    marginTop: 12,
  },
  dossierItem: {
    fontSize: 13,
    color: colors.light.text,
    marginBottom: 6,
  },
  dossierLabel: {
    fontWeight: '700',
    color: colors.light.primary,
  },
});
