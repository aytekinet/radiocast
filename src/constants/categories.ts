import { GenreCategory, RadioStation } from '../types';

export interface RadioGroup {
  id: string;
  name: string;
  stationNames: string[];
}

export interface SubCategoryDef {
  id: string;
  name: string;
  mainCategory: string;
  parentGroupId: string;
}

export const GENRE_CATEGORIES: GenreCategory[] = [
  { id: 'all', name: 'Tüm', tag: '', iconName: 'Radio', color: 'from-amber-500 to-orange-600' },
  { id: 'populer', name: 'Popüler İlk 20', tag: 'populer', iconName: 'Sparkles', color: 'from-yellow-400 to-amber-600' },
  { id: 'turkce_pop', name: 'Türkçe Pop', tag: 'turkce_pop', tags: ['pop', 'turkish pop'], iconName: 'Music', color: 'from-pink-500 to-rose-600' },
  { id: 'yabanci_pop', name: 'Yabancı Pop', tag: 'yabanci_pop', tags: ['pop', 'top 40', 'hits'], iconName: 'Globe', color: 'from-violet-500 to-cyan-500' },
  { id: 'slow', name: 'Slow', tag: 'slow', tags: ['slow', 'love', 'romantic', 'ballads'], iconName: 'HeartHandshake', color: 'from-purple-500 to-indigo-600' },
  { id: 'arabesk', name: 'Arabesk', tag: 'arabesk', tags: ['arabesk', 'folk'], iconName: 'Flame', color: 'from-fuchsia-600 to-purple-800' },
  { id: 'halk_yoresel', name: 'Halk & Yöresel', tag: 'halk_yoresel', tags: ['folk', 'traditional', 'ethnic'], iconName: 'BoomBox', color: 'from-emerald-600 to-green-700' },
  { id: 'nostalji_tsm', name: 'Nostalji & TSM', tag: 'nostalji_tsm', tags: ['oldies', 'retro', '80s', '90s'], iconName: 'Disc', color: 'from-orange-500 to-amber-700' },
  { id: 'haber_spor', name: 'Haber & Spor', tag: 'haber_spor', tags: ['news', 'talk', 'sport', 'sports'], iconName: 'Newspaper', color: 'from-blue-600 to-cyan-700' },
  { id: 'dini', name: 'Dini', tag: 'dini', tags: ['religious', 'islamic', 'christian', 'gospel'], iconName: 'Sun', color: 'from-sky-500 to-indigo-600' },
  { id: 'rock_rap', name: 'Rock & Rap', tag: 'rock_rap', tags: ['rock', 'alternative', 'rap', 'hiphop'], iconName: 'Guitar', color: 'from-red-600 to-orange-700' },
  { id: 'dans_caz_klasik', name: 'Dans, Caz & Klasik', tag: 'dans_caz_klasik', tags: ['dance', 'electronic', 'jazz', 'classical'], iconName: 'Disc', color: 'from-cyan-500 to-blue-600' },
  { id: 'kurtce', name: 'Kürtçe', tag: 'kurtce', tags: ['kurdish'], iconName: 'Radio', color: 'from-lime-600 to-green-700' },
  { id: 'kampus_cocuk', name: 'Kampüs & Çocuk', tag: 'kampus_cocuk', tags: ['university', 'college', 'kids', 'children'], iconName: 'Wifi', color: 'from-teal-500 to-cyan-600' },
  { id: 'yerel_genel', name: 'Yerel & Genel', tag: 'yerel_genel', tags: ['local', 'variety', 'culture'], iconName: 'Radio', color: 'from-stone-600 to-zinc-800' }
];

