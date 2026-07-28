import { GenreCategory, RadioStation } from '../types';

export const GENRE_CATEGORIES: GenreCategory[] = [
  { id: 'all', name: 'Tümü', tag: '', iconName: 'Radio', color: 'from-amber-500 to-orange-600' },
  { 
    id: 'pop', 
    name: 'POP', 
    tag: 'pop', 
    tags: ['pop', 'turkce pop', 'top40', 'hit'],
    excludeKeywords: ['spor', 'haber', 'dini', 'kuran', 'felsefe', 'klasik', 'arabesk'],
    iconName: 'Music', 
    color: 'from-pink-500 to-rose-600' 
  },
  { 
    id: 'slow', 
    name: 'SLOW', 
    tag: 'slow', 
    tags: ['slow', 'love', 'ask', 'romantik', 'akustik'],
    excludeKeywords: ['spor', 'haber', 'hard rock', 'metal', 'arabesk'],
    iconName: 'HeartHandshake', 
    color: 'from-purple-500 to-indigo-600' 
  },
  { 
    id: 'arabesque', 
    name: 'ARABESK', 
    tag: 'arabesk', 
    tags: ['arabesk', 'fantezi', 'damar', 'efkar'],
    excludeKeywords: ['spor', 'classical', 'jazz', 'rock', 'pop'],
    iconName: 'Sparkles', 
    color: 'from-fuchsia-600 to-purple-800' 
  },
  { 
    id: 'thm', 
    name: 'THM', 
    tag: 'thm', 
    tags: ['folk', 'turku', 'halk', 'halk muzigi', 'ozgun', 'baglama'],
    excludeKeywords: ['spor', 'dance', 'techno', 'house'],
    iconName: 'Mic2', 
    color: 'from-emerald-600 to-green-700' 
  },
  { 
    id: 'tsm', 
    name: 'TSM', 
    tag: 'tsm', 
    tags: ['tsm', 'sanat muzigi', 'turk sanat muzigi', 'alaturka', 'fasil', 'nagme'],
    excludeKeywords: ['spor', 'dance', 'pop'],
    iconName: 'Disc', 
    color: 'from-amber-600 to-yellow-600' 
  },
  { 
    id: 'islamic', 
    name: 'İSLAMİ', 
    tag: 'islamic', 
    tags: ['islamic', 'dini', 'tasavvuf', 'quran', 'kuran', 'ilahi', 'ilahiler', 'diyanet', 'semerkand', 'lalegul', 'erkam', 'moral', 'seyr'],
    excludeKeywords: ['rock', 'metal', 'dance', 'pop', 'arabesk'],
    iconName: 'Sun', 
    color: 'from-sky-500 to-indigo-600' 
  },
  { 
    id: 'news_sport', 
    name: 'HABER & SPOR', 
    tag: 'news', 
    tags: ['news', 'haber', 'spor', 'sports', 'sohbet', 'talk', 'ekonomi', 'gundem', 'trafik'],
    excludeKeywords: [],
    iconName: 'Newspaper', 
    color: 'from-blue-600 to-cyan-700' 
  },
  { 
    id: 'rap_rock', 
    name: 'RAP & ROCK', 
    tag: 'rock', 
    tags: ['rock', 'rap', 'hiphop', 'hip-hop', 'hard rock', 'metal', 'alternative', 'punk', 'urban', 'trap', 'eksen'],
    excludeKeywords: ['spor', 'arabesk', 'dini', 'kuran'],
    iconName: 'Flame', 
    color: 'from-red-600 to-orange-700' 
  },
  { 
    id: 'yabanci', 
    name: 'YABANCI', 
    tag: 'yabanci', 
    tags: ['english', 'foreign', 'international', 'yabanci', 'dance', 'electronic', 'house', 'metro', 'power fm', 'joy fm', 'fenomen', 'kiss fm'],
    excludeKeywords: ['turkce pop', 'arabesk', 'turku', 'dini', 'kuran'],
    iconName: 'Globe', 
    color: 'from-violet-500 to-cyan-500' 
  },
  { 
    id: 'sanal', 
    name: 'SANAL', 
    tag: 'sanal', 
    tags: ['sanal', 'dijital', 'web', 'online', 'digital', 'stream', 'app', 'akustik', 'slow turk', 'joyturk akustik', 'powerturk slow'],
    excludeKeywords: [],
    iconName: 'Wifi', 
    color: 'from-teal-500 to-emerald-600' 
  },
  { 
    id: 'classical', 
    name: 'KLASİK', 
    tag: 'classical', 
    tags: ['classical', 'klasik', 'jazz', 'caz', 'symphony', 'senfoni', 'opera', 'borusan', 'trt radyo 3', 'voyage', 'radyo voyage', 'ambient', 'chillout', 'relax', 'new age', 'instrumental'],
    excludeKeywords: ['spor', 'haber', 'football', 'futbol', 'pop', 'arabesk'],
    iconName: 'Guitar', 
    color: 'from-amber-700 to-stone-800' 
  }
];

