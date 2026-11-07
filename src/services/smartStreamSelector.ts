import { RadioStation } from '../types';
import { VERIFIED_TURKISH_STATIONS, ALL_TURKISH_STATIONS } from '../data/fallbackStations';

export interface StreamCandidate {
  url: string;
  source: 'cache' | 'resolved' | 'direct' | 'upgraded_https' | 'proxy' | 'cors_proxy' | 'fallback' | 'ondemand';
  codec?: string;
  isHls: boolean;
  priority: number;
}

export interface BrowserAudioCapabilities {
  canPlayMp3: boolean;
  canPlayAac: boolean;
  canPlayHlsNative: boolean;
  canPlayHlsMse: boolean;
  isHttpsOrigin: boolean;
  isSafari: boolean;
  isIos: boolean;
}

interface WorkingStreamRecord {
  url: string;
  stationId: string;
  isHls: boolean;
  codec?: string;
  verifiedAt: number;
  expiresAt: number;
}

const CACHE_KEY_PREFIX = 'radiocast_working_stream_v1_';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours TTL
const inMemoryCache = new Map<string, WorkingStreamRecord>();

/**
 * Detect browser audio format and codec capabilities
 */
export function detectBrowserCapabilities(audioElement?: HTMLAudioElement): BrowserAudioCapabilities {
  const isBrowser = typeof window !== 'undefined';
  const ua = isBrowser ? navigator.userAgent : '';
  const isIos = isBrowser && /iPad|iPhone|iPod/.test(ua);
  const isSafari = isBrowser && /^((?!chrome|android).)*safari/i.test(ua);
  const isHttpsOrigin = isBrowser && window.location.protocol === 'https:';

  let canPlayMp3 = true;
  let canPlayAac = true;
  let canPlayHlsNative = false;
  let canPlayHlsMse = false;

  if (isBrowser) {
    const probe = audioElement || (typeof Audio !== 'undefined' ? new Audio() : null);
    if (probe) {
      canPlayMp3 = probe.canPlayType('audio/mpeg') !== '';
      canPlayAac = probe.canPlayType('audio/aac') !== '' || probe.canPlayType('audio/mp4; codecs="mp4a.40.2"') !== '';
      canPlayHlsNative = probe.canPlayType('application/vnd.apple.mpegurl') !== '';
    }
    canPlayHlsMse = typeof (window as any).MediaSource !== 'undefined';
  }

  return {
    canPlayMp3,
    canPlayAac,
    canPlayHlsNative,
    canPlayHlsMse,
    isHttpsOrigin,
    isSafari,
    isIos
  };
}

/**
 * Retrieve cached working stream for a station on this device
 */
export function getCachedWorkingStream(stationId?: string): WorkingStreamRecord | null {
  if (!stationId) return null;
  const key = `${CACHE_KEY_PREFIX}${stationId}`;

  // 1. Check in-memory cache
  const mem = inMemoryCache.get(key);
  if (mem) {
    if (Date.now() < mem.expiresAt) {
      return mem;
    }
    inMemoryCache.delete(key);
  }

  // 2. Check localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as WorkingStreamRecord;
        if (parsed && parsed.expiresAt && Date.now() < parsed.expiresAt && parsed.url) {
          inMemoryCache.set(key, parsed);
          return parsed;
        }
        localStorage.removeItem(key);
      }
    } catch {
      // ignore JSON parse/localStorage errors
    }
  }

  return null;
}

/**
 * Save a verified working stream to local device cache
 */
export function saveWorkingStream(stationId: string, url: string, isHls = false, codec?: string): void {
  if (!stationId || !url) return;
  const key = `${CACHE_KEY_PREFIX}${stationId}`;
  const record: WorkingStreamRecord = {
    url: url.trim(),
    stationId,
    isHls,
    codec,
    verifiedAt: Date.now(),
    expiresAt: Date.now() + CACHE_TTL_MS
  };

  inMemoryCache.set(key, record);

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(key, JSON.stringify(record));
    } catch {
      // ignore storage quota errors
    }
  }
}

/**
 * Invalidate cached working stream when playback fails or watchdog times out
 */
export function invalidateWorkingStream(stationId?: string, failedUrl?: string): void {
  if (!stationId) return;
  const key = `${CACHE_KEY_PREFIX}${stationId}`;

  const current = getCachedWorkingStream(stationId);
  if (!failedUrl || (current && current.url === failedUrl.trim())) {
    inMemoryCache.delete(key);
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.removeItem(key);
      } catch {
        // ignore
      }
    }
  }
}

