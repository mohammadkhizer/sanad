import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { colors } from '../../src/theme/colors';
import { Avatar } from '../../src/components/Avatar';
import { AppHeader } from '../../src/components/AppHeader';
import { api } from '../../src/api';
import { UserEntity } from '@sanad/shared';

export default function BlockedUsersScreen() {
  const queryClient = useQueryClient();

  const { data: blockedList = [], isLoading } = useQuery<UserEntity[]>({
    queryKey: ['blockedUsers'],
    queryFn: () => api.users.getBlockedUsers(),
  });

  const unblockMutation = useMutation({
    mutationFn: (userId: string) => api.users.unblockUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockedUsers'] });
    },
  });

  const handleUnblock = (id: string, name: string) => {
    Alert.alert('Unblock User', `Do you want to restore access for ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Unblock',
        onPress: async () => {
          try {
            await unblockMutation.mutateAsync(id);
            Alert.alert('Unblocked', `${name} has been unblocked.`);
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to unblock';
            Alert.alert('Error', msg);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Blocked Accounts"
        subtitle="Safety and Privacy Controls"
        showBack
      />

      <View style={styles.content}>
        <Text style={styles.headerNotice}>
          Blocked accounts cannot view your profile, send consultation inquiries, or comment on your lessons.
        </Text>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.light.primary} />
          </View>
        ) : (
          <FlatList
            data={blockedList}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <View style={styles.userInfo}>
                  <Avatar name={item.displayName} size={42} />
                  <View style={styles.nameDetails}>
                    <Text style={styles.name}>{item.displayName}</Text>
                    <Text style={styles.reasonText}>{item.email || (item.phone ?? 'Restricted Account')}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.unblockBtn}
                  onPress={() => handleUnblock(item._id, item.displayName)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.unblockBtnText}>Unblock</Text>
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No Blocked Accounts</Text>
                <Text style={styles.emptyText}>You have not restricted any Sanad members.</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerNotice: {
    fontSize: 13,
    color: colors.light.textSecondary,
    lineHeight: 18,
    marginBottom: 16,
  },
  list: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.light.surface,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  nameDetails: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.light.text,
  },
  reasonText: {
    fontSize: 12,
    color: colors.light.textMuted,
    marginTop: 2,
  },
  unblockBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.light.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  unblockBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.light.text,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 13,
    color: colors.light.textMuted,
    textAlign: 'center',
  },
});
