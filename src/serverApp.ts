import express from 'express';
import http from 'http';
import https from 'https';
import { URL } from 'url';
import { XMLParser } from 'fast-xml-parser';
import { VERIFIED_TURKISH_STATIONS } from './data/fallbackStations';
import { processTakedownRequest } from './services/takedownHandler';

export const app = express();

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

// Cache & Mirrors State
let ACTIVE_MIRRORS = [
  'de1.api.radio-browser.info',
  'nl1.api.radio-browser.info',
  'at1.api.radio-browser.info',
  'all.api.radio-browser.info'
];
let lastMirrorFetchTime = 0;

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

// Server-side Blacklist
interface BlacklistEntry {
  id: string;
  contentType: string;
  stationId?: string;
  podcastId?: string;
  episodeGuid?: string;
  streamUrls?: string[];
  feedUrl?: string;
  hostnames?: string[];
  active?: boolean;
}

const SERVER_BLACKLIST: BlacklistEntry[] = [
  {
    id: 'block-bad-stream-01',
    contentType: 'radio_station',
    stationId: '00000000-0000-0000-0000-000000000000',
    active: true
  }
];

function getBlacklistServer(): BlacklistEntry[] {
  return SERVER_BLACKLIST.filter(e => e.active !== false);
}

function isStationBlockedServer(stationId?: string, streamUrl?: string): boolean {
  const entries = getBlacklistServer();
  if (entries.length === 0) return false;

  for (const entry of entries) {
    if (entry.stationId && stationId && entry.stationId.toLowerCase() === stationId.toLowerCase()) {
      return true;
    }
    if (streamUrl && entry.streamUrls) {
      for (const su of entry.streamUrls) {
        if (streamUrl.toLowerCase().includes(su.toLowerCase())) return true;
      }
    }
    if (streamUrl && entry.hostnames) {
      for (const hn of entry.hostnames) {
        if (streamUrl.toLowerCase().includes(hn.toLowerCase())) return true;
      }
    }
  }
  return false;
}

async function refreshRadioServers(): Promise<string[]> {
  if (Date.now() - lastMirrorFetchTime < 30 * 60 * 1000 && ACTIVE_MIRRORS.length > 0) {
    return ACTIVE_MIRRORS;
  }

  try {
    const res = await fetch('https://de1.api.radio-browser.info/json/servers', {
      headers: { 'User-Agent': 'GlobalRadioWeb/1.0', 'Accept': 'application/json' }
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

function processStationList(rawList: any[]) {
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

    const bestStation = group[0];
    if (isStationBlockedServer(bestStation.id, bestStation.streamUrl)) {
      continue;
    }

    const allUrls: string[] = [];
    for (const gItem of group) {
      if (gItem.streamUrl) allUrls.push(gItem.streamUrl);
      if (gItem.fallbackUrl) allUrls.push(gItem.fallbackUrl);
      if (gItem.url_resolved) allUrls.push(gItem.url_resolved);
      if (gItem.url) allUrls.push(gItem.url);
    }
    const uniqueCandidates = allUrls.filter((u, i, self) => u && self.indexOf(u) === i);

    registerInCatalog({
      id: bestStation.id,
      name: bestStation.name,
      candidateUrls: uniqueCandidates
    }, 'radio-browser');

    result.push(bestStation);
  }

  return result;
}

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

// XML RSS Parser
const rssXmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  trimValues: true,
  parseAttributeValue: false
});

function extractXmlTextValue(val: any): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val.trim();
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    if (val['#text'] !== undefined) return extractXmlTextValue(val['#text']);
    if (val['#cdata'] !== undefined) return extractXmlTextValue(val['#cdata']);
  }
  return '';
}

