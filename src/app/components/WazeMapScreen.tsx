import { useState, useCallback, useRef, useEffect } from "react";
import {
  Menu, X, Mic, Search, Navigation, Compass, MapPin,
  Home, Briefcase, Users, ParkingCircle, Share2, Trash2,
  Volume2, VolumeX, ChevronRight, LogOut, Settings,
  BarChart3, User, Loader2, Calendar, Star, Info
} from "lucide-react";
import { MapboxMap } from "./MapboxMap";
import { useLanguage } from "../contexts/LanguageContext";
import { useCountry } from "../contexts/CountryContext";
import { useAuth } from "../contexts/AuthContext";
import logoSrc from "@/imports/image-6.png";
import type { TransportMode } from "./HomeScreen";

// ── Free geocoding via Nominatim (OpenStreetMap) ──
async function geocode(query: string, lat?: number, lng?: number): Promise<{ coords: [number, number]; label: string } | null> {
  try {
    const viewbox = lat && lng ? `&viewbox=${lng - 5},${lat + 5},${lng + 5},${lat - 5}&bounded=0` : '';
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1${viewbox}`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'fr' } });
    const data = await res.json();
    if (data.length > 0) {
      return { coords: [parseFloat(data[0].lon), parseFloat(data[0].lat)], label: data[0].display_name };
    }
  } catch { /* ignore */ }
  return null;
}

async function fetchSuggestions(query: string): Promise<string[]> {
  if (query.length < 3) return [];
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'fr' } });
    const data = await res.json();
    return data.map((f: any) => f.display_name as string);
  } catch { return []; }
}

// ── Free routing via OSRM ──
const osrmProfiles: Record<TransportMode, string> = {
  car: 'driving', taxi: 'driving', carpool: 'driving',
  motorcycle: 'driving', delivery: 'driving', transit: 'driving',
  bike: 'bike', scooter: 'bike',
  pedestrian: 'foot', tourist: 'foot', parent: 'foot',
};

async function calcRoute(
  origin: [number, number],
  dest: [number, number],
  mode: TransportMode
): Promise<{ duration: number; distance: number; geojson: GeoJSON.FeatureCollection } | null> {
  const profile = osrmProfiles[mode];
  try {
    const url = `https://router.project-osrm.org/route/v1/${profile}/${origin[0]},${origin[1]};${dest[0]},${dest[1]}?geometries=geojson&overview=full`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.routes?.length > 0) {
      const r = data.routes[0];
      return {
        duration: Math.round(r.duration / 60),
        distance: Math.round(r.distance / 100) / 10,
        geojson: { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: r.geometry }] },
      };
    }
  } catch { /* ignore */ }
  return null;
}

