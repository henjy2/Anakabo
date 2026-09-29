import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { ALL_VOICE_LANGUAGES } from '../utils/voiceLanguages';
import {
  ChevronRight, ChevronLeft, X, Settings, Map, Volume2, AlertTriangle,
  Fuel, Bell, Clock, User, Lock, Info, Users,
  Check, ToggleLeft, ToggleRight, Sliders, Star,
  Mic, Smartphone, Navigation, Zap, Shield, Mail,
} from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────

const VEHICLE_ICONS = [
  '🚗','🚕','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚐',
  '🚚','🚛','🚜','🏍️','🛵','🚲','🛺','🚁','✈️','🚢',
  '⛵','🛶','🚀','🛸','🏰','🚂','🚆','🚊','🚉','🚞',
  '🛻','🚣','🚠','🚡','🚟','🚃','🚋','🚝','🚄','🚅',
  '🚈','🚇','🛩️','🚤','🛥️','⛴️','🚧','🏗️','🦽','🦼',
  '🛹','🛼','🛷','⛷️','🏂','🪂','🤿','🚵','🚴','🏇',
  '🚶','🧗','🏋️','🧘','🎿','🎣','🏊','🤽','🤾','⛹️',
  '🏌️','🛫','🛬','🤸','🤼','🤺','🏄',
];

const ALERT_TYPES: { key: string; label: string; hasSubTypes?: boolean }[] = [
  { key: 'accidents',   label: 'Accidents' },
  { key: 'works',       label: 'Travaux' },
  { key: 'traffic',     label: 'Bouchons' },
  { key: 'police',      label: 'Police' },
  { key: 'radars',      label: 'Radars', hasSubTypes: true },
  { key: 'objects',     label: 'Objets sur route' },
  { key: 'weather',     label: 'Météo' },
  { key: 'potholes',    label: 'Nids-de-poule' },
  { key: 'stoppedCar',  label: 'Voiture arrêtée' },
  { key: 'closedRoad',  label: 'Route barrée' },
  { key: 'blockedLane', label: 'Voie bloquée' },
  { key: 'closure',     label: 'Fermeture' },
  { key: 'flood',       label: 'Inondation' },
  { key: 'event',       label: 'Événement' },
  { key: 'animals',     label: 'Animaux' },
  { key: 'hazard',      label: 'Danger' },
];

const RADAR_SUBTYPES = [
  { key: 'fixed',        label: 'Fixe' },
  { key: 'mobile',       label: 'Mobile' },
  { key: 'zone',         label: 'Zone' },
  { key: 'redLight',     label: 'Feu rouge' },
  { key: 'bus',          label: 'Bus' },
  { key: 'train',        label: 'Train' },
  { key: 'avgSpeed',     label: 'Vitesse moyenne' },
  { key: 'checkpoint',   label: 'Point de contrôle' },
  { key: 'heavyVehicle', label: 'Poids lourd' },
  { key: 'school',       label: 'École' },
  { key: 'anonymous',    label: 'Anonyme' },
  { key: 'private',      label: 'Privé' },
];

const VOICES = [
  { id: 'fr-FR-F', label: 'Français France — Femme' },
  { id: 'fr-FR-M', label: 'Français France — Homme' },
  { id: 'fr-BE-F', label: 'Français Belgique — Femme' },
  { id: 'en-GB-F', label: 'Anglais britannique — Femme' },
  { id: 'en-GB-M', label: 'Anglais britannique — Homme' },
  { id: 'en-US-F', label: 'Anglais américain — Femme' },
  { id: 'en-US-M', label: 'Anglais américain — Homme' },
  { id: 'es-ES-F', label: 'Espagnol Espagne — Femme' },
  { id: 'es-MX-M', label: 'Espagnol Mexique — Homme' },
  { id: 'ar-SA-M', label: 'Arabe Arabie Saoudite — Homme' },
  { id: 'ar-MA-F', label: 'Arabe Maroc — Femme' },
  { id: 'pt-BR-F', label: 'Portugais Brésil — Femme' },
  { id: 'pt-PT-M', label: 'Portugais Portugal — Homme' },
  { id: 'de-DE-M', label: 'Allemand Allemagne — Homme' },
  { id: 'it-IT-F', label: 'Italien Italie — Femme' },
  { id: 'zh-CN-F', label: 'Chinois Mandarin — Femme' },
  { id: 'ja-JP-F', label: 'Japonais Japon — Femme' },
  { id: 'ru-RU-M', label: 'Russe Russie — Homme' },
];

const FUEL_TYPES = ['SP95','SP98','E10','E85','GPL','Gazole','GNV','Électrique','Hydrogène'];

const FUEL_BRANDS = [
  { value: 'all',     label: 'Toutes' },
  { value: 'Shell',   label: 'Shell' },
  { value: 'Total',   label: 'Total' },
  { value: 'BP',      label: 'BP' },
  { value: 'Esso',    label: 'Esso' },
  { value: 'Puma',    label: 'Puma' },
  { value: 'Oryx',    label: 'Oryx' },
  { value: 'Oilibya', label: 'Oilibya' },
  { value: 'Vivo',    label: 'Vivo' },
  { value: 'other',   label: 'Autre' },
];

// ── Types ─────────────────────────────────────────────────────────────────────

type AlertRecord = Record<string, { show: boolean; alert: boolean }>;