export const SUBCATEGORIES: SubCategoryDef[] = [
  // 05 HALK YÖRESEL
  { id: 'karadeniz_yoresel', name: 'Karadeniz / Yöresel', mainCategory: 'Karadeniz / Yöresel', parentGroupId: 'halk_yoresel' },
  { id: 'turku_thm', name: 'Türk Halk Müziği / Türkü', mainCategory: 'Türk Halk Müziği / Türkü', parentGroupId: 'halk_yoresel' },
  { id: 'yerel_yoresel', name: 'Yerel / Yöresel', mainCategory: 'Yerel / Yöresel', parentGroupId: 'halk_yoresel' },
  // 06 NOSTALJİ TSM
  { id: 'nostalji_retro', name: 'Nostalji / Retro', mainCategory: 'Nostalji / Retro', parentGroupId: 'nostalji_tsm' },
  { id: 'tsm', name: 'Türk Sanat Müziği', mainCategory: 'Türk Sanat Müziği', parentGroupId: 'nostalji_tsm' },
  // 07 HABER SPOR
  { id: 'haber_ekonomi', name: 'Haber / Ekonomi', mainCategory: 'Haber / Ekonomi', parentGroupId: 'haber_spor' },
  { id: 'spor', name: 'Spor', mainCategory: 'Spor', parentGroupId: 'haber_spor' },
  // 09 ROCK RAP
  { id: 'rock_alternatif', name: 'Rock / Alternatif', mainCategory: 'Rock / Alternatif', parentGroupId: 'rock_rap' },
  { id: 'rap_hiphop', name: 'Rap / Hip-Hop', mainCategory: 'Rap / Hip-Hop', parentGroupId: 'rock_rap' },
  // 10 DANS CAZ KLASİK
  { id: 'elektronik_dans', name: 'Elektronik / Dans', mainCategory: 'Elektronik / Dans', parentGroupId: 'dans_caz_klasik' },
  { id: 'klasik_muzik', name: 'Klasik / Enstrümantal', mainCategory: 'Klasik / Enstrümantal', parentGroupId: 'dans_caz_klasik' },
  { id: 'caz_blues', name: 'Caz / Blues', mainCategory: 'Caz / Blues', parentGroupId: 'dans_caz_klasik' },
  // 12 KAMPÜS ÇOCUK
  { id: 'kampus_universite', name: 'Kampüs / Üniversite', mainCategory: 'Kampüs / Üniversite', parentGroupId: 'kampus_cocuk' },
  { id: 'cocuk_aile', name: 'Çocuk / Aile', mainCategory: 'Çocuk / Aile', parentGroupId: 'kampus_cocuk' },
  // 13 YEREL GENEL
  { id: 'genel_karisik', name: 'Genel / Karışık', mainCategory: 'Genel / Karışık', parentGroupId: 'yerel_genel' },
  { id: 'sohbet_kultur', name: 'Sohbet / Kültür', mainCategory: 'Sohbet / Kültür', parentGroupId: 'yerel_genel' },
  { id: 'yerel_belirsiz', name: 'Yerel / Türü belirsiz', mainCategory: 'Yerel / Türü belirsiz', parentGroupId: 'yerel_genel' }
];

export const CATEGORY_ID_FROM_MAIN: Record<string, string> = {
  'Türkçe Pop': 'turkce_pop',
  'Yabancı Pop / Hit': 'yabanci_pop',
  'Slow / Romantik': 'slow',
  'Arabesk / Fantezi': 'arabesk',
  'Karadeniz / Yöresel': 'karadeniz_yoresel',
  'Türk Halk Müziği / Türkü': 'turku_thm',
  'Yerel / Yöresel': 'yerel_yoresel',
  'Nostalji / Retro': 'nostalji_retro',
  'Türk Sanat Müziği': 'tsm',
  'Haber / Ekonomi': 'haber_ekonomi',
  'Spor': 'spor',
  'Dini / Tasavvuf': 'dini',
  'Rap / Hip-Hop': 'rap_hiphop',
  'Rock / Alternatif': 'rock_alternatif',
  'Caz / Blues': 'caz_blues',
  'Elektronik / Dans': 'elektronik_dans',
  'Klasik / Enstrümantal': 'klasik_muzik',
  'Kürtçe / Bölgesel': 'kurtce',
  'Kampüs / Üniversite': 'kampus_universite',
  'Çocuk / Aile': 'cocuk_aile',
  'Genel / Karışık': 'genel_karisik',
  'Sohbet / Kültür': 'sohbet_kultur',
  'Yerel / Türü belirsiz': 'yerel_belirsiz'
};

