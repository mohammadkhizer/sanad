import React from 'react';
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
import { apiClient } from '../../src/api/client';
import { colors } from '../../src/theme/colors';
import { Card } from '../../src/components/Card';
import { EmptyState } from '../../src/components/EmptyState';

export default function AdminReportsScreen() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ reports: any[] }>({
    queryKey: ['adminReports'],
    queryFn: () => apiClient<{ reports: any[] }>('/admin/reports?status=pending'),
  });

  const actionMutation = useMutation({
    mutationFn: ({
      reportId,
      action,
      reason,
    }: {
      reportId: string;
      action: string;
      reason: string;
    }) =>
      apiClient(`/admin/reports/${reportId}/action`, {
        method: 'POST',
        body: JSON.stringify({ action, reason }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReports'] });
      Alert.alert('Action Taken', 'The report has been resolved and logged.');
    },
    onError: (err: any) => {
      Alert.alert('Error', err.message || 'Failed to take action');
    },
  });

  const handleTakeAction = (reportId: string, action: string) => {
    actionMutation.mutate({
      reportId,
      action,
      reason: `Moderator action ${action} executed per platform policy.`,
    });
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.light.primary} />
      </View>
    );
  }

  const reports = data?.reports || [];

  return (
    <View style={styles.container}>
      <FlatList
        data={reports}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.reportCard}>
            <View style={styles.headerRow}>
              <Text style={styles.targetBadge}>
                [{item.targetType.toUpperCase()}]
              </Text>
              <Text style={styles.statusBadge}>{item.status}</Text>
            </View>

            <Text style={styles.reasonText}>Reason: {item.reason}</Text>
            <Text style={styles.targetIdText}>Target ID: {item.targetId}</Text>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.btn, styles.removeBtn]}
                onPress={() => handleTakeAction(item._id, 'remove_content')}
              >
                <Text style={styles.btnText}>Remove Content</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.suspendBtn]}
                onPress={() => handleTakeAction(item._id, 'suspend')}
              >
                <Text style={styles.btnText}>Suspend User</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <EmptyState
            title="All Reports Cleared"
            subtitle="No pending user reports requiring moderator intervention."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  reportCard: {
    padding: 16,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  targetBadge: {
    color: colors.light.primary,
    fontWeight: '800',
    fontSize: 12,
  },
  statusBadge: {
    color: colors.light.warning,
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  reasonText: {
    fontSize: 14,
    color: colors.light.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  targetIdText: {
    fontSize: 12,
    color: colors.light.textSecondary,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtn: {
    backgroundColor: colors.light.warning,
  },
  suspendBtn: {
    backgroundColor: colors.light.error,
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
});

