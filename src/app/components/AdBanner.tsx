import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface AdBannerProps {
  position?: 'top' | 'bottom';
  onClose?: () => void;
}

const sponsors = [
  {
    name: 'Total Energies',
    message: 'Station essence à 500m - Prix: 1.65€/L',
    logo: '⛽',
    color: 'from-red-500 to-orange-500',
  },
  {
    name: 'McDonald\'s',
    message: 'Restaurant à 2km - Ouvert 24h/24',
    logo: '🍔',
    color: 'from-yellow-400 to-red-600',
  },
  {
    name: 'Airbnb',
    message: 'Hébergements près de vous dès 25€/nuit',
    logo: '🏠',
    color: 'from-pink-500 to-rose-600',
  },
  {
    name: 'Shell',
    message: 'Stations Shell - 5€ de réduction avec notre app',
    logo: '⛽',
    color: 'from-yellow-400 to-red-500',
  },
];

export function AdBanner({ position = 'bottom', onClose }: AdBannerProps) {
  const [currentAd, setCurrentAd] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAd((prev) => (prev + 1) % sponsors.length);
    }, 8000); // Change ad every 8 seconds

    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  const ad = sponsors[currentAd];

  return (
    <div
      className={`fixed ${
        position === 'top' ? 'top-0' : 'bottom-0'
      } left-0 right-0 z-40 px-4 ${position === 'bottom' ? 'pb-4' : 'pt-4'}`}
    >
      <Card className={`bg-gradient-to-r ${ad.color} text-white shadow-xl`}>
        <div className="p-3 flex items-center gap-3">
          <span className="text-3xl">{ad.logo}</span>
          <div className="flex-1">
            <p className="text-xs opacity-90">Sponsorisé</p>
            <p className="font-semibold">{ad.name}</p>
            <p className="text-sm">{ad.message}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 shrink-0"
            onClick={() => {
              setVisible(false);
              onClose?.();
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
