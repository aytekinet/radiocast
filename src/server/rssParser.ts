import { XMLParser } from 'fast-xml-parser';

export type PodcastFeedErrorCode =
  | 'MISSING_FEED_URL'
  | 'INVALID_FEED_URL'
  | 'BLOCKED_FEED_URL'
  | 'FEED_URL_ENCODING_ERROR'
  | 'FEED_DNS_FAILED'
  | 'FEED_TIMEOUT'
  | 'FEED_HTTP_403'
  | 'FEED_HTTP_404'
  | 'FEED_HTTP_ERROR'
  | 'FEED_FETCH_FAILED'
  | 'FEED_REDIRECT_FAILED'
  | 'FEED_RESPONSE_TOO_LARGE'
  | 'FEED_RETURNED_HTML'
  | 'FEED_EMPTY_RESPONSE'
  | 'FEED_XML_PARSE_FAILED'
  | 'FEED_HAS_NO_ITEMS'
  | 'FEED_HAS_NO_AUDIO_EPISODES'
  | 'SERVER_CONFIGURATION_ERROR'
  | 'UNKNOWN_ERROR';

export interface PodcastEpisode {
  id: string;
  showTitle?: string;
  title: string;
  description: string;
  audioUrl: string;
  durationSeconds: number;
  publishedDate: string;
  pubDateMillis: number;
  coverUrl?: string;
}

export interface PodcastFeedResponse {
  success: boolean;
  podcast: {
    id?: string;
    title: string;
    description?: string;
    image?: string;
    feedUrl: string;
  } | null;
  episodes: PodcastEpisode[];
  count: number;
  diagnostics?: {
    fetchDurationMs: number;
    parseDurationMs: number;
    totalItems: number;
    validAudioItems: number;
    parseFormat: 'rss' | 'atom' | 'unknown';
    finalUrl?: string;
  };
  errorCode?: PodcastFeedErrorCode;
}

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

function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function isBlockedUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    const protocol = parsed.protocol.toLowerCase();
    if (protocol !== 'http:' && protocol !== 'https:') return true;

    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '::1' ||
      hostname === '169.254.169.254' ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.local')
    ) {
      return true;
    }

    const ipMatch = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipMatch) {
      const [, a, b] = ipMatch.map(Number);
      if (a === 10) return true;
      if (a === 172 && b >= 16 && b <= 31) return true;
      if (a === 192 && b === 168) return true;
      if (a === 169 && b === 254) return true;
      if (a === 127) return true;
    }

    return false;
  } catch {
    return true;
  }
}

