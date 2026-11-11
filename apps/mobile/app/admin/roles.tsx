import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { colors } from '../../src/theme/colors';
import { Card } from '../../src/components/Card';
import { Input } from '../../src/components/Input';
import { Avatar } from '../../src/components/Avatar';
import { VerifiedBadge } from '../../src/components/VerifiedBadge';
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
        Alert.prompt
          ? Alert.prompt(
              'Revoke Scholar Accreditation',
              'Enter mandatory revocation reason for the audit trail:',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Revoke',
                  style: 'destructive',
                  onPress: (reason) => {
                    revokeScholarMutation.mutate({
                      userId: user._id,
                      reason: reason || 'Accreditation revoked by administrator.',
                    });
                  },
                },
              ]
            )
          : revokeScholarMutation.mutate({
              userId: user._id,
              reason: 'Administrative revocation.',
            });
        return;
      }
      nextRoles = nextRoles.filter((r) => r !== roleToToggle);
    } else {
      nextRoles.push(roleToToggle);
    }
    toggleRoleMutation.mutate({ userId: user._id, newRoles: nextRoles });
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Input
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by user name or email..."
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
                <Avatar name={item.displayName} url={item.avatarUrl} size={44} />
                <View style={styles.userInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.userName}>{item.displayName}</Text>
                    {isScholar && <VerifiedBadge size="small" />}
                  </View>
                  <Text style={styles.userEmail}>{item.email || 'no-email'}</Text>
                </View>
              </View>

              <Text style={styles.rolesHeading}>Active Governance Roles:</Text>
              <View style={styles.rolesGrid}>
                {(['member', 'scholar', 'moderator', 'admin'] as const).map((r) => {
                  const hasRole = item.roles.includes(r);
                  return (
                    <TouchableOpacity
                      key={r}
                      style={[styles.roleChip, hasRole && styles.roleChipActive]}
                      onPress={() => handleRoleToggle(item, r)}
                    >
                      <Text style={[styles.roleChipText, hasRole && styles.roleChipTextActive]}>
                        {hasRole ? `[x] ${r.toUpperCase()}` : `[ ] ${r.toUpperCase()}`}
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
            <Text style={styles.emptyText}>No accounts found matching query.</Text>
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
  searchContainer: {
    padding: 16,
    backgroundColor: colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    padding: 14,
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
    fontSize: 15,
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
  },
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: colors.light.surfaceElevated,
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
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.light.textSecondary,
    fontSize: 13,
  },
});
