import { Card } from './ui/card';
import { Button } from './ui/button';

export type AdConsent = 'granted' | 'denied' | null;

interface AdConsentBannerProps {
  consent: AdConsent;
  onChange: (consent: Exclude<AdConsent, null>) => void;
}

export function AdConsentBanner({ consent, onChange }: AdConsentBannerProps) {
  if (consent !== null) return null;

  return (
    <Card className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-xl border-slate-200 bg-white p-4 shadow-2xl">
      <p className="font-semibold text-slate-900">Confidentialité et publicité</p>
      <p className="mt-1 text-sm leading-5 text-slate-600">
        Avec votre accord, Anakabo peut charger Google AdSense, qui peut utiliser des cookies
        pour mesurer et personnaliser les annonces. Vous pouvez refuser sans perdre l’accès à la carte.
      </p>
      <div className="mt-3 flex flex-wrap justify-end gap-2">
        <Button variant="ghost" onClick={() => { window.location.href = '/privacy.html'; }}>
          Politique de confidentialité
        </Button>
        <Button variant="outline" onClick={() => onChange('denied')}>
          Refuser
        </Button>
        <Button onClick={() => onChange('granted')}>
          Accepter
        </Button>
      </div>
    </Card>
  );
}
