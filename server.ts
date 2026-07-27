import express from 'express';
import path from 'path';
import http from 'http';
import https from 'https';
import { URL } from 'url';
import { createServer as createViteServer } from 'vite';
import { VERIFIED_TURKISH_STATIONS } from './src/data/fallbackStations';

// Default Radio Browser mirrors as fallback
let ACTIVE_MIRRORS = [
  'de1.api.radio-browser.info',
  'nl1.api.radio-browser.info',
  'at1.api.radio-browser.info',
  'all.api.radio-browser.info'
];

let lastMirrorFetchTime = 0;

// Simple TTL In-Memory Cache
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}
const cache = new Map<string, CacheEntry<unknown>>();

function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setToCache<T>(key: string, data: T, ttlMs: number): void {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs
  });
}

/**
 * Bootstraps Radio Browser active server list from /json/servers
 */
async function refreshRadioServers(): Promise<string[]> {
  if (Date.now() - lastMirrorFetchTime < 30 * 60 * 1000 && ACTIVE_MIRRORS.length > 0) {
    return ACTIVE_MIRRORS;
  }

  try {
    const res = await fetch('https://de1.api.radio-browser.info/json/servers', {
      headers: { 'User-Agent': 'GlobalRadioWeb/1.0' }
    });
    if (res.ok) {
      const data = await res.json() as { name: string }[];
      if (Array.isArray(data) && data.length > 0) {
        const servers = data
          .map(s => s.name)
          .filter((name, idx, self) => name && self.indexOf(name) === idx);
        if (servers.length > 0) {
          // Shuffle servers for random load balancing
          ACTIVE_MIRRORS = servers.sort(() => Math.random() - 0.5);
          lastMirrorFetchTime = Date.now();
        }
      }
    }
  } catch (err) {
    console.warn('Radio Browser mirror list fetch warning, using default mirrors:', err);
  }

  return ACTIVE_MIRRORS;
}

/**
 * Fetch helper with failover across mirrors
 */
