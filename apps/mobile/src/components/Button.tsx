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
import { theme } from '../theme/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'accent' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  pill?: boolean;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  pill = false,
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return '#D0D7DE';
    switch (variant) {
      case 'primary':
        return theme.colors.brand.emerald;
      case 'accent':
        return theme.colors.accent.gold;
      case 'outline':
        return 'transparent';
      case 'danger':
        return theme.colors.semantic.error;
    }
  };

  const getTextColor = () => {
    if (disabled) return '#8C959F';
    switch (variant) {
      case 'primary':
      case 'danger':
        return theme.colors.text.onEmerald;
      case 'accent':
        return theme.colors.text.onGold;
      case 'outline':
        return theme.colors.brand.emerald;
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: 8, paddingHorizontal: 12, minHeight: 36 };
      case 'lg':
        return { paddingVertical: 14, paddingHorizontal: 24, minHeight: 52 };
      case 'md':
      default:
        return { paddingVertical: 11, paddingHorizontal: 16, minHeight: 44 }; // 44pt accessible min tap
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      accessibilityRole="button"
      style={[
        styles.base,
        getPadding(),
        {
          backgroundColor: getBackgroundColor(),
          borderRadius: pill ? theme.radius.pill : theme.radius.input,
          borderColor:
            variant === 'outline'
              ? disabled
                ? '#D0D7DE'
                : theme.colors.brand.emerald
              : 'transparent',
          borderWidth: variant === 'outline' ? 1.5 : 0,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={getTextColor()}
          size={size === 'sm' ? 'small' : 'small'}
        />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: getTextColor(),
              fontSize: size === 'sm' ? 13 : size === 'lg' ? 17 : 15,
            },
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
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
});
