import { useState, useCallback, useRef, useEffect } from "react";
import {
  Menu, X, Mic, Search, Navigation, Compass, MapPin,
  Home, Briefcase, Users, Star, Calendar, Info,
  ParkingCircle, Share2, Trash2, Volume2, VolumeX,
  ChevronRight, LogOut, Settings, BarChart3, User, Loader2
} from "lucide-react";
import { MapboxMap } from "./MapboxMap";
import { useLanguage } from "../contexts/LanguageContext";
import { useCountry } from "../contexts/CountryContext";
import { useAuth } from "../contexts/AuthContext";
import { AnakaboLogo, AnakaboLogoFull } from "./AnakaboLogo";
import type { TransportMode } from "./HomeScreen";

const TOKEN = "pk.eyJ1Ijoic2VwaGFuZSIsImEiOiJjbXFjdWlqZnkwcXU0MnJxeW10bDA3Ym12In0.PK_YiNQe-V3EHjbzJI12Kg";

async function geocode(query: string, proximity?: [number, number]): Promise<{ coords: [number, number]; label: string } | null> {
  const prox = proximity ? `&proximity=${proximity[0]},${proximity[1]}` : "";
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${TOKEN}&limit=1${prox}`
    );
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
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${TOKEN}&limit=5${prox}`
    );
    const data = await res.json();
    return (data.features ?? []).map((f: any) => f.place_name as string);
  } catch { return []; }
}

