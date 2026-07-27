import { RadioStation } from '../types';

export interface VerifiedStationInfo {
  name: string;
  urls: string[];
  tags: string;
  favicon: string;
}

export const VERIFIED_TURKISH_STATIONS: RadioStation[] = [
  {
    stationuuid: 'v-kafa-radyo',
    name: 'Kafa Radyo',
    playUrl: 'https://edge1.radyotvonline.net/shoutcast/play/kafaradyo',
    url: 'https://edge1.radyotvonline.net/shoutcast/play/kafaradyo',
    url_resolved: 'https://edge1.radyotvonline.net/shoutcast/play/kafaradyo',
    homepage: 'https://www.kafaradyo.com',
    favicon: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=200&q=80',
    tags: 'pop,rock,sohbet,kultur,turkce',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'turkish',
    votes: 25000,
    codec: 'AAC',
    bitrate: 128
  },
  {
    stationuuid: 'v-super-fm',
    name: 'Süper FM',
    playUrl: 'https://29103.live.streamtheworld.com/SUPER_FM_SC',
    url: 'https://29103.live.streamtheworld.com/SUPER_FM_SC',
    url_resolved: 'https://29103.live.streamtheworld.com/SUPER_FM_SC',
    homepage: 'https://www.superfm.com.tr',
    favicon: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80',
    tags: 'pop,top40,hit,turkce',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'turkish',
    votes: 24000,
    codec: 'MP3',
    bitrate: 128
  },
  {
    stationuuid: 'v-alem-fm',
    name: 'Alem FM',
    playUrl: 'https://edge1.radyotvonline.net/shoutcast/play/alemfm',
    url: 'https://edge1.radyotvonline.net/shoutcast/play/alemfm',
    url_resolved: 'https://edge1.radyotvonline.net/shoutcast/play/alemfm',
    homepage: 'https://www.alemfm.com',
    favicon: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&q=80',
    tags: 'pop,sohbet,müzik,turkce',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'turkish',
    votes: 23000,
    codec: 'AAC',
    bitrate: 128
  },
  {
    stationuuid: 'v-trt-fm',
    name: 'TRT FM',
    playUrl: 'https://rd-trtfm.medya.trt.com.tr/master_128.m3u8',
    url: 'https://rd-trtfm.medya.trt.com.tr/master_128.m3u8',
    url_resolved: 'https://rd-trtfm.medya.trt.com.tr/master_128.m3u8',
    homepage: 'https://www.trtfm.com.tr',
    favicon: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=200&q=80',
    tags: 'pop,top40,news,haber,turkce',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Ankara',
    language: 'turkish',
    votes: 22000,
    codec: 'HLS',
    bitrate: 128
  },
  {
    stationuuid: 'v-kral-fm',
    name: 'Kral FM',
    playUrl: 'https://dygedge2.radyotvonline.net/kralfm/playlist.m3u8',
    url: 'https://dygedge2.radyotvonline.net/kralfm/playlist.m3u8',
    url_resolved: 'https://dygedge2.radyotvonline.net/kralfm/playlist.m3u8',
    homepage: 'https://www.kralmuzik.com.tr',
    favicon: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&q=80',
    tags: 'arabesk,fantezi,nostalji,turkce',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'turkish',
    votes: 21000,
    codec: 'HLS',
    bitrate: 128
  },
  {
    stationuuid: 'v-virgin-radio',
    name: 'Virgin Radio Türkiye',
    playUrl: 'http://29103.live.streamtheworld.com/VIRGIN_RADIO_SC',
    url: 'http://29103.live.streamtheworld.com/VIRGIN_RADIO_SC',
    url_resolved: 'http://29103.live.streamtheworld.com/VIRGIN_RADIO_SC',
    homepage: 'https://www.karnaval.com/radyolar/virginradio',
    favicon: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&q=80',
    tags: 'pop,rock,hits,english',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'english',
    votes: 20000,
    codec: 'MP3',
    bitrate: 128
  },
  {
    stationuuid: 'v-dinamo-sleep',
    name: 'Dinamo Sleep',
    playUrl: 'http://channels.dinamo.fm/sleep-mp3',
    url: 'http://channels.dinamo.fm/sleep-mp3',
    url_resolved: 'http://channels.dinamo.fm/sleep-mp3',
    homepage: 'https://dinamo.fm',
    favicon: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=200&q=80',
    tags: 'ambient,chillout,sleep,relax,electronic',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'english',
    votes: 19500,
    codec: 'MP3',
    bitrate: 128
  },
  {
    stationuuid: 'v-dinamo-fm',
    name: 'Dinamo FM',
    playUrl: 'http://channels.dinamo.fm/deep-mp3',
    url: 'http://channels.dinamo.fm/deep-mp3',
    url_resolved: 'http://channels.dinamo.fm/deep-mp3',
    homepage: 'https://dinamo.fm',
    favicon: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&q=80',
    tags: 'electronic,dance,indie,house',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'english',
    votes: 19000,
    codec: 'MP3',
    bitrate: 128
  },
  {
    stationuuid: 'v-power-fm',
    name: 'Power FM',
    playUrl: 'https://live.powerapp.com.tr/powerfm/abr/powerfm/128/playlist.m3u8',
    url: 'https://live.powerapp.com.tr/powerfm/abr/powerfm/128/playlist.m3u8',
    url_resolved: 'https://live.powerapp.com.tr/powerfm/abr/powerfm/128/playlist.m3u8',
    homepage: 'https://www.powerapp.com.tr',
    favicon: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80',
    tags: 'pop,dance,hits,english',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'english',
    votes: 18500,
    codec: 'HLS',
    bitrate: 128
  },
  {
    stationuuid: 'v-power-turk',
    name: 'Power Türk',
    playUrl: 'https://live.powerapp.com.tr/powerturk/abr/playlist.m3u8',
    url: 'https://live.powerapp.com.tr/powerturk/abr/playlist.m3u8',
    url_resolved: 'https://live.powerapp.com.tr/powerturk/abr/playlist.m3u8',
    homepage: 'https://www.powerapp.com.tr',
    favicon: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&q=80',
    tags: 'pop,turkce pop,top40',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'turkish',
    votes: 18000,
    codec: 'HLS',
    bitrate: 128
  },
  {
    stationuuid: 'v-slow-turk',
    name: 'Slow Türk',
    playUrl: 'https://radyo.duhnet.tv/ak_dtvh_slowturk',
    url: 'https://radyo.duhnet.tv/ak_dtvh_slowturk',
    url_resolved: 'https://radyo.duhnet.tv/ak_dtvh_slowturk',
    homepage: 'https://www.slowturk.com.tr',
    favicon: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=200&q=80',
    tags: 'slow,love,ask,turkce slow',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'turkish',
    votes: 17500,
    codec: 'AAC',
    bitrate: 128
  },
  {
    stationuuid: 'v-show-radyo',
    name: 'Show Radyo',
    playUrl: 'https://showradyo.radyotvonline.net/showradyo',
    url: 'https://showradyo.radyotvonline.net/showradyo',
    url_resolved: 'https://showradyo.radyotvonline.net/showradyo',
    homepage: 'https://www.showradyo.com.tr',
    favicon: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&q=80',
    tags: 'pop,turkce,haber,sohbet',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'turkish',
    votes: 17000,
    codec: 'AAC',
    bitrate: 128
  },
  {
    stationuuid: 'v-joy-fm',
    name: 'Joy FM',
    playUrl: 'http://28993.live.streamtheworld.com:3690/JOY_FMAAC_SC',
    url: 'http://28993.live.streamtheworld.com:3690/JOY_FMAAC_SC',
    url_resolved: 'http://28993.live.streamtheworld.com:3690/JOY_FMAAC_SC',
    homepage: 'https://www.joyfm.com.tr',
    favicon: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=200&q=80',
    tags: 'slow,lounge,relax,foreign',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'english',
    votes: 16500,
    codec: 'AAC',
    bitrate: 128
  },
  {
    stationuuid: 'v-joy-turk',
    name: 'Joy Türk',
    playUrl: 'https://playerservices.streamtheworld.com/api/livestream-redirect/JOY_TURK_SC',
    url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/JOY_TURK_SC',
    url_resolved: 'https://playerservices.streamtheworld.com/api/livestream-redirect/JOY_TURK_SC',
    homepage: 'https://www.joyturk.com.tr',
    favicon: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=200&q=80',
    tags: 'slow,pop,turkce',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'turkish',
    votes: 16000,
    codec: 'MP3',
    bitrate: 128
  },
  {
    stationuuid: 'v-metro-fm',
    name: 'Metro FM',
    playUrl: 'http://28503.live.streamtheworld.com:3690/METRO_FMAAC_SC',
    url: 'http://28503.live.streamtheworld.com:3690/METRO_FMAAC_SC',
    url_resolved: 'http://28503.live.streamtheworld.com:3690/METRO_FMAAC_SC',
    homepage: 'https://www.metrofm.com.tr',
    favicon: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&q=80',
    tags: 'pop,foreign,hits,dance',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'english',
    votes: 15500,
    codec: 'AAC',
    bitrate: 128
  },
  {
    stationuuid: 'v-radyo-d',
    name: 'Radyo D',
    playUrl: 'https://moondigitaledge2.radyotvonline.net/radyod/playlist.m3u8',
    url: 'https://moondigitaledge2.radyotvonline.net/radyod/playlist.m3u8',
    url_resolved: 'https://moondigitaledge2.radyotvonline.net/radyod/playlist.m3u8',
    homepage: 'https://www.radyod.com.tr',
    favicon: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80',
    tags: 'pop,turkce,hit',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'turkish',
    votes: 15000,
    codec: 'HLS',
    bitrate: 128
  },
  {
    stationuuid: 'v-best-fm',
    name: 'Best FM',
    playUrl: 'https://ssldyg.radyotvonline.com/best/bestfm.stream/playlist.m3u8',
    url: 'https://ssldyg.radyotvonline.com/best/bestfm.stream/playlist.m3u8',
    url_resolved: 'https://ssldyg.radyotvonline.com/best/bestfm.stream/playlist.m3u8',
    homepage: 'https://www.bestfm.com.tr',
    favicon: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&q=80',
    tags: 'pop,news,haber,sohbet',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'turkish',
    votes: 14500,
    codec: 'HLS',
    bitrate: 128
  },
  {
    stationuuid: 'v-baba-radyo',
    name: 'Baba Radyo',
    playUrl: 'https://live.radyositesihazir.com:10997/;',
    url: 'https://live.radyositesihazir.com:10997/;',
    url_resolved: 'https://live.radyositesihazir.com:10997/;',
    homepage: 'https://www.babaradyo.com',
    favicon: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80',
    tags: 'arabesk,fantezi,turkce',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'turkish',
    votes: 13500,
    codec: 'MP3',
    bitrate: 128
  },
  {
    stationuuid: 'v-trt-turku',
    name: 'TRT Türkü',
    playUrl: 'https://rd-trtturku.medya.trt.com.tr/master_128.m3u8',
    url: 'https://rd-trtturku.medya.trt.com.tr/master_128.m3u8',
    url_resolved: 'https://rd-trtturku.medya.trt.com.tr/master_128.m3u8',
    homepage: 'https://www.trtturku.com.tr',
    favicon: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&q=80',
    tags: 'folk,turku,halk muzigi',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Ankara',
    language: 'turkish',
    votes: 13000,
    codec: 'HLS',
    bitrate: 128
  },
  {
    stationuuid: 'v-trt-radyo-1',
    name: 'TRT Radyo 1',
    playUrl: 'https://trt.radyotvonline.net/trt1',
    url: 'https://trt.radyotvonline.net/trt1',
    url_resolved: 'https://trt.radyotvonline.net/trt1',
    homepage: 'https://www.trtradyo1.com.tr',
    favicon: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=200&q=80',
    tags: 'news,haber,sohbet,kultur,turkce',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Ankara',
    language: 'turkish',
    votes: 12500,
    codec: 'AAC',
    bitrate: 128
  },
  {
    stationuuid: 'v-damar-turk',
    name: 'Damar Türk FM',
    playUrl: 'https://live.radyositesihazir.com:10997/;',
    url: 'https://live.radyositesihazir.com:10997/;',
    url_resolved: 'https://live.radyositesihazir.com:10997/;',
    homepage: 'https://damarturkfm.com',
    favicon: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&q=80',
    tags: 'arabesk,damar,fantezi',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Istanbul',
    language: 'turkish',
    votes: 12000,
    codec: 'MP3',
    bitrate: 128
  },
  {
    stationuuid: 'v-diyanet-radyo',
    name: 'Diyanet Radyo',
    playUrl: 'https://eustr73.mediatriple.net/videoonlylive/mtikoimxnztxlive/broadcast_5e3c1171d7d2a.smil/playlist.m3u8',
    url: 'https://eustr73.mediatriple.net/videoonlylive/mtikoimxnztxlive/broadcast_5e3c1171d7d2a.smil/playlist.m3u8',
    url_resolved: 'https://eustr73.mediatriple.net/videoonlylive/mtikoimxnztxlive/broadcast_5e3c1171d7d2a.smil/playlist.m3u8',
    homepage: 'https://diyanetradyo.com',
    favicon: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=200&q=80',
    tags: 'religious,dini,sohbet,kultur',
    country: 'Turkey',
    countrycode: 'TR',
    state: 'Ankara',
    language: 'turkish',
    votes: 11500,
    codec: 'HLS',
    bitrate: 128
  }
];

