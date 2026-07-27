"use client";

import { useState, useEffect } from "react";
import { Language, Translations, getTranslation, languages } from "../i18n";

export function useTranslations() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');

  // Load language from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('looma-language') as Language;
      const browserLanguage = navigator.language.split('-')[0] as Language;

      // Try saved language, then browser language, then fallback to English
      const language = savedLanguage || (languages.find(lang => lang.code === browserLanguage) ? browserLanguage : 'en');

      if (language && languages.find(lang => lang.code === language)) {
        setCurrentLanguage(language);
      }
    }
  }, []);

  const handleLanguageChange = (language: Language) => {
    setCurrentLanguage(language);
    if (typeof window !== 'undefined') {
      localStorage.setItem('looma-language', language);
    }
  };

  const t = getTranslation(currentLanguage);
  const isRTL = languages.find(lang => lang.code === currentLanguage)?.direction === 'rtl';

  return {
    t,
    currentLanguage,
    handleLanguageChange,
    isRTL,
    languages
  };
}