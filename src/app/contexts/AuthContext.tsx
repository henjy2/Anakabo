import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { projectId } from '../../../utils/supabase/info';
import { supabase } from '../../../utils/supabase/client';

const SERVER = `https://${projectId}.supabase.co/functions/v1/make-server-7faefafb`;

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
  isGuest: boolean;
  login: (email: string, password: string) => Promise<void>;
  requestPhoneCode: (phone: string) => Promise<void>;
  verifyPhoneCode: (phone: string, code: string) => Promise<void>;
  continueAsGuest: () => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  saveRouteToHistory: (route: RouteRecord) => Promise<void>;
  getRouteHistory: () => Promise<RouteRecord[]>;
}

export interface RouteRecord {
  id?: string;
  origin: string;
  destination: string;
  mode: string;
  duration?: number;
  distance?: number;
  country?: string;
  language?: string;
  savedAt?: string;
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
    name: meta.name ?? supaUser.email?.split('@')[0] ?? supaUser.phone ?? 'Utilisateur',
    email: supaUser.email ?? '',
    phone: supaUser.phone,
    subscriptionType: 'free',
    totalTrips: 0,
    totalDistance: 0,
    co2Saved: 0,
    memberSince: new Date(supaUser.created_at ?? Date.now()),
    accessToken: token,
    preferences: { ...DEFAULT_PREFS, ...(savedPrefs ?? {}) },
  };
}

function serializeLocalUser(user: User) {
  const { accessToken: _accessToken, ...safeUser } = user;
  return JSON.stringify(safeUser);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const isGuest = user?.id.startsWith('guest_') ?? false;

  // Load persisted session on mount
  useEffect(() => {
    const localRaw = localStorage.getItem('anakabo_user');
    if (localRaw) {
      try {
        const parsed = JSON.parse(localRaw);
        if (String(parsed.id).startsWith('google_demo_')) {
          localStorage.removeItem('anakabo_user');
        } else if (String(parsed.id).startsWith('guest_')) {
          setUser({ ...parsed, memberSince: new Date(parsed.memberSince) });
        }
      } catch { /* ignore */ }
    }

    const restoreSession = async (session: Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']) => {
      if (!session) return;
      let savedPrefs: Partial<UserPreferences> = {};
      const localUser = localStorage.getItem('anakabo_user');
      if (localUser) {
        try {
          const parsed = JSON.parse(localUser);
          if (parsed.id === session.user.id) savedPrefs = parsed.preferences ?? {};
        } catch { /* ignore invalid local state */ }
      }
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
      localStorage.setItem('anakabo_user', serializeLocalUser(u));
    };

    supabase.auth.getSession().then(({ data: { session } }) => restoreSession(session));
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        void restoreSession(session);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('anakabo_user');
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const persistUser = (u: User) => {
    setUser(u);
    localStorage.setItem('anakabo_user', serializeLocalUser(u));
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) throw new Error(error?.message ?? 'Connexion échouée');

    let savedPrefs: Partial<UserPreferences> = {};
    try {
      const prefsRes = await fetch(`${SERVER}/preferences`, {
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      });
      if (prefsRes.ok) savedPrefs = (await prefsRes.json()).preferences ?? {};
    } catch { /* ignore */ }

    persistUser(buildUser(data.user, data.session.access_token, savedPrefs));
  };

  const requestPhoneCode = async (phone: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      phone,
      options: { shouldCreateUser: true },
    });
    if (error) throw error;
  };

  const verifyPhoneCode = async (phone: string, code: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token: code,
      type: 'sms',
    });
    if (error || !data.session || !data.user) {
      throw new Error(error?.message ?? 'Code invalide ou expiré');
    }
    persistUser(buildUser(data.user, data.session.access_token));
  };

  const continueAsGuest = () => {
    const existing = localStorage.getItem('anakabo_guest_id');
    const guestId = existing ?? `guest_${crypto.randomUUID()}`;
    localStorage.setItem('anakabo_guest_id', guestId);
    const guestUser: User = {
      id: guestId,
      name: 'Invité',
      email: '',
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
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('anakabo_user');
  };

  const register = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw error;

    if (data.session) {
      persistUser(buildUser(data.user, data.session.access_token));
      return;
    }

    throw new Error('Compte créé. Consultez votre courriel pour confirmer votre adresse.');
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
    const historyKey = `anakabo_route_history:${user?.id ?? 'guest'}`;
    const savedRoute = {
      ...route,
      id: crypto.randomUUID(),
      savedAt: new Date().toISOString(),
    };
    let localRoutes: RouteRecord[] = [];
    try {
      localRoutes = JSON.parse(localStorage.getItem(historyKey) ?? '[]');
    } catch { /* ignore invalid local history */ }
    localStorage.setItem(historyKey, JSON.stringify([savedRoute, ...localRoutes].slice(0, 20)));

    if (!user?.accessToken) return;
    try {
      const response = await fetch(`${SERVER}/routes/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.accessToken}`,
        },
        body: JSON.stringify(route),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
    } catch (err) {
      console.log(`Failed to save route history: ${err}`);
    }
  }, [user]);

  const getRouteHistory = useCallback(async (): Promise<RouteRecord[]> => {
    const historyKey = `anakabo_route_history:${user?.id ?? 'guest'}`;
    const getLocalHistory = () => {
      try {
        return JSON.parse(localStorage.getItem(historyKey) ?? '[]') as RouteRecord[];
      } catch {
        return [];
      }
    };
    if (!user?.accessToken) return getLocalHistory();

    try {
      const res = await fetch(`${SERVER}/routes/history`, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });
      if (!res.ok) return getLocalHistory();
      const data = await res.json();
      return data.routes ?? [];
    } catch (err) {
      console.log(`Failed to fetch route history: ${err}`);
      return getLocalHistory();
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user?.accessToken && !isGuest,
        isGuest,
        login,
        requestPhoneCode,
        verifyPhoneCode,
        continueAsGuest,
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
