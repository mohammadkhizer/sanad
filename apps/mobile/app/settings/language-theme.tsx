import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../../src/theme/colors';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';

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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Application Language</Text>
        <Text style={styles.sectionDesc}>
          Sanad supports bidirectional (LTR / RTL) layout designed for authentic classical typography:
        </Text>

        <View style={styles.optionsList}>
          {languages.map((lang) => {
            const isSelected = selectedLang === lang.code;
            return (
              <TouchableOpacity
                key={lang.code}
                style={[styles.optionItem, isSelected && styles.optionItemActive]}
                onPress={() => setSelectedLang(lang.code)}
              >
                <View>
                  <Text style={[styles.optionTitle, isSelected && styles.optionTitleActive]}>
                    {lang.name} ({lang.native})
                  </Text>
                  <Text style={styles.optionSub}>
                    {lang.isRtl ? 'Right-to-Left (RTL) Layout' : 'Left-to-Right (LTR) Layout'}
                  </Text>
                </View>
                <View style={[styles.radio, isSelected && styles.radioActive]} />
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Color Theme</Text>
        <Text style={styles.sectionDesc}>
          Rooted in our 60:30:10 palette (Warm Ivory & Deep Emerald):
        </Text>

        <View style={styles.optionsList}>
          {(['light', 'dark', 'system'] as const).map((theme) => {
            const isSelected = selectedTheme === theme;
            return (
              <TouchableOpacity
                key={theme}
                style={[styles.optionItem, isSelected && styles.optionItemActive]}
                onPress={() => setSelectedTheme(theme)}
              >
                <View>
                  <Text style={[styles.optionTitle, isSelected && styles.optionTitleActive]}>
                    {theme === 'light' ? 'Warm Ivory (Light)' : theme === 'dark' ? 'Night Green (Dark)' : 'System Default'}
                  </Text>
                  <Text style={styles.optionSub}>
                    {theme === 'light' ? '60% Warm Ivory, 30% Deep Emerald, 10% Antique Gold' : 'Optimized for nighttime reading'}
                  </Text>
                </View>
                <View style={[styles.radio, isSelected && styles.radioActive]} />
              </TouchableOpacity>
            );
          })}
        </View>
      </Card>

      <Button title="Apply Preferences" onPress={handleApply} style={styles.applyBtn} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  card: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.light.primary,
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 13,
    color: colors.light.textSecondary,
    marginBottom: 14,
    lineHeight: 18,
  },
  optionsList: {
    gap: 10,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.light.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  optionItemActive: {
    borderColor: colors.light.primary,
    backgroundColor: '#EDF5F3',
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
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.light.border,
  },
  radioActive: {
    borderColor: colors.light.primary,
    backgroundColor: colors.light.primary,
  },
  applyBtn: {
    marginTop: 8,
  },
});

