export interface Language {
  code: string;
  name: string;
  nativeName: string;
  region: string;
  flag: string;
}

export const languages: Language[] = [
  // Afrique du Nord
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', region: 'North Africa', flag: '🇩🇿' },
  { code: 'ber', name: 'Berber', nativeName: 'Tamazight', region: 'North Africa', flag: '🇲🇦' },
  { code: 'ar-eg', name: 'Egyptian Arabic', nativeName: 'العربية المصرية', region: 'Egypt', flag: '🇪🇬' },

  // Afrique de l'Ouest
  { code: 'wo', name: 'Wolof', nativeName: 'Wolof', region: 'Senegal', flag: '🇸🇳' },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa', region: 'West Africa', flag: '🇳🇬' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá', region: 'Nigeria', flag: '🇳🇬' },
  { code: 'ig', name: 'Igbo', nativeName: 'Igbo', region: 'Nigeria', flag: '🇳🇬' },
  { code: 'ff', name: 'Fulah', nativeName: 'Fulfulde', region: 'West Africa', flag: '🇸🇳' },
  { code: 'bm', name: 'Bambara', nativeName: 'Bamanankan', region: 'Mali', flag: '🇲🇱' },
  { code: 'ee', name: 'Ewe', nativeName: 'Eʋegbe', region: 'Ghana/Togo', flag: '🇬🇭' },
  { code: 'tw', name: 'Twi', nativeName: 'Twi', region: 'Ghana', flag: '🇬🇭' },
  { code: 'ak', name: 'Akan', nativeName: 'Akan', region: 'Ghana', flag: '🇬🇭' },
  { code: 'mos', name: 'Mossi', nativeName: 'Mooré', region: 'Burkina Faso', flag: '🇧🇫' },
  { code: 'kri', name: 'Krio', nativeName: 'Krio', region: 'Sierra Leone', flag: '🇸🇱' },

  // Afrique Centrale
  { code: 'ln', name: 'Lingala', nativeName: 'Lingála', region: 'DRC/Congo', flag: '🇨🇩' },
  { code: 'kg', name: 'Kongo', nativeName: 'Kikongo', region: 'DRC/Congo', flag: '🇨🇩' },
  { code: 'lua', name: 'Luba-Kasai', nativeName: 'Tshiluba', region: 'DRC', flag: '🇨🇩' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', region: 'East/Central Africa', flag: '🇰🇪' },
  { code: 'sg', name: 'Sango', nativeName: 'Sängö', region: 'CAR', flag: '🇨🇫' },

  // Afrique de l'Est
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', region: 'Ethiopia', flag: '🇪🇹' },
  { code: 'om', name: 'Oromo', nativeName: 'Afaan Oromoo', region: 'Ethiopia', flag: '🇪🇹' },
  { code: 'ti', name: 'Tigrinya', nativeName: 'ትግርኛ', region: 'Eritrea/Ethiopia', flag: '🇪🇷' },
  { code: 'so', name: 'Somali', nativeName: 'Soomaali', region: 'Somalia', flag: '🇸🇴' },
  { code: 'rw', name: 'Kinyarwanda', nativeName: 'Ikinyarwanda', region: 'Rwanda', flag: '🇷🇼' },
  { code: 'rn', name: 'Kirundi', nativeName: 'Ikirundi', region: 'Burundi', flag: '🇧🇮' },
  { code: 'lg', name: 'Luganda', nativeName: 'Luganda', region: 'Uganda', flag: '🇺🇬' },

  // Afrique Australe
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu', region: 'South Africa', flag: '🇿🇦' },
  { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa', region: 'South Africa', flag: '🇿🇦' },
  { code: 'st', name: 'Sotho', nativeName: 'Sesotho', region: 'South Africa/Lesotho', flag: '🇿🇦' },
  { code: 'tn', name: 'Tswana', nativeName: 'Setswana', region: 'Botswana/SA', flag: '🇧🇼' },
  { code: 'sn', name: 'Shona', nativeName: 'chiShona', region: 'Zimbabwe', flag: '🇿🇼' },
  { code: 'nd', name: 'Ndebele', nativeName: 'isiNdebele', region: 'Zimbabwe/SA', flag: '🇿🇼' },
  { code: 'ny', name: 'Chichewa', nativeName: 'Chichewa', region: 'Malawi', flag: '🇲🇼' },
  { code: 'mg', name: 'Malagasy', nativeName: 'Malagasy', region: 'Madagascar', flag: '🇲🇬' },

  // Langues coloniales en Afrique
  { code: 'fr', name: 'French', nativeName: 'Français', region: 'Francophone Africa', flag: '🇫🇷' },
  { code: 'en-gb', name: 'English (British)', nativeName: 'English (British)', region: 'Royaume-Uni', flag: '🇬🇧' },
  { code: 'en-us', name: 'English (American)', nativeName: 'English (US)', region: 'États-Unis', flag: '🇺🇸' },
  { code: 'en-au', name: 'English (Australian)', nativeName: 'English (AU)', region: 'Australie', flag: '🇦🇺' },
  { code: 'en-ca', name: 'English (Canadian)', nativeName: 'English (CA)', region: 'Canada', flag: '🇨🇦' },
  { code: 'en', name: 'English (Africa)', nativeName: 'English', region: 'Anglophone Africa', flag: '🇬🇧' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', region: 'Lusophone Africa', flag: '🇵🇹' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', region: 'South Africa', flag: '🇿🇦' },

  // HAYTI / AYITI et Caraïbes créolophones
  { code: 'ht', name: 'Kreyòl Ayisyen (HAYTI)', nativeName: 'Kreyòl Ayisyen', region: 'HAYTI', flag: '🇭🇹' },
  { code: 'fr-ht', name: 'Fransè (HAYTI)', nativeName: 'Fransè (HAYTI)', region: 'HAYTI', flag: '🇭🇹' },
  { code: 'gcf', name: 'Kreyòl Gwadloupéyen', nativeName: 'Kreyòl Gwadloupéyen', region: 'Guadeloupe', flag: '🇬🇵' },
  { code: 'mart', name: 'Kreyòl Matinnikè', nativeName: 'Kreyòl Matinnikè', region: 'Martinique', flag: '🇲🇶' },
  { code: 'gcr', name: 'Kreyòl Gwiyanè', nativeName: 'Kreyòl Gwiyanè', region: 'Guyane', flag: '🇬🇫' },
  { code: 'mfe', name: 'Kreol Morisyen', nativeName: 'Kreol Morisyen', region: 'Maurice', flag: '🇲🇺' },
  { code: 'rcf', name: 'Kréol Rénioné', nativeName: 'Kréol Rénioné', region: 'La Réunion', flag: '🇷🇪' },
  { code: 'crs', name: 'Kreol Seselwa', nativeName: 'Kreol Seselwa', region: 'Seychelles', flag: '🇸🇨' },
  { code: 'kea', name: 'Kriolu Kabuverdianu', nativeName: 'Kriolu Kabuverdianu', region: 'Cap-Vert', flag: '🇨🇻' },
  { code: 'pov', name: 'Kriyol (Guinée-Bissau)', nativeName: 'Kriyol', region: 'Guinée-Bissau', flag: '🇬🇼' },
  { code: 'tcs', name: 'Torres Strait Creole', nativeName: 'Yumplatok', region: 'Australie', flag: '🇦🇺' },
  { code: 'jam', name: 'Jamaican Patois', nativeName: 'Patwa', region: 'Jamaïque', flag: '🇯🇲' },
  { code: 'tto', name: 'Trinidad Creole', nativeName: 'Trinidadian Creole', region: 'Trinidad', flag: '🇹🇹' },

  // Autres langues africaines importantes
  { code: 'ts', name: 'Tsonga', nativeName: 'Xitsonga', region: 'South Africa', flag: '🇿🇦' },
  { code: 've', name: 'Venda', nativeName: 'Tshivenḓa', region: 'South Africa', flag: '🇿🇦' },
  { code: 'ss', name: 'Swati', nativeName: 'siSwati', region: 'Eswatini/SA', flag: '🇸🇿' },
  { code: 'nr', name: 'Southern Ndebele', nativeName: 'isiNdebele', region: 'South Africa', flag: '🇿🇦' },

  // Langues internationales majeures
  { code: 'es', name: 'Spanish', nativeName: 'Español', region: 'International', flag: '🇪🇸' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', region: 'International', flag: '🇨🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', region: 'International', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', region: 'International', flag: '🇧🇩' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', region: 'International', flag: '🇵🇰' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', region: 'International', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', region: 'International', flag: '🇯🇵' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', region: 'International', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', region: 'International', flag: '🇮🇹' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', region: 'International', flag: '🇹🇷' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', region: 'International', flag: '🇰🇷' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', region: 'International', flag: '🇻🇳' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', region: 'International', flag: '🇹🇭' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', region: 'International', flag: '🇮🇩' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', region: 'International', flag: '🇲🇾' },
  { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog', region: 'International', flag: '🇵🇭' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', region: 'International', flag: '🇳🇱' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', region: 'International', flag: '🇵🇱' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', region: 'International', flag: '🇺🇦' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', region: 'International', flag: '🇷🇴' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', region: 'International', flag: '🇬🇷' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', region: 'International', flag: '🇨🇿' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', region: 'International', flag: '🇸🇪' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', region: 'International', flag: '🇭🇺' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', region: 'International', flag: '🇮🇱' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', region: 'International', flag: '🇮🇷' },
];

export const getLanguagesByRegion = (region: string) => {
  return languages.filter(lang => lang.region.includes(region));
};

export const getAfricanLanguages = () => {
  return languages.filter(lang =>
    lang.region.includes('Africa') ||
    ['ar', 'ber', 'wo', 'ha', 'yo', 'ig', 'ff', 'bm', 'ee', 'tw', 'ak', 'mos', 'kri', 'ln', 'kg', 'lua', 'sw', 'sg', 'am', 'om', 'ti', 'so', 'rw', 'rn', 'lg', 'zu', 'xh', 'st', 'tn', 'sn', 'nd', 'ny', 'mg', 'ts', 've', 'ss', 'nr', 'af'].includes(lang.code)
  );
};

export const getHaitianLanguages = () => {
  return languages.filter(lang => lang.region === 'Haiti');
};
