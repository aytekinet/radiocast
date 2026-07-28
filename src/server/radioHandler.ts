import type { Request, Response } from 'express';
import { getFromCache, setToCache } from './cache';
import { VERIFIED_TURKISH_STATIONS } from '../data/fallbackStations';

let ACTIVE_MIRRORS = [
  'de1.api.radio-browser.info',
  'nl1.api.radio-browser.info',
  'at1.api.radio-browser.info',
  'all.api.radio-browser.info'
];
let lastMirrorFetchTime = 0;

async function refreshRadioServers(): Promise<string[]> {
  if (Date.now() - lastMirrorFetchTime < 30 * 60 * 1000 && ACTIVE_MIRRORS.length > 0) {
    return ACTIVE_MIRRORS;
  }

  try {
    const res = await fetch('https://de1.api.radio-browser.info/json/servers', {
      headers: {
        'User-Agent': 'RadioCastLive/1.0 (+https://radiocastlive.vercel.app)',
        'Accept': 'application/json'
      }
    });
    if (res.ok) {
      const data = await res.json() as Array<{ name?: string }>;
      if (Array.isArray(data) && data.length > 0) {
        const servers = data.map(s => s.name).filter((n): n is string => Boolean(n));
        if (servers.length > 0) {
          ACTIVE_MIRRORS = servers;
          lastMirrorFetchTime = Date.now();
        }
      }
    }
  } catch {
    // fallback
  }

  return ACTIVE_MIRRORS;
}

