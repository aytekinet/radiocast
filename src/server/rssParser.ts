import { XMLParser } from 'fast-xml-parser';

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
  errorCode?: 'INVALID_URL' | 'FEED_TIMEOUT' | 'FEED_FETCH_FAILED' | 'FEED_NOT_XML' | 'FEED_PARSE_FAILED' | 'NO_AUDIO_EPISODES';
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

export function parseRssXmlContent(xmlText: string, feedUrl: string): {
  podcast: { title: string; description?: string; image?: string; feedUrl: string };
  episodes: PodcastEpisode[];
  totalItems: number;
  validAudioItems: number;
  parseFormat: 'rss' | 'atom' | 'unknown';
} {
  let parseFormat: 'rss' | 'atom' | 'unknown' = 'unknown';
  let totalItems = 0;
  let validAudioItems = 0;

  try {
    const jsonObj = rssXmlParser.parse(xmlText);
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

      // Filter out non-audio or missing audio URLs
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

    episodes.sort((a, b) => (b.pubDateMillis || 0) - (a.pubDateMillis || 0));

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
      parseFormat: 'unknown'
    };
  }
}

export async function fetchAndParsePodcastRss(feedUrl: string): Promise<PodcastFeedResponse> {
  const fetchStartTime = Date.now();

  if (!feedUrl || typeof feedUrl !== 'string' || !feedUrl.startsWith('http')) {
    return {
      success: false,
      podcast: null,
      episodes: [],
      count: 0,
      errorCode: 'INVALID_URL',
      diagnostics: {
        fetchDurationMs: 0,
        parseDurationMs: 0,
        totalItems: 0,
        validAudioItems: 0,
        parseFormat: 'unknown',
        finalUrl: feedUrl
      }
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12_000); // Strict 12s timeout

    const response = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'GlobalRadioWeb/1.0 (Mozilla/5.0; Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml, */*'
      },
      signal: controller.signal,
      redirect: 'follow'
    });

    clearTimeout(timeoutId);
    const fetchDurationMs = Date.now() - fetchStartTime;

    if (!response.ok) {
      return {
        success: false,
        podcast: null,
        episodes: [],
        count: 0,
        errorCode: 'FEED_FETCH_FAILED',
        diagnostics: {
          fetchDurationMs,
          parseDurationMs: 0,
          totalItems: 0,
          validAudioItems: 0,
          parseFormat: 'unknown',
          finalUrl: response.url || feedUrl
        }
      };
    }

    const parseStartTime = Date.now();
    const xmlText = await response.text();

    if (!xmlText || xmlText.trim().length === 0) {
      return {
        success: false,
        podcast: null,
        episodes: [],
        count: 0,
        errorCode: 'FEED_NOT_XML',
        diagnostics: {
          fetchDurationMs,
          parseDurationMs: Date.now() - parseStartTime,
          totalItems: 0,
          validAudioItems: 0,
          parseFormat: 'unknown',
          finalUrl: response.url || feedUrl
        }
      };
    }

    const parsed = parseRssXmlContent(xmlText, response.url || feedUrl);
    const parseDurationMs = Date.now() - parseStartTime;

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
        finalUrl: response.url || feedUrl
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
        finalUrl: feedUrl
      }
    };
  }
}
