import { useState, useCallback, useRef, useEffect } from "react";
import {
  Menu, X, Mic, Search, Navigation, Compass, MapPin,
  Home, Briefcase, Users, Star, Calendar, Info,
  ParkingCircle, Share2, Trash2, Volume2, VolumeX,
  ChevronRight, LogOut, Settings, BarChart3, User, Loader2
} from "lucide-react";
import Map, { Marker, Source, Layer, NavigationControl, type MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useLanguage } from "../contexts/LanguageContext";
import { useCountry } from "../contexts/CountryContext";
import { useAuth } from "../contexts/AuthContext";
import { AnakaboLogo } from "./AnakaboLogo";
import type { TransportMode } from "./HomeScreen";

const TOKEN = "pk.eyJ1Ijoic2VwaGFuZSIsImEiOiJjbXFjdWlqZnkwcXU0MnJxeW10bDA3Ym12In0.PK_YiNQe-V3EHjbzJI12Kg";

async function geocode(query: string, proximity?: [number, number]): Promise<{ coords: [number, number]; label: string } | null> {
  const prox = proximity ? `&proximity=${proximity[0]},${proximity[1]}` : "";
  try {
    const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${TOKEN}&limit=1${prox}`);
    const data = await res.json();
    if (data.features?.length > 0) {
      const f = data.features[0];
      return { coords: [f.center[0], f.center[1]], label: f.place_name };
    }
  } catch { /* ignore */ }
  return null;
}

async function fetchSuggestions(query: string, proximity?: [number, number]): Promise<string[]> {
  if (query.length < 2) return [];
  const prox = proximity ? `&proximity=${proximity[0]},${proximity[1]}` : "";
  try {
    const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${TOKEN}&limit=5${prox}`);
    const data = await res.json();
    return (data.features ?? []).map((f: any) => f.place_name);
  } catch { return []; }
}

