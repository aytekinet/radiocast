import { RadioStation } from '../types';
import excelStationsJson from './excelVerifiedStations.json';
import allTurkishStationsJson from './allTurkishStations.json';

// High-Priority Live-Tested & Fully Verified Stations from User Excel
export const VERIFIED_TURKISH_STATIONS: RadioStation[] = excelStationsJson as RadioStation[];

// Map verified streams by normalized name for quick stream enrichment
const excelMap = new Map<string, RadioStation>();
for (const e of VERIFIED_TURKISH_STATIONS) {
  if (e && e.name) {
    const k = e.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!excelMap.has(k)) {
      excelMap.set(k, e);
    }
  }
}

// Custom Popular Top 20 order override (Kafa Radyo #1, Alem FM #2, Best FM #3, ...)
const POPULAR_RANK_OVERRIDE: Record<string, number> = {
  kafaradyo: 1,
  alemfm: 2,
  bestfm: 3,
  superfm: 4,
  kralpop: 5,
  kralfm: 6,
  powerturk: 7,
  powerfm: 8,
  trtfm: 9,
  joyturk: 10,
  slowturk: 11,
  showradyo: 12,
  metrofm: 13,
  virginradioturkiye: 14,
  radyod: 15,
  radyo7: 16,
  radyoturkuvaz: 17,
  radyo45lik: 18,
  radyoseymen: 19,
  kalpfm: 20
};

