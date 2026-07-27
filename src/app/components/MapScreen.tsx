import { useState, useCallback } from 'react';
import { TransportMode } from './HomeScreen';
import {
  ArrowLeft,
  Search,
  Navigation,
  AlertTriangle,
  Fuel,
  ParkingCircle,
  Radio,
  Zap,
  MapPin,
  Clock,
  Leaf,
  Euro,
  ArrowLeftRight,
  Loader2,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { RouteComparator } from './RouteComparator';
import { useLanguage } from '../contexts/LanguageContext';
import { useCountry } from '../contexts/CountryContext';
import { useAuth } from '../contexts/AuthContext';
import { LanguageSelector } from './LanguageSelector';
import { CountrySelector } from './CountrySelector';
import { MapboxMap } from './MapboxMap';

const MAPBOX_TOKEN = 'pk.eyJ1Ijoic2VwaGFuZSIsImEiOiJjbXFjdWlqZnkwcXU0MnJxeW10bDA3Ym12In0.PK_YiNQe-V3EHjbzJI12Kg';

interface MapScreenProps {
  mode: TransportMode;
  onBack: () => void;
}

const modeConfig = {
  car: {
    name: 'Voiture',
    color: 'bg-blue-500',
    mapboxProfile: 'driving-traffic',
    alerts: [
      { icon: AlertTriangle, text: 'Bouchon 2km devant', type: 'warning' },
      { icon: Radio, text: 'Radar fixe dans 500m', type: 'danger' },
      { icon: Fuel, text: 'Station essence à 300m', type: 'info' },
    ],
    features: ['Itinéraires optimisés', 'Éviter les péages', 'Prix parkings'],
  },
  taxi: {
    name: 'Taxi',
    color: 'bg-amber-500',
    mapboxProfile: 'driving',
    alerts: [
      { icon: MapPin, text: 'Station taxi à 150m', type: 'info' },
      { icon: Clock, text: "Temps d'attente: 5min", type: 'info' },
    ],
    features: ['Prix estimé', 'Disponibilité en temps réel', 'Réservation'],
  },
  pedestrian: {
    name: 'Piétons',
    color: 'bg-green-500',
    mapboxProfile: 'walking',
    alerts: [
      { icon: AlertTriangle, text: 'Travaux rue Victor Hugo', type: 'warning' },
      { icon: MapPin, text: 'Passage clouté à 50m', type: 'info' },
    ],
    features: ['Trottoirs sécurisés', 'Temps de marche', 'Accessibilité PMR'],
  },
  transit: {
    name: 'Transports en commun',
    color: 'bg-purple-500',
    mapboxProfile: 'driving',
    alerts: [
      { icon: Clock, text: 'Bus ligne 12: retard 5min', type: 'warning' },
      { icon: AlertTriangle, text: 'Station fermée pour travaux', type: 'danger' },
    ],
    features: ['Horaires temps réel', 'Correspondances', 'Tarifs'],
  },
  scooter: {
    name: 'Trottinette',
    color: 'bg-pink-500',
    mapboxProfile: 'cycling',
    alerts: [
      { icon: Zap, text: '3 trottinettes disponibles', type: 'info' },
      { icon: AlertTriangle, text: 'Zone trottoir interdite', type: 'warning' },
    ],
    features: ['Zones autorisées', 'Stations recharge', 'Trottinettes dispo'],
  },
  carpool: {
    name: 'Covoiturage',
    color: 'bg-indigo-500',
    mapboxProfile: 'driving',
    alerts: [
      { icon: MapPin, text: 'Point de rencontre: 200m', type: 'info' },
      { icon: Leaf, text: 'Économie CO2: 15kg', type: 'success' },
      { icon: Euro, text: 'Économie: 12€', type: 'success' },
    ],
    features: ['Trajets partagés', 'Points rencontre', 'Économies CO2'],
  },
  motorcycle: {
    name: 'Moto',
    color: 'bg-red-500',
    mapboxProfile: 'driving',
    alerts: [
      { icon: AlertTriangle, text: 'Route mouillée glissante', type: 'danger' },
      { icon: Radio, text: 'Radar mobile signalé', type: 'warning' },
    ],
    features: ['Routes sinueuses', 'Zones stationnement', 'Météo route'],
  },
  bike: {
    name: 'Vélo',
    color: 'bg-orange-500',
    mapboxProfile: 'cycling',
    alerts: [
      { icon: MapPin, text: 'Piste cyclable à 100m', type: 'info' },
      { icon: AlertTriangle, text: 'Dénivelé important', type: 'warning' },
    ],
    features: ['Pistes cyclables', 'Dénivelé', 'Stations Vélib'],
  },
  delivery: {
    name: 'Livreur',
    color: 'bg-yellow-500',
    mapboxProfile: 'driving',
    alerts: [
      { icon: MapPin, text: '5 livraisons à proximité', type: 'info' },
      { icon: Clock, text: 'Temps optimisé: 45min', type: 'success' },
    ],
    features: ['Optimisation tournées', 'Zones livraison', 'Temps estimé'],
  },
  tourist: {
    name: 'Touriste',
    color: 'bg-teal-500',
    mapboxProfile: 'walking',
    alerts: [
      { icon: MapPin, text: 'Site touristique à 500m', type: 'info' },
      { icon: Clock, text: 'Musée ouvert jusqu\'à 18h', type: 'info' },
    ],
    features: ["Points d'intérêt", 'Horaires monuments', 'Audio guides'],
  },
  parent: {
    name: 'Parent',
    color: 'bg-rose-500',
    mapboxProfile: 'walking',
    alerts: [
      { icon: MapPin, text: 'Aire de jeux à 200m', type: 'info' },
      { icon: AlertTriangle, text: 'Trottoir sans rampe', type: 'warning' },
    ],
    features: ['Poussette-friendly', 'Aires de jeux', 'Toilettes bébé'],
  },
};

interface RouteInfo {
  duration: number;
  distance: number;
  geojson: GeoJSON.FeatureCollection;
}

async function geocode(query: string, proximity?: [number, number]): Promise<[number, number] | null> {
  const proximityParam = proximity ? `&proximity=${proximity[0]},${proximity[1]}` : '';
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&limit=1${proximityParam}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.features?.length > 0) {
      const [lng, lat] = data.features[0].center;
      return [lng, lat];
    }
  } catch (e) {
    console.error('Geocoding error', e);
  }
  return null;
}

