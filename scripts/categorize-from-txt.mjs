import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const TXT_PATH = path.join(rootDir, 'public/assets/aistudio/turkiye_radyo_envanteri_625_kategorili_2026-11-15_c1a314ff.txt');
const ALL_JSON_PATH = path.join(rootDir, 'src/data/allTurkishStations.json');
const EXCEL_JSON_PATH = path.join(rootDir, 'src/data/excelVerifiedStations.json');

export function normalizeTr(s) {
  return (s || '')
    .toLowerCase()
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/i̇/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/[^a-z0-9]/g, '');
}

export function normalizeLoose(s) {
  return (s || '')
    .toLowerCase()
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/i̇/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/\b(turkiye|turkey|tr|256|128|64|fm|radyo|radio|istanbul|ankara|izmir)\b/g, ' ')
    .replace(/\b\d+(\.\d+)?\b/g, ' ')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const GROUP_MAP = {
  '01 TÜRKÇE POP': { id: 'turkce_pop', name: 'Türkçe Pop' },
  '02 YABANCI POP': { id: 'yabanci_pop', name: 'Yabancı Pop' },
  '03 SLOW': { id: 'slow', name: 'Slow' },
  '04 ARABESK': { id: 'arabesk', name: 'Arabesk' },
  '05 HALK YÖRESEL': { id: 'halk_yoresel', name: 'Halk & Yöresel' },
  '06 NOSTALJİ TSM': { id: 'nostalji_tsm', name: 'Nostalji & TSM' },
  '07 HABER SPOR': { id: 'haber_spor', name: 'Haber & Spor' },
  '08 DİNİ': { id: 'dini', name: 'Dini' },
  '09 ROCK RAP': { id: 'rock_rap', name: 'Rock & Rap' },
  '10 DANS CAZ KLASİK': { id: 'dans_caz_klasik', name: 'Dans, Caz & Klasik' },
  '11 KÜRTÇE': { id: 'kurtce', name: 'Kürtçe' },
  '12 KAMPÜS ÇOCUK': { id: 'kampus_cocuk', name: 'Kampüs & Çocuk' },
  '13 YEREL GENEL': { id: 'yerel_genel', name: 'Yerel & Genel' }
};

const MAIN_CAT_TO_GROUP = {
  'Türkçe Pop': '01 TÜRKÇE POP',
  'Yabancı Pop / Hit': '02 YABANCI POP',
  'Slow / Romantik': '03 SLOW',
  'Arabesk / Fantezi': '04 ARABESK',
  'Karadeniz / Yöresel': '05 HALK YÖRESEL',
  'Türk Halk Müziği / Türkü': '05 HALK YÖRESEL',
  'Yerel / Yöresel': '05 HALK YÖRESEL',
  'Nostalji / Retro': '06 NOSTALJİ TSM',
  'Türk Sanat Müziği': '06 NOSTALJİ TSM',
  'Haber / Ekonomi': '07 HABER SPOR',
  'Spor': '07 HABER SPOR',
  'Dini / Tasavvuf': '08 DİNİ',
  'Rap / Hip-Hop': '09 ROCK RAP',
  'Rock / Alternatif': '09 ROCK RAP',
  'Caz / Blues': '10 DANS CAZ KLASİK',
  'Elektronik / Dans': '10 DANS CAZ KLASİK',
  'Klasik / Enstrümantal': '10 DANS CAZ KLASİK',
  'Kürtçe / Bölgesel': '11 KÜRTÇE',
  'Kampüs / Üniversite': '12 KAMPÜS ÇOCUK',
  'Çocuk / Aile': '12 KAMPÜS ÇOCUK',
  'Genel / Karışık': '13 YEREL GENEL',
  'Sohbet / Kültür': '13 YEREL GENEL',
  'Yerel / Türü belirsiz': '13 YEREL GENEL'
};