/**
 * Verify real audio progression (guards against false HTTP 200 or silent infinite stalls)
 */
export function isRealAudioProgressing(audio: HTMLAudioElement): boolean {
  if (!audio) return false;
  try {
    const hasCurrentTime = audio.currentTime > 0.05;
    const hasBufferedProgress = audio.buffered.length > 0 && audio.buffered.end(0) > 0.1;
    const isReady = audio.readyState >= 2; // HAVE_CURRENT_DATA or higher
    return !audio.paused && (hasCurrentTime || hasBufferedProgress) && isReady;
  } catch {
    return false;
  }
}

/**
 * Strictly find verified streams matching the station by exact UUID or exact matching primary URL.
 * NEVER fuzzy-matches unrelated stations by generic name.
 */
function getStrictVerifiedAlternates(station: RadioStation): string[] {
  const stationId = (station.id || station.stationuuid || '').trim().toLowerCase();
  const primaryUrl = (station.url_resolved || station.url || station.playUrl || '').trim();
  const alternates: string[] = [];

  const addIfValid = (u?: string | null) => {
    if (u && typeof u === 'string') {
      const clean = u.trim();
      if (clean && !alternates.includes(clean)) {
        alternates.push(clean);
      }
    }
  };

  // Search in curated list strictly by ID or matching stream URL
  const allCurated = [...VERIFIED_TURKISH_STATIONS, ...ALL_TURKISH_STATIONS];
  for (const s of allCurated) {
    const sId = (s.id || s.stationuuid || '').trim().toLowerCase();
    const sUrl = (s.url_resolved || s.url || s.playUrl || '').trim();
    if (stationId && sId && stationId === sId) {
      addIfValid(s.playUrl);
      addIfValid(s.url_resolved);
      addIfValid(s.url);
      addIfValid(s.streamUrl);
      addIfValid(s.fallbackUrl);
    } else if (primaryUrl && sUrl && primaryUrl === sUrl) {
      addIfValid(s.playUrl);
      addIfValid(s.url_resolved);
      addIfValid(s.fallbackUrl);
    }
  }

  return alternates;
}

/**
 * Central intelligent stream candidate selector for ANY radio station (Turkey or World)
 * Returns ranked, deduplicated, format-aware candidate streams.
 */