async function getRoute(
  originCoords: [number, number],
  destCoords: [number, number],
  profile: string
): Promise<RouteInfo | null> {
  const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${originCoords[0]},${originCoords[1]};${destCoords[0]},${destCoords[1]}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.routes?.length > 0) {
      const route = data.routes[0];
      return {
        duration: Math.round(route.duration / 60),
        distance: Math.round(route.distance / 100) / 10,
        geojson: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: route.geometry,
            },
          ],
        },
      };
    }
  } catch (e) {
    console.error('Directions error', e);
  }
  return null;
}

export function MapScreen({ mode, onBack }: MapScreenProps) {
  const [originText, setOriginText] = useState('');
  const [destinationText, setDestinationText] = useState('');
  const [originCoords, setOriginCoords] = useState<[number, number] | null>(null);
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [showComparator, setShowComparator] = useState(false);
  const [clickMode, setClickMode] = useState<'origin' | 'destination' | null>(null);
  const { t, speak, language } = useLanguage();
  const { selectedCountry, mapCenter } = useCountry();
  const { saveRouteToHistory } = useAuth();

  const config = modeConfig[mode];

  const handleSearch = useCallback(async () => {
    if (!originText && !destinationText) return;
    setLoading(true);
    speak(t('search'));

    try {
      let oCords = originCoords;
      let dCords = destCoords;

      const proximity: [number, number] = selectedCountry?.coordinates ?? mapCenter;

      if (originText && !originCoords) {
        oCords = await geocode(originText, proximity);
        if (oCords) setOriginCoords(oCords);
      }

      if (destinationText && !destCoords) {
        dCords = await geocode(destinationText, proximity);
        if (dCords) setDestCoords(dCords);
      }

      if (oCords && dCords) {
        const route = await getRoute(oCords, dCords, config.mapboxProfile);
        if (route) {
          setRouteInfo(route);
          // Save route to Supabase history
          saveRouteToHistory({
            origin: originText,
            destination: destinationText,
            mode,
            duration: route.duration,
            distance: route.distance,
            country: selectedCountry?.code,
            language,
          });
        }
      }
    } finally {
      setLoading(false);
    }
  }, [originText, destinationText, originCoords, destCoords, config.mapboxProfile, speak, t, selectedCountry, mapCenter]);

  const handleMapClick = useCallback(({ lng, lat }: { lng: number; lat: number }) => {
    if (clickMode === 'origin') {
      setOriginCoords([lng, lat]);
      setOriginText(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      setClickMode(null);
    } else if (clickMode === 'destination') {
      setDestCoords([lng, lat]);
      setDestinationText(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      setClickMode(null);
    }
  }, [clickMode]);

  if (showComparator) {
    return (
      <RouteComparator
        origin={originText}
        destination={destinationText}
        onSelectMode={(newMode) => {
          onBack();
          setTimeout(() => {
            const event = new CustomEvent('selectMode', { detail: newMode });
            window.dispatchEvent(event);
          }, 0);
        }}
        onClose={() => setShowComparator(false)}
      />
    );
  }

  const alertColors = {
    warning: 'bg-yellow-50 border-yellow-300 text-yellow-800',
    danger: 'bg-red-50 border-red-300 text-red-800',
    info: 'bg-blue-50 border-blue-300 text-blue-800',
    success: 'bg-green-50 border-green-300 text-green-800',
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className={`${config.color} text-white p-4 shadow-lg relative z-10`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack} className="text-white hover:bg-white/20">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg">Navigation {config.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <CountrySelector />
            <LanguageSelector />
          </div>
        </div>

        {/* Country info badge */}
        {selectedCountry && (
          <div className="mb-2 flex items-center gap-2">
            <Badge className="bg-white/20 text-white border-white/30 text-xs">
              {selectedCountry.flag} {selectedCountry.name}
            </Badge>
            {selectedCountry.featuredPlace && (
              <Badge className="bg-white/20 text-white border-white/30 text-xs">
                ⭐ {selectedCountry.featuredPlace}
              </Badge>
            )}
          </div>
        )}

        {/* Click-on-map hint */}
        {clickMode && (
          <div className="mb-2 p-2 bg-white/20 rounded-lg text-sm text-center">
            👆 Cliquez sur la carte pour définir {clickMode === 'origin' ? "le départ" : "la destination"}
          </div>
        )}

        {/* Search */}
        <div className="space-y-2">
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder={t('startPoint')}
                value={originText}
                onChange={(e) => { setOriginText(e.target.value); setOriginCoords(null); setRouteInfo(null); }}
                className="pl-10 bg-white"
              />
            </div>
            <Button
              size="icon"
              variant="outline"
              className="bg-white shrink-0"
              onClick={() => setClickMode(clickMode === 'origin' ? null : 'origin')}
              title="Cliquer sur la carte"
            >
              <MapPin className={`w-4 h-4 ${clickMode === 'origin' ? 'text-green-600' : ''}`} />
            </Button>
          </div>
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder={t('destination')}
                value={destinationText}
                onChange={(e) => { setDestinationText(e.target.value); setDestCoords(null); setRouteInfo(null); }}
                className="pl-10 bg-white"
              />
            </div>
            <Button
              size="icon"
              variant="outline"
              className="bg-white shrink-0"
              onClick={() => setClickMode(clickMode === 'destination' ? null : 'destination')}
              title="Cliquer sur la carte"
            >
              <MapPin className={`w-4 h-4 ${clickMode === 'destination' ? 'text-red-600' : ''}`} />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              className="flex-1 bg-white text-gray-900 hover:bg-gray-100"
              onClick={handleSearch}
              disabled={loading || (!originText && !destinationText)}
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {t('search')}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="bg-white"
              onClick={() => setShowComparator(true)}
              title="Comparer les modes"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Map Area — real Mapbox */}
      <div className="flex-1 relative">
        <MapboxMap
          origin={originCoords}
          destination={destCoords}
          routeGeoJSON={routeInfo?.geojson ?? null}
          onMapClick={handleMapClick}
          mode={mode}
          height="100%"
        />

        {/* Alerts overlay */}
        <div className="absolute top-3 left-3 right-3 space-y-2 pointer-events-none">
          {config.alerts.map((alert, idx) => {
            const Icon = alert.icon;
            return (
              <Card
                key={idx}
                className={`p-2 flex items-center gap-2 border ${alertColors[alert.type as keyof typeof alertColors]} shadow-sm`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="text-xs">{alert.text}</span>
              </Card>
            );
          })}
        </div>

        {/* Route info */}
        {routeInfo && (
          <div className="absolute bottom-4 left-4 right-4">
            <Card className="p-4 bg-white shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Itinéraire calculé</h3>
                <Badge className={config.color}>Optimal</Badge>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center">
                  <Clock className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                  <p className="text-xs text-gray-500">{t('duration')}</p>
                  <p className="font-semibold">{routeInfo.duration} min</p>
                </div>
                <div className="text-center">
                  <Navigation className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                  <p className="text-xs text-gray-500">{t('distance')}</p>
                  <p className="font-semibold">{routeInfo.distance} km</p>
                </div>
                <div className="text-center">
                  <Leaf className="w-5 h-5 mx-auto mb-1 text-green-600" />
                  <p className="text-xs text-gray-500">CO2</p>
                  <p className="font-semibold">{(routeInfo.distance * 0.14).toFixed(1)} kg</p>
                </div>
              </div>

              <Button
                className={`w-full ${config.color}`}
                onClick={() => {
                  speak(t('startNavigation'));
                  const event = new CustomEvent('startNavigation', {
                    detail: { mode, destination: destinationText },
                  });
                  window.dispatchEvent(event);
                }}
              >
                {t('startNavigation')}
              </Button>

              <div className="mt-3 pt-3 border-t">
                <div className="flex flex-wrap gap-1">
                  {config.features.map((feature, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
