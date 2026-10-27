import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface AppMetrics {
  totalRegistrations: number;
  totalDownloads: number;
  totalViews: number;
  totalSearches: number;
  totalLikes: number;
  totalSubscribers: number;
  activeUsers: number;
  dailyActiveUsers: number;
  adImpressions: number;
  sponsoredClicks: number;
  monthlyRevenue: number;
}

export interface AdConfig {
  showBannerAds: boolean;
  showSponsoredLocations: boolean;
  adFrequency: number;
}

interface MonetizationContextType {
  metrics: AppMetrics;
  adConfig: AdConfig;
  trackRegistration: () => void;
  trackView: () => void;
  trackSearch: () => void;
  trackLike: () => void;
  trackAdImpression: () => void;
  trackSponsoredClick: () => void;
}

const MonetizationContext = createContext<MonetizationContextType | undefined>(undefined);

export function MonetizationProvider({ children }: { children: ReactNode }) {
  const [metrics, setMetrics] = useState<AppMetrics>({
    totalRegistrations: 0,
    totalDownloads: 0,
    totalViews: 0,
    totalSearches: 0,
    totalLikes: 0,
    totalSubscribers: 0,
    activeUsers: 0,
    dailyActiveUsers: 0,
    adImpressions: 0,
    sponsoredClicks: 0,
    monthlyRevenue: 0,
  });

  const [adConfig] = useState<AdConfig>({
    showBannerAds: true,
    showSponsoredLocations: true,
    adFrequency: 10,
  });

  const trackRegistration = () =>
    setMetrics(prev => ({ ...prev, totalRegistrations: prev.totalRegistrations + 1 }));

  const trackView = () =>
    setMetrics(prev => ({ ...prev, totalViews: prev.totalViews + 1, activeUsers: prev.activeUsers + 1 }));

  const trackSearch = () =>
    setMetrics(prev => ({ ...prev, totalSearches: prev.totalSearches + 1 }));

  const trackLike = () =>
    setMetrics(prev => ({ ...prev, totalLikes: prev.totalLikes + 1 }));

  const trackAdImpression = () =>
    setMetrics(prev => ({ ...prev, adImpressions: prev.adImpressions + 1 }));

  const trackSponsoredClick = () =>
    setMetrics(prev => ({ ...prev, sponsoredClicks: prev.sponsoredClicks + 1 }));

  useEffect(() => {
    trackView();
  }, []);

  return (
    <MonetizationContext.Provider value={{
      metrics,
      adConfig,
      trackRegistration,
      trackView,
      trackSearch,
      trackLike,
      trackAdImpression,
      trackSponsoredClick,
    }}>
      {children}
    </MonetizationContext.Provider>
  );
}

export function useMonetization() {
  const context = useContext(MonetizationContext);
  if (!context) throw new Error('useMonetization must be used within MonetizationProvider');
  return context;
}
