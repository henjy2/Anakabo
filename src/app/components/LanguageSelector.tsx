import { useState } from 'react';
import { Languages, Volume2, VolumeX, Search, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { useLanguage } from '../contexts/LanguageContext';
import { languages, getAfricanLanguages, getHaitianLanguages } from '../utils/languages';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export function LanguageSelector() {
  const { language, setLanguage, isVoiceEnabled, setVoiceEnabled, t } = useLanguage();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const africanLanguages = getAfricanLanguages();
  const haitianLanguages = getHaitianLanguages();
  const internationalLanguages = languages.filter(
    lang => !africanLanguages.includes(lang) && !haitianLanguages.includes(lang)
  );

  const filterLanguages = (langs: typeof languages) => {
    if (!search) return langs;
    return langs.filter(
      lang =>
        lang.name.toLowerCase().includes(search.toLowerCase()) ||
        lang.nativeName.toLowerCase().includes(search.toLowerCase()) ||
        lang.region.toLowerCase().includes(search.toLowerCase())
    );
  };

  const currentLanguage = languages.find(l => l.code === language);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Languages className="w-4 h-4" />
          {currentLanguage?.flag} {currentLanguage?.nativeName || 'Français'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Languages className="w-5 h-5" />
            {t('languages')} & {t('voiceAssistant')}
          </DialogTitle>
          <DialogDescription>
            Choisissez votre langue de navigation et configurez l'assistant vocal.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Voice Assistant Toggle */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              {isVoiceEnabled ? <Volume2 className="w-5 h-5 text-blue-600" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
              <div>
                <Label htmlFor="voice-toggle" className="text-base font-semibold cursor-pointer">
                  {t('voiceAssistant')}
                </Label>
                <p className="text-sm text-gray-600">Navigation vocale guidée dans votre langue</p>
              </div>
            </div>
            <Switch
              id="voice-toggle"
              checked={isVoiceEnabled}
              onCheckedChange={setVoiceEnabled}
            />
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Rechercher une langue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Language Categories */}
          <Tabs defaultValue="africa" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="africa">
                🌍 Afrique ({africanLanguages.length})
              </TabsTrigger>
              <TabsTrigger value="haiti">
                🇭🇹 Haïti ({haitianLanguages.length})
              </TabsTrigger>
              <TabsTrigger value="world">
                🌎 Monde ({internationalLanguages.length})
              </TabsTrigger>
            </TabsList>

            <div className="overflow-y-auto max-h-96 mt-4">
              <TabsContent value="africa" className="mt-0">
                <div className="grid grid-cols-2 gap-2">
                  {filterLanguages(africanLanguages).map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setOpen(false);
                      }}
                      className={`p-3 rounded-lg border text-left transition-all hover:bg-gray-50 ${
                        language === lang.code
                          ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xl">{lang.flag}</span>
                        {language === lang.code && <Check className="w-4 h-4 text-blue-600" />}
                      </div>
                      <p className="font-semibold text-sm">{lang.nativeName}</p>
                      <p className="text-xs text-gray-500">{lang.name}</p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {lang.region}
                      </Badge>
                    </button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="haiti" className="mt-0">
                <div className="grid grid-cols-2 gap-2">
                  {filterLanguages(haitianLanguages).map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setOpen(false);
                      }}
                      className={`p-3 rounded-lg border text-left transition-all hover:bg-gray-50 ${
                        language === lang.code
                          ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xl">{lang.flag}</span>
                        {language === lang.code && <Check className="w-4 h-4 text-blue-600" />}
                      </div>
                      <p className="font-semibold text-sm">{lang.nativeName}</p>
                      <p className="text-xs text-gray-500">{lang.name}</p>
                    </button>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-900">
                    🇭🇹 <strong>Ayiti Cheri!</strong> Anakabo fèt pou tout moun k ap vwayaje nan Karayib la ak toupatou nan mond lan.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="world" className="mt-0">
                <div className="grid grid-cols-2 gap-2">
                  {filterLanguages(internationalLanguages).map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setOpen(false);
                      }}
                      className={`p-3 rounded-lg border text-left transition-all hover:bg-gray-50 ${
                        language === lang.code
                          ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-200'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xl">{lang.flag}</span>
                        {language === lang.code && <Check className="w-4 h-4 text-blue-600" />}
                      </div>
                      <p className="font-semibold text-sm">{lang.nativeName}</p>
                      <p className="text-xs text-gray-500">{lang.name}</p>
                    </button>
                  ))}
                </div>
              </TabsContent>
            </div>
          </Tabs>

          {/* Info */}
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-900">
              ✨ <strong>52 pays d'Afrique + Haïti + 25+ langues internationales</strong> - Navigation dans votre langue maternelle!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