export const TR_MANUAL_OVERRIDES: Record<string, { categoryId: string; isVirtual?: boolean }> = {
  // POP
  'powerturk': { categoryId: 'pop' },
  'power turk': { categoryId: 'pop' },
  'kral pop': { categoryId: 'pop' },
  'super fm': { categoryId: 'pop' },
  'best fm': { categoryId: 'pop' },
  'radyo d': { categoryId: 'pop' },
  'radyo viva': { categoryId: 'pop' },
  'show radyo': { categoryId: 'pop' },
  'alem fm': { categoryId: 'pop' },
  'number1 turk': { categoryId: 'pop' },
  'number 1 turk': { categoryId: 'pop' },
  'istanbul fm': { categoryId: 'pop' },
  'radyo 45lik': { categoryId: 'pop' },
  '45lik': { categoryId: 'pop' },
  'trt fm': { categoryId: 'pop' },
  'kafa radyo': { categoryId: 'pop' },

  // SLOW
  'slow turk': { categoryId: 'slow' },
  'joyturk': { categoryId: 'slow' },
  'romantik turk': { categoryId: 'slow' },
  'powerturk slow': { categoryId: 'slow', isVirtual: true },
  'joyturk akustik': { categoryId: 'slow', isVirtual: true },

  // ARABESK
  'kral fm': { categoryId: 'arabesque' },
  'baba radyo': { categoryId: 'arabesque' },
  'damar fm': { categoryId: 'arabesque' },
  'damar turk': { categoryId: 'arabesque' },
  'radyo 2000': { categoryId: 'arabesque' },
  'radyo tatlises': { categoryId: 'arabesque' },
  'efkar fm': { categoryId: 'arabesque' },

  // THM
  'trt turku': { categoryId: 'thm' },
  'yon radyo': { categoryId: 'thm' },
  'radyo ekin': { categoryId: 'thm' },
  'cem radyo': { categoryId: 'thm' },
  'karadeniz fm': { categoryId: 'thm' },
  'radyo seymen': { categoryId: 'thm' },

  // TSM
  'trt nagme': { categoryId: 'tsm' },
  'radyo alaturka': { categoryId: 'tsm' },

  // İSLAMİ
  'diyanet radyo': { categoryId: 'islamic' },
  'diyanet kuran': { categoryId: 'islamic' },
  'lalegul': { categoryId: 'islamic' },
  'semerkand': { categoryId: 'islamic' },
  'erkam': { categoryId: 'islamic' },
  'moral fm': { categoryId: 'islamic' },
  'akra fm': { categoryId: 'islamic' },

  // HABER & SPOR
  'trt radyo haber': { categoryId: 'news_sport' },
  'trt radyo 1': { categoryId: 'news_sport' },
  'ntv radyo': { categoryId: 'news_sport' },
  'cnn turk': { categoryId: 'news_sport' },
  'haberturk': { categoryId: 'news_sport' },
  'a haber': { categoryId: 'news_sport' },
  'bloomberg ht': { categoryId: 'news_sport' },
  'tgrt fm': { categoryId: 'news_sport' },
  'radyo spor': { categoryId: 'news_sport' },
  'lig radyo': { categoryId: 'news_sport' },
  'a spor': { categoryId: 'news_sport' },
  'radyo trafik': { categoryId: 'news_sport' },

  // RAP & ROCK
  'virgin radio': { categoryId: 'rap_rock' },
  'radyo eksen': { categoryId: 'rap_rock' },
  'rock fm': { categoryId: 'rap_rock' },

  // YABANCI
  'metro fm': { categoryId: 'yabanci' },
  'power fm': { categoryId: 'yabanci' },
  'number1 fm': { categoryId: 'yabanci' },
  'number 1 fm': { categoryId: 'yabanci' },
  'joy fm': { categoryId: 'yabanci' },
  'radyo fenomen': { categoryId: 'yabanci' },
  'pal station': { categoryId: 'yabanci' },
  'kiss fm': { categoryId: 'yabanci' },

  // KLASİK
  'radyo voyage': { categoryId: 'classical' },
  'voyage': { categoryId: 'classical' },
  'borusan klasik': { categoryId: 'classical' },
  'radyo klasik': { categoryId: 'classical' },
  'trt radyo 3': { categoryId: 'classical' },
};

