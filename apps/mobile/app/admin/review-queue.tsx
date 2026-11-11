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

export default function ReviewQueueScreen() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ applications: any[] }>({
    queryKey: ['adminApplications'],
    queryFn: () => apiClient<{ applications: any[] }>('/admin/applications?status=pending'),
  });

  const decisionMutation = useMutation({
    mutationFn: ({ id, decision, reviewNote }: { id: string; decision: string; reviewNote?: string }) =>
      apiClient(`/admin/applications/${id}/decision`, {
        method: 'POST',
        body: JSON.stringify({ decision, reviewNote }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminApplications'] });
      Alert.alert('Decision Recorded', 'The scholar application has been updated.');
    },
    onError: (err: any) => {
      Alert.alert('Error', err.message || 'Failed to process decision');
    },
  });

  const handleApprove = (id: string) => {
    decisionMutation.mutate({ id, decision: 'approved', reviewNote: 'Credentials verified.' });
  };

  const handleReject = (id: string) => {
    Alert.prompt
      ? Alert.prompt(
          'Rejection Reason',
          'Please provide the specific reason for rejecting this application:',
          (reason) => {
            if (!reason) return;
            decisionMutation.mutate({ id, decision: 'rejected', reviewNote: reason });
          }
        )
      : decisionMutation.mutate({
          id,
          decision: 'rejected',
          reviewNote: 'Credentials did not satisfy traditional verification threshold.',
        });
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.light.primary} />
      </View>
    );
  }

  const applications = data?.applications || [];

  return (
    <View style={styles.container}>
      <FlatList
        data={applications}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.appCard}>
            <Text style={styles.applicantName}>
              {item.userId?.displayName || 'Applicant'}
            </Text>
            <Text style={styles.institution}>
              Institution: {item.institution}
            </Text>
            <Text style={styles.specialties}>
              Specialties: {item.specialties?.join(', ')}
            </Text>
            <Text style={styles.statementText}>{item.statement}</Text>

            <View style={styles.credentialsBox}>
              <Text style={styles.credTitle}>Attached Credentials:</Text>
              {item.credentials?.map((c: any, idx: number) => (
                <Text key={idx} style={styles.credItem}>
                  - {c.type.toUpperCase()}: {c.institution} ({c.year})
                </Text>
              ))}
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.btn, styles.approveBtn]}
                onPress={() => handleApprove(item._id)}
              >
                <Text style={styles.btnText}>Approve as Scholar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.rejectBtn]}
                onPress={() => handleReject(item._id)}
              >
                <Text style={styles.btnText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <EmptyState
            title="Review Queue Clear"
            subtitle="No pending scholar applications awaiting verification."
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
  appCard: {
    padding: 16,
    marginBottom: 14,
  },
  applicantName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.light.text,
  },
  institution: {
    fontSize: 14,
    color: colors.light.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  specialties: {
    fontSize: 13,
    color: colors.light.textSecondary,
    marginTop: 2,
  },
  statementText: {
    fontSize: 14,
    color: colors.light.text,
    backgroundColor: colors.light.surfaceElevated,
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
  },
  credentialsBox: {
    marginBottom: 14,
  },
  credTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.light.textMuted,
    marginBottom: 4,
  },
  credItem: {
    fontSize: 13,
    color: colors.light.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  btn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  approveBtn: {
    backgroundColor: colors.light.primary,
  },
  rejectBtn: {
    backgroundColor: colors.light.error,
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});

