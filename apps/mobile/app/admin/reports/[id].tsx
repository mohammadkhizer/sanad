import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { colors } from '../../../src/theme/colors';
import { Card } from '../../../src/components/Card';
import { Button } from '../../../src/components/Button';
import { Input } from '../../../src/components/Input';
import { AppHeader } from '../../../src/components/AppHeader';
import { Icon } from '../../../src/components/Icon';
import { api } from '../../../src/api';
import { ReportEntity } from '@sanad/shared';

type ActionChoice = 'warn' | 'remove_content' | 'suspend' | 'revoke_scholar';

export default function ReportDetailActionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedAction, setSelectedAction] = useState<ActionChoice>('remove_content');
  const [reason, setReason] = useState('');
  const [durationDays, setDurationDays] = useState('7');

  const { data: report, isLoading } = useQuery<ReportEntity>({
    queryKey: ['adminReport', id],
    queryFn: () => api.moderation.getReport(id || 'rep_501'),
  });

  const actionMutation = useMutation({
    mutationFn: async () => {
      if (!reason || reason.trim().length < 5) {
        throw new Error('A detailed reason (min 5 characters) is required to take an administrative action.');
      }
      return api.moderation.takeAction(id || 'rep_501', {
        action: selectedAction,
        reason: reason.trim(),
        durationDays: selectedAction === 'suspend' ? parseInt(durationDays, 10) || 7 : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReports'] });
      Alert.alert(
        'Action Enforced',
        `Administrative action ${selectedAction.toUpperCase()} has been logged and executed.`,
        [{ text: 'Return to Queue', onPress: () => router.replace('/admin/reports') }]
      );
    },
    onError: (e: Error) => {
      Alert.alert('Action Error', e.message);
    },
  });

  if (isLoading || !report) {
    return (
      <View style={styles.screen}>
        <AppHeader title="Report Detail" showBack />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.light.primary} />
          <Text style={styles.loadingText}>Retrieving report details...</Text>
        </View>
      </View>
    );
  }

  const reporterName = typeof report.reporterId === 'object' ? report.reporterId.displayName : 'Sanad Member';
  const isP0 = report.priority === 'P0';

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Moderation Action"
        subtitle={`Incident ${id || 'rep_501'}`}
        showBack
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Incident Summary Card */}
        <Card style={styles.card}>
          <View style={styles.topRow}>
            <View style={[styles.priorityBadge, isP0 ? styles.p0Badge : styles.p1Badge]}>
              <Text style={styles.priorityText}>{report.priority} PRIORITY</Text>
            </View>
            <Text style={styles.statusText}>STATUS: {report.status.toUpperCase()}</Text>
          </View>

          <View style={styles.metaLine}>
            <Text style={styles.metaLabel}>Target Type: </Text>
            <Text style={styles.metaValue}>{report.targetType.toUpperCase()} ({report.targetId})</Text>
          </View>
          <View style={styles.metaLine}>
            <Text style={styles.metaLabel}>Reported By: </Text>
            <Text style={styles.metaValue}>{reporterName}</Text>
          </View>
          <View style={styles.metaLine}>
            <Text style={styles.metaLabel}>Timestamp: </Text>
            <Text style={styles.metaValue}>{new Date(report.createdAt).toLocaleString()}</Text>
          </View>
        </Card>

        {/* Reported Content & Reason */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Reported Content Summary</Text>
          <View style={styles.contentPreviewBox}>
            <Text style={styles.contentPreviewText}>
              {report.targetSummary || 'Violating commentary attacking traditional scholars.'}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Stated Policy Violation</Text>
          <Text style={styles.reasonText}>{report.reason}</Text>
        </Card>

        {/* Action Enforcement */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Administrative Action</Text>
          <Text style={styles.instruction}>
            Select enforcement protocol adhering to Sanad Trust and Safety governance:
          </Text>

          <View style={styles.actionsList}>
            {(
              [
                { id: 'warn', label: 'Issue Formal Policy Warning' },
                { id: 'remove_content', label: 'Remove Content Immediately' },
                { id: 'suspend', label: 'Suspend Account Access' },
                { id: 'revoke_scholar', label: 'Revoke Scholar Accreditation Badge' },
              ] as const
            ).map((item) => {
              const isSelected = selectedAction === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.actionOption, isSelected && styles.actionOptionActive]}
                  onPress={() => setSelectedAction(item.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.actionLabel, isSelected && styles.actionLabelActive]}>
                    {item.label}
                  </Text>
                  <View style={[styles.radio, isSelected && styles.radioActive]}>
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {selectedAction === 'suspend' && (
            <Input
              label="Suspension Duration (Days)"
              value={durationDays}
              onChangeText={setDurationDays}
              keyboardType="number-pad"
              placeholder="7"
            />
          )}

          <Input
            label="Administrative Reason (Mandatory Audit Entry) *"
            value={reason}
            onChangeText={setReason}
            placeholder="Cite specific policy clause and justification..."
            multiline
            numberOfLines={3}
          />

          <Button
            title="Confirm and Enforce Action"
            variant="accent"
            onPress={() => actionMutation.mutate()}
            loading={actionMutation.isPending}
            style={styles.confirmBtn}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  loadingText: {
    color: colors.light.textSecondary,
    fontSize: 14,
  },
  card: {
    padding: 16,
    borderRadius: 14,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  p0Badge: {
    backgroundColor: colors.light.error,
  },
  p1Badge: {
    backgroundColor: colors.light.accent,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.light.textSecondary,
  },
  metaLine: {
    flexDirection: 'row',
    gap: 4,
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
    fontSize: 14,
    fontWeight: '800',
    color: colors.light.primary,
  },
  contentPreviewBox: {
    backgroundColor: colors.light.background,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  contentPreviewText: {
    fontSize: 13,
    color: colors.light.text,
    lineHeight: 19,
    fontStyle: 'italic',
  },
  reasonText: {
    fontSize: 13,
    color: colors.light.text,
    lineHeight: 18,
  },
  instruction: {
    fontSize: 12,
    color: colors.light.textSecondary,
    lineHeight: 18,
  },
  actionsList: {
    gap: 8,
  },
  actionOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: colors.light.background,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  actionOptionActive: {
    borderColor: colors.light.primary,
    backgroundColor: 'rgba(15, 76, 69, 0.08)',
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.light.text,
    flex: 1,
    paddingRight: 8,
  },
  actionLabelActive: {
    color: colors.light.primary,
    fontWeight: '700',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.light.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: colors.light.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.light.primary,
  },
  confirmBtn: {
    marginTop: 6,
  },
});
