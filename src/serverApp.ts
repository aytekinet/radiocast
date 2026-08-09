import express from 'express';
import http from 'http';
import https from 'https';
import { URL } from 'url';
import { XMLParser } from 'fast-xml-parser';
import { VERIFIED_TURKISH_STATIONS, ALL_TURKISH_STATIONS } from './data/fallbackStations';
import { processTakedownRequest } from './services/takedownHandler';
import { 
  handlePodcastFeed as unifiedPodcastFeed, 
  handlePodcastSearch as unifiedPodcastSearch,
  handlePodcastCatalog,
  handlePodcastTrending,
  handlePodcastRecent,
  handlePodcastRefresh
} from './server/podcastHandler';
import { handleRadioStations as unifiedRadioStations, handleRadioSearch as unifiedRadioSearch, handleRadioCountries as unifiedRadioCountries, handleRadioTags as unifiedRadioTags, handleRadioClick as unifiedRadioClick } from './server/radioHandler';

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

ALL_TURKISH_STATIONS.forEach(s => registerInCatalog(s, 'all-turkish'));
VERIFIED_TURKISH_STATIONS.forEach(s => registerInCatalog(s, 'curated'));

function rewriteM3u8Playlist(manifestText: string, baseUrl: string): string {
  const lines = manifestText.split(/\r?\n/);
  const rewrittenLines = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return line;

    // Attribute line with URI="..." e.g. #EXT-X-KEY:METHOD=AES-128,URI="key.bin" or #EXT-X-MEDIA:...
    if (trimmed.startsWith('#')) {
      return line.replace(/URI=["']([^"']+)["']/gi, (_match, uri) => {
        try {
          const abs = new URL(uri, baseUrl).href;
          return `URI="/api/radio/proxy?url=${encodeURIComponent(abs)}"`;
        } catch {
          return _match;
        }
      });
    }

    // URI line
    try {
      const absUrl = new URL(trimmed, baseUrl).href;
      return `/api/radio/proxy?url=${encodeURIComponent(absUrl)}`;
    } catch {
      return line;
    }
  });

  return rewrittenLines.join('\n');
}

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

  const requestHeaders: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': '*/*',
    'Icy-MetaData': '1',
    'Referer': `${parsed.protocol}//${parsed.hostname}/`,
    'Origin': `${parsed.protocol}//${parsed.hostname}`
  };

  const options: https.RequestOptions = {
    hostname: parsed.hostname,
    port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
    path: parsed.pathname + parsed.search,
    method: 'GET',
    headers: requestHeaders,
    rejectUnauthorized: false, // Allow radios with self-signed or expired SSL certs
    timeout: 10000
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

    const currentCT = (upstreamRes.headers['content-type'] || '').toLowerCase();
    const isM3u8 = targetUrl.includes('.m3u8') || targetUrl.includes('playlist') || currentCT.includes('mpegurl') || currentCT.includes('m3u8');

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    if (isM3u8) {
      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
      let bodyData = '';
      upstreamRes.setEncoding('utf8');
      upstreamRes.on('data', chunk => { bodyData += chunk; });
      upstreamRes.on('end', () => {
        if (bodyData.includes('#EXTM3U') || isM3u8) {
          const rewritten = rewriteM3u8Playlist(bodyData, targetUrl);
          res.status(upstreamRes.statusCode || 200).send(rewritten);
        } else {
          res.status(upstreamRes.statusCode || 200).send(bodyData);
        }
      });
      return;
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

    if (!currentCT || currentCT.includes('text/html') || currentCT.includes('text/plain') || currentCT.includes('octet-stream')) {
      if (targetUrl.includes('aac')) {
        res.setHeader('Content-Type', 'audio/aac');
      } else {
        res.setHeader('Content-Type', 'audio/mpeg');
      }
    }

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

app.get('/api/radio/stations', (req, res) => unifiedRadioStations(req, res));
app.get('/api/radio/search', (req, res) => unifiedRadioSearch(req, res));
app.get('/api/radio/countries', (req, res) => unifiedRadioCountries(req, res));
app.get('/api/radio/tags', (req, res) => unifiedRadioTags(req, res));
app.post('/api/radio/click', (req, res) => unifiedRadioClick(req, res));

app.get(['/api/radio/stream/:stationId', '/api/radio/stream', '/api/radio/proxy'], (req, res) => {
  const { stationId } = req.params;
  const urlParam = (req.query.url || req.query.streamUrl) as string;
  let targetUrl = urlParam;

  if (!targetUrl && stationId) {
    const entry = STATION_CATALOG.get(stationId);
    if (entry && entry.candidateUrls.length > 0) {
      targetUrl = entry.candidateUrls[0];
    }
  }

  if (!targetUrl) {
    return res.status(400).json({ error: 'Stream URL or valid stationId required' });
  }

  proxyAudioStream(targetUrl, req, res);
});

app.get(['/api/podcasts/search', '/podcasts/search'], (req, res) => unifiedPodcastSearch(req, res));
app.get(['/api/podcasts/catalog', '/podcasts/catalog'], (req, res) => handlePodcastCatalog(req, res));
app.get(['/api/podcasts/trending', '/podcasts/trending'], (req, res) => handlePodcastTrending(req, res));
app.get(['/api/podcasts/recent', '/podcasts/recent'], (req, res) => handlePodcastRecent(req, res));
app.get(['/api/podcasts/episodes/latest', '/podcasts/episodes/latest'], (req, res) => handlePodcastRecent(req, res));
app.get(['/api/podcasts/health', '/podcasts/health'], (req, res) => {
  res.json({ status: 'ok', service: 'podcast-catalog', timestamp: new Date().toISOString() });
});
app.get(['/api/internal/podcasts/refresh', '/internal/podcasts/refresh'], (req, res) => handlePodcastRefresh(req, res));
app.get(['/api/podcasts/feed', '/podcasts/feed', '/api/podcast-feed', '/podcast-feed', '/api/rss-proxy', '/rss-proxy'], (req, res) => unifiedPodcastFeed(req, res));

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
