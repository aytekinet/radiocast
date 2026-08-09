import { RadioStation, RadioCountry } from '../types';
import { VERIFIED_TURKISH_STATIONS, ALL_TURKISH_STATIONS } from '../data/fallbackStations';
import { GENRE_CATEGORIES, ALL_COUNTRIES, matchesCategory } from '../constants/categories';
import { isStationBlocked } from './blacklist';

const RADIO_BROWSER_MIRRORS = [
  'https://de1.api.radio-browser.info',
  'https://all.api.radio-browser.info',
  'https://fr1.api.radio-browser.info',
  'https://fi1.api.radio-browser.info',
  'https://nl1.api.radio-browser.info',
  'https://at1.api.radio-browser.info'
];

async function fetchFromRadioBrowserDirect(path: string): Promise<any[]> {
  for (const mirror of RADIO_BROWSER_MIRRORS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);
      const res = await fetch(`${mirror}${path}`, {
        headers: {
          'Accept': 'application/json'
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            return data;
          }
        }
      }
    } catch (e) {
      // try next mirror
    }
  }

  // CORS proxy fallback for static hosting
  const corsProxies = [
    `https://corsproxy.io/?${encodeURIComponent('https://de1.api.radio-browser.info' + path)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent('https://de1.api.radio-browser.info' + path)}`
  ];

  for (const proxyUrl of corsProxies) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(proxyUrl, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch (e) {
      // ignore
    }
  }

  return [];
}

function formatRawStation(s: any): RadioStation {
  return {
    stationuuid: s.stationuuid || `tr-${Math.random().toString(36).substring(2, 9)}`,
    name: (s.name || 'İsimsiz Radyo').trim(),
    playUrl: s.url_resolved || s.url || '',
    url: s.url || s.url_resolved || '',
    url_resolved: s.url_resolved || s.url || '',
    homepage: s.homepage || '',
    favicon: s.favicon || '',
    tags: s.tags || '',
    country: s.country || 'Turkey',
    countrycode: (s.countrycode || 'TR').toUpperCase(),
    state: s.state || '',
    language: s.language || 'turkish',
    votes: typeof s.votes === 'number' ? s.votes : 0,
    codec: s.codec || 'MP3',
    bitrate: typeof s.bitrate === 'number' ? s.bitrate : 128
  };
}

function normalizeName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/[^a-z0-9]/g, '');
}

const VERIFIED_MAP = new Map<string, RadioStation>();
for (const v of VERIFIED_TURKISH_STATIONS) {
  if (v && v.name) {
    VERIFIED_MAP.set(normalizeName(v.name), v);
  }
}

export function enrichWithVerifiedStationData(station: RadioStation): RadioStation {
  if (!station || !station.name) return station;
  const norm = normalizeName(station.name);
  const matchedVerified = VERIFIED_MAP.get(norm);
  if (matchedVerified) {
    return {
      ...station,
      ...matchedVerified,
      stationuuid: matchedVerified.stationuuid || station.stationuuid,
      playUrl: matchedVerified.playUrl || matchedVerified.url_resolved || matchedVerified.url,
      url_resolved: matchedVerified.playUrl || matchedVerified.url_resolved || matchedVerified.url,
      url: matchedVerified.url || matchedVerified.playUrl || matchedVerified.url_resolved,
      favicon: matchedVerified.favicon || station.favicon,
      countrycode: 'TR',
      country: 'Turkey',
      codec: matchedVerified.codec || station.codec || 'HLS'
    };
  }
  return station;
}

const GUARANTEED_TURKISH_STATIONS = mergeVerifiedAndApiStations(VERIFIED_TURKISH_STATIONS, ALL_TURKISH_STATIONS);

function deduplicateStationsByName(list: RadioStation[]): RadioStation[] {
  const seen = new Set<string>();
  const result: RadioStation[] = [];

  for (const rawItem of list) {
    if (!rawItem || !rawItem.name) continue;
    const item = enrichWithVerifiedStationData(rawItem);
    if (isStationBlocked(item)) continue;
    const key = normalizeName(item.name);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }

  return result;
}

