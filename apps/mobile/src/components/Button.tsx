import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  Animated,
  Platform,
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

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled || loading) return;
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: Platform.OS !== 'web',
      speed: 30,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    Animated.spring(scaleAnim, {
      toValue: 1.0,
      useNativeDriver: Platform.OS !== 'web',
      speed: 30,
      bounciness: 4,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
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
              isDanger && styles.dangerText,
              disabled && styles.disabledText,
              textStyle,
            ]}
          >
            {title}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
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
  dangerText: {
    color: '#FFFFFF',
  },
  disabledText: {
    color: '#9CA3AF',
  },
});