interface SettingsState {
  // General
  distanceUnit: 'km' | 'miles';
  preventAutoLock: boolean;
  keepInForeground: boolean;
  navigationOnLockScreen: boolean;
  personalizedNavigation: boolean;
  personalizedRoutes: boolean;
  showRouteSuggestions: boolean;
  receiveTrafficInfo: boolean;
  personalizedAds: boolean;
  // Map
  darkMode: 'never' | 'night' | 'always';
  mapView: '3D' | 'auto' | '2D';
  keepNorthUp: boolean;
  autoZoom: boolean;
  mapType: 'default' | 'editors';
  vehicleIcon: string;
  mapAlerts: AlertRecord;
  radarSubTypes: AlertRecord;
  trafficFlow: boolean;
  showSpeedometer: boolean;
  showSpeedLimit: 'never' | 'overspeed' | 'always';
  speedThresholdKmh: number;
  speedThresholdPercent: number;
  overspeedAlert: boolean;
  alwaysShowShortcuts: boolean;
  showZoom: boolean;
  // Voice
  selectedVoice: string;
  voiceInstructions: 'normal' | 'quiet' | 'alerts' | 'off';
  voiceReporting: boolean;
  voiceCommands: boolean;
  guidanceVolume: number;
  alwaysSpeaker: boolean;
  muteOnCall: boolean;
  showAudioPlayer: boolean;
  // Alerts
  alertDistance: 'all' | 'route' | '5' | '25' | '50' | '100' | '200';
  alertTypes: AlertRecord;
  // Fuel
  preferredFuels: string[];
  preferredBrand: string;
  sortStationsBy: 'price' | 'distance' | 'route';
  nearbyStations: boolean;
  suggestPriceUpdate: boolean;
  // Notifications
  pushNotifications: boolean;
  funAnnouncements: boolean;
  guidanceVoiceNotif: boolean;
  holidayTraffic: boolean;
  adTracking: boolean;
  delayNotifications: boolean;
  majorEvents: boolean;
  locationTrafficInfo: boolean;
  unusualTraffic: boolean;
  newsUpdates: boolean;
  plannedTripReminders: boolean;
  placeInfo: boolean;
  naturalDisasters: boolean;
  communityComments: boolean;
  // Reminders
  childReminder: boolean;
  departureReminder: 'none' | 'now' | '10min' | '30min' | 'custom';
  // Privacy
  visibleMode: boolean;
}

// ── Sub-components ────────────────────────────────────────────────────────────

const Toggle: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
  <div
    onClick={e => { e.stopPropagation(); onChange(); }}
    style={{
      width: 48, height: 28, borderRadius: 14,
      backgroundColor: checked ? '#3b82f6' : '#d1d5db',
      position: 'relative', cursor: 'pointer',
      transition: 'background-color 0.2s', flexShrink: 0,
    }}
  >
    <div style={{
      width: 22, height: 22, borderRadius: '50%', backgroundColor: '#fff',
      position: 'absolute', top: 3, left: checked ? 23 : 3,
      transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
    }} />
  </div>
);

const Divider: React.FC = () => <div style={{ height: 8, backgroundColor: '#f3f4f6' }} />;

const SectionHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    padding: '14px 16px 6px', fontSize: 11, fontWeight: 700,
    color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em',
    backgroundColor: '#f9fafb', borderBottom: '1px solid #f3f4f6',
  }}>
    {children}
  </div>
);

const SettingRow: React.FC<{
  label: string;
  description?: React.ReactNode;
  right?: React.ReactNode;
  onPress?: () => void;
  labelColor?: string;
}> = ({ label, description, right, onPress, labelColor }) => (
  <div
    onClick={onPress}
    style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '13px 16px', backgroundColor: '#fff',
      borderBottom: '1px solid #f3f4f6',
      cursor: onPress ? 'pointer' : 'default', gap: 12,
    }}
  >
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 14, color: labelColor ?? '#111827' }}>{label}</div>
      {description != null && (
        <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2, lineHeight: 1.45 }}>{description}</div>
      )}
    </div>
    {right}
  </div>
);