export function parseRssXml(xmlText: string) {
  try {
    const jsonObj = rssXmlParser.parse(xmlText);
    const channel = jsonObj?.rss?.channel || jsonObj?.['rdf:RDF']?.channel || jsonObj?.channel || jsonObj?.feed || jsonObj;

    const channelTitle = extractXmlTextValue(channel?.title) || extractXmlTextValue(jsonObj?.rss?.channel?.title) || 'Podcast';
    const rawDesc = extractXmlTextValue(channel?.description) || extractXmlTextValue(channel?.['itunes:summary']) || extractXmlTextValue(channel?.subtitle) || '';
    const channelDesc = rawDesc.replace(/<[^>]+>/g, '').trim();

    let channelImage = '';
    if (channel?.['itunes:image'] && channel['itunes:image']['@_href']) {
      channelImage = channel['itunes:image']['@_href'];
    } else if (channel?.image && channel.image.url) {
      channelImage = extractXmlTextValue(channel.image.url);
    } else if (channel?.image && channel.image['@_href']) {
      channelImage = channel.image['@_href'];
    }

    let rawItems = channel?.item || channel?.entry || jsonObj?.feed?.entry || jsonObj?.['rdf:RDF']?.item || [];
    if (!Array.isArray(rawItems)) {
      rawItems = [rawItems];
    }

    const items: any[] = [];
    let idx = 0;

    for (const item of rawItems) {
      if (!item) continue;

      let audioUrl = '';

      // 1. Check enclosure tag
      if (item.enclosure) {
        if (Array.isArray(item.enclosure)) {
          for (const enc of item.enclosure) {
            const url = enc?.['@_url'] || enc?.url;
            const type = enc?.['@_type'] || enc?.type || '';
            if (url && (type.includes('audio') || url.match(/\.(mp3|m4a|aac|ogg|wav|flac)($|\?)/i))) {
              audioUrl = url;
              break;
            }
          }
          if (!audioUrl && item.enclosure[0]) {
            audioUrl = item.enclosure[0]['@_url'] || item.enclosure[0].url || '';
          }
        } else if (typeof item.enclosure === 'object') {
          audioUrl = item.enclosure['@_url'] || item.enclosure.url || '';
        }
      }

      // 2. FeedBurner origEnclosureLink
      if (!audioUrl && item['feedburner:origEnclosureLink']) {
        audioUrl = extractXmlTextValue(item['feedburner:origEnclosureLink']);
      }

      // 3. Check media:content tag
      if (!audioUrl && item['media:content']) {
        const mcList = Array.isArray(item['media:content']) ? item['media:content'] : [item['media:content']];
        for (const mc of mcList) {
          if (mc && (mc['@_url'] || mc.url)) {
            const url = mc['@_url'] || mc.url;
            const type = mc['@_type'] || mc.type || '';
            if (type.includes('audio') || url.match(/\.(mp3|m4a|aac|ogg|wav|flac)($|\?)/i) || !audioUrl) {
              audioUrl = url;
              if (type.includes('audio')) break;
            }
          }
        }
      }

      // 4. Atom link tags
      if (!audioUrl && item.link) {
        const links = Array.isArray(item.link) ? item.link : [item.link];
        for (const l of links) {
          if (typeof l === 'object') {
            const rel = l['@_rel'] || '';
            const href = l['@_href'] || l.href || '';
            const type = l['@_type'] || l.type || '';
            if (rel === 'enclosure' || type.includes('audio') || href.match(/\.(mp3|m4a|aac|ogg)($|\?)/i)) {
              audioUrl = href;
              break;
            }
          } else if (typeof l === 'string' && l.match(/\.(mp3|m4a|aac|ogg)($|\?)/i)) {
            audioUrl = l;
            break;
          }
        }
      }

      // 5. GUID check
      if (!audioUrl) {
        const guidVal = extractXmlTextValue(item.guid);
        if (guidVal && guidVal.match(/^https?:\/\/.*\.(mp3|m4a|aac|ogg)($|\?)/i)) {
          audioUrl = guidVal;
        }
      }

      if (!audioUrl) continue;

      const title = extractXmlTextValue(item.title) || `Bölüm ${idx + 1}`;
      const rawItemDesc = extractXmlTextValue(item.description) || extractXmlTextValue(item['itunes:summary']) || extractXmlTextValue(item['content:encoded']) || extractXmlTextValue(item.summary) || title;
      const description = rawItemDesc.replace(/<[^>]+>/g, '').trim();

      const pubDateStr = extractXmlTextValue(item.pubDate) || extractXmlTextValue(item.pubdate) || extractXmlTextValue(item['dc:date']) || extractXmlTextValue(item.published) || extractXmlTextValue(item.updated);

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

      const durVal = extractXmlTextValue(item['itunes:duration']);
      let durationSeconds = 1800;
      if (durVal) {
        if (durVal.includes(':')) {
          const parts = durVal.split(':').map(Number);
          if (parts.length === 3) durationSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
          else if (parts.length === 2) durationSeconds = parts[0] * 60 + parts[1];
        } else {
          const sec = parseInt(durVal, 10);
          if (!isNaN(sec) && sec > 0) durationSeconds = sec;
        }
      }

      let epCover = channelImage;
      if (item['itunes:image'] && item['itunes:image']['@_href']) {
        epCover = item['itunes:image']['@_href'];
      }

      const rawGuid = extractXmlTextValue(item.guid) || audioUrl;
      const episodeId = `ep-${idx}-${rawGuid.replace(/[^a-zA-Z0-9_-]/g, '').slice(-35)}`;

      items.push({
        id: episodeId,
        showTitle: channelTitle,
        title,
        description: description || title,
        audioUrl,
        durationSeconds,
        publishedDate: formattedDate,
        pubDateMillis,
        coverUrl: epCover
      });

      idx++;
    }

    items.sort((a, b) => (b.pubDateMillis || 0) - (a.pubDateMillis || 0));

    if (items.length === 0) {
      return fallbackParseRssXml(xmlText);
    }

    return {
      title: channelTitle,
      description: channelDesc,
      coverUrl: channelImage,
      episodes: items
    };
  } catch {
    return fallbackParseRssXml(xmlText);
  }
}

