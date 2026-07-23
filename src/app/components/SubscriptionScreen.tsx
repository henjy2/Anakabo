import { Check, Crown, Zap, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { useAuth } from '../contexts/AuthContext';

interface SubscriptionScreenProps {
  onClose: () => void;
}

const plans = [
  {
    id: 'free',
    name: 'Gratuit',
    price: '0€',
    period: 'à vie',
    icon: Sparkles,
    color: 'from-gray-400 to-gray-600',
    features: [
      '10 trajets par mois',
      'Modes de base (voiture, vélo, marche)',
      'Navigation simple',
      'Publicités',
      'Support communautaire',
    ],
    limitations: [
      'Pas d\'alertes en temps réel',
      'Pas de planification',
      'Pas de mode hors-ligne',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '4.99€',
    period: 'par mois',
    icon: Crown,
    color: 'from-purple-500 to-pink-500',
    popular: true,
    features: [
      'Trajets illimités',
      'Tous les modes de transport',
      'Alertes en temps réel (accidents, travaux, radars)',
      'Planification aller-retour',
      'Itinéraires domicile-travail',
      'Mode hors-ligne',
      'Sans publicité',
      'Support prioritaire',
      'Statistiques avancées',
      'Assistance vocale 70+ langues',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '9.99€',
    period: 'par mois',
    icon: Zap,
    color: 'from-blue-500 to-indigo-600',
    features: [
      'Tout Premium +',
      'Navigation professionnelle',
      'Optimisation de tournées',
      'Gestion de flotte',
      'Rapports d\'activité',
      'API d\'intégration',
      'Comptes d\'équipe (jusqu\'à 10)',
      'Support 24/7',
      'Données exportables',
    ],
  },
];

export function SubscriptionScreen({ onClose }: SubscriptionScreenProps) {
  const { user, upgradeToPremium } = useAuth();

  const handleSubscribe = (planId: string) => {
    if (planId === 'premium') {
      upgradeToPremium();
      alert('Abonnement Premium activé! 🎉');
      onClose();
    } else if (planId === 'pro') {
      alert('Redirection vers le paiement Pro...');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choisissez votre plan</h1>
          <p className="text-xl text-gray-600">
            Déverrouillez toutes les fonctionnalités d'Anakabo
          </p>
          {user && (
            <Badge className="mt-4" variant="outline">
              Plan actuel: <strong className="ml-1 capitalize">{user.subscriptionType}</strong>
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = user?.subscriptionType === plan.id;

            return (
              <Card
                key={plan.id}
                className={`relative overflow-hidden ${
                  plan.popular ? 'ring-2 ring-purple-500 shadow-xl' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-purple-500 text-white px-3 py-1 text-xs font-bold">
                    POPULAIRE
                  </div>
                )}

                <div className={`bg-gradient-to-r ${plan.color} p-6 text-white`}>
                  <Icon className="w-12 h-12 mb-3" />
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-sm opacity-90">/{plan.period}</span>
                  </div>
                </div>

                <div className="p-6">
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.limitations && (
                    <div className="mb-6">
                      <p className="text-xs text-gray-500 mb-2">Limitations:</p>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, idx) => (
                          <li key={idx} className="text-xs text-gray-400 flex items-start gap-2">
                            <span>✗</span>
                            <span>{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isCurrentPlan}
                    className={`w-full ${
                      plan.popular
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                        : ''
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {isCurrentPlan ? 'Plan actuel' : `Choisir ${plan.name}`}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Pay as you go */}
        <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">💳 Paiement à l'utilisation</h3>
              <p className="text-gray-700 mb-4">
                Pas d'abonnement? Payez seulement pour ce que vous utilisez!
              </p>
              <ul className="space-y-2 text-sm">
                <li>• 0.10€ par trajet (voiture, taxi)</li>
                <li>• 0.05€ par trajet (vélo, piétons, transports)</li>
                <li>• Alertes en temps réel: 0.02€ par alerte</li>
                <li>• Planification avancée: 0.15€ par itinéraire</li>
              </ul>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-2">Solde actuel</p>
              <p className="text-3xl font-bold text-green-600">5.00€</p>
              <Button variant="outline" className="mt-3">
                Recharger
              </Button>
            </div>
          </div>
        </Card>

        <div className="mt-8 text-center">
          <Button variant="ghost" onClick={onClose}>
            Retour
          </Button>
        </div>
      </div>
    </div>
  );
}
