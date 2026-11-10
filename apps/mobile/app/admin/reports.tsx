import React from 'react';
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

export default function ReportsTriageScreen() {
  const queryClient = useQueryClient();

  const { data: reports, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['adminReports'],
    queryFn: async () => {
      const res = await apiFetch<any>('/admin/reports?status=pending');
      return res.data;
    },
  });

  const actionMutation = useMutation({
    mutationFn: async ({
      id,
      action,
      removeContent,
      suspendUser,
    }: {
      id: string;
      action: 'resolve' | 'dismiss';
      removeContent?: boolean;
      suspendUser?: boolean;
    }) => {
      return apiFetch(`/admin/reports/${id}/action`, {
        method: 'POST',
        body: JSON.stringify({ action, removeContent, suspendUser }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReports'] });
      Alert.alert('Report Processed', 'Moderation action executed and logged in audit trails.');
    },
    onError: (err: any) => {
      Alert.alert('Action Error', err.message || 'Operation failed.');
    },
  });

  const handleAction = (
    id: string,
    action: 'resolve' | 'dismiss',
    removeContent: boolean = false,
    suspendUser: boolean = false
  ) => {
    Alert.alert(
      'Confirm Moderation Action',
      `Execute ${action}${removeContent ? ' with content takedown' : ''}${
        suspendUser ? ' and account suspension' : ''
      }?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Proceed',
          style: suspendUser ? 'destructive' : 'default',
          onPress: () => actionMutation.mutate({ id, action, removeContent, suspendUser }),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Moderation & Safety Triage</Text>
        <Text style={styles.headerSub}>
          Protecting community harmony against sectarian conflict, hate speech, and unverified fatwas.
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.brand.emerald} />
        </View>
      ) : (
        <FlatList
          data={reports || []}
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
                <Text style={styles.reasonBadge}>{item.reason?.toUpperCase()}</Text>
                <Text style={styles.targetType}>Target: {item.targetType}</Text>
              </View>

              <Text style={styles.reporter}>
                Reported by: {item.reporterId?.displayName || 'Community Member'}
              </Text>

              {item.details ? (
                <Text style={styles.detailsBox}>Context: {item.details}</Text>
              ) : null}

              <View style={styles.actionRow}>
                <Button
                  title="Dismiss"
                  variant="outline"
                  size="sm"
                  onPress={() => handleAction(item.id || item._id, 'dismiss')}
                  style={{ flex: 1, marginRight: 6 }}
                />
                <Button
                  title="Takedown Content"
                  variant="danger"
                  size="sm"
                  onPress={() => handleAction(item.id || item._id, 'resolve', true, false)}
                  style={{ flex: 1.2, marginRight: 6 }}
                />
                <Button
                  title="Suspend User"
                  variant="danger"
                  size="sm"
                  onPress={() => handleAction(item.id || item._id, 'resolve', true, true)}
                  style={{ flex: 1.2 }}
                />
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>Reports Queue Clear</Text>
              <Text style={styles.emptySub}>
                Zero outstanding community safety flags.
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
  header: {
    backgroundColor: theme.colors.brand.emeraldDark,
    padding: theme.spacing.base,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: theme.typography.fontSize.base,
  },
  headerSub: {
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
    marginBottom: 6,
  },
  reasonBadge: {
    backgroundColor: '#FDF2F2',
    color: theme.colors.semantic.error,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 'bold',
  },
  targetType: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondaryLight,
    fontWeight: '600',
  },
  reporter: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondaryLight,
    marginTop: 2,
  },
  detailsBox: {
    backgroundColor: '#F8F5EE',
    padding: theme.spacing.sm,
    borderRadius: 6,
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.primaryLight,
    marginTop: 8,
    fontStyle: 'italic',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: theme.spacing.md,
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