async function calcRoute(origin: [number, number], dest: [number, number], profile: string) {
  try {
    const res = await fetch(`https://api.mapbox.com/directions/v5/mapbox/${profile}/${origin[0]},${origin[1]};${dest[0]},${dest[1]}?geometries=geojson&access_token=${TOKEN}`);
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

const transportModes: { id: TransportMode; emoji: string; label: string }[] = [
  { id: "car", emoji: "🚗", label: "Voiture" },
  { id: "pedestrian", emoji: "🚶", label: "Pied" },
  { id: "bike", emoji: "🚲", label: "Vélo" },
  { id: "transit", emoji: "🚌", label: "Bus" },
  { id: "scooter", emoji: "🛴", label: "Scooter" },
  { id: "taxi", emoji: "🚕", label: "Taxi" },
];

interface WazeMapScreenProps {
  onOpenMetrics: () => void;
  onOpenPreferences: () => void;
  onLogout: () => void;
}

export function WazeMapScreen({ onOpenMetrics, onOpenPreferences, onLogout }: WazeMapScreenProps) {
  const { isVoiceEnabled, setVoiceEnabled, speak } = useLanguage();
  const { selectedCountry, mapCenter, mapZoom } = useCountry();
  const { user } = useAuth();

  const mapRef = useRef<MapRef>(null);
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recognitionRef = useRef<any>(null);

  const proximity: [number, number] = selectedCountry?.coordinates ?? mapCenter;

  const [viewState, setViewState] = useState({ longitude: mapCenter[0], latitude: mapCenter[1], zoom: mapZoom });
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null);
  const [destLabel, setDestLabel] = useState("");
  const [routeInfo, setRouteInfo] = useState<{ duration: number; distance: number; geojson: GeoJSON.FeatureCollection } | null>(null);
  const [selectedMode, setSelectedMode] = useState<TransportMode>("car");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [navigating, setNavigating] = useState(false);

  // Sync map center when country changes
  useEffect(() => {
    setViewState(v => ({ ...v, longitude: mapCenter[0], latitude: mapCenter[1], zoom: mapZoom }));
  }, [mapCenter, mapZoom]);

  // Fly to destination when route is set
  useEffect(() => {
    if (destCoords && mapRef.current) {
      const bounds: [[number, number], [number, number]] = [
        [Math.min(proximity[0], destCoords[0]) - 0.05, Math.min(proximity[1], destCoords[1]) - 0.05],
        [Math.max(proximity[0], destCoords[0]) + 0.05, Math.max(proximity[1], destCoords[1]) + 0.05],
      ];
      mapRef.current.fitBounds(bounds, { padding: 80, duration: 1200 });
    }
  }, [destCoords]);

  // Autocomplete
  useEffect(() => {
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    if (searchText.length < 2) { setSuggestions([]); return; }
    suggestTimer.current = setTimeout(async () => {
      setSuggestions(await fetchSuggestions(searchText, proximity));
    }, 300);
  }, [searchText]);

  const doSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setSuggestions([]);
    setSearchFocused(false);
    try {
      const result = await geocode(query, proximity);
      if (result) {
        setDestCoords(result.coords);
        setDestLabel(result.label);
        setSearchText(result.label.split(",")[0]);
        const route = await calcRoute(proximity, result.coords, modeProfiles[selectedMode]);
        if (route) {
          setRouteInfo(route);
          speak(`Itinéraire trouvé. ${route.duration} minutes, ${route.distance} kilomètres.`);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [proximity, selectedMode, speak]);

  const handleVoice = () => {
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Reconnaissance vocale non disponible."); return; }
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const rec = new SR();
    rec.lang = "fr-FR";
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setSearchText(text);
      doSearch(text);
    };
    recognitionRef.current = rec;
    rec.start();
  };

  const clearRoute = () => {
    setRouteInfo(null);
    setDestCoords(null);
    setDestLabel("");
    setSearchText("");
    setSuggestions([]);
    setNavigating(false);
  };

  const handleModeChange = async (mode: TransportMode) => {
    setSelectedMode(mode);
    if (destCoords) {
      setLoading(true);
      const route = await calcRoute(proximity, destCoords, modeProfiles[mode]);
      if (route) setRouteInfo(route);
      setLoading(false);
    }
  };

  const handleQuickAction = (address: string | undefined, label: string) => {
    if (!address) {
      alert(`Adresse "${label}" non configurée. Allez dans Préférences pour la définir.`);
      return;
    }
    setSearchText(address);
    doSearch(address);
  };

  const routeLayer: any = { id: "route", type: "line", layout: { "line-join": "round", "line-cap": "round" }, paint: { "line-color": "#2563EB", "line-width": 5, "line-opacity": 0.9 } };
  const routeCasing: any = { id: "route-casing", type: "line", layout: { "line-join": "round", "line-cap": "round" }, paint: { "line-color": "#1d4ed8", "line-width": 9, "line-opacity": 0.25 } };

  return (
    <div className="h-screen w-full relative overflow-hidden bg-gray-200">

      {/* ── MAPBOX MAP ── */}
      <div className="absolute inset-0 z-0">
        <Map
          ref={mapRef}
          {...viewState}
          onMove={e => setViewState(e.viewState)}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={TOKEN}
          style={{ width: "100%", height: "100%" }}
          attributionControl={false}
          onError={e => {
            if (e.error?.name === "AbortError") return;
            console.error("Mapbox error:", e.error);
          }}
        >
          <NavigationControl position="bottom-right" />

          {routeInfo && (
            <Source id="route-src" type="geojson" data={routeInfo.geojson}>
              <Layer {...routeCasing} />
              <Layer {...routeLayer} />
            </Source>
          )}

          {/* Origin marker */}
          <Marker longitude={proximity[0]} latitude={proximity[1]} anchor="bottom">
            <div className="bg-blue-600 rounded-full w-4 h-4 border-2 border-white shadow-lg" />
          </Marker>

          {/* Destination marker */}
          {destCoords && (
            <Marker longitude={destCoords[0]} latitude={destCoords[1]} anchor="bottom">
              <div className="flex flex-col items-center">
                <div className="bg-red-500 text-white rounded-full p-1.5 shadow-lg border-2 border-white">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="w-0.5 h-2 bg-red-500" />
              </div>
            </Marker>
          )}
        </Map>
      </div>

      {/* ── TOP BAR ── */}
      <div className="absolute top-0 left-0 right-0 z-20 p-3 flex items-start justify-between" style={{ pointerEvents: "none" }}>
        {/* Left: hamburger + logo */}
        <div className="flex items-center gap-2" style={{ pointerEvents: "auto" }}>
          <button
            onClick={() => setMenuOpen(true)}
            className="bg-white rounded-full w-11 h-11 flex items-center justify-center shadow-lg border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
          <div className="bg-white rounded-2xl px-3 py-2 shadow-md border border-gray-100 flex items-center gap-2">
            <AnakaboLogo size={26} />
            <span className="font-extrabold text-gray-900 text-sm tracking-widest">ANAKABO</span>
          </div>
        </div>

        {/* Right: voice + compass + user */}
        <div className="flex flex-col gap-2" style={{ pointerEvents: "auto" }}>
          <button
            onClick={() => setVoiceEnabled(!isVoiceEnabled)}
            className="bg-white rounded-full w-11 h-11 flex items-center justify-center shadow-lg border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            {isVoiceEnabled
              ? <Volume2 className="w-5 h-5 text-blue-600" />
              : <VolumeX className="w-5 h-5 text-gray-400" />}
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
      <div className="absolute bottom-0 left-0 right-0 z-20 px-3 pb-5 space-y-2.5">

        {/* Route info */}
        {routeInfo && !navigating && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{routeInfo.duration} min</p>
                  <p className="text-sm text-gray-500">{routeInfo.distance} km • {destLabel.split(",")[0]}</p>
                </div>
              </div>
              <button onClick={clearRoute} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <Trash2 className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <button
              onClick={() => { setNavigating(true); speak(`Navigation démarrée. ${routeInfo.duration} minutes.`); }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Navigation className="w-5 h-5" />
              Démarrer
            </button>
          </div>
        )}

        {/* Navigating banner */}
        {navigating && routeInfo && (
          <div className="bg-blue-600 rounded-2xl shadow-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-white font-bold text-lg">En navigation</p>
              <p className="text-blue-200 text-sm">{routeInfo.duration} min • {routeInfo.distance} km</p>
            </div>
            <button onClick={clearRoute} className="bg-white/20 text-white px-4 py-2 rounded-xl font-semibold hover:bg-white/30 transition-colors">
              Arrêter
            </button>
          </div>
        )}

        {/* Transport mode pills */}
        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {transportModes.map(m => (
            <button
              key={m.id}
              onClick={() => handleModeChange(m.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold whitespace-nowrap shadow-md border flex-shrink-0 transition-colors ${
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

        {/* Search card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-visible">
          {/* Autocomplete suggestions */}
          {searchFocused && suggestions.length > 0 && (
            <div className="border-b border-gray-100 max-h-48 overflow-y-auto">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onMouseDown={() => { setSuggestions([]); doSearch(s); }}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-3 border-b border-gray-50 last:border-0"
                >
                  <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span className="truncate">{s}</span>
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex items-center px-4 py-3.5 gap-3">
            {loading
              ? <Loader2 className="w-5 h-5 text-blue-500 animate-spin flex-shrink-0" />
              : <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />}
            <input
              type="text"
              placeholder="Où allons-nous ?"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              onKeyDown={e => e.key === "Enter" && doSearch(searchText)}
              className="flex-1 text-base text-gray-900 placeholder-gray-400 outline-none bg-transparent min-w-0"
            />
            {searchText && (
              <button onClick={clearRoute} className="p-1 hover:bg-gray-100 rounded-full flex-shrink-0">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
            <button
              onClick={handleVoice}
              className={`p-2 rounded-full flex-shrink-0 transition-colors ${listening ? "bg-red-100 text-red-600 animate-pulse" : "hover:bg-gray-100 text-gray-500"}`}
            >
              <Mic className="w-5 h-5" />
            </button>
            {searchText && !loading && (
              <button
                onClick={() => doSearch(searchText)}
                className="bg-blue-600 text-white px-4 py-1.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors flex-shrink-0"
              >
                Go
              </button>
            )}
          </div>

          {/* Quick actions */}
          {!routeInfo && (
            <div className="border-t border-gray-100 grid grid-cols-4 divide-x divide-gray-100">
              <button onClick={() => handleQuickAction(user?.preferences?.homeAddress, "Domicile")} className="flex flex-col items-center gap-1 py-3 hover:bg-blue-50 transition-colors">
                <Home className="w-5 h-5 text-blue-500" />
                <span className="text-xs text-gray-600">Domicile</span>
              </button>
              <button onClick={() => handleQuickAction(user?.preferences?.workAddress, "Travail")} className="flex flex-col items-center gap-1 py-3 hover:bg-blue-50 transition-colors">
                <Briefcase className="w-5 h-5 text-gray-500" />
                <span className="text-xs text-gray-600">Travail</span>
              </button>
              <button onClick={() => setMenuOpen(true)} className="flex flex-col items-center gap-1 py-3 hover:bg-blue-50 transition-colors">
                <Users className="w-5 h-5 text-gray-500" />
                <span className="text-xs text-gray-600">Amis</span>
              </button>
              <button onClick={() => doSearch("parking")} className="flex flex-col items-center gap-1 py-3 hover:bg-blue-50 transition-colors">
                <ParkingCircle className="w-5 h-5 text-gray-500" />
                <span className="text-xs text-gray-600">Parking</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── HAMBURGER MENU ── */}
      {menuOpen && (
        <>
          <div className="absolute inset-0 z-30 bg-black/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute top-0 left-0 bottom-0 z-40 w-72 bg-white shadow-2xl flex flex-col">
            <div className="p-5 bg-blue-600 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <AnakaboLogo size={32} />
                  <div>
                    <p className="font-extrabold tracking-widest">ANAKABO</p>
                    <p className="text-[10px] text-blue-200 tracking-widest uppercase">Navigation</p>
                  </div>
                </div>
                <button onClick={() => setMenuOpen(false)} className="p-1 hover:bg-white/20 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {user ? (
                <div className="flex items-center gap-3 bg-white/20 rounded-xl p-3">
                  <div className="w-9 h-9 bg-white/30 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-xs text-blue-200 truncate max-w-36">{user.email}</p>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
              {[
                { icon: Calendar, label: "Connecter le calendrier", action: () => setMenuOpen(false) },
                { icon: Users, label: "Aller chez des amis / famille", action: () => { setMenuOpen(false); } },
                { icon: Star, label: "Lieux enregistrés", action: () => { setMenuOpen(false); } },
                { icon: Share2, label: "Envoyer mon emplacement", action: () => {
                  if (navigator.share) {
                    navigator.share({ title: "Ma position Anakabo", text: `Lat: ${proximity[1].toFixed(4)}, Lng: ${proximity[0].toFixed(4)}` });
                  }
                  setMenuOpen(false);
                }},
                { icon: ParkingCircle, label: "Trouver un parking", action: () => { setMenuOpen(false); doSearch("parking"); } },
                { icon: Info, label: "Infos trafic", action: () => setMenuOpen(false) },
                { icon: BarChart3, label: "Statistiques", action: () => { setMenuOpen(false); onOpenMetrics(); } },
                { icon: Settings, label: "Préférences", action: () => { setMenuOpen(false); onOpenPreferences(); } },
                { icon: LogOut, label: "Déconnexion", action: () => { setMenuOpen(false); onLogout(); } },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={item.action}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <item.icon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <span className="text-sm text-gray-800 font-medium">{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
