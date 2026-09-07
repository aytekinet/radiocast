import { GenreCategory, RadioStation } from '../types';

export interface RadioGroup {
  id: string;
  name: string;
  stationNames: string[];
}

export const GENRE_CATEGORIES: GenreCategory[] = [
  { id: 'all', name: 'Tüm', tag: '', iconName: 'Radio', color: 'from-amber-500 to-orange-600' },
  { id: 'populer', name: 'Popüler', tag: 'populer', iconName: 'Sparkles', color: 'from-yellow-400 to-amber-600' },
  { id: 'turkce_pop', name: 'Türkçe Pop', tag: 'turkce_pop', iconName: 'Music', color: 'from-pink-500 to-rose-600' },
  { id: 'arabesk_fantezi', name: 'Arabesk / Fantezi', tag: 'arabesk', iconName: 'Flame', color: 'from-fuchsia-600 to-purple-800' },
  { id: 'slow_romantik', name: 'Slow / Romantik', tag: 'slow', iconName: 'HeartHandshake', color: 'from-purple-500 to-indigo-600' },
  { id: 'haber', name: 'Haber', tag: 'haber', iconName: 'Newspaper', color: 'from-blue-600 to-cyan-700' },
  { id: 'spor', name: 'Spor', tag: 'spor', iconName: 'Zap', color: 'from-emerald-600 to-green-700' },
  { id: 'rock_alternatif', name: 'Rock / Alternatif', tag: 'rock', iconName: 'Guitar', color: 'from-red-600 to-orange-700' },
  { id: 'rap_hiphop', name: 'Rap / Hip-Hop', tag: 'rap', iconName: 'Mic2', color: 'from-amber-600 to-red-600' },
  { id: 'elektronik_dans', name: 'Elektronik / Dans', tag: 'elektronik', iconName: 'Disc', color: 'from-cyan-500 to-blue-600' },
  { id: 'turku_thm', name: 'Türkü / THM', tag: 'turku', iconName: 'BoomBox', color: 'from-emerald-600 to-green-700' },
  { id: 'klasik_muzik', name: 'Klasik Müzik', tag: 'klasik', iconName: 'Guitar', color: 'from-amber-700 to-stone-800' },
  { id: 'nostalji_retro', name: 'Nostalji / Retro', tag: 'nostalji', iconName: 'Disc', color: 'from-orange-500 to-amber-700' },
  { id: 'lounge_kesif', name: 'Lounge / Keşif', tag: 'lounge', iconName: 'Sparkles', color: 'from-teal-500 to-cyan-600' },
  { id: 'jazz', name: 'Jazz', tag: 'jazz', iconName: 'Disc', color: 'from-indigo-600 to-purple-700' },
  { id: 'oyun_havasi', name: 'Oyun Havası', tag: 'oyun_havasi', iconName: 'Zap', color: 'from-yellow-500 to-amber-600' },
  { id: 'karadeniz', name: 'Karadeniz', tag: 'karadeniz', iconName: 'BoomBox', color: 'from-teal-600 to-emerald-700' },
  { id: 'kurtce', name: 'Kürtçe', tag: 'kurtce', iconName: 'Radio', color: 'from-lime-600 to-green-700' },
  { id: 'dini', name: 'Dini', tag: 'dini', iconName: 'Sun', color: 'from-sky-500 to-indigo-600' },
  { id: 'universite', name: 'Üniversite Radyoları', tag: 'universite', iconName: 'Wifi', color: 'from-cyan-500 to-blue-600' },
  { id: 'yabanci_pop', name: 'Yabancı Pop', tag: 'yabanci_pop', iconName: 'Globe', color: 'from-violet-500 to-cyan-500' },
  { id: 'yerel_bolgesel', name: 'Yerel / Bölgesel', tag: 'yerel_bolgesel', iconName: 'Radio', color: 'from-stone-600 to-zinc-800' },
  { id: 'karma_genel', name: 'Karma / Genel', tag: 'karma_genel', iconName: 'Radio', color: 'from-zinc-500 to-zinc-700' }
];