function fallbackParseRssXml(xmlText: string) {
  const cleanXml = xmlText.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
  const channelTitleMatch = cleanXml.match(/<channel>[\s\S]*?<title>(.*?)<\/title>/i) || cleanXml.match(/<title>(.*?)<\/title>/i);
  const channelDescMatch = cleanXml.match(/<channel>[\s\S]*?<description>(.*?)<\/description>/i);
  const channelImageMatch = cleanXml.match(/<itunes:image[^>]*href=["']([^"']+)["']/i) || cleanXml.match(/<image>[\s\S]*?<url>(.*?)<\/url>/i);

  const channelTitle = channelTitleMatch ? channelTitleMatch[1].replace(/<[^>]+>/g, '').trim() : 'Podcast';
  const channelDesc = channelDescMatch ? channelDescMatch[1].replace(/<[^>]+>/g, '').trim() : '';
  const channelImage = channelImageMatch ? channelImageMatch[1].trim() : '';

  const items: any[] = [];
  let pos = 0;
  let idx = 0;

  while (true) {
    const itemStart = cleanXml.indexOf('<item', pos);
    if (itemStart === -1) break;
    const itemEnd = cleanXml.indexOf('</item>', itemStart);
    if (itemEnd === -1) break;

    const itemContent = cleanXml.substring(itemStart, itemEnd + 7);
    pos = itemEnd + 7;

    let audioUrl = '';
    const encMatch = itemContent.match(/<enclosure[^>]*\burl=["']([^"']+)["']/i);
    if (encMatch && encMatch[1]) {
      audioUrl = encMatch[1].trim();
    } else {
      const mediaMatch = itemContent.match(/<media:content[^>]*\burl=["']([^"']+)["']/i);
      if (mediaMatch && mediaMatch[1]) {
        audioUrl = mediaMatch[1].trim();
      }
    }

    if (!audioUrl) continue;

    const titleMatch = itemContent.match(/<title>(.*?)<\/title>/i);
    const descMatch = itemContent.match(/<description>(.*?)<\/description>/i) || itemContent.match(/<itunes:summary>(.*?)<\/itunes:summary>/i);
    const pubDateMatch = itemContent.match(/<pubDate>(.*?)<\/pubDate>/i);
    const durationMatch = itemContent.match(/<itunes:duration>(.*?)<\/itunes:duration>/i);

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

    items.push({
      id: `ep-${idx}-${audioUrl.slice(-30)}`,
      showTitle: channelTitle,
      title,
      description,
      audioUrl,
      durationSeconds,
      publishedDate: formattedDate,
      pubDateMillis,
      coverUrl: channelImage
    });

    idx++;
  }

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

VERIFIED_TURKISH_STATIONS.forEach(s => registerInCatalog(s, 'curated'));

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

    upstreamRes.pipe(res);

    req.on('close', () => {
      upstreamRes.destroy();
    });
  });

  proxyReq.on('error', () => {
    if (!res.headersSent) res.status(502).end();
  });

  proxyReq.on('timeout', () => {
    proxyReq.destroy();
    if (!res.headersSent) res.status(504).end();
  });

  proxyReq.end();
}