function mergeVerifiedAndApiStations(verified: RadioStation[], apiStations: RadioStation[]): RadioStation[] {
  const result: RadioStation[] = [];
  const apiMap = new Map<string, RadioStation>();

  for (const s of apiStations) {
    if (!s || !s.name) continue;
    const key = normalizeName(s.name);
    if (!apiMap.has(key)) {
      apiMap.set(key, s);
    }
  }

  const addedKeys = new Set<string>();

  for (const v of verified) {
    const key = normalizeName(v.name);
    addedKeys.add(key);

    const enriched = enrichWithVerifiedStationData(v);
    const apiMatch = apiMap.get(key);
    if (apiMatch) {
      result.push({
        ...apiMatch,
        ...enriched,
        stationuuid: enriched.stationuuid || apiMatch.stationuuid,
        playUrl: enriched.playUrl || apiMatch.playUrl || apiMatch.url_resolved || apiMatch.url,
        url_resolved: enriched.playUrl || apiMatch.url_resolved || enriched.url_resolved || apiMatch.url,
        url: enriched.url || apiMatch.url || apiMatch.url_resolved,
        favicon: enriched.favicon || apiMatch.favicon
      });
    } else {
      result.push(enriched);
    }
  }

  for (const s of apiStations) {
    if (!s || !s.name) continue;
    const key = normalizeName(s.name);
    if (!addedKeys.has(key)) {
      addedKeys.add(key);
      result.push(enrichWithVerifiedStationData(s));
    }
  }

  return result;
}

export async function getStationsByCountry(countryCode = 'TR', page = 1): Promise<RadioStation[]> {
  const codeUpper = (countryCode || 'TR').toUpperCase().trim();

  // 1. Try local Express API route (if running full-stack)
  try {
    const res = await fetch(`/api/radio/stations?country=${encodeURIComponent(codeUpper)}&page=${page}`);
    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          if (codeUpper === 'TR' && page === 1) {
            return mergeVerifiedAndApiStations(GUARANTEED_TURKISH_STATIONS, data);
          }
          return deduplicateStationsByName(data);
        }
      }
    }
  } catch (err) {
    console.warn('Backend API unavailable, falling back to direct Radio Browser API query:', err);
  }

  // 2. Direct client-side fetch from Radio-Browser API mirrors (Crucial for Vercel / static hosting!)
  try {
    const limit = codeUpper === 'TR' ? 600 : 300;
    const offset = (page - 1) * limit;

    let rawList = await fetchFromRadioBrowserDirect(
      `/json/stations/bycountrycodeexact/${encodeURIComponent(codeUpper)}?hidebroken=true&order=clickcount&reverse=true&limit=${limit}&offset=${offset}`
    );

    if (!rawList || rawList.length === 0) {
      rawList = await fetchFromRadioBrowserDirect(
        `/json/stations/bycountry/${encodeURIComponent(codeUpper)}?hidebroken=true&order=clickcount&reverse=true&limit=${limit}&offset=${offset}`
      );
    }

    if (!rawList || rawList.length === 0) {
      rawList = await fetchFromRadioBrowserDirect(
        `/json/stations/search?countrycode=${encodeURIComponent(codeUpper)}&order=clickcount&reverse=true&limit=${limit}&offset=${offset}`
      );
    }

    if (!rawList || rawList.length === 0) {
      rawList = await fetchFromRadioBrowserDirect(
        `/json/stations/search?country=${encodeURIComponent(codeUpper)}&order=clickcount&reverse=true&limit=${limit}&offset=${offset}`
      );
    }

    if (rawList && rawList.length > 0) {
      const formatted = rawList.map(formatRawStation);
      if (codeUpper === 'TR' && page === 1) {
        return mergeVerifiedAndApiStations(GUARANTEED_TURKISH_STATIONS, formatted);
      }
      return deduplicateStationsByName(formatted);
    }
  } catch (directErr) {
    console.warn('Direct radio browser fetch failed:', directErr);
  }

  // 3. Last fallback: local catalog
  if (codeUpper === 'TR' && page === 1) {
    return deduplicateStationsByName(GUARANTEED_TURKISH_STATIONS);
  }
  return [];
}

