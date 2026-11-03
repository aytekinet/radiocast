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
  const allCandidates = [station.playUrl, station.streamUrl, station.fallbackUrl, station.url_resolved, station.url];

  if (isHttpsPage) {
    // When served over HTTPS, prioritize HTTPS streams first to prevent Mixed Content
    for (const u of allCandidates) {
      if (u && u.toLowerCase().startsWith('https://')) {
        add(u);
      }
    }
  }

  for (const u of allCandidates) {
    add(u);
  }

  return urls;
}