// Curated alias mapping (normalized source name -> normalized TXT canonical name)
const EXPLICIT_ALIASES = {
  'virginradioturkiye': 'virginradio',
  'virginradyo': 'virginradio',
  'number1turkfm': 'number1turk',
  'numberoneturk': 'number1turk',
  'numberone': 'numberonefm',
  'numberoneworld': 'numberonefm',
  'numberoneworldturkey': 'numberonefm',
  'numberonefm': 'numberonefm',
  'numberoneturkajdapekkan': 'number1turk',
  'numberonejazz': 'radyo3',
  'palstation': '106palstation',
  'ahaberradyo': 'ahaber',
  'kralturkfm': 'kralfm',
  '1021arabeskinmerkezifm': 'arabeskinmerkezifm',
  '90larturkey': '90larradyo',
  '90larpop': '90larradyo',
  '90lar': '90larradyohome',
  'pop90turkey': 'pop90',
  '930igdirfm': 'igdirfm',
  '1014hataytempofm': 'hataytempofm',
  '951temporadyohatay': 'hataytempofm',
  'babylandturkey': 'babyland',
  '1074radiovoyage': 'radyovoyage',
  'radiovoyage': 'radyovoyage',
  'powerturkdans': 'powerturkdans',
  'powerturkfmm': 'powerturk',
  'powerturkfm': 'powerturk',
  'powerturkfmm2': 'powerturkfm2',
  'powerturkfmslow': 'powerturkslow',
  'powerturkakustik': 'powerturkakustik',
  'powerfmturkiye': 'powerfm',
  'powerxlturkey': 'powerxl',
  'powergoldtr': 'powergold',
  'powerlove': 'powerlovefm',
  'radyotrafik1042ankara': 'radyotrafik',
  'egehavalarturkey': 'egehavalari',
  'egehavalariturkey': 'egehavalari',
  'radyoegehavalari': 'egehavalari',
  'metrofmturkey': 'metrofm',
  'superfm999': 'superfm',
  'superfm2turkey': 'super2fm',
  'turkrockfm': 'rockfm',
  'radyo45lik': 'radyo45lik',
  'radyo45lik45likradyo': 'radyo45lik',
  'loopsradioelectronicastation': 'loopsradioelectronica',
  'golradyo': 'radyogol',
  'megaaskfm': 'radyomega',
  'radio44': 'radyo44',
  'radyobankofm': 'radyobanko',
  'radiomegasite': 'megasite',
  '1011megasite': 'megasite',
  'radioomegasite': 'megasite',
  'radyomegasite': 'megasite',
  'houselandturkey': 'radyohouseland',
  'kurd1': 'kurd1fm',
  'vokaltr': 'radyovokal',
  'klasradioturkey': 'radyoklas',
  'antakyarenkfmhatay': 'antakyarenkfm',
  'beyaztv': 'beyaztvradyo',
  'radyoarkadas': 'arkadasradyo',
  'pazarcik': 'pazarcikfm',
  'dadasfmerzurum': 'dadaradyo',
  'classiclandturkey': 'classicland',
  'ulusalarabesk': 'arabeskfm',
  'firatfm': 'radyofirat',
  'therockradio': 'rockfm',
  'ihyafm': 'radyoihya',
  'efsane4luturkey': 'efsane4lu',
  'fenomen2010lar256': 'fenomen2010lar',
  'radyofenomen2010lar': 'fenomen2010lar',
  'fenomenturk256': 'fenomenturk',
  'fenomendans256': 'fenomendans',
  'fenomenpop256': 'fenomenpop',
  'fenomenrap': 'fenomenrap',
  'tezene': 'radyotezene',
  'ulkuradyo': 'radyoulku',
  'radyonostaljininsesi': 'nostaljininsesi',
  'joyturkfm': 'joyturk',
  'joyturk': 'joyturk',
  'slowturk': 'slowturk',
  'dancelandturkey': 'danceland',
  'greekland': 'greeklandradyo',
  'showradio': 'showradyo',
  'gokkusagiradyoturkey': 'radyogokkusagi',
  'dunyadansesler': 'dunyadanseslerradio',
  'gulfm': 'radyogul',
  'radyocan': 'canfm',
  'radyoender': 'enderunfm',
  'masalradyo': 'masalfm',
  'radyodoksanlar': 'doksanlarradyo',
  'radyogercek': 'gercekfm',
  'deryafm': 'radyoderyafm',
  'serhatfm915': 'serhatfm',
  'erkamradyo2ndstream': 'erkamradyo',
  'radioline': 'radyoline',
  'imajfmerzurum': 'imajfm',
  'herankuranheranmutluluk': 'herankuranheran',
  'trio': 'radyotrio',
  'dogan21': 'dogan21fm',
  'banazdostfm': 'dostfm',
  'barisfm': 'barisfm1032',
  'sesfm': 'radyoses',
  'radyo24': '24radyo',
  'findacutie3': 'findacutie',
  'radyoantalya': 'radioantalya',
  'xradyo': 'xradio',
  'radyoblacklove': 'radyoblack',
  'radyomunzur977': 'radyomunzur',
  'radyosevtek': 'sevtekfm',
  'radyoturku': 'turkuradyo',
  'apacikradyo': 'apacikradyo',
  'radyoeksen': 'radyoeksen',
  'radyoeksen962': 'radyoeksen962',
  'kralpopalternatif2': 'kralpopalternatif2',
  'powerturkfmm': 'powerturk',
  'powerturkfm': 'powerturk',
  'powerturkfmturkey2': 'powerturkfm2'
};

