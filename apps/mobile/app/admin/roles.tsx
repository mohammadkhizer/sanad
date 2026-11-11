import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { colors } from '../../src/theme/colors';
import { Card } from '../../src/components/Card';
import { Input } from '../../src/components/Input';
import { Avatar } from '../../src/components/Avatar';
import { VerifiedBadge } from '../../src/components/VerifiedBadge';
import { AppHeader } from '../../src/components/AppHeader';
import { Icon } from '../../src/components/Icon';
import { api } from '../../src/api';
import { UserEntity, Role } from '@sanad/shared';

export default function RoleManagementScreen() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: users, isLoading } = useQuery<UserEntity[]>({
    queryKey: ['adminUsers', searchQuery],
    queryFn: () => api.moderation.getUsers(searchQuery),
  });

  const toggleRoleMutation = useMutation({
    mutationFn: async ({ userId, newRoles }: { userId: string; newRoles: Role[] }) => {
      return api.moderation.updateUserRole(userId, newRoles);
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      Alert.alert('Role Updated', `Roles for ${updated.displayName} updated to: ${updated.roles.join(', ')}`);
    },
  });

  const revokeScholarMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      return api.moderation.revokeScholar(userId, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      Alert.alert('Scholar Status Revoked', 'Scholar badge revoked immediately. Invalidation logged in audit trail.');
    },
  });

  const handleRoleToggle = (user: UserEntity, roleToToggle: Role) => {
    let nextRoles: Role[] = [...user.roles];
    if (nextRoles.includes(roleToToggle)) {
      if (roleToToggle === 'scholar') {
        Alert.alert(
          'Revoke Scholar Accreditation',
          `Are you sure you want to revoke scholar accreditation from ${user.displayName}? This action is recorded in the immutable audit trail.`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Revoke',
              style: 'destructive',
              onPress: () => {
                revokeScholarMutation.mutate({
                  userId: user._id,
                  reason: 'Administrative revocation by staff.',
                });
              },
            },
          ]
        );
        return;
      }
      nextRoles = nextRoles.filter((r) => r !== roleToToggle);
    } else {
      nextRoles.push(roleToToggle);
    }
    toggleRoleMutation.mutate({ userId: user._id, newRoles: nextRoles });
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Access Control"
        subtitle="Staff and Role Governance (RBAC)"
        showBack
      />

      <View style={styles.searchBar}>
        <Icon name="search" size={18} color={colors.light.textMuted} />
        <Input
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by user name or email..."
          style={styles.searchInput}
        />
      </View>

      <FlatList
        data={users || []}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isScholar = item.roles.includes('scholar');
          return (
            <Card style={styles.card}>
              <View style={styles.userHeader}>
                <Avatar name={item.displayName} url={item.avatarUrl} size={48} />
                <View style={styles.userInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.userName}>{item.displayName}</Text>
                    {isScholar && <VerifiedBadge size="small" />}
                  </View>
                  <Text style={styles.userEmail}>{item.email || 'no-email'}</Text>
                </View>
              </View>

              <Text style={styles.rolesHeading}>Active Governance Roles</Text>
              <View style={styles.rolesGrid}>
                {(['member', 'scholar', 'moderator', 'admin'] as const).map((r) => {
                  const hasRole = item.roles.includes(r);
                  return (
                    <TouchableOpacity
                      key={r}
                      style={[styles.roleChip, hasRole && styles.roleChipActive]}
                      onPress={() => handleRoleToggle(item, r)}
                      activeOpacity={0.7}
                    >
                      {hasRole && <Icon name="check" size={12} color="#FFFFFF" />}
                      <Text style={[styles.roleChipText, hasRole && styles.roleChipTextActive]}>
                        {r.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Card>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Accounts Found</Text>
            <Text style={styles.emptyText}>No user accounts match the current query filter.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
    gap: 8,
  },
  searchInput: {
    flex: 1,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    padding: 16,
    borderRadius: 14,
    gap: 10,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.light.text,
  },
  userEmail: {
    fontSize: 12,
    color: colors.light.textSecondary,
    marginTop: 2,
  },
  rolesHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.light.primary,
    marginTop: 2,
  },
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: colors.light.background,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  roleChipActive: {
    backgroundColor: colors.light.primary,
    borderColor: colors.light.primaryDark,
  },
  roleChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.light.textSecondary,
  },
  roleChipTextActive: {
    color: '#FFFFFF',
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