// ------------------------------------------------------------------
// API ROUTES
// ------------------------------------------------------------------

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Radyo Dünyası & Podcast' });
});

app.get('/api/radio/servers', async (req, res) => {
  const cached = getFromCache<string[]>('radio_servers');
  if (cached) return res.json(cached);

  try {
    const mirrors = await refreshRadioServers();
    setToCache('radio_servers', mirrors, 30 * 60 * 1000);
    return res.json(mirrors);
  } catch {
    return res.json(ACTIVE_MIRRORS);
  }
});

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
      setToCache('radio_countries', countries, 6 * 60 * 60 * 1000);
      return res.json(countries);
    }
    res.json([]);
  } catch {
    res.status(502).json({ error: 'Failed to fetch country codes' });
  }
});

app.get('/api/radio/stations', async (req, res) => {
  const country = (req.query.country as string || 'TR').toUpperCase();
  const page = Math.max(1, parseInt(req.query.page as string || '1', 10));
  const limit = country === 'TR' ? 600 : 400;
  const offset = (page - 1) * limit;

  const cacheKey = `stations_${country}_p${page}_l${limit}`;
  const cached = getFromCache<any[]>(cacheKey);
  if (cached) return res.json(cached);

  try {
    let endpoint = `/json/stations/bycountrycodeexact/${encodeURIComponent(country)}?hidebroken=true&order=clickcount&reverse=true&limit=${limit}&offset=${offset}`;
    let data = await fetchRadioBrowser<any[]>(endpoint);

    if (!Array.isArray(data) || data.length === 0) {
      endpoint = `/json/stations/search?countrycode=${encodeURIComponent(country)}&hidebroken=true&order=clickcount&reverse=true&limit=${limit}&offset=${offset}`;
      data = await fetchRadioBrowser<any[]>(endpoint);
    }

    if (!Array.isArray(data) || data.length === 0) {
      endpoint = `/json/stations/search?countrycode=${encodeURIComponent(country)}&order=clickcount&reverse=true&limit=${limit}&offset=${offset}`;
      data = await fetchRadioBrowser<any[]>(endpoint);
    }

    const processed = processStationList(data);
    setToCache(cacheKey, processed, 15 * 60 * 1000);
    return res.json(processed);
  } catch {
    res.status(502).json({ error: 'Failed to fetch stations' });
  }
});

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

    setToCache(cacheKey, processed, 10 * 60 * 1000);
    return res.json(processed);
  } catch {
    res.status(502).json({ error: 'Radio search failed' });
  }
});

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
  } catch {
    res.status(502).json({ error: 'Failed to fetch tags' });
  }
});

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
  } catch {
    res.status(502).json({ error: 'Failed to fetch languages' });
  }
});

app.get('/api/radio/station', async (req, res) => {
  const id = req.query.id as string;
  if (!id) return res.status(400).json({ error: 'Station ID required' });

  try {
    const data = await fetchRadioBrowser<any[]>(`/json/stations/byuuid/${encodeURIComponent(id)}`);
    const processed = processStationList(data);
    if (processed.length > 0) return res.json(processed[0]);
    res.status(404).json({ error: 'Station not found' });
  } catch {
    res.status(502).json({ error: 'Station fetch failed' });
  }
});

app.post('/api/radio/click', async (req, res) => {
  const { stationId } = req.body || {};
  if (stationId) {
    fetchRadioBrowser<any>(`/json/url/${encodeURIComponent(stationId)}`).catch(() => {});
  }
  res.json({ ok: true });
});

