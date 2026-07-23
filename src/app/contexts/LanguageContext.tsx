import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getTranslation } from '../utils/translations';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
  isVoiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
  speak: (text: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState('fr');
  const [isVoiceEnabled, setVoiceEnabled] = useState(true);

  const t = (key: string) => getTranslation(language, key);

  const speak = (text: string) => {
    if (!isVoiceEnabled || !('speechSynthesis' in window)) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;

    // Map language codes to speech synthesis voices
    const langMap: Record<string, string> = {
      fr: 'fr-FR',
      en: 'en-US',
      ht: 'fr-FR', // Fallback to French for Haitian Creole
      sw: 'sw-KE',
      ar: 'ar-SA',
      ha: 'en-NG', // Fallback
      yo: 'en-NG', // Fallback
      wo: 'fr-SN', // Fallback
      ln: 'fr-CD', // Fallback
      am: 'am-ET',
      zu: 'zu-ZA',
      pt: 'pt-PT',
      es: 'es-ES',
    };

    utterance.lang = langMap[language] || language;

    // Try to find a voice that matches the language
    const voices = speechSynthesis.getVoices();
    const matchingVoice = voices.find(voice => voice.lang.startsWith(utterance.lang.split('-')[0]));

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