export const GROUP_ID_FROM_MAIN: Record<string, string> = {
  'Türkçe Pop': 'turkce_pop',
  'Yabancı Pop / Hit': 'yabanci_pop',
  'Slow / Romantik': 'slow',
  'Arabesk / Fantezi': 'arabesk',
  'Karadeniz / Yöresel': 'halk_yoresel',
  'Türk Halk Müziği / Türkü': 'halk_yoresel',
  'Yerel / Yöresel': 'halk_yoresel',
  'Nostalji / Retro': 'nostalji_tsm',
  'Türk Sanat Müziği': 'nostalji_tsm',
  'Haber / Ekonomi': 'haber_spor',
  'Spor': 'haber_spor',
  'Dini / Tasavvuf': 'dini',
  'Rap / Hip-Hop': 'rock_rap',
  'Rock / Alternatif': 'rock_rap',
  'Caz / Blues': 'dans_caz_klasik',
  'Elektronik / Dans': 'dans_caz_klasik',
  'Klasik / Enstrümantal': 'dans_caz_klasik',
  'Kürtçe / Bölgesel': 'kurtce',
  'Kampüs / Üniversite': 'kampus_cocuk',
  'Çocuk / Aile': 'kampus_cocuk',
  'Genel / Karışık': 'yerel_genel',
  'Sohbet / Kültür': 'yerel_genel',
  'Yerel / Türü belirsiz': 'yerel_genel'
};

export function getSubcategoriesForGroup(groupId: string): SubCategoryDef[] {
  return SUBCATEGORIES.filter((s) => s.parentGroupId === groupId);
}

export function getParentGroupId(categoryId: string): string {
  const sub = SUBCATEGORIES.find((s) => s.id === categoryId);
  return sub ? sub.parentGroupId : categoryId;
}

