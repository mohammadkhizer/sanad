import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { setMockUser } from '../api';
import { devSettings } from '../api/config';
import { colors } from '../theme/colors';
import { Role } from '@sanad/shared';

export function DevControlsBar() {
  const [isOpen, setIsOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);

  const activeRole = user?.roles?.[user.roles.length - 1] || 'guest';

  const handleSelectRole = async (role: 'guest' | 'member' | 'scholar' | 'moderator' | 'admin') => {
    setMockUser(role);
    if (role === 'guest') {
      await logout();
    } else {
      const mockUsersMap: Record<string, { id: string; name: string; roles: Role[]; email: string }> = {
        member: { id: 'usr_member_1', name: 'Zayd Al-Ansari', roles: ['member'], email: 'zayd@example.com' },
        scholar: { id: 'usr_scholar_1', name: 'Dr. Omar Farooq', roles: ['member', 'scholar'], email: 'omar@al-azhar.edu' },
        moderator: { id: 'usr_mod_1', name: 'Tariq Mansour', roles: ['member', 'moderator'], email: 'mod@sanad.internal' },
        admin: { id: 'usr_admin_1', name: 'Platform Admin', roles: ['member', 'scholar', 'moderator', 'admin'], email: 'admin@sanad.internal' },
      };
      const info = mockUsersMap[role];
      await login('mock_access_token', 'mock_refresh_token', {
        id: info.id,
        displayName: info.name,
        email: info.email,
        roles: info.roles,
        twoFactorEnabled: role === 'scholar' || role === 'moderator' || role === 'admin',
      });
    }
    setIsOpen(false);
  };

  const toggleEmptyData = () => {
    devSettings.emptyData = !devSettings.emptyData;
    setIsOpen(false);
  };

  const toggleForceError = () => {
    devSettings.forceError = !devSettings.forceError;
    setIsOpen(false);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.pill}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.8}
        accessibilityLabel="Developer Role Switcher and Controls"
      >
        <Text style={styles.pillText}>[DEV: {activeRole.toUpperCase()}]</Text>
      </TouchableOpacity>

      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => setIsOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsOpen(false)}>
          <View style={styles.sheetContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.title}>Developer Test Controls</Text>
            <Text style={styles.subtitle}>Switch role to preview role-gated UI and states:</Text>

            <View style={styles.rolesRow}>
              {(['guest', 'member', 'scholar', 'moderator', 'admin'] as const).map((r) => {
                const isSelected = activeRole === r;
                return (
                  <TouchableOpacity
                    key={r}
                    style={[styles.roleButton, isSelected && styles.roleButtonActive]}
                    onPress={() => handleSelectRole(r)}
                  >
                    <Text style={[styles.roleButtonText, isSelected && styles.roleButtonTextActive]}>
                      {r.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.divider} />

            <Text style={styles.subtitle}>Data and Error Simulation:</Text>
            <View style={styles.togglesRow}>
              <TouchableOpacity
                style={[styles.toggleButton, devSettings.emptyData && styles.toggleButtonActive]}
                onPress={toggleEmptyData}
              >
                <Text style={[styles.toggleText, devSettings.emptyData && styles.toggleTextActive]}>
                  {devSettings.emptyData ? '[x] Empty Data: ON' : '[ ] Empty Data: OFF'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toggleButton, devSettings.forceError && styles.toggleButtonActive]}
                onPress={toggleForceError}
              >
                <Text style={[styles.toggleText, devSettings.forceError && styles.toggleTextActive]}>
                  {devSettings.forceError ? '[x] Force Error: ON' : '[ ] Force Error: OFF'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setIsOpen(false)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: 'absolute',
    bottom: 74,
    right: 16,
    zIndex: 9999,
    backgroundColor: colors.light.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.light.accent,
  },
  pillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetContent: {
    backgroundColor: colors.light.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: colors.light.textSecondary,
    marginBottom: 12,
  },
  rolesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  roleButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: colors.light.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  roleButtonActive: {
    backgroundColor: colors.light.accent,
    borderColor: colors.light.accentDark,
  },
  roleButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.light.text,
  },
  roleButtonTextActive: {
    color: colors.light.accentText,
  },
  divider: {
    height: 1,
    backgroundColor: colors.light.border,
    marginVertical: 12,
  },
  togglesRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.light.surfaceElevated,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  toggleButtonActive: {
    backgroundColor: colors.light.error,
    borderColor: colors.light.error,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.light.text,
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  closeBtn: {
    backgroundColor: colors.light.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  closeBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});

