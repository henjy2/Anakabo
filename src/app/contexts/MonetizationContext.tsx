import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface AppMetrics {
  totalDownloads: number;
  totalViews: number;
  totalLikes: number;
  totalSubscribers: number;
  activeUsers: number;
  dailyActiveUsers: number;
  monthlyRevenue: number;
}

export interface AdConfig {
  showBannerAds: boolean;
  showInterstitialAds: boolean;
  showSponsoredLocations: boolean;
  adFrequency: number; // Minutes between interstitial ads
}

interface MonetizationContextType {
  metrics: AppMetrics;
  adConfig: AdConfig;
  showAd: (type: 'banner' | 'interstitial' | 'sponsored') => void;
  trackView: () => void;
  trackLike: () => void;
  trackDownload: () => void;
  incrementSubscribers: () => void;
}

const MonetizationContext = createContext<MonetizationContextType | undefined>(undefined);

export function MonetizationProvider({ children }: { children: ReactNode }) {
  const [metrics, setMetrics] = useState<AppMetrics>({
    totalDownloads: 125430,
    totalViews: 2456789,
    totalLikes: 98234,
    totalSubscribers: 67890,
    activeUsers: 12345,
    dailyActiveUsers: 8765,
    monthlyRevenue: 15420, // En euros
  });

  const [adConfig] = useState<AdConfig>({
    showBannerAds: true,
    showInterstitialAds: true,
    showSponsoredLocations: true,
    adFrequency: 10, // Pub interstitielle toutes les 10 minutes
  });

  const showAd = (type: 'banner' | 'interstitial' | 'sponsored') => {
    console.log(`Showing ${type} ad`);
    // Ici, intégration avec AdMob, Google Ads, etc.
  };

  const trackView = () => {
    setMetrics(prev => ({
      ...prev,
      totalViews: prev.totalViews + 1,
    }));
  };

  const trackLike = () => {
    setMetrics(prev => ({
      ...prev,
      totalLikes: prev.totalLikes + 1,
    }));
  };

  const trackDownload = () => {
    setMetrics(prev => ({
      ...prev,
      totalDownloads: prev.totalDownloads + 1,
    }));
  };

  const incrementSubscribers = () => {
    setMetrics(prev => ({
      ...prev,
      totalSubscribers: prev.totalSubscribers + 1,
    }));
  };

  // Track page views
  useEffect(() => {
    trackView();
  }, []);

  return (
    <MonetizationContext.Provider
      value={{
        metrics,
        adConfig,
        showAd,
        trackView,
        trackLike,
        trackDownload,
        incrementSubscribers,
      }}
    >
      {children}
    </MonetizationContext.Provider>
  );
}

export function useMonetization() {
  const context = useContext(MonetizationContext);
  if (!context) {
    throw new Error('useMonetization must be used within MonetizationProvider');
  }
  return context;
}
