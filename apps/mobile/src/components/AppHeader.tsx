import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, IconName } from './Icon';
import { colors } from '../theme/colors';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightIcon?: IconName;
  onRightPress?: () => void;
  rightAction?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  titleAlign?: 'left' | 'center';
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightIcon,
  onRightPress,
  rightAction,
  style,
  titleAlign = 'center',
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top || 12 }, style]}>
      <View style={styles.contentRow}>
        {/* Left Slot: Back Button or Spacer */}
        <View style={styles.slot}>
          {showBack ? (
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Icon name="back" size={22} color={colors.light.primary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Center/Left Title Column */}
        <View style={[styles.titleCol, titleAlign === 'left' && styles.titleColLeft]}>
          <Text style={[styles.title, titleAlign === 'left' && styles.titleLeft]} numberOfLines={1}>
            {title}
          </Text>
          {Boolean(subtitle) && (
            <Text style={[styles.subtitle, titleAlign === 'left' && styles.titleLeft]} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>

        {/* Right Slot: Action Icon or Custom Node */}
        <View style={[styles.slot, styles.rightSlot]}>
          {rightAction ? (
            rightAction
          ) : rightIcon ? (
            <TouchableOpacity
              onPress={onRightPress}
              style={styles.actionButton}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Icon name={rightIcon} size={20} color={colors.light.primary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
    paddingBottom: 10,
    zIndex: 10,
  },
  contentRow: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  slot: {
    width: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  rightSlot: {
    alignItems: 'flex-end',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.light.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  actionButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.light.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  titleCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  titleColLeft: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.light.primary,
    letterSpacing: 0.3,
  },
  titleLeft: {
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 11,
    color: colors.light.textMuted,
    marginTop: 2,
    letterSpacing: 0.2,
  },
});