app.get('/api/radio/stream/:stationId', async (req, res) => {
  const { stationId } = req.params;
  const candidateIndex = parseInt(req.query.candidate as string || '0', 10) || 0;

  if (!stationId) return res.status(400).json({ error: 'Station ID required' });

  if (isStationBlockedServer(stationId)) {
    return res.status(404).json({ error: 'Station unavailable' });
  }

  let entry = STATION_CATALOG.get(stationId);
  if (!entry) {
    const curated = VERIFIED_TURKISH_STATIONS.find(s => (s.id || s.stationuuid) === stationId);
    if (curated) {
      registerInCatalog(curated, 'curated');
      entry = STATION_CATALOG.get(stationId);
    }
  }

  if (!entry) {
    try {
      const data = await fetchRadioBrowser<any[]>(`/json/stations/byuuid/${encodeURIComponent(stationId)}`);
      if (Array.isArray(data) && data.length > 0) {
        const norm = normalizeStation(data[0]);
        registerInCatalog(norm, 'radio-browser');
        entry = STATION_CATALOG.get(stationId);
      }
    } catch {
      //
    }
  }

  if (!entry || !entry.candidateUrls || entry.candidateUrls.length === 0) {
    return res.status(404).json({ error: 'RELAY_STATION_NOT_FOUND', stationId });
  }

  const selectedTargetUrl = entry.candidateUrls[candidateIndex] || entry.candidateUrls[0];
  if (!selectedTargetUrl || !isSafePublicUrl(selectedTargetUrl) || isStationBlockedServer(stationId, selectedTargetUrl)) {
    return res.status(404).json({ error: 'Station stream URL unavailable' });
  }

  proxyAudioStream(selectedTargetUrl, req, res, 0);
});

app.get('/api/radio/proxy', (req, res) => {
  const targetUrl = req.query.url as string;
  if (!targetUrl || !isSafePublicUrl(targetUrl)) {
    return res.status(400).json({ error: 'Valid target stream URL required' });
  }
  proxyAudioStream(targetUrl, req, res, 0);
});

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

// Podcast Search
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
        } catch {
          // ignore
        }
      })
    );

    const podcasts = Array.from(resultsMap.values());
    podcasts.sort((a, b) => (b.releaseDateMillis || 0) - (a.releaseDateMillis || 0));
    setToCache(cacheKey, podcasts, 30 * 60 * 1000);
    return res.json(podcasts);
  } catch {
    res.status(502).json({ error: 'Podcast search failed' });
  }
});

// Podcast Feed Endpoint (supports both /api/podcasts/feed and /api/podcast-feed)
const handlePodcastFeed = async (req: express.Request, res: express.Response) => {
  const feedUrl = (req.query.url as string || req.query.feedUrl as string || '').trim();
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
      setToCache(cacheKey, parsed, 15 * 60 * 1000);
      return res.json(parsed);
    }
    res.status(502).json({ error: 'Failed to fetch RSS feed' });
  } catch {
    res.status(500).json({ error: 'RSS parsing failed' });
  }
};

app.get('/api/podcasts/feed', handlePodcastFeed);
app.get('/api/podcast-feed', handlePodcastFeed);

// Audiobooks Endpoints
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
  } catch {
    res.status(502).json({ error: 'Audiobooks fetch failed' });
  }
});

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
  } catch {
    res.status(502).json({ error: 'Audiobook search failed' });
  }
});

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
  } catch {
    res.status(502).json({ error: 'Audiobook tracks fetch failed' });
  }
});

app.get('/api/blacklist', (req, res) => {
  res.json(getBlacklistServer());
});

app.post('/api/takedown', async (req, res) => {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  try {
    const result = await processTakedownRequest(req.body || {}, clientIp);
    return res.status(result.httpCode).json({
      success: result.success,
      caseId: result.caseId,
      message: result.message,
      messageEn: result.messageEn,
      contactEmail: 'radiocastlive@proton.me',
    });
  } catch {
    return res.status(500).json({
      success: false,
      error: 'Talep gönderilemedi. Lütfen radiocastlive@proton.me adresine e-posta gönderin.',
      errorEn: 'The request could not be sent. Please email radiocastlive@proton.me.',
      contactEmail: 'radiocastlive@proton.me',
    });
  }
});
