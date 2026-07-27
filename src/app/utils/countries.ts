export interface Country {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  region: 'africa' | 'caribbean' | 'europe' | 'americas' | 'asia' | 'oceania';
  coordinates: [number, number];
  zoom: number;
  languages: string[];
  currency?: string;
  capital?: string;
}

export const countries: Country[] = [
  // Afrique du Nord
  { code: 'DZ', name: 'Algeria', nativeName: 'الجزائر', flag: '🇩🇿', region: 'africa', coordinates: [3.0588, 36.7538], zoom: 5, languages: ['ar', 'ber', 'fr'], currency: 'DZD', capital: 'Alger' },
  { code: 'EG', name: 'Egypt', nativeName: 'مصر', flag: '🇪🇬', region: 'africa', coordinates: [31.2357, 30.0444], zoom: 5, languages: ['ar', 'ar-eg'], currency: 'EGP', capital: 'Le Caire' },
  { code: 'LY', name: 'Libya', nativeName: 'ليبيا', flag: '🇱🇾', region: 'africa', coordinates: [13.1913, 32.8872], zoom: 5, languages: ['ar'], currency: 'LYD', capital: 'Tripoli' },
  { code: 'MA', name: 'Morocco', nativeName: 'المغرب', flag: '🇲🇦', region: 'africa', coordinates: [-6.8498, 34.0209], zoom: 5, languages: ['ar', 'ber', 'fr'], currency: 'MAD', capital: 'Rabat' },
  { code: 'TN', name: 'Tunisia', nativeName: 'تونس', flag: '🇹🇳', region: 'africa', coordinates: [9.5375, 33.8869], zoom: 6, languages: ['ar', 'fr'], currency: 'TND', capital: 'Tunis' },
  { code: 'SD', name: 'Sudan', nativeName: 'السودان', flag: '🇸🇩', region: 'africa', coordinates: [30.2176, 15.5007], zoom: 5, languages: ['ar'], currency: 'SDG', capital: 'Khartoum' },

  // Afrique de l'Ouest
  { code: 'SN', name: 'Senegal', nativeName: 'Sénégal', flag: '🇸🇳', region: 'africa', coordinates: [-14.4524, 14.4974], zoom: 6, languages: ['fr', 'wo', 'ff'], currency: 'XOF', capital: 'Dakar' },
  { code: 'NG', name: 'Nigeria', nativeName: 'Nigeria', flag: '🇳🇬', region: 'africa', coordinates: [8.6753, 9.0820], zoom: 5, languages: ['en', 'ha', 'yo', 'ig'], currency: 'NGN', capital: 'Abuja' },
  { code: 'GH', name: 'Ghana', nativeName: 'Ghana', flag: '🇬🇭', region: 'africa', coordinates: [-1.0232, 7.9465], zoom: 6, languages: ['en', 'tw', 'ak', 'ee'], currency: 'GHS', capital: 'Accra' },
  { code: 'CI', name: "Côte d'Ivoire", nativeName: 'Côte d\'Ivoire', flag: '🇨🇮', region: 'africa', coordinates: [-5.5471, 7.5400], zoom: 6, languages: ['fr'], currency: 'XOF', capital: 'Abidjan' },
  { code: 'ML', name: 'Mali', nativeName: 'Mali', flag: '🇲🇱', region: 'africa', coordinates: [-1.9317, 17.5707], zoom: 5, languages: ['fr', 'bm'], currency: 'XOF', capital: 'Bamako' },
  { code: 'BF', name: 'Burkina Faso', nativeName: 'Burkina Faso', flag: '🇧🇫', region: 'africa', coordinates: [-1.5616, 12.3641], zoom: 6, languages: ['fr', 'mos'], currency: 'XOF', capital: 'Ouagadougou' },
  { code: 'GN', name: 'Guinea', nativeName: 'Guinée', flag: '🇬🇳', region: 'africa', coordinates: [-11.3872, 11.8636], zoom: 6, languages: ['fr', 'ff'], currency: 'GNF', capital: 'Conakry' },
  { code: 'TG', name: 'Togo', nativeName: 'Togo', flag: '🇹🇬', region: 'africa', coordinates: [0.8248, 8.6195], zoom: 6, languages: ['fr', 'ee'], currency: 'XOF', capital: 'Lomé' },
  { code: 'BJ', name: 'Benin', nativeName: 'Bénin', flag: '🇧🇯', region: 'africa', coordinates: [2.3158, 9.3077], zoom: 6, languages: ['fr'], currency: 'XOF', capital: 'Porto-Novo' },
  { code: 'NE', name: 'Niger', nativeName: 'Niger', flag: '🇳🇪', region: 'africa', coordinates: [8.0817, 17.6078], zoom: 5, languages: ['fr', 'ha'], currency: 'XOF', capital: 'Niamey' },
  { code: 'MR', name: 'Mauritania', nativeName: 'موريتانيا', flag: '🇲🇷', region: 'africa', coordinates: [-10.9408, 21.0079], zoom: 5, languages: ['ar', 'fr'], currency: 'MRU', capital: 'Nouakchott' },
  { code: 'SL', name: 'Sierra Leone', nativeName: 'Sierra Leone', flag: '🇸🇱', region: 'africa', coordinates: [-11.7798, 8.4606], zoom: 7, languages: ['en', 'kri'], currency: 'SLL', capital: 'Freetown' },
  { code: 'LR', name: 'Liberia', nativeName: 'Liberia', flag: '🇱🇷', region: 'africa', coordinates: [-9.4295, 6.4281], zoom: 7, languages: ['en'], currency: 'LRD', capital: 'Monrovia' },
  { code: 'GM', name: 'Gambia', nativeName: 'Gambia', flag: '🇬🇲', region: 'africa', coordinates: [-15.3101, 13.4432], zoom: 8, languages: ['en', 'wo'], currency: 'GMD', capital: 'Banjul' },
  { code: 'GW', name: 'Guinea-Bissau', nativeName: 'Guiné-Bissau', flag: '🇬🇼', region: 'africa', coordinates: [-15.1804, 11.8037], zoom: 7, languages: ['pt'], currency: 'XOF', capital: 'Bissau' },
  { code: 'CV', name: 'Cape Verde', nativeName: 'Cabo Verde', flag: '🇨🇻', region: 'africa', coordinates: [-23.6000, 15.1111], zoom: 8, languages: ['pt'], currency: 'CVE', capital: 'Praia' },

  // Afrique Centrale
  { code: 'CD', name: 'DR Congo', nativeName: 'Congo (RDC)', flag: '🇨🇩', region: 'africa', coordinates: [24.6872, -2.8768], zoom: 5, languages: ['fr', 'ln', 'sw', 'kg', 'lua'], currency: 'CDF', capital: 'Kinshasa' },
  { code: 'CG', name: 'Congo', nativeName: 'Congo', flag: '🇨🇬', region: 'africa', coordinates: [15.1927, -0.2280], zoom: 6, languages: ['fr', 'ln', 'kg'], currency: 'XAF', capital: 'Brazzaville' },
  { code: 'CM', name: 'Cameroon', nativeName: 'Cameroun', flag: '🇨🇲', region: 'africa', coordinates: [12.3547, 5.8958], zoom: 6, languages: ['fr', 'en'], currency: 'XAF', capital: 'Yaoundé' },
  { code: 'CF', name: 'Central African Republic', nativeName: 'Centrafrique', flag: '🇨🇫', region: 'africa', coordinates: [21.0000, 6.5000], zoom: 6, languages: ['fr', 'sg'], currency: 'XAF', capital: 'Bangui' },
  { code: 'TD', name: 'Chad', nativeName: 'Tchad', flag: '🇹🇩', region: 'africa', coordinates: [18.7322, 15.4542], zoom: 5, languages: ['fr', 'ar'], currency: 'XAF', capital: "N'Djaména" },
  { code: 'GA', name: 'Gabon', nativeName: 'Gabon', flag: '🇬🇦', region: 'africa', coordinates: [11.6094, -0.8037], zoom: 6, languages: ['fr'], currency: 'XAF', capital: 'Libreville' },
  { code: 'GQ', name: 'Equatorial Guinea', nativeName: 'Guinea Ecuatorial', flag: '🇬🇶', region: 'africa', coordinates: [10.2679, 1.6508], zoom: 7, languages: ['es', 'fr', 'pt'], currency: 'XAF', capital: 'Malabo' },
  { code: 'ST', name: 'São Tomé and Príncipe', nativeName: 'São Tomé e Príncipe', flag: '🇸🇹', region: 'africa', coordinates: [6.6131, 0.1864], zoom: 10, languages: ['pt'], currency: 'STN', capital: 'São Tomé' },

  // Afrique de l'Est
  { code: 'ET', name: 'Ethiopia', nativeName: 'ኢትዮጵያ', flag: '🇪🇹', region: 'africa', coordinates: [40.4897, 9.1450], zoom: 5, languages: ['am', 'om', 'ti'], currency: 'ETB', capital: 'Addis-Abeba' },
  { code: 'KE', name: 'Kenya', nativeName: 'Kenya', flag: '🇰🇪', region: 'africa', coordinates: [37.9062, -0.0236], zoom: 6, languages: ['sw', 'en'], currency: 'KES', capital: 'Nairobi' },
  { code: 'TZ', name: 'Tanzania', nativeName: 'Tanzania', flag: '🇹🇿', region: 'africa', coordinates: [34.8888, -6.3690], zoom: 5, languages: ['sw', 'en'], currency: 'TZS', capital: 'Dodoma' },
  { code: 'UG', name: 'Uganda', nativeName: 'Uganda', flag: '🇺🇬', region: 'africa', coordinates: [32.2903, 1.3733], zoom: 6, languages: ['en', 'sw', 'lg'], currency: 'UGX', capital: 'Kampala' },
  { code: 'RW', name: 'Rwanda', nativeName: 'Rwanda', flag: '🇷🇼', region: 'africa', coordinates: [29.8739, -1.9403], zoom: 8, languages: ['rw', 'fr', 'en'], currency: 'RWF', capital: 'Kigali' },
  { code: 'BI', name: 'Burundi', nativeName: 'Burundi', flag: '🇧🇮', region: 'africa', coordinates: [29.9189, -3.3731], zoom: 8, languages: ['rn', 'fr', 'sw'], currency: 'BIF', capital: 'Gitega' },
  { code: 'SO', name: 'Somalia', nativeName: 'Soomaaliya', flag: '🇸🇴', region: 'africa', coordinates: [45.3182, 5.1521], zoom: 5, languages: ['so', 'ar'], currency: 'SOS', capital: 'Mogadiscio' },
  { code: 'DJ', name: 'Djibouti', nativeName: 'Djibouti', flag: '🇩🇯', region: 'africa', coordinates: [42.5903, 11.8251], zoom: 8, languages: ['fr', 'ar'], currency: 'DJF', capital: 'Djibouti' },
  { code: 'ER', name: 'Eritrea', nativeName: 'ኤርትራ', flag: '🇪🇷', region: 'africa', coordinates: [39.7823, 15.1794], zoom: 6, languages: ['ti', 'ar'], currency: 'ERN', capital: 'Asmara' },
  { code: 'SS', name: 'South Sudan', nativeName: 'South Sudan', flag: '🇸🇸', region: 'africa', coordinates: [31.3070, 6.8770], zoom: 6, languages: ['en', 'ar'], currency: 'SSP', capital: 'Juba' },

  // Afrique Australe
  { code: 'ZA', name: 'South Africa', nativeName: 'South Africa', flag: '🇿🇦', region: 'africa', coordinates: [22.9375, -30.5595], zoom: 5, languages: ['zu', 'xh', 'af', 'st', 'tn', 'en'], currency: 'ZAR', capital: 'Pretoria' },
  { code: 'ZW', name: 'Zimbabwe', nativeName: 'Zimbabwe', flag: '🇿🇼', region: 'africa', coordinates: [29.1549, -19.0154], zoom: 6, languages: ['sn', 'nd', 'en'], currency: 'ZWL', capital: 'Harare' },
  { code: 'ZM', name: 'Zambia', nativeName: 'Zambia', flag: '🇿🇲', region: 'africa', coordinates: [27.8493, -13.1339], zoom: 6, languages: ['en', 'ny'], currency: 'ZMW', capital: 'Lusaka' },
  { code: 'MZ', name: 'Mozambique', nativeName: 'Moçambique', flag: '🇲🇿', region: 'africa', coordinates: [34.3015, -18.6657], zoom: 5, languages: ['pt'], currency: 'MZN', capital: 'Maputo' },
  { code: 'MW', name: 'Malawi', nativeName: 'Malawi', flag: '🇲🇼', region: 'africa', coordinates: [34.3015, -13.2543], zoom: 6, languages: ['ny', 'en'], currency: 'MWK', capital: 'Lilongwe' },
  { code: 'MG', name: 'Madagascar', nativeName: 'Madagasikara', flag: '🇲🇬', region: 'africa', coordinates: [46.8691, -18.7669], zoom: 5, languages: ['mg', 'fr'], currency: 'MGA', capital: 'Antananarivo' },
  { code: 'AO', name: 'Angola', nativeName: 'Angola', flag: '🇦🇴', region: 'africa', coordinates: [17.8739, -11.2027], zoom: 5, languages: ['pt'], currency: 'AOA', capital: 'Luanda' },
  { code: 'NA', name: 'Namibia', nativeName: 'Namibia', flag: '🇳🇦', region: 'africa', coordinates: [18.4904, -22.9576], zoom: 5, languages: ['en', 'af'], currency: 'NAD', capital: 'Windhoek' },
  { code: 'BW', name: 'Botswana', nativeName: 'Botswana', flag: '🇧🇼', region: 'africa', coordinates: [24.6849, -22.3285], zoom: 6, languages: ['en', 'tn'], currency: 'BWP', capital: 'Gaborone' },
  { code: 'LS', name: 'Lesotho', nativeName: 'Lesotho', flag: '🇱🇸', region: 'africa', coordinates: [28.2336, -29.6100], zoom: 7, languages: ['st', 'en'], currency: 'LSL', capital: 'Maseru' },
  { code: 'SZ', name: 'Eswatini', nativeName: 'eSwatini', flag: '🇸🇿', region: 'africa', coordinates: [31.4659, -26.5225], zoom: 8, languages: ['ss', 'en'], currency: 'SZL', capital: 'Mbabane' },
  { code: 'MU', name: 'Mauritius', nativeName: 'Maurice', flag: '🇲🇺', region: 'africa', coordinates: [57.5522, -20.3484], zoom: 10, languages: ['en', 'fr'], currency: 'MUR', capital: 'Port Louis' },
  { code: 'SC', name: 'Seychelles', nativeName: 'Seychelles', flag: '🇸🇨', region: 'africa', coordinates: [55.4920, -4.6796], zoom: 10, languages: ['fr', 'en'], currency: 'SCR', capital: 'Victoria' },
  { code: 'KM', name: 'Comoros', nativeName: 'جزر القمر', flag: '🇰🇲', region: 'africa', coordinates: [43.8722, -11.6455], zoom: 9, languages: ['ar', 'fr'], currency: 'KMF', capital: 'Moroni' },

  // HAYTI / AYITI et Caraïbes
  { code: 'HT', name: 'HAYTI', nativeName: 'AYITI', flag: '🇭🇹', region: 'caribbean', coordinates: [-72.2852, 18.9712], zoom: 8, languages: ['ht', 'fr-ht'], currency: 'HTG', capital: 'Pòtoprens' },
  { code: 'DO', name: 'Dominican Republic', nativeName: 'República Dominicana', flag: '🇩🇴', region: 'caribbean', coordinates: [-70.1627, 18.7357], zoom: 8, languages: ['es'], currency: 'DOP', capital: 'Saint-Domingue' },
  { code: 'JM', name: 'Jamaica', nativeName: 'Jamaica', flag: '🇯🇲', region: 'caribbean', coordinates: [-77.2975, 18.1096], zoom: 9, languages: ['en'], currency: 'JMD', capital: 'Kingston' },
  { code: 'TT', name: 'Trinidad and Tobago', nativeName: 'Trinidad and Tobago', flag: '🇹🇹', region: 'caribbean', coordinates: [-61.2225, 10.6918], zoom: 9, languages: ['en', 'fr'], currency: 'TTD', capital: 'Port of Spain' },
  { code: 'BB', name: 'Barbados', nativeName: 'Barbados', flag: '🇧🇧', region: 'caribbean', coordinates: [-59.5432, 13.1939], zoom: 11, languages: ['en'], currency: 'BBD', capital: 'Bridgetown' },
  { code: 'GP', name: 'Guadeloupe', nativeName: 'Guadeloupe', flag: '🇬🇵', region: 'caribbean', coordinates: [-61.5510, 16.2650], zoom: 9, languages: ['fr'], currency: 'EUR', capital: 'Basse-Terre' },
  { code: 'MQ', name: 'Martinique', nativeName: 'Martinique', flag: '🇲🇶', region: 'caribbean', coordinates: [-61.0242, 14.6415], zoom: 9, languages: ['fr'], currency: 'EUR', capital: 'Fort-de-France' },

  // Europe
  { code: 'FR', name: 'France', nativeName: 'France', flag: '🇫🇷', region: 'europe', coordinates: [2.3522, 48.8566], zoom: 5, languages: ['fr'], currency: 'EUR', capital: 'Paris' },
  { code: 'GB', name: 'United Kingdom', nativeName: 'United Kingdom', flag: '🇬🇧', region: 'europe', coordinates: [-0.1276, 51.5074], zoom: 5, languages: ['en-gb'], currency: 'GBP', capital: 'Londres' },
  { code: 'DE', name: 'Germany', nativeName: 'Deutschland', flag: '🇩🇪', region: 'europe', coordinates: [13.4050, 52.5200], zoom: 5, languages: ['de'], currency: 'EUR', capital: 'Berlin' },
  { code: 'ES', name: 'Spain', nativeName: 'España', flag: '🇪🇸', region: 'europe', coordinates: [-3.7038, 40.4168], zoom: 5, languages: ['es'], currency: 'EUR', capital: 'Madrid' },
  { code: 'IT', name: 'Italy', nativeName: 'Italia', flag: '🇮🇹', region: 'europe', coordinates: [12.4964, 41.9028], zoom: 5, languages: ['it'], currency: 'EUR', capital: 'Rome' },
  { code: 'PT', name: 'Portugal', nativeName: 'Portugal', flag: '🇵🇹', region: 'europe', coordinates: [-9.1393, 38.7223], zoom: 6, languages: ['pt'], currency: 'EUR', capital: 'Lisbonne' },
  { code: 'BE', name: 'Belgium', nativeName: 'Belgique', flag: '🇧🇪', region: 'europe', coordinates: [4.3517, 50.8503], zoom: 7, languages: ['fr', 'nl', 'de'], currency: 'EUR', capital: 'Bruxelles' },
  { code: 'CH', name: 'Switzerland', nativeName: 'Schweiz', flag: '🇨🇭', region: 'europe', coordinates: [7.4474, 46.9481], zoom: 7, languages: ['fr', 'de', 'it'], currency: 'CHF', capital: 'Berne' },
  { code: 'NL', name: 'Netherlands', nativeName: 'Nederland', flag: '🇳🇱', region: 'europe', coordinates: [4.9041, 52.3676], zoom: 7, languages: ['nl'], currency: 'EUR', capital: 'Amsterdam' },
  { code: 'PL', name: 'Poland', nativeName: 'Polska', flag: '🇵🇱', region: 'europe', coordinates: [21.0122, 52.2297], zoom: 6, languages: ['pl'], currency: 'PLN', capital: 'Varsovie' },
  { code: 'RU', name: 'Russia', nativeName: 'Россия', flag: '🇷🇺', region: 'europe', coordinates: [37.6173, 55.7558], zoom: 3, languages: ['ru'], currency: 'RUB', capital: 'Moscou' },
  { code: 'UA', name: 'Ukraine', nativeName: 'Україна', flag: '🇺🇦', region: 'europe', coordinates: [30.5234, 50.4501], zoom: 5, languages: ['uk'], currency: 'UAH', capital: 'Kiev' },
  { code: 'GR', name: 'Greece', nativeName: 'Ελλάδα', flag: '🇬🇷', region: 'europe', coordinates: [23.7275, 37.9838], zoom: 6, languages: ['el'], currency: 'EUR', capital: 'Athènes' },
  { code: 'RE', name: 'La Réunion', nativeName: 'La Réunion', flag: '🇷🇪', region: 'europe', coordinates: [55.4513, -21.1151], zoom: 9, languages: ['fr'], currency: 'EUR', capital: 'Saint-Denis' },
  { code: 'GF', name: 'Guyane française', nativeName: 'Guyane', flag: '🇬🇫', region: 'americas', coordinates: [-53.1258, 3.9339], zoom: 6, languages: ['fr'], currency: 'EUR', capital: 'Cayenne' },

  // Amériques
  { code: 'US', name: 'United States', nativeName: 'United States', flag: '🇺🇸', region: 'americas', coordinates: [-95.7129, 37.0902], zoom: 4, languages: ['en-us'], currency: 'USD', capital: 'Washington' },
  { code: 'CA', name: 'Canada', nativeName: 'Canada', flag: '🇨🇦', region: 'americas', coordinates: [-106.3468, 56.1304], zoom: 3, languages: ['en-ca', 'fr'], currency: 'CAD', capital: 'Ottawa' },
  { code: 'BR', name: 'Brazil', nativeName: 'Brasil', flag: '🇧🇷', region: 'americas', coordinates: [-51.9253, -14.2350], zoom: 4, languages: ['pt'], currency: 'BRL', capital: 'Brasília' },
  { code: 'MX', name: 'Mexico', nativeName: 'México', flag: '🇲🇽', region: 'americas', coordinates: [-102.5528, 23.6345], zoom: 4, languages: ['es'], currency: 'MXN', capital: 'Mexico' },
  { code: 'AR', name: 'Argentina', nativeName: 'Argentina', flag: '🇦🇷', region: 'americas', coordinates: [-63.6167, -38.4161], zoom: 4, languages: ['es'], currency: 'ARS', capital: 'Buenos Aires' },
  { code: 'CO', name: 'Colombia', nativeName: 'Colombia', flag: '🇨🇴', region: 'americas', coordinates: [-74.2973, 4.5709], zoom: 5, languages: ['es'], currency: 'COP', capital: 'Bogotá' },
  { code: 'CL', name: 'Chile', nativeName: 'Chile', flag: '🇨🇱', region: 'americas', coordinates: [-71.5430, -35.6751], zoom: 4, languages: ['es'], currency: 'CLP', capital: 'Santiago' },
  { code: 'PE', name: 'Peru', nativeName: 'Perú', flag: '🇵🇪', region: 'americas', coordinates: [-75.0152, -9.1900], zoom: 5, languages: ['es'], currency: 'PEN', capital: 'Lima' },
  { code: 'VE', name: 'Venezuela', nativeName: 'Venezuela', flag: '🇻🇪', region: 'americas', coordinates: [-66.5897, 6.4238], zoom: 5, languages: ['es'], currency: 'VES', capital: 'Caracas' },

  // Asie
  { code: 'CN', name: 'China', nativeName: '中国', flag: '🇨🇳', region: 'asia', coordinates: [104.1954, 35.8617], zoom: 3, languages: ['zh'], currency: 'CNY', capital: 'Pékin' },
  { code: 'JP', name: 'Japan', nativeName: '日本', flag: '🇯🇵', region: 'asia', coordinates: [138.2529, 36.2048], zoom: 5, languages: ['ja'], currency: 'JPY', capital: 'Tokyo' },
  { code: 'IN', name: 'India', nativeName: 'भारत', flag: '🇮🇳', region: 'asia', coordinates: [78.9629, 20.5937], zoom: 4, languages: ['hi', 'en'], currency: 'INR', capital: 'New Delhi' },
  { code: 'KR', name: 'South Korea', nativeName: '한국', flag: '🇰🇷', region: 'asia', coordinates: [127.7669, 35.9078], zoom: 6, languages: ['ko'], currency: 'KRW', capital: 'Séoul' },
  { code: 'SA', name: 'Saudi Arabia', nativeName: 'المملكة العربية السعودية', flag: '🇸🇦', region: 'asia', coordinates: [45.0792, 23.8859], zoom: 5, languages: ['ar'], currency: 'SAR', capital: 'Riyad' },
  { code: 'TR', name: 'Turkey', nativeName: 'Türkiye', flag: '🇹🇷', region: 'asia', coordinates: [35.2433, 38.9637], zoom: 5, languages: ['tr'], currency: 'TRY', capital: 'Ankara' },
  { code: 'ID', name: 'Indonesia', nativeName: 'Indonesia', flag: '🇮🇩', region: 'asia', coordinates: [113.9213, -0.7893], zoom: 4, languages: ['id'], currency: 'IDR', capital: 'Jakarta' },
  { code: 'PK', name: 'Pakistan', nativeName: 'پاکستان', flag: '🇵🇰', region: 'asia', coordinates: [69.3451, 30.3753], zoom: 5, languages: ['ur', 'en'], currency: 'PKR', capital: 'Islamabad' },
  { code: 'BD', name: 'Bangladesh', nativeName: 'বাংলাদেশ', flag: '🇧🇩', region: 'asia', coordinates: [90.3563, 23.6850], zoom: 6, languages: ['bn'], currency: 'BDT', capital: 'Dhaka' },
  { code: 'TH', name: 'Thailand', nativeName: 'ประเทศไทย', flag: '🇹🇭', region: 'asia', coordinates: [100.9925, 15.8700], zoom: 5, languages: ['th'], currency: 'THB', capital: 'Bangkok' },
  { code: 'VN', name: 'Vietnam', nativeName: 'Việt Nam', flag: '🇻🇳', region: 'asia', coordinates: [108.2772, 14.0583], zoom: 5, languages: ['vi'], currency: 'VND', capital: 'Hanoï' },
  { code: 'PH', name: 'Philippines', nativeName: 'Pilipinas', flag: '🇵🇭', region: 'asia', coordinates: [121.7740, 12.8797], zoom: 5, languages: ['tl', 'en'], currency: 'PHP', capital: 'Manille' },
  { code: 'MY', name: 'Malaysia', nativeName: 'Malaysia', flag: '🇲🇾', region: 'asia', coordinates: [109.6976, 4.2105], zoom: 5, languages: ['ms', 'en'], currency: 'MYR', capital: 'Kuala Lumpur' },

  // Océanie
  { code: 'AU', name: 'Australia', nativeName: 'Australia', flag: '🇦🇺', region: 'oceania', coordinates: [133.7751, -25.2744], zoom: 3, languages: ['en-au'], currency: 'AUD', capital: 'Canberra' },
  { code: 'NZ', name: 'New Zealand', nativeName: 'New Zealand', flag: '🇳🇿', region: 'oceania', coordinates: [174.8860, -40.9006], zoom: 5, languages: ['en'], currency: 'NZD', capital: 'Wellington' },
];

export const getCountriesByRegion = (region: Country['region']) =>
  countries.filter(c => c.region === region);

export const getAfricanCountries = () => getCountriesByRegion('africa');
export const getCaribbeanCountries = () => getCountriesByRegion('caribbean');
export const getEuropeanCountries = () => getCountriesByRegion('europe');
export const getAmericasCountries = () => getCountriesByRegion('americas');
export const getAsianCountries = () => getCountriesByRegion('asia');
export const getWorldCountries = () => countries.filter(c => !['africa'].includes(c.region));

export const getLanguagesForCountry = (countryCode: string) => {
  const country = countries.find(c => c.code === countryCode);
  return country?.languages ?? ['fr'];
};

export const getCountryCenter = (countryCode: string): [number, number] => {
  const country = countries.find(c => c.code === countryCode);
  return country?.coordinates ?? [20, 5];
};

export const getCountryZoom = (countryCode: string): number => {
  const country = countries.find(c => c.code === countryCode);
  return country?.zoom ?? 5;
};
