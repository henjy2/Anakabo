import { Car, PersonStanding, Bus, Bike, Users, Package, BadgeInfo, Baby } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { useLanguage } from '../contexts/LanguageContext';
import { useCountry } from '../contexts/CountryContext';
import { LanguageSelector } from './LanguageSelector';
import { CountrySelector } from './CountrySelector';
import { VoiceCommandButton } from './VoiceCommandButton';
import { AdBanner } from './AdBanner';

export type TransportMode =
  | 'car'
  | 'pedestrian'
  | 'transit'
  | 'scooter'
  | 'carpool'
  | 'motorcycle'
  | 'taxi'
  | 'delivery'
  | 'bike'
  | 'tourist'
  | 'parent';

interface HomeScreenProps {
  onSelectMode: (mode: TransportMode) => void;
}

const transportModeList: { id: TransportMode; icon: any }[] = [
  { id: 'car', icon: Car },
  { id: 'pedestrian', icon: PersonStanding },
  { id: 'transit', icon: Bus },
  { id: 'bike', icon: Bike },
  { id: 'scooter', icon: Bike },
  { id: 'carpool', icon: Users },
  { id: 'motorcycle', icon: Car },
  { id: 'taxi', icon: Car },
  { id: 'delivery', icon: Package },
  { id: 'tourist', icon: BadgeInfo },
  { id: 'parent', icon: Baby },
];

export function HomeScreen({ onSelectMode }: HomeScreenProps) {
  const { t, speak } = useLanguage();
  const { selectedCountry } = useCountry();

  const handleModeSelect = (mode: TransportMode) => {
    speak(t(mode));
    onSelectMode(mode);
  };

  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    if (lowerCommand.includes('voiture') || lowerCommand.includes('car') || lowerCommand.includes('machin')) {
      handleModeSelect('car');
    } else if (lowerCommand.includes('vélo') || lowerCommand.includes('bike') || lowerCommand.includes('bisiklèt')) {
      handleModeSelect('bike');
    } else if (lowerCommand.includes('bus') || lowerCommand.includes('métro') || lowerCommand.includes('transport')) {
      handleModeSelect('transit');
    } else if (lowerCommand.includes('marche') || lowerCommand.includes('pied') || lowerCommand.includes('walk') || lowerCommand.includes('mache')) {
      handleModeSelect('pedestrian');
    } else if (lowerCommand.includes('scooter') || lowerCommand.includes('trotinette') || lowerCommand.includes('skoutè')) {
      handleModeSelect('scooter');
    } else if (lowerCommand.includes('taxi') || lowerCommand.includes('taksi')) {
      handleModeSelect('taxi');
    } else if (lowerCommand.includes('moto')) {
      handleModeSelect('motorcycle');
    }
  };

  return (
    <div className="h-screen w-full bg-white flex flex-col items-center justify-center p-6 overflow-auto">
      <div className="max-w-4xl w-full">

        {/* Top controls */}
        <div className="absolute top-6 right-6 flex gap-2 flex-wrap justify-end z-10">
          <VoiceCommandButton onCommand={handleVoiceCommand} />
          <CountrySelector />
          <LanguageSelector />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-light tracking-tight text-gray-900 mb-2">🗺️ {t('appName')}</h1>
          <p className="text-base text-gray-500 mb-3">{t('subtitle')}</p>
          <Badge variant="outline" className="text-gray-600 border-gray-300 px-4 py-1 font-normal">
            ✅ {t('free')}
          </Badge>
        </div>

        {/* Selected Country */}
        {selectedCountry && (
          <Card className="mb-4 p-4 bg-gray-50 border border-gray-200 shadow-none">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{selectedCountry.flag}</span>
              <div>
                <h3 className="font-medium text-gray-900">{selectedCountry.name}</h3>
                <p className="text-sm text-gray-500">{selectedCountry.nativeName}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Cultural banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <Card className="p-4 bg-gray-50 border border-gray-200 shadow-none hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌍</span>
              <div>
                <h3 className="font-medium text-gray-900">Afrique — Afrika — Africa</h3>
                <p className="text-sm text-gray-500">52 {t('country')}s • 80+ {t('language')}s</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gray-50 border border-gray-200 shadow-none hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/c/c0/Flag_of_the_First_Empire_of_Haiti.svg"
                alt="HAYTI"
                width="56"
                height="38"
                style={{ borderRadius: 3, flexShrink: 0, objectFit: 'cover' }}
              />
              <div>
                <h3 className="font-medium text-gray-900">HAYTI — AYITI</h3>
                <p className="text-sm text-gray-500">Kreyòl Ayiti ak Fransè</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Transport modes */}
        <Card className="p-6 border border-gray-200 shadow-none">
          <h2 className="text-base font-medium text-gray-700 text-center mb-4">{t('chooseMode')}</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {transportModeList.map((mode) => {
              const Icon = mode.icon;
              return (
                <Button
                  key={mode.id}
                  onClick={() => handleModeSelect(mode.id)}
                  variant="ghost"
                  className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-gray-100 transition-colors rounded-xl border border-transparent hover:border-gray-200"
                >
                  <Icon className="w-5 h-5 text-gray-600" />
                  <span className="text-xs text-center leading-tight text-gray-600">{t(mode.id)}</span>
                </Button>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <Button
              variant="default"
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-normal"
              onClick={() => handleModeSelect('car')}
            >
              {t('multimodal')} →
            </Button>
          </div>
        </Card>
      </div>

      <AdBanner position="bottom" />
    </div>
  );
}