export const RADIO_GROUPS: RadioGroup[] = [
  {
    id: 'trt_grup',
    name: 'TRT Radyoları',
    stationNames: ['trt radyo 1', 'trt radyo haber', 'trt turku', 'trt nagme', 'trt fm', 'trt']
  },
  {
    id: 'karnaval',
    name: 'Karnaval Medya',
    stationNames: ['super fm', 'metro fm', 'joyturk', 'joyturk rock', 'virgin radio', 'retro turk', 'borusan klasik', 'radyo mydonose']
  },
  {
    id: 'fenomen',
    name: 'Fenomen Medya',
    stationNames: ['radyo fenomen', 'fenomen']
  },
  {
    id: 'power_app',
    name: 'Power Medya',
    stationNames: ['powerturk', 'power dance', 'radyo koc', 'power app', 'power fm']
  },
  {
    id: 'dinamo',
    name: 'Dinamo.fm Ağı',
    stationNames: ['dinamo fm', 'dinamo']
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
    .replace(/i̇/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// International / foreign station tag fallback (ONLY used when station lacks catalog categoryGroupId)
const GLOBAL_TAG_KEYWORDS: Record<string, string[]> = {
  turkce_pop: ['turkish pop', 'turkce pop', 'pop'],
  yabanci_pop: ['top 40', 'top40', 'pop', 'hits', 'chart', 'mainstream', 'hot ac', 'contemporary'],
  slow: ['slow', 'love', 'romantic', 'ballad', 'soft', 'easy listening', 'chill'],
  arabesk: ['arabesk', 'oriental', 'arab', 'fantasy'],
  halk_yoresel: ['folk', 'traditional', 'ethnic', 'world', 'country', 'regional'],
  karadeniz_yoresel: ['karadeniz', 'folk', 'regional'],
  turku_thm: ['folk', 'turku', 'traditional'],
  yerel_yoresel: ['regional', 'local', 'folk'],
  nostalji_tsm: ['oldies', 'retro', '60s', '70s', '80s', '90s', 'classic hits', 'gold'],
  nostalji_retro: ['oldies', 'retro', '60s', '70s', '80s', '90s', 'classic hits'],
  tsm: ['classical turkish', 'sanat', 'alaturka'],
  haber_spor: ['news', 'talk', 'information', 'business', 'economy', 'sport', 'sports', 'football', 'haber', 'spor'],
  haber_ekonomi: ['news', 'talk', 'information', 'business', 'economy'],
  spor: ['sport', 'sports', 'football', 'soccer'],
  dini: ['religious', 'christian', 'gospel', 'islamic', 'islam', 'quran', 'catholic', 'spiritual'],
  rock_rap: ['rock', 'alternative', 'indie', 'metal', 'punk', 'rap', 'hip hop', 'hiphop', 'hip-hop', 'r&b', 'urban', 'trap'],
  rock_alternatif: ['rock', 'alternative', 'indie', 'metal', 'punk'],
  rap_hiphop: ['rap', 'hip hop', 'hiphop', 'hip-hop', 'r&b', 'trap'],
  dans_caz_klasik: ['dance', 'electronic', 'edm', 'house', 'techno', 'trance', 'club', 'jazz', 'blues', 'smooth jazz', 'classical', 'symphony', 'opera', 'instrumental'],
  elektronik_dans: ['dance', 'electronic', 'edm', 'house', 'techno', 'trance', 'club', 'dj'],
  klasik_muzik: ['classical', 'symphony', 'opera', 'chamber', 'piano', 'instrumental'],
  caz_blues: ['jazz', 'blues', 'smooth jazz', 'swing', 'soul'],
  kurtce: ['kurdish', 'kurtce', 'kurdi'],
  kampus_cocuk: ['university', 'college', 'campus', 'student', 'kids', 'children', 'family'],
  kampus_universite: ['university', 'college', 'campus', 'student'],
  cocuk_aile: ['kids', 'children', 'family'],
  yerel_genel: ['variety', 'eclectic', 'general', 'public radio', 'culture', 'talk', 'community'],
  genel_karisik: ['variety', 'eclectic', 'general', 'mix'],
  sohbet_kultur: ['talk', 'culture', 'arts', 'spoken word'],
  yerel_belirsiz: ['local', 'community', 'public radio']
};

const LEGACY_CATEGORY_ALIASES: Record<string, string[]> = {
  pop: ['turkce_pop', 'yabanci_pop'],
  news: ['haber_spor', 'haber_ekonomi'],
  haber: ['haber_spor', 'haber_ekonomi'],
  sports: ['haber_spor', 'spor'],
  rock: ['rock_rap', 'rock_alternatif'],
  jazz: ['dans_caz_klasik', 'caz_blues'],
  klasik_muzik: ['dans_caz_klasik', 'klasik_muzik'],
  culture: ['yerel_genel', 'sohbet_kultur'],
  nostalji_retro: ['nostalji_tsm', 'nostalji_retro'],
  arabesk_fantezi: ['arabesk'],
  slow_romantik: ['slow'],
  universite: ['kampus_cocuk', 'kampus_universite'],
  karma_genel: ['yerel_genel', 'genel_karisik'],
  yerel_bolgesel: ['yerel_genel', 'yerel_belirsiz']
};

export function matchesCategory(station: RadioStation, categoryId: string): boolean {
  if (!categoryId || categoryId === 'all') return true;

  // 1. Popüler İlk 20 check
  if (categoryId === 'populer') {
    if (station.popularRank && station.popularRank >= 1 && station.popularRank <= 20) return true;
    if (station.isPopular) return true;
    if (!station.categoryGroupId) {
      return (station.votes || 0) >= 300 || normalizeName(station.tags || '').includes('populer');
    }
    return false;
  }

  // 2. Canonical Turkish catalog check (strict & deterministic — zero cross-category leakage!)
  const stationGroupId =
    station.categoryGroupId ||
    (station.mainCategory ? GROUP_ID_FROM_MAIN[station.mainCategory] : undefined);
  const stationSubId = station.mainCategory ? CATEGORY_ID_FROM_MAIN[station.mainCategory] : undefined;

  if (stationGroupId || stationSubId) {
    if (stationGroupId === categoryId || stationSubId === categoryId) {
      return true;
    }
    const legacyTargets = LEGACY_CATEGORY_ALIASES[categoryId];
    if (legacyTargets) {
      return legacyTargets.includes(stationGroupId || '') || legacyTargets.includes(stationSubId || '');
    }
    return false;
  }

  // 3. Global / Radio-Browser foreign stations fallback
  const tagsNorm = normalizeName(station.tags || '');
  const nameNorm = normalizeName(station.name || '');

  const keywords = GLOBAL_TAG_KEYWORDS[categoryId];
  if (keywords && keywords.some((k) => tagsNorm.includes(k) || nameNorm.includes(k))) {
    return true;
  }

  const legacyTargets = LEGACY_CATEGORY_ALIASES[categoryId];
  if (legacyTargets) {
    return legacyTargets.some((targetId) => {
      const targetKw = GLOBAL_TAG_KEYWORDS[targetId];
      return targetKw ? targetKw.some((k) => tagsNorm.includes(k) || nameNorm.includes(k)) : false;
    });
  }

  return false;
}

export function matchesGroup(station: RadioStation, groupId: string): boolean {
  if (!groupId || groupId === 'all_groups') return true;

  const nameNorm = normalizeName(station.name);

  if (groupId === 'diger_grup') {
    for (const group of RADIO_GROUPS) {
      if (group.stationNames.some((s) => nameNorm.includes(s))) {
        return false;
      }
    }
    return true;
  }

  const group = RADIO_GROUPS.find((g) => g.id === groupId);
  if (!group) return true;

  return group.stationNames.some((s) => nameNorm.includes(s));
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
