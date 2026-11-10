import { useState, useEffect, useCallback } from 'react';
import { I18nManager } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { translations, SupportedLanguage, Translations } from './translations';

const LANGUAGE_KEY = 'sanad_user_language';

const RTL_LANGUAGES: Set<SupportedLanguage> = new Set(['ar', 'ur']);

export function useTranslation() {
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>('en');

  useEffect(() => {
    async function loadSavedLanguage() {
      try {
        const saved = await SecureStore.getItemAsync(LANGUAGE_KEY);
        if (saved && (saved === 'en' || saved === 'ar' || saved === 'ur' || saved === 'hi')) {
          setCurrentLang(saved as SupportedLanguage);
        }
      } catch {
        // Fall back to default language
      }
    }
    loadSavedLanguage();
  }, []);

  const setLanguage = useCallback(async (lang: SupportedLanguage) => {
    setCurrentLang(lang);
    try {
      await SecureStore.setItemAsync(LANGUAGE_KEY, lang);
    } catch {
      // Ignore secure store errors in dev environments
    }

    const shouldBeRTL = RTL_LANGUAGES.has(lang);
    if (I18nManager.isRTL !== shouldBeRTL) {
      I18nManager.allowRTL(shouldBeRTL);
      I18nManager.forceRTL(shouldBeRTL);
    }
  }, []);

  const t = useCallback(
    (key: keyof Translations): string => {
      const dictionary = translations[currentLang] || translations.en;
      return dictionary[key] || translations.en[key] || String(key);
    },
    [currentLang]
  );

  const isRTL = RTL_LANGUAGES.has(currentLang);

  return {
    t,
    currentLang,
    setLanguage,
    isRTL,
    supportedLanguages: ['en', 'ar', 'ur', 'hi'] as SupportedLanguage[],
  };
}
