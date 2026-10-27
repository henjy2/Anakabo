import { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useLanguage } from '../contexts/LanguageContext';

interface VoiceCommandButtonProps {
  onCommand: (command: string) => void;
}

interface SpeechRecognitionResultEvent {
  results: ArrayLike<{
    [index: number]: { transcript: string };
  }>;
}

interface BrowserSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

export function VoiceCommandButton({ onCommand }: VoiceCommandButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<BrowserSpeechRecognition | null>(null);
  const { language } = useLanguage();

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition
        || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();

      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;

      // Map language codes to speech recognition languages
      const langMap: Record<string, string> = {
        fr: 'fr-FR',
        en: 'en-US',
        ht: 'fr-FR',
        sw: 'sw-KE',
        ar: 'ar-SA',
        ha: 'en-NG',
        yo: 'en-NG',
        wo: 'fr-SN',
        ln: 'fr-CD',
        am: 'am-ET',
        zu: 'zu-ZA',
        pt: 'pt-PT',
        es: 'es-ES',
      };

      recognitionInstance.lang = langMap[language] || language;

      recognitionInstance.onresult = (event: SpeechRecognitionResultEvent) => {
        const transcript = event.results[0][0].transcript;
        onCommand(transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = () => {
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [language]);

  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  if (!recognition) {
    return null;
  }

  return (
    <div className="relative">
      <Button
        onClick={toggleListening}
        variant={isListening ? 'default' : 'outline'}
        size="icon"
        className={`rounded-full ${isListening ? 'bg-red-500 hover:bg-red-600 animate-pulse' : ''}`}
      >
        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </Button>
      {isListening && (
        <Badge className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-red-500 whitespace-nowrap">
          🎤 Écoute...
        </Badge>
      )}
    </div>
  );
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
