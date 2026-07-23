import { TrendingUp, Download, Eye, Heart, Users, Activity } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { useMonetization } from '../contexts/MonetizationContext';

export function AppMetricsDashboard() {
  const { metrics } = useMonetization();

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const metricCards = [
    {
      icon: Download,
      label: 'Téléchargements',
      value: formatNumber(metrics.totalDownloads),
      color: 'from-blue-500 to-indigo-600',
      trend: '+12%',
    },
    {
      icon: Eye,
      label: 'Vues',
      value: formatNumber(metrics.totalViews),
      color: 'from-purple-500 to-pink-600',
      trend: '+8%',
    },
    {
      icon: Heart,
      label: 'Likes',
      value: formatNumber(metrics.totalLikes),
      color: 'from-red-500 to-pink-500',
      trend: '+15%',
    },
    {
      icon: Users,
      label: 'Abonnés',
      value: formatNumber(metrics.totalSubscribers),
      color: 'from-green-500 to-emerald-600',
      trend: '+5%',
    },
    {
      icon: Activity,
      label: 'Utilisateurs actifs',
      value: formatNumber(metrics.activeUsers),
      color: 'from-orange-500 to-amber-600',
      trend: '+10%',
    },
  ];

  return (
    <div className="p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">📊 Statistiques de l'App</h2>
          <p className="text-gray-600">Performance et engagement des utilisateurs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {metricCards.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <Card
                key={idx}
                className={`p-6 bg-gradient-to-r ${metric.color} text-white overflow-hidden relative`}
              >
                <div className="absolute top-0 right-0 opacity-10 text-9xl">
                  <Icon className="w-24 h-24" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-5 h-5" />
                    <p className="text-sm opacity-90">{metric.label}</p>
                  </div>
                  <p className="text-4xl font-bold mb-2">{metric.value}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {metric.trend}
                    </Badge>
                    <span className="text-xs opacity-75">ce mois</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="p-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">💰 Revenus Publicitaires</h3>
              <p className="text-sm opacity-90">Monétisation via publicités et sponsoring</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold">{metrics.monthlyRevenue.toLocaleString()}€</p>
              <p className="text-sm opacity-75">ce mois</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{formatNumber(metrics.dailyActiveUsers)}</p>
                <p className="text-xs opacity-75">Utilisateurs/jour</p>
              </div>
              <div>
                <p className="text-2xl font-bold">95%</p>
                <p className="text-xs opacity-75">Taux de satisfaction</p>
              </div>
              <div>
                <p className="text-2xl font-bold">4.8★</p>
                <p className="text-xs opacity-75">Note moyenne</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
