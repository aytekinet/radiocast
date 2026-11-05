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

// Exactly 629 Turkish stations, each enriched with high-quality verified stream URLs
export const ALL_TURKISH_STATIONS: RadioStation[] = (allTurkishStationsJson as RadioStation[]).map(s => {
  const k = (s.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const verified = excelMap.get(k);
  if (verified) {
    return {
      ...s,
      playUrl: verified.playUrl || verified.streamUrl || s.playUrl,
      streamUrl: verified.streamUrl || verified.playUrl || s.streamUrl,
      url_resolved: verified.url_resolved || verified.playUrl || s.url_resolved,
      fallbackUrl: verified.fallbackUrl || s.fallbackUrl,
      favicon: verified.favicon || s.favicon,
      votes: (s.votes || 0) + 100 // Boost verified live stations
    };
  }
  return s;
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
    'https://dygedge2.radyotvonline.net/kralfm/playlist.m3u8',
    'https://ssldyg.radyotvonline.com/smil/smil:kralpop.smil/playlist.m3u8'
  ],
  kralfm: [
    'https://dygedge2.radyotvonline.net/kralfm/playlist.m3u8'
  ],
  powerturk: [
    'https://listen.powerapp.com.tr/powerturkslow/mpeg/icecast.audio',
    'https://live.powerapp.com.tr/powerturk/abr/playlist.m3u8',
    'https://live.powerapp.com.tr/powerturk/abr/powerturk/128/playlist.m3u8'
  ],
  superfm: [
    'https://yayin.superfmradyo.com.tr/superfm/stream',
    'https://playerservices.streamtheworld.com/api/livestream-redirect/SUPER_FM_SC'
  ],
  radyo7: [
    'https://moondigitaledge.radyotvonline.net/radyo7/playlist.m3u8',
    'http://46.20.3.251/stream/169/'
  ],
  ntvradyo: [
    'https://dygedge2.radyotvonline.net/ntvradyo/playlist.m3u8'
  ],
  slowturk: [
    'https://radyo.duhnet.tv/ak_dtvh_slowturk'
  ],
  acikradyo: [
    'http://stream.34bit.net/ar.aac'
  ],
  metrofm: [
    'https://playerservices.streamtheworld.com/api/livestream-redirect/METRO_FM_SC'
  ],
  joyturk: [
    'https://playerservices.streamtheworld.com/api/livestream-redirect/JOY_TURK_SC'
  ],
  powerfm: [
    'https://live.powerapp.com.tr/powerfm/abr/playlist.m3u8'
  ],
  radyod: [
    'https://moondigitaledge.radyotvonline.net/radyod/playlist.m3u8',
    'https://dygedge2.radyotvonline.net/radyod/playlist.m3u8'
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
