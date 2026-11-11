import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { colors } from '../../src/theme/colors';
import { Card } from '../../src/components/Card';
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
    <View style={styles.container}>
      {/* Action Filters */}
      <View style={styles.filterBar}>
        {(['all', 'role', 'moderation'] as const).map((f) => {
          const isSelected = filterAction === f;
          return (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, isSelected && styles.filterBtnActive]}
              onPress={() => setFilterAction(f)}
            >
              <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
                {f.toUpperCase()}
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
                <Text style={styles.actionText}>[{item.action.toUpperCase()}]</Text>
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

            <Text style={styles.ipText}>IP: {item.ip || '127.0.0.1'}</Text>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No audit entries match filter.</Text>
          </View>
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
  filterBar: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.light.surfaceElevated,
  },
  filterBtnActive: {
    backgroundColor: colors.light.primary,
  },
  filterText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.light.text,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    padding: 14,
    gap: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  actionBadge: {
    backgroundColor: colors.light.surfaceElevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.light.primary,
  },
  timestamp: {
    fontSize: 11,
    color: colors.light.textSecondary,
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
    backgroundColor: colors.light.surfaceElevated,
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  metaJson: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: colors.light.textSecondary,
  },
  ipText: {
    fontSize: 10,
    color: colors.light.textMuted,
    marginTop: 2,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.light.textSecondary,
    fontSize: 13,
  },
});