export async function searchStations(params: {
  q?: string;
  name?: string;
  tag?: string;
  language?: string;
  country?: string;
  countrycode?: string;
  page?: number;
}): Promise<RadioStation[]> {
  const query = (params.q || params.name || '').trim();
  const country = params.country || params.countrycode || '';
  const tag = params.tag || '';
  const language = params.language || '';
  const page = params.page || 1;

  // 1. Try local Express API route
  try {
    const queryParams = new URLSearchParams({
      page: page.toString()
    });
    if (query) queryParams.set('q', query);
    if (country) queryParams.set('country', country);
    if (tag) queryParams.set('tag', tag);
    if (language) queryParams.set('language', language);

    const res = await fetch(`/api/radio/search?${queryParams.toString()}`);
    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return deduplicateStationsByName(data);
      }
    }
  } catch (err) {
    console.warn('Backend search API failed, falling back to direct mirror search:', err);
  }

  // 2. Direct client-side fetch from Radio-Browser API mirrors
  try {
    const queryParams = new URLSearchParams({
      hidebroken: 'true',
      order: 'clickcount',
      reverse: 'true',
      limit: '300'
    });
    if (query) queryParams.set('name', query);
    if (country) queryParams.set('countrycode', country);
    if (tag) queryParams.set('tag', tag);
    if (language) queryParams.set('language', language);

    const rawList = await fetchFromRadioBrowserDirect(`/json/stations/search?${queryParams.toString()}`);
    if (rawList && rawList.length > 0) {
      const formatted = rawList.map(formatRawStation);
      return deduplicateStationsByName(formatted);
    }
  } catch (e) {
    console.warn('Direct radio browser search error:', e);
  }

  if ((!country || country === 'TR') && query) {
    const qLower = query.toLowerCase();
    const verifiedMatches = VERIFIED_TURKISH_STATIONS.filter(s =>
      s.name.toLowerCase().includes(qLower) ||
      s.tags.toLowerCase().includes(qLower)
    );
    return deduplicateStationsByName(verifiedMatches);
  }

  return [];
}

export async function getTopStationsByCountry(countryCode = 'TR', page = 1): Promise<RadioStation[]> {
  return getStationsByCountry(countryCode, page);
}

export async function getStationsByTag(categoryOrTag: string, countrycode = 'TR'): Promise<RadioStation[]> {
  const cat = GENRE_CATEGORIES.find(c => c.id === categoryOrTag || c.tag === categoryOrTag);
  const searchTags = cat?.tags && cat.tags.length > 0 ? cat.tags : [categoryOrTag];

  let aggregated: RadioStation[] = [];

  // Fetch stations for up to 3 associated tags in parallel
  await Promise.all(
    searchTags.slice(0, 3).map(async (tag) => {
      try {
        const list = await searchStations({ tag, country: countrycode, page: 1 });
        if (list.length > 0) {
          aggregated.push(...list);
        }
      } catch (e) {
        // ignore single tag query failure
      }
    })
  );

  // Merge with verified stations matching this category
  const verifiedMatches = VERIFIED_TURKISH_STATIONS.filter(s => matchesCategory(s, cat?.id || categoryOrTag));
  aggregated = [...verifiedMatches, ...aggregated];

  const result = deduplicateStationsByName(aggregated);
  if (result.length > 0) return result;

  // Fallback: if tag returned 0 results, return top country stations so page is never empty
  const countryStations = await getStationsByCountry(countrycode, 1);
  return countryStations;
}

export async function getCountries(): Promise<RadioCountry[]> {
  try {
    const res = await fetch('/api/radio/countries');
    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    }
  } catch (err) {
    console.warn('Failed to fetch countries backend:', err);
  }

  // Direct fetch fallback for static hosting
  try {
    const data = await fetchFromRadioBrowserDirect('/json/countries?hidebroken=true&order=stationcount&reverse=true');
    if (Array.isArray(data) && data.length > 0) {
      return data.map((c: any) => ({
        name: c.name,
        code: c.iso_3166_1 || c.code || '',
        iso_3166_1: c.iso_3166_1 || c.code || '',
        stationCount: c.stationcount || 0,
        stationcount: c.stationcount || 0
      }));
    }
  } catch (e) {}

  return ALL_COUNTRIES.map(c => ({
    code: c.code,
    iso_3166_1: c.code,
    name: c.name,
    stationCount: 100,
    stationcount: 100
  }));
}

export async function getPopularTags(): Promise<{ name: string; stationCount: number }[]> {
  try {
    const res = await fetch('/api/radio/tags');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    console.warn('Failed to fetch tags:', err);
  }

  return [
    { name: 'pop', stationCount: 2500 },
    { name: 'news', stationCount: 1800 },
    { name: 'rock', stationCount: 1500 },
    { name: 'talk', stationCount: 1200 },
    { name: 'classical', stationCount: 900 },
    { name: 'jazz', stationCount: 800 },
    { name: 'folk', stationCount: 600 }
  ];
}

export async function registerStationClick(stationId: string): Promise<void> {
  if (!stationId) return;
  try {
    fetch('/api/radio/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stationId })
    }).catch(() => {});
  } catch {
    // Non-blocking fire-and-forget
  }
}