// Fallback mirror map by station name / keyword
export const STATION_MIRRORS_MAP: Record<string, string[]> = {
  'kafa radyo': [
    'https://edge1.radyotvonline.net/shoutcast/play/kafaradyo',
    'https://moondigitalmaster.radyotvonline.net/kafaradyo/playlist.m3u8',
    'https://listen.kafaradyo.com/stream'
  ],
  'super fm': [
    'https://29103.live.streamtheworld.com/SUPER_FM_SC',
    'https://playerservices.streamtheworld.com/api/livestream-redirect/SUPER_FM_SC',
    'http://stream.super.fm:8000/superfm.mp3'
  ],
  'alem fm': [
    'https://edge1.radyotvonline.net/shoutcast/play/alemfm',
    'https://turkmedya.radyotvonline.net/alemfmaac',
    'http://turkmedya.radyotvonline.com/turkmedya/alemfm.stream/playlist.m3u8'
  ],
  'trt fm': [
    'https://rd-trtfm.medya.trt.com.tr/master_128.m3u8',
    'https://trt.radyotvonline.net/trtfm'
  ],
  'kral fm': [
    'https://dygedge2.radyotvonline.net/kralfm/playlist.m3u8',
    'https://live.radyositesihazir.com/8032/stream'
  ],
  'virgin radio': [
    'http://29103.live.streamtheworld.com/VIRGIN_RADIO_SC',
    'https://playerservices.streamtheworld.com/api/livestream-redirect/VIRGIN_RADIO_SC'
  ],
  'dinamo sleep': [
    'http://channels.dinamo.fm/sleep-mp3',
    'http://channels.dinamo.fm/caffe-mp3',
    'http://channels.dinamo.fm/deep-mp3'
  ],
  'dinamo fm': [
    'http://channels.dinamo.fm/deep-mp3',
    'http://channels.dinamo.fm/discotheque-mp3',
    'http://channels.dinamo.fm/fluent-mp3'
  ],
  'power fm': [
    'https://live.powerapp.com.tr/powerfm/abr/powerfm/128/playlist.m3u8',
    'https://powerfm.listenpowerapp.com/powerfm/mpeg/icecast.audio'
  ],
  'power turk': [
    'https://live.powerapp.com.tr/powerturk/abr/playlist.m3u8',
    'https://listen.powerapp.com.tr/powerturk/abr/playlist.m3u8'
  ],
  'slow turk': [
    'https://radyo.duhnet.tv/ak_dtvh_slowturk'
  ],
  'show radyo': [
    'https://showradyo.radyotvonline.net/showradyo',
    'http://showradyo.radyotvonline.net/showradyoaac/'
  ],
  'joy fm': [
    'http://28993.live.streamtheworld.com:3690/JOY_FMAAC_SC',
    'https://playerservices.streamtheworld.com/api/livestream-redirect/JOY_FMAAC_SC'
  ],
  'joy turk': [
    'https://playerservices.streamtheworld.com/api/livestream-redirect/JOY_TURK_SC',
    'https://playerservices.streamtheworld.com/api/livestream-redirect/JOY_TURK_ITUNES.mp3'
  ],
  'metro fm': [
    'http://28503.live.streamtheworld.com:3690/METRO_FMAAC_SC',
    'https://playerservices.streamtheworld.com/api/livestream-redirect/METRO_FMAAC_SC'
  ],
  'radyo d': [
    'https://moondigitaledge2.radyotvonline.net/radyod/playlist.m3u8'
  ],
  'best fm': [
    'https://ssldyg.radyotvonline.com/best/bestfm.stream/playlist.m3u8',
    'https://hepsibest.radyotvonline.net/bestslow'
  ],
  'diyanet radyo': [
    'https://eustr73.mediatriple.net/videoonlylive/mtikoimxnztxlive/broadcast_5e3c1171d7d2a.smil/playlist.m3u8'
  ],
  'trt turku': [
    'https://rd-trtturku.medya.trt.com.tr/master_128.m3u8'
  ]
};

/**
 * Returns candidate stream URLs for a station name or station object
 */
export function getCandidateUrlsForStation(station: RadioStation): string[] {
  const candidates: string[] = [];
  const primary = station.url_resolved || station.url || station.playUrl || station.streamUrl;
  if (primary) candidates.push(primary);

  const normalizedName = station.name
    .toLowerCase()
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .trim();

  for (const [key, mirrors] of Object.entries(STATION_MIRRORS_MAP)) {
    if (normalizedName.includes(key)) {
      for (const m of mirrors) {
        if (!candidates.includes(m)) {
          candidates.push(m);
        }
      }
    }
  }

  // Also try backup URL if primary is http and can be https or vice versa
  if (primary) {
    if (primary.startsWith('http://')) {
      const httpsVersion = primary.replace('http://', 'https://');
      if (!candidates.includes(httpsVersion)) candidates.push(httpsVersion);
    } else if (primary.startsWith('https://')) {
      const httpVersion = primary.replace('https://', 'http://');
      if (!candidates.includes(httpVersion)) candidates.push(httpVersion);
    }
  }

  return candidates;
}
