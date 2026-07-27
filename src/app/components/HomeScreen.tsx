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

const transportModeList: { id: TransportMode; icon: any; color: string }[] = [
  { id: 'car', icon: Car, color: 'bg-blue-500' },
  { id: 'pedestrian', icon: PersonStanding, color: 'bg-green-500' },
  { id: 'transit', icon: Bus, color: 'bg-purple-500' },
  { id: 'bike', icon: Bike, color: 'bg-orange-500' },
  { id: 'scooter', icon: Bike, color: 'bg-pink-500' },
  { id: 'carpool', icon: Users, color: 'bg-indigo-500' },
  { id: 'motorcycle', icon: Car, color: 'bg-red-500' },
  { id: 'taxi', icon: Car, color: 'bg-amber-500' },
  { id: 'delivery', icon: Package, color: 'bg-yellow-500' },
  { id: 'tourist', icon: BadgeInfo, color: 'bg-teal-500' },
  { id: 'parent', icon: Baby, color: 'bg-rose-500' },
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
    <div className="h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-6 overflow-auto">
      <div className="max-w-4xl w-full">

        {/* Top controls */}
        <div className="absolute top-6 right-6 flex gap-2 flex-wrap justify-end z-10">
          <VoiceCommandButton onCommand={handleVoiceCommand} />
          <CountrySelector />
          <LanguageSelector />
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-6xl mb-2">🗺️ {t('appName')}</h1>
          <p className="text-xl text-gray-700 mb-2">{t('subtitle')}</p>
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1">
            ✅ {t('free')}
          </Badge>
        </div>

        {/* Selected Country */}
        {selectedCountry && (
          <Card className="mb-4 p-4 bg-gradient-to-r from-indigo-600 to-blue-500 text-white">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{selectedCountry.flag}</span>
              <div>
                <h3 className="font-bold text-lg">{selectedCountry.name}</h3>
                <p className="text-sm opacity-90">{selectedCountry.nativeName}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Cultural banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="p-4 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 text-white">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🌍</span>
              <div>
                <h3 className="font-bold text-lg">Afrique — Afrika — Africa</h3>
                <p className="text-sm opacity-90">52 {t('country')}s • 80+ {t('language')}s</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-r from-blue-600 via-red-600 to-blue-600 text-white">
            <div className="flex items-center gap-3">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/c/c0/Flag_of_the_First_Empire_of_Haiti.svg"
                alt="HAYTI"
                width="72"
                height="48"
                style={{ borderRadius: 3, flexShrink: 0, objectFit: 'cover' }}
              />
              <div>
                <h3 className="font-bold text-lg">HAYTI — AYITI</h3>
                <p className="text-sm opacity-90">Kreyòl Ayiti ak Fransè</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Transport modes */}
        <Card className="p-6 bg-white/90 backdrop-blur">
          <h2 className="text-xl mb-4 text-center font-semibold">{t('chooseMode')}</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {transportModeList.map((mode) => {
              const Icon = mode.icon;
              return (
                <Button
                  key={mode.id}
                  onClick={() => handleModeSelect(mode.id)}
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform"
                >
                  <div className={`${mode.color} p-3 rounded-full text-white`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-center leading-tight">{t(mode.id)}</span>
                </Button>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t">
            <Button
              variant="default"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
              onClick={() => handleModeSelect('car')}
            >
              {t('multimodal')} 🚀
            </Button>
          </div>
        </Card>
      </div>

      <AdBanner position="bottom" />
    </div>
  );
}