// Fix known stream URLs for Popüler İlk 20 so every top station plays its true station stream over HTTPS
const CANONICAL_STREAM_OVERRIDES = {
  kralfm: {
    playUrl: 'https://dygedge2.radyotvonline.net/kralfm/playlist.m3u8',
    fallbackUrl: 'https://ssldyg.radyotvonline.com/smil/smil:kralfm.smil/playlist.m3u8',
    codec: 'HLS'
  },
  kralpop: {
    playUrl: 'https://ssldyg.radyotvonline.com/smil/smil:kralpop.smil/playlist.m3u8',
    fallbackUrl: 'https://dygedge2.radyotvonline.net/kralpop/playlist.m3u8',
    codec: 'HLS'
  },
  trtfm: {
    playUrl: 'https://rd-trtfm.medya.trt.com.tr/master_128.m3u8',
    fallbackUrl: 'https://rd-trtfm.medya.trt.com.tr/master.m3u8',
    codec: 'HLS'
  },
  radyo7: {
    playUrl: 'https://moondigitaledge.radyotvonline.net/radyo7/playlist.m3u8',
    fallbackUrl: 'http://46.20.3.251/stream/169/',
    codec: 'HLS'
  },
  virginradioturkiye: {
    playUrl: 'https://playerservices.streamtheworld.com/api/livestream-redirect/VIRGIN_RADIO_SC',
    fallbackUrl: 'http://28503.live.streamtheworld.com/VIRGIN_RADIO_SC',
    codec: 'MP3'
  },
  superfm: {
    playUrl: 'https://playerservices.streamtheworld.com/api/livestream-redirect/SUPER_FM_SC',
    fallbackUrl: 'https://yayin.superfmradyo.com.tr/superfm/stream',
    codec: 'MP3'
  },
  slowturk: {
    playUrl: 'https://radyo.duhnet.tv/ak_dtvh_slowturk',
    fallbackUrl: 'https://radyo.duhnet.tv/slowturk',
    codec: 'AAC'
  },
  radyoseymen: {
    playUrl: 'https://yayin.radyoseymen.com.tr:1070/stream',
    fallbackUrl: null,
    codec: 'MP3'
  },
  powerturk: {
    playUrl: 'https://live.powerapp.com.tr/powerturk/abr/playlist.m3u8',
    fallbackUrl: 'https://listen.powerapp.com.tr/powerturk/mpeg/icecast.audio',
    codec: 'HLS'
  },
  radyo45lik: {
    playUrl: 'https://stream.radyo45lik.com:4545/',
    fallbackUrl: null,
    codec: 'MP3'
  },
  kafaradyo: {
    playUrl: 'https://moondigitalmaster.radyotvonline.net/kafaradyo/playlist.m3u8',
    fallbackUrl: 'https://moondigitaledge2.radyotvonline.net/kafaradyo/playlist.m3u8',
    codec: 'HLS'
  },
  kalpfm: {
    playUrl: 'https://yayin.kalpfm.com:8080/',
    fallbackUrl: null,
    codec: 'MP3'
  },
  alemfm: {
    playUrl: 'https://turkmedya.radyotvonline.net/alemfmaac',
    fallbackUrl: 'https://turkmedya.radyotvonline.net/alemfm/playlist.m3u8',
    codec: 'AAC'
  },
  powerfm: {
    playUrl: 'https://live.powerapp.com.tr/powerfm/abr/powerfm/128/playlist.m3u8',
    fallbackUrl: 'https://live.powerapp.com.tr/powerfm/abr/playlist.m3u8',
    codec: 'HLS'
  },
  showradyo: {
    playUrl: 'https://showradyo.radyotvonline.net/showradyo',
    fallbackUrl: 'https://showradyo.radyotvonline.net/showradyo/playlist.m3u8',
    codec: 'AAC'
  },
  radyoturkuvaz: {
    playUrl: 'https://trkvz-radyolar.ercdn.net/radyoturkuvaz/playlist.m3u8',
    fallbackUrl: null,
    codec: 'HLS'
  },
  bestfm: {
    playUrl: 'https://ssldyg.radyotvonline.com/best/bestfm.stream/playlist.m3u8',
    fallbackUrl: null,
    codec: 'HLS'
  },
  joyturk: {
    playUrl: 'https://playerservices.streamtheworld.com/api/livestream-redirect/JOY_TURK_SC',
    fallbackUrl: 'https://playerservices.streamtheworld.com/api/livestream-redirect/JOY_TURK_ITUNES.mp3',
    codec: 'MP3'
  },
  metrofm: {
    playUrl: 'https://playerservices.streamtheworld.com/api/livestream-redirect/METRO_FM_SC',
    fallbackUrl: 'http://27753.live.streamtheworld.com:3690/METRO_FMAAC_SC',
    codec: 'MP3'
  },
  radyod: {
    playUrl: 'https://ssldyg.radyotvonline.com/radyod/radyod.stream/playlist.m3u8',
    fallbackUrl: 'https://moondigitaledge.radyotvonline.net/radyod/playlist.m3u8',
    codec: 'HLS'
  }
};

