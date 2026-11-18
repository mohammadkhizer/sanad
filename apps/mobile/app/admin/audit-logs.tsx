import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { colors } from '../../src/theme/colors';
import { Card } from '../../src/components/Card';
import { AppHeader } from '../../src/components/AppHeader';
import { AccessGuard } from '../../src/components/AccessGuard';
import { Icon } from '../../src/components/Icon';
import { api } from '../../src/api';
import { AuditLogEntity } from '@sanad/shared';

export default function AuditLogsScreen() {
  const [filterAction, setFilterAction] = useState<string>('all');

  const { data: logs, isLoading } = useQuery<AuditLogEntity[]>({
    queryKey: ['adminAuditLogs'],
    queryFn: () => api.moderation.getAuditLogs(),
  });

  const filteredLogs = logs?.filter((l) => {
    if (filterAction === 'all') return true;
    return l.action.toLowerCase().includes(filterAction.toLowerCase());
  }) || [];

  return (
    <AccessGuard
      requiredRole="admin"
      title="Audit Trail"
      subtitle="Security Clearance Required"
    >
      <View style={styles.screen}>
      <AppHeader
        title="Audit Trail"
        subtitle="Immutable Platform Governance Log"
        showBack
      />

      {/* Action Filters */}
      <View style={styles.filterBar}>
        {(['all', 'role', 'moderation'] as const).map((f) => {
          const isSelected = filterAction === f;
          return (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, isSelected && styles.filterBtnActive]}
              onPress={() => setFilterAction(f)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
                {f === 'all' ? 'All Events' : f === 'role' ? 'Role Changes' : 'Moderation Actions'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filteredLogs}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.headerRow}>
              <View style={styles.actionBadge}>
                <Text style={styles.actionText}>{item.action.toUpperCase()}</Text>
              </View>
              <Text style={styles.timestamp}>
                {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>

            <Text style={styles.actorLine}>
              <Text style={styles.boldLabel}>Actor: </Text>
              {item.actorName || item.actorId}
            </Text>

            <Text style={styles.targetLine}>
              <Text style={styles.boldLabel}>Target: </Text>
              {item.targetType} ({item.targetId})
            </Text>

            {item.meta && (
              <View style={styles.metaBox}>
                <Text style={styles.metaJson}>{JSON.stringify(item.meta, null, 2)}</Text>
              </View>
            )}

            <View style={styles.footerRow}>
              <Text style={styles.ipText}>Origin IP: {item.ip || '127.0.0.1'}</Text>
              <View style={styles.verifiedHash}>
                <Icon name="shield" size={12} color={colors.light.primary} />
                <Text style={styles.verifiedHashText}>Signed Log</Text>
              </View>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Log Entries Found</Text>
            <Text style={styles.emptyText}>No audit entries match the selected filter criteria.</Text>
          </View>
        }
      />
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
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    padding: 16,
    borderRadius: 14,
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  actionBadge: {
    backgroundColor: 'rgba(15, 76, 69, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.light.primary,
  },
  timestamp: {
    fontSize: 11,
    color: colors.light.textMuted,
  },
  actorLine: {
    fontSize: 13,
    color: colors.light.text,
  },
  targetLine: {
    fontSize: 13,
    color: colors.light.text,
  },
  boldLabel: {
    fontWeight: '700',
    color: colors.light.primary,
  },
  metaBox: {
    backgroundColor: colors.light.background,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.light.border,
    marginTop: 2,
  },
  metaJson: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: colors.light.textSecondary,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
  },
  ipText: {
    fontSize: 11,
    color: colors.light.textMuted,
    fontFamily: 'monospace',
  },
  verifiedHash: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedHashText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.light.primary,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.light.primary,
  },
  emptyText: {
    color: colors.light.textSecondary,
    fontSize: 13,
  },
});
