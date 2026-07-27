import { GenreCategory, RadioStation } from '../types';

export const GENRE_CATEGORIES: GenreCategory[] = [
  { id: 'all', name: 'Tümü', tag: '', iconName: 'Radio', color: 'from-amber-500 to-orange-600' },
  { 
    id: 'pop', 
    name: 'Pop', 
    tag: 'pop', 
    tags: ['pop', 'turkce pop', 'top40', 'hit'],
    excludeKeywords: ['spor', 'haber', 'dini', 'kuran', 'felsefe'],
    iconName: 'Music', 
    color: 'from-pink-500 to-rose-600' 
  },
  { 
    id: 'slow', 
    name: 'Slow', 
    tag: 'slow', 
    tags: ['slow', 'love', 'ask', 'romantik'],
    excludeKeywords: ['spor', 'haber', 'hard rock', 'metal'],
    iconName: 'HeartHandshake', 
    color: 'from-purple-500 to-indigo-600' 
  },
  { 
    id: 'nostalgia', 
    name: 'Nostalji / 80s / 90s', 
    tag: 'nostalgie', 
    tags: ['nostalji', 'nostalgie', '80s', '90s', 'retro', 'eski'],
    excludeKeywords: ['spor', 'haber'],
    iconName: 'Disc', 
    color: 'from-amber-600 to-yellow-500' 
  },
  { 
    id: 'classical', 
    name: 'Klasik & Caz', 
    tag: 'classical', 
    tags: ['classical', 'klasik', 'jazz', 'caz', 'symphony', 'senfoni', 'opera'],
    excludeKeywords: ['spor', 'haber', 'football', 'futbol', 'pop', 'arabesk'],
    iconName: 'Guitar', 
    color: 'from-emerald-500 to-teal-700' 
  },
  { 
    id: 'rock', 
    name: 'Rock', 
    tag: 'rock', 
    tags: ['rock', 'hard rock', 'metal', 'alternative', 'punk'],
    excludeKeywords: ['spor', 'arabesk', 'dini', 'kuran'],
    iconName: 'Flame', 
    color: 'from-red-600 to-orange-700' 
  },
  { 
    id: 'arabesque', 
    name: 'Arabesk & Fantezi', 
    tag: 'arabesk', 
    tags: ['arabesk', 'fantezi', 'damar'],
    excludeKeywords: ['spor', 'classical', 'jazz', 'rock'],
    iconName: 'Sparkles', 
    color: 'from-fuchsia-600 to-purple-800' 
  },
  { 
    id: 'folk', 
    name: 'Halk Müziği & Türkü', 
    tag: 'folk', 
    tags: ['folk', 'turku', 'halk', 'halk muzigi', 'ozgun'],
    excludeKeywords: ['spor', 'dance', 'techno'],
    iconName: 'Mic2', 
    color: 'from-emerald-600 to-green-700' 
  },
  { 
    id: 'news', 
    name: 'Haber & Spor', 
    tag: 'news', 
    tags: ['news', 'haber', 'spor', 'sports', 'sohbet', 'talk'],
    excludeKeywords: [],
    iconName: 'Newspaper', 
    color: 'from-blue-600 to-cyan-700' 
  },
  { 
    id: 'religious', 
    name: 'Dini / Tasavvuf', 
    tag: 'islamic', 
    tags: ['islamic', 'dini', 'tasavvuf', 'quran', 'kuran', 'ilahiler'],
    excludeKeywords: ['rock', 'metal', 'dance', 'pop'],
    iconName: 'Sun', 
    color: 'from-sky-500 to-indigo-600' 
  },
  { 
    id: 'electronic', 
    name: 'Elektronik & Dance', 
    tag: 'dance', 
    tags: ['dance', 'electronic', 'house', 'techno', 'club', 'trance', 'edm'],
    excludeKeywords: ['arabesk', 'turku', 'dini', 'kuran'],
    iconName: 'Zap', 
    color: 'from-violet-500 to-cyan-500' 
  },
  { 
    id: 'rap', 
    name: 'Rap & Hip-Hop', 
    tag: 'hiphop', 
    tags: ['rap', 'hiphop', 'hip-hop', 'urban', 'trap'],
    excludeKeywords: ['classical', 'dini', 'kuran'],
    iconName: 'BoomBox', 
    color: 'from-slate-700 to-zinc-900' 
  },
];

export function matchesCategory(station: RadioStation, categoryId: string): boolean {
  if (!categoryId || categoryId === 'all') return true;
  const cat = GENRE_CATEGORIES.find(c => c.id === categoryId);
  if (!cat) return true;

  const stationName = (station.name || '').toLowerCase();
  const stationTags = (station.tags || '').toLowerCase();

  // Exclude keywords check
  if (cat.excludeKeywords && cat.excludeKeywords.length > 0) {
    for (const ex of cat.excludeKeywords) {
      if (stationName.includes(ex) || stationTags.includes(ex)) {
        return false;
      }
    }
  }

  // Include tags check
  if (cat.tags && cat.tags.length > 0) {
    const matched = cat.tags.some(t => stationName.includes(t) || stationTags.includes(t));
    return matched;
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
