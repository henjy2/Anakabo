import { Bell, AlertCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { useAuth } from '../contexts/AuthContext';

const alertTypes = [
  { id: 'traffic', label: 'Bouchons', icon: '🚗', description: 'Ralentissements et trafic dense' },
  { id: 'accidents', label: 'Accidents', icon: '🚨', description: 'Accidents signalés sur votre trajet' },
  { id: 'construction', label: 'Travaux', icon: '🚧', description: 'Zones de travaux et déviations' },
  { id: 'police', label: 'Police / Contrôles', icon: '👮', description: 'Contrôles routiers et radar mobile' },
  { id: 'speedCameras', label: 'Radars fixes', icon: '📷', description: 'Radars automatiques de vitesse' },
  { id: 'roadClosed', label: 'Routes fermées', icon: '🚫', description: 'Fermetures de routes et sens interdits' },
  { id: 'hazards', label: 'Dangers', icon: '⚠️', description: 'Nids-de-poule, objets sur la route' },
  { id: 'weather', label: 'Météo', icon: '🌧️', description: 'Pluie, neige, brouillard' },
];

export function AlertsTab() {
  const { user, updatePreferences } = useAuth();

  const getAlertState = (alertId: string): boolean => {
    switch (alertId) {
      case 'traffic':
        return user?.preferences.trafficAlerts ?? true;
      case 'accidents':
        return user?.preferences.accidentAlerts ?? true;
      case 'construction':
        return user?.preferences.constructionAlerts ?? true;
      case 'police':
        return user?.preferences.policeAlerts ?? true;
      case 'speedCameras':
        return user?.preferences.speedCameraAlerts ?? true;
      default:
        return true;
    }
  };

  const toggleAlert = (alertId: string, checked: boolean) => {
    switch (alertId) {
      case 'traffic':
        updatePreferences({ trafficAlerts: checked });
        break;
      case 'accidents':
        updatePreferences({ accidentAlerts: checked });
        break;
      case 'construction':
        updatePreferences({ constructionAlerts: checked });
        break;
      case 'police':
        updatePreferences({ policeAlerts: checked });
        break;
      case 'speedCameras':
        updatePreferences({ speedCameraAlerts: checked });
        break;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-indigo-200">
        <div className="flex items-center gap-3 mb-3">
          <Bell className="w-6 h-6 text-indigo-600" />
          <div>
            <h3 className="text-lg font-semibold">Alertes en temps réel</h3>
            <p className="text-sm text-gray-600">Restez informé des conditions de route</p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg">
          <p className="text-sm text-green-900">
            ✅ Toutes les alertes sont gratuites et illimitées pour tous les utilisateurs!
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Types d'alertes</h3>
        <div className="space-y-4">
          {alertTypes.map((alert) => (
            <div key={alert.id} className="flex items-start justify-between py-3 border-b last:border-b-0">
              <div className="flex items-start gap-3 flex-1">
                <span className="text-2xl">{alert.icon}</span>
                <div>
                  <Label htmlFor={alert.id} className="cursor-pointer font-medium">
                    {alert.label}
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                </div>
              </div>
              <Switch
                id={alert.id}
                checked={getAlertState(alert.id)}
                onCheckedChange={(checked) => toggleAlert(alert.id, checked)}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Options d'alertes
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <Label htmlFor="sound-alerts" className="cursor-pointer">
                🔊 Alertes sonores
              </Label>
              <p className="text-xs text-gray-500 mt-1">Émettre un son lors des alertes</p>
            </div>
            <Switch id="sound-alerts" defaultChecked />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <Label htmlFor="vibrate-alerts" className="cursor-pointer">
                📳 Vibration
              </Label>
              <p className="text-xs text-gray-500 mt-1">Vibrer lors des alertes importantes</p>
            </div>
            <Switch id="vibrate-alerts" defaultChecked />
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <Label htmlFor="popup-alerts" className="cursor-pointer">
                💬 Alertes popup
              </Label>
              <p className="text-xs text-gray-500 mt-1">Afficher les alertes en plein écran</p>
            </div>
            <Switch id="popup-alerts" defaultChecked />
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-green-50 border-green-200">
        <h4 className="font-semibold text-green-900 mb-2">✨ Contribuez à la communauté!</h4>
        <p className="text-sm text-green-800">
          Vous aussi, signalez les incidents que vous rencontrez pour aider les autres conducteurs.
          Plus nous sommes actifs, plus les alertes sont précises!
        </p>
      </Card>
    </div>
  );
}
