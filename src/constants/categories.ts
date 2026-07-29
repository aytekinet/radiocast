import { GenreCategory, RadioStation } from '../types';

export interface RadioGroup {
  id: string;
  name: string;
  stationNames: string[];
}

export const GENRE_CATEGORIES: GenreCategory[] = [
  { id: 'all', name: 'Tüm', tag: '', iconName: 'Radio', color: 'from-amber-500 to-orange-600' },
  { id: 'turkce_pop', name: 'Pop', tag: 'pop', iconName: 'Music', color: 'from-pink-500 to-rose-600' },
  { id: 'turkce_slow', name: 'Slow', tag: 'slow', iconName: 'HeartHandshake', color: 'from-purple-500 to-indigo-600' },
  { id: 'arabesk', name: 'Arabesk', tag: 'arabesk', iconName: 'Sparkles', color: 'from-fuchsia-600 to-purple-800' },
  { id: 'thm', name: 'THM', tag: 'thm', iconName: 'Mic2', color: 'from-emerald-600 to-green-700' },
  { id: 'tsm', name: 'TSM', tag: 'tsm', iconName: 'Disc', color: 'from-amber-600 to-yellow-600' },
  { id: 'islami', name: 'İslami', tag: 'islami', iconName: 'Sun', color: 'from-sky-500 to-indigo-600' },
  { id: 'haber_spor', name: 'Haber & Spor', tag: 'news', iconName: 'Newspaper', color: 'from-blue-600 to-cyan-700' },
  { id: 'rap_rock', name: 'Rap & Rock', tag: 'rock', iconName: 'Flame', color: 'from-red-600 to-orange-700' },
  { id: 'yabanci', name: 'Yabancı', tag: 'yabanci', iconName: 'Globe', color: 'from-violet-500 to-cyan-500' },
  { id: 'klasik', name: 'Klasik', tag: 'klasik', iconName: 'Guitar', color: 'from-amber-700 to-stone-800' },
  { id: 'nostalji', name: 'Nostalji', tag: 'nostalji', iconName: 'Disc', color: 'from-orange-500 to-amber-700' },
  { id: 'karadeniz', name: 'Karadeniz', tag: 'karadeniz', iconName: 'BoomBox', color: 'from-teal-600 to-emerald-700' },
  { id: 'ankara', name: 'Ankara', tag: 'ankara', iconName: 'Zap', color: 'from-yellow-500 to-amber-600' },
  { id: 'kampus', name: 'Kampüs', tag: 'kampus', iconName: 'Wifi', color: 'from-cyan-500 to-blue-600' },
  { id: 'kpop', name: 'K-Pop', tag: 'kpop', iconName: 'Sparkles', color: 'from-pink-600 to-purple-600' },
  { id: 'akustik', name: 'Akustik', tag: 'akustik', iconName: 'Guitar', color: 'from-emerald-500 to-teal-700' },
  { id: 'caz', name: 'Caz', tag: 'caz', iconName: 'Disc', color: 'from-indigo-600 to-purple-700' },
  { id: 'kktc', name: 'KKTC', tag: 'kktc', iconName: 'Globe', color: 'from-red-500 to-amber-600' },
  { id: 'diger_kategori', name: 'Diğer', tag: 'diger', iconName: 'Radio', color: 'from-zinc-500 to-zinc-700' }
];