const transportModes: { id: TransportMode; emoji: string; label: string }[] = [
  { id: 'car', emoji: '🚗', label: 'Voiture' },
  { id: 'pedestrian', emoji: '🚶', label: 'À pied' },
  { id: 'bike', emoji: '🚲', label: 'Vélo' },
  { id: 'transit', emoji: '🚌', label: 'Bus' },
  { id: 'scooter', emoji: '🛴', label: 'Scooter' },
  { id: 'taxi', emoji: '🚕', label: 'Taxi' },
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
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null);
  const [destLabel, setDestLabel] = useState('');
  const [routeInfo, setRouteInfo] = useState<{ duration: number; distance: number; geojson: GeoJSON.FeatureCollection } | null>(null);
  const [selectedMode, setSelectedMode] = useState<TransportMode>('car');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    if (searchText.length < 3) { setSuggestions([]); return; }
    suggestTimer.current = setTimeout(async () => {
      setSuggestions(await fetchSuggestions(searchText));
    }, 400);
    return () => { if (suggestTimer.current) clearTimeout(suggestTimer.current); };
  }, [searchText]);

  const doSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setSuggestions([]);
    setSearchFocused(false);
    try {
      const result = await geocode(query, proximity[1], proximity[0]);
      if (result) {
        setDestCoords(result.coords);
        setDestLabel(result.label.split(',')[0]);
        setSearchText(result.label.split(',')[0]);
        const route = await calcRoute(proximity, result.coords, selectedMode);
        if (route) {
          setRouteInfo(route);
          speak(`Itinéraire trouvé. ${route.duration} minutes, ${route.distance} kilomètres.`);
        } else {
          showToast('Impossible de calculer un itinéraire pour ce trajet.');
        }
      } else {
        showToast('Adresse introuvable. Essayez avec plus de détails.');
      }
    } finally {
      setLoading(false);
    }
  }, [proximity, selectedMode, speak]);

  const handleModeChange = useCallback(async (mode: TransportMode) => {
    setSelectedMode(mode);
    if (destCoords) {
      setLoading(true);
      const route = await calcRoute(proximity, destCoords, mode);
      if (route) setRouteInfo(route);
      setLoading(false);
    }
  }, [destCoords, proximity]);

  const handleMapClick = useCallback(({ lng, lat }: { lng: number; lat: number }) => {
    const coords: [number, number] = [lng, lat];
    setDestCoords(coords);
    const label = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    setDestLabel(label);
    setSearchText(label);
    calcRoute(proximity, coords, selectedMode).then(route => {
      if (route) { setRouteInfo(route); speak(`Itinéraire trouvé. ${route.duration} minutes.`); }
    });
  }, [proximity, selectedMode, speak]);

  const handleVoice = useCallback(() => {
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!SR) { showToast('Reconnaissance vocale non disponible sur ce navigateur.'); return; }
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const rec = new SR();
    rec.lang = 'fr-FR';
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onresult = (e: any) => { const text = e.results[0][0].transcript; setSearchText(text); doSearch(text); };
    recognitionRef.current = rec;
    rec.start();
  }, [listening, doSearch]);

  const clearRoute = useCallback(() => {
    setRouteInfo(null); setDestCoords(null); setDestLabel('');
    setSearchText(''); setSuggestions([]); setNavigating(false);
  }, []);

  const handleQuickAction = useCallback((address: string | undefined, label: string) => {
    if (!address) { showToast(`Adresse "${label}" non configurée. Allez dans Préférences.`); return; }
    doSearch(address);
  }, [doSearch]);

  const shareLocation = useCallback(() => {
    const text = `Ma position : https://www.openstreetmap.org/?mlat=${proximity[1]}&mlon=${proximity[0]}`;
    if (navigator.share) { navigator.share({ title: 'Ma position Anakabo', text }); }
    else if (navigator.clipboard) { navigator.clipboard.writeText(text); showToast('Lien copié !'); }
    setMenuOpen(false);
  }, [proximity]);

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
          <button onClick={() => setVoiceEnabled(!isVoiceEnabled)} style={btn()}>
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
        </div>
      </div>

      {/* BOTTOM PANEL */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, padding: '0 12px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Navigating */}
        {navigating && routeInfo && (
          <div style={{ background: '#2563EB', borderRadius: 18, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 20px rgba(37,99,235,0.4)' }}>
            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 18 }}>En navigation</div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>{routeInfo.duration} min · {routeInfo.distance} km · {destLabel}</div>
            </div>
            <button onClick={clearRoute} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', borderRadius: 12, padding: '8px 16px', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
              Arrêter
            </button>
          </div>
        )}

        {/* Route result */}
        {routeInfo && !navigating && (
          <div style={{ background: 'white', borderRadius: 18, padding: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#111' }}>{routeInfo.duration} <span style={{ fontSize: 16, fontWeight: 500, color: '#666' }}>min</span></div>
                <div style={{ fontSize: 13, color: '#666' }}>{routeInfo.distance} km · {destLabel}</div>
              </div>
              <button onClick={clearRoute} style={{ background: '#f5f5f5', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <Trash2 size={16} color="#999" />
              </button>
            </div>
            <button
              onClick={() => { setNavigating(true); speak(`Navigation démarrée vers ${destLabel}. ${routeInfo.duration} minutes.`); }}
              style={{ width: '100%', background: '#2563EB', color: 'white', border: 'none', borderRadius: 14, padding: '14px 0', fontWeight: 700, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Navigation size={20} /> Démarrer la navigation
            </button>
          </div>
        )}

        {/* Mode pills */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {transportModes.map(m => (
            <button key={m.id} onClick={() => handleModeChange(m.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0, cursor: 'pointer', border: 'none', background: selectedMode === m.id ? '#2563EB' : 'white', color: selectedMode === m.id ? 'white' : '#444', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
              <span>{m.emoji}</span><span>{m.label}</span>
            </button>
          ))}
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
              type="text"
              placeholder="Où allons-nous ?"
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

          {/* Quick actions */}
          {!routeInfo && (
            <div style={{ borderTop: '1px solid #f0f0f0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
              {[
                { icon: Home, label: 'Domicile', action: () => handleQuickAction(user?.preferences?.homeAddress, 'Domicile'), color: '#2563EB' },
                { icon: Briefcase, label: 'Travail', action: () => handleQuickAction(user?.preferences?.workAddress, 'Travail'), color: '#7C3AED' },
                { icon: Users, label: 'Amis', action: () => setMenuOpen(true), color: '#059669' },
                { icon: ParkingCircle, label: 'Parking', action: () => doSearch('parking'), color: '#D97706' },
              ].map((a, i) => (
                <button key={i} onClick={a.action} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '12px 4px', background: 'none', border: 'none', borderRight: i < 3 ? '1px solid #f0f0f0' : 'none', cursor: 'pointer' }}>
                  <a.icon size={20} color={a.color} />
                  <span style={{ fontSize: 11, color: '#555', fontWeight: 500 }}>{a.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* HAMBURGER MENU */}
      {menuOpen && (
        <>
          <div onClick={() => setMenuOpen(false)} style={{ position: 'absolute', inset: 0, zIndex: 20, background: 'rgba(0,0,0,0.45)' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, zIndex: 30, width: 280, background: 'white', boxShadow: '4px 0 32px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg,#3B82F6,#1E1B6B)', padding: '20px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: user ? 14 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img src={logoSrc} alt="Anakabo" style={{ width: 40, height: 40, objectFit: 'contain' }} />
                  <div>
                    <div style={{ fontWeight: 900, color: 'white', fontSize: 15 }}>Anakabo</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Mapp · Localise · Connecte</div>
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
            </div>

            {/* Items */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {[
                { icon: Calendar, label: 'Connecter le calendrier', action: () => { showToast('Fonctionnalité à venir'); setMenuOpen(false); } },
                { icon: Users, label: 'Aller chez des amis / famille', action: () => { showToast('Entrez le nom ou l\'adresse dans la recherche'); setMenuOpen(false); } },
                { icon: Star, label: 'Lieux enregistrés', action: () => { showToast('Fonctionnalité à venir'); setMenuOpen(false); } },
                { icon: Share2, label: 'Envoyer mon emplacement', action: shareLocation },
                { icon: ParkingCircle, label: 'Trouver un parking', action: () => { setMenuOpen(false); doSearch('parking'); } },
                { icon: Info, label: 'Infos trafic', action: () => { showToast('Infos trafic — Fonctionnalité à venir'); setMenuOpen(false); } },
                { icon: BarChart3, label: 'Statistiques', action: () => { setMenuOpen(false); onOpenMetrics(); } },
                { icon: Settings, label: 'Préférences', action: () => { setMenuOpen(false); onOpenPreferences(); } },
                { icon: LogOut, label: 'Déconnexion', action: () => { setMenuOpen(false); onLogout(); } },
              ].map((item, i) => (
                <button key={i} onClick={item.action} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '15px 18px', background: 'none', border: 'none', borderBottom: '1px solid #f5f5f5', cursor: 'pointer', textAlign: 'left' }}>
                  <item.icon size={20} color="#2563EB" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: '#222', fontWeight: 500, flex: 1 }}>{item.label}</span>
                  <ChevronRight size={16} color="#ccc" />
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
