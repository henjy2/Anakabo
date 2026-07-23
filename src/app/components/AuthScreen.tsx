import { useState } from 'react';
import { Mail, Phone, Lock, User as UserIcon, Chrome } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface AuthScreenProps {
  onSuccess: () => void;
  onSkip: () => void;
}

export function AuthScreen({ onSuccess, onSkip }: AuthScreenProps) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
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
      await loginWithPhone(phone);
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
      alert(error?.message ?? 'Connexion Google non disponible');
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
          <h1 className="text-5xl mb-4">🗺️ {t('appName')}</h1>
          <p className="text-xl text-gray-700 mb-2">Bienvenue!</p>
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

              {/* Phone Login */}
              <div className="space-y-3">
                <Label htmlFor="phone">Connexion par téléphone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+33 6 12 34 56 78"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  onClick={handlePhoneLogin}
                  disabled={isLoading || !phone}
                  variant="outline"
                  className="w-full"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Connexion SMS
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

        {/* Free features preview */}
        <Card className="mt-6 p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          <h3 className="font-bold mb-2">🎉 Anakabo est 100% GRATUIT!</h3>
          <ul className="text-sm space-y-1">
            <li>✓ Navigation illimitée sans publicité intrusive</li>
            <li>✓ Alertes en temps réel (accidents, travaux, radars)</li>
            <li>✓ Planification de trajets aller-retour</li>
            <li>✓ Itinéraires domicile-travail sauvegardés</li>
            <li>✓ 70+ langues africaines + assistant vocal</li>
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
