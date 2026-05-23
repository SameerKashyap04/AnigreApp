import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageCode, TRANSLATIONS } from '../constants/translations';

interface SettingsContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  profileName: string;
  setProfileName: (name: string) => void;
  t: (key: string) => string;
}

const SettingsContext = createContext<SettingsContextType>({
  language: 'en',
  setLanguage: () => {},
  profileName: 'Farmer',
  setProfileName: () => {},
  t: (key) => key,
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLangState] = useState<LanguageCode>('en');
  const [profileName, setProfileNameState] = useState('Sameer K.');

  useEffect(() => {
    // Load from local storage on mount
    const loadSettings = async () => {
      try {
        const storedLang = await AsyncStorage.getItem('@language');
        const storedName = await AsyncStorage.getItem('@profileName');
        if (storedLang) setLangState(storedLang as LanguageCode);
        if (storedName) setProfileNameState(storedName);
      } catch (e) {
        console.error('Failed to load settings', e);
      }
    };
    loadSettings();
  }, []);

  const setLanguage = async (lang: LanguageCode) => {
    setLangState(lang);
    await AsyncStorage.setItem('@language', lang);
  };

  const setProfileName = async (name: string) => {
    setProfileNameState(name);
    await AsyncStorage.setItem('@profileName', name);
  };

  const t = (key: string): string => {
    // Try current language, fallback to English, fallback to key
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['en']?.[key] || key;
  };

  return (
    <SettingsContext.Provider value={{ language, setLanguage, profileName, setProfileName, t }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
