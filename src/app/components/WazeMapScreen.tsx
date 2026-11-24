import { useState, useCallback, useRef, useEffect } from "react";
import {
  Menu, X, Mic, Search, Navigation, Compass, MapPin,
  Home, Briefcase, Users, ParkingCircle, Share2, Trash2,
  Volume2, VolumeX, ChevronRight, LogOut, Settings,
  BarChart3, User, Loader2, Calendar, Star, Info,
  Plus, ZoomIn, ZoomOut, Lightbulb, Clock, Layers,
  Fuel, Coffee, Cross, Landmark, ShoppingCart, Utensils,
} from "lucide-react";
import { MapboxMap, type MapboxMapRef } from "./MapboxMap";
import { useLanguage } from "../contexts/LanguageContext";
import { useCountry } from "../contexts/CountryContext";
import { useAuth } from "../contexts/AuthContext";
import logoSrc from "@/imports/image-6.png";
import { ALL_VOICE_LANGUAGES } from "../utils/voiceLanguages";
import { TripPlanningModal } from "./TripPlanningModal";
import { speakText } from "../utils/translations";
import type { TransportMode } from "./HomeScreen";

function formatAddress(item: any): string {
  const address = item?.address ?? {};
  const street = [address.house_number, address.road ?? address.pedestrian ?? address.footway]
    .filter(Boolean)
    .join(' ');
  const locality = address.city ?? address.town ?? address.village ?? address.municipality;
  const parts = [
    street,
    address.suburb ?? address.neighbourhood,
    locality,
    address.state,
    address.country,
  ].filter(Boolean);
  return parts.length > 1 ? Array.from(new Set(parts)).join(', ') : item?.display_name ?? parts[0] ?? '';
}

async function geocode(query: string, lat?: number, lng?: number, lang = 'fr'): Promise<{ coords: [number, number]; label: string } | null> {
  try {
    const viewbox = lat && lng ? `&viewbox=${lng - 5},${lat + 5},${lng + 5},${lat - 5}&bounded=0` : '';
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1${viewbox}`;
    const res = await fetch(url, { headers: { 'Accept-Language': lang } });
    const data = await res.json();
    if (data.length > 0) {
      return { coords: [parseFloat(data[0].lon), parseFloat(data[0].lat)], label: formatAddress(data[0]) };
    }
  } catch { /* ignore */ }
  return null;
}

async function fetchSuggestions(query: string, lang = 'fr'): Promise<string[]> {
  if (query.length < 3) return [];
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`;
    const res = await fetch(url, { headers: { 'Accept-Language': lang } });
    const data = await res.json();
    return data.map(formatAddress);
  } catch { return []; }
}

async function reverseGeocode(lng: number, lat: number, lang = 'fr'): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
    const res = await fetch(url, { headers: { 'Accept-Language': lang } });
    if (!res.ok) return null;
    return formatAddress(await res.json());
  } catch {
    return null;
  }
}

async function fetchNearby(query: string, lat: number, lng: number, lang = 'fr'): Promise<Array<{ label: string; coords: [number, number] }>> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=3&addressdetails=1&viewbox=${lng - 0.1},${lat + 0.1},${lng + 0.1},${lat - 0.1}&bounded=0`;
    const res = await fetch(url, { headers: { 'Accept-Language': lang } });
    const data = await res.json();
    return data.map((f: any) => ({
      label: formatAddress(f),
      coords: [parseFloat(f.lon), parseFloat(f.lat)] as [number, number],
    }));
  } catch { return []; }
}

const routingServers: Partial<Record<TransportMode, string>> = {
  car: 'routed-car',
  taxi: 'routed-car',
  carpool: 'routed-car',
  delivery: 'routed-car',
  motorcycle: 'routed-car',
  pedestrian: 'routed-foot',
  parent: 'routed-foot',
  tourist: 'routed-foot',
  bike: 'routed-bike',
  scooter: 'routed-bike',
};

function isRouteModeSupported(mode: TransportMode) {
  return typeof routingServers[mode] === 'string';
}

interface RouteStep {
  instruction: string;
  distance: number;
}

interface RouteResult {
  duration: number;
  distance: number;
  geojson: GeoJSON.FeatureCollection;
  steps: RouteStep[];
}

function routeInstruction(step: any): string {
  const name = step.name ? ` sur ${step.name}` : '';
  const modifier = step.maneuver?.modifier;
  const direction = modifier === 'left' || modifier === 'sharp left' || modifier === 'slight left'
    ? 'à gauche'
    : modifier === 'right' || modifier === 'sharp right' || modifier === 'slight right'
      ? 'à droite'
      : 'tout droit';
  switch (step.maneuver?.type) {
    case 'depart': return `Départ${name}`;
    case 'arrive': return 'Arrivée à destination';
    case 'turn': return `Tournez ${direction}${name}`;
    case 'roundabout':
    case 'rotary': return `Prenez le rond-point${name}`;
    case 'merge': return `Rejoignez la voie ${direction}${name}`;
    case 'fork': return `Prenez la bifurcation ${direction}${name}`;
    default: return `Continuez ${direction}${name}`;
  }
}

async function calcRoute(
  origin: [number, number],
  dest: [number, number],
  mode: TransportMode
): Promise<RouteResult | null> {
  const server = routingServers[mode];
  if (!server) return null;
  try {
    const url = `https://routing.openstreetmap.de/${server}/route/v1/driving/${origin[0]},${origin[1]};${dest[0]},${dest[1]}?geometries=geojson&overview=full&steps=true`;
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.routes?.length > 0) {
      const r = data.routes[0];
      return {
        duration: Math.round(r.duration / 60),
        distance: Math.round(r.distance / 100) / 10,
        geojson: { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: r.geometry }] },
        steps: (r.legs ?? []).flatMap((leg: any) => leg.steps ?? []).map((step: any) => ({
          instruction: routeInstruction(step),
          distance: Math.round(step.distance),
        })),
      };
    }
  } catch { /* ignore */ }
  return null;
}

const BASE_MODES: { id: TransportMode; emoji: string; label: string }[] = [
  { id: 'car', emoji: '🚗', label: 'Voiture' },
  { id: 'pedestrian', emoji: '🚶', label: 'À pied' },
  { id: 'bike', emoji: '🚲', label: 'Vélo' },
  { id: 'transit', emoji: '🚌', label: 'Bus' },
  { id: 'scooter', emoji: '🛴', label: 'Scooter' },
  { id: 'taxi', emoji: '🚕', label: 'Taxi' },
];

const EXTRA_MODES: { id: TransportMode; emoji: string; label: string }[] = [
  { id: 'motorcycle', emoji: '🏍️', label: 'Moto' },
  { id: 'carpool', emoji: '🚐', label: 'Covoiturage' },
  { id: 'delivery', emoji: '📦', label: 'Livraison' },
  { id: 'tourist', emoji: '🧳', label: 'Tourisme' },
  { id: 'parent', emoji: '👶', label: 'Poussette' },
  { id: 'boat', emoji: '⛵', label: 'Bateau' },
  { id: 'plane', emoji: '✈️', label: 'Avion' },
  { id: 'helicopter', emoji: '🚁', label: 'Hélicoptère' },
  { id: 'horse', emoji: '🐎', label: 'Cheval' },
];

// ALL_VOICE_LANGUAGES imported from voiceLanguages.ts

const SMART_SUGGESTIONS = [
  { icon: Fuel, key: 'gasStation', query: 'gas station fuel', color: '#F59E0B' },
  { icon: Utensils, key: 'restaurant', query: 'restaurant', color: '#EF4444' },
  { icon: Cross, key: 'pharmacy', query: 'pharmacy pharmacie', color: '#10B981' },
  { icon: Landmark, key: 'atm', query: 'ATM bank distributeur', color: '#6366F1' },
  { icon: ShoppingCart, key: 'supermarket', query: 'supermarket supermarche', color: '#8B5CF6' },
  { icon: Coffee, key: 'cafeLabel', query: 'cafe coffee', color: '#92400E' },
];

interface WazeMapScreenProps {
  onOpenMetrics: () => void;
  onOpenPreferences: () => void;
  onOpenSettings?: () => void;
  onLogout: () => void;
}

export function WazeMapScreen({ onOpenMetrics, onOpenPreferences, onOpenSettings, onLogout }: WazeMapScreenProps) {
  const { isVoiceEnabled, speak, language, t } = useLanguage();
  const { selectedCountry, mapCenter } = useCountry();
  const { user } = useAuth();

  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recognitionRef = useRef<any>(null);
  const mapRef = useRef<MapboxMapRef>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const hasLiveLocation = useRef(false);
  const proximity: [number, number] = selectedCountry?.coordinates ?? mapCenter;

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [originCoords, setOriginCoords] = useState<[number, number]>(proximity);
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null);
  const [destLabel, setDestLabel] = useState('');
  const [routeInfo, setRouteInfo] = useState<RouteResult | null>(null);
  const [selectedMode, setSelectedMode] = useState<TransportMode>('car');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [toast, setToast] = useState('');

  // New UI states
  const [showAddModePanel, setShowAddModePanel] = useState(false);
  const [extraModes, setExtraModes] = useState<typeof EXTRA_MODES>([]);
  const [showSmartSuggestions, setShowSmartSuggestions] = useState(false);
  const [smartResults, setSmartResults] = useState<Array<{ label: string; coords: [number, number]; category: string }>>([]);
  const [loadingSmarts, setLoadingSmarts] = useState(false);
  const [showSavedPlaces, setShowSavedPlaces] = useState(false);
  const [mapStyle, setMapStyle] = useState<'street' | 'satellite'>('street');
  const [showTripPlanning, setShowTripPlanning] = useState(false);
  const [speedLimit, setSpeedLimit] = useState<number | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    if (!hasLiveLocation.current) setOriginCoords(proximity);
  }, [proximity[0], proximity[1]]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      position => {
        hasLiveLocation.current = true;
        setOriginCoords([position.coords.longitude, position.coords.latitude]);
      },
      () => undefined,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  }, []);

  useEffect(() => {
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    if (searchText.length < 3) { setSuggestions([]); return; }
    suggestTimer.current = setTimeout(async () => {
      setSuggestions(await fetchSuggestions(searchText, language));
    }, 400);
    return () => { if (suggestTimer.current) clearTimeout(suggestTimer.current); };
  }, [searchText, language]);

  const doSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setSuggestions([]);
    setSearchFocused(false);
    setShowSmartSuggestions(false);
    try {
      const result = await geocode(query, proximity[1], proximity[0], language);
      if (result) {
        setDestCoords(result.coords);
        setDestLabel(result.label);
        setSearchText(result.label);
        if (!isRouteModeSupported(selectedMode)) {
          setRouteInfo(null);
          showToast(t('routeProviderRequired'));
          return;
        }
        const route = await calcRoute(originCoords, result.coords, selectedMode);
        if (route) {
          setRouteInfo(route);
          speak(speakText(language, 'routeFound', { dur: route.duration, dist: route.distance }));
        } else {
          showToast(t('routeCalcError'));
        }
      } else {
        showToast(t('addressNotFound'));
      }
    } finally {
      setLoading(false);
    }
  }, [proximity, originCoords, selectedMode, speak, language, t]);

  const handleModeChange = useCallback(async (mode: TransportMode) => {
    setSelectedMode(mode);
    if (!isRouteModeSupported(mode)) {
      setRouteInfo(null);
      showToast(t('routeProviderRequired'));
      return;
    }
    if (destCoords) {
      setLoading(true);
      const route = await calcRoute(originCoords, destCoords, mode);
      if (route) setRouteInfo(route);
      setLoading(false);
    }
  }, [destCoords, originCoords, t]);

  const handleMapClick = useCallback(async ({ lng, lat }: { lng: number; lat: number }) => {
    const coords: [number, number] = [lng, lat];
    setDestCoords(coords);
    const label = await reverseGeocode(lng, lat, language) ?? `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    setDestLabel(label);
    setSearchText(label);
    setShowSmartSuggestions(false);
    if (!isRouteModeSupported(selectedMode)) {
      setRouteInfo(null);
      showToast(t('routeProviderRequired'));
      return;
    }
    calcRoute(originCoords, coords, selectedMode).then(route => {
      if (route) { setRouteInfo(route); speak(speakText(language, 'routeFoundShort', { dur: route.duration })); }
    });
  }, [originCoords, selectedMode, speak, language, t]);

  const handleVoice = useCallback(() => {
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!SR) { showToast(t('voiceNotSupported')); return; }
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const rec = new SR();
    rec.lang = ALL_VOICE_LANGUAGES.find(item => item.code === language)?.bcp ?? language;
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onresult = (e: any) => { const text = e.results[0][0].transcript; setSearchText(text); doSearch(text); };
    recognitionRef.current = rec;
    rec.start();
  }, [listening, doSearch, language]);

  const clearRoute = useCallback(() => {
    setSpeedLimit(null);
    setRouteInfo(null); setDestCoords(null); setDestLabel('');
    setSearchText(''); setSuggestions([]); setNavigating(false);
    setShowSmartSuggestions(false); setSmartResults([]);
  }, []);

  const handleQuickAction = useCallback((address: string | undefined, label: string) => {
    if (!address) { showToast(t('addressNotConfigured')); return; }
    doSearch(address);
  }, [doSearch]);

  const shareLocation = useCallback(() => {
    setMenuOpen(false);
    const doShare = (lat: number, lon: number) => {
      const url = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}`;
      if (navigator.share) {
        navigator.share({ title: 'Ma position Anakabo', text: url, url });
      } else if (navigator.clipboard) {
        navigator.clipboard.writeText(url);
        showToast(speakText(language, 'linkCopied'));
      }
    };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => doShare(pos.coords.latitude, pos.coords.longitude),
        () => {
          showToast(t('locationPermissionDenied'));
          doShare(proximity[1], proximity[0]);
        }
      );
    } else {
      doShare(proximity[1], proximity[0]);
    }
  }, [proximity, language]);

  const handleSmartSuggestion = useCallback(async (query: string, category: string) => {
    setLoadingSmarts(true);
    setShowSmartSuggestions(true);
    const results = await fetchNearby(query, proximity[1], proximity[0], language);
    setSmartResults(results.map(r => ({ ...r, category })));
    setLoadingSmarts(false);
  }, [proximity]);

  const toggleExtraMode = (mode: typeof EXTRA_MODES[0]) => {
    setExtraModes(prev =>
      prev.find(m => m.id === mode.id)
        ? prev.filter(m => m.id !== mode.id)
        : [...prev, mode]
    );
  };

  const allModes = [...BASE_MODES, ...extraModes];

  const btn = (style = {}) => ({
    background: 'white', border: 'none', borderRadius: '50%',
    width: 44, height: 44, display: 'flex', alignItems: 'center',
    justifyContent: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
    cursor: 'pointer', ...style,
  } as React.CSSProperties);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>

      {/* MAP */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <MapboxMap
          ref={mapRef}
          mapStyle={mapStyle}
          origin={originCoords}
          destination={destCoords}
          routeGeoJSON={routeInfo?.geojson ?? null}
          onMapClick={handleMapClick}
          mode={selectedMode}
          height="100%"
        />
      </div>

      {/* TOAST */}
      {toast && (
        <div style={{ position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 50, background: '#1E1B6B', color: 'white', borderRadius: 12, padding: '10px 20px', fontSize: 13, fontWeight: 500, boxShadow: '0 4px 20px rgba(0,0,0,0.2)', whiteSpace: 'nowrap', maxWidth: '90vw', textAlign: 'center' }}>
          {toast}
        </div>
      )}

      {/* TOP BAR */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, padding: 12, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', pointerEvents: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, pointerEvents: 'auto' }}>
          <button onClick={() => setMenuOpen(true)} style={btn()}>
            <Menu size={20} color="#333" />
          </button>
          <div style={{ background: 'white', borderRadius: 16, padding: '6px 12px 6px 8px', boxShadow: '0 2px 12px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <img src={logoSrc} alt="Anakabo" style={{ width: 32, height: 32, objectFit: 'contain' }} />
            <div>
              <div style={{ fontWeight: 900, color: '#1E1B6B', fontSize: 13, letterSpacing: '0.08em' }}>Anakabo</div>
              <div style={{ fontSize: 8, color: '#3B82F6', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Navigation</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'auto' }}>
          <button
            onClick={() => (onOpenSettings ?? onOpenPreferences)()}
            title="Langue et guidage vocal dans Paramètres"
            style={{ ...btn(), background: isVoiceEnabled ? 'white' : '#f5f5f5' }}
          >
            {isVoiceEnabled ? <Volume2 size={20} color="#2563EB" /> : <VolumeX size={20} color="#aaa" />}
          </button>

          <button style={btn()}>
            <Compass size={20} color="#333" />
          </button>
          {user && (
            <button onClick={onOpenPreferences} style={btn()}>
              <User size={20} color="#333" />
            </button>
          )}

          {/* Zoom controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, background: 'white', borderRadius: 22, boxShadow: '0 2px 12px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
            <button
              onClick={() => mapRef.current?.zoomIn()}
              style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid #f0f0f0' }}
            >
              <ZoomIn size={20} color="#333" />
            </button>
            <button
              onClick={() => mapRef.current?.zoomOut()}
              style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <ZoomOut size={20} color="#333" />
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM PANEL */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, padding: '0 12px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Navigating */}
        {navigating && routeInfo && (
          <div style={{ background: '#2563EB', borderRadius: 18, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 20px rgba(37,99,235,0.4)' }}>
            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 18 }}>{t('routeOverview')}</div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>{routeInfo.duration} min · {routeInfo.distance} km · {destLabel}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {speedLimit && (
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'white', border: '4px solid #EF4444', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#111', lineHeight: 1 }}>{speedLimit}</div>
                  <div style={{ fontSize: 8, color: '#666', lineHeight: 1 }}>km/h</div>
                </div>
              )}
              <button onClick={clearRoute} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: 12, padding: '8px 16px', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
                {t('stopNav')}
              </button>
            </div>
          </div>
        )}

        {/* Route result */}
        {routeInfo && !navigating && (
          <div style={{ background: 'white', borderRadius: 18, padding: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#111' }}>{routeInfo.duration} <span style={{ fontSize: 16, fontWeight: 500, color: '#666' }}>min</span></div>
                <div style={{ fontSize: 13, color: '#666', lineHeight: 1.4 }}>{routeInfo.distance} km · {destLabel}</div>
              </div>
              <button onClick={clearRoute} style={{ background: '#f5f5f5', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Trash2 size={16} color="#999" />
              </button>
            </div>
            {routeInfo.steps.length > 0 && (
              <div style={{ maxHeight: 120, overflowY: 'auto', marginBottom: 12, border: '1px solid #E5E7EB', borderRadius: 12 }}>
                {routeInfo.steps.map((step, index) => (
                  <div key={`${step.instruction}-${index}`} style={{ display: 'flex', gap: 10, padding: '8px 10px', borderBottom: index < routeInfo.steps.length - 1 ? '1px solid #F1F5F9' : 'none', alignItems: 'flex-start' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: index === routeInfo.steps.length - 1 ? '#DCFCE7' : '#EFF6FF', color: index === routeInfo.steps.length - 1 ? '#15803D' : '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                      {index + 1}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#1F2937' }}>{step.instruction}</div>
                      {step.distance > 0 && <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 1 }}>{step.distance < 1000 ? `${step.distance} m` : `${(step.distance / 1000).toFixed(1)} km`}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => { setNavigating(true); speak(speakText(language, 'routeOverviewVoice', { dest: destLabel, dur: routeInfo.duration })); }}
              style={{ width: '100%', background: '#2563EB', color: 'white', border: 'none', borderRadius: 14, padding: '14px 0', fontWeight: 700, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Navigation size={20} /> {t('viewRouteOverview')}
            </button>
          </div>
        )}

        {/* Smart suggestions panel */}
        {showSmartSuggestions && (
          <div style={{ background: 'white', borderRadius: 18, padding: 14, boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Lightbulb size={16} color="#F59E0B" />
                <span style={{ fontWeight: 700, fontSize: 13, color: '#111' }}>{t('nearbySuggestions')}</span>
              </div>
              <button onClick={() => { setShowSmartSuggestions(false); setSmartResults([]); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <X size={16} color="#aaa" />
              </button>
            </div>
            {loadingSmarts ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 0', gap: 8 }}>
                <Loader2 size={18} color="#2563EB" style={{ animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: 13, color: '#666' }}>{t('searching')}</span>
              </div>
            ) : smartResults.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '12px 0', fontSize: 13, color: '#aaa' }}>{t('noResults')}</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {smartResults.map((r, i) => (
                  <button
                    key={i}
                    onMouseDown={() => {
                      setDestCoords(r.coords);
                      setDestLabel(r.label);
                      setSearchText(r.label);
                      setShowSmartSuggestions(false);
                      if (!isRouteModeSupported(selectedMode)) {
                        setRouteInfo(null);
                        showToast(t('routeProviderRequired'));
                        return;
                      }
                      calcRoute(proximity, r.coords, selectedMode).then(route => {
                        if (route) {
                          setRouteInfo(route);
                          speak(speakText(language, 'routeFoundShort', { dur: route.duration }));
                        }
                      });
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#F8FAFF', border: 'none', borderRadius: 12, cursor: 'pointer', textAlign: 'left' }}
                  >
                    <MapPin size={14} color="#2563EB" style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</div>
                      <div style={{ fontSize: 11, color: '#888' }}>{r.category}</div>
                    </div>
                    <ChevronRight size={14} color="#ccc" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add mode panel */}
        {showAddModePanel && (
          <div style={{ background: 'white', borderRadius: 18, padding: 14, boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: '#111' }}>{t('extraModes')}</span>
              <button onClick={() => setShowAddModePanel(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <X size={16} color="#aaa" />
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {EXTRA_MODES.map(m => {
                const active = !!extraModes.find(e => e.id === m.id);
                return (
                  <button
                    key={m.id}
                    onClick={() => toggleExtraMode(m)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: active ? '2px solid #2563EB' : '2px solid #e5e7eb', background: active ? '#EFF6FF' : 'white', color: active ? '#2563EB' : '#444' }}
                  >
                    <span>{m.emoji}</span><span>{t(m.id) || m.label}</span>
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: 11, color: '#aaa', marginTop: 10 }}>{t('pressToToggle')}</div>
          </div>
        )}

        {/* Mode pills + smart suggestion */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', alignItems: 'center' }}>
          {allModes.map(m => (
            <button key={m.id} onClick={() => handleModeChange(m.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0, cursor: 'pointer', border: 'none', background: selectedMode === m.id ? '#2563EB' : 'white', color: selectedMode === m.id ? 'white' : '#444', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
              <span>{m.emoji}</span><span>{t(m.id) || m.label}</span>
            </button>
          ))}
          {/* Add transport mode */}
          <button
            onClick={() => { setShowAddModePanel(v => !v); setShowSmartSuggestions(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0, cursor: 'pointer', border: '2px dashed #cbd5e1', background: showAddModePanel ? '#EFF6FF' : 'white', color: '#64748b', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
          >
            <Plus size={14} /> {t('add')}
          </button>
          {/* Smart suggestion */}
          <button
            onClick={() => { setShowSmartSuggestions(v => !v); setShowAddModePanel(false); if (!showSmartSuggestions) setSmartResults([]); }}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0, cursor: 'pointer', border: 'none', background: showSmartSuggestions ? '#FEF3C7' : 'white', color: '#D97706', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
          >
            <Lightbulb size={14} /> {t('suggestion')}
          </button>
        </div>

        {/* Search */}
        <div style={{ background: 'white', borderRadius: 18, boxShadow: '0 4px 24px rgba(0,0,0,0.14)', overflow: 'hidden' }}>
          {/* Suggestions */}
          {searchFocused && suggestions.length > 0 && (
            <div style={{ borderBottom: '1px solid #f0f0f0', maxHeight: 180, overflowY: 'auto' }}>
              {suggestions.map((s, i) => (
                <button key={i} onMouseDown={() => { setSuggestions([]); doSearch(s); }} style={{ width: '100%', textAlign: 'left', padding: '11px 16px', fontSize: 13, color: '#333', background: 'none', border: 'none', borderBottom: '1px solid #f8f8f8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <MapPin size={14} color="#2563EB" style={{ flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s}</span>
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', gap: 12 }}>
            {loading ? <Loader2 size={20} color="#2563EB" style={{ flexShrink: 0, animation: 'spin 1s linear infinite' }} /> : <Search size={20} color="#aaa" style={{ flexShrink: 0 }} />}
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              onKeyDown={e => { if (e.key === 'Enter') doSearch(searchText); }}
              style={{ flex: 1, fontSize: 16, color: '#111', background: 'transparent', border: 'none', outline: 'none', minWidth: 0 }}
            />
            {searchText && <button onClick={clearRoute} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}><X size={16} color="#aaa" /></button>}
            <button onClick={handleVoice} style={{ background: listening ? '#FEE2E2' : '#f5f5f5', border: 'none', borderRadius: '50%', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
              <Mic size={18} color={listening ? '#DC2626' : '#555'} />
            </button>
            {searchText && !loading && (
              <button onClick={() => doSearch(searchText)} style={{ background: '#2563EB', color: 'white', border: 'none', borderRadius: 10, padding: '8px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer', flexShrink: 0 }}>
                Go
              </button>
            )}
          </div>

          {/* Quick actions + smart suggestions grid */}
          {!routeInfo && (
            <>
              <div style={{ borderTop: '1px solid #f0f0f0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
                {[
                  { icon: Home, label: t('home'), action: () => handleQuickAction(user?.preferences?.homeAddress, t('home')), color: '#2563EB' },
                  { icon: Briefcase, label: t('work'), action: () => handleQuickAction(user?.preferences?.workAddress, t('work')), color: '#7C3AED' },
                  { icon: Users, label: t('friends'), action: () => setMenuOpen(true), color: '#059669' },
                  { icon: ParkingCircle, label: t('parkingLabel'), action: () => doSearch('parking'), color: '#D97706' },
                ].map((a, i) => (
                  <button key={i} onClick={a.action} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '12px 4px', background: 'none', border: 'none', borderRight: i < 3 ? '1px solid #f0f0f0' : 'none', cursor: 'pointer' }}>
                    <a.icon size={20} color={a.color} />
                    <span style={{ fontSize: 11, color: '#555', fontWeight: 500 }}>{a.label}</span>
                  </button>
                ))}
              </div>
              {/* Smart suggestion chips */}
              <div style={{ borderTop: '1px solid #f0f0f0', padding: '10px 12px', display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, fontSize: 11, color: '#F59E0B', fontWeight: 700 }}>
                  <Lightbulb size={12} /> {t('nearbySuggestions')} :
                </div>
                {SMART_SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSmartSuggestion(s.query, t(s.key))}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 99, background: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: 12, color: '#334155', cursor: 'pointer', flexShrink: 0, fontWeight: 500 }}
                  >
                    <s.icon size={12} color={s.color} />
                    {t(s.key)}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Close panels overlay */}
      {showAddModePanel && (
        <div onClick={() => setShowAddModePanel(false)} style={{ position: 'absolute', inset: 0, zIndex: 9 }} />
      )}

      {/* HAMBURGER MENU */}
      {menuOpen && (
        <>
          <div onClick={() => setMenuOpen(false)} style={{ position: 'absolute', inset: 0, zIndex: 20, background: 'rgba(0,0,0,0.45)' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, zIndex: 30, width: 280, background: 'white', boxShadow: '4px 0 32px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: 'linear-gradient(135deg,#3B82F6,#1E1B6B)', padding: '20px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: user ? 14 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img src={logoSrc} alt="Anakabo" style={{ width: 40, height: 40, objectFit: 'contain' }} />
                  <div>
                    <div style={{ fontWeight: 900, color: 'white', fontSize: 15 }}>Anakabo</div>
                  </div>
                </div>
                <button onClick={() => setMenuOpen(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={16} color="white" />
                </button>
              </div>
              {user && (
                <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.25)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={18} color="white" />
                  </div>
                  <div>
                    <div style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>{user.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 165 }}>{user.email}</div>
                  </div>
                </div>
              )}
              {/* Voice settings shortcut */}
              <button
                onClick={() => { setMenuOpen(false); (onOpenSettings ?? onOpenPreferences)(); }}
                style={{ marginTop: 10, width: '100%', display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '6px 10px', border: 'none', cursor: 'pointer', textAlign: 'left' }}
              >
                <Settings size={16} color="white" />
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, flex: 1 }}>{t('voiceGuide')} · {t('languages')}</span>
                <span style={{ fontSize: 11, color: isVoiceEnabled ? '#4ADE80' : '#F87171', fontWeight: 600 }}>{isVoiceEnabled ? 'ON' : 'OFF'}</span>
                <ChevronRight size={13} color="rgba(255,255,255,0.5)" />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {/* Saved places sub-panel */}
              {showSavedPlaces && (
                <div style={{ background: '#F0F7FF', borderBottom: '1px solid #DBEAFE', padding: '12px 16px' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#1E40AF', marginBottom: 10 }}>{t('savedPlacesLabel')}</div>
                  {user?.preferences?.homeAddress ? (
                    <button onClick={() => { setShowSavedPlaces(false); setMenuOpen(false); doSearch(user.preferences!.homeAddress!); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', background: 'white', border: '1px solid #DBEAFE', borderRadius: 10, cursor: 'pointer', marginBottom: 6, textAlign: 'left' }}>
                      <Home size={16} color="#2563EB" style={{ flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#111' }}>{t('home')}</div>
                        <div style={{ fontSize: 11, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 190 }}>{user.preferences.homeAddress}</div>
                      </div>
                    </button>
                  ) : null}
                  {user?.preferences?.workAddress ? (
                    <button onClick={() => { setShowSavedPlaces(false); setMenuOpen(false); doSearch(user.preferences!.workAddress!); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', background: 'white', border: '1px solid #DBEAFE', borderRadius: 10, cursor: 'pointer', marginBottom: 6, textAlign: 'left' }}>
                      <Briefcase size={16} color="#7C3AED" style={{ flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#111' }}>{t('work')}</div>
                        <div style={{ fontSize: 11, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 190 }}>{user.preferences.workAddress}</div>
                      </div>
                    </button>
                  ) : null}
                  {!user?.preferences?.homeAddress && !user?.preferences?.workAddress && (
                    <div style={{ fontSize: 12, color: '#64748B', padding: '6px 0' }}>
                      {t('noSavedPlaces')}
                    </div>
                  )}
                  <button onClick={() => setShowSavedPlaces(false)} style={{ marginTop: 4, fontSize: 12, color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>{t('close')} ↑</button>
                </div>
              )}

              {[
                {
                  icon: Calendar,
                  label: t('tripPlanning'),
                  sub: t('departure') + ' / ' + t('arrival'),
                  isLogout: false,
                  action: () => { setMenuOpen(false); setShowTripPlanning(true); },
                },
                {
                  icon: Users,
                  label: t('goToFriends'),
                  sub: t('searchAddress'),
                  isLogout: false,
                  action: () => {
                    setMenuOpen(false);
                    setTimeout(() => {
                      searchInputRef.current?.focus();
                      searchInputRef.current?.select();
                    }, 200);
                  },
                },
                {
                  icon: Star,
                  label: t('savedPlacesLabel'),
                  sub: user?.preferences?.homeAddress || user?.preferences?.workAddress ? t('homeWork') : t('noSavedPlaces'),
                  isLogout: false,
                  action: () => setShowSavedPlaces(v => !v),
                },
                {
                  icon: Share2,
                  label: t('shareLocationLabel'),
                  sub: t('sharePosition'),
                  isLogout: false,
                  action: shareLocation,
                },
                {
                  icon: ParkingCircle,
                  label: t('findParking'),
                  sub: t('searchNearby'),
                  isLogout: false,
                  action: () => { setMenuOpen(false); setSearchText('parking'); setTimeout(() => doSearch('parking'), 50); },
                },
                {
                  icon: Info,
                  label: t('trafficInfo'),
                  sub: t('comingSoon'),
                  isLogout: false,
                  action: () => { showToast(t('trafficSoon')); setMenuOpen(false); },
                },
                {
                  icon: BarChart3,
                  label: t('statsLabel'),
                  sub: t('appOverview'),
                  isLogout: false,
                  action: () => { setMenuOpen(false); onOpenMetrics(); },
                },
                {
                  icon: Settings,
                  label: t('prefsLabel'),
                  sub: t('prefsSubtitle'),
                  isLogout: false,
                  action: () => { setMenuOpen(false); (onOpenSettings ?? onOpenPreferences)(); },
                },
                {
                  icon: LogOut,
                  label: t('logout'),
                  sub: '',
                  isLogout: true,
                  action: () => { setMenuOpen(false); onLogout(); },
                },
              ].map((item, i) => (
                <button key={i} onClick={item.action} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '13px 18px', background: 'none', border: 'none', borderBottom: '1px solid #f5f5f5', cursor: 'pointer', textAlign: 'left' }}>
                  <item.icon size={20} color={item.isLogout ? '#EF4444' : '#2563EB'} style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, color: item.isLogout ? '#EF4444' : '#222', fontWeight: 500 }}>{item.label}</div>
                    {item.sub ? <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>{item.sub}</div> : null}
                  </div>
                  <ChevronRight size={16} color="#ccc" />
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      {showTripPlanning && (
        <TripPlanningModal
          onClose={() => setShowTripPlanning(false)}
          onConfirm={(msg: string) => { showToast(msg); setShowTripPlanning(false); }}
          t={t}
        />
      )}
    </div>
  );
}