export const RADIO_GROUPS: RadioGroup[] = [
  {
    id: 'trt_grup',
    name: 'TRT Radyoları',
    stationNames: ['trt radyo 1', 'trt radyo haber', 'trt turku', 'trt nagme', 'trt fm', 'trt']
  },
  {
    id: 'karnaval',
    name: 'Karnaval Medya',
    stationNames: ['super fm', 'metro fm', 'joyturk', 'joyturk rock', 'virgin radio turkiye', 'retro turk', 'borusan klasik', 'radio mydonose']
  },
  {
    id: 'fenomen',
    name: 'Fenomen Medya',
    stationNames: ['radyo fenomen', 'radyo fenomen clubbin', 'fenomen']
  },
  {
    id: 'power_app',
    name: 'Power Medya',
    stationNames: ['powerturk', 'powerturk slow', 'power dance', 'radyo koc', 'power app', 'power fm']
  },
  {
    id: 'dinamo',
    name: 'Dinamo.fm Ağı',
    stationNames: ['dinamo fm caffe', 'dinamo fm deep', 'dinamo fm fluent', 'dinamo fm locodyno', 'dinamo fm smog', 'dinamo fm']
  },
  {
    id: 'radyo_7_grup',
    name: 'Radyo 7 & Haber Grubu',
    stationNames: ['radyo 7', 'haberturk radyo', 'ntv radyo', 'tgrt fm']
  },
  {
    id: 'dini_grup',
    name: 'Dini Yayınlar',
    stationNames: ['diyanet kur an radyo', 'erkam radyo', 'lalegul fm', 'nur radyo', 'radyo fitrat']
  }
];

