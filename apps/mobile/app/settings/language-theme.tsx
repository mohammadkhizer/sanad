import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../../src/theme/colors';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { AppHeader } from '../../src/components/AppHeader';
import { Icon } from '../../src/components/Icon';

type Language = 'en' | 'ar' | 'ur';
type ThemeMode = 'light' | 'dark' | 'system';

interface LangOption {
  code: Language;
  name: string;
  native: string;
  isRtl: boolean;
}

const languages: LangOption[] = [
  { code: 'en', name: 'English', native: 'English', isRtl: false },
  { code: 'ar', name: 'Arabic', native: 'العربية', isRtl: true },
  { code: 'ur', name: 'Urdu', native: 'اردو', isRtl: true },
];

export default function LanguageThemeSettingsScreen() {
  const [selectedLang, setSelectedLang] = useState<Language>('en');
  const [selectedTheme, setSelectedTheme] = useState<ThemeMode>('light');

  const handleApply = () => {
    const lang = languages.find((l) => l.code === selectedLang);
    Alert.alert(
      'Settings Updated',
      `Language set to ${lang?.name} (${lang?.isRtl ? 'RTL Layout' : 'LTR Layout'}) and theme set to ${selectedTheme.toUpperCase()}.`
    );
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Language and Theme"
        subtitle="Typography and Visual Appearance"
        showBack
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Application Language</Text>
          <Text style={styles.sectionDesc}>
            Sanad provides native bidirectional layout (LTR and RTL) engineered for classical Arabic and Islamic typography:
          </Text>

          <View style={styles.optionsList}>
            {languages.map((lang) => {
              const isSelected = selectedLang === lang.code;
              return (
                <TouchableOpacity
                  key={lang.code}
                  style={[styles.optionItem, isSelected && styles.optionItemActive]}
                  onPress={() => setSelectedLang(lang.code)}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionTextContainer}>
                    <Text style={[styles.optionTitle, isSelected && styles.optionTitleActive]}>
                      {lang.name} ({lang.native})
                    </Text>
                    <Text style={styles.optionSub}>
                      {lang.isRtl ? 'Right-to-Left (RTL) Layout' : 'Left-to-Right (LTR) Layout'}
                    </Text>
                  </View>
                  <View style={[styles.radio, isSelected && styles.radioActive]}>
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Color Palette</Text>
          <Text style={styles.sectionDesc}>
            Classical 60:30:10 palette (Warm Ivory, Deep Emerald, Antique Gold):
          </Text>

          <View style={styles.optionsList}>
            {(['light', 'dark', 'system'] as const).map((theme) => {
              const isSelected = selectedTheme === theme;
              return (
                <TouchableOpacity
                  key={theme}
                  style={[styles.optionItem, isSelected && styles.optionItemActive]}
                  onPress={() => setSelectedTheme(theme)}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionTextContainer}>
                    <Text style={[styles.optionTitle, isSelected && styles.optionTitleActive]}>
                      {theme === 'light' ? 'Warm Ivory (Light)' : theme === 'dark' ? 'Night Green (Dark)' : 'System Default'}
                    </Text>
                    <Text style={styles.optionSub}>
                      {theme === 'light' ? '60% Warm Ivory, 30% Deep Emerald, 10% Antique Gold' : 'Optimized for nighttime reading'}
                    </Text>
                  </View>
                  <View style={[styles.radio, isSelected && styles.radioActive]}>
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        <Button
          title="Apply Display Preferences"
          variant="primary"
          onPress={handleApply}
          style={styles.saveBtn}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    padding: 18,
    borderRadius: 14,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.light.primary,
  },
  sectionDesc: {
    fontSize: 13,
    color: colors.light.textSecondary,
    lineHeight: 18,
  },
  optionsList: {
    gap: 8,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: colors.light.background,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  optionItemActive: {
    borderColor: colors.light.primary,
    backgroundColor: 'rgba(15, 76, 69, 0.08)',
  },
  optionTextContainer: {
    flex: 1,
    paddingRight: 8,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.light.text,
  },
  optionTitleActive: {
    color: colors.light.primary,
  },
  optionSub: {
    fontSize: 11,
    color: colors.light.textSecondary,
    marginTop: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.light.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: colors.light.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.light.primary,
  },
  saveBtn: {
    marginTop: 4,
  },
});
