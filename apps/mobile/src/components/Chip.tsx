import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export function Chip({ label, selected = false, onPress }: ChipProps) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.light.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.light.border,
    alignSelf: 'flex-start',
  },
  chipSelected: {
    backgroundColor: colors.light.primary,
    borderColor: colors.light.primaryDark,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.light.text,
  },
  textSelected: {
    color: '#FFFFFF',
  },
});
