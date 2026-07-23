import { useState } from 'react';
import {
  Calendar,
  Clock,
  ArrowLeftRight,
  MapPin,
  AlertCircle,
  Construction,
  Car as CarIcon,
  Ban,
  DollarSign,
  Route,
  Plus,
  X,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useAuth } from '../contexts/AuthContext';

interface AdvancedRoutePlannerProps {
  onPlan: (route: RouteDetails) => void;
  onClose: () => void;
}

interface RouteDetails {
  origin: string;
  destination: string;
  departureTime?: string;
  returnTime?: string;
  isRoundTrip: boolean;
  avoidTolls: boolean;
  avoidHighways: boolean;
  avoidDifficultIntersections: boolean;
  waypoints: string[];
}

const liveAlerts = [
  { type: 'accident', location: 'A6 Sortie 12', severity: 'high', delay: '15 min', icon: AlertCircle },
  { type: 'construction', location: 'Boulevard Périphérique', severity: 'medium', delay: '8 min', icon: Construction },
  { type: 'traffic', location: 'Champs-Élysées', severity: 'medium', delay: '12 min', icon: CarIcon },
  { type: 'closed', location: 'Rue de Rivoli', severity: 'high', delay: '∞', icon: Ban },
];

export function AdvancedRoutePlanner({ onPlan, onClose }: AdvancedRoutePlannerProps) {
  const { user } = useAuth();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [departureTime, setDepartureTime] = useState('');
  const [returnTime, setReturnTime] = useState('');
  const [avoidTolls, setAvoidTolls] = useState(user?.preferences.avoidTolls || false);
  const [avoidHighways, setAvoidHighways] = useState(user?.preferences.avoidHighways || false);
  const [avoidDifficultIntersections, setAvoidDifficultIntersections] = useState(
    user?.preferences.avoidDifficultIntersections || false
  );
  const [waypoints, setWaypoints] = useState<string[]>([]);

  const addWaypoint = () => {
    setWaypoints([...waypoints, '']);
  };

  const removeWaypoint = (index: number) => {
    setWaypoints(waypoints.filter((_, i) => i !== index));
  };

  const updateWaypoint = (index: number, value: string) => {
    const updated = [...waypoints];
    updated[index] = value;
    setWaypoints(updated);
  };

  const useHomeWork = (type: 'home' | 'work') => {
    if (type === 'home' && user?.preferences.homeAddress) {
      setOrigin(user.preferences.homeAddress);
    } else if (type === 'work' && user?.preferences.workAddress) {
      setDestination(user.preferences.workAddress);
    }
  };

  const handlePlan = () => {
    onPlan({
      origin,
      destination,
      departureTime,
      returnTime,
      isRoundTrip,
      avoidTolls,
      avoidHighways,
      avoidDifficultIntersections,
      waypoints: waypoints.filter(w => w.trim() !== ''),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Planification Avancée</h1>
            <p className="text-gray-600">Créez votre itinéraire sur mesure</p>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Planning */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Points de trajet
              </h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="origin">Départ</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="origin"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      placeholder="Adresse de départ"
                    />
                    {user?.preferences.homeAddress && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => useHomeWork('home')}
                      >
                        🏠 Maison
                      </Button>
                    )}
                  </div>
                </div>

                {waypoints.map((waypoint, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={waypoint}
                      onChange={(e) => updateWaypoint(index, e.target.value)}
                      placeholder={`Arrêt ${index + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeWaypoint(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                <Button variant="outline" size="sm" onClick={addWaypoint} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un arrêt
                </Button>

                <div>
                  <Label htmlFor="destination">Arrivée</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="destination"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="Adresse d'arrivée"
                    />
                    {user?.preferences.workAddress && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => useHomeWork('work')}
                      >
                        🏢 Travail
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Horaires
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="roundtrip">Trajet aller-retour</Label>
                  <Switch
                    id="roundtrip"
                    checked={isRoundTrip}
                    onCheckedChange={setIsRoundTrip}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="departure">Heure de départ</Label>
                    <Input
                      id="departure"
                      type="datetime-local"
                      value={departureTime}
                      onChange={(e) => setDepartureTime(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  {isRoundTrip && (
                    <div>
                      <Label htmlFor="return">Heure de retour</Label>
                      <Input
                        id="return"
                        type="datetime-local"
                        value={returnTime}
                        onChange={(e) => setReturnTime(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900">
                    💡 Nous calculerons le meilleur moment pour éviter les bouchons
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Route className="w-5 h-5" />
                Préférences de route
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <Label htmlFor="tolls">Éviter les péages</Label>
                  </div>
                  <Switch
                    id="tolls"
                    checked={avoidTolls}
                    onCheckedChange={setAvoidTolls}
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <CarIcon className="w-4 h-4 text-gray-500" />
                    <Label htmlFor="highways">Éviter les autoroutes</Label>
                  </div>
                  <Switch
                    id="highways"
                    checked={avoidHighways}
                    onCheckedChange={setAvoidHighways}
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-gray-500" />
                    <Label htmlFor="intersections">Éviter intersections difficiles</Label>
                  </div>
                  <Switch
                    id="intersections"
                    checked={avoidDifficultIntersections}
                    onCheckedChange={setAvoidDifficultIntersections}
                  />
                </div>
              </div>
            </Card>

            <Button onClick={handlePlan} className="w-full" size="lg">
              Planifier l'itinéraire
            </Button>
          </div>

          {/* Alerts Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">🚨 Alertes en direct</h3>
              <div className="space-y-3">
                {liveAlerts.map((alert, idx) => {
                  const Icon = alert.icon;
                  const severityColors = {
                    high: 'bg-red-50 border-red-300 text-red-900',
                    medium: 'bg-orange-50 border-orange-300 text-orange-900',
                    low: 'bg-yellow-50 border-yellow-300 text-yellow-900',
                  };

                  return (
                    <Card
                      key={idx}
                      className={`p-3 border ${severityColors[alert.severity as keyof typeof severityColors]}`}
                    >
                      <div className="flex items-start gap-2">
                        <Icon className="w-4 h-4 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{alert.location}</p>
                          <p className="text-xs mt-1">Retard: {alert.delay}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <h3 className="font-bold mb-2">⚡ Suggestion intelligente</h3>
              <p className="text-sm mb-3">
                Partez à 14h30 au lieu de 15h00 pour éviter 20 minutes de bouchons!
              </p>
              <Button variant="secondary" size="sm" className="w-full">
                Appliquer
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
