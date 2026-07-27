import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Globe, Heart, Languages as LanguagesIcon } from 'lucide-react';

function EmpireHaytiFlag({ size = 48 }: { size?: number }) {
  return (
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Flag_of_the_First_Empire_of_Haiti.svg/120px-Flag_of_the_First_Empire_of_Haiti.svg.png"
      alt="Drapeau de l'Empire d'Hayti"
      width={size * 1.5}
      height={size}
      style={{ borderRadius: 3, objectFit: 'cover', flexShrink: 0 }}
    />
  );
}

export function AfricaHaitiPride() {
  const africanCountries = [
    '🇩🇿 Algérie', '🇦🇴 Angola', '🇧🇯 Bénin', '🇧🇼 Botswana', '🇧🇫 Burkina Faso',
    '🇧🇮 Burundi', '🇨🇲 Cameroun', '🇨🇻 Cap-Vert', '🇨🇫 RCA', '🇹🇩 Tchad',
    '🇰🇲 Comores', '🇨🇬 Congo', '🇨🇩 RDC', '🇨🇮 Côte d\'Ivoire', '🇩🇯 Djibouti',
    '🇪🇬 Égypte', '🇬🇶 Guinée équatoriale', '🇪🇷 Érythrée', '🇸🇿 Eswatini', '🇪🇹 Éthiopie',
    '🇬🇦 Gabon', '🇬🇲 Gambie', '🇬🇭 Ghana', '🇬🇳 Guinée', '🇬🇼 Guinée-Bissau',
    '🇰🇪 Kenya', '🇱🇸 Lesotho', '🇱🇷 Liberia', '🇱🇾 Libye', '🇲🇬 Madagascar',
    '🇲🇼 Malawi', '🇲🇱 Mali', '🇲🇷 Mauritanie', '🇲🇺 Maurice', '🇲🇦 Maroc',
    '🇲🇿 Mozambique', '🇳🇦 Namibie', '🇳🇪 Niger', '🇳🇬 Nigeria', '🇷🇼 Rwanda',
    '🇸🇹 São Tomé', '🇸🇳 Sénégal', '🇸🇨 Seychelles', '🇸🇱 Sierra Leone', '🇸🇴 Somalie',
    '🇿🇦 Afrique du Sud', '🇸🇸 Soudan du Sud', '🇸🇩 Soudan', '🇹🇿 Tanzanie', '🇹🇬 Togo',
    '🇹🇳 Tunisie', '🇺🇬 Ouganda', '🇿🇲 Zambie', '🇿🇼 Zimbabwe'
  ];

  const creoleLanguages = [
    { flag: '🇭🇹', name: 'Kreyòl Ayisyen', region: 'HAYTI / AYITI' },
    { flag: '🇬🇵', name: 'Kreyòl Gwadloupéyen', region: 'Guadeloupe' },
    { flag: '🇲🇶', name: 'Kreyòl Matinnikè', region: 'Martinique' },
    { flag: '🇬🇫', name: 'Kreyòl Gwiyanè', region: 'Guyane' },
    { flag: '🇲🇺', name: 'Kreol Morisyen', region: 'Maurice' },
    { flag: '🇷🇪', name: 'Kréol Rénioné', region: 'La Réunion' },
    { flag: '🇸🇨', name: 'Kreol Seselwa', region: 'Seychelles' },
    { flag: '🇨🇻', name: 'Kriolu Kabuverdianu', region: 'Cap-Vert' },
    { flag: '🇬🇼', name: 'Kriyol', region: 'Guinée-Bissau' },
    { flag: '🇯🇲', name: 'Patwa', region: 'Jamaïque' },
    { flag: '🇹🇹', name: 'Trinidadian Creole', region: 'Trinidad' },
  ];

  const africanLanguages = [
    'العربية', 'Tamazight', 'Wolof', 'Hausa', 'Yorùbá', 'Igbo', 'Fulfulde',
    'Bamanankan', 'Eʋegbe', 'Twi', 'Akan', 'Mooré', 'Lingála', 'Kikongo',
    'Tshiluba', 'Kiswahili', 'Sängö', 'አማርኛ', 'Afaan Oromoo', 'ትግርኛ',
    'Soomaali', 'Ikinyarwanda', 'Ikirundi', 'Luganda', 'isiZulu', 'isiXhosa',
    'Sesotho', 'Setswana', 'chiShona', 'isiNdebele', 'Chichewa', 'Malagasy',
    'Português', 'Afrikaans'
  ];

  return (
    <div className="space-y-4">
      {/* Afrique */}
      <Card className="p-6 bg-gradient-to-br from-green-500 via-yellow-500 to-red-500 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 opacity-10 text-9xl">🌍</div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">52 Pays d'Afrique</h2>
              <p className="text-sm opacity-90">Afrika • Africa • أفريقيا</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {africanCountries.slice(0, 20).map((country, idx) => (
              <Badge key={idx} variant="secondary" className="bg-white/20 text-white border-white/30">
                {country}
              </Badge>
            ))}
            <Badge variant="secondary" className="bg-white/30 text-white border-white/50">
              +32 autres...
            </Badge>
          </div>
        </div>
      </Card>

      {/* HAYTI — Empire Dessalines */}
      <Card className="p-6 text-white overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #000000 0%, #1a0000 50%, #D21034 100%)' }}>
        <div className="absolute top-0 right-0 opacity-10 text-9xl">👑</div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <EmpireHaytiFlag size={56} />
            <div>
              <h2 className="text-2xl font-bold">HAYTI — AYITI 👑</h2>
              <p className="text-sm opacity-90">Empire d'Hayti • Jean-Jacques Dessalines • 1804</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-base">
              <strong>Kreyòl Ayisyen:</strong> Nou la pou tout pèp HAYTI ki ap vwayaje toupatou nan mond lan!
            </p>
            <p className="text-base">
              <strong>Fransè:</strong> Anakabo est fier de servir le peuple de HAYTI / AYITI partout dans le monde!
            </p>
            <p className="text-base">
              <strong>English:</strong> Anakabo proudly serves the people of HAYTI worldwide!
            </p>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <EmpireHaytiFlag size={24} />
            <span className="text-xs opacity-75">Drapeau de l'Empire d'Hayti — Dessalines 1804</span>
          </div>
        </div>
      </Card>

      {/* Langues créoles */}
      <Card className="p-6 bg-gradient-to-r from-red-700 to-black text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 opacity-10 text-9xl">🗺️</div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Langues Créoles du Monde</h2>
              <p className="text-sm opacity-90">Tous les peuples créolophones peuvent utiliser Anakabo</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {creoleLanguages.map((lang, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-white/10 rounded px-3 py-1">
                <span className="text-lg">{lang.flag}</span>
                <span className="font-semibold text-sm">{lang.name}</span>
                <span className="text-xs opacity-75 ml-auto">{lang.region}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Langues africaines */}
      <Card className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 opacity-10 text-9xl">🗣️</div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <LanguagesIcon className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">80+ Langues Supportées</h2>
              <p className="text-sm opacity-90">Langues africaines + créoles + langues mondiales</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {africanLanguages.map((lang, idx) => (
              <Badge key={idx} variant="secondary" className="bg-white/20 text-white border-white/30">
                {lang}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-white/30 text-white">🇬🇧 English (British)</Badge>
            <Badge variant="secondary" className="bg-white/30 text-white">🇺🇸 English (US)</Badge>
            <Badge variant="secondary" className="bg-white/30 text-white">🇨🇦 English (CA)</Badge>
            <Badge variant="secondary" className="bg-white/30 text-white">🇦🇺 English (AU)</Badge>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-r from-orange-500 to-pink-500 text-white">
        <div className="text-center space-y-3">
          <h3 className="text-xl font-bold">🎤 Assistant Vocal Multilingue</h3>
          <p className="text-base">
            Parlez dans votre langue maternelle — créole, africain, européen ou asiatique!
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            <Badge variant="secondary" className="bg-white/20 text-white">Kreyòl Ayisyen</Badge>
            <Badge variant="secondary" className="bg-white/20 text-white">Kreyòl Matinnikè</Badge>
            <Badge variant="secondary" className="bg-white/20 text-white">Kreol Morisyen</Badge>
            <Badge variant="secondary" className="bg-white/20 text-white">Wolof</Badge>
            <Badge variant="secondary" className="bg-white/20 text-white">Kiswahili</Badge>
            <Badge variant="secondary" className="bg-white/20 text-white">العربية</Badge>
            <Badge variant="secondary" className="bg-white/20 text-white">Hausa</Badge>
            <Badge variant="secondary" className="bg-white/20 text-white">Yorùbá</Badge>
            <Badge variant="secondary" className="bg-white/20 text-white">isiZulu</Badge>
            <Badge variant="secondary" className="bg-white/20 text-white">+ 70 autres</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
