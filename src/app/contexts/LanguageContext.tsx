import { createContext, useContext, useState, ReactNode, useEffect, type Context } from 'react';
import { getTranslation } from '../utils/translations';
import { LANG_BCP_MAP } from '../utils/voiceLanguages';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
  isVoiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
  speak: (text: string, bcpLang?: string) => void;
}

const languageGlobal = globalThis as typeof globalThis & {
  __anakaboLanguageContext?: Context<LanguageContextType | undefined>;
};

const LanguageContext = languageGlobal.__anakaboLanguageContext
  ?? createContext<LanguageContextType | undefined>(undefined);

languageGlobal.__anakaboLanguageContext = LanguageContext;

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('anakabo_language') ?? 'fr');
  const [isVoiceEnabled, setVoiceEnabled] = useState(() => localStorage.getItem('anakabo_voice_enabled') !== 'false');

  const t = (key: string) => getTranslation(language, key);

  const speak = (text: string, bcpLang?: string) => {
    if (!isVoiceEnabled || !('speechSynthesis' in window)) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = bcpLang || LANG_BCP_MAP[language] || language;

    // Try to find a voice that matches the language
    const voices = speechSynthesis.getVoices();
    const requestedLanguage = utterance.lang.toLowerCase();
    const matchingVoice = voices.find(voice => voice.lang.toLowerCase() === requestedLanguage)
      ?? voices.find(voice => voice.lang.toLowerCase().startsWith(requestedLanguage.split('-')[0]));

    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    speechSynthesis.cancel(); // Cancel any ongoing speech
    speechSynthesis.speak(utterance);
  };

  // Load voices when they become available
  useEffect(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        speechSynthesis.getVoices();
      };
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('anakabo_language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('anakabo_voice_enabled', String(isVoiceEnabled));
  }, [isVoiceEnabled]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isVoiceEnabled, setVoiceEnabled, speak }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