const RadioRow: React.FC<{ label: string; selected: boolean; onSelect: () => void }> = ({ label, selected, onSelect }) => (
  <div onClick={onSelect} style={{
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '11px 16px', backgroundColor: '#fff',
    borderBottom: '1px solid #f3f4f6', cursor: 'pointer',
  }}>
    <div style={{
      width: 20, height: 20, borderRadius: '50%',
      border: `2px solid ${selected ? '#3b82f6' : '#d1d5db'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      {selected && <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#3b82f6' }} />}
    </div>
    <span style={{ fontSize: 14, color: '#111827' }}>{label}</span>
  </div>
);

// ── Default settings ──────────────────────────────────────────────────────────

const makeDefaultAlerts = (): AlertRecord =>
  Object.fromEntries(ALERT_TYPES.map(({ key }) => [key, { show: true, alert: true }]));

const makeDefaultRadarSubTypes = (): AlertRecord =>
  Object.fromEntries(RADAR_SUBTYPES.map(({ key }) => [key, { show: true, alert: true }]));

const DEFAULT_SETTINGS: SettingsState = {
  distanceUnit: 'km',
  preventAutoLock: true,
  keepInForeground: true,
  navigationOnLockScreen: false,
  personalizedNavigation: true,
  personalizedRoutes: true,
  showRouteSuggestions: true,
  receiveTrafficInfo: true,
  personalizedAds: false,
  darkMode: 'night',
  mapView: '3D',
  keepNorthUp: false,
  autoZoom: true,
  mapType: 'default',
  vehicleIcon: '🚗',
  mapAlerts: makeDefaultAlerts(),
  radarSubTypes: makeDefaultRadarSubTypes(),
  trafficFlow: true,
  showSpeedometer: true,
  showSpeedLimit: 'overspeed',
  speedThresholdKmh: 10,
  speedThresholdPercent: 10,
  overspeedAlert: true,
  alwaysShowShortcuts: true,
  showZoom: true,
  selectedVoice: 'fr-FR-F',
  voiceInstructions: 'normal',
  voiceReporting: true,
  voiceCommands: true,
  guidanceVolume: 80,
  alwaysSpeaker: false,
  muteOnCall: true,
  showAudioPlayer: true,
  alertDistance: 'all',
  alertTypes: makeDefaultAlerts(),
  preferredFuels: ['SP95'],
  preferredBrand: 'all',
  sortStationsBy: 'price',
  nearbyStations: true,
  suggestPriceUpdate: true,
  pushNotifications: true,
  funAnnouncements: true,
  guidanceVoiceNotif: true,
  holidayTraffic: true,
  adTracking: false,
  delayNotifications: true,
  majorEvents: true,
  locationTrafficInfo: true,
  unusualTraffic: true,
  newsUpdates: true,
  plannedTripReminders: true,
  placeInfo: true,
  naturalDisasters: true,
  communityComments: true,
  childReminder: false,
  departureReminder: 'none',
  visibleMode: true,
};

// ── Main Component ────────────────────────────────────────────────────────────

interface SettingsScreenProps {
  onClose: () => void;
}

export function SettingsScreen({ onClose }: SettingsScreenProps) {
  const { t, language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();

  const [section, setSection] = useState<string | null>(null);
  const [settings, setSettings] = useState<SettingsState>(() => {
    try {
      const saved = localStorage.getItem('anakabo-settings');
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<SettingsState>;
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          mapAlerts: { ...makeDefaultAlerts(), ...(parsed.mapAlerts ?? {}) },
          radarSubTypes: { ...makeDefaultRadarSubTypes(), ...(parsed.radarSubTypes ?? {}) },
          alertTypes: { ...makeDefaultAlerts(), ...(parsed.alertTypes ?? {}) },
        };
      }
    } catch { /* ignore */ }
    return DEFAULT_SETTINGS;
  });
  const [expandedRadarMap, setExpandedRadarMap] = useState(false);
  const [expandedRadarAlert, setExpandedRadarAlert] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('anakabo-settings', JSON.stringify(settings));
    } catch { /* ignore */ }
  }, [settings]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // ── State helpers ────────────────────────────────────────────────────────────

  const set = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) =>
    setSettings(p => ({ ...p, [key]: value }));

  const tog = (key: keyof SettingsState) =>
    setSettings(p => ({ ...p, [key]: !(p[key] as boolean) }));

  const togMapAlert = (k: string, f: 'show' | 'alert') =>
    setSettings(p => ({
      ...p,
      mapAlerts: {
        ...p.mapAlerts,
        [k]: { ...p.mapAlerts[k], [f]: !(p.mapAlerts[k]?.[f] ?? true) },
      },
    }));

  const togRadarSub = (k: string, f: 'show' | 'alert') =>
    setSettings(p => ({
      ...p,
      radarSubTypes: {
        ...p.radarSubTypes,
        [k]: { ...p.radarSubTypes[k], [f]: !(p.radarSubTypes[k]?.[f] ?? true) },
      },
    }));

  const togAlertType = (k: string, f: 'show' | 'alert') =>
    setSettings(p => ({
      ...p,
      alertTypes: {
        ...p.alertTypes,
        [k]: { ...p.alertTypes[k], [f]: !(p.alertTypes[k]?.[f] ?? true) },
      },
    }));

  const togFuel = (fuel: string) =>
    setSettings(p => ({
      ...p,
      preferredFuels: p.preferredFuels.includes(fuel)
        ? p.preferredFuels.filter(f => f !== fuel)
        : [...p.preferredFuels, fuel],
    }));

  // ── Categories ───────────────────────────────────────────────────────────────

  const categories = [
    { id: 'general',       label: 'Général',         icon: <Settings   size={22} color="#fff" />, color: '#3b82f6' },
    { id: 'map',           label: 'Carte',            icon: <Map        size={22} color="#fff" />, color: '#22c55e' },
    { id: 'voice',         label: 'Voix & Son',       icon: <Volume2    size={22} color="#fff" />, color: '#a855f7' },
    { id: 'alerts',        label: 'Alertes',          icon: <AlertTriangle size={22} color="#fff" />, color: '#f97316' },
    { id: 'fuel',          label: 'Carburant',        icon: <Fuel       size={22} color="#fff" />, color: '#eab308' },
    { id: 'notifications', label: 'Notifs',           icon: <Bell       size={22} color="#fff" />, color: '#ef4444' },
    { id: 'reminders',     label: 'Rappels',          icon: <Clock      size={22} color="#fff" />, color: '#14b8a6' },
    { id: 'account',       label: 'Compte',           icon: <User       size={22} color="#fff" />, color: '#6366f1' },
    { id: 'privacy',       label: 'Confidentialité',  icon: <Lock       size={22} color="#fff" />, color: '#6b7280' },
    { id: 'about',         label: 'À propos',         icon: <Info       size={22} color="#fff" />, color: '#0ea5e9' },
    { id: 'invite',        label: 'Inviter',          icon: <Users      size={22} color="#fff" />, color: '#ec4899' },
  ];

  // ── Shared alert rows (used in Map and Alerts sections) ───────────────────────

  const renderAlertRows = (
    record: AlertRecord,
    onToggle: (k: string, f: 'show' | 'alert') => void,
    expanded: boolean,
    onExpand: () => void,
    radarRecord: AlertRecord,
    onRadarToggle: (k: string, f: 'show' | 'alert') => void,
  ) => (
    <>
      {ALERT_TYPES.map(({ key, label, hasSubTypes }) => (
        <React.Fragment key={key}>
          <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #f3f4f6' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
                {hasSubTypes && (
                  <div
                    onClick={onExpand}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                  >
                    <div style={{
                      transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s', display: 'flex',
                    }}>
                      <ChevronRight size={15} color="#9ca3af" />
                    </div>
                  </div>
                )}
                <span style={{ fontSize: 14, color: '#111827', fontWeight: hasSubTypes ? 500 : 400 }}>{label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <Toggle checked={record[key]?.show ?? true} onChange={() => onToggle(key, 'show')} />
                <Toggle checked={record[key]?.alert ?? true} onChange={() => onToggle(key, 'alert')} />
              </div>
            </div>
          </div>
          {hasSubTypes && expanded && (
            <div style={{ backgroundColor: '#f9fafb' }}>
              {RADAR_SUBTYPES.map(({ key: sk, label: sl }) => (
                <div key={sk} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 16px 8px 36px', borderBottom: '1px solid #f0f0f0',
                }}>
                  <span style={{ fontSize: 13, color: '#374151' }}>{sl}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <Toggle checked={radarRecord[sk]?.show ?? true} onChange={() => onRadarToggle(sk, 'show')} />
                    <Toggle checked={radarRecord[sk]?.alert ?? true} onChange={() => onRadarToggle(sk, 'alert')} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </React.Fragment>
      ))}
    </>
  );

  // ── Section: Général ─────────────────────────────────────────────────────────

  const renderGeneral = () => {
    const sortedLangs = [...ALL_VOICE_LANGUAGES].sort((a, b) =>
      a.label.localeCompare(b.label),
    );
    return (
      <div>
        <SectionHeader>Langue</SectionHeader>
        {sortedLangs.map(l => (
          <div
            key={l.code}
            onClick={() => setLanguage(l.code)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 16px', backgroundColor: '#fff',
              borderBottom: '1px solid #f3f4f6', cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>{l.flag}</span>
              <div>
                <div style={{ fontSize: 14, color: '#111827' }}>{l.label}</div>
                {l.native !== l.label && (
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>{l.native}</div>
                )}
              </div>
            </div>
            {language === l.code && <Check size={18} color="#3b82f6" />}
          </div>
        ))}

        <SectionHeader>Unités de distance</SectionHeader>
        <RadioRow label="Kilomètres (km)" selected={settings.distanceUnit === 'km'} onSelect={() => set('distanceUnit', 'km')} />
        <RadioRow label="Miles (mi)" selected={settings.distanceUnit === 'miles'} onSelect={() => set('distanceUnit', 'miles')} />

        <SectionHeader>Affichage</SectionHeader>
        <SettingRow
          label="Empêcher le verrouillage auto"
          right={<Toggle checked={settings.preventAutoLock} onChange={() => tog('preventAutoLock')} />}
        />
        <SettingRow
          label="Garder Anakabo en premier plan"
          right={<Toggle checked={settings.keepInForeground} onChange={() => tog('keepInForeground')} />}
        />
        <SettingRow
          label="Navigation sur écran verrouillé"
          right={<Toggle checked={settings.navigationOnLockScreen} onChange={() => tog('navigationOnLockScreen')} />}
        />

        <SectionHeader>Personnalisation</SectionHeader>
        <SettingRow
          label="Navigation personnalisée"
          description="Obtenez heures d'arrivée prévues personnalisées"
          right={<Toggle checked={settings.personalizedNavigation} onChange={() => tog('personalizedNavigation')} />}
        />
        <SettingRow
          label="Itinéraires personnalisés"
          description={
            <span>
              Itinéraires adaptés à vos habitudes de déplacement.{' '}
              <span
                onClick={e => e.stopPropagation()}
                style={{ color: '#ef4444', textDecoration: 'underline', fontSize: 9, cursor: 'pointer' }}
              >
                Fonctionnement
              </span>
            </span>
          }
          right={<Toggle checked={settings.personalizedRoutes} onChange={() => tog('personalizedRoutes')} />}
        />

        <SectionHeader>Suggestions de trajets</SectionHeader>
        <SettingRow
          label="Afficher des suggestions de trajets"
          right={<Toggle checked={settings.showRouteSuggestions} onChange={() => tog('showRouteSuggestions')} />}
        />

        <SectionHeader>Notifications</SectionHeader>
        <SettingRow
          label="Recevoir infos circulation"
          right={<Toggle checked={settings.receiveTrafficInfo} onChange={() => tog('receiveTrafficInfo')} />}
        />
        <SettingRow
          label="Personnalisation publicités"
          right={<Toggle checked={settings.personalizedAds} onChange={() => tog('personalizedAds')} />}
        />
      </div>
    );
  };

  // ── Section: Affichage de la carte ───────────────────────────────────────────

  const renderMap = () => (
    <div>
      <SectionHeader>Mode sombre</SectionHeader>
      <RadioRow label="Jamais"         selected={settings.darkMode === 'never'} onSelect={() => set('darkMode', 'never')} />
      <RadioRow label="Nuit uniquement" selected={settings.darkMode === 'night'} onSelect={() => set('darkMode', 'night')} />
      <RadioRow label="Toujours"        selected={settings.darkMode === 'always'} onSelect={() => set('darkMode', 'always')} />

      <SectionHeader>Vue carte</SectionHeader>
      <RadioRow label="3D"   selected={settings.mapView === '3D'}   onSelect={() => set('mapView', '3D')} />
      <RadioRow label="Auto" selected={settings.mapView === 'auto'} onSelect={() => set('mapView', 'auto')} />
      <RadioRow label="2D"   selected={settings.mapView === '2D'}   onSelect={() => set('mapView', '2D')} />

      <SectionHeader>Options</SectionHeader>
      <SettingRow label="Garder le nord en haut" right={<Toggle checked={settings.keepNorthUp} onChange={() => tog('keepNorthUp')} />} />
      <SettingRow label="Zoom automatique"        right={<Toggle checked={settings.autoZoom}    onChange={() => tog('autoZoom')} />} />

      <SectionHeader>Type de carte</SectionHeader>
      <RadioRow label="Par défaut" selected={settings.mapType === 'default'} onSelect={() => set('mapType', 'default')} />
      <SettingRow
        label="Éditeurs de carte"
        right={
          <Toggle
            checked={settings.mapType === 'editors'}
            onChange={() => set('mapType', settings.mapType === 'editors' ? 'default' : 'editors')}
          />
        }
      />

      <SectionHeader>Icône de véhicule</SectionHeader>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 4, padding: 12, backgroundColor: '#fff', borderBottom: '1px solid #f3f4f6',
      }}>
        {VEHICLE_ICONS.map(icon => (
          <div
            key={icon}
            onClick={() => set('vehicleIcon', icon)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 8, borderRadius: 8, cursor: 'pointer', fontSize: 22,
              backgroundColor: settings.vehicleIcon === icon ? '#eff6ff' : 'transparent',
              border: `2px solid ${settings.vehicleIcon === icon ? '#3b82f6' : 'transparent'}`,
            }}
          >
            {icon}
          </div>
        ))}
      </div>

      <SectionHeader>Afficher sur la carte</SectionHeader>
      <div style={{
        display: 'flex', justifyContent: 'flex-end', gap: 14,
        padding: '6px 16px 4px', backgroundColor: '#fff', borderBottom: '1px solid #f3f4f6',
      }}>
        <span style={{ fontSize: 10, color: '#6b7280', width: 48, textAlign: 'center' }}>Afficher</span>
        <span style={{ fontSize: 10, color: '#6b7280', width: 48, textAlign: 'center' }}>Alerter</span>
      </div>
      {renderAlertRows(
        settings.mapAlerts, togMapAlert,
        expandedRadarMap, () => setExpandedRadarMap(p => !p),
        settings.radarSubTypes, togRadarSub,
      )}

      <Divider />
      <SettingRow label="Flux de trafic" right={<Toggle checked={settings.trafficFlow} onChange={() => tog('trafficFlow')} />} />

      <SectionHeader>Compteur de vitesse</SectionHeader>
      <SettingRow
        label="Afficher le compteur"
        right={<Toggle checked={settings.showSpeedometer} onChange={() => tog('showSpeedometer')} />}
      />
      {settings.showSpeedometer && (
        <>
          <SectionHeader>Afficher limitation vitesse</SectionHeader>
          <RadioRow label="Masquer"        selected={settings.showSpeedLimit === 'never'}     onSelect={() => set('showSpeedLimit', 'never')} />
          <RadioRow label="Lors d'un excès" selected={settings.showSpeedLimit === 'overspeed'} onSelect={() => set('showSpeedLimit', 'overspeed')} />
          <RadioRow label="Toujours"        selected={settings.showSpeedLimit === 'always'}    onSelect={() => set('showSpeedLimit', 'always')} />

          <SectionHeader>Seuil d'excès (km/h)</SectionHeader>
          {([5, 10, 15, 20] as const).map(v => (
            <RadioRow key={v} label={`+${v} km/h`} selected={settings.speedThresholdKmh === v} onSelect={() => set('speedThresholdKmh', v)} />
          ))}

          <SectionHeader>Seuil d'excès (%)</SectionHeader>
          {([5, 10, 15] as const).map(v => (
            <RadioRow key={v} label={`${v}%`} selected={settings.speedThresholdPercent === v} onSelect={() => set('speedThresholdPercent', v)} />
          ))}

          <SettingRow
            label="Alerte en cas d'excès"
            right={<Toggle checked={settings.overspeedAlert} onChange={() => tog('overspeedAlert')} />}
          />
        </>
      )}

      <SectionHeader>Raccourcis de la carte</SectionHeader>
      <SettingRow label="Toujours afficher" right={<Toggle checked={settings.alwaysShowShortcuts} onChange={() => tog('alwaysShowShortcuts')} />} />
      <SettingRow label="Afficher zoom"      right={<Toggle checked={settings.showZoom}            onChange={() => tog('showZoom')} />} />
    </div>
  );

  // ── Section: Voix & Son ──────────────────────────────────────────────────────

  const renderVoice = () => (
    <div>
      <SectionHeader>Voix actuelle</SectionHeader>
      {VOICES.map(v => (
        <div
          key={v.id}
          onClick={() => set('selectedVoice', v.id)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '11px 16px', backgroundColor: '#fff',
            borderBottom: '1px solid #f3f4f6', cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Mic size={16} color="#9ca3af" />
            <span style={{ fontSize: 14, color: '#111827' }}>{v.label}</span>
          </div>
          {settings.selectedVoice === v.id && <Check size={18} color="#3b82f6" />}
        </div>
      ))}

      <SectionHeader>Instructions vocales</SectionHeader>
      <RadioRow label="Normal"           selected={settings.voiceInstructions === 'normal'} onSelect={() => set('voiceInstructions', 'normal')} />
      <RadioRow label="Moins bavard"     selected={settings.voiceInstructions === 'quiet'}  onSelect={() => set('voiceInstructions', 'quiet')} />
      <RadioRow label="Alertes uniquement" selected={settings.voiceInstructions === 'alerts'} onSelect={() => set('voiceInstructions', 'alerts')} />
      <RadioRow label="Désactivé"        selected={settings.voiceInstructions === 'off'}    onSelect={() => set('voiceInstructions', 'off')} />

      <SectionHeader>Commentaire vocal</SectionHeader>
      <SettingRow
        label="Signaler en parlant"
        description="Créez des signalements en utilisant votre voix pendant la navigation"
        right={<Toggle checked={settings.voiceReporting} onChange={() => tog('voiceReporting')} />}
      />
      <SettingRow
        label="Commandes vocales"
        description="Contrôlez Anakabo à la voix pour une utilisation mains libres"
        right={<Toggle checked={settings.voiceCommands} onChange={() => tog('voiceCommands')} />}
      />

      <SectionHeader>Son</SectionHeader>
      <div style={{ padding: '14px 16px', backgroundColor: '#fff', borderBottom: '1px solid #f3f4f6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Sliders size={16} color="#6b7280" />
          <span style={{ fontSize: 14, color: '#111827' }}>
            Volume du guidage — {settings.guidanceVolume}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={settings.guidanceVolume}
          onChange={e => set('guidanceVolume', Number(e.target.value))}
          style={{ width: '100%', accentColor: '#3b82f6', height: 4 }}
        />
      </div>
      <SettingRow
        label="Toujours haut-parleur"
        right={<Toggle checked={settings.alwaysSpeaker} onChange={() => tog('alwaysSpeaker')} />}
      />
      <SettingRow
        label="Couper Anakabo pendant appels"
        right={<Toggle checked={settings.muteOnCall} onChange={() => tog('muteOnCall')} />}
      />

      <SectionHeader>Lecteur audio</SectionHeader>
      <SettingRow
        label="Afficher sur carte"
        right={<Toggle checked={settings.showAudioPlayer} onChange={() => tog('showAudioPlayer')} />}
      />
    </div>
  );

  // ── Section: Alertes ─────────────────────────────────────────────────────────

  const renderAlerts = () => (
    <div>
      <SectionHeader>Distance d'alerte</SectionHeader>
      {(
        [
          { value: 'all',   label: 'Tous' },
          { value: 'route', label: 'Sur mon itinéraire uniquement' },
          { value: '5',     label: '5 km' },
          { value: '25',    label: '25 km' },
          { value: '50',    label: '50 km' },
          { value: '100',   label: '100 km' },
          { value: '200',   label: '200 km' },
        ] as { value: typeof settings.alertDistance; label: string }[]
      ).map(({ value, label }) => (
        <RadioRow
          key={value}
          label={label}
          selected={settings.alertDistance === value}
          onSelect={() => set('alertDistance', value)}
        />
      ))}

      <SectionHeader>Types d'alertes</SectionHeader>
      <div style={{
        display: 'flex', justifyContent: 'flex-end', gap: 14,
        padding: '6px 16px 4px', backgroundColor: '#fff', borderBottom: '1px solid #f3f4f6',
      }}>
        <span style={{ fontSize: 10, color: '#6b7280', width: 48, textAlign: 'center' }}>Afficher</span>
        <span style={{ fontSize: 10, color: '#6b7280', width: 48, textAlign: 'center' }}>Alerter</span>
      </div>
      {renderAlertRows(
        settings.alertTypes, togAlertType,
        expandedRadarAlert, () => setExpandedRadarAlert(p => !p),
        settings.radarSubTypes, togRadarSub,
      )}
    </div>
  );

  // ── Section: Station-service ─────────────────────────────────────────────────

  const renderFuel = () => (
    <div>
      <SectionHeader>Carburant préféré</SectionHeader>
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 8,
        padding: 16, backgroundColor: '#fff', borderBottom: '1px solid #f3f4f6',
      }}>
        {FUEL_TYPES.map(fuel => (
          <div
            key={fuel}
            onClick={() => togFuel(fuel)}
            style={{
              padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
              fontSize: 13, fontWeight: 500,
              backgroundColor: settings.preferredFuels.includes(fuel) ? '#3b82f6' : '#f3f4f6',
              color: settings.preferredFuels.includes(fuel) ? '#fff' : '#374151',
              border: `1px solid ${settings.preferredFuels.includes(fuel) ? '#3b82f6' : '#e5e7eb'}`,
              transition: 'all 0.15s',
            }}
          >
            {fuel}
          </div>
        ))}
      </div>

      <SectionHeader>Enseigne préférée</SectionHeader>
      {FUEL_BRANDS.map(({ value, label }) => (
        <RadioRow
          key={value}
          label={label}
          selected={settings.preferredBrand === value}
          onSelect={() => set('preferredBrand', value)}
        />
      ))}

      <SectionHeader>Trier les stations par</SectionHeader>
      <RadioRow label="Prix"      selected={settings.sortStationsBy === 'price'}    onSelect={() => set('sortStationsBy', 'price')} />
      <RadioRow label="Distance"  selected={settings.sortStationsBy === 'distance'} onSelect={() => set('sortStationsBy', 'distance')} />
      <RadioRow label="Itinéraire" selected={settings.sortStationsBy === 'route'}   onSelect={() => set('sortStationsBy', 'route')} />

      <Divider />
      <SettingRow
        label="Stations à proximité"
        right={<Toggle checked={settings.nearbyStations} onChange={() => tog('nearbyStations')} />}
      />
      <SettingRow
        label="Proposer de mettre à jour les prix"
        right={<Toggle checked={settings.suggestPriceUpdate} onChange={() => tog('suggestPriceUpdate')} />}
      />
    </div>
  );

  // ── Section: Notifications ───────────────────────────────────────────────────

  const renderNotifications = () => {
    const rows: { key: keyof SettingsState; label: string }[] = [
      { key: 'pushNotifications',    label: 'Toutes les notifications push' },
      { key: 'funAnnouncements',     label: 'Annonces ludiques' },
      { key: 'guidanceVoiceNotif',   label: 'Voix de guidage' },
      { key: 'holidayTraffic',       label: 'Trafic vacances et jours fériés' },
      { key: 'adTracking',           label: 'Suivi publicitaire Anakabo' },
      { key: 'delayNotifications',   label: 'Notifications de retard (embouteillages)' },
      { key: 'majorEvents',          label: 'Événement majeur' },
      { key: 'locationTrafficInfo',  label: 'Infos localisation / circulation' },
      { key: 'unusualTraffic',       label: 'Alertes trafic inhabituel' },
      { key: 'newsUpdates',          label: 'Nouveautés et mises à jour' },
      { key: 'plannedTripReminders', label: 'Rappels de trajets planifiés' },
      { key: 'placeInfo',            label: 'Infos sur les lieux Anakabo' },
      { key: 'naturalDisasters',     label: 'Catastrophes naturelles' },
      { key: 'communityComments',    label: 'Communauté et commentaires' },
    ];
    return (
      <div>
        {rows.map(({ key, label }) => (
          <SettingRow
            key={key}
            label={label}
            right={<Toggle checked={settings[key] as boolean} onChange={() => tog(key)} />}
          />
        ))}
      </div>
    );
  };

  // ── Section: Rappels ─────────────────────────────────────────────────────────

  const renderReminders = () => (
    <div>
      <SectionHeader>Rappel enfant</SectionHeader>
      <SettingRow
        label="Afficher le rappel enfant"
        description="Vous rappelle de vérifier la banquette arrière à la fin du trajet"
        right={<Toggle checked={settings.childReminder} onChange={() => tog('childReminder')} />}
      />

      <SectionHeader>Rappel de départ</SectionHeader>
      <RadioRow label="Aucun"              selected={settings.departureReminder === 'none'}   onSelect={() => set('departureReminder', 'none')} />
      <RadioRow label="Au moment de partir" selected={settings.departureReminder === 'now'}    onSelect={() => set('departureReminder', 'now')} />
      <RadioRow label="10 min avant"        selected={settings.departureReminder === '10min'}  onSelect={() => set('departureReminder', '10min')} />
      <RadioRow label="30 min avant"        selected={settings.departureReminder === '30min'}  onSelect={() => set('departureReminder', '30min')} />
      <RadioRow label="Personnalisé"        selected={settings.departureReminder === 'custom'} onSelect={() => set('departureReminder', 'custom')} />
    </div>
  );

  // ── Section: Compte & connexion ──────────────────────────────────────────────

  const renderAccount = () => (
    <div>
      <SectionHeader>Informations du compte</SectionHeader>
      {[
        { label: 'Nom complet',              value: user?.name  ?? 'Non renseigné' },
        { label: 'Email',                    value: user?.email ?? 'Non renseigné' },
        { label: "Nom d'utilisateur Anakabo", value: (user as any)?.username ?? (user?.email?.split('@')[0]) ?? 'Non renseigné' },
        { label: 'Mot de passe',             value: '••••••••' },
      ].map(({ label, value }) => (
        <div key={label} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '13px 16px', backgroundColor: '#fff', borderBottom: '1px solid #f3f4f6',
        }}>
          <div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 14, color: '#111827' }}>{value}</div>
          </div>
          <button
            style={{
              fontSize: 13, color: '#3b82f6', background: 'none', border: 'none',
              cursor: 'pointer', padding: '4px 8px', fontWeight: 500,
            }}
          >
            Modifier
          </button>
        </div>
      ))}

      <Divider />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button
          onClick={() => { logout(); onClose(); }}
          style={{
            width: '100%', padding: '13px 0', borderRadius: 10,
            backgroundColor: '#fef2f2', border: '1px solid #fecaca',
            color: '#ef4444', fontSize: 15, fontWeight: 600, cursor: 'pointer',
          }}
        >
          Se déconnecter
        </button>
        <button
          style={{
            background: 'none', border: 'none', color: '#ef4444',
            fontSize: 14, textDecoration: 'underline', cursor: 'pointer',
            padding: '4px 0',
          }}
        >
          Supprimer le compte
        </button>
      </div>
    </div>
  );

  // ── Section: Confidentialité ─────────────────────────────────────────────────

  const renderPrivacy = () => (
    <div>
      <SectionHeader>Personnalisation</SectionHeader>
      <SettingRow
        label="Navigation personnalisée"
        description="Obtenez heures d'arrivée prévues personnalisées"
        right={<Toggle checked={settings.personalizedNavigation} onChange={() => tog('personalizedNavigation')} />}
      />
      <SettingRow
        label="Itinéraires personnalisés"
        description="Itinéraires adaptés à vos habitudes de déplacement"
        right={<Toggle checked={settings.personalizedRoutes} onChange={() => tog('personalizedRoutes')} />}
      />

      <SectionHeader>Visibilité de la carte</SectionHeader>
      <SettingRow
        label="Mode visible"
        description="Autorisez Anakabo à partager votre position avec la communauté"
        right={<Toggle checked={settings.visibleMode} onChange={() => tog('visibleMode')} />}
      />

      <SectionHeader>Activité</SectionHeader>
      <SettingRow
        label="Historique de navigation"
        right={<ChevronRight size={18} color="#9ca3af" />}
        onPress={() => {}}
      />
      <SettingRow
        label="Adresses récentes"
        right={<ChevronRight size={18} color="#9ca3af" />}
        onPress={() => {}}
      />

      <SectionHeader>Information du compte</SectionHeader>
      <SettingRow
        label="Compte et connexion"
        right={<ChevronRight size={18} color="#9ca3af" />}
        onPress={() => setSection('account')}
      />
      <div
        onClick={() => {}}
        style={{
          padding: '13px 16px', backgroundColor: '#fff',
          borderBottom: '1px solid #f3f4f6', cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: 14, color: '#ef4444' }}>Supprimer le compte</span>
      </div>
    </div>
  );

  // ── Section: À propos ────────────────────────────────────────────────────────

  const renderAbout = () => (
    <div>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '32px 16px 24px', backgroundColor: '#fff', borderBottom: '1px solid #f3f4f6',
      }}>
        <div style={{
          width: 76, height: 76, borderRadius: 20, backgroundColor: '#3b82f6',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 14, fontSize: 38, boxShadow: '0 4px 16px rgba(59,130,246,0.35)',
        }}>
          🧭
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>Anakabo</div>
        <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>Version 1.0.0</div>
      </div>

      <div style={{ padding: '16px 16px', backgroundColor: '#fff', borderBottom: '1px solid #f3f4f6' }}>
        <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.65, margin: 0 }}>
          Anakabo est votre compagnon de navigation intelligent, communautaire et temps réel.
          Conçu pour des trajets plus fluides, plus sûrs et mieux informés — partout en Afrique et au-delà.
        </p>
      </div>

      <SectionHeader>Légal</SectionHeader>
      {["Conditions d'utilisation", "Politique de confidentialité", "Licences open source"].map(label => (
        <SettingRow
          key={label}
          label={label}
          right={<ChevronRight size={18} color="#9ca3af" />}
          onPress={() => {}}
        />
      ))}

      <div style={{
        padding: '28px 16px', textAlign: 'center',
        fontSize: 12, color: '#d1d5db', lineHeight: 1.6,
      }}>
        © 2024–2026 Anakabo. Tous droits réservés.{'\n'}
        Fait avec ❤️ pour les conducteurs africains.
      </div>
    </div>
  );

  // ── Section: Inviter des amis ────────────────────────────────────────────────

  const renderInvite = () => {
    const shareApps = [
      { label: 'Email',     bg: '#6b7280', node: <Mail size={24} color="#fff" /> },
      { label: 'Messages',  bg: '#22c55e', node: <span style={{ fontSize: 24 }}>💬</span> },
      { label: 'WhatsApp',  bg: '#25D366', node: <span style={{ fontSize: 24 }}>📱</span> },
      { label: 'Gmail',     bg: '#ea4335', node: <span style={{ fontSize: 24 }}>✉️</span> },
      { label: 'Bluetooth', bg: '#3b82f6', node: <Zap size={24} color="#fff" /> },
      { label: 'YouTube',   bg: '#ff0000', node: <span style={{ fontSize: 24 }}>▶️</span> },
      { label: 'Google',    bg: '#4285F4', node: <span style={{ fontSize: 24 }}>🔍</span> },
    ];

    return (
      <div>
        <div style={{
          padding: '28px 16px 20px', textAlign: 'center',
          backgroundColor: '#fff', borderBottom: '1px solid #f3f4f6',
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
          <div style={{ fontSize: 19, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
            Invitez vos amis
          </div>
          <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.55 }}>
            Partagez Anakabo avec vos proches et bénéficiez{'\n'}d'avantages exclusifs ensemble.
          </div>
        </div>

        <SectionHeader>Partager via</SectionHeader>
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 16,
          padding: '20px 16px', backgroundColor: '#fff',
          borderBottom: '1px solid #f3f4f6', justifyContent: 'center',
        }}>
          {shareApps.map(({ label, bg, node }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div
                onClick={() => {}}
                style={{
                  width: 54, height: 54, borderRadius: 16, cursor: 'pointer',
                  backgroundColor: bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 2px 8px ${bg}55`,
                }}
              >
                {node}
              </div>
              <span style={{ fontSize: 11, color: '#6b7280' }}>{label}</span>
            </div>
          ))}
        </div>

        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={() => {}}
            style={{
              width: '100%', padding: '14px 0', borderRadius: 12,
              backgroundColor: '#3b82f6', border: 'none',
              color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(59,130,246,0.35)',
            }}
          >
            Rester en contact
          </button>
          <button
            onClick={() => setToast('Redirection vers Google Play...')}
            style={{
              width: '100%', padding: '14px 0', borderRadius: 12,
              backgroundColor: '#f9fafb', border: '1px solid #e5e7eb',
              color: '#111827', fontSize: 15, fontWeight: 500, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <Star size={18} color="#f59e0b" fill="#f59e0b" />
            Notez-nous
          </button>
        </div>
      </div>
    );
  };

  // ── Section dispatcher ───────────────────────────────────────────────────────

  const renderSection = (id: string): React.ReactNode => {
    switch (id) {
      case 'general':       return renderGeneral();
      case 'map':           return renderMap();
      case 'voice':         return renderVoice();
      case 'alerts':        return renderAlerts();
      case 'fuel':          return renderFuel();
      case 'notifications': return renderNotifications();
      case 'reminders':     return renderReminders();
      case 'account':       return renderAccount();
      case 'privacy':       return renderPrivacy();
      case 'about':         return renderAbout();
      case 'invite':        return renderInvite();
      default:              return null;
    }
  };

  // ── Main render ──────────────────────────────────────────────────────────────

  const currentCategory = section ? categories.find(c => c.id === section) : null;

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: '#fff',
      display: 'flex', flexDirection: 'column',
      zIndex: 1000, fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px', backgroundColor: '#fff',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
        flexShrink: 0, minHeight: 56,
      }}>
        {section ? (
          <button
            onClick={() => setSection(null)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 4, display: 'flex', alignItems: 'center',
            }}
          >
            <ChevronLeft size={24} color="#374151" />
          </button>
        ) : (
          <div style={{ width: 32 }} />
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {currentCategory && (
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              backgroundColor: currentCategory.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {React.cloneElement(currentCategory.icon as React.ReactElement, { size: 14 })}
            </div>
          )}
          <h1 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#111827' }}>
            {currentCategory?.label ?? 'Paramètres'}
          </h1>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 4, display: 'flex', alignItems: 'center',
          }}
        >
          <X size={22} color="#374151" />
        </button>
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f9fafb' }}>
        {!section ? (
          /* Grid view */
          <div style={{ padding: 16 }}>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10,
            }}>
              {categories.map(cat => (
                <div
                  key={cat.id}
                  onClick={() => setSection(cat.id)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                    padding: '14px 6px', borderRadius: 14, cursor: 'pointer',
                    backgroundColor: '#fff',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                    border: '1px solid #f0f0f0',
                    transition: 'transform 0.1s',
                  }}
                >
                  <div style={{
                    width: 46, height: 46, borderRadius: 13,
                    backgroundColor: cat.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 2px 8px ${cat.color}44`,
                  }}>
                    {cat.icon}
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 600, color: '#374151',
                    textAlign: 'center', lineHeight: 1.3,
                  }}>
                    {cat.label}
                  </span>
                </div>
              ))}
              {/* 12th empty slot for balanced grid */}
              <div />
            </div>
          </div>
        ) : (
          /* Section content */
          renderSection(section)
        )}
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: 'absolute', bottom: 40, left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#1f2937', color: '#fff',
          padding: '10px 22px', borderRadius: 24,
          fontSize: 14, fontWeight: 500,
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          pointerEvents: 'none', whiteSpace: 'nowrap',
          zIndex: 1100,
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}
