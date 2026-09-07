import { RadioStation } from '../types';
import excelStationsJson from './excelVerifiedStations.json';
import allTurkishStationsJson from './allTurkishStations.json';

// 145 Live-Tested & Fully Verified Stations from User Excel
export const VERIFIED_TURKISH_STATIONS: RadioStation[] = excelStationsJson as RadioStation[];

// Combined Turkish Stations with Verified Stations guaranteed first
const rawCombined: RadioStation[] = [
  ...VERIFIED_TURKISH_STATIONS,
  ...(allTurkishStationsJson as RadioStation[])
];

// Deduplicate by name and uuid
const seenNames = new Set<string>();
const seenUuids = new Set<string>();
const deduplicatedCombined: RadioStation[] = [];

for (const st of rawCombined) {
  const norm = (st.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const uuid = st.stationuuid || st.id || '';
  if (!norm || seenNames.has(norm) || (uuid && seenUuids.has(uuid))) {
    continue;
  }
  seenNames.add(norm);
  if (uuid) seenUuids.add(uuid);
  deduplicatedCombined.push(st);
}

export const ALL_TURKISH_STATIONS: RadioStation[] = deduplicatedCombined;

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
    // When served over HTTPS (AI Studio preview, Vercel), prioritize HTTPS streams first to prevent Mixed Content
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

