import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

const LANGUAGE_STORAGE_KEY = 'nutriscan_app_language_v1';

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved === 'hi' || saved === 'en') return saved;
      return 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = (lang) => {
    if (lang === 'en' || lang === 'hi') {
      setLanguageState(lang);
      try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      } catch (e) {
        console.warn('Failed to save language to localStorage:', e);
      }
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  // Translation lookup with fallback
  const t = (key, fallback) => {
    const langDict = translations[language];
    if (langDict && langDict[key] !== undefined) {
      return langDict[key];
    }
    const enDict = translations['en'];
    if (enDict && enDict[key] !== undefined) {
      return enDict[key];
    }
    return fallback !== undefined ? fallback : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
