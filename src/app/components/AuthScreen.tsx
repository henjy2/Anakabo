import { useState, useRef, useEffect } from 'react';
import { Mail, Lock, User as UserIcon, Chrome, Search, ChevronDown, X } from 'lucide-react';
import logoSrc from '@/imports/image-6.png';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { PHONE_COUNTRIES, type PhoneCountry } from '../utils/phoneCountries';

// ── Country Dial Code Picker ──
function CountryCodePicker({
  value,
  onChange,
}: {
  value: PhoneCountry;
  onChange: (c: PhoneCountry) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = PHONE_COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.dial.includes(search)
  );

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '10px 10px 10px 12px', borderRadius: '12px 0 0 12px',
          border: '1px solid #e2e8f0', borderRight: 'none',
          background: '#f8fafc', cursor: 'pointer', whiteSpace: 'nowrap',
          fontSize: 14, fontWeight: 600, color: '#334155',
          minWidth: 90,
        }}
      >
        <span style={{ fontSize: 20 }}>{value.flag}</span>
        <span>{value.dial}</span>
        <ChevronDown size={14} color="#94a3b8" />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, zIndex: 100,
          background: 'white', borderRadius: 14, border: '1px solid #e2e8f0',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)', width: 280, maxHeight: 340,
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {/* Search */}
          <div style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Search size={14} color="#94a3b8" />
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un pays…"
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 13, background: 'transparent', color: '#334155' }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                <X size={12} color="#94a3b8" />
              </button>
            )}
          </div>
          {/* List */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Aucun résultat</div>
            ) : (
              filtered.map(c => (
                <button
                  key={c.code + c.dial}
                  onClick={() => { onChange(c); setOpen(false); setSearch(''); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 14px', background: c.code === value.code ? '#EFF6FF' : 'none',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: 20, lineHeight: 1 }}>{c.flag}</span>
                  <span style={{ flex: 1, fontSize: 13, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                  <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600, flexShrink: 0 }}>{c.dial}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Auth Screen ──
interface AuthScreenProps {
  onSuccess: () => void;
  onSkip: () => void;
}

export function AuthScreen({ onSuccess, onSkip }: AuthScreenProps) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneCountry, setPhoneCountry] = useState<PhoneCountry>(
    PHONE_COUNTRIES.find(c => c.dial === '+33') ?? PHONE_COUNTRIES[0]
  );
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithPhone, loginWithGoogle, register } = useAuth();
  const { t } = useLanguage();

  const handleEmailLogin = async () => {
    setIsLoading(true);
    try {
      await login(email, password);
      onSuccess();
    } catch (error: any) {
      alert(`Erreur de connexion: ${error?.message ?? 'Vérifiez vos identifiants'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneLogin = async () => {
    setIsLoading(true);
    try {
      const fullNumber = `${phoneCountry.dial}${phone.replace(/^0/, '')}`;
      await loginWithPhone(fullNumber);
      onSuccess();
    } catch (error: any) {
      alert(`Erreur: ${error?.message ?? 'Connexion échouée'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      onSuccess();
    } catch (error: any) {
      alert(error?.message ?? 'Connexion non disponible');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      await register(email, password, name);
      onSuccess();
    } catch (error: any) {
      alert(`Erreur d'inscription: ${error?.message ?? 'Réessayez'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <img src={logoSrc} alt="Anakabo" className="w-40 h-40 object-contain mx-auto mb-2" />
          <p className="text-sm text-gray-600">Connectez-vous pour accéder à toutes les fonctionnalités</p>
        </div>

        <Card className="p-6 bg-white/90 backdrop-blur">
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="email">Connexion</TabsTrigger>
              <TabsTrigger value="register">Inscription</TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4">
              {/* Email Login */}
              <div className="space-y-3">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleEmailLogin}
                  disabled={isLoading || !email || !password}
                  className="w-full"
                >
                  Se connecter
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">OU</span>
                </div>
              </div>

              {/* Phone Login — with country code selector */}
              <div className="space-y-2">
                <Label htmlFor="phone">Connexion par téléphone</Label>
                <div style={{ display: 'flex', alignItems: 'stretch' }}>
                  <CountryCodePicker value={phoneCountry} onChange={setPhoneCountry} />
                  <input
                    id="phone"
                    type="tel"
                    placeholder="6 12 34 56 78"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      flex: 1, padding: '10px 12px', border: '1px solid #e2e8f0',
                      borderRadius: '0 12px 12px 0', outline: 'none',
                      fontSize: 14, color: '#334155', background: 'white',
                      minWidth: 0,
                    }}
                    onFocus={e => (e.target.style.borderColor = '#3b82f6')}
                    onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
                  />
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', paddingLeft: 2 }}>
                  Numéro complet : {phoneCountry.flag} {phoneCountry.dial} {phone || 'X XX XX XX XX'}
                </div>
                <Button
                  onClick={handlePhoneLogin}
                  disabled={isLoading || !phone}
                  variant="outline"
                  className="w-full"
                >
                  {phoneCountry.flag} Connexion SMS — {phoneCountry.dial}
                </Button>
              </div>

              {/* Google Login */}
              <Button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                <Chrome className="w-4 h-4 mr-2" />
                Continuer avec Google
              </Button>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <div>
                <Label htmlFor="reg-name">Nom complet</Label>
                <div className="relative mt-1">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="reg-name"
                    type="text"
                    placeholder="Jean Dupont"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="reg-email">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="reg-password">Mot de passe</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="reg-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Phone with country code for registration too */}
              <div>
                <Label htmlFor="reg-phone">Téléphone (optionnel)</Label>
                <div style={{ display: 'flex', alignItems: 'stretch', marginTop: 4 }}>
                  <CountryCodePicker value={phoneCountry} onChange={setPhoneCountry} />
                  <input
                    id="reg-phone"
                    type="tel"
                    placeholder="6 12 34 56 78"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      flex: 1, padding: '10px 12px', border: '1px solid #e2e8f0',
                      borderRadius: '0 12px 12px 0', outline: 'none',
                      fontSize: 14, color: '#334155', background: 'white', minWidth: 0,
                    }}
                    onFocus={e => (e.target.style.borderColor = '#3b82f6')}
                    onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
                  />
                </div>
              </div>

              <Button
                onClick={handleRegister}
                disabled={isLoading || !email || !password || !name}
                className="w-full"
              >
                Créer un compte
              </Button>

              <div className="text-center text-sm text-gray-600">
                En vous inscrivant, vous acceptez nos conditions d'utilisation
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        <div className="mt-6 text-center">
          <Button variant="ghost" onClick={onSkip} className="text-gray-600">
            Continuer sans compte (fonctionnalités limitées)
          </Button>
        </div>

        <Card className="mt-6 p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          <h3 className="font-bold mb-2">🎉 Anakabo est 100% GRATUIT!</h3>
          <ul className="text-sm space-y-1">
            <li>✓ Navigation illimitée sans publicité intrusive</li>
            <li>✓ Alertes en temps réel (accidents, travaux, radars)</li>
            <li>✓ Planification de trajets aller-retour</li>
            <li>✓ Itinéraires domicile-travail sauvegardés</li>
            <li>✓ 100+ langues africaines & mondiales + assistant vocal</li>
            <li>✓ Toutes les fonctionnalités accessibles à tous</li>
          </ul>
          <p className="text-xs mt-3 opacity-90">
            Monétisé par la publicité • Aucun abonnement requis
          </p>
        </Card>
      </div>
    </div>
  );
}
