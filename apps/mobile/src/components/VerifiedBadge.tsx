import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Path, Circle } from 'react-native-svg';

export interface VerifiedBadgeProps {
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  label?: string;
  theme?: 'gold' | 'emerald';
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  size = 'small',
  showLabel = false,
  label = 'ACCREDITED SCHOLAR',
  theme = 'gold',
}) => {
  const isGold = theme === 'gold';
  const primaryColor = isGold ? '#C9A227' : '#0F4C45';
  const checkColor = '#FFFFFF';
  const ringColor = isGold ? 'rgba(255, 255, 255, 0.45)' : 'rgba(255, 255, 255, 0.35)';

  const pixelSize = size === 'small' ? 16 : size === 'large' ? 24 : 19;

  const SealIcon = (
    <Svg width={pixelSize} height={pixelSize} viewBox="0 0 24 24" fill="none">
      {/* Outer Octagram (Square 1) */}
      <Rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="2.5"
        fill={primaryColor}
        transform="rotate(0 12 12)"
      />
      {/* Outer Octagram (Square 2 - 45 deg rotation) */}
      <Rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="2.5"
        fill={primaryColor}
        transform="rotate(45 12 12)"
      />
      {/* Inner Concentric Circle Accent for Depth */}
      <Circle cx="12" cy="12" r="7.5" stroke={ringColor} strokeWidth="1" />
      {/* Precision Checkmark */}
      <Path
        d="M8.2 12.2L10.7 14.7L15.8 9.3"
        stroke={checkColor}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );

  if (!showLabel) {
    return <View style={styles.inlineIconWrapper}>{SealIcon}</View>;
  }

  return (
    <View
      style={[
        styles.pillContainer,
        isGold ? styles.pillGold : styles.pillEmerald,
        size === 'small' && styles.pillSmall,
      ]}
    >
      {SealIcon}
      <Text
        style={[
          styles.pillText,
          isGold ? styles.pillTextGold : styles.pillTextEmerald,
          size === 'small' && styles.pillTextSmall,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  inlineIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  pillSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 4,
  },
  pillGold: {
    backgroundColor: '#FAF5EC',
    borderColor: 'rgba(201, 162, 39, 0.35)',
  },
  pillEmerald: {
    backgroundColor: '#E6F4EA',
    borderColor: 'rgba(15, 76, 69, 0.25)',
  },
  pillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  pillTextSmall: {
    fontSize: 9,
    letterSpacing: 0.6,
  },
  pillTextGold: {
    color: '#8A6805',
  },
  pillTextEmerald: {
    color: '#0D652D',
  },
});
