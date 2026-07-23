import { Car, PersonStanding, Bus, Bike, Users, Zap, Clock, Euro, Leaf, TrendingUp } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { TransportMode } from './HomeScreen';

interface RouteOption {
  mode: TransportMode;
  name: string;
  icon: typeof Car;
  duration: string;
  cost: string;
  co2: string;
  color: string;
  details: string[];
  recommended?: boolean;
}

interface RouteComparatorProps {
  origin: string;
  destination: string;
  onSelectMode: (mode: TransportMode) => void;
  onClose: () => void;
}

const routeOptions: RouteOption[] = [
  {
    mode: 'car',
    name: 'Voiture',
    icon: Car,
    duration: '25 min',
    cost: '8.50€',
    co2: '3.2 kg',
    color: 'bg-blue-500',
    details: ['Via A6', 'Péages: 2€', 'Parking: 6.50€'],
  },
  {
    mode: 'transit',
    name: 'Métro + Bus',
    icon: Bus,
    duration: '35 min',
    cost: '1.90€',
    co2: '0.4 kg',
    color: 'bg-purple-500',
    details: ['Ligne 1 → Ligne 4', '1 correspondance', 'Ticket t+'],
    recommended: true,
  },
  {
    mode: 'bike',
    name: 'Vélo',
    icon: Bike,
    duration: '40 min',
    cost: '0€',
    co2: '0 kg',
    color: 'bg-orange-500',
    details: ['Pistes cyclables', 'Dénivelé: +85m', 'Vélib dispo'],
  },
  {
    mode: 'scooter',
    name: 'Trottinette',
    icon: Zap,
    duration: '30 min',
    cost: '4.50€',
    co2: '0.2 kg',
    color: 'bg-pink-500',
    details: ['Lime disponible', '15 min inclus', 'Zones autorisées'],
  },
  {
    mode: 'carpool',
    name: 'Covoiturage',
    icon: Users,
    duration: '28 min',
    cost: '3.00€',
    co2: '0.8 kg',
    color: 'bg-indigo-500',
    details: ['BlaBlaCar', 'Départ: 14h30', 'Conducteur 4.8★'],
  },
  {
    mode: 'pedestrian',
    name: 'À pied',
    icon: PersonStanding,
    duration: '1h 45min',
    cost: '0€',
    co2: '0 kg',
    color: 'bg-green-500',
    details: ['8.2 km', 'Itinéraire direct', 'Zones piétonnes'],
  },
];

export function RouteComparator({ origin, destination, onSelectMode, onClose }: RouteComparatorProps) {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={onClose} className="mb-4">
            ← Retour
          </Button>
          <h1 className="text-3xl mb-2">Comparateur de trajets</h1>
          <p className="text-gray-600">
            De <span className="font-medium">{origin || 'Départ'}</span> à{' '}
            <span className="font-medium">{destination || 'Arrivée'}</span>
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-green-50 border-green-200">
            <Leaf className="w-6 h-6 text-green-600 mb-2" />
            <p className="text-sm text-gray-600">Plus écologique</p>
            <p className="font-semibold">Vélo / À pied</p>
          </Card>
          <Card className="p-4 bg-blue-50 border-blue-200">
            <Clock className="w-6 h-6 text-blue-600 mb-2" />
            <p className="text-sm text-gray-600">Plus rapide</p>
            <p className="font-semibold">Voiture</p>
          </Card>
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <Euro className="w-6 h-6 text-yellow-600 mb-2" />
            <p className="text-sm text-gray-600">Économique</p>
            <p className="font-semibold">Vélo / À pied</p>
          </Card>
          <Card className="p-4 bg-purple-50 border-purple-200">
            <TrendingUp className="w-6 h-6 text-purple-600 mb-2" />
            <p className="text-sm text-gray-600">Recommandé</p>
            <p className="font-semibold">Métro + Bus</p>
          </Card>
        </div>

        {/* Route options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {routeOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Card
                key={option.mode}
                className={`p-5 cursor-pointer hover:shadow-lg transition-all ${
                  option.recommended ? 'ring-2 ring-purple-500' : ''
                }`}
                onClick={() => onSelectMode(option.mode)}
              >
                {option.recommended && (
                  <Badge className="mb-3 bg-purple-500">⭐ Recommandé</Badge>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`${option.color} p-3 rounded-full text-white`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{option.name}</h3>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Durée</span>
                    </div>
                    <span className="font-semibold">{option.duration}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Euro className="w-4 h-4" />
                      <span className="text-sm">Coût</span>
                    </div>
                    <span className="font-semibold">{option.cost}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Leaf className="w-4 h-4" />
                      <span className="text-sm">CO2</span>
                    </div>
                    <span className="font-semibold">{option.co2}</span>
                  </div>
                </div>

                <div className="border-t pt-3 mb-4">
                  <ul className="space-y-1">
                    {option.details.map((detail, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start">
                        <span className="mr-2">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button className={`w-full ${option.color}`}>
                  Choisir ce mode
                </Button>
              </Card>
            );
          })}
        </div>

        {/* Multimodal suggestion */}
        <Card className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-indigo-200">
          <div className="flex items-start gap-4">
            <div className="bg-indigo-500 p-3 rounded-full text-white">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Mode Multimodal</h3>
              <p className="text-gray-700 mb-3">
                Combinez plusieurs modes pour un trajet optimal : Vélo (15min) + Métro (12min) + Marche (3min)
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" /> 30 min
                </span>
                <span className="flex items-center gap-1">
                  <Euro className="w-4 h-4" /> 1.90€
                </span>
                <span className="flex items-center gap-1">
                  <Leaf className="w-4 h-4" /> 0.1 kg CO2
                </span>
              </div>
              <Button className="mt-4 bg-indigo-500">Explorer le mode multimodal</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
