import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { api } from '../../src/api';
import { colors } from '../../src/theme/colors';
import { Card } from '../../src/components/Card';
import { AppHeader } from '../../src/components/AppHeader';
import { AccessGuard } from '../../src/components/AccessGuard';
import { Icon } from '../../src/components/Icon';
import { EmptyState } from '../../src/components/EmptyState';
import { ReportEntity } from '@sanad/shared';

export default function AdminReportsScreen() {
  const router = useRouter();
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'P0' | 'P1' | 'P2'>('all');

  const { data: reports, isLoading } = useQuery<ReportEntity[]>({
    queryKey: ['adminReports', priorityFilter],
    queryFn: () => api.moderation.getReports({ priority: priorityFilter }),
  });

  const list = reports || [];

  return (
    <AccessGuard
      requiredRole={['admin', 'moderator']}
      title="Trust and Safety"
      subtitle="Moderation Clearance Required"
    >
      <View style={styles.screen}>
      <AppHeader
        title="Trust and Safety"
        subtitle="Reported Content and Conduct"
        showBack
      />

      {/* Priority Filter Bar */}
      <View style={styles.filterBar}>
        {(['all', 'P0', 'P1', 'P2'] as const).map((p) => {
          const isSelected = priorityFilter === p;
          return (
            <TouchableOpacity
              key={p}
              style={[styles.filterBtn, isSelected && styles.filterBtnActive]}
              onPress={() => setPriorityFilter(p)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
                {p === 'all' ? 'All Reports' : `${p} Priority`}
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
                  activeOpacity={0.7}
                >
                  <View style={styles.headerRow}>
                    <View style={[styles.priorityBadge, isP0 ? styles.p0Badge : styles.p1Badge]}>
                      <Text style={styles.priorityText}>{item.priority}</Text>
                    </View>
                    <View style={styles.typeBadge}>
                      <Text style={styles.targetTypeBadge}>{item.targetType.toUpperCase()}</Text>
                    </View>
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
                    <View style={styles.reviewAction}>
                      <Text style={styles.actionPromptText}>Review and Enforce</Text>
                      <Icon name="chevron-right" size={14} color={colors.light.primary} />
                    </View>
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
    </AccessGuard>
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
    gap: 12,
  },
  reportCard: {
    padding: 16,
    borderRadius: 14,
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
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
  typeBadge: {
    backgroundColor: 'rgba(15, 76, 69, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  targetTypeBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.light.primary,
  },
  statusText: {
    marginLeft: 'auto',
    fontSize: 11,
    fontWeight: '700',
    color: colors.light.textMuted,
  },
  reasonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.light.text,
  },
  summaryText: {
    fontSize: 12,
    color: colors.light.textSecondary,
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
    paddingTop: 10,
    marginTop: 4,
  },
  dateText: {
    fontSize: 11,
    color: colors.light.textMuted,
  },
  reviewAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionPromptText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.light.primary,
  },
});
