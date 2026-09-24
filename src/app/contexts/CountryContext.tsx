import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { type Country, countries } from '../utils/countries';

interface CountryContextType {
  selectedCountry: Country | null;
  setSelectedCountry: (country: Country) => void;
  mapCenter: [number, number];
  mapZoom: number;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

export function CountryProvider({ children }: { children: ReactNode }) {
  const [selectedCountry, setSelectedCountryState] = useState<Country | null>(null);

  // Restore persisted country on mount
  useEffect(() => {
    const saved = localStorage.getItem('anakabo_country');
    if (saved) {
      const found = countries.find(c => c.code === saved);
      if (found) setSelectedCountryState(found);
    }
  }, []);

  const setSelectedCountry = (country: Country) => {
    setSelectedCountryState(country);
    localStorage.setItem('anakabo_country', country.code);
  };

  const mapCenter: [number, number] = selectedCountry?.coordinates ?? [10, 25];
  const mapZoom = selectedCountry?.zoom ?? 2;

  return (
    <CountryContext.Provider value={{ selectedCountry, setSelectedCountry, mapCenter, mapZoom }}>
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  const context = useContext(CountryContext);
  if (!context) {
    throw new Error('useCountry must be used within CountryProvider');
  }
  return context;
}