function normalizeName(name: string): string {
  return (name || '')
    .toLowerCase()
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function matchesCategory(station: RadioStation, categoryId: string): boolean {
  if (!categoryId || categoryId === 'all') return true;

  const nameNorm = normalizeName(station.name);
  const tagsNorm = normalizeName(station.tags);

  // SANAL tab special handling
  if (categoryId === 'sanal') {
    for (const [key, val] of Object.entries(TR_MANUAL_OVERRIDES)) {
      if (val.isVirtual && nameNorm.includes(key)) return true;
    }
    return tagsNorm.includes('sanal') || tagsNorm.includes('dijital') || tagsNorm.includes('web') || tagsNorm.includes('online') || station.stationuuid.startsWith('v-powerturk-slow');
  }

  // Check manual override mapping
  for (const [overrideKey, overrideVal] of Object.entries(TR_MANUAL_OVERRIDES)) {
    if (nameNorm.includes(overrideKey)) {
      return overrideVal.categoryId === categoryId;
    }
  }

  const cat = GENRE_CATEGORIES.find(c => c.id === categoryId);
  if (!cat) return true;

  // Exclude keywords check
  if (cat.excludeKeywords && cat.excludeKeywords.length > 0) {
    for (const ex of cat.excludeKeywords) {
      if (nameNorm.includes(ex) || tagsNorm.includes(ex)) {
        return false;
      }
    }
  }

  // Include tags check
  if (cat.tags && cat.tags.length > 0) {
    return cat.tags.some(t => nameNorm.includes(t) || tagsNorm.includes(t));
  }

  return true;
}

export const COUNTRY_NAMES_TR: Record<string, string> = {
  TR: 'Türkiye',
  DE: 'Almanya',
  US: 'Amerika Birleşik Devletleri',
  GB: 'Birleşik Krallık',
  FR: 'Fransa',
  NL: 'Hollanda',
  AZ: 'Azerbaycan',
  IT: 'İtalya',
  ES: 'İspanya',
  GR: 'Yunanistan',
  RU: 'Rusya',
  JP: 'Japonya',
  BR: 'Brezilya',
  CA: 'Kanada',
  AU: 'Avustralya',
  CN: 'Çin',
  IN: 'Hindistan',
  MX: 'Meksika',
  AR: 'Arjantin',
  KR: 'Güney Kore',
  EG: 'Mısır',
  SA: 'Suudi Arabistan',
  AE: 'Birleşik Arap Emirlikleri',
  SE: 'İsveç',
  NO: 'Norveç',
  FI: 'Finlandiya',
  DK: 'Danimarka',
  PL: 'Polonya',
  AT: 'Avusturya',
  CH: 'İsviçre',
  BE: 'Belçika',
  PT: 'Portekiz',
  UA: 'Ukrayna',
  BG: 'Bulgaristan',
  RO: 'Romanya',
  GE: 'Gürcistan',
  UZ: 'Özbekistan',
  KZ: 'Kazakistan',
  TM: 'Türkmenistan',
  KG: 'Kırgızistan',
  CY: 'Kıbrıs',
  BA: 'Bosna-Hersek',
  RS: 'Sırbistan',
  HR: 'Hırvatistan',
  MA: 'Fas',
  TN: 'Tunus',
  DZ: 'Cezayir',
  IR: 'İran',
  IQ: 'Irak',
  SY: 'Suriye',
  JO: 'Ürdün',
  LB: 'Lübnan',
  QA: 'Katar',
  KW: 'Kuveyt',
  CL: 'Şili',
  CO: 'Kolombiya',
  PE: 'Peru',
  ZA: 'Güney Afrika',
  TH: 'Tayland',
  ID: 'Endonezya',
  MY: 'Malezya',
  VN: 'Vietnam',
  PH: 'Filipinler',
  NZ: 'Yeni Zelanda',
  HU: 'Macaristan',
  CZ: 'Çekya',
  SK: 'Slovakya',
  IE: 'İrlanda'
};

export function getCountryFlagEmoji(code: string): string {
  if (!code || code.length !== 2) return '🌐';
  const codePoints = code
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export const ALL_COUNTRIES = Object.entries(COUNTRY_NAMES_TR).map(([code, name]) => ({
  code,
  iso_3166_1: code,
  name,
  flag: getCountryFlagEmoji(code)
})).sort((a, b) => {
  if (a.code === 'TR') return -1;
  if (b.code === 'TR') return 1;
  if (a.code === 'AZ') return -1;
  if (b.code === 'AZ') return 1;
  return a.name.localeCompare(b.name, 'tr');
});

export const POPULAR_COUNTRIES = [
  { code: 'TR', name: 'Türkiye', flag: '🇹🇷' },
  { code: 'AZ', name: 'Azerbaycan', flag: '🇦🇿' },
  { code: 'DE', name: 'Almanya', flag: '🇩🇪' },
  { code: 'US', name: 'ABD', flag: '🇺🇸' },
  { code: 'GB', name: 'İngiltere', flag: '🇬🇧' },
  { code: 'FR', name: 'Fransa', flag: '🇫🇷' },
  { code: 'IT', name: 'İtalya', flag: '🇮🇹' },
  { code: 'NL', name: 'Hollanda', flag: '🇳🇱' },
  { code: 'ES', name: 'İspanya', flag: '🇪🇸' },
  { code: 'RU', name: 'Rusya', flag: '🇷🇺' },
  { code: 'GR', name: 'Yunanistan', flag: '🇬🇷' },
  { code: 'BG', name: 'Bulgaristan', flag: '🇧🇬' },
  { code: 'GE', name: 'Gürcistan', flag: '🇬🇪' },
  { code: 'UZ', name: 'Özbekistan', flag: '🇺🇿' },
  { code: 'KZ', name: 'Kazakistan', flag: '🇰🇿' },
  { code: 'AT', name: 'Avusturya', flag: '🇦🇹' },
  { code: 'CH', name: 'İsviçre', flag: '🇨🇭' },
  { code: 'SE', name: 'İsveç', flag: '🇸🇪' },
  { code: 'BE', name: 'Belçika', flag: '🇧🇪' },
  { code: 'BR', name: 'Brezilya', flag: '🇧🇷' },
  { code: 'CA', name: 'Kanada', flag: '🇨🇦' },
  { code: 'JP', name: 'Japonya', flag: '🇯🇵' },
  { code: 'SA', name: 'Suudi Arabistan', flag: '🇸🇦' },
  { code: 'AE', name: 'BAE', flag: '🇦🇪' }
];