// Deterministic keyword fallback for any station not in the 625 TXT
function classifyFallbackStation(station) {
  const n = (station.name || '').toLowerCase();
  const t = (station.tags || '').toLowerCase();
  const combined = `${n} ${t}`;

  // Religious / Dini
  if (/kuran|kur['’]?an|meal|diyanet|ihya|semerkand|erkam|tasavvuf|ilahi|islamic|اذاعة|القرآن|nur radyo|fitrat|fıtrat|lale|rahmet/.test(combined)) {
    return 'Dini / Tasavvuf';
  }
  // Campus / University
  if (/universit|üniversit|kampus|kampüs|odtu|odtü|bilkent|itu|itü|ktu|ktü|ilef|campus/.test(combined)) {
    return 'Kampüs / Üniversite';
  }
  // Kids
  if (/cocuk|çocuk|baby|masal/.test(combined)) {
    return 'Çocuk / Aile';
  }
  // Kurdish
  if (/kurd|kürt|kurdi|mezopotamya|munzur|delal|havin|stran|deng/.test(combined)) {
    return 'Kürtçe / Bölgesel';
  }
  // Sports
  if (/spor|sport|gol |futbol|lig radyo/.test(combined)) {
    return 'Spor';
  }
  // News / Economy
  if (/haber|news|ekonomi|bloomberg|trafik|ntv|haberturk|habertürk/.test(combined)) {
    return 'Haber / Ekonomi';
  }
  // Rap / Hip-Hop
  if (/rap|hip[\s-]?hop|trap/.test(combined)) {
    return 'Rap / Hip-Hop';
  }
  // Rock / Alternative
  if (/rock|metal|alternatif|eksen|punk/.test(combined)) {
    return 'Rock / Alternatif';
  }
  // Jazz / Blues
  if (/jazz|caz|blues|smooth/.test(combined)) {
    return 'Caz / Blues';
  }
  // Classical / Instrumental
  if (/klasik|classical|trt3|trt radyo 3|trt 3|senfoni|opera|classicland|enstr/.test(combined)) {
    return 'Klasik / Enstrümantal';
  }
  // Electronic / Dance
  if (/dans|dance|house|techno|club|edm|electronic|elektron|trance|deep|dinamo|loops|chill|lounge|ambient/.test(combined)) {
    return 'Elektronik / Dans';
  }
  // Nostalji / Retro
  if (/45['’]?lik|70|80|90|doksanlar|nostalji|retro|eskiler|oldies|classic hits|efsane/.test(combined)) {
    return 'Nostalji / Retro';
  }
  // TSM
  if (/tsm|sanat muz|sanat müz|nagme|nağme|fasil|fasıl|alaturka|musiki/.test(combined)) {
    return 'Türk Sanat Müziği';
  }
  // THM / Türkü
  if (/turku|türkü|bozlak|halk muz|halk müz|baglama|bağlama|tezene|folk/.test(combined)) {
    return 'Türk Halk Müziği / Türkü';
  }
  // Karadeniz / Yöresel / Oyun Havası
  if (/karadeniz|hava|havalari|havaları|seymen|ankara|ege|kemence|horon/.test(combined)) {
    return 'Karadeniz / Yöresel';
  }
  // Arabesk / Fantezi
  if (/arabesk|damar|fantezi|kral|arabia/.test(combined)) {
    return 'Arabesk / Fantezi';
  }
  // Slow / Romantic
  if (/slow|ask|aşk|kalp|sevda|duygusal|melankolik|love|romantik/.test(combined)) {
    return 'Slow / Romantik';
  }
  // Foreign Pop
  if (/world|foreign|yabanci|yabancı|virgin|metro fm|power fm|power xl|power gold|pal station|number one|numberone|fenomen|antenne|greekland/.test(combined)) {
    return 'Yabancı Pop / Hit';
  }
  // Turkish Pop
  if (/pop|hit|taptaze|fenomen turk|fenomen türk|joy turk|joy türk|super fm|süper fm|best fm|alem fm|show radyo|turkuvaz|radyo d|fırat|firat|radyo 13|genc|genç|mega/.test(combined)) {
    return 'Türkçe Pop';
  }
  // Sohbet / Kültür
  if (/sohbet|kultur|kültür|kafa|apacik|apaçık|arabi/.test(combined)) {
    return 'Sohbet / Kültür';
  }
  // Local city radios -> Yerel / Türü belirsiz
  return 'Yerel / Türü belirsiz';
}

function parseTxtInventory() {
  const txt = fs.readFileSync(TXT_PATH, 'utf8');
  const lines = txt.split(/\r?\n/);

  const popular20 = [];
  const tum = [];
  const foreignControl = new Set();

  let section = null;
  for (const line of lines) {
    if (line.startsWith('SEKME: ')) {
      section = line.replace('SEKME: ', '').trim();
      continue;
    }
    if (!section || !line.trim() || line.startsWith('=')) continue;

    if (section === 'POPÜLER İLK 20' && /^\d+\t/.test(line)) {
      const cols = line.split('\t');
      popular20.push({
        popularRank: Number(cols[0]),
        name: cols[1].trim(),
        mainCategory: cols[3].trim(),
        categoryTab: cols[4].trim(),
        city: cols[5].trim()
      });
    } else if (section === 'TÜM RADYOLAR' && /^\d+\t/.test(line)) {
      const cols = line.split('\t');
      tum.push({
        rank: Number(cols[0]),
        name: cols[1].trim(),
        popularRank: cols[2] ? Number(cols[2]) : null,
        mainCategory: cols[3].trim(),
        categoryTab: cols[4].trim(),
        city: cols[5].trim()
      });
    } else if (section === 'TÜRKİYE DIŞI KONTROL') {
      const cols = line.split('\t');
      if (cols[0] && cols[1] === 'Radyovu') {
        foreignControl.add(normalizeTr(cols[0].trim()));
      }
    }
  }

  return { popular20, tum, foreignControl };
}

function run() {
  const { popular20, tum, foreignControl } = parseTxtInventory();
  const allJson = JSON.parse(fs.readFileSync(ALL_JSON_PATH, 'utf8'));
  const excelJson = JSON.parse(fs.readFileSync(EXCEL_JSON_PATH, 'utf8'));

  // Build exact and loose lookup maps from TXT TÜM RADYOLAR
  const txtByNorm = new Map();
  const txtByLoose = new Map();
  for (const t of tum) {
    const k = normalizeTr(t.name);
    if (!txtByNorm.has(k)) txtByNorm.set(k, t);
    const l = normalizeLoose(t.name);
    if (l && !txtByLoose.has(l)) txtByLoose.set(l, t);
  }

  // Canonical keys of Popüler İlk 20 mapped to the primary station norm key in JSON
  const POP20_CANONICAL_JSON_KEY = {
    1: 'kralfm',
    2: 'kralpop',
    3: 'trtfm',
    4: 'radyo7',
    5: 'virginradioturkiye',
    6: 'superfm',
    7: 'slowturk',
    8: 'radyoseymen',
    9: 'powerturk',
    10: 'radyo45lik',
    11: 'kafaradyo',
    12: 'kalpfm',
    13: 'alemfm',
    14: 'powerfm',
    15: 'showradyo',
    16: 'radyoturkuvaz',
    17: 'bestfm',
    18: 'joyturk',
    19: 'metrofm',
    20: 'radyod'
  };
  const popRankByJsonKey = new Map();
  for (const [rankStr, jsonKey] of Object.entries(POP20_CANONICAL_JSON_KEY)) {
    const p = popular20.find(x => x.popularRank === Number(rankStr));
    if (p) popRankByJsonKey.set(jsonKey, p);
  }

  // Merge excel verified URLs/favicons by normalized name
  const excelByNorm = new Map();
  for (const e of excelJson) {
    if (!e?.name) continue;
    const k = normalizeTr(e.name);
    if (!excelByNorm.has(k)) excelByNorm.set(k, e);
  }

  // Remove junk/TV/foreign-control entries that shouldn't pollute Turkish radio catalog
  const JUNK_KEYS = new Set([
    'noname',
    'rtste',
    'cantv',
    'szc',
    'httpsturkmedyaliveercdnnettv24tv24m3u8'
  ]);

  let stats = {
    kept: 0,
    removedJunk: 0,
    removedForeignControl: 0,
    matchedExact: 0,
    matchedAlias: 0,
    matchedLoose: 0,
    classifiedFallback: 0,
    pop20Found: 0
  };

  function enrichStationList(list, isExcel = false) {
    const out = [];
    const seenIds = new Set();

    for (const raw of list) {
      if (!raw || !raw.name) continue;
      const key = normalizeTr(raw.name);

      if (JUNK_KEYS.has(key) || raw.name.startsWith('http://') || raw.name.startsWith('https://')) {
        if (!isExcel) stats.removedJunk++;
        continue;
      }

      if (foreignControl.has(key)) {
        if (!isExcel) stats.removedForeignControl++;
        continue;
      }

      // Skip duplicate variants of Radyo 45'lik or Apacik Radyo if exact canonical exists
      if (!isExcel && (key.startsWith('radyo45likcanliyayin') || key === 'radyo45lik1970ler1980lerve1990lar')) {
        stats.removedJunk++;
        continue;
      }

      const id = raw.stationuuid || raw.id;
      if (id && seenIds.has(id)) continue;
      if (id) seenIds.add(id);

      // Lookup in TXT
      let txtMatch = txtByNorm.get(key);
      if (txtMatch) {
        if (!isExcel) stats.matchedExact++;
      } else if (EXPLICIT_ALIASES[key] && txtByNorm.has(EXPLICIT_ALIASES[key])) {
        txtMatch = txtByNorm.get(EXPLICIT_ALIASES[key]);
        if (!isExcel) stats.matchedAlias++;
      } else {
        const loose = normalizeLoose(raw.name);
        if (loose && loose.length >= 4 && txtByLoose.has(loose)) {
          txtMatch = txtByLoose.get(loose);
          if (!isExcel) stats.matchedLoose++;
        }
      }

      // Determine canonical Popüler İlk 20 assignment (exact 1..20 only once!)
      const popEntry = popRankByJsonKey.get(key) || (key === 'powerturkfm' ? null : null);
      // Note: In excelVerifiedStations, PowerTürk is spelled "Power Türk" -> norm key "powerturk"
      const popularRank = popEntry ? popEntry.popularRank : undefined;
      const isPopular = Boolean(popularRank);

      let mainCategory;
      let categoryTab;
      let city;

      if (popEntry) {
        mainCategory = popEntry.mainCategory;
        categoryTab = popEntry.categoryTab;
        city = popEntry.city !== 'Belirlenmedi' ? popEntry.city : '';
        if (!isExcel) stats.pop20Found++;
      } else if (txtMatch) {
        mainCategory = txtMatch.mainCategory;
        categoryTab = txtMatch.categoryTab;
        city = txtMatch.city !== 'Belirlenmedi' ? txtMatch.city : '';
      } else {
        mainCategory = classifyFallbackStation(raw);
        categoryTab = MAIN_CAT_TO_GROUP[mainCategory] || '13 YEREL GENEL';
        city = '';
        if (!isExcel) stats.classifiedFallback++;
      }

      const groupInfo = GROUP_MAP[categoryTab] || { id: 'yerel_genel', name: 'Yerel & Genel' };

      // Preserve & upgrade stream URLs from excelVerifiedStations or canonical overrides
      const excelMatch = excelByNorm.get(key);
      const override = CANONICAL_STREAM_OVERRIDES[key];

      const playUrl = override?.playUrl || excelMatch?.playUrl || raw.playUrl || raw.url_resolved || raw.url;
      const urlResolved = override?.playUrl || excelMatch?.url_resolved || raw.url_resolved || playUrl;
      const fallbackUrl = override ? override.fallbackUrl : (excelMatch?.fallbackUrl || raw.fallbackUrl || null);
      const codec = override?.codec || excelMatch?.codec || raw.codec || 'MP3';

      const cleanState = city || (raw.state && raw.state !== 'Turkey' && raw.state !== 'Belirlenmedi' ? raw.state : '');
      const tagParts = [];
      if (isPopular) tagParts.push('Popüler');
      tagParts.push(groupInfo.name);
      if (mainCategory !== groupInfo.name) tagParts.push(mainCategory);
      if (cleanState) tagParts.push(cleanState);

      const votes = isPopular
        ? 100000 - (popularRank - 1) * 500
        : Math.min(raw.votes || 0, 85000);

      const enriched = {
        ...raw,
        playUrl,
        streamUrl: playUrl,
        url: raw.url || playUrl,
        url_resolved: urlResolved,
        fallbackUrl,
        favicon: excelMatch?.favicon || raw.favicon || '',
        codec,
        isHttps: String(playUrl || '').toLowerCase().startsWith('https://'),
        requiresProxy: String(playUrl || '').toLowerCase().startsWith('http://'),
        state: cleanState || 'Türkiye',
        country: 'Turkey',
        countrycode: 'TR',
        countryCode: 'TR',
        mainCategory,
        categoryGroup: groupInfo.name,
        categoryGroupId: groupInfo.id,
        isPopular,
        ...(popularRank ? { popularRank } : {}),
        votes,
        tags: tagParts.join(', ')
      };

      if (!popularRank) {
        delete enriched.popularRank;
      }

      out.push(enriched);
      if (!isExcel) stats.kept++;
    }

    // Sort: Popüler İlk 20 first (1..20), then by votes descending
    out.sort((a, b) => {
      const ra = a.popularRank ?? 999;
      const rb = b.popularRank ?? 999;
      if (ra !== rb) return ra - rb;
      return (b.votes || 0) - (a.votes || 0);
    });

    return out;
  }

  const enrichedAll = enrichStationList(allJson, false);
  const enrichedExcel = enrichStationList(excelJson, true);

  fs.writeFileSync(ALL_JSON_PATH, JSON.stringify(enrichedAll, null, 2) + '\n', 'utf8');
  fs.writeFileSync(EXCEL_JSON_PATH, JSON.stringify(enrichedExcel, null, 2) + '\n', 'utf8');

  // Print distribution report
  const byGroup = {};
  const byMain = {};
  for (const s of enrichedAll) {
    byGroup[s.categoryGroup] = (byGroup[s.categoryGroup] || 0) + 1;
    byMain[s.mainCategory] = (byMain[s.mainCategory] || 0) + 1;
  }

  console.log('Stats:', stats);
  console.log('Total enriched allTurkishStations:', enrichedAll.length);
  console.log('Total enriched excelVerifiedStations:', enrichedExcel.length);
  console.log('\nPopüler İlk 20 in enrichedAll:');
  enrichedAll.filter(s => s.popularRank).forEach(s => {
    console.log(`  #${s.popularRank} ${s.name} -> [${s.categoryGroup} / ${s.mainCategory}] -> ${s.playUrl}`);
  });
  console.log('\nCategory Group Distribution:');
  Object.entries(byGroup).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
  console.log('\nMain Category Distribution:');
  Object.entries(byMain).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
}

run();
