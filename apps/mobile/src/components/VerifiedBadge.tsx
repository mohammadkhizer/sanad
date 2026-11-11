import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon } from './Icon';
import { colors } from '../theme/colors';

interface VerifiedBadgeProps {
  size?: 'small' | 'medium';
  showLabel?: boolean;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  size = 'medium',
  showLabel = true,
}) => {
  const isSmall = size === 'small';
  const iconSize = isSmall ? 13 : 16;

  return (
    <View style={[styles.badge, isSmall && styles.badgeSmall]}>
      <Icon name="verified" size={iconSize} color={colors.light.accentText} />
      {showLabel && (
        <Text style={[styles.badgeText, isSmall && styles.badgeTextSmall]}>
          VERIFIED
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.light.accent,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    gap: 3,
  },
  badgeText: {
    color: colors.light.accentText,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  badgeTextSmall: {
    fontSize: 9,
    letterSpacing: 0.5,
  },
});
