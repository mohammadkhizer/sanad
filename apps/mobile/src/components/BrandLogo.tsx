import React from 'react';
import { View, Text, Image, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

export interface BrandLogoProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'vertical' | 'horizontal' | 'icon-only';
  showSubtitle?: boolean;
  showArabic?: boolean;
  style?: StyleProp<ViewStyle>;
  textColor?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'medium',
  variant = 'vertical',
  showSubtitle = true,
  showArabic = true,
  style,
  textColor,
}) => {
  const iconDimensions = {
    small: { width: 32, height: 32, radius: 8 },
    medium: { width: 56, height: 56, radius: 14 },
    large: { width: 84, height: 84, radius: 20 },
  }[size];

  const titleSizes = {
    small: 18,
    medium: 26,
    large: 34,
  }[size];

  const brandImage = require('../../assets/splash-mark.png');

  if (variant === 'icon-only') {
    return (
      <View style={[styles.iconWrapper, { width: iconDimensions.width, height: iconDimensions.height, borderRadius: iconDimensions.radius }, style]}>
        <Image
          source={brandImage}
          style={{ width: iconDimensions.width, height: iconDimensions.height, borderRadius: iconDimensions.radius }}
          resizeMode="contain"
          accessibilityLabel="Sanad Logo"
        />
      </View>
    );
  }

  if (variant === 'horizontal') {
    return (
      <View style={[styles.horizontalContainer, style]}>
        <Image
          source={brandImage}
          style={{ width: iconDimensions.width, height: iconDimensions.height, borderRadius: iconDimensions.radius }}
          resizeMode="contain"
          accessibilityLabel="Sanad Logo"
        />
        <View style={styles.horizontalTextCol}>
          <Text style={[styles.brandTitle, { fontSize: titleSizes, color: textColor || colors.light.primary }]}>
            SANAD
          </Text>
          {showArabic && (
            <Text style={[styles.arabicInline, { color: textColor || colors.light.accent }]}>
              سند · المعرفة الموثوقة
            </Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.verticalContainer, style]}>
      <View style={[styles.iconWrapper, { width: iconDimensions.width, height: iconDimensions.height, borderRadius: iconDimensions.radius }]}>
        <Image
          source={brandImage}
          style={{ width: iconDimensions.width, height: iconDimensions.height, borderRadius: iconDimensions.radius }}
          resizeMode="contain"
          accessibilityLabel="Sanad Brand Emblem"
        />
      </View>
      <Text style={[styles.brandTitle, { fontSize: titleSizes, color: textColor || colors.light.primary }]}>
        SANAD
      </Text>
      {showArabic && (
        <Text style={[styles.arabicSubtitle, { color: colors.light.accent }]}>
          سند · المعرفة الموثوقة
        </Text>
      )}
      {showSubtitle && (
        <Text style={[styles.englishSubtitle, { color: textColor ? 'rgba(255,255,255,0.8)' : colors.light.textMuted }]}>
          Knowledge, with an unbroken chain of trust
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  verticalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  horizontalTextCol: {
    justifyContent: 'center',
  },
  iconWrapper: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    backgroundColor: '#0F4C45',
    borderWidth: 1.5,
    borderColor: '#C9A227',
  },
  brandTitle: {
    fontWeight: '800',
    letterSpacing: 2,
  },
  arabicInline: {
    fontSize: 12,
    fontWeight: '600',
  },
  arabicSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  englishSubtitle: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});