function normStationKey(name: string): string {
  return (name || '')
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

// Enriched Turkish stations catalog with verified stream URLs & TXT categorization
export const ALL_TURKISH_STATIONS: RadioStation[] = (allTurkishStationsJson as RadioStation[])
  .map(s => {
    const k = normStationKey(s.name || '');
    const kAscii = (s.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const verified = excelMap.get(k) || excelMap.get(kAscii);
    const overrideRank = POPULAR_RANK_OVERRIDE[k];
    const resolvedRank = overrideRank ?? s.popularRank ?? verified?.popularRank;

    if (verified) {
      return {
        ...s,
        playUrl: s.playUrl || verified.playUrl || verified.streamUrl,
        streamUrl: s.streamUrl || s.playUrl || verified.streamUrl || verified.playUrl,
        url_resolved: s.url_resolved || verified.url_resolved || verified.playUrl,
        fallbackUrl: s.fallbackUrl || verified.fallbackUrl,
        favicon: verified.favicon || s.favicon,
        mainCategory: s.mainCategory || verified.mainCategory,
        categoryGroup: s.categoryGroup || verified.categoryGroup,
        categoryGroupId: s.categoryGroupId || verified.categoryGroupId,
        isPopular: Boolean(overrideRank ? true : (s.isPopular ?? verified.isPopular)),
        popularRank: resolvedRank,
        votes: resolvedRank ? (100000 - (resolvedRank - 1) * 500) : ((s.votes || 0) + 100)
      };
    }
    if (overrideRank) {
      return {
        ...s,
        isPopular: true,
        popularRank: overrideRank,
        votes: 100000 - (overrideRank - 1) * 500
      };
    }
    return s;
  })
  .sort((a, b) => {
    const ra = a.popularRank ?? 9999;
    const rb = b.popularRank ?? 9999;
    if (ra !== rb) return ra - rb;
    return (b.votes || 0) - (a.votes || 0);
  });

export interface VerifiedStationInfo {
  name: string;
  urls: string[];
  tags: string;
  favicon: string;
}

const VERIFIED_STATION_STREAM_MAP: Record<string, string[]> = {
  kafaradyo: [
    'https://moondigitalmaster.radyotvonline.net/kafaradyo/playlist.m3u8',
    'https://moondigitaledge.radyotvonline.net/kafaradyo/playlist.m3u8'
  ],
  trtfm: [
    'https://rd-trtfm.medya.trt.com.tr/master_128.m3u8',
    'https://rd-trtfm.medya.trt.com.tr/master.m3u8'
  ],
  radyofenomen: [
    'https://live.radyofenomen.com/fenomen/128/icecast.audio',
    'https://live.radyofenomen.com/fenomen/abr/playlist.m3u8'
  ],
  bestfm: [
    'https://ssldyg.radyotvonline.com/best/bestfm.stream/playlist.m3u8'
  ],
  alemfm: [
    'https://turkmedya.radyotvonline.net/alemfmaac',
    'https://turkmedya.radyotvonline.net/alemfm/playlist.m3u8'
  ],
  kralpop: [
    'https://ssldyg.radyotvonline.com/smil/smil:kralpop.smil/playlist.m3u8',
    'https://dygedge2.radyotvonline.net/kralpop/playlist.m3u8'
  ],
  kralfm: [
    'https://dygedge2.radyotvonline.net/kralfm/playlist.m3u8',
    'https://ssldyg.radyotvonline.com/smil/smil:kralfm.smil/playlist.m3u8'
  ],
  powerturk: [
    'https://live.powerapp.com.tr/powerturk/abr/playlist.m3u8',
    'https://listen.powerapp.com.tr/powerturk/mpeg/icecast.audio'
  ],
  superfm: [
    'https://playerservices.streamtheworld.com/api/livestream-redirect/SUPER_FM_SC',
    'https://yayin.superfmradyo.com.tr/superfm/stream'
  ],
  radyo7: [
    'https://moondigitaledge.radyotvonline.net/radyo7/playlist.m3u8',
    'http://46.20.3.251/stream/169/'
  ],
  ntvradyo: [
    'https://dygedge2.radyotvonline.net/ntvradyo/playlist.m3u8'
  ],
  slowturk: [
    'https://radyo.duhnet.tv/ak_dtvh_slowturk',
    'https://radyo.duhnet.tv/slowturk'
  ],
  radyoseymen: [
    'https://yayin.radyoseymen.com.tr:1070/stream'
  ],
  kalpfm: [
    'https://yayin.kalpfm.com:8080/'
  ],
  showradyo: [
    'https://showradyo.radyotvonline.net/showradyo',
    'https://showradyo.radyotvonline.net/showradyo/playlist.m3u8'
  ],
  radyoturkuvaz: [
    'https://trkvz-radyolar.ercdn.net/radyoturkuvaz/playlist.m3u8'
  ],
  acikradyo: [
    'http://stream.34bit.net/ar.aac'
  ],
  metrofm: [
    'https://playerservices.streamtheworld.com/api/livestream-redirect/METRO_FM_SC'
  ],
  joyturk: [
    'https://playerservices.streamtheworld.com/api/livestream-redirect/JOY_TURK_SC',
    'https://playerservices.streamtheworld.com/api/livestream-redirect/JOY_TURK_ITUNES.mp3'
  ],
  powerfm: [
    'https://live.powerapp.com.tr/powerfm/abr/powerfm/128/playlist.m3u8',
    'https://live.powerapp.com.tr/powerfm/abr/playlist.m3u8'
  ],
  radyod: [
    'https://ssldyg.radyotvonline.com/radyod/radyod.stream/playlist.m3u8',
    'https://moondigitaledge.radyotvonline.net/radyod/playlist.m3u8'
  ],
  radyo45lik: [
    'https://stream.radyo45lik.com:4545/'
  ],
  virginradioturkiye: [
    'https://playerservices.streamtheworld.com/api/livestream-redirect/VIRGIN_RADIO_SC'
  ]
};

export function getCandidateUrlsForStation(station: RadioStation): string[] {
  const urls: string[] = [];
  const add = (u?: string | null) => {
    if (u && typeof u === 'string') {
      const trimmed = u.trim();
      if (trimmed && !urls.includes(trimmed)) {
        urls.push(trimmed);
      }
    }
  };

  const isHttpsPage = typeof window !== 'undefined' && window.location.protocol === 'https:';
  
  // 1. Look for known verified streams for this exact station by normalized name
  const cleanName = (station.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (cleanName && VERIFIED_STATION_STREAM_MAP[cleanName]) {
    for (const verifiedUrl of VERIFIED_STATION_STREAM_MAP[cleanName]) {
      add(verifiedUrl);
    }
  }

  // 2. Collect candidate URLs from station object
  const allCandidates = [
    station.url_resolved,
    station.playUrl,
    station.streamUrl,
    station.url,
    station.fallbackUrl
  ];

  if (isHttpsPage) {
    // When served over HTTPS, prioritize HTTPS streams first to prevent Mixed Content
    for (const u of allCandidates) {
      if (u && u.toLowerCase().startsWith('https://')) {
        add(u);
      }
    }
    // Also try HTTPS upgraded URLs for domain names (non-IP)
    for (const u of allCandidates) {
      if (u && u.toLowerCase().startsWith('http://') && !/^http:\/\/\d+\.\d+\.\d+\.\d+/i.test(u)) {
        add(u.replace(/^http:\/\//i, 'https://'));
      }
    }
  }

  for (const u of allCandidates) {
    add(u);
  }

  return urls;
}
