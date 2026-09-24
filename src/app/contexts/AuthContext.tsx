import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const SERVER = `https://${projectId}.supabase.co/functions/v1/make-server-7faefafb`;

const supabase: SupabaseClient = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  subscriptionType: 'free';
  totalTrips: number;
  totalDistance: number;
  co2Saved: number;
  memberSince: Date;
  preferences: UserPreferences;
  accessToken?: string;
}

export interface UserPreferences {
  homeAddress?: string;
  workAddress?: string;
  avoidTolls: boolean;
  avoidHighways: boolean;
  avoidDifficultIntersections: boolean;
  avoidFerries: boolean;
  preferredModes: string[];
  voiceGuidance: boolean;
  trafficAlerts: boolean;
  accidentAlerts: boolean;
  constructionAlerts: boolean;
  policeAlerts: boolean;
  speedCameraAlerts: boolean;
  theme: 'light' | 'dark' | 'auto';
  units: 'metric' | 'imperial';
  selectedCountry?: string;
  selectedLanguage?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithPhone: (phone: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  saveRouteToHistory: (route: RouteRecord) => Promise<void>;
  getRouteHistory: () => Promise<RouteRecord[]>;
}

export interface RouteRecord {
  origin: string;
  destination: string;
  mode: string;
  duration?: number;
  distance?: number;
  country?: string;
  language?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_PREFS: UserPreferences = {
  avoidTolls: false,
  avoidHighways: false,
  avoidDifficultIntersections: false,
  avoidFerries: false,
  preferredModes: ['car'],
  voiceGuidance: true,
  trafficAlerts: true,
  accidentAlerts: true,
  constructionAlerts: true,
  policeAlerts: true,
  speedCameraAlerts: true,
  theme: 'auto',
  units: 'metric',
};

function buildUser(supaUser: any, token: string, savedPrefs?: Partial<UserPreferences>): User {
  const meta = supaUser.user_metadata ?? {};
  return {
    id: supaUser.id,
    name: meta.name ?? supaUser.email?.split('@')[0] ?? 'Utilisateur',
    email: supaUser.email ?? '',
    subscriptionType: 'free',
    totalTrips: 0,
    totalDistance: 0,
    co2Saved: 0,
    memberSince: new Date(supaUser.created_at ?? Date.now()),
    accessToken: token,
    preferences: { ...DEFAULT_PREFS, ...(savedPrefs ?? {}) },
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Load persisted session on mount
  useEffect(() => {
    const localRaw = localStorage.getItem('anakabo_user');
    if (localRaw) {
      try {
        const parsed = JSON.parse(localRaw);
        setUser({ ...parsed, memberSince: new Date(parsed.memberSince) });
      } catch { /* ignore */ }
    }

    // Restore Supabase session and fetch fresh preferences
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      let savedPrefs: Partial<UserPreferences> = {};
      try {
        const res = await fetch(`${SERVER}/preferences`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok) {
          const d = await res.json();
          savedPrefs = d.preferences ?? {};
        }
      } catch { /* ignore, use defaults */ }
      const u = buildUser(session.user, session.access_token, savedPrefs);
      setUser(u);
      localStorage.setItem('anakabo_user', JSON.stringify(u));
    });
  }, []);

  const persistUser = (u: User) => {
    setUser(u);
    localStorage.setItem('anakabo_user', JSON.stringify(u));
  };

  const login = async (email: string, password: string) => {
    const res = await fetch(`${SERVER}/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Connexion échouée');

    let savedPrefs: Partial<UserPreferences> = {};
    try {
      const prefsRes = await fetch(`${SERVER}/preferences`, {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      if (prefsRes.ok) savedPrefs = (await prefsRes.json()).preferences ?? {};
    } catch { /* ignore */ }

    persistUser(buildUser(data.user, data.access_token, savedPrefs));
  };

  const loginWithPhone = async (phone: string) => {
    // Phone auth not available without SMS provider — create guest session
    const guestUser: User = {
      id: `phone_${phone.replace(/\D/g, '')}`,
      name: 'Utilisateur Mobile',
      email: '',
      phone,
      subscriptionType: 'free',
      totalTrips: 0,
      totalDistance: 0,
      co2Saved: 0,
      memberSince: new Date(),
      preferences: DEFAULT_PREFS,
    };
    persistUser(guestUser);
  };

  const loginWithGoogle = async () => {
    const demoUser: User = {
      id: `google_demo_${Date.now()}`,
      name: 'Utilisateur Google',
      email: 'demo.google@anakabo.app',
      subscriptionType: 'free',
      totalTrips: 0,
      totalDistance: 0,
      co2Saved: 0,
      memberSince: new Date(),
      preferences: DEFAULT_PREFS,
    };
    persistUser(demoUser);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('anakabo_user');
  };

  const register = async (email: string, password: string, name: string) => {
    const res = await fetch(`${SERVER}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${publicAnonKey}` },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Inscription échouée");

    // Auto sign in after registration
    await login(email, password);
  };

  const updatePreferences = useCallback((preferences: Partial<UserPreferences>) => {
    if (!user) return;
    const updated: User = {
      ...user,
      preferences: { ...user.preferences, ...preferences },
    };
    persistUser(updated);

    // Save to Supabase in background if authenticated
    if (user.accessToken) {
      fetch(`${SERVER}/preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify(updated.preferences),
      }).catch(err => console.log(`Failed to save preferences to Supabase: ${err}`));
    }
  }, [user]);

  const saveRouteToHistory = useCallback(async (route: RouteRecord) => {
    try {
      const sessionId = user?.id ?? `anon_${Date.now()}`;
      await fetch(`${SERVER}/routes/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.accessToken ?? publicAnonKey}`,
        },
        body: JSON.stringify({ ...route, sessionId }),
      });
    } catch (err) {
      console.log(`Failed to save route history: ${err}`);
    }
  }, [user]);

  const getRouteHistory = useCallback(async (): Promise<RouteRecord[]> => {
    try {
      const sessionId = user?.id ?? 'anonymous';
      const res = await fetch(
        `${SERVER}/routes/history?sessionId=${sessionId}`,
        { headers: { Authorization: `Bearer ${user?.accessToken ?? publicAnonKey}` } }
      );
      if (!res.ok) return [];
      const data = await res.json();
      return data.routes ?? [];
    } catch (err) {
      console.log(`Failed to fetch route history: ${err}`);
      return [];
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        loginWithPhone,
        loginWithGoogle,
        logout,
        register,
        updatePreferences,
        saveRouteToHistory,
        getRouteHistory,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