export function getSmartCandidatesForStation(
  station: RadioStation,
  browserCaps?: BrowserAudioCapabilities
): StreamCandidate[] {
  const caps = browserCaps || detectBrowserCapabilities();
  const stationId = station.id || station.stationuuid;
  const isHttpsPage = caps.isHttpsOrigin;

  const rawCandidatePool: Array<{ url: string; source: StreamCandidate['source']; isHls?: boolean }> = [];

  const addRaw = (u?: string | null, source: StreamCandidate['source'] = 'direct', forceHls?: boolean) => {
    if (!u || typeof u !== 'string') return;
    const clean = u.trim();
    if (!clean) return;
    if (rawCandidatePool.some(item => item.url === clean)) return;

    const isHls = forceHls !== undefined
      ? forceHls
      : (clean.toLowerCase().includes('.m3u8') || clean.toLowerCase().includes('playlist') || Boolean(station.hls));

    rawCandidatePool.push({ url: clean, source, isHls });
  };

  // 1. Cached Working Stream (prioritized at Rank 1 on this specific device)
  const cached = getCachedWorkingStream(stationId);
  if (cached && cached.url) {
    addRaw(cached.url, 'cache', cached.isHls);
  }

  // 2. Station's declared stream URLs
  addRaw(station.url_resolved, 'resolved');
  addRaw(station.playUrl, 'direct');
  addRaw(station.streamUrl, 'direct');
  addRaw(station.url, 'direct');
  addRaw(station.fallbackUrl, 'fallback');

  // 3. Strictly verified alternative URLs for the exact station (by ID/URL)
  const strictAlternates = getStrictVerifiedAlternates(station);
  for (const altUrl of strictAlternates) {
    addRaw(altUrl, 'fallback');
  }

  // 4. Generate protocol and proxy variations with accurate priority ranking
  const candidateList: StreamCandidate[] = [];

  for (const item of rawCandidatePool) {
    const rawUrl = item.url;
    const isCached = item.source === 'cache';
    const isHls = Boolean(item.isHls);

    if (rawUrl.toLowerCase().startsWith('https://')) {
      // Direct HTTPS: Direct browser <audio> tag has NO CORS restriction on cross-origin media
      // Streaming directly from CDN avoids Vercel lambda execution timeouts completely.
      candidateList.push({
        url: rawUrl,
        source: isCached ? 'cache' : 'direct',
        isHls,
        codec: station.codec,
        priority: isCached ? 1 : 10
      });

      // Relay Proxy as secondary fallback if direct HTTPS stream is geo-blocked or blocked by firewall
      candidateList.push({
        url: `/api/radio/proxy?url=${encodeURIComponent(rawUrl)}`,
        source: 'proxy',
        isHls,
        codec: station.codec,
        priority: isCached ? 12 : 22
      });
    } else if (rawUrl.toLowerCase().startsWith('http://')) {
      const isIpHost = /^http:\/\/\d+\.\d+\.\d+\.\d+/i.test(rawUrl);

      if (isHttpsPage) {
        // On HTTPS pages:
        // A) If domain name, test upgraded https:// first (direct browser audio is always preferred)
        if (!isIpHost) {
          const upgradedHttps = rawUrl.replace(/^http:\/\//i, 'https://');
          candidateList.push({
            url: upgradedHttps,
            source: isCached ? 'cache' : 'upgraded_https',
            isHls,
            codec: station.codec,
            priority: isCached ? 2 : 14
          });
        }

        // B) Local serverless proxy (crucial for HTTP-only Shoutcast/Icecast on HTTPS pages)
        candidateList.push({
          url: `/api/radio/proxy?url=${encodeURIComponent(rawUrl)}`,
          source: 'proxy',
          isHls,
          codec: station.codec,
          priority: isCached ? 5 : 20
        });

        // C) Public CORS proxy as backup
        candidateList.push({
          url: `https://corsproxy.io/?url=${encodeURIComponent(rawUrl)}`,
          source: 'cors_proxy',
          isHls,
          codec: station.codec,
          priority: 30
        });

        // D) Direct HTTP as last resort (browser might block mixed-content, but allowed on some webviews)
        candidateList.push({
          url: rawUrl,
          source: 'direct',
          isHls,
          codec: station.codec,
          priority: 40
        });
      } else {
        // On HTTP pages (localhost development)
        candidateList.push({
          url: rawUrl,
          source: isCached ? 'cache' : 'direct',
          isHls,
          codec: station.codec,
          priority: isCached ? 1 : 10
        });
        candidateList.push({
          url: `/api/radio/proxy?url=${encodeURIComponent(rawUrl)}`,
          source: 'proxy',
          isHls,
          codec: station.codec,
          priority: isCached ? 3 : 20
        });
      }
    } else {
      // Relative or special URL
      candidateList.push({
        url: rawUrl,
        source: isCached ? 'cache' : 'direct',
        isHls,
        codec: station.codec,
        priority: isCached ? 1 : 15
      });
    }
  }

  // Station relay route fallback
  if (stationId) {
    candidateList.push({
      url: `/api/radio/stream/${encodeURIComponent(stationId)}`,
      source: 'proxy',
      isHls: Boolean(station.hls),
      codec: station.codec,
      priority: 25
    });
  }

  // Deduplicate by URL while keeping the best (lowest) priority
  const urlMap = new Map<string, StreamCandidate>();
  for (const cand of candidateList) {
    const existing = urlMap.get(cand.url);
    if (!existing || cand.priority < existing.priority) {
      urlMap.set(cand.url, cand);
    }
  }

  // Sort candidates by priority ascending
  const sorted = Array.from(urlMap.values()).sort((a, b) => a.priority - b.priority);

  return sorted;
}

/**
 * On-demand query to Radio Browser for the freshest station alternatives if initial candidates fail.
 * Runs strictly per-station on demand, never bulk-scans on app load.
 */
export async function fetchOnDemandRadioBrowserAlternatives(stationuuid: string): Promise<string[]> {
  if (!stationuuid || stationuuid.length < 10) return [];

  const alternatives: string[] = [];
  const add = (u?: string | null) => {
    if (u && typeof u === 'string') {
      const trimmed = u.trim();
      if (trimmed && !alternatesIncludes(alternatives, trimmed)) {
        alternatives.push(trimmed);
      }
    }
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    // Call local endpoint or direct Radio Browser by UUID
    const res = await fetch(`/api/radio/resolve-station/${encodeURIComponent(stationuuid)}`, {
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.station) {
        add(data.station.url_resolved);
        add(data.station.url);
      }
    }
  } catch {
    // ignore network errors
  }

  return alternatives;
}

function alternatesIncludes(list: string[], url: string): boolean {
  return list.some(item => item.toLowerCase() === url.toLowerCase());
}
