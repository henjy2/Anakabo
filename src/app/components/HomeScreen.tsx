import { Car, PersonStanding, Bus, Bike, Users, Bike as Scooter, Package, BadgeInfo, Baby, Download, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { useLanguage } from '../contexts/LanguageContext';
import { useCountry } from '../contexts/CountryContext';
import { useMonetization } from '../contexts/MonetizationContext';
import { LanguageSelector } from './LanguageSelector';
import { CountrySelector } from './CountrySelector';
import { VoiceCommandButton } from './VoiceCommandButton';
import { LikeButton } from './LikeButton';
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

const transportModes = [
  { id: 'car' as TransportMode, label: 'Voiture', icon: Car, color: 'bg-blue-500' },
  { id: 'pedestrian' as TransportMode, label: 'Piétons', icon: PersonStanding, color: 'bg-green-500' },
  { id: 'transit' as TransportMode, label: 'Transports', icon: Bus, color: 'bg-purple-500' },
  { id: 'bike' as TransportMode, label: 'Vélo', icon: Bike, color: 'bg-orange-500' },
  { id: 'scooter' as TransportMode, label: 'Trottinette', icon: Scooter, color: 'bg-pink-500' },
  { id: 'carpool' as TransportMode, label: 'Covoiturage', icon: Users, color: 'bg-indigo-500' },
  { id: 'motorcycle' as TransportMode, label: 'Moto', icon: Car, color: 'bg-red-500' },
  { id: 'taxi' as TransportMode, label: 'Taxi', icon: Car, color: 'bg-amber-500' },
  { id: 'delivery' as TransportMode, label: 'Livreur', icon: Package, color: 'bg-yellow-500' },
  { id: 'tourist' as TransportMode, label: 'Touriste', icon: BadgeInfo, color: 'bg-teal-500' },
  { id: 'parent' as TransportMode, label: 'Parent', icon: Baby, color: 'bg-rose-500' },
];

export function HomeScreen({ onSelectMode }: HomeScreenProps) {
  const { t, speak } = useLanguage();
  const { metrics } = useMonetization();
  const { selectedCountry } = useCountry();

  const handleModeSelect = (mode: TransportMode) => {
    speak(t('chooseMode'));
    onSelectMode(mode);
  };

  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();

    // Simple voice command processing
    if (lowerCommand.includes('voiture') || lowerCommand.includes('car')) {
      handleModeSelect('car');
    } else if (lowerCommand.includes('vélo') || lowerCommand.includes('bike')) {
      handleModeSelect('bike');
    } else if (lowerCommand.includes('bus') || lowerCommand.includes('métro') || lowerCommand.includes('transport')) {
      handleModeSelect('transit');
    } else if (lowerCommand.includes('marche') || lowerCommand.includes('pied') || lowerCommand.includes('walk')) {
      handleModeSelect('pedestrian');
    } else if (lowerCommand.includes('trotinette') || lowerCommand.includes('scooter')) {
      handleModeSelect('scooter');
    } else {
      speak('Mode non reconnu. Veuillez réessayer.');
    }
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Language Selector, Country & Voice Command */}
        <div className="absolute top-6 right-6 flex gap-2 flex-wrap justify-end">
          <VoiceCommandButton onCommand={handleVoiceCommand} />
          <CountrySelector />
          <LanguageSelector />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-6xl mb-4">🗺️ {t('appName')}</h1>
          <p className="text-2xl text-gray-700 mb-3">Navigation intelligente pour l'Afrique 🌍 et HAYTI 👑</p>
          <p className="text-sm text-gray-600 mb-4">52 pays africains • Toutes les langues • Assistant vocal</p>

          {/* App Metrics */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <Badge variant="outline" className="px-3 py-1">
              <Download className="w-3 h-3 mr-1" />
              {(metrics.totalDownloads / 1000).toFixed(0)}K téléchargements
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              <Eye className="w-3 h-3 mr-1" />
              {(metrics.totalViews / 1000000).toFixed(1)}M vues
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              ⭐ 4.8/5 ({(metrics.totalLikes / 1000).toFixed(0)}K avis)
            </Badge>
          </div>

          {/* Like Button */}
          <div className="flex justify-center mb-4">
            <LikeButton itemType="app" />
          </div>

          {/* 100% Gratuit Badge */}
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 text-base">
            ✅ 100% GRATUIT • Aucun abonnement requis
          </Badge>
        </div>

        {/* Selected Country Banner */}
        {selectedCountry && (
          <Card className="mb-4 p-4 bg-gradient-to-r from-indigo-600 to-blue-500 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{selectedCountry.flag}</span>
                <div>
                  <h3 className="font-bold text-lg">{selectedCountry.name} — {selectedCountry.nativeName}</h3>
                  <p className="text-sm opacity-90">
                    {selectedCountry.capital && `🏛 ${selectedCountry.capital}`}
                  </p>
                </div>
              </div>
              <div className="text-right text-xs opacity-80">
                {selectedCountry.languages.length} langue{selectedCountry.languages.length > 1 ? 's' : ''}
              </div>
            </div>
          </Card>
        )}

        {/* Cultural Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="p-4 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 text-white">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🌍</span>
              <div>
                <h3 className="font-bold text-lg">Afrique - Afrika - Africa</h3>
                <p className="text-sm opacity-90">
                  52 pays • 70+ langues africaines • Navigation locale
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 text-white overflow-hidden" style={{ background: 'linear-gradient(135deg, #000000 0%, #1a0000 50%, #D21034 100%)' }}>
            <div className="flex items-center gap-3">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Flag_of_the_First_Empire_of_Haiti.svg/120px-Flag_of_the_First_Empire_of_Haiti.svg.png"
                alt="Drapeau de l'Empire d'Hayti"
                width="60"
                height="40"
                style={{ borderRadius: 3, flexShrink: 0, objectFit: 'cover' }}
              />
              <div>
                <h3 className="font-bold text-lg">HAYTI — AYITI 👑</h3>
                <p className="text-sm opacity-90">
                  Empire d'Hayti • Dessalines 1804 • Kreyòl Ayisyen ak Fransè
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-8 bg-white/90 backdrop-blur">
          <h2 className="text-2xl mb-6 text-center">{t('chooseMode')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {transportModes.map((mode) => {
              const Icon = mode.icon;
              return (
                <Button
                  key={mode.id}
                  onClick={() => handleModeSelect(mode.id)}
                  variant="outline"
                  className="h-32 flex flex-col items-center justify-center gap-3 hover:scale-105 transition-transform"
                >
                  <div className={`${mode.color} p-4 rounded-full text-white`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <span className="text-sm">{mode.label}</span>
                </Button>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t">
            <Button
              variant="default"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600"
              onClick={() => handleModeSelect('car')}
            >
              {t('multimodal')} 🚀
            </Button>
          </div>
        </Card>

        {/* Footer info */}
        <p className="text-center text-sm text-gray-600 mt-8">
          Monétisé par la publicité • Gratuit pour toujours
        </p>
      </div>

      {/* Ad Banner */}
      <AdBanner position="bottom" />
    </div>
  );
}