export function parseRssXmlContent(xmlText: string, feedUrl: string): {
  podcast: { title: string; description?: string; image?: string; feedUrl: string };
  episodes: PodcastEpisode[];
  totalItems: number;
  validAudioItems: number;
  parseFormat: 'rss' | 'atom' | 'unknown';
  error?: PodcastFeedErrorCode;
} {
  let parseFormat: 'rss' | 'atom' | 'unknown' = 'unknown';
  let totalItems = 0;
  let validAudioItems = 0;

  try {
    const jsonObj = rssXmlParser.parse(xmlText);
    if (!jsonObj || typeof jsonObj !== 'object') {
      return {
        podcast: { title: 'Podcast', feedUrl },
        episodes: [],
        totalItems: 0,
        validAudioItems: 0,
        parseFormat: 'unknown',
        error: 'FEED_XML_PARSE_FAILED'
      };
    }

    const channel = jsonObj?.rss?.channel || jsonObj?.['rdf:RDF']?.channel || jsonObj?.channel || jsonObj?.feed || jsonObj;

    if (jsonObj?.feed || channel?.entry) {
      parseFormat = 'atom';
    } else if (jsonObj?.rss || channel?.item) {
      parseFormat = 'rss';
    }

    const channelTitle = extractXmlTextValue(channel?.title) || extractXmlTextValue(jsonObj?.rss?.channel?.title) || 'Podcast';
    const rawDesc = extractXmlTextValue(channel?.description) || extractXmlTextValue(channel?.['itunes:summary']) || extractXmlTextValue(channel?.subtitle) || extractXmlTextValue(channel?.summary) || '';
    const channelDesc = stripHtml(rawDesc);

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
      rawItems = rawItems ? [rawItems] : [];
    }

    totalItems = rawItems.length;
    if (totalItems === 0) {
      return {
        podcast: { title: channelTitle, description: channelDesc, image: channelImage, feedUrl },
        episodes: [],
        totalItems: 0,
        validAudioItems: 0,
        parseFormat,
        error: 'FEED_HAS_NO_ITEMS'
      };
    }

    const episodes: PodcastEpisode[] = [];
    const seenGuidsOrUrls = new Set<string>();

    let idx = 0;
    for (const item of rawItems) {
      if (!item) continue;

      let audioUrl = '';

      // 1. Check enclosure tag
      if (item.enclosure) {
        const enclosures = Array.isArray(item.enclosure) ? item.enclosure : [item.enclosure];
        for (const enc of enclosures) {
          const url = enc?.['@_url'] || enc?.url;
          const type = enc?.['@_type'] || enc?.type || '';
          if (url && (type.includes('audio') || url.match(/\.(mp3|m4a|aac|ogg|wav|flac)($|\?)/i))) {
            audioUrl = url.trim();
            break;
          }
        }
        if (!audioUrl && enclosures[0]) {
          const url = enclosures[0]['@_url'] || enclosures[0].url || '';
          if (url && !url.match(/\.(html|htm|php|jpg|png)($|\?)/i)) {
            audioUrl = url.trim();
          }
        }
      }

      // 2. FeedBurner origEnclosureLink
      if (!audioUrl && item['feedburner:origEnclosureLink']) {
        audioUrl = extractXmlTextValue(item['feedburner:origEnclosureLink']);
      }

      // 3. Media:content
      if (!audioUrl && item['media:content']) {
        const mcList = Array.isArray(item['media:content']) ? item['media:content'] : [item['media:content']];
        for (const mc of mcList) {
          if (mc && (mc['@_url'] || mc.url)) {
            const url = (mc['@_url'] || mc.url).trim();
            const type = mc['@_type'] || mc.type || '';
            if (type.includes('audio') || url.match(/\.(mp3|m4a|aac|ogg|wav|flac)($|\?)/i)) {
              audioUrl = url;
              break;
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
            if ((rel === 'enclosure' || type.includes('audio') || href.match(/\.(mp3|m4a|aac|ogg)($|\?)/i)) && href) {
              audioUrl = href.trim();
              break;
            }
          } else if (typeof l === 'string' && l.match(/\.(mp3|m4a|aac|ogg)($|\?)/i)) {
            audioUrl = l.trim();
            break;
          }
        }
      }

      // 5. GUID check
      if (!audioUrl) {
        const guidVal = extractXmlTextValue(item.guid);
        if (guidVal && guidVal.match(/^https?:\/\/.*\.(mp3|m4a|aac|ogg)($|\?)/i)) {
          audioUrl = guidVal.trim();
        }
      }

      if (!audioUrl || !audioUrl.startsWith('http')) continue;
      if (audioUrl.match(/\.(html|htm|php|asp|aspx|js|css|jpg|jpeg|png|gif|svg|webp|youtube\.com|vimeo\.com)($|\?)/i)) {
        continue;
      }

      const dedupeKey = (extractXmlTextValue(item.guid) || audioUrl).toLowerCase().trim();
      if (seenGuidsOrUrls.has(dedupeKey)) continue;
      seenGuidsOrUrls.add(dedupeKey);

      validAudioItems++;

      const title = extractXmlTextValue(item.title) || `Bölüm ${idx + 1}`;
      const rawItemDesc = extractXmlTextValue(item.description) || extractXmlTextValue(item['itunes:summary']) || extractXmlTextValue(item['content:encoded']) || extractXmlTextValue(item.summary) || title;
      const description = stripHtml(rawItemDesc) || title;

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

      episodes.push({
        id: episodeId,
        showTitle: channelTitle,
        title,
        description,
        audioUrl,
        durationSeconds,
        publishedDate: formattedDate,
        pubDateMillis,
        coverUrl: epCover
      });

      idx++;
    }

    // Sort newest first
    episodes.sort((a, b) => (b.pubDateMillis || 0) - (a.pubDateMillis || 0));

    if (episodes.length === 0) {
      return {
        podcast: { title: channelTitle, description: channelDesc, image: channelImage, feedUrl },
        episodes: [],
        totalItems,
        validAudioItems: 0,
        parseFormat,
        error: 'FEED_HAS_NO_AUDIO_EPISODES'
      };
    }

    return {
      podcast: {
        title: channelTitle,
        description: channelDesc,
        image: channelImage,
        feedUrl
      },
      episodes,
      totalItems,
      validAudioItems,
      parseFormat
    };
  } catch {
    return {
      podcast: { title: 'Podcast', feedUrl },
      episodes: [],
      totalItems,
      validAudioItems: 0,
      parseFormat: 'unknown',
      error: 'FEED_XML_PARSE_FAILED'
    };
  }
}