async function fetchRadioBrowser<T>(endpoint: string): Promise<T> {
  const mirrors = await refreshRadioServers();
  let lastError: Error | null = null;

  for (const mirror of mirrors) {
    const url = `https://${mirror}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(url, {
        headers: {
          'User-Agent': 'GlobalRadioWeb/1.0',
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

/**
 * Normalizes raw Radio Browser station JSON to unified application model
 */
function normalizeStation(s: any) {
  const rawResolved = (s.url_resolved || '').trim();
  const rawUrl = (s.url || '').trim();
  const primaryStreamUrl = rawResolved || rawUrl;
  const fallbackStreamUrl = (rawResolved && rawUrl && rawResolved !== rawUrl) ? rawUrl : null;

  const isHttps = primaryStreamUrl.toLowerCase().startsWith('https://');

  return {
    id: s.stationuuid,
    stationuuid: s.stationuuid,
    name: (s.name || '').trim(),
    streamUrl: primaryStreamUrl,
    fallbackUrl: fallbackStreamUrl,
    url: rawUrl,
    url_resolved: rawResolved,
    homepage: s.homepage || '',
    favicon: s.favicon || '',
    tags: s.tags || '',
    country: s.country || '',
    countrycode: s.countrycode || '',
    countryCode: s.countrycode || '',
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
    sslError: typeof s.ssl_error === 'number' ? s.ssl_error : 0,
    isHttps
  };
}

/**
 * Normalizes station names for intelligent deduplication (e.g. Kafa Radyo, KAFA RADYO 102.5 -> kafa)
 */
function normalizeStationName(name: string): string {
  if (!name) return '';
  const cleaned = name
    .toLowerCase()
    .replace(/[\(\)\[\]\{\}\-_,.\/\\|]/g, ' ')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/\b(fm|am|radio|radyo|stream|live|canli|official|online|hd|hq|hq1|mp3|aac|tr|turkey|turkiye)\b/g, '')
    .replace(/\s+/g, '')
    .trim();

  return cleaned.length >= 2 ? cleaned : name.toLowerCase().replace(/\s+/g, '').trim();
}

/**
 * Filter, deduplicate, & candidate-merge raw stations array
 */
function processStationList(rawList: any[]): ReturnType<typeof normalizeStation>[] {
  if (!Array.isArray(rawList)) return [];

  const nameGroupMap = new Map<string, ReturnType<typeof normalizeStation>[]>();

  for (const item of rawList) {
    if (!item || !item.stationuuid || !item.name) continue;
    if (item.lastcheckok !== 1 && item.lastcheckok !== undefined) continue;

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

    // Pick best station in group (prefer higher votes/clickcount or HTTPS)
    group.sort((a, b) => {
      const scoreA = (a.votes * 2) + a.clickcount + (a.isHttps ? 50 : 0);
      const scoreB = (b.votes * 2) + b.clickcount + (b.isHttps ? 50 : 0);
      return scoreB - scoreA;
    });

    const bestStation = group[0];

    // Harvest all unique candidate URLs from all duplicate entries in group
    const allUrls: string[] = [];
    for (const gItem of group) {
      if (gItem.streamUrl) allUrls.push(gItem.streamUrl);
      if (gItem.fallbackUrl) allUrls.push(gItem.fallbackUrl);
      if (gItem.url_resolved) allUrls.push(gItem.url_resolved);
      if (gItem.url) allUrls.push(gItem.url);
    }
    const uniqueCandidates = allUrls.filter((u, i, self) => u && self.indexOf(u) === i);

    // Register in catalog with aggregated candidate URLs
    registerInCatalog({
      id: bestStation.id,
      name: bestStation.name,
      candidateUrls: uniqueCandidates
    }, 'radio-browser');

    result.push(bestStation);
  }

  return result;
}

/**
 * SSRF URL Validation for server-side RSS feeds
 */
function isSafePublicUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;

    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal')
    ) {
      return false;
    }

    // Check for private IPv4 ranges
    const ipv4Match = hostname.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
    if (ipv4Match) {
      const [, a, b] = ipv4Match.map(Number);
      if (a === 10) return false;
      if (a === 172 && b >= 16 && b <= 31) return false;
      if (a === 192 && b === 168) return false;
      if (a === 127) return false;
      if (a === 0) return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Helper to parse RSS XML into channel metadata & episode items
 */
function parseRssXml(xmlText: string) {
  // Strip CDATA wrapper tags
  const cleanXml = xmlText.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');

  // Channel title & description
  const channelTitleMatch = cleanXml.match(/<channel>[\s\S]*?<title>(.*?)<\/title>/i);
  const channelDescMatch = cleanXml.match(/<channel>[\s\S]*?<description>(.*?)<\/description>/i);
  const channelImageMatch = cleanXml.match(/<itunes:image[^>]*href=["']([^"']+)["']/i) || cleanXml.match(/<image>[\s\S]*?<url>(.*?)<\/url>/i);

  const channelTitle = channelTitleMatch ? channelTitleMatch[1].trim() : 'Podcast';
  const channelDesc = channelDescMatch ? channelDescMatch[1].replace(/<[^>]+>/g, '').trim() : '';
  const channelImage = channelImageMatch ? channelImageMatch[1].trim() : '';

  // Episode items
  const items: any[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;
  let idx = 0;

  while ((match = itemRegex.exec(cleanXml)) !== null) {
    const itemContent = match[1];

    // Enclosure URL is mandatory for playable episode
    const enclosureMatch = itemContent.match(/<enclosure[^>]*url=["']([^"']+)["'][^>]*>/i);
    if (!enclosureMatch || !enclosureMatch[1]) continue;

    const audioUrl = enclosureMatch[1].trim();

    const titleMatch = itemContent.match(/<title>(.*?)<\/title>/i);
    const descMatch = itemContent.match(/<description>(.*?)<\/description>/i) || itemContent.match(/<itunes:summary>(.*?)<\/itunes:summary>/i);
    const pubDateMatch = itemContent.match(/<pubDate>(.*?)<\/pubDate>/i);
    const durationMatch = itemContent.match(/<itunes:duration>(.*?)<\/itunes:duration>/i);
    const guidMatch = itemContent.match(/<guid[^>]*>(.*?)<\/guid>/i);
    const imageMatch = itemContent.match(/<itunes:image[^>]*href=["']([^"']+)["']/i);

    const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : `Bölüm ${idx + 1}`;
    const description = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim() : title;
    const pubDateStr = pubDateMatch ? pubDateMatch[1].trim() : '';

    let pubDateMillis = 0;
    let formattedDate = 'Güncel';
    if (pubDateStr) {
      try {
        const d = new Date(pubDateStr);
        if (!isNaN(d.getTime())) {
          pubDateMillis = d.getTime();
          formattedDate = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
        }
      } catch {
        formattedDate = pubDateStr;
      }
    }

    // Parse duration string (e.g. "01:15:30" or "4520")
    let durationSeconds = 1800;
    if (durationMatch && durationMatch[1]) {
      const durStr = durationMatch[1].trim();
      if (durStr.includes(':')) {
        const parts = durStr.split(':').map(Number);
        if (parts.length === 3) durationSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
        else if (parts.length === 2) durationSeconds = parts[0] * 60 + parts[1];
      } else {
        const sec = parseInt(durStr, 10);
        if (!isNaN(sec)) durationSeconds = sec;
      }
    }

    const episodeId = guidMatch ? guidMatch[1].replace(/<[^>]+>/g, '').trim() : `ep-${idx}-${audioUrl}`;
    const coverUrl = imageMatch ? imageMatch[1].trim() : channelImage;

    items.push({
      id: episodeId,
      showTitle: channelTitle,
      title,
      description,
      audioUrl,
      durationSeconds,
      publishedDate: formattedDate,
      pubDateMillis,
      coverUrl
    });

    idx++;
  }

  // Sort episodes by publication date descending (newest first)
  items.sort((a, b) => (b.pubDateMillis || 0) - (a.pubDateMillis || 0));

  return {
    title: channelTitle,
    description: channelDesc,
    coverUrl: channelImage,
    episodes: items
  };
}

interface CatalogEntry {
  id: string;
  name: string;
  candidateUrls: string[];
  source: string;
  updatedAt: number;
}

const STATION_CATALOG = new Map<string, CatalogEntry>();

function registerInCatalog(station: any, source = 'radio-browser') {
  if (!station) return;
  const id = station.id || station.stationuuid;
  if (!id) return;

  const rawCandidates = [
    station.playUrl,
    station.url_resolved || station.urlResolved,
    station.url,
    station.streamUrl,
    station.fallbackUrl
  ];

  const candidateUrls = rawCandidates
    .filter((u): u is string => typeof u === 'string' && u.trim().length > 0)
    .map(u => u.trim())
    .filter((u, i, self) => self.indexOf(u) === i);

  if (candidateUrls.length === 0) return;

  STATION_CATALOG.set(id, {
    id,
    name: station.name || 'Radyo',
    candidateUrls,
    source,
    updatedAt: Date.now()
  });
}

// Pre-register curated stations
VERIFIED_TURKISH_STATIONS.forEach(s => registerInCatalog(s, 'curated'));

/**
 * Proxy audio stream with SSRF verification & max 3 redirects
 */
function proxyAudioStream(targetUrl: string, req: express.Request, res: express.Response, redirectCount = 0) {
  if (redirectCount > 3) {
    return res.status(502).json({ error: 'Too many redirects' });
  }

  if (!isSafePublicUrl(targetUrl)) {
    return res.status(400).json({ error: 'Forbidden stream target' });
  }

  let parsed: URL;
  try {
    parsed = new URL(targetUrl);
  } catch {
    return res.status(400).json({ error: 'Invalid stream URL' });
  }

  const client = parsed.protocol === 'https:' ? https : http;

  const options = {
    hostname: parsed.hostname,
    port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
    path: parsed.pathname + parsed.search,
    method: 'GET',
    headers: {
      'User-Agent': 'TuneKureWeb/1.0',
      'Accept': 'audio/*,*/*'
    },
    timeout: 12000
  };

  const proxyReq = client.request(options, (upstreamRes) => {
    if (upstreamRes.statusCode && upstreamRes.statusCode >= 300 && upstreamRes.statusCode < 400 && upstreamRes.headers.location) {
      let redirectLocation = upstreamRes.headers.location;
      if (redirectLocation.startsWith('/')) {
        redirectLocation = `${parsed.protocol}//${parsed.host}${redirectLocation}`;
      }
      return proxyAudioStream(redirectLocation, req, res, redirectCount + 1);
    }

    if (!upstreamRes.statusCode || upstreamRes.statusCode >= 400) {
      console.warn(`[relay:upstream_err] status=${upstreamRes.statusCode} url=${targetUrl}`);
      return res.status(upstreamRes.statusCode || 502).end();
    }

    res.status(upstreamRes.statusCode);

    const hopByHopHeaders = new Set([
      'connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization',
      'te', 'trailers', 'transfer-encoding', 'upgrade', 'set-cookie', 'content-length'
    ]);

    for (const [key, value] of Object.entries(upstreamRes.headers)) {
      if (!hopByHopHeaders.has(key.toLowerCase()) && value !== undefined) {
        res.setHeader(key, value);
      }
    }

    // Default Content-Type fallback if upstream sends generic or missing
    const currentCT = (upstreamRes.headers['content-type'] || '').toLowerCase();
    if (!currentCT || currentCT.includes('text/html') || currentCT.includes('text/plain') || currentCT.includes('octet-stream')) {
      if (targetUrl.includes('.m3u8') || targetUrl.includes('playlist')) {
        res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
      } else if (targetUrl.includes('aac')) {
        res.setHeader('Content-Type', 'audio/aac');
      } else {
        res.setHeader('Content-Type', 'audio/mpeg');
      }
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    let bytesForwarded = 0;
    upstreamRes.on('data', (chunk) => {
      bytesForwarded += chunk.length;
    });

    upstreamRes.pipe(res);

    req.on('close', () => {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[relay:closed] targetUrl=${targetUrl} totalBytes=${bytesForwarded}`);
      }
      upstreamRes.destroy();
    });
  });

  proxyReq.on('error', (err) => {
    console.error(`[relay:req_err] targetUrl=${targetUrl} err=${err.message}`);
    if (!res.headersSent) {
      res.status(502).end();
    }
  });

  proxyReq.on('timeout', () => {
    console.warn(`[relay:timeout] targetUrl=${targetUrl}`);
    proxyReq.destroy();
    if (!res.headersSent) {
      res.status(504).end();
    }
  });

  proxyReq.end();
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // CORS Middleware
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'Radyo Dünyası & Podcast' });
  });

  // 1. Radio Servers Mirror List
  app.get('/api/radio/servers', async (req, res) => {
    const cached = getFromCache<string[]>('radio_servers');
    if (cached) return res.json(cached);

    try {
      const mirrors = await refreshRadioServers();
      setToCache('radio_servers', mirrors, 30 * 60 * 1000); // 30m cache
      return res.json(mirrors);
    } catch (err) {
      return res.json(ACTIVE_MIRRORS);
    }
  });

  // 2. Radio Countries
  app.get('/api/radio/countries', async (req, res) => {
    const cached = getFromCache<any[]>('radio_countries');
    if (cached) return res.json(cached);

    try {
      const data = await fetchRadioBrowser<any[]>('/json/countries?hidebroken=true&order=stationcount&reverse=true&limit=300');
      if (Array.isArray(data)) {
        const countries = data
          .filter(c => (c.name || c.iso_3166_1) && typeof c.stationcount === 'number' && c.stationcount > 0)
          .map(c => ({
            code: (c.iso_3166_1 || '').toUpperCase(),
            iso_3166_1: (c.iso_3166_1 || '').toUpperCase(),
            name: c.name || c.iso_3166_1,
            stationCount: c.stationcount,
            stationcount: c.stationcount
          }));
        setToCache('radio_countries', countries, 6 * 60 * 60 * 1000); // 6 hours
        return res.json(countries);
      }
      res.json([]);
    } catch (err) {
      res.status(502).json({ error: 'Failed to fetch country codes' });
    }
  });

  // 3. Radio Stations (by Country / Paginated)
  app.get('/api/radio/stations', async (req, res) => {
    const country = (req.query.country as string || 'TR').toUpperCase();
    const page = Math.max(1, parseInt(req.query.page as string || '1', 10));
    const limit = country === 'TR' ? 600 : 400;
    const offset = (page - 1) * limit;

    const cacheKey = `stations_${country}_p${page}_l${limit}`;
    const cached = getFromCache<any[]>(cacheKey);
    if (cached) return res.json(cached);

    try {
      const endpoint = `/json/stations/search?countrycode=${encodeURIComponent(country)}&hidebroken=true&order=clickcount&reverse=true&limit=${limit}&offset=${offset}`;
      const data = await fetchRadioBrowser<any[]>(endpoint);
      const processed = processStationList(data);

      setToCache(cacheKey, processed, 15 * 60 * 1000); // 15m cache
      return res.json(processed);
    } catch (err) {
      console.error('Fetch stations error:', err);
      res.status(502).json({ error: 'Failed to fetch stations' });
    }
  });

  // 4. Radio Search (by query, country, tag, language)
  app.get('/api/radio/search', async (req, res) => {
    const q = (req.query.q as string || '').trim();
    const country = (req.query.country as string || '').toUpperCase();
    const tag = (req.query.tag as string || '').trim();
    const language = (req.query.language as string || '').trim();
    const page = Math.max(1, parseInt(req.query.page as string || '1', 10));
    const limit = 400;
    const offset = (page - 1) * limit;

    const cacheKey = `search_${q}_c${country}_t${tag}_l${language}_p${page}`;
    const cached = getFromCache<any[]>(cacheKey);
    if (cached) return res.json(cached);

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
      if (language) params.set('language', language);

      const data = await fetchRadioBrowser<any[]>(`/json/stations/search?${params.toString()}`);
      const processed = processStationList(data);

      setToCache(cacheKey, processed, 10 * 60 * 1000); // 10m cache
      return res.json(processed);
    } catch (err) {
      res.status(502).json({ error: 'Radio search failed' });
    }
  });

  // 5. Radio Tags
  app.get('/api/radio/tags', async (req, res) => {
    const cached = getFromCache<any[]>('radio_tags');
    if (cached) return res.json(cached);

    try {
      const data = await fetchRadioBrowser<any[]>('/json/tags?hidebroken=true&order=stationcount&reverse=true&limit=200');
      if (Array.isArray(data)) {
        const tags = data.filter(t => t.name && t.stationcount > 0).map(t => ({
          name: t.name,
          stationCount: t.stationcount
        }));
        setToCache('radio_tags', tags, 15 * 60 * 1000);
        return res.json(tags);
      }
      res.json([]);
    } catch (err) {
      res.status(502).json({ error: 'Failed to fetch tags' });
    }
  });

  // 6. Radio Languages
  app.get('/api/radio/languages', async (req, res) => {
    const cached = getFromCache<any[]>('radio_languages');
    if (cached) return res.json(cached);

    try {
      const data = await fetchRadioBrowser<any[]>('/json/languages?hidebroken=true&order=stationcount&reverse=true&limit=200');
      if (Array.isArray(data)) {
        const langs = data.filter(l => l.name && l.stationcount > 0).map(l => ({
          name: l.name,
          iso: l.iso_639 || '',
          stationCount: l.stationcount
        }));
        setToCache('radio_languages', langs, 15 * 60 * 1000);
        return res.json(langs);
      }
      res.json([]);
    } catch (err) {
      res.status(502).json({ error: 'Failed to fetch languages' });
    }
  });

  // 7. Single Radio Station by UUID
  app.get('/api/radio/station', async (req, res) => {
    const id = req.query.id as string;
    if (!id) return res.status(400).json({ error: 'Station ID required' });

    try {
      const data = await fetchRadioBrowser<any[]>(`/json/stations/byuuid/${encodeURIComponent(id)}`);
      const processed = processStationList(data);
      if (processed.length > 0) return res.json(processed[0]);
      res.status(404).json({ error: 'Station not found' });
    } catch (err) {
      res.status(502).json({ error: 'Station fetch failed' });
    }
  });

  // 8. Radio Click Counter Metric (Background / Non-blocking)
  app.post('/api/radio/click', async (req, res) => {
    const { stationId } = req.body || {};
    if (stationId) {
      // Asynchronously trigger click metric without blocking response
      fetchRadioBrowser<any>(`/json/url/${encodeURIComponent(stationId)}`).catch(() => {});
    }
    res.json({ ok: true });
  });

  // 8b. Radio Stream Relay (SSRF-Protected)
  app.get('/api/radio/stream/:stationId', async (req, res) => {
    const { stationId } = req.params;
    const candidateIndex = parseInt(req.query.candidate as string || '0', 10) || 0;

    if (!stationId) return res.status(400).json({ error: 'Station ID required' });

    let entry = STATION_CATALOG.get(stationId);

    // If not found in catalog, check curated list
    if (!entry) {
      const curated = VERIFIED_TURKISH_STATIONS.find(s => (s.id || s.stationuuid) === stationId);
      if (curated) {
        registerInCatalog(curated, 'curated');
        entry = STATION_CATALOG.get(stationId);
      }
    }

    // If still not found, fetch from Radio Browser API
    if (!entry) {
      try {
        const data = await fetchRadioBrowser<any[]>(`/json/stations/byuuid/${encodeURIComponent(stationId)}`);
        if (Array.isArray(data) && data.length > 0) {
          const norm = normalizeStation(data[0]);
          registerInCatalog(norm, 'radio-browser');
          entry = STATION_CATALOG.get(stationId);
        }
      } catch (err: any) {
        console.warn(`[relay:fetch_err] stationId=${stationId} err=${err.message}`);
      }
    }

    if (!entry || !entry.candidateUrls || entry.candidateUrls.length === 0) {
      return res.status(404).json({ error: 'RELAY_STATION_NOT_FOUND', stationId });
    }

    const selectedTargetUrl = entry.candidateUrls[candidateIndex] || entry.candidateUrls[0];

    if (!selectedTargetUrl || !isSafePublicUrl(selectedTargetUrl)) {
      return res.status(400).json({ error: 'Station stream URL unavailable or forbidden' });
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[relay:start] stationId=${stationId} candidateIndex=${candidateIndex} url=${selectedTargetUrl}`);
    }

    proxyAudioStream(selectedTargetUrl, req, res, 0);
  });

  // Direct Audio Stream Proxy by target URL
  app.get('/api/radio/proxy', (req, res) => {
    const targetUrl = req.query.url as string;
    if (!targetUrl || !isSafePublicUrl(targetUrl)) {
      return res.status(400).json({ error: 'Valid target stream URL required' });
    }
    proxyAudioStream(targetUrl, req, res, 0);
  });

  // 8c. Radio ICY Metadata Handler
  app.get('/api/radio/icy-metadata', async (req, res) => {
    const rawUrl = req.query.url as string;
    if (!rawUrl || !isSafePublicUrl(rawUrl)) {
      return res.status(400).json({ error: 'Valid URL required' });
    }

    try {
      const parsed = new URL(rawUrl);
      const client = parsed.protocol === 'https:' ? https : http;
      
      const options = {
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
        path: parsed.pathname + parsed.search,
        method: 'GET',
        headers: {
          'Icy-MetaData': '1',
          'User-Agent': 'TuneKureWeb/1.0'
        },
        timeout: 4000
      };

      const reqStream = client.request(options, (icyRes) => {
        const icyName = icyRes.headers['icy-name'];
        const icyGenre = icyRes.headers['icy-genre'];
        icyRes.destroy();
        return res.json({ title: icyName || null, genre: icyGenre || null });
      });

      reqStream.on('error', () => res.json({ title: null }));
      reqStream.on('timeout', () => { reqStream.destroy(); res.json({ title: null }); });
      reqStream.end();
    } catch {
      res.json({ title: null });
    }
  });

  // 9. Podcast Search (iTunes API Proxy & Normalizer with Multi-Term Aggregation)
  app.get('/api/podcasts/search', async (req, res) => {
    const q = (req.query.q as string || '').trim();
    const country = (req.query.country as string || 'TR').toUpperCase();
    const page = Math.max(1, parseInt(req.query.page as string || '1', 10));

    const cacheKey = `podcasts_${q}_c${country}_p${page}`;
    const cached = getFromCache<any[]>(cacheKey);
    if (cached) return res.json(cached);

    try {
      let searchTerms: string[] = [];
      if (!q || q.toLowerCase() === 'podcast' || q.toLowerCase() === 'popular' || q.toLowerCase() === 'tüm podcastler') {
        searchTerms = [
          'türkçe', 'podcast', 'haber', 'gündem', 'felsefe', 'psikoloji', 
          'teknoloji', 'bilim', 'tarih', 'sohbet', 'müzik', 'spor', 
          'mizah', 'ekonomi', 'sanat', 'eğitim', 'kişisel gelişim', 'hikaye'
        ];
      } else {
        searchTerms = [q];
      }

      const resultsMap = new Map<string, any>();

      await Promise.all(
        searchTerms.map(async (term) => {
          try {
            const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&country=${encodeURIComponent(country)}&media=podcast&entity=podcast&limit=100`;
            const response = await fetch(url, {
              headers: { 'User-Agent': 'GlobalRadioWeb/1.0' }
            });

            if (response.ok) {
              const data = await response.json() as { results?: any[] };
              if (data.results && Array.isArray(data.results)) {
                for (const item of data.results) {
                  if (item.feedUrl && item.collectionName && item.collectionId) {
                    const key = `itunes-${item.collectionId}`;
                    if (!resultsMap.has(key)) {
                      const releaseDateStr = item.releaseDate || item.trackRentalDate || '';
                      let releaseDateMillis = 0;
                      if (releaseDateStr) {
                        const d = new Date(releaseDateStr);
                        if (!isNaN(d.getTime())) releaseDateMillis = d.getTime();
                      }

                      resultsMap.set(key, {
                        id: key,
                        title: item.collectionName || item.trackName || 'Podcast',
                        publisher: item.artistName || 'Yayıncı',
                        coverUrl: item.artworkUrl600 || item.artworkUrl100 || item.artworkUrl60 || '',
                        feedUrl: item.feedUrl,
                        storeUrl: item.collectionViewUrl || '',
                        episodeCount: item.trackCount || 0,
                        genre: item.primaryGenreName || 'Podcast',
                        country: item.country || country,
                        category: item.primaryGenreName || 'Podcast',
                        description: `${item.artistName || 'Yayıncı'} tarafından sunulan podcast kanalı.`,
                        releaseDate: releaseDateStr,
                        releaseDateMillis: releaseDateMillis
                      });
                    }
                  }
                }
              }
            }
          } catch (err) {
            // ignore term search error
          }
        })
      );

      const podcasts = Array.from(resultsMap.values());
      // Sort podcasts by releaseDateMillis descending (newest / most recently updated first)
      podcasts.sort((a, b) => (b.releaseDateMillis || 0) - (a.releaseDateMillis || 0));
      setToCache(cacheKey, podcasts, 30 * 60 * 1000); // 30m cache
      return res.json(podcasts);
    } catch (err) {
      res.status(502).json({ error: 'Podcast search failed' });
    }
  });

  // 10. Podcast RSS Feed Fetch & Parse Route
  app.get('/api/podcasts/feed', async (req, res) => {
    const feedUrl = req.query.url as string;
    if (!feedUrl) return res.status(400).json({ error: 'RSS feed URL parameter required' });

    if (!isSafePublicUrl(feedUrl)) {
      return res.status(400).json({ error: 'Invalid or forbidden RSS URL' });
    }

    const cacheKey = `rss_${feedUrl}`;
    const cached = getFromCache<any>(cacheKey);
    if (cached) return res.json(cached);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(feedUrl, {
        headers: {
          'User-Agent': 'GlobalRadioWeb/1.0 (Mozilla/5.0)',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*'
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const xmlText = await response.text();
        const parsed = parseRssXml(xmlText);
        setToCache(cacheKey, parsed, 15 * 60 * 1000); // 15m cache
        return res.json(parsed);
      }
      res.status(502).json({ error: 'Failed to fetch RSS feed' });
    } catch (err) {
      res.status(500).json({ error: 'RSS parsing failed' });
    }
  });

  // 11. Audiobooks (LibriVox Public Domain API Proxy)
  app.get('/api/audiobooks', async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page as string || '1', 10));
    const limit = 30;
    const offset = (page - 1) * limit;

    const cacheKey = `audiobooks_p${page}`;
    const cached = getFromCache<any[]>(cacheKey);
    if (cached) return res.json(cached);

    try {
      const url = `https://librivox.org/api/feed/audiobooks/?format=json&extended=1&coverart=1&limit=${limit}&offset=${offset}`;
      const response = await fetch(url, { headers: { 'User-Agent': 'GlobalRadioWeb/1.0' } });

      if (response.ok) {
        const data = await response.json() as { books?: any[] };
        if (data.books && Array.isArray(data.books)) {
          const books = data.books.map(b => ({
            id: `librivox-${b.id}`,
            title: b.title,
            description: (b.description || '').replace(/<[^>]+>/g, ''),
            language: b.language || 'Türkçe',
            authors: Array.isArray(b.authors) ? b.authors.map((a: any) => `${a.first_name || ''} ${a.last_name || ''}`.trim()).join(', ') : 'Bilinmeyen Yazar',
            cover: b.coverart_jpg || b.coverart_thumbnail || '',
            totalTime: b.totaltime || '00:00:00',
            totalTimeSeconds: parseInt(b.totaltimesecs || '0', 10),
            rssUrl: b.url_rss,
            librivoxUrl: b.url_librivox,
            archiveUrl: b.url_iarchive
          }));

          setToCache(cacheKey, books, 30 * 60 * 1000);
          return res.json(books);
        }
      }
      res.json([]);
    } catch (err) {
      res.status(502).json({ error: 'Audiobooks fetch failed' });
    }
  });

  // 12. Audiobooks Search
  app.get('/api/audiobooks/search', async (req, res) => {
    const q = (req.query.q as string || '').trim();
    const page = Math.max(1, parseInt(req.query.page as string || '1', 10));
    const limit = 30;
    const offset = (page - 1) * limit;

    if (!q) return res.redirect('/api/audiobooks?page=' + page);

    const cacheKey = `audiobooks_q${q}_p${page}`;
    const cached = getFromCache<any[]>(cacheKey);
    if (cached) return res.json(cached);

    try {
      const url = `https://librivox.org/api/feed/audiobooks/?title=${encodeURIComponent(q)}&format=json&extended=1&coverart=1&limit=${limit}&offset=${offset}`;
      const response = await fetch(url, { headers: { 'User-Agent': 'GlobalRadioWeb/1.0' } });

      if (response.ok) {
        const data = await response.json() as { books?: any[] };
        if (data.books && Array.isArray(data.books)) {
          const books = data.books.map(b => ({
            id: `librivox-${b.id}`,
            title: b.title,
            description: (b.description || '').replace(/<[^>]+>/g, ''),
            language: b.language || 'Türkçe',
            authors: Array.isArray(b.authors) ? b.authors.map((a: any) => `${a.first_name || ''} ${a.last_name || ''}`.trim()).join(', ') : 'Bilinmeyen Yazar',
            cover: b.coverart_jpg || b.coverart_thumbnail || '',
            totalTime: b.totaltime || '00:00:00',
            totalTimeSeconds: parseInt(b.totaltimesecs || '0', 10),
            rssUrl: b.url_rss,
            librivoxUrl: b.url_librivox,
            archiveUrl: b.url_iarchive
          }));

          setToCache(cacheKey, books, 30 * 60 * 1000);
          return res.json(books);
        }
      }
      res.json([]);
    } catch (err) {
      res.status(502).json({ error: 'Audiobook search failed' });
    }
  });

  // 13. Audiobook Tracks (Chapters)
  app.get('/api/audiobooks/tracks', async (req, res) => {
    const idStr = req.query.id as string;
    if (!idStr) return res.status(400).json({ error: 'Book ID required' });

    const cleanId = idStr.replace('librivox-', '');
    const cacheKey = `audiobook_tracks_${cleanId}`;
    const cached = getFromCache<any[]>(cacheKey);
    if (cached) return res.json(cached);

    try {
      const url = `https://librivox.org/api/feed/audiotracks/?project_id=${encodeURIComponent(cleanId)}&format=json`;
      const response = await fetch(url, { headers: { 'User-Agent': 'GlobalRadioWeb/1.0' } });

      if (response.ok) {
        const data = await response.json() as { main?: any; section?: any };
        const rawTracks = data.section || data.main || [];
        const trackList = Array.isArray(rawTracks) ? rawTracks : Object.values(rawTracks);

        const tracks = trackList
          .filter((t: any) => t.listen_url && t.title)
          .map((t: any, idx: number) => ({
            id: `track-${cleanId}-${t.id || idx}`,
            sectionNumber: parseInt(t.section_number || `${idx + 1}`, 10),
            title: t.title,
            listenUrl: t.listen_url,
            durationSeconds: parseInt(t.playtime || '0', 10)
          }));

        setToCache(cacheKey, tracks, 30 * 60 * 1000);
        return res.json(tracks);
      }
      res.json([]);
    } catch (err) {
      res.status(502).json({ error: 'Audiobook tracks fetch failed' });
    }
  });

  // Vite middleware in development or static serve in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Global Radio Web running on http://localhost:${PORT}`);
  });
}

startServer();
