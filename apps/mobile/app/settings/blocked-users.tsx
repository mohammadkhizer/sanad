import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../../src/theme/colors';
import { Avatar } from '../../src/components/Avatar';
import { AppHeader } from '../../src/components/AppHeader';
import { api } from '../../src/api';

interface BlockedItem {
  id: string;
  displayName: string;
  reason: string;
}

const mockBlocked: BlockedItem[] = [
  { id: 'usr_spammer_3', displayName: 'Unverified Promos', reason: 'Trolling and promotional spam' },
  { id: 'usr_fake_user', displayName: 'Anonymous Critic', reason: 'Sectarian hostility' },
];

export default function BlockedUsersScreen() {
  const [blockedList, setBlockedList] = useState<BlockedItem[]>(mockBlocked);

  const handleUnblock = (id: string, name: string) => {
    Alert.alert('Unblock User', `Do you want to restore access for ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Unblock',
        onPress: async () => {
          await api.users.unblockUser(id);
          setBlockedList((prev) => prev.filter((u) => u.id !== id));
          Alert.alert('Unblocked', `${name} has been unblocked.`);
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

        <FlatList
          data={blockedList}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.userInfo}>
                <Avatar name={item.displayName} size={42} />
                <View style={styles.nameDetails}>
                  <Text style={styles.name}>{item.displayName}</Text>
                  <Text style={styles.reasonText}>{item.reason}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.unblockBtn}
                onPress={() => handleUnblock(item.id, item.displayName)}
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
    fontSize: 11,
    color: colors.light.textMuted,
    marginTop: 2,
  },
  unblockBtn: {
    backgroundColor: colors.light.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  unblockBtnText: {
    fontSize: 12,
    fontWeight: '700',
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
