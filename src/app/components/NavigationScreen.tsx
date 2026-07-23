import { useState, useEffect } from 'react';
import { TransportMode } from './HomeScreen';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Navigation,
  Volume2,
  VolumeX,
  Maximize,
  AlertTriangle,
  MapPin,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { useLanguage } from '../contexts/LanguageContext';

interface NavigationScreenProps {
  mode: TransportMode;
  destination: string;
  onEnd: () => void;
}

const navigationSteps = [
  { instruction: 'Tout droit sur 200m', distance: '200m', icon: ArrowUp, passed: true },
  { instruction: 'Tournez à droite sur Avenue des Champs-Élysées', distance: '50m', icon: ArrowRight, passed: false },
  { instruction: 'Continuez tout droit pendant 1.2km', distance: '1.2km', icon: ArrowUp, passed: false },
  { instruction: 'Tournez à gauche sur Rue de Rivoli', distance: '850m', icon: ArrowLeft, passed: false },
  { instruction: 'Destination sur votre droite', distance: '150m', icon: MapPin, passed: false },
];

export function NavigationScreen({ mode, destination, onEnd }: NavigationScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(15);
  const [eta, setEta] = useState(22);
  const { t, isVoiceEnabled, setVoiceEnabled, speak } = useLanguage();

  useEffect(() => {
    // Announce navigation start
    speak(`${t('startNavigation')}. ${navigationSteps[0].instruction}`);

    const interval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 2, 100));
      setEta((prev) => Math.max(prev - 1, 0));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Announce new instruction when step changes
    if (currentStep < navigationSteps.length) {
      speak(navigationSteps[currentStep].instruction);
    }
  }, [currentStep]);

  const currentInstruction = navigationSteps[currentStep];
  const nextInstruction = navigationSteps[currentStep + 1];

  return (
    <div className="h-screen w-full flex flex-col bg-gray-900 text-white">
      {/* Top bar */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onEnd} className="text-white hover:bg-gray-700">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quitter
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-gray-700"
            onClick={() => setVoiceEnabled(!isVoiceEnabled)}
          >
            {isVoiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700">
            <Maximize className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Map simulation */}
      <div className="flex-1 relative bg-gradient-to-br from-blue-900 to-purple-900">
        <div className="absolute inset-0 flex items-center justify-center">
          <Navigation className="w-32 h-32 text-blue-400 opacity-20 animate-pulse" />
        </div>

        {/* Current location indicator */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-6 h-6 bg-blue-500 rounded-full border-4 border-white shadow-lg animate-pulse" />
        </div>

        {/* Alerts */}
        <div className="absolute top-4 left-4 right-4">
          <Card className="p-3 bg-yellow-500 border-yellow-600 text-gray-900 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm font-medium">Ralentissement dans 500m</span>
          </Card>
        </div>

        {/* Speed/Progress indicator */}
        <div className="absolute bottom-72 left-4 right-4">
          <Card className="p-4 bg-gray-800/90 backdrop-blur border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Progression</span>
              <span className="text-sm text-gray-400">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </Card>
        </div>
      </div>

      {/* Navigation instructions */}
      <div className="bg-gray-800 p-6 border-t border-gray-700">
        {/* ETA */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-sm text-gray-400">Arrivée dans</p>
              <p className="text-xl font-bold">{eta} min</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-sm text-gray-400">Distance restante</p>
              <p className="text-xl font-bold">2.4 km</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-400">Destination</p>
            <p className="font-medium truncate max-w-32">{destination || 'Paris'}</p>
          </div>
        </div>

        {/* Current instruction */}
        <Card className="p-4 mb-3 bg-blue-600 border-blue-500">
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-full">
              <currentInstruction.icon className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <Badge className="mb-2 bg-blue-800">Dans {currentInstruction.distance}</Badge>
              <p className="text-lg font-semibold">{currentInstruction.instruction}</p>
            </div>
          </div>
        </Card>

        {/* Next instruction preview */}
        {nextInstruction && (
          <Card className="p-3 bg-gray-700 border-gray-600">
            <div className="flex items-center gap-3">
              <nextInstruction.icon className="w-5 h-5 text-gray-300" />
              <div className="flex-1">
                <p className="text-sm text-gray-300">Ensuite : {nextInstruction.instruction}</p>
              </div>
              <span className="text-xs text-gray-400">{nextInstruction.distance}</span>
            </div>
          </Card>
        )}

        {/* Quick actions */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            onClick={() => setCurrentStep(Math.min(currentStep + 1, navigationSteps.length - 1))}
          >
            Étape suivante
          </Button>
          <Button variant="outline" size="sm" className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
            Itinéraire alternatif
          </Button>
          <Button variant="outline" size="sm" className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
            Arrêt
          </Button>
        </div>
      </div>
    </div>
  );
}
