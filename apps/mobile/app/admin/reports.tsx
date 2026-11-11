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
import { ReportEntity } from '@sanad/shared';

export default function AdminReportsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'P0' | 'P1' | 'P2'>('all');

  const { data: reports, isLoading } = useQuery<ReportEntity[]>({
    queryKey: ['adminReports', priorityFilter],
    queryFn: () => api.moderation.getReports({ priority: priorityFilter }),
  });

  const list = reports || [];

  return (
    <View style={styles.container}>
      {/* Priority Filter Bar */}
      <View style={styles.filterBar}>
        {(['all', 'P0', 'P1', 'P2'] as const).map((p) => {
          const isSelected = priorityFilter === p;
          return (
            <TouchableOpacity
              key={p}
              style={[styles.filterBtn, isSelected && styles.filterBtnActive]}
              onPress={() => setPriorityFilter(p)}
            >
              <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
                {p === 'all' ? 'All Priority' : `[${p} PRIORITY]`}
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
            const isP0 = item.priority === 'P0';

            return (
              <Card style={styles.reportCard}>
                <TouchableOpacity
                  onPress={() => router.push(`/admin/reports/${item._id}`)}
                >
                  <View style={styles.headerRow}>
                    <View style={[styles.priorityBadge, isP0 ? styles.p0Badge : styles.p1Badge]}>
                      <Text style={styles.priorityText}>[{item.priority}]</Text>
                    </View>
                    <Text style={styles.targetTypeBadge}>[{item.targetType.toUpperCase()}]</Text>
                    <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                  </View>

                  <Text style={styles.reasonText}>{item.reason}</Text>
                  <Text style={styles.summaryText} numberOfLines={2}>
                    {item.targetSummary || `Target: ${item.targetId}`}
                  </Text>

                  <View style={styles.footerRow}>
                    <Text style={styles.dateText}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                    <Text style={styles.actionPromptText}>{'Review & Enforce >'}</Text>
                  </View>
                </TouchableOpacity>
              </Card>
            );
          }}
          ListEmptyComponent={
            <EmptyState
              title="Reports Queue Clear"
              description="No open reports matching selected priority criteria."
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
  reportCard: {
    padding: 14,
    gap: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  p0Badge: {
    backgroundColor: colors.light.error,
  },
  p1Badge: {
    backgroundColor: colors.light.warning,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  targetTypeBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.light.primary,
  },
  statusText: {
    marginLeft: 'auto',
    fontSize: 10,
    fontWeight: '700',
    color: colors.light.textMuted,
  },
  reasonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.light.text,
  },
  summaryText: {
    fontSize: 12,
    color: colors.light.textSecondary,
    lineHeight: 17,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
    paddingTop: 8,
    marginTop: 4,
  },
  dateText: {
    fontSize: 11,
    color: colors.light.textMuted,
  },
  actionPromptText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.light.primary,
  },
});