export function normalizeName(name: string): string {
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

export const CATEGORY_NAMES_MAP: Record<string, string[]> = {
  "populer": [
    "arabesk fm",
    "damar turk fm",
    "dinamo fm caffe",
    "dinamo fm deep",
    "radyo fenomen clubbin",
    "haberturk radyo",
    "ntv radyo",
    "tgrt fm",
    "trt radyo haber",
    "radyo 7",
    "trt radyo 1",
    "borusan klasik",
    "havin fm",
    "radio voyage",
    "radyo 45lik",
    "radyo seymen",
    "joyturk rock",
    "virgin radio turkiye",
    "ask fm",
    "slow turk",
    "radyo fenomen",
    "super fm",
    "trt turku",
    "turku radyo",
    "turkulerle turkiye",
    "radyo odtu",
    "metro fm",
    "alem fm",
    "avrasya turk radyo",
    "baba radyo",
    "dost",
    "genc kral fm",
    "halk radyo",
    "joyturk",
    "kalp fm",
    "radyo alaturka",
    "populer",
    "hit",
    "trend",
    "top 40",
    "top40"
  ],
  "turkce_pop": [
    "radyo fenomen",
    "super fm",
    "arkadas radyo",
    "bodrum fm",
    "keyf station",
    "kiss turk",
    "koroglu fm",
    "radio ava turkiye",
    "radyo 35",
    "radyo taksi",
    "super fm 99 9",
    "turkce pop",
    "pop",
    "fenomen",
    "kral pop",
    "best fm",
    "alem fm"
  ],
  "arabesk_fantezi": [
    "arabesk fm",
    "damar turk fm",
    "arabesk",
    "fantezi",
    "damar",
    "muslum",
    "orhan",
    "ferdi"
  ],
  "slow_romantik": [
    "ask fm",
    "slow turk",
    "karma turk slow",
    "ki ss love radyo turkey",
    "ki ss turk slow",
    "powerturk slow",
    "radyo duygusal",
    "slow",
    "ask",
    "romantik",
    "duygusal",
    "love"
  ],
  "haber": [
    "haberturk radyo",
    "ntv radyo",
    "tgrt fm",
    "trt radyo haber",
    "replay news turkce her 5 dakikada haber radyosu",
    "haber",
    "news",
    "sondakika",
    "haberturk",
    "ntv",
    "tgrt",
    "trt haber"
  ],
  "spor": [
    "lig radyo",
    "radyo gol",
    "spor",
    "sport",
    "futbol"
  ],
  "rock_alternatif": [
    "joyturk rock",
    "virgin radio turkiye",
    "ktu",
    "max fm 95 8 maximum music",
    "radyo a radyo anadolu universitesi",
    "radyo eksen 96 2",
    "radyo odtu rock",
    "rock",
    "alternatif",
    "metal",
    "anadolu rock"
  ],
  "rap_hiphop": [
    "number 1 turk rap",
    "x radio",
    "rap",
    "hip hop",
    "hiphop",
    "r&b",
    "trap"
  ],
  "elektronik_dans": [
    "dinamo fm caffe",
    "dinamo fm deep",
    "radyo fenomen clubbin",
    "dinamo fm fluent",
    "dinamo fm locodyno",
    "dinamo fm smog",
    "fg 93 8 future generation mp3 128k",
    "loops radio techno",
    "mayday records",
    "power dance",
    "radio antalya",
    "radio mydonose",
    "dans",
    "dance",
    "electronic",
    "house",
    "techno",
    "edm",
    "club",
    "trance"
  ],
  "turku_thm": [
    "trt turku",
    "turku radyo",
    "turkulerle turkiye",
    "radyo banko",
    "turkuvaz anadolu",
    "turkuradyo",
    "turku",
    "thm",
    "halk muzigi",
    "turkuler",
    "bozlak"
  ],
  "klasik_muzik": [
    "borusan klasik",
    "klasik",
    "classical",
    "senfoni",
    "filarmoni",
    "opera"
  ],
  "nostalji_retro": [
    "radyo 45lik",
    "dedemi n radyosu",
    "retro turk",
    "vi zyon nostalji",
    "yeni radyo nostaljinin sesi",
    "nostalji",
    "retro",
    "45lik",
    "eskiler",
    "90lar",
    "80ler",
    "70ler"
  ],
  "lounge_kesif": [
    "radio voyage",
    "apacik radyo",
    "kiyi gece",
    "kiyi muzik",
    "kiyi turkce",
    "standart fm",
    "lounge",
    "chill",
    "ambient",
    "downtempo",
    "kesif",
    "relax"
  ],
  "jazz": [
    "radyo gokceada",
    "sezen radyo",
    "jazz",
    "caz",
    "blues"
  ],
  "oyun_havasi": [
    "radyo seymen",
    "masti ka fm",
    "oyun havasi",
    "ankara havasi",
    "seymen",
    "mastika",
    "ciftetelli",
    "roman"
  ],
  "karadeniz": [
    "radyo karadeniz",
    "karadeniz",
    "kemence",
    "horon",
    "tulum"
  ],
  "kurtce": [
    "havin fm",
    "radyo mezopotamya",
    "radyo mori",
    "kurtce",
    "kurdi",
    "dengbej",
    "stran"
  ],
  "dini": [
    "diyanet kur an radyo",
    "erkam radyo",
    "lalegul fm",
    "nur radyo",
    "radyo fitrat",
    "dini",
    "kuran",
    "tasavvuf",
    "ilahi",
    "diyanet",
    "islam"
  ],
  "universite": [
    "radyo odtu",
    "radyo bilkent",
    "radyo koc",
    "universite",
    "odtu",
    "bilkent",
    "itu",
    "koc",
    "kampus"
  ],
  "yabanci_pop": [
    "metro fm",
    "acs radyo",
    "radio light",
    "yabanci pop",
    "world hits",
    "foreign pop",
    "hit music"
  ],
  "yerel_bolgesel": [
    "alem fm",
    "avrasya turk radyo",
    "baba radyo",
    "dost",
    "genc kral fm",
    "halk radyo",
    "joyturk",
    "kalp fm",
    "radyo alaturka",
    "95 1 tempo radyo hatay",
    "baris fm 103 2",
    "bayram fm turkey",
    "bi leci k fm turkey",
    "bitlis fm 98 8",
    "bloomberg ht radyo",
    "cesme vi ki ng radyo",
    "cinar fm",
    "denge gundeme",
    "elazig mavi radyo",
    "emek radyo",
    "ert elazig",
    "erzi ncan fm",
    "espiye fm",
    "fakir fm",
    "gevas sesi radyosu",
    "kent radyo",
    "kuzey fm turkey",
    "lokum fm",
    "maxfm",
    "melodi radyo",
    "merkez fm samsun turkey",
    "radyo 16",
    "radyo 2000",
    "radyo 90",
    "radyo ahenk",
    "radyo akdeniz",
    "radyo alevi canlar",
    "radyo durak",
    "radyo ekin",
    "radyo megasite",
    "radyo munzur 97 7",
    "radyo sari tramvay",
    "radyo sevtek",
    "radyo sinerji",
    "radyo talya",
    "radyo zile fm 93 5",
    "super show radyo",
    "trt nagme",
    "turkiyem fm",
    "yenikoy fm",
    "yon radyo",
    "yerel",
    "bolgesel",
    "fm",
    "radyo"
  ],
  "karma_genel": [
    "radyo 7",
    "trt radyo 1",
    "bestefm mix",
    "hayatmi x",
    "mix a mix fm",
    "radio hayal",
    "radyo 75",
    "radyo dingil",
    "radyo maksat",
    "karma",
    "genel",
    "mix",
    "karisik",
    "cesitli"
  ]
};

export const CATEGORY_ID_FROM_MAIN: Record<string, string> = {
  "Arabesk / Fantezi": "arabesk_fantezi",
  "Elektronik / Dans": "elektronik_dans",
  "Haber": "haber",
  "Karma / Genel": "karma_genel",
  "Klasik Müzik": "klasik_muzik",
  "Kürtçe": "kurtce",
  "Lounge / Keşif": "lounge_kesif",
  "Nostalji / Retro": "nostalji_retro",
  "Oyun Havası": "oyun_havasi",
  "Rock / Alternatif": "rock_alternatif",
  "Slow / Romantik": "slow_romantik",
  "Türkçe Pop": "turkce_pop",
  "Türkü / THM": "turku_thm",
  "Üniversite Radyoları": "universite",
  "Yabancı Pop": "yabanci_pop",
  "Yerel / Bölgesel": "yerel_bolgesel",
  "Dini": "dini",
  "Jazz": "jazz",
  "Karadeniz": "karadeniz",
  "Rap / Hip-Hop": "rap_hiphop",
  "Spor": "spor"
};

export function matchesCategory(station: RadioStation, categoryId: string): boolean {
  if (!categoryId || categoryId === 'all') return true;

  // 1. Check direct isPopular flag
  if (categoryId === 'populer') {
    if (station.isPopular) return true;
    const tagsLower = (station.tags || '').toLowerCase();
    if (tagsLower.includes('popüler') || tagsLower.includes('populer')) return true;
  }

  // 2. Check mainCategory match
  if (station.mainCategory && CATEGORY_ID_FROM_MAIN[station.mainCategory] === categoryId) {
    return true;
  }

  // 3. Check normalized tags
  const tagsNorm = normalizeName(station.tags || '');
  const cat = GENRE_CATEGORIES.find(c => c.id === categoryId);
  if (cat && cat.tag && tagsNorm.includes(cat.tag)) {
    return true;
  }

  // 4. Station name match in category map
  const nameNorm = normalizeName(station.name || '');
  const keywords = CATEGORY_NAMES_MAP[categoryId];
  if (keywords && keywords.length > 0) {
    if (keywords.some(k => nameNorm.includes(k) || tagsNorm.includes(k))) {
      return true;
    }
  }

  return false;
}

export function matchesGroup(station: RadioStation, groupId: string): boolean {
  if (!groupId || groupId === 'all_groups') return true;

  const nameNorm = normalizeName(station.name);

  if (groupId === 'diger_grup') {
    for (const group of RADIO_GROUPS) {
      if (group.stationNames.some(s => nameNorm.includes(s))) {
        return false;
      }
    }
    return true;
  }

  const group = RADIO_GROUPS.find(g => g.id === groupId);
  if (!group) return true;

  return group.stationNames.some(s => nameNorm.includes(s));
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
