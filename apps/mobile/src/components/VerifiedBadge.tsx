import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface VerifiedBadgeProps {
  size?: 'small' | 'medium';
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ size = 'medium' }) => {
  const isSmall = size === 'small';

  return (
    <View style={[styles.badge, isSmall && styles.badgeSmall]}>
      <Text style={[styles.badgeText, isSmall && styles.badgeTextSmall]}>
        [VERIFIED]
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.light.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  badgeText: {
    color: colors.light.accentText,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  badgeTextSmall: {
    fontSize: 9,
  },
});

