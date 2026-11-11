import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Role, Permission, can } from '@sanad/shared';
import { useAuthStore } from '../store/authStore';
import { AppHeader } from './AppHeader';
import { Button } from './Button';
import { Icon } from './Icon';
import { colors } from '../theme/colors';

interface AccessGuardProps {
  children: React.ReactNode;
  requiredRole?: Role | Role[];
  requiredPermission?: Permission;
  title?: string;
  subtitle?: string;
  message?: string;
  fallbackRoute?: string;
}

export const AccessGuard: React.FC<AccessGuardProps> = ({
  children,
  requiredRole,
  requiredPermission,
  title = 'Access Restricted',
  subtitle = 'Security Authorization',
  message,
  fallbackRoute = '/(tabs)',
}) => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const roles = user?.roles || ['guest'];

  let authorized = true;

  if (requiredRole) {
    const needed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    authorized = needed.some((r) => roles.includes(r));
  }

  if (authorized && requiredPermission) {
    authorized = can(roles, requiredPermission);
  }

  if (authorized) {
    return <>{children}</>;
  }

  const isScholarRestricted =
    (Array.isArray(requiredRole) && requiredRole.includes('scholar') && !roles.includes('scholar')) ||
    requiredRole === 'scholar';

  const defaultMessage = isScholarRestricted
    ? 'Access to this area is reserved for verified scholars holding an accredited Sanad. If you hold traditional ijazaat or academic qualifications in Islamic sciences, please submit an application for platform verification.'
    : 'This console is strictly reserved for authorized platform administrators and sworn moderators. All unauthorized attempts are logged for security compliance.';

  return (
    <View style={styles.screen}>
      <AppHeader title={title} subtitle={subtitle} showBack />
      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Icon name={isScholarRestricted ? 'shield' : 'lock'} size={44} color={colors.light.primary} />
          </View>
          <Text style={styles.headline}>
            {isScholarRestricted ? 'Scholar Verification Required' : 'Authorization Required'}
          </Text>
          <Text style={styles.description}>{message || defaultMessage}</Text>

          <View style={styles.actionGroup}>
            {isScholarRestricted && (
              <Button
                title="Apply for Scholar Status"
                variant="primary"
                onPress={() => router.push('/scholar/apply')}
                style={styles.btn}
              />
            )}
            <Button
              title="Return to Safe Area"
              variant={isScholarRestricted ? 'outline' : 'primary'}
              onPress={() => router.replace(fallbackRoute as any)}
              style={styles.btn}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.light.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.light.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(15, 76, 69, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headline: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  actionGroup: {
    width: '100%',
    gap: 10,
  },
  btn: {
    width: '100%',
  },
});
