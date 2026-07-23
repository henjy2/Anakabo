import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Globe, Heart, Languages as LanguagesIcon } from 'lucide-react';

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

  const languages = [
    'العربية', 'Tamazight', 'Wolof', 'Hausa', 'Yorùbá', 'Igbo', 'Fulfulde',
    'Bamanankan', 'Eʋegbe', 'Twi', 'Akan', 'Mooré', 'Lingála', 'Kikongo',
    'Tshiluba', 'Kiswahili', 'Sängö', 'አማርኛ', 'Afaan Oromoo', 'ትግርኛ',
    'Soomaali', 'Ikinyarwanda', 'Ikirundi', 'Luganda', 'isiZulu', 'isiXhosa',
    'Sesotho', 'Setswana', 'chiShona', 'isiNdebele', 'Chichewa', 'Malagasy',
    'Kreyòl Ayisyen', 'Fransè', 'English', 'Português', 'Afrikaans'
  ];

  return (
    <div className="space-y-4">
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

      <Card className="p-6 bg-gradient-to-r from-blue-600 via-red-600 to-blue-600 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 opacity-10 text-9xl">🇭🇹</div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Ayiti Cheri 🇭🇹</h2>
              <p className="text-sm opacity-90">Haiti • Haïti • Ayiti</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-base">
              <strong>Kreyòl Ayisyen:</strong> Nou la pou tout pèp ayisyen ki ap vwayaje toupatou nan mond lan!
            </p>
            <p className="text-base">
              <strong>Fransè:</strong> Anakabo est fier de servir le peuple haïtien partout dans le monde!
            </p>
            <p className="text-base">
              <strong>English:</strong> Anakabo proudly serves the Haitian people worldwide!
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 opacity-10 text-9xl">🗣️</div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <LanguagesIcon className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">70+ Langues Supportées</h2>
              <p className="text-sm opacity-90">Toutes les langues africaines + langues mondiales</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {languages.map((lang, idx) => (
              <Badge key={idx} variant="secondary" className="bg-white/20 text-white border-white/30">
                {lang}
              </Badge>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-r from-orange-500 to-pink-500 text-white">
        <div className="text-center space-y-3">
          <h3 className="text-xl font-bold">🎤 Assistant Vocal Multilingue</h3>
          <p className="text-base">
            Parlez dans votre langue maternelle ! Notre assistant vocal comprend et répond en :
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-3">
            <Badge variant="secondary" className="bg-white/20 text-white">Wolof</Badge>
            <Badge variant="secondary" className="bg-white/20 text-white">Kreyòl</Badge>
            <Badge variant="secondary" className="bg-white/20 text-white">Kiswahili</Badge>
            <Badge variant="secondary" className="bg-white/20 text-white">العربية</Badge>
            <Badge variant="secondary" className="bg-white/20 text-white">Hausa</Badge>
            <Badge variant="secondary" className="bg-white/20 text-white">Yorùbá</Badge>
            <Badge variant="secondary" className="bg-white/20 text-white">isiZulu</Badge>
            <Badge variant="secondary" className="bg-white/20 text-white">Amharique</Badge>
            <Badge variant="secondary" className="bg-white/20 text-white">Lingála</Badge>
            <Badge variant="secondary" className="bg-white/20 text-white">+ 60 autres</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
