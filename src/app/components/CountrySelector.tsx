import { useState } from 'react';
import { Globe, MapPin, Search, Check, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { getCountrySections, type Country } from '../utils/countries';
import { useCountry } from '../contexts/CountryContext';

export function CountrySelector() {
  const { selectedCountry, setSelectedCountry } = useCountry();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filterCountries = (list: Country[]) => {
    if (!search) return list;
    return list.filter(
      c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.nativeName.toLowerCase().includes(search.toLowerCase())
    );
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setOpen(false);
    setSearch('');
  };

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

  const RegionList = ({ region }: { region: Country['region'] }) => (
    <div className="flex flex-col gap-5">
      {getCountrySections(region).map(section => {
        const visibleCountries = filterCountries(section.countries);
        if (visibleCountries.length === 0) return null;
        return (
          <section key={section.label || region}>
            {section.label && (
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                {section.label}
              </h3>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {visibleCountries.map(country => <CountryCard key={country.code} country={country} />)}
            </div>
          </section>
        );
      })}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            <Globe className="w-5 h-5" />
            Choisir votre pays de navigation
          </DialogTitle>
          <DialogDescription>
            Sélectionnez le pays dans lequel vous souhaitez naviguer. La langue se règle séparément dans Paramètres.
          </DialogDescription>
        </DialogHeader>

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
              <TabsList className="grid h-auto w-full grid-cols-3 sm:grid-cols-6 text-xs">
                <TabsTrigger value="africa">🌍 Afrique</TabsTrigger>
                <TabsTrigger value="caribbean">HAYTI</TabsTrigger>
                <TabsTrigger value="europe">🇪🇺 Europe</TabsTrigger>
                <TabsTrigger value="americas">🌎 Amériques</TabsTrigger>
                <TabsTrigger value="asia">🌏 Asie</TabsTrigger>
                <TabsTrigger value="oceania">🌊 Océanie</TabsTrigger>
              </TabsList>

              <div className="overflow-y-auto flex-1 mt-4">
                <TabsContent value="africa" className="mt-0">
                  <RegionList region="africa" />
                </TabsContent>
                <TabsContent value="caribbean" className="mt-0">
                  <RegionList region="caribbean" />
                </TabsContent>
                <TabsContent value="europe" className="mt-0">
                  <RegionList region="europe" />
                </TabsContent>
                <TabsContent value="americas" className="mt-0">
                  <RegionList region="americas" />
                </TabsContent>
                <TabsContent value="asia" className="mt-0">
                  <RegionList region="asia" />
                </TabsContent>
                <TabsContent value="oceania" className="mt-0">
                  <RegionList region="oceania" />
                </TabsContent>
              </div>
            </Tabs>
          </div>
      </DialogContent>
    </Dialog>
  );
}