export async function fetchAndParsePodcastRss(feedUrl: string): Promise<PodcastFeedResponse> {
  const fetchStartTime = Date.now();

  if (!feedUrl || typeof feedUrl !== 'string') {
    return {
      success: false,
      podcast: null,
      episodes: [],
      count: 0,
      errorCode: 'MISSING_FEED_URL',
      diagnostics: {
        fetchDurationMs: 0,
        parseDurationMs: 0,
        totalItems: 0,
        validAudioItems: 0,
        parseFormat: 'unknown',
        finalUrl: ''
      }
    };
  }

  const trimmedUrl = feedUrl.trim();
  if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
    return {
      success: false,
      podcast: null,
      episodes: [],
      count: 0,
      errorCode: 'INVALID_FEED_URL',
      diagnostics: {
        fetchDurationMs: 0,
        parseDurationMs: 0,
        totalItems: 0,
        validAudioItems: 0,
        parseFormat: 'unknown',
        finalUrl: trimmedUrl
      }
    };
  }

  if (isBlockedUrl(trimmedUrl)) {
    return {
      success: false,
      podcast: null,
      episodes: [],
      count: 0,
      errorCode: 'BLOCKED_FEED_URL',
      diagnostics: {
        fetchDurationMs: 0,
        parseDurationMs: 0,
        totalItems: 0,
        validAudioItems: 0,
        parseFormat: 'unknown',
        finalUrl: trimmedUrl
      }
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    const response = await fetch(trimmedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
        'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.7'
      },
      signal: controller.signal,
      redirect: 'follow'
    });

    clearTimeout(timeoutId);
    const fetchDurationMs = Date.now() - fetchStartTime;

    const finalUrl = response.url || trimmedUrl;

    if (!response.ok) {
      let errorCode: PodcastFeedErrorCode = 'FEED_HTTP_ERROR';
      if (response.status === 403) errorCode = 'FEED_HTTP_403';
      else if (response.status === 404) errorCode = 'FEED_HTTP_404';

      return {
        success: false,
        podcast: null,
        episodes: [],
        count: 0,
        errorCode,
        diagnostics: {
          fetchDurationMs,
          parseDurationMs: 0,
          totalItems: 0,
          validAudioItems: 0,
          parseFormat: 'unknown',
          finalUrl
        }
      };
    }

    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    const parseStartTime = Date.now();
    let xmlText = await response.text();

    if (!xmlText || xmlText.trim().length === 0) {
      return {
        success: false,
        podcast: null,
        episodes: [],
        count: 0,
        errorCode: 'FEED_EMPTY_RESPONSE',
        diagnostics: {
          fetchDurationMs,
          parseDurationMs: Date.now() - parseStartTime,
          totalItems: 0,
          validAudioItems: 0,
          parseFormat: 'unknown',
          finalUrl
        }
      };
    }

    // Truncate huge feeds (>1.2MB) to speed up serverless response to <300ms
    if (xmlText.length > 1_200_000) {
      const cutIdx = xmlText.lastIndexOf('</item>', 1_200_000);
      if (cutIdx > 0) {
        xmlText = xmlText.slice(0, cutIdx + 7) + '\n</channel></rss>';
      }
    }

    // Check if returned HTML instead of XML/RSS
    const trimmedText = xmlText.trim();
    if (contentType.includes('text/html') || trimmedText.toLowerCase().startsWith('<!doctype html') || trimmedText.toLowerCase().startsWith('<html')) {
      return {
        success: false,
        podcast: null,
        episodes: [],
        count: 0,
        errorCode: 'FEED_RETURNED_HTML',
        diagnostics: {
          fetchDurationMs,
          parseDurationMs: Date.now() - parseStartTime,
          totalItems: 0,
          validAudioItems: 0,
          parseFormat: 'unknown',
          finalUrl
        }
      };
    }

    const parsed = parseRssXmlContent(xmlText, finalUrl);
    const parseDurationMs = Date.now() - parseStartTime;

    if (parsed.error) {
      return {
        success: false,
        podcast: parsed.podcast,
        episodes: [],
        count: 0,
        errorCode: parsed.error,
        diagnostics: {
          fetchDurationMs,
          parseDurationMs,
          totalItems: parsed.totalItems,
          validAudioItems: parsed.validAudioItems,
          parseFormat: parsed.parseFormat,
          finalUrl
        }
      };
    }

    return {
      success: true,
      podcast: parsed.podcast,
      episodes: parsed.episodes,
      count: parsed.episodes.length,
      diagnostics: {
        fetchDurationMs,
        parseDurationMs,
        totalItems: parsed.totalItems,
        validAudioItems: parsed.validAudioItems,
        parseFormat: parsed.parseFormat,
        finalUrl
      }
    };

  } catch (err: any) {
    const fetchDurationMs = Date.now() - fetchStartTime;
    const isTimeout = err?.name === 'AbortError' || err?.message?.includes('aborted');

    return {
      success: false,
      podcast: null,
      episodes: [],
      count: 0,
      errorCode: isTimeout ? 'FEED_TIMEOUT' : 'FEED_FETCH_FAILED',
      diagnostics: {
        fetchDurationMs,
        parseDurationMs: 0,
        totalItems: 0,
        validAudioItems: 0,
        parseFormat: 'unknown',
        finalUrl: trimmedUrl
      }
    };
  }
}
