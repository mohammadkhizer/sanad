import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/colors';

interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  size = 'md',
  showLabel = false,
}) => {
  const getDimensions = () => {
    switch (size) {
      case 'sm':
        return { boxSize: 14, fontSize: 9, checkmarkSize: 8 };
      case 'lg':
        return { boxSize: 24, fontSize: 13, checkmarkSize: 14 };
      case 'md':
      default:
        return { boxSize: 18, fontSize: 11, checkmarkSize: 10 };
    }
  };

  const dim = getDimensions();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.badge,
          {
            width: dim.boxSize,
            height: dim.boxSize,
            borderRadius: dim.boxSize / 2,
          },
        ]}
        accessibilityRole="image"
        accessibilityLabel="Verified Religious Scholar"
      >
        <Text style={[styles.checkmark, { fontSize: dim.checkmarkSize }]}>✓</Text>
      </View>
      {showLabel && (
        <Text style={[styles.label, { fontSize: dim.fontSize }]}>Verified Scholar</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: theme.colors.accent.gold,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.accent.goldDark,
  },
  checkmark: {
    color: theme.colors.text.onGold,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  label: {
    marginLeft: 4,
    color: theme.colors.accent.goldDark,
    fontWeight: '600',
  },
});

