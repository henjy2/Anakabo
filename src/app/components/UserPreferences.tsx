import { useState } from 'react';
import {
  History,
  Settings,
  Bookmark,
  TrendingUp,
  Clock,
  MapPin,
  Star,
  Home,
  Briefcase,
  Edit,
  Bell,
  Shield,
  Smartphone,
  Navigation as NavigationIcon,
  AlertCircle,
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { TransportMode } from './HomeScreen';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { LanguageSelector } from './LanguageSelector';
import { AfricaHaitiPride } from './AfricaHaitiPride';
import { AlertsTab } from './AlertsTab';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface UserPreferencesProps {
  onClose: () => void;
  onSelectRoute: (mode: TransportMode, origin: string, destination: string) => void;
}

const recentTrips = [
  {
    from: 'Maison',
    to: 'Bureau',
    mode: 'transit' as TransportMode,
    frequency: 'Quotidien',
    lastUsed: 'Aujourd\'hui 8h30',
    icon: '🏠→🏢',
  },
  {
    from: 'Bureau',
    to: 'Salle de sport',
    mode: 'bike' as TransportMode,
    frequency: '3x/semaine',
    lastUsed: 'Hier 18h45',
    icon: '🏢→💪',
  },
  {
    from: 'Centre ville',
    to: 'Aéroport CDG',
    mode: 'car' as TransportMode,
    frequency: 'Mensuel',
    lastUsed: '15 avril',
    icon: '🏙️→✈️',
  },
];

const savedPlaces = [
  { name: 'Maison', address: '12 Rue de la Paix, Paris', icon: '🏠', color: 'bg-blue-500' },
  { name: 'Bureau', address: '45 Avenue des Champs-Élysées', icon: '🏢', color: 'bg-purple-500' },
  { name: 'Salle de sport', address: '8 Rue du Commerce', icon: '💪', color: 'bg-orange-500' },
  { name: 'Parents', address: '23 Boulevard Haussmann', icon: '👨‍👩‍👧', color: 'bg-green-500' },
];

const alertTypes = [
  { id: 'traffic', label: 'Bouchons', icon: '🚗' },
  { id: 'accidents', label: 'Accidents', icon: '🚨' },
  { id: 'construction', label: 'Travaux', icon: '🚧' },
  { id: 'police', label: 'Police / Contrôles', icon: '👮' },
  { id: 'speedCameras', label: 'Radars fixes/mobiles', icon: '📷' },
  { id: 'roadClosed', label: 'Routes fermées', icon: '🚫' },
  { id: 'hazards', label: 'Dangers (nids-de-poule, objets)', icon: '⚠️' },
  { id: 'weather', label: 'Conditions météo', icon: '🌧️' },
];

export function UserPreferences({ onClose, onSelectRoute }: UserPreferencesProps) {
  const { t } = useLanguage();
  const { user, updatePreferences } = useAuth();
  const [homeAddress, setHomeAddress] = useState(user?.preferences.homeAddress || '');
  const [workAddress, setWorkAddress] = useState(user?.preferences.workAddress || '');
  const [isEditingHome, setIsEditingHome] = useState(false);
  const [isEditingWork, setIsEditingWork] = useState(false);

  const handleSaveHome = () => {
    updatePreferences({ homeAddress });
    setIsEditingHome(false);
  };

  const handleSaveWork = () => {
    updatePreferences({ workAddress });
    setIsEditingWork(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl mb-2">{t('profile')}</h1>
            <p className="text-gray-600">Historique et préférences personnalisées</p>
          </div>
          <div className="flex gap-3">
            <LanguageSelector />
            <Button onClick={onClose}>Fermer</Button>
          </div>
        </div>

        <Tabs defaultValue="history" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              {t('history')}
            </TabsTrigger>
            <TabsTrigger value="places" className="flex items-center gap-2">
              <Bookmark className="w-4 h-4" />
              Lieux
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              {t('settings')}
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Alertes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-4">
            <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🎉</span>
                  <div>
                    <h3 className="font-semibold text-green-900">App 100% Gratuite!</h3>
                    <p className="text-sm text-green-700">Navigation illimitée sans abonnement</p>
                  </div>
                </div>
                <Badge className="bg-green-500">GRATUIT</Badge>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-indigo-200">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
                <div>
                  <h3 className="font-semibold">Statistiques du mois</h3>
                  <p className="text-sm text-gray-600">Avril 2026</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-indigo-600">45</p>
                  <p className="text-sm text-gray-600">Trajets</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">12.5kg</p>
                  <p className="text-sm text-gray-600">CO2 économisé</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">18h</p>
                  <p className="text-sm text-gray-600">Temps total</p>
                </div>
              </div>
            </Card>

            <h3 className="text-lg font-semibold mt-6 mb-3">Trajets fréquents</h3>
            {recentTrips.map((trip, idx) => (
              <Card
                key={idx}
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onSelectRoute(trip.mode, trip.from, trip.to)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{trip.icon}</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{trip.from}</span>
                        <span className="text-gray-400">→</span>
                        <span className="font-semibold">{trip.to}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {trip.frequency}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {trip.lastUsed}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Relancer
                  </Button>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="places" className="space-y-4">
            {/* Home & Work - Priority */}
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-indigo-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-indigo-600" />
                Lieux prioritaires (Domicile-Travail)
              </h3>

              <div className="space-y-4">
                {/* Home */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="flex items-center gap-2">
                      <Home className="w-4 h-4" />
                      Domicile
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingHome(!isEditingHome)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                  {isEditingHome ? (
                    <div className="flex gap-2">
                      <Input
                        value={homeAddress}
                        onChange={(e) => setHomeAddress(e.target.value)}
                        placeholder="12 Rue de la Paix, Paris"
                      />
                      <Button onClick={handleSaveHome} size="sm">
                        Enregistrer
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 bg-white p-3 rounded border">
                      {user?.preferences.homeAddress || 'Anakabo — Cliquez pour définir votre adresse'}
                    </p>
                  )}
                </div>

                {/* Work */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Travail
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingWork(!isEditingWork)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                  {isEditingWork ? (
                    <div className="flex gap-2">
                      <Input
                        value={workAddress}
                        onChange={(e) => setWorkAddress(e.target.value)}
                        placeholder="45 Avenue des Champs-Élysées, Paris"
                      />
                      <Button onClick={handleSaveWork} size="sm">
                        Enregistrer
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 bg-white p-3 rounded border">
                      {user?.preferences.workAddress || 'Anakabo — Cliquez pour définir votre adresse'}
                    </p>
                  )}
                </div>

                {user?.preferences.homeAddress && user?.preferences.workAddress && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-3">Trajet quotidien:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        className="justify-start"
                        onClick={() => onSelectRoute('car', user.preferences.homeAddress!, user.preferences.workAddress!)}
                      >
                        🏠 → 🏢 Aller au travail
                      </Button>
                      <Button
                        variant="outline"
                        className="justify-start"
                        onClick={() => onSelectRoute('car', user.preferences.workAddress!, user.preferences.homeAddress!)}
                      >
                        🏢 → 🏠 Rentrer à la maison
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Other saved places */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Autres lieux enregistrés</h3>
              <Button variant="outline" size="sm">
                + Ajouter un lieu
              </Button>
            </div>

            {savedPlaces.map((place, idx) => (
              <Card key={idx} className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`${place.color} p-3 rounded-full text-white text-2xl`}>
                    {place.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{place.name}</h4>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {place.address}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Modifier
                    </Button>
                    <Button variant="ghost" size="sm">
                      Y aller
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            {/* Navigation Preferences */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <NavigationIcon className="w-5 h-5" />
                Préférences de navigation
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <Label htmlFor="avoid-tolls" className="cursor-pointer">
                    🚫 Éviter les péages
                  </Label>
                  <Switch
                    id="avoid-tolls"
                    checked={user?.preferences.avoidTolls}
                    onCheckedChange={(checked) => updatePreferences({ avoidTolls: checked })}
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <Label htmlFor="avoid-highways" className="cursor-pointer">
                    🛣️ Éviter les autoroutes
                  </Label>
                  <Switch
                    id="avoid-highways"
                    checked={user?.preferences.avoidHighways}
                    onCheckedChange={(checked) => updatePreferences({ avoidHighways: checked })}
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <Label htmlFor="avoid-intersections" className="cursor-pointer">
                    ⚠️ Éviter intersections difficiles
                  </Label>
                  <Switch
                    id="avoid-intersections"
                    checked={user?.preferences.avoidDifficultIntersections}
                    onCheckedChange={(checked) => updatePreferences({ avoidDifficultIntersections: checked })}
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <Label htmlFor="avoid-ferries" className="cursor-pointer">
                    ⛴️ Éviter les ferries
                  </Label>
                  <Switch
                    id="avoid-ferries"
                    checked={user?.preferences.avoidFerries}
                    onCheckedChange={(checked) => updatePreferences({ avoidFerries: checked })}
                  />
                </div>
              </div>
            </Card>

            {/* Display & Sound */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Affichage & Son
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="theme" className="mb-2 block">Thème</Label>
                  <Select
                    value={user?.preferences.theme}
                    onValueChange={(value: any) => updatePreferences({ theme: value })}
                  >
                    <SelectTrigger id="theme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">☀️ Clair</SelectItem>
                      <SelectItem value="dark">🌙 Sombre</SelectItem>
                      <SelectItem value="auto">🔄 Automatique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="units" className="mb-2 block">Unités</Label>
                  <Select
                    value={user?.preferences.units}
                    onValueChange={(value: any) => updatePreferences({ units: value })}
                  >
                    <SelectTrigger id="units">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="metric">Métrique (km, m)</SelectItem>
                      <SelectItem value="imperial">Impérial (mi, ft)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between py-2">
                  <Label htmlFor="voice-guidance" className="cursor-pointer">
                    🔊 Guidage vocal
                  </Label>
                  <Switch
                    id="voice-guidance"
                    checked={user?.preferences.voiceGuidance}
                    onCheckedChange={(checked) => updatePreferences({ voiceGuidance: checked })}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Modes de transport favoris</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="px-3 py-2">
                  🚇 Métro
                </Badge>
                <Badge variant="outline" className="px-3 py-2">
                  🚴 Vélo
                </Badge>
                <Badge variant="outline" className="px-3 py-2">
                  🚶 Marche
                </Badge>
                <Badge variant="outline" className="px-3 py-2 bg-gray-100">
                  + Ajouter
                </Badge>
              </div>
            </Card>

            <AfricaHaitiPride />

            <Card className="p-6 bg-amber-50 border-amber-200">
              <h3 className="text-lg font-semibold mb-2">💡 Suggestion intelligente</h3>
              <p className="text-sm text-gray-700 mb-3">
                Vous prenez souvent le vélo le matin et le métro le soir. Voulez-vous que nous
                suggérions automatiquement ces modes ?
              </p>
              <Button size="sm" className="bg-amber-500 hover:bg-amber-600">
                Activer les suggestions
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="alerts">
            <AlertsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
