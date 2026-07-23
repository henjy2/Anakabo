import { useState, useEffect } from 'react';
import { HomeScreen, TransportMode } from './components/HomeScreen';
import { MapScreen } from './components/MapScreen';
import { NavigationScreen } from './components/NavigationScreen';
import { UserPreferences } from './components/UserPreferences';
import { AuthScreen } from './components/AuthScreen';
import { SubscriptionScreen } from './components/SubscriptionScreen';
import { AdvancedRoutePlanner } from './components/AdvancedRoutePlanner';
import { Button } from './components/ui/button';
import { User, BarChart3 } from 'lucide-react';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MonetizationProvider } from './contexts/MonetizationContext';
import { CountryProvider } from './contexts/CountryContext';
import { AppMetricsDashboard } from './components/AppMetricsDashboard';

type Screen = 'home' | 'map' | 'navigation' | 'preferences' | 'auth' | 'planner' | 'metrics';

function AppContent() {
  const { user, isAuthenticated } = useAuth();
  const [selectedMode, setSelectedMode] = useState<TransportMode | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [destination, setDestination] = useState('');
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  // Show auth screen on first load if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !showAuthPrompt) {
      const hasSeenAuth = localStorage.getItem('anakabo_seen_auth');
      if (!hasSeenAuth) {
        setShowAuthPrompt(true);
      }
    }
  }, [isAuthenticated, showAuthPrompt]);

  useEffect(() => {
    const handleSelectMode = (e: Event) => {
      const customEvent = e as CustomEvent;
      setSelectedMode(customEvent.detail);
      setCurrentScreen('map');
    };

    const handleStartNavigation = (e: Event) => {
      const customEvent = e as CustomEvent;
      setDestination(customEvent.detail.destination);
      setCurrentScreen('navigation');
    };

    window.addEventListener('selectMode', handleSelectMode);
    window.addEventListener('startNavigation', handleStartNavigation);

    return () => {
      window.removeEventListener('selectMode', handleSelectMode);
      window.removeEventListener('startNavigation', handleStartNavigation);
    };
  }, []);

  const handleBack = () => {
    if (currentScreen === 'navigation') {
      setCurrentScreen('map');
    } else {
      setSelectedMode(null);
      setCurrentScreen('home');
    }
  };

  if (showAuthPrompt && !isAuthenticated) {
    return (
      <AuthScreen
        onSuccess={() => {
          setShowAuthPrompt(false);
          localStorage.setItem('anakabo_seen_auth', 'true');
        }}
        onSkip={() => {
          setShowAuthPrompt(false);
          localStorage.setItem('anakabo_seen_auth', 'true');
        }}
      />
    );
  }

  if (currentScreen === 'metrics') {
    return (
      <div>
        <div className="p-4 border-b flex items-center justify-between bg-white">
          <h1 className="text-xl font-bold">Métriques de l'App</h1>
          <Button variant="ghost" onClick={() => setCurrentScreen('home')}>
            Fermer
          </Button>
        </div>
        <AppMetricsDashboard />
      </div>
    );
  }

  if (currentScreen === 'planner') {
    return (
      <AdvancedRoutePlanner
        onPlan={(route) => {
          console.log('Planned route:', route);
          setCurrentScreen('home');
        }}
        onClose={() => setCurrentScreen('home')}
      />
    );
  }

  if (currentScreen === 'preferences') {
    return (
      <UserPreferences
        onClose={() => setCurrentScreen('home')}
        onSelectRoute={(mode, origin, dest) => {
          setSelectedMode(mode);
          setDestination(dest);
          setCurrentScreen('map');
        }}
      />
    );
  }

  if (currentScreen === 'navigation' && selectedMode) {
    return (
      <NavigationScreen
        mode={selectedMode}
        destination={destination}
        onEnd={handleBack}
      />
    );
  }

  if (currentScreen === 'map' && selectedMode) {
    return (
      <>
        <MapScreen mode={selectedMode} onBack={handleBack} />
        <Button
          className="fixed top-4 right-4 z-50 rounded-full w-12 h-12"
          variant="default"
          size="icon"
          onClick={() => setCurrentScreen('preferences')}
        >
          <User className="w-5 h-5" />
        </Button>
      </>
    );
  }

  return (
    <>
      <HomeScreen onSelectMode={(mode) => {
        setSelectedMode(mode);
        setCurrentScreen('map');
      }} />

      {/* User Menu */}
      <div className="fixed top-4 left-4 z-50 flex flex-col gap-2">
        <Button
          className="rounded-full w-12 h-12"
          variant="default"
          size="icon"
          onClick={() => setCurrentScreen('preferences')}
          title="Profil"
        >
          <User className="w-5 h-5" />
        </Button>

        <Button
          className="rounded-full w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600"
          size="icon"
          onClick={() => setCurrentScreen('metrics')}
          title="Statistiques"
        >
          <BarChart3 className="w-5 h-5" />
        </Button>
      </div>

      {/* Quick actions bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <Button
          onClick={() => setCurrentScreen('planner')}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg"
        >
          📅 Planifier un trajet
        </Button>
      </div>

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