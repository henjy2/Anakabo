import { useState, useCallback, useRef, useEffect } from "react";
import {
  Menu, X, Mic, Search, Navigation, Compass, MapPin,
  Home, Briefcase, Users, Star, Calendar, Info,
  ParkingCircle, Share2, Trash2, Volume2, VolumeX,
  ChevronRight, Car, PersonStanding, Bus, Bike, Package,
  LogOut, Settings, BarChart3, User
} from "lucide-react";
import { MapboxMap } from "./MapboxMap";
import { useLanguage } from "../contexts/LanguageContext";
import { useCountry } from "../contexts/CountryContext";
import { useAuth } from "../contexts/AuthContext";
import { AnakaboLogo } from "./AnakaboLogo";
import type { TransportMode } from "./HomeScreen";

const MAPBOX_TOKEN = "pk.eyJ1Ijoic2VwaGFuZSIsImEiOiJjbXFjdWlqZnkwcXU0MnJxeW10bDA3Ym12In0.PK_YiNQe-V3EHjbzJI12Kg";

async function geocode(query: string, proximity?: [number, number]): Promise<[number, number] | null> {
  const prox = proximity ? `&proximity=${proximity[0]},${proximity[1]}` : "";
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&limit=5${prox}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.features?.length > 0) {
      const [lng, lat] = data.features[0].center;
      return [lng, lat];
    }
  } catch { /* ignore */ }
  return null;
}

async function fetchSuggestions(query: string, proximity?: [number, number]): Promise<string[]> {
  if (query.length < 2) return [];
  const prox = proximity ? `&proximity=${proximity[0]},${proximity[1]}` : "";
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&limit=5${prox}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return (data.features ?? []).map((f: any) => f.place_name);
  } catch { return []; }
}

async function getRoute(origin: [number, number], dest: [number, number], profile: string) {
  const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${origin[0]},${origin[1]};${dest[0]},${dest[1]}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.routes?.length > 0) {
      const r = data.routes[0];
      return {
        duration: Math.round(r.duration / 60),
        distance: Math.round(r.distance / 100) / 10,
        geojson: { type: "FeatureCollection" as const, features: [{ type: "Feature" as const, properties: {}, geometry: r.geometry }] },
      };
    }
  } catch { /* ignore */ }
  return null;
}

const modeProfiles: Record<TransportMode, string> = {
  car: "driving-traffic", taxi: "driving", pedestrian: "walking",
  bike: "cycling", scooter: "cycling", carpool: "driving",
  motorcycle: "driving", transit: "driving", delivery: "driving",
  tourist: "walking", parent: "walking",
};

const modes: { id: TransportMode; emoji: string; label: string }[] = [
  { id: "car", emoji: "🚗", label: "Voiture" },
  { id: "pedestrian", emoji: "🚶", label: "Pied" },
  { id: "bike", emoji: "🚲", label: "Vélo" },
  { id: "transit", emoji: "🚌", label: "Bus" },
  { id: "scooter", emoji: "🛴", label: "Trottinette" },
  { id: "taxi", emoji: "🚕", label: "Taxi" },
];

interface WazeMapScreenProps {
  onOpenMetrics: () => void;
  onOpenPreferences: () => void;
  onLogout: () => void;
}

export function WazeMapScreen({ onOpenMetrics, onOpenPreferences, onLogout }: WazeMapScreenProps) {
  const { isVoiceEnabled, setVoiceEnabled, speak } = useLanguage();
  const { selectedCountry, mapCenter } = useCountry();
  const { user } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [originCoords, setOriginCoords] = useState<[number, number] | null>(null);
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ duration: number; distance: number; geojson: GeoJSON.FeatureCollection } | null>(null);
  const [selectedMode, setSelectedMode] = useState<TransportMode>("car");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [clickMode, setClickMode] = useState<"destination" | null>(null);
  const recognitionRef = useRef<any>(null);
  const suggestTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const proximity: [number, number] = selectedCountry?.coordinates ?? mapCenter;

  // Fetch autocomplete suggestions
  useEffect(() => {
    if (suggestTimeout.current) clearTimeout(suggestTimeout.current);
    if (searchText.length < 2) { setSuggestions([]); return; }
    suggestTimeout.current = setTimeout(async () => {
      const results = await fetchSuggestions(searchText, proximity);
      setSuggestions(results);
    }, 300);
  }, [searchText]);

  const handleSearch = useCallback(async (query?: string) => {
    const q = query ?? searchText;
    if (!q.trim()) return;
    setLoading(true);
    setSuggestions([]);
    try {
      const dest = await geocode(q, proximity);
      if (dest) {
        setDestCoords(dest);
        setSearchText(q);
        const route = await getRoute(proximity, dest, modeProfiles[selectedMode]);
        if (route) {
          setRouteInfo(route);
          speak(`Itinéraire calculé. ${route.duration} minutes, ${route.distance} kilomètres.`);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [searchText, selectedMode, proximity, speak]);

  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Reconnaissance vocale non disponible sur ce navigateur."); return; }
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const rec = new SpeechRecognition();
    rec.lang = "fr-FR";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setSearchText(text);
      handleSearch(text);
    };
    recognitionRef.current = rec;
    rec.start();
  };

  const handleMapClick = useCallback(({ lng, lat }: { lng: number; lat: number }) => {
    if (clickMode === "destination") {
      setDestCoords([lng, lat]);
      setSearchText(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      setClickMode(null);
      getRoute(proximity, [lng, lat], modeProfiles[selectedMode]).then(route => {
        if (route) setRouteInfo(route);
      });
    }
  }, [clickMode, proximity, selectedMode]);

  const clearRoute = () => {
    setRouteInfo(null);
    setDestCoords(null);
    setSearchText("");
    setOriginCoords(null);
    setSuggestions([]);
  };

  const quickActions = [
    { icon: Home, label: "Domicile", action: () => handleSearch(user?.preferences?.homeAddress ?? "Home") },
    { icon: Briefcase, label: "Travail", action: () => handleSearch(user?.preferences?.workAddress ?? "Work") },
    { icon: Users, label: "Amis", action: () => {} },
    { icon: Star, label: "Favoris", action: () => {} },
  ];

  const menuItems = [
    { icon: Calendar, label: "Connecter le calendrier", action: () => { setMenuOpen(false); } },
    { icon: Users, label: "Aller chez des amis / famille", action: () => { setMenuOpen(false); } },
    { icon: Star, label: "Lieux enregistrés", action: () => { setMenuOpen(false); } },
    { icon: Share2, label: "Envoyer mon emplacement", action: () => { setMenuOpen(false); } },
    { icon: ParkingCircle, label: "Trouver un parking", action: () => { setMenuOpen(false); handleSearch("parking"); } },
    { icon: Info, label: "Infos trafic", action: () => { setMenuOpen(false); } },
    { icon: BarChart3, label: "Statistiques", action: () => { setMenuOpen(false); onOpenMetrics(); } },
    { icon: Settings, label: "Préférences", action: () => { setMenuOpen(false); onOpenPreferences(); } },
    { icon: LogOut, label: "Déconnexion", action: () => { setMenuOpen(false); onLogout(); } },
  ];

  return (
    <div className="h-screen w-full relative overflow-hidden">

      {/* Full-screen map */}
      <div className="absolute inset-0">
        <MapboxMap
          origin={originCoords}
          destination={destCoords}
          routeGeoJSON={routeInfo?.geojson ?? null}
          onMapClick={handleMapClick}
          mode={selectedMode}
          height="100%"
        />
      </div>

      {/* ── TOP BAR ── */}
      <div className="absolute top-0 left-0 right-0 z-30 p-3 flex items-start justify-between pointer-events-none">
        {/* Hamburger + Logo */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => setMenuOpen(true)}
            className="bg-white rounded-full w-11 h-11 flex items-center justify-center shadow-lg border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
          <div className="bg-white rounded-2xl px-3 py-2 shadow-md border border-gray-100 flex items-center gap-2">
            <AnakaboLogo size={28} />
            <span className="font-bold text-gray-900 text-sm tracking-wide">ANAKABO</span>
          </div>
        </div>

        {/* Right controls */}
        <div className="pointer-events-auto flex flex-col gap-2">
          <button
            onClick={() => setVoiceEnabled(!isVoiceEnabled)}
            className="bg-white rounded-full w-11 h-11 flex items-center justify-center shadow-lg border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            {isVoiceEnabled ? <Volume2 className="w-5 h-5 text-blue-600" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
          </button>
          <button className="bg-white rounded-full w-11 h-11 flex items-center justify-center shadow-lg border border-gray-100 hover:bg-gray-50 transition-colors">
            <Compass className="w-5 h-5 text-gray-700" />
          </button>
          {user && (
            <button
              onClick={onOpenPreferences}
              className="bg-white rounded-full w-11 h-11 flex items-center justify-center shadow-lg border border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <User className="w-5 h-5 text-gray-700" />
            </button>
          )}
        </div>
      </div>

      {/* ── BOTTOM PANEL ── */}
      <div className="absolute bottom-0 left-0 right-0 z-30 px-3 pb-4 space-y-3">

        {/* Route info (when route computed) */}
        {routeInfo && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 mx-1">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{routeInfo.duration} min</p>
                  <p className="text-sm text-gray-500">{routeInfo.distance} km</p>
                </div>
                <div className="h-10 w-px bg-gray-200" />
                <div>
                  <p className="text-sm text-gray-500">CO₂ économisé</p>
                  <p className="text-sm font-medium text-green-600">{(routeInfo.distance * 0.14).toFixed(1)} kg</p>
                </div>
              </div>
              <button onClick={clearRoute} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <Trash2 className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <button
              onClick={() => speak(`Démarrage de la navigation. Durée estimée : ${routeInfo.duration} minutes.`)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Navigation className="w-5 h-5" />
              Démarrer la navigation
            </button>
          </div>
        )}

        {/* Mode selector pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {modes.map(m => (
            <button
              key={m.id}
              onClick={() => {
                setSelectedMode(m.id);
                if (destCoords) {
                  getRoute(proximity, destCoords, modeProfiles[m.id]).then(route => {
                    if (route) setRouteInfo(route);
                  });
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap shadow-md border transition-colors ${
                selectedMode === m.id
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-100 hover:bg-gray-50"
              }`}
            >
              <span>{m.emoji}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Suggestions */}
          {searchFocused && suggestions.length > 0 && (
            <div className="border-b border-gray-100">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onMouseDown={() => { setSearchText(s); handleSearch(s); setSearchFocused(false); }}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-50 last:border-0"
                >
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{s}</span>
                </button>
              ))}
            </div>
          )}

          {/* Input row */}
          <div className="flex items-center px-4 py-3 gap-3">
            <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Où allons-nous ?"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              className="flex-1 text-base text-gray-900 placeholder-gray-400 outline-none bg-transparent"
            />
            {searchText ? (
              <button onClick={clearRoute} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            ) : null}
            <button
              onClick={handleVoiceSearch}
              className={`p-2 rounded-full transition-colors ${listening ? "bg-red-100 text-red-600 animate-pulse" : "hover:bg-gray-100 text-gray-500"}`}
            >
              <Mic className="w-5 h-5" />
            </button>
            {searchText && (
              <button
                onClick={() => handleSearch()}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-1.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? "..." : "Go"}
              </button>
            )}
          </div>

          {/* Quick actions */}
          {!routeInfo && (
            <div className="border-t border-gray-100 grid grid-cols-4 divide-x divide-gray-100">
              {quickActions.map((a, i) => (
                <button
                  key={i}
                  onClick={a.action}
                  className="flex flex-col items-center gap-1 py-3 hover:bg-gray-50 transition-colors"
                >
                  <a.icon className="w-5 h-5 text-gray-500" />
                  <span className="text-xs text-gray-500">{a.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── HAMBURGER MENU ── */}
      {menuOpen && (
        <>
          <div className="absolute inset-0 z-40 bg-black/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute top-0 left-0 bottom-0 z-50 w-80 bg-white shadow-2xl flex flex-col">
            {/* Menu header */}
            <div className="p-5 bg-blue-600 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <AnakaboLogo size={36} />
                  <div>
                    <p className="font-bold text-lg tracking-wide">ANAKABO</p>
                    <p className="text-xs text-blue-200">Navigation</p>
                  </div>
                </div>
                <button onClick={() => setMenuOpen(false)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {user ? (
                <div className="flex items-center gap-3 bg-white/20 rounded-xl p-3">
                  <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-xs text-blue-200">{user.email}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white/20 rounded-xl p-3 text-sm">Connectez-vous pour plus de fonctionnalités</div>
              )}
            </div>

            {/* Menu items */}
            <div className="flex-1 overflow-y-auto py-2">
              {menuItems.map((item, i) => (
                <button
                  key={i}
                  onClick={item.action}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0"
                >
                  <item.icon className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  <span className="text-sm text-gray-800 font-medium">{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Click mode hint */}
      {clickMode && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-white rounded-xl shadow-xl px-5 py-3 text-sm font-medium text-gray-700">
          👆 Cliquez sur la carte pour définir la destination
        </div>
      )}
    </div>
  );
}
