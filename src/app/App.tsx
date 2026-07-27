import { useState, useEffect } from 'react';
import { WazeMapScreen } from './components/WazeMapScreen';
import { UserPreferences } from './components/UserPreferences';
import { AuthScreen } from './components/AuthScreen';
import { AppMetricsDashboard } from './components/AppMetricsDashboard';
import { Button } from './components/ui/button';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MonetizationProvider } from './contexts/MonetizationContext';
import { CountryProvider } from './contexts/CountryContext';

// Inject Google AdSense script once
function useAdSense() {
  useEffect(() => {
    if (document.querySelector('script[data-adsense]')) return;
    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6092089279576992';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.setAttribute('data-adsense', 'true');
    document.head.appendChild(script);
  }, []);
}

type Screen = 'auth' | 'map' | 'preferences' | 'metrics';

function AppContent() {
  const { isAuthenticated, logout } = useAuth();
  const [screen, setScreen] = useState<Screen>('auth');

  useAdSense();

  useEffect(() => {
    if (isAuthenticated && screen === 'auth') {
      setScreen('map');
    }
  }, [isAuthenticated]);

  if (!isAuthenticated || screen === 'auth') {
    return (
      <AuthScreen
        onSuccess={() => setScreen('map')}
        onSkip={() => setScreen('map')}
      />
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

  return (
    <WazeMapScreen
      onOpenMetrics={() => setScreen('metrics')}
      onOpenPreferences={() => setScreen('preferences')}
      onLogout={() => { logout(); setScreen('auth'); }}
    />
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