export async function fetchRadioBrowser<T>(endpoint: string): Promise<T> {
  const mirrors = await refreshRadioServers();
  let lastError: Error | null = null;

  for (const mirror of mirrors) {
    const url = `https://${mirror}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(url, {
        headers: {
          'User-Agent': 'RadioCastLive/1.0 (+https://radiocastlive.vercel.app)',
          'Accept': 'application/json'
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        return (await res.json()) as T;
      }
    } catch (err) {
      lastError = err as Error;
    }
  }

  throw lastError || new Error('All Radio Browser servers failed');
}

function normalizeStation(s: any) {
  const rawResolved = (s.url_resolved || '').trim();
  const rawUrl = (s.url || '').trim();
  const primaryStreamUrl = rawResolved || rawUrl;
  const fallbackStreamUrl = (rawResolved && rawUrl && rawResolved !== rawUrl) ? rawUrl : null;
  const isHttps = primaryStreamUrl.toLowerCase().startsWith('https://');

  return {
    id: s.stationuuid || s.id,
    stationuuid: s.stationuuid || s.id,
    name: (s.name || '').trim(),
    streamUrl: primaryStreamUrl,
    fallbackUrl: fallbackStreamUrl,
    url: rawUrl,
    url_resolved: rawResolved,
    playUrl: primaryStreamUrl,
    homepage: s.homepage || '',
    favicon: s.favicon || '',
    tags: s.tags || '',
    country: s.country || '',
    countrycode: s.countrycode || 'TR',
    countryCode: s.countrycode || 'TR',
    state: s.state || '',
    language: s.language || '',
    votes: typeof s.votes === 'number' ? s.votes : 0,
    codec: (s.codec || 'MP3').toUpperCase(),
    bitrate: typeof s.bitrate === 'number' ? s.bitrate : 128,
    hls: s.hls === 1,
    clickcount: typeof s.clickcount === 'number' ? s.clickcount : 0,
    clickCount: typeof s.clickcount === 'number' ? s.clickcount : 0,
    lastcheckok: s.lastcheckok,
    lastCheckOk: s.lastcheckok === 1,
    isHttps
  };
}

function normalizeStationName(name: string): string {
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

export function processStationList(rawList: any[]) {
  if (!Array.isArray(rawList)) return [];

  const nameGroupMap = new Map<string, ReturnType<typeof normalizeStation>[]>();

  for (const item of rawList) {
    if (!item || !item.name) continue;

    const normalized = normalizeStation(item);
    if (!normalized.streamUrl) continue;

    const key = normalizeStationName(normalized.name);
    if (!nameGroupMap.has(key)) {
      nameGroupMap.set(key, []);
    }
    nameGroupMap.get(key)!.push(normalized);
  }

  const result: ReturnType<typeof normalizeStation>[] = [];

  for (const [, group] of nameGroupMap.entries()) {
    if (group.length === 0) continue;

    group.sort((a, b) => {
      const scoreA = (a.votes * 2) + a.clickcount + (a.isHttps ? 50 : 0);
      const scoreB = (b.votes * 2) + b.clickcount + (b.isHttps ? 50 : 0);
      return scoreB - scoreA;
    });

    result.push(group[0]);
  }

  return result;
}

export async function handleRadioStations(req: Request, res: Response) {
  const country = (req.query.country as string || req.query.countryCode as string || 'TR').toUpperCase();
  const page = Math.max(1, parseInt(req.query.page as string || '1', 10));
  const limit = Math.min(1000, Math.max(1, parseInt(req.query.limit as string || '600', 10)));
  const offset = Math.max(0, parseInt(req.query.offset as string || '0', 10));

  const cacheKey = `radio_stations_v2_${country}_p${page}_l${limit}_o${offset}`;
  const cached = getFromCache<any[]>(cacheKey);
  if (cached) {
    return res.setHeader('Content-Type', 'application/json').json(cached);
  }

  try {
    let rawData: any[] = [];
    try {
      rawData = await fetchRadioBrowser<any[]>(
        `/json/stations/bycountrycodeexact/${encodeURIComponent(country)}?hidebroken=true&order=votes&reverse=true&limit=${limit}&offset=${offset}`
      );
    } catch {
      rawData = [];
    }

    let processed = processStationList(rawData);

    // If TR country and first page, ensure VERIFIED_TURKISH_STATIONS are merged at top
    if (country === 'TR' && offset === 0) {
      const seenKeys = new Set(processed.map(s => normalizeStationName(s.name)));
      const verifiedToInsert: any[] = [];

      for (const v of VERIFIED_TURKISH_STATIONS) {
        const key = normalizeStationName(v.name);
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          verifiedToInsert.push(normalizeStation(v));
        }
      }

      processed = [...verifiedToInsert, ...processed];
    }

    if (processed.length === 0 && country === 'TR') {
      processed = VERIFIED_TURKISH_STATIONS.map(v => normalizeStation(v));
    }

    setToCache(cacheKey, processed, 15 * 60 * 1000);
    return res.setHeader('Content-Type', 'application/json').json(processed);
  } catch {
    // If radio browser fails completely, return local verified stations for TR or empty
    const fallback = country === 'TR' ? VERIFIED_TURKISH_STATIONS.map(v => normalizeStation(v)) : [];
    return res.setHeader('Content-Type', 'application/json').json(fallback);
  }
}

export async function handleRadioSearch(req: Request, res: Response) {
  const q = (req.query.q as string || req.query.name as string || '').trim();
  const country = (req.query.country as string || req.query.countryCode as string || '').toUpperCase();
  const tag = (req.query.tag as string || '').trim();
  const page = Math.max(1, parseInt(req.query.page as string || '1', 10));
  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit as string || '50', 10)));
  const offset = (page - 1) * limit;

  const cacheKey = `radio_search_${encodeURIComponent(q)}_${country}_${tag}_p${page}`;
  const cached = getFromCache<any[]>(cacheKey);
  if (cached) {
    return res.setHeader('Content-Type', 'application/json').json(cached);
  }

  try {
    const params = new URLSearchParams({
      hidebroken: 'true',
      order: 'clickcount',
      reverse: 'true',
      limit: limit.toString(),
      offset: offset.toString()
    });

    if (q) params.set('name', q);
    if (country) params.set('countrycode', country);
    if (tag) params.set('tag', tag);

    const data = await fetchRadioBrowser<any[]>(`/json/stations/search?${params.toString()}`);
    const processed = processStationList(data);

    setToCache(cacheKey, processed, 10 * 60 * 1000);
    return res.setHeader('Content-Type', 'application/json').json(processed);
  } catch {
    return res.setHeader('Content-Type', 'application/json').json([]);
  }
}

export async function handleRadioCountries(req: Request, res: Response) {
  const cached = getFromCache<any[]>('radio_countries');
  if (cached) {
    return res.setHeader('Content-Type', 'application/json').json(cached);
  }

  try {
    const data = await fetchRadioBrowser<any[]>('/json/countries?hidebroken=true&order=stationcount&reverse=true');
    if (Array.isArray(data)) {
      const countries = data.filter(c => c.name && c.stationcount > 0).map(c => ({
        name: c.name,
        code: c.iso_3166_1 || c.code || '',
        stationCount: c.stationcount
      }));
      setToCache('radio_countries', countries, 60 * 60 * 1000);
      return res.setHeader('Content-Type', 'application/json').json(countries);
    }
    return res.setHeader('Content-Type', 'application/json').json([]);
  } catch {
    return res.setHeader('Content-Type', 'application/json').json([]);
  }
}

export async function handleRadioTags(req: Request, res: Response) {
  const cached = getFromCache<any[]>('radio_tags');
  if (cached) {
    return res.setHeader('Content-Type', 'application/json').json(cached);
  }

  try {
    const data = await fetchRadioBrowser<any[]>('/json/tags?hidebroken=true&order=stationcount&reverse=true&limit=200');
    if (Array.isArray(data)) {
      const tags = data.filter(t => t.name && t.stationcount > 0).map(t => ({
        name: t.name,
        stationCount: t.stationcount
      }));
      setToCache('radio_tags', tags, 15 * 60 * 1000);
      return res.setHeader('Content-Type', 'application/json').json(tags);
    }
    return res.setHeader('Content-Type', 'application/json').json([]);
  } catch {
    return res.setHeader('Content-Type', 'application/json').json([]);
  }
}

export async function handleRadioClick(req: Request, res: Response) {
  const { stationId } = req.body || req.query || {};
  if (stationId) {
    fetchRadioBrowser<any>(`/json/url/${encodeURIComponent(stationId)}`).catch(() => {});
  }
  return res.setHeader('Content-Type', 'application/json').json({ ok: true });
}
