import { useState, useEffect } from 'react';
import { WazeMapScreen } from './components/WazeMapScreen';
import { UserPreferences } from './components/UserPreferences';
import { SettingsScreen } from './components/SettingsScreen';
import { AuthScreen } from './components/AuthScreen';
import { AppMetricsDashboard } from './components/AppMetricsDashboard';
import { Button } from './components/ui/button';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MonetizationProvider } from './contexts/MonetizationContext';
import { CountryProvider } from './contexts/CountryContext';
import { AdConsentBanner, type AdConsent } from './components/AdConsentBanner';

function useAdSense(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    if (document.querySelector('script[data-adsense]')) return;
    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6092089279576992';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-adsense', 'true');
    document.head.appendChild(script);
  }, [enabled]);
}

type Screen = 'auth' | 'map' | 'preferences' | 'settings' | 'metrics';

function AppContent() {
  const { isAuthenticated, isGuest, continueAsGuest, logout } = useAuth();
  const [screen, setScreen] = useState<Screen>('auth');
  const [adConsent, setAdConsent] = useState<AdConsent>(() => {
    const saved = localStorage.getItem('anakabo_ad_consent');
    return saved === 'granted' || saved === 'denied' ? saved : null;
  });

  useAdSense(adConsent === 'granted');

  const updateAdConsent = (consent: Exclude<AdConsent, null>) => {
    localStorage.setItem('anakabo_ad_consent', consent);
    setAdConsent(consent);
  };

  useEffect(() => {
    if (isAuthenticated && screen === 'auth') {
      setScreen('map');
    }
  }, [isAuthenticated]);

  if ((!isAuthenticated && !isGuest) || screen === 'auth') {
    return (
      <>
        <AuthScreen
          onSuccess={() => setScreen('map')}
          onSkip={() => {
            continueAsGuest();
            setScreen('map');
          }}
        />
        <AdConsentBanner consent={adConsent} onChange={updateAdConsent} />
      </>
    );
  }

  if (screen === 'metrics') {
    return (
      <div className="h-screen flex flex-col">
        <div className="p-4 border-b flex items-center justify-between bg-white">
          <h1 className="text-xl font-bold">Métriques Anakabo</h1>
          <Button variant="ghost" onClick={() => setScreen('map')}>Fermer</Button>
        </div>
        <div className="flex-1 overflow-auto">
          <AppMetricsDashboard />
        </div>
      </div>
    );
  }

  if (screen === 'preferences') {
    return (
      <UserPreferences
        onClose={() => setScreen('map')}
        onSelectRoute={(_mode, _origin, _dest) => setScreen('map')}
      />
    );
  }

  if (screen === 'settings') {
    return <SettingsScreen onClose={() => setScreen('map')} />;
  }

  return (
    <>
      <WazeMapScreen
        onOpenMetrics={() => setScreen('metrics')}
        onOpenPreferences={() => setScreen('preferences')}
        onOpenSettings={() => setScreen('settings')}
        onLogout={() => { void logout(); setScreen('auth'); }}
      />
      <AdConsentBanner consent={adConsent} onChange={updateAdConsent} />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MonetizationProvider>
        <LanguageProvider>
          <CountryProvider>
            <AppContent />
          </CountryProvider>
        </LanguageProvider>
      </MonetizationProvider>
    </AuthProvider>
  );
}
