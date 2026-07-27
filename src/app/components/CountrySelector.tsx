import { useState } from 'react';
import { Globe, MapPin, Search, Check, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { getAfricanCountries, getCaribbeanCountries, getEuropeanCountries, getAmericasCountries, getAsianCountries, type Country } from '../utils/countries';
import { languages } from '../utils/languages';
import { useCountry } from '../contexts/CountryContext';
import { useLanguage } from '../contexts/LanguageContext';

export function CountrySelector() {
  const { selectedCountry, setSelectedCountry } = useCountry();
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [step, setStep] = useState<'country' | 'language'>('country');
  const [pendingCountry, setPendingCountry] = useState<Country | null>(null);

  const africanCountries = getAfricanCountries();
  const caribbeanCountries = getCaribbeanCountries();
  const europeanCountries = getEuropeanCountries();
  const americasCountries = getAmericasCountries();
  const asianCountries = getAsianCountries();

  const filterCountries = (list: Country[]) => {
    if (!search) return list;
    return list.filter(
      c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.nativeName.toLowerCase().includes(search.toLowerCase())
    );
  };

  const handleCountrySelect = (country: Country) => {
    setPendingCountry(country);
    setStep('language');
  };

  const handleLanguageSelect = (langCode: string) => {
    if (pendingCountry) {
      setSelectedCountry(pendingCountry);
      setLanguage(langCode);
    }
    setOpen(false);
    setStep('country');
    setPendingCountry(null);
    setSearch('');
  };

  const handleKeepCurrentLanguage = () => {
    if (pendingCountry) {
      setSelectedCountry(pendingCountry);
    }
    setOpen(false);
    setStep('country');
    setPendingCountry(null);
    setSearch('');
  };

  const availableLanguages = pendingCountry
    ? pendingCountry.languages
        .map(code => languages.find(l => l.code === code))
        .filter(Boolean)
    : [];

  const currentCountry = selectedCountry;

  const CountryCard = ({ country }: { country: Country }) => (
    <button
      onClick={() => handleCountrySelect(country)}
      className={`p-3 rounded-lg border text-left transition-all hover:bg-blue-50 hover:border-blue-300 ${
        currentCountry?.code === country.code
          ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200'
          : 'border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-2xl">{country.flag}</span>
        {currentCountry?.code === country.code && <Check className="w-4 h-4 text-blue-600" />}
      </div>
      <p className="font-semibold text-sm truncate">{country.name}</p>
      <p className="text-xs text-gray-500 truncate">{country.nativeName}</p>
      {country.capital && (
        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {country.capital}
        </p>
      )}
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setStep('country'); setPendingCountry(null); } }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Globe className="w-4 h-4" />
          {currentCountry ? (
            <span className="flex items-center gap-1">
              {currentCountry.flag} {currentCountry.name}
            </span>
          ) : (
            <span className="flex items-center gap-1">
              🌍 Choisir un pays
              <ChevronDown className="w-3 h-3" />
            </span>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 'country' ? (
              <>
                <Globe className="w-5 h-5" />
                Choisir votre pays de navigation
              </>
            ) : (
              <>
                <span className="text-xl">{pendingCountry?.flag}</span>
                {pendingCountry?.name} — Choisir la langue
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {step === 'country'
              ? 'Sélectionnez le pays dans lequel vous souhaitez naviguer.'
              : `Choisissez la langue de navigation pour ${pendingCountry?.name}.`}
          </DialogDescription>
        </DialogHeader>

        {step === 'country' && (
          <div className="flex flex-col gap-4 overflow-hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher un pays..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Tabs defaultValue="africa" className="flex-1 overflow-hidden flex flex-col">
              <TabsList className="grid w-full grid-cols-5 text-xs">
                <TabsTrigger value="africa">🌍 Afrique</TabsTrigger>
                <TabsTrigger value="caribbean">HAYTI</TabsTrigger>
                <TabsTrigger value="europe">🇪🇺 Europe</TabsTrigger>
                <TabsTrigger value="americas">🌎 Amériques</TabsTrigger>
                <TabsTrigger value="asia">🌏 Asie</TabsTrigger>
              </TabsList>

              <div className="overflow-y-auto flex-1 mt-4">
                <TabsContent value="africa" className="mt-0">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {filterCountries(africanCountries).map((country) => (
                      <CountryCard key={country.code} country={country} />
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="caribbean" className="mt-0">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {filterCountries(caribbeanCountries).map((country) => (
                      <CountryCard key={country.code} country={country} />
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="europe" className="mt-0">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {filterCountries(europeanCountries).map((country) => (
                      <CountryCard key={country.code} country={country} />
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="americas" className="mt-0">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {filterCountries(americasCountries).map((country) => (
                      <CountryCard key={country.code} country={country} />
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="asia" className="mt-0">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {filterCountries(asianCountries).map((country) => (
                      <CountryCard key={country.code} country={country} />
                    ))}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        )}

        {step === 'language' && pendingCountry && (
          <div className="flex flex-col gap-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900 mb-1">
                <strong>Pays sélectionné:</strong> {pendingCountry.flag} {pendingCountry.name}
              </p>
              {pendingCountry.capital && (
                <p className="text-xs text-blue-700">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  Capitale: {pendingCountry.capital}
                </p>
              )}

            </div>

            <div>
              <p className="text-sm font-semibold mb-3 text-gray-700">
                Dans quelle langue souhaitez-vous naviguer ?
              </p>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {availableLanguages.map((lang) => {
                  if (!lang) return null;
                  const isCurrentLang = language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageSelect(lang.code)}
                      className={`p-3 rounded-lg border text-left transition-all hover:bg-blue-50 hover:border-blue-300 ${
                        isCurrentLang
                          ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xl">{lang.flag}</span>
                        {isCurrentLang && <Check className="w-4 h-4 text-blue-600" />}
                      </div>
                      <p className="font-semibold text-sm">{lang.nativeName}</p>
                      <p className="text-xs text-gray-500">{lang.name}</p>
                    </button>
                  );
                })}
              </div>

              <div className="border-t pt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleKeepCurrentLanguage}
                >
                  Rester dans ma langue actuelle
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