async function calcRoute(
  origin: [number, number],
  dest: [number, number],
  profile: string
): Promise<{ duration: number; distance: number; geojson: GeoJSON.FeatureCollection } | null> {
  try {
    const res = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/${profile}/${origin[0]},${origin[1]};${dest[0]},${dest[1]}?geometries=geojson&access_token=${TOKEN}`
    );
    const data = await res.json();
    if (data.routes?.length > 0) {
      const r = data.routes[0];
      return {
        duration: Math.round(r.duration / 60),
        distance: Math.round(r.distance / 100) / 10,
        geojson: {
          type: "FeatureCollection",
          features: [{ type: "Feature", properties: {}, geometry: r.geometry }],
        },
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
  { id: "pedestrian", emoji: "🚶", label: "À pied" },
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
  const { selectedCountry, mapCenter } = useCountry();
  const { user } = useAuth();

  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recognitionRef = useRef<any>(null);
  const proximity: [number, number] = selectedCountry?.coordinates ?? mapCenter;

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
  const [clickMapMode, setClickMapMode] = useState(false);

  // Autocomplete suggestions
  useEffect(() => {
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    if (searchText.length < 2) { setSuggestions([]); return; }
    suggestTimer.current = setTimeout(async () => {
      setSuggestions(await fetchSuggestions(searchText, proximity));
    }, 350);
    return () => { if (suggestTimer.current) clearTimeout(suggestTimer.current); };
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

  const handleModeChange = useCallback(async (mode: TransportMode) => {
    setSelectedMode(mode);
    if (destCoords) {
      setLoading(true);
      const route = await calcRoute(proximity, destCoords, modeProfiles[mode]);
      if (route) setRouteInfo(route);
      setLoading(false);
    }
  }, [destCoords, proximity]);

  const handleMapClick = useCallback(({ lng, lat }: { lng: number; lat: number }) => {
    if (!clickMapMode) return;
    setClickMapMode(false);
    setDestCoords([lng, lat]);
    const label = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    setDestLabel(label);
    setSearchText(label);
    calcRoute(proximity, [lng, lat], modeProfiles[selectedMode]).then(route => {
      if (route) { setRouteInfo(route); speak(`Itinéraire trouvé. ${route.duration} minutes.`); }
    });
  }, [clickMapMode, proximity, selectedMode, speak]);

  const handleVoice = useCallback(() => {
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Reconnaissance vocale non disponible sur ce navigateur."); return; }
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
  }, [listening, doSearch]);

  const clearRoute = useCallback(() => {
    setRouteInfo(null);
    setDestCoords(null);
    setDestLabel("");
    setSearchText("");
    setSuggestions([]);
    setNavigating(false);
  }, []);

  const handleQuickAction = useCallback((address: string | undefined, label: string) => {
    if (!address) {
      alert(`Adresse "${label}" non configurée. Allez dans Préférences pour la définir.`);
      onOpenPreferences();
      return;
    }
    doSearch(address);
  }, [doSearch, onOpenPreferences]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh", overflow: "hidden" }}>

      {/* ── FULL-SCREEN MAP ── */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <MapboxMap
          origin={proximity}
          destination={destCoords}
          routeGeoJSON={routeInfo?.geojson ?? null}
          onMapClick={handleMapClick}
          mode={selectedMode}
          height="100%"
        />
      </div>

      {/* ── TOP BAR ── */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, padding: 12, display: "flex", alignItems: "flex-start", justifyContent: "space-between", pointerEvents: "none" }}>
        {/* Left */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, pointerEvents: "auto" }}>
          <button
            onClick={() => setMenuOpen(true)}
            style={{ background: "white", borderRadius: "50%", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.15)", border: "1px solid #f0f0f0", cursor: "pointer" }}
          >
            <Menu size={20} color="#333" />
          </button>
          <div style={{ background: "white", borderRadius: 16, padding: "8px 14px", boxShadow: "0 2px 12px rgba(0,0,0,0.12)", border: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: 8 }}>
            <AnakaboLogo size={28} />
            <div style={{ lineHeight: 1 }}>
              <div style={{ fontWeight: 900, color: "#1E1B6B", fontSize: 14, letterSpacing: "0.1em" }}>Anakabo</div>
              <div style={{ fontSize: 9, color: "#3B82F6", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase" }}>Navigation</div>
            </div>
          </div>
        </div>

        {/* Right */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, pointerEvents: "auto" }}>
          <button
            onClick={() => setVoiceEnabled(!isVoiceEnabled)}
            style={{ background: "white", borderRadius: "50%", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.15)", border: "1px solid #f0f0f0", cursor: "pointer" }}
          >
            {isVoiceEnabled ? <Volume2 size={20} color="#2563EB" /> : <VolumeX size={20} color="#999" />}
          </button>
          <button
            onClick={() => setClickMapMode(!clickMapMode)}
            style={{ background: clickMapMode ? "#2563EB" : "white", borderRadius: "50%", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.15)", border: "1px solid #f0f0f0", cursor: "pointer" }}
          >
            <Compass size={20} color={clickMapMode ? "white" : "#333"} />
          </button>
          {user && (
            <button
              onClick={onOpenPreferences}
              style={{ background: "white", borderRadius: "50%", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.15)", border: "1px solid #f0f0f0", cursor: "pointer" }}
            >
              <User size={20} color="#333" />
            </button>
          )}
        </div>
      </div>

      {/* Click-map hint */}
      {clickMapMode && (
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 10, background: "white", borderRadius: 12, padding: "10px 20px", boxShadow: "0 4px 20px rgba(0,0,0,0.2)", fontSize: 14, color: "#333", pointerEvents: "none" }}>
          👆 Cliquez sur la carte pour définir la destination
        </div>
      )}

      {/* ── BOTTOM PANEL ── */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10, padding: "0 12px 20px", display: "flex", flexDirection: "column", gap: 10 }}>

        {/* Navigating banner */}
        {navigating && routeInfo && (
          <div style={{ background: "#2563EB", borderRadius: 18, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 4px 20px rgba(37,99,235,0.4)" }}>
            <div>
              <div style={{ color: "white", fontWeight: 700, fontSize: 18 }}>En navigation</div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>{routeInfo.duration} min • {routeInfo.distance} km</div>
            </div>
            <button
              onClick={clearRoute}
              style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "none", borderRadius: 12, padding: "8px 16px", fontWeight: 600, cursor: "pointer" }}
            >
              Arrêter
            </button>
          </div>
        )}

        {/* Route info */}
        {routeInfo && !navigating && (
          <div style={{ background: "white", borderRadius: 18, padding: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.12)", border: "1px solid #f0f0f0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#111" }}>{routeInfo.duration} min</div>
                <div style={{ fontSize: 13, color: "#666" }}>{routeInfo.distance} km {destLabel ? `• ${destLabel.split(",")[0]}` : ""}</div>
              </div>
              <button onClick={clearRoute} style={{ background: "#f5f5f5", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Trash2 size={16} color="#999" />
              </button>
            </div>
            <button
              onClick={() => { setNavigating(true); speak(`Navigation démarrée. ${routeInfo.duration} minutes.`); }}
              style={{ width: "100%", background: "#2563EB", color: "white", border: "none", borderRadius: 14, padding: "14px 0", fontWeight: 700, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <Navigation size={20} />
              Démarrer la navigation
            </button>
          </div>
        )}

        {/* Transport mode pills */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2, scrollbarWidth: "none" }}>
          {transportModes.map(m => (
            <button
              key={m.id}
              onClick={() => handleModeChange(m.id)}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
                borderRadius: 999, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
                flexShrink: 0, cursor: "pointer", border: "none",
                background: selectedMode === m.id ? "#2563EB" : "white",
                color: selectedMode === m.id ? "white" : "#444",
                boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
              }}
            >
              <span>{m.emoji}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        {/* Search card */}
        <div style={{ background: "white", borderRadius: 18, boxShadow: "0 4px 24px rgba(0,0,0,0.14)", border: "1px solid #f0f0f0", overflow: "hidden" }}>
          {/* Suggestions */}
          {searchFocused && suggestions.length > 0 && (
            <div style={{ borderBottom: "1px solid #f0f0f0", maxHeight: 200, overflowY: "auto" }}>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onMouseDown={() => { setSuggestions([]); doSearch(s); }}
                  style={{ width: "100%", textAlign: "left", padding: "12px 16px", fontSize: 13, color: "#333", background: "none", border: "none", borderBottom: "1px solid #f8f8f8", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}
                >
                  <MapPin size={14} color="#2563EB" style={{ flexShrink: 0 }} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s}</span>
                </button>
              ))}
            </div>
          )}

          {/* Input row */}
          <div style={{ display: "flex", alignItems: "center", padding: "14px 16px", gap: 12 }}>
            {loading
              ? <Loader2 size={20} color="#2563EB" style={{ flexShrink: 0, animation: "spin 1s linear infinite" }} />
              : <Search size={20} color="#aaa" style={{ flexShrink: 0 }} />}
            <input
              type="text"
              placeholder="Où allons-nous ?"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              onKeyDown={e => { if (e.key === "Enter") doSearch(searchText); }}
              style={{ flex: 1, fontSize: 16, color: "#111", background: "transparent", border: "none", outline: "none", minWidth: 0 }}
            />
            {searchText && (
              <button onClick={clearRoute} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, flexShrink: 0 }}>
                <X size={16} color="#aaa" />
              </button>
            )}
            <button
              onClick={handleVoice}
              style={{ background: listening ? "#FEE2E2" : "#f5f5f5", border: "none", borderRadius: "50%", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
            >
              <Mic size={18} color={listening ? "#DC2626" : "#555"} />
            </button>
            {searchText && !loading && (
              <button
                onClick={() => doSearch(searchText)}
                style={{ background: "#2563EB", color: "white", border: "none", borderRadius: 10, padding: "8px 16px", fontWeight: 700, fontSize: 13, cursor: "pointer", flexShrink: 0 }}
              >
                Go
              </button>
            )}
          </div>

          {/* Quick actions */}
          {!routeInfo && (
            <div style={{ borderTop: "1px solid #f0f0f0", display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
              {[
                { icon: Home, label: "Domicile", action: () => handleQuickAction(user?.preferences?.homeAddress, "Domicile"), color: "#2563EB" },
                { icon: Briefcase, label: "Travail", action: () => handleQuickAction(user?.preferences?.workAddress, "Travail"), color: "#7C3AED" },
                { icon: Users, label: "Amis", action: () => setMenuOpen(true), color: "#059669" },
                { icon: ParkingCircle, label: "Parking", action: () => doSearch("parking"), color: "#D97706" },
              ].map((a, i) => (
                <button
                  key={i}
                  onClick={a.action}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "12px 4px", background: "none", border: i < 3 ? "none" : "none", borderRight: i < 3 ? "1px solid #f0f0f0" : "none", cursor: "pointer" }}
                >
                  <a.icon size={20} color={a.color} />
                  <span style={{ fontSize: 11, color: "#555", fontWeight: 500 }}>{a.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── HAMBURGER MENU ── */}
      {menuOpen && (
        <>
          <div
            onClick={() => setMenuOpen(false)}
            style={{ position: "absolute", inset: 0, zIndex: 20, background: "rgba(0,0,0,0.45)" }}
          />
          <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, zIndex: 30, width: 280, background: "white", boxShadow: "4px 0 32px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column" }}>
            {/* Header */}
            <div style={{ background: "linear-gradient(135deg, #3B82F6, #1E1B6B)", padding: "20px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <AnakaboLogo size={36} />
                  <div style={{ lineHeight: 1 }}>
                    <div style={{ fontWeight: 900, color: "white", fontSize: 16, letterSpacing: "0.1em" }}>Anakabo</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", letterSpacing: "0.2em", textTransform: "uppercase" }}>Mapp • Localise • Connecte</div>
                  </div>
                </div>
                <button onClick={() => setMenuOpen(false)} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <X size={16} color="white" />
                </button>
              </div>
              {user && (
                <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, background: "rgba(255,255,255,0.25)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <User size={18} color="white" />
                  </div>
                  <div>
                    <div style={{ color: "white", fontWeight: 600, fontSize: 14 }}>{user.name}</div>
                    <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>{user.email}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Items */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              {[
                { icon: Calendar, label: "Connecter le calendrier", action: () => setMenuOpen(false) },
                { icon: Users, label: "Aller chez des amis / famille", action: () => setMenuOpen(false) },
                { icon: Star, label: "Lieux enregistrés", action: () => setMenuOpen(false) },
                { icon: Share2, label: "Envoyer mon emplacement", action: () => {
                    navigator.share?.({ title: "Ma position Anakabo", text: `Lat: ${proximity[1].toFixed(4)}, Lng: ${proximity[0].toFixed(4)}` });
                    setMenuOpen(false);
                  }
                },
                { icon: ParkingCircle, label: "Trouver un parking", action: () => { setMenuOpen(false); doSearch("parking"); } },
                { icon: Info, label: "Infos trafic", action: () => setMenuOpen(false) },
                { icon: BarChart3, label: "Statistiques", action: () => { setMenuOpen(false); onOpenMetrics(); } },
                { icon: Settings, label: "Préférences", action: () => { setMenuOpen(false); onOpenPreferences(); } },
                { icon: LogOut, label: "Déconnexion", action: () => { setMenuOpen(false); onLogout(); } },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={item.action}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "15px 18px", background: "none", border: "none", borderBottom: "1px solid #f5f5f5", cursor: "pointer", textAlign: "left" }}
                >
                  <item.icon size={20} color="#2563EB" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: "#222", fontWeight: 500, flex: 1 }}>{item.label}</span>
                  <ChevronRight size={16} color="#ccc" />
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
