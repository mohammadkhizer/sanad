import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { colors } from '../theme/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'accent' | 'outline' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const isAccent = variant === 'accent';
  const isOutline = variant === 'outline';
  const isDanger = variant === 'danger';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        isAccent && styles.accentButton,
        isOutline && styles.outlineButton,
        isDanger && styles.dangerButton,
        disabled && styles.disabledButton,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isAccent ? colors.light.accentText : isOutline ? colors.light.primary : '#FFFFFF'}
        />
      ) : (
        <Text
          style={[
            styles.text,
            isAccent && styles.accentText,
            isOutline && styles.outlineText,
            disabled && styles.disabledText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.light.primary,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  accentButton: {
    backgroundColor: colors.light.accent,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.light.primary,
  },
  dangerButton: {
    backgroundColor: colors.light.error,
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
    borderColor: '#D1D5DB',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  accentText: {
    color: colors.light.accentText,
    fontWeight: '700',
  },
  outlineText: {
    color: colors.light.primary,
  },
  disabledText: {
    color: '#9CA3AF',
  },
});