export const RADIO_GROUPS: RadioGroup[] = [
  {
    id: 'fenomen',
    name: 'Fenomen',
    stationNames: [
      'fenomen 2010', 'fenomen afro', 'fenomen akustik', 'fenomen clubbin',
      'fenomen dans', 'fenomen k-pop', 'fenomen kpop', 'fenomen karisik',
      'fenomen pop', 'fenomen rap', 'fenomen turk', 'radyo fenomen'
    ]
  },
  {
    id: 'karnaval',
    name: 'Karnaval',
    stationNames: [
      'baby joy', 'baska radyo', 'borusan klasik', 'efkar fm', 'greatest hits of all time',
      'joy fm', 'joy jazz', 'joy turk', 'joyturk', 'k-pop', 'karadeniz radyo',
      'kiss fm', 'kiss turk', 'literal radio', 'makam radyo', 'metro fm',
      'mydonose turk', 'odea radyo', 'pop hits', 'popbesk', 'radio mydonose',
      'radyo gonul fm', 'radyo pop 90', 'radyo sole', 'retro turk', 'rock station',
      'slow hits', 'super fm', 'super2 fm', 'tum zamanlarin en iyileri',
      'virgin radio turkiye', 'yeni pop', 'yeni rap', 'yeni slow', 'yol arkadasim radyo'
    ]
  },
  {
    id: 'number_one',
    name: 'Number One',
    stationNames: [
      'best of number 1', 'nr1 ask', 'number 1 classic', 'number 1 dance',
      'number 1 deep house', 'number 1 disco', 'number 1 eller havaya',
      'number 1 ertugrul ozkok', 'number 1 fm', 'number 1 greek', 'number 1 heart',
      'number 1 jazz', 'number 1 lounge', 'number 1 r&b', 'number 1 rock',
      'number one turk', 'number one turk damar', 'number one turk doksanlar',
      'number one turk rap', 'number one turk slow', 'petrol ofisi radyosu',
      'uskudar musiki cemiyeti radyosu'
    ]
  },
  {
    id: 'pal_grup',
    name: 'Pal Grup',
    stationNames: ['pal doga', 'pal fm', 'pal nostalji', 'pal station']
  },
  {
    id: 'power_app',
    name: 'Power App',
    stationNames: [
      'power dance', 'power deep', 'power earth', 'power fm', 'power gold',
      'power greece', 'power hiphop r&b', 'power jazz', 'power love fm',
      'power plus', 'power pop', 'power smooth', 'power turk fm', 'powerturk',
      'power xl fm', 'powerturk akustik', 'powerturk dans', 'powerturk en iyiler',
      'powerturk rap', 'powerturk slow', 'powerturk taptaze', 'radyo boombox'
    ]
  },
  {
    id: 'radyo_7_grup',
    name: 'Radyo 7',
    stationNames: [
      'muhtesem dortlu radyosu', 'radyo 7', 'radyo 7 kuran arapca', 'radyo 7 muslum',
      'radyo 7 ankara havalari', 'radyo 7 arabesk', 'radyo 7 kuran meali',
      'radyo 7 nostalji', 'radyo 7 pop hit', 'radyo 7 tasavvuf', 'radyo 7 turku',
      'slow 7', 'ulke radyo'
    ]
  },
  {
    id: 'radyo_home',
    name: 'Radyo Home',
    stationNames: [
      'doksanlar fm', 'klasik home', 'maziden bir demet', 'melankolik home',
      'muhtesem dortlu radyosu', 'pop home', 'radyo altin sarkilar',
      'radyo ankara havalari', 'radyo efsane 4 lu', 'radyo ege havalari',
      'radyo gol', 'radyo tezene', 'radyo turkulerle turkiye', 'rap home',
      'relax home', 'sari tramvay', 'slow home', 'the rock radio', 'world hits'
    ]
  },
  {
    id: 'show_viva',
    name: 'Show & Viva',
    stationNames: [
      'tv100 haber', 'radyo viva trend pop', 'radyo viva club', 'show trend',
      'show eller havaya', 'show akustik', 'show slow', 'show 90s', 'show 90lar',
      'radyo viva turka', 'radyo viva turku', 'radyo viva efkar', 'radyo viva', 'show radyo'
    ]
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

// Category Station Lists for accurate classification
const CATEGORY_NAMES_MAP: Record<string, string[]> = {
  turkce_pop: [
    'kafa radyo', 'alem fm', 'best fm', 'kral pop', 'powerturk', 'power turk',
    'radyo 7', 'radyo seymen', 'polis radyosu', 'ankara radyo banko', 'baska radyo',
    'dada radyo', 'doksanlar fm', 'fenomen turk', 'fg turk radyo', 'genclik radyosu',
    'istanbul fm', 'istanbul kupe fm', 'istanbul radyo seymen', 'karadeniz fm 98.2',
    'karma turk', 'kiss genc', 'kiss gold turk', 'kiss turk', 'kral pop radyo',
    'mydonose turk', 'number 1 eller havaya', 'number one turk', 'number one turk doksanlar',
    'ordu fm', 'pal fm', 'pal nostalji', 'pal nostalji fm', 'park fm', 'pop home',
    'popbesk', 'power pop', 'powerturk fm', 'powerturk akustik', 'powerturk dans',
    'powerturk en iyiler', 'powerturk taptaze', 'radyo 34 istanbul', 'radyo 35',
    'radyo 45lik', 'radyo 7 nostalji', 'radyo 7 pop hit', 'radyo altin sarkilar',
    'radyo bordo mavi fm', 'radyo d', 'radyo pop 90', 'radyo trio', 'radyo viva',
    'radyo viva trend pop', 'radyo yaren', 'radyobir', 'retro turk', 'show 90s',
    'show 90lar', 'show akustik', 'show radyo', 'siaray turk fm', 'super fm',
    'super2 fm', 'trend ankara', 'tum zamanlarin en iyileri', 'viyana fm', 'yeni pop',
    'yol arkadasim radyo', 'pop'
  ],
  turkce_slow: [
    'slow turk', 'joy turk', 'joyturk', 'kalp fm', 'yeni slow', 'best slow',
    'joy turk akustik', 'slow 7', 'powerturk slow', 'istanbul fm slow',
    'karma turk slow', 'nr1 ask', 'number one turk slow', 'power xl fm',
    'radyo 34 istanbul', 'radyo romantik turk', 'romantik ses isparta',
    'romantik ses sakarya', 'show slow', 'slow hits', 'slow home', 'slow'
  ],
  arabesk: [
    'kral fm', 'baba radyo', 'efkar fm', 'imbat fm', 'damar', 'istanbul fm fantezi',
    'viva efkar', 'radyo megasite', 'adana efsane radyo', 'arabesk radyo', 'ask fm',
    'baba radyo 105.6', 'bor fm', 'can fm', 'damar fm', 'denizli art fm',
    'elbistan yore fm', 'gercek radyo', 'hatay dost fm', 'izmir imbat fm',
    'karesi radyo', 'kralim fm 99.3', 'melankolik home', 'number one turk damar',
    'radyo 11', 'radyo 2000', 'radyo 2000 elazig', 'radyo 2000 fm', 'radyo 7 muslum',
    'radyo 7 arabesk', 'radyo durak', 'radyo efsane 4 lu', 'radyo hayat amasya',
    'radyo moda', 'radyo nester', 'radyo usta', 'radyo viva efkar', 'star arti fm',
    'sultan radyo', 'arabesk', 'fantezi'
  ],
  thm: [
    'radyo 7 turku', 'radyo ostim', 'pal doga', 'radyo turkulerle turkiye',
    'yon radyo', 'muhtesem 4lu', 'muhtesem dortlu', 'radyo ekin', 'avrasya turk',
    'adana radyo guney', 'avrasya turk 107.1', 'bati radyo', 'best kina', 'cem radyo',
    'dadas fm', 'derya fm', 'elazig mavi radyo', 'erzincan radyo 2000', 'erzincan radyo cem',
    'firat fm', 'hatay asya radyo', 'hatay tempo fm', 'kent radyo mersin',
    'kocaeli tempo fm', 'konya fm', 'radyo 7 ankara havalari', 'radyo gonul fm',
    'radyo gun', 'radyo harman fm', 'radyo manavgat', 'radyo tezene', 'radyo vatan turku',
    'radyo viva turku', 'sancak fm', 'show eller havaya', 'tempo turk eskisehir',
    'turku radyo', 'ulusal radyo turku', 'turku', 'folk'
  ],
  tsm: [
    'radyo alaturka', 'radyo 7 tsm', 'polis radyosu tsm', 'kiss musiki',
    'istanbul fm alaturka', 'uludag fm', 'genc radyo', 'makam radyo',
    'gaziantep grt fm', 'maziden bir demet', 'radyo ahenk', 'radyo han kayseri',
    'radyo kordelya', 'radyo nihavent', 'radyo viva turka', 'ulusal radyo sanat',
    'uskudar musiki cemiyeti', 'tsm', 'alaturka', 'sanat muzigi'
  ],
  islami: [
    'radyo 7 kuran meali', 'radyo 7 tasavvuf', 'diyanet radyo', 'diyanet kuran',
    'risalet radyo', 'bayram fm', 'moral fm', 'erkam radyo', 'arkadas fm',
    'baris radyo', 'berat fm', 'bizim iller radyo', 'bizim radyo', 'corum cagri fm',
    'davet radyo', 'dolunay fm', 'dost fm', 'enderun fm', 'furkan radyo',
    'gencligin sesi', 'gonca fm', 'kocaeli radyo gul', 'konya isra fm',
    'konya radyo en', 'lalegul fm', 'mesaj fm', 'nur fm', 'nur radyo', 'ozel fm',
    'radyo 7 kuran arapca', 'radyo denge', 'radyo feza', 'radyo fitrat',
    'radyo genc ses', 'radyo genclik', 'radyo hayat', 'radyo hedef', 'radyo huzur',
    'radyo nida', 'radyo tulu', 'radyo urfa', 'rahmet fm', 'ribat fm', 'safak radyo',
    'semerkand radyo', 'seyr fm', 'tgrt fm', 'umut fm', 'islami', 'kuran', 'dini', 'ilahi'
  ],
  haber_spor: [
    'haberturk radyo', 'radyo cnn turk', 'ntv radyo', 'tgrt fm', 'ulusal radyo',
    'radyo trafik', 'meteorolojinin sesi', 'radyo spor', '24 radyo',
    'bbc world service', 'bloomberg ht', 'lig radyo', 'ntv spor radyo',
    'radyo fenerbahce', 'radyo gol', 'samsun haber radyo', 'st endustri radyo',
    'sun radyo', 'tv100 haber', 'ulke radyo', 'haber', 'spor', 'news'
  ],
  rap_rock: [
    'power hiphop', 'kiss beatbox', 'radyo boombox', 'yeni rap', 'best rap',
    'joy turk rock', 'the rock radio', 'max fm', 'fenomen rap', 'itu radyosu rock',
    'number 1 r&b', 'number 1 rock', 'number one turk rap', 'power earth',
    'power plus', 'powerturk rap', 'radio boombox xtra', 'radyo duble rap',
    'radyo mars', 'rap home', 'rock fm', 'rock station', 'x radio', 'rock', 'rap', 'hiphop'
  ],
  yabanci: [
    'power fm', 'metro fm', 'joy fm', 'radyo voyage', 'radio mydonose', 'pal station',
    'radyo fenomen', 'number one fm', 'best hit', 'dalkas fm', 'dance fm',
    'fenomen 2010s', 'fenomen afro', 'fenomen clubbin', 'fenomen dans',
    'fenomen karisik', 'fenomen pop', 'greatest hits of all time', 'heart fm',
    'kiss dance', 'kiss ege', 'kiss fk', 'kiss fm', 'kiss gold', 'literal radio',
    'lounge fm', 'mix fm mersin', 'nrk jazz', 'number 1 dance', 'number 1 deep house',
    'number 1 disco', 'number 1 ertugrul ozkok', 'number 1 greek', 'number 1 heart',
    'number 1 jazz', 'number 1 lounge', 'petrol ofisi radyosu', 'pop hits',
    'power dance', 'power deep', 'power greece', 'power jazz', 'power love fm',
    'power smooth', 'power xl fm', 'radio 2020', 'radio mix', 'radio swiss classic',
    'radio veronika', 'radyo a anadolu', 'radyo bilim', 'radyo bilkent',
    'radyo eko', 'radyo eksen', 'radyo fg', 'radyo ilef', 'radyo klasik',
    'radyo line', 'radyo odtu', 'radyo universite', 'radyo viva club',
    'radyovizyon', 'relax home', 'slow time', 'sout al khaleej', 'virgin radio turkiye',
    'world hits', 'english', 'foreign'
  ],
  klasik: [
    'klasik home', 'number 1 klasik', 'number 1 classic', 'itu radyosu klasik',
    'radyo voyage', 'radio swiss classic', 'nrk klasik', 'borusan klasik',
    'abc classic 2 fm', 'radyo klasik', 'klasik', 'classical'
  ],
  nostalji: [
    'istanbul fm nostalji', 'show 90s', 'show 90lar', 'sari tramvay',
    'radyo altin sarkilar', 'power gold', 'number one turk doksanlar',
    'radyo pop 90', 'retro turk', 'pal nostalji', 'pal nostalji fm',
    'radyo 45lik', 'doksanlar fm', 'esas radyo', 'radyo 7 nostalji', 'nostalji', '90lar', '80ler'
  ],
  karadeniz: [
    'kadirga fm', 'karadeniz dalga fm', 'raks fm', 'karadeniz akustik fm',
    'blue karadeniz radyo', 'karadeniz radyo', 'radyo bordo mavi fm',
    'vitamin fm', 'kemence fm', 'karadenizin sesi radyosu', 'trabzon taka fm',
    'karadeniz fm 98.2', 'karadeniz fm bursa', 'radyo karadeniz', 'karadeniz'
  ],
  ankara: [
    'radyo ankara', 'radyo 7 ankara havalari', 'radyo tuzgolu', 'best kina',
    'radyo ankara havalari', 'yoruk fm', 'radyo 06 ankara', 'park fm',
    'istanbul radyo seymen', 'ankara radyo banko', 'ankara'
  ],
  kampus: [
    'adyu fm', 'alevin sesi', 'bau radyo', 'cu radyo', 'hitit fm', 'kampus fm',
    'kuradyo', 'kutahya radyo dumlupinar', 'mersin universitesi radyosu',
    'omu radyo', 'radio atilim', 'radyo a anadolu universitesi', 'radyo altinbas',
    'radyo baskent', 'radyo bilkent', 'radyo bogazici', 'radyo duet',
    'radyo ege universitesi', 'radyo esogu', 'radyo estu', 'radyo firat',
    'radyo ilef', 'radyo iletisim', 'radyo kampus', 'radyo ki', 'radyo kocatepe',
    'radyo ktu', 'radyo odtu', 'radyo ozu', 'radyo sdu', 'radyo uni14',
    'radyo universite', 'universite fm', 'kampus', 'universite'
  ],
  kpop: [
    'k pop', 'k-pop', 'kpop', 'fenomen k-pop', 'fenomen kpop', 'kore pop'
  ],
  akustik: [
    'istanbul fm akustik', 'fenomen akustik', 'show akustik', 'powerturk akustik',
    'joy turk akustik', 'joyturk akustik', 'akustik'
  ],
  caz: [
    'nrk jazz', 'joy jazz', 'number 1 jazz', 'itu radyosu jazz blues',
    'power jazz', 'jazz', 'caz'
  ],
  kktc: [
    'enerji slow 106.2', 'enerji 93.1', 'dance fm kktc', 'dance fm - kktc',
    'radyo vatan turku', 'radyo nihavent', 'radyo vatan', 'radyo diyalog',
    'first fm', 'kibris sim radyo', 'kibris bayrak fm', 'kktc', 'kibris'
  ]
};

export function matchesCategory(station: RadioStation, categoryId: string): boolean {
  if (!categoryId || categoryId === 'all') return true;

  const nameNorm = normalizeName(station.name);
  const tagsNorm = normalizeName(station.tags);

  if (categoryId === 'diger_kategori') {
    // Check if it matches any known category
    for (const [catId, keywords] of Object.entries(CATEGORY_NAMES_MAP)) {
      if (keywords.some(k => nameNorm.includes(k) || tagsNorm.includes(k))) {
        return false;
      }
    }
    return true;
  }

  const keywords = CATEGORY_NAMES_MAP[categoryId];
  if (!keywords || keywords.length === 0) return true;

  return keywords.some(k => nameNorm.includes(k) || tagsNorm.includes(k));
}

export function matchesGroup(station: RadioStation, groupId: string): boolean {
  if (!groupId || groupId === 'all_groups') return true;

  const nameNorm = normalizeName(station.name);

  if (groupId === 'diger_grup') {
    // Check if station belongs to any named group
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
