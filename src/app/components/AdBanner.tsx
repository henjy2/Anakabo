import { useEffect, useRef } from 'react';

interface AdBannerProps {
  position?: 'top' | 'bottom';
  slot?: string;
  onClose?: () => void;
}

function AdsenseBanner({ slot }: { slot: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    try {
      // @ts-ignore AdSense defines this queue after its script loads.
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.warn('AdSense banner initialization failed', error);
    }
  }, []);

  return (
    <div ref={ref} className="w-full overflow-hidden" aria-label="Publicité">
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

export function AdBanner({ slot }: AdBannerProps) {
  // Never substitute fabricated sponsors when no approved AdSense unit exists.
  if (!slot?.trim()) return null;
  return <AdsenseBanner slot={slot} />;
}
