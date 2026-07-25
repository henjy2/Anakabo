import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface AdBannerProps {
  position?: 'top' | 'bottom';
  slot?: string;
  onClose?: () => void;
}

const sponsors = [
  {
    name: 'Total Energies',
    message: 'Station essence à 500m - Prix: 1.65€/L',
    logo: '⛽',
    color: 'from-red-500 to-orange-500',
    url: '#',
  },
  {
    name: 'Parking Public',
    message: 'Parking à 300m - 1.50€/heure',
    logo: '🅿️',
    color: 'from-blue-500 to-indigo-600',
    url: '#',
  },
  {
    name: 'Hôtel Proche',
    message: 'Hôtels dès 45€/nuit près de vous',
    logo: '🏨',
    color: 'from-purple-500 to-pink-500',
    url: '#',
  },
  {
    name: 'Shell',
    message: 'Station Shell - 5€ de réduction avec Anakabo',
    logo: '⛽',
    color: 'from-yellow-400 to-red-500',
    url: '#',
  },
  {
    name: 'Restaurant',
    message: 'Restaurants proches - Réservez en 1 clic',
    logo: '🍽️',
    color: 'from-green-500 to-teal-600',
    url: '#',
  },
];

// Google AdSense banner component
function AdsenseBanner({ slot }: { slot: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) { /* ignore */ }
  }, []);

  return (
    <div ref={ref} className="w-full overflow-hidden">
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', height: '90px' }}
        data-ad-client="ca-pub-6092089279576992"
        data-ad-slot={slot}
        data-ad-format="horizontal"
        data-full-width-responsive="true"
      />
    </div>
  );
}

export function AdBanner({ position = 'bottom', slot, onClose }: AdBannerProps) {
  const [currentAd, setCurrentAd] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAd((prev) => (prev + 1) % sponsors.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  const ad = sponsors[currentAd];

  return (
    <div className={`fixed ${position === 'top' ? 'top-0' : 'bottom-0'} left-0 right-0 z-40 px-3 ${position === 'bottom' ? 'pb-3' : 'pt-3'}`}>
      {slot ? (
        <AdsenseBanner slot={slot} />
      ) : (
        <Card className={`bg-gradient-to-r ${ad.color} text-white shadow-xl`}>
          <div className="p-3 flex items-center gap-3">
            <span className="text-3xl">{ad.logo}</span>
            <div className="flex-1">
              <p className="text-xs opacity-75">Sponsorisé</p>
              <p className="font-semibold text-sm">{ad.name}</p>
              <p className="text-xs">{ad.message}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 shrink-0"
              onClick={() => { setVisible(false); onClose?.(); }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
