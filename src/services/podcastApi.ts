import { PodcastShow, PodcastEpisode } from '../types';

export function parseTurkishDateToMillis(dateStr?: string): number {
  if (!dateStr) return 0;
  const time = Date.parse(dateStr);
  if (!isNaN(time) && time > 0) return time;

  const TR_MONTHS: Record<string, number> = {
    ocak: 0, şubat: 1, mart: 2, nisan: 3, mayıs: 4, haziran: 5,
    temmuz: 6, ağustos: 7, eylül: 8, ekim: 9, kasım: 10, aralık: 11
  };

  const parts = dateStr.trim().toLowerCase().split(/\s+/);
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10);
    const monthStr = parts[1];
    const year = parseInt(parts[2], 10);

    if (!isNaN(day) && !isNaN(year) && TR_MONTHS[monthStr] !== undefined) {
      return new Date(year, TR_MONTHS[monthStr], day).getTime();
    }
  }

  return 0;
}

export function safeParseEpisodeDateMillis(ep: any): number {
  if (!ep) return 0;

  const NOW = Date.now();
  const MAX_FUTURE_THRESHOLD = NOW + (48 * 60 * 60 * 1000); // 48 hours allowance

  const tryParseValue = (val: any): number => {
    if (val === null || val === undefined) return 0;

    // Handle numbers or numeric strings
    if (typeof val === 'number') {
      if (isNaN(val) || val <= 0) return 0;
      // Convert Unix timestamp in seconds (e.g. 1.7e9) to milliseconds
      if (val < 10000000000) return val * 1000;
      return val;
    }

    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (!trimmed) return 0;

      // Check if pure numeric string
      if (/^\d+$/.test(trimmed)) {
        const num = parseInt(trimmed, 10);
        if (!isNaN(num) && num > 0) {
          if (num < 10000000000) return num * 1000;
          return num;
        }
      }

      // Try Standard Date.parse
      const parsed = Date.parse(trimmed);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }

      // Try Turkish Date parsing
      return parseTurkishDateToMillis(trimmed);
    }

    return 0;
  };

  // Check candidate fields in order of reliability
  const candidates = [
    ep.pubDateMillis,
    ep.pubDate,
    ep.publishedAt,
    ep.isoDate,
    ep.publishedDate,
    ep.releaseDate
  ];

  for (const candidate of candidates) {
    const millis = tryParseValue(candidate);
    if (millis > 0) {
      // If timestamp is not suspicious (> 48 hours in future), use it
      if (millis <= MAX_FUTURE_THRESHOLD) {
        return millis;
      }
      // If suspicious future date, continue checking other alternative date fields
    }
  }

  // If no valid past/present date candidate is found, return 0 (null date)
  return 0;
}

export async function fetchITunesPodcastsDirect(query: string, country = 'TR', limit = 100): Promise<PodcastShow[]> {
  try {
    const res = await fetch(`https://itunes.apple.com/search?media=podcast&entity=podcast&country=${encodeURIComponent(country)}&limit=${limit}&term=${encodeURIComponent(query)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.results)) {
        return data.results
          .filter((item: any) => item.feedUrl && item.collectionName)
          .map((item: any) => ({
            id: String(item.collectionId || Math.random()),
            title: item.collectionName.trim(),
            publisher: (item.artistName || 'Yayıncı').trim(),
            coverUrl: item.artworkUrl600 || item.artworkUrl100 || 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&q=80',
            category: item.primaryGenreName || 'Podcast',
            description: `${item.artistName || 'Yayıncı'} - ${item.primaryGenreName || 'Türkçe'} podcast serisi.`,
            feedUrl: item.feedUrl,
            releaseDateMillis: item.releaseDate ? new Date(item.releaseDate).getTime() : 0,
            episodes: []
          }));
      }
    }
  } catch (err) {
    console.warn('Direct iTunes fetch error:', err);
  }
  return [];
}

export interface PodcastCatalogResponse {
  items: PodcastShow[];
  count: number;
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export async function fetchPodcastCatalog(params: {
  limit?: number;
  offset?: number;
  category?: string;
  query?: string;
} = {}): Promise<PodcastCatalogResponse> {
  const limit = params.limit || 50;
  const offset = params.offset || 0;
  const category = params.category || 'all';
  const query = params.query || '';

  try {
    const url = `/api/podcasts/catalog?limit=${limit}&offset=${offset}&category=${encodeURIComponent(category)}&q=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.items)) {
        const shows: PodcastShow[] = data.items.map((item: any) => ({
          id: item.id,
          title: item.title,
          publisher: item.author || 'Yayıncı',
          coverUrl: item.image || 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=400&q=80',
          category: item.categories?.[0] || 'Podcast',
          description: item.description || '',
          feedUrl: item.feedUrl,
          releaseDateMillis: item.releaseDateMillis || 0,
          episodes: []
        }));

        return {
          items: shows,
          count: data.count || shows.length,
          total: data.total || shows.length,
          limit: data.limit || limit,
          offset: data.offset || offset,
          hasMore: data.hasMore ?? false
        };
      }
    }
  } catch (err) {
    console.warn('Podcast catalog fetch failed, using fallback:', err);
  }

  // Fallback to iTunes search
  const fallbackShows = await getPopularPodcasts();
  const paged = fallbackShows.slice(offset, offset + limit);
  return {
    items: paged,
    count: paged.length,
    total: fallbackShows.length,
    limit,
    offset,
    hasMore: (offset + limit) < fallbackShows.length
  };
}

export async function getPopularPodcasts(_country = 'TR', _page = 1): Promise<PodcastShow[]> {
  try {
    const res = await fetchPodcastCatalog({ limit: 50, offset: 0 });
    if (res.items.length > 0) return res.items;
  } catch (err) {
    console.warn('Popular podcasts backend fetch warning:', err);
  }

  // Direct client-side iTunes queries
  try {
    const keywords = ['felsefe', 'haber', 'gündem', 'teknoloji', 'bilim', 'psikoloji', 'tarih', 'mizah', 'ekonomi', 'spor', 'sanat', 'edebiyat', 'müzik', 'bilişim', 'eğitim', 'finans', 'girişimcilik', 'sinema', 'dizi', 'sağlık', 'yaşam', 'kişisel gelişim', 'oyun', 'çocuk', 'ebeveyn', 'futbol', 'türkçe', 'türkiye', 'kripto'];
    const results = await Promise.allSettled(
      keywords.map(kw => fetchITunesPodcastsDirect(kw, 'TR', 50))
    );

    const allShows: PodcastShow[] = [];
    const seenIds = new Set<string>();

    for (const res of results) {
      if (res.status === 'fulfilled' && Array.isArray(res.value)) {
        for (const show of res.value) {
          const key = (show.feedUrl || show.title).toLowerCase().trim();
          if (!seenIds.has(key)) {
            seenIds.add(key);
            allShows.push(show);
          }
        }
      }
    }

    if (allShows.length > 0) {
      return allShows.sort((a, b) => (b.releaseDateMillis || 0) - (a.releaseDateMillis || 0));
    }
  } catch (directErr) {
    console.warn('Direct client-side podcast fetch failed:', directErr);
  }

  return FALLBACK_PODCAST_SHOWS;
}

export async function searchPodcasts(query: string, country = 'TR', page = 1): Promise<PodcastShow[]> {
  if (!query.trim()) return getPopularPodcasts(country, page);

  try {
    const res = await fetchPodcastCatalog({ limit: 50, offset: 0, query });
    if (res.items.length > 0) return res.items;
  } catch (err) {
    console.warn('Podcast search error:', err);
  }

  try {
    const directResults = await fetchITunesPodcastsDirect(query, country, 100);
    if (directResults.length > 0) {
      return directResults.sort((a, b) => (b.releaseDateMillis || 0) - (a.releaseDateMillis || 0));
    }
  } catch (e) {
    console.warn('Direct iTunes podcast search failed:', e);
  }

  return FALLBACK_PODCAST_SHOWS.filter(p =>
    p.title.toLowerCase().includes(query.toLowerCase()) ||
    p.publisher.toLowerCase().includes(query.toLowerCase())
  );
}

function parseXmlClientSide(xmlText: string, show: PodcastShow): PodcastEpisode[] {
  if (!xmlText || typeof window === 'undefined') return [];
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    const items = Array.from(xmlDoc.querySelectorAll('item, entry'));
    const episodes: PodcastEpisode[] = [];

    let idx = 0;
    for (const item of items) {
      let audioUrl = '';

      // Check enclosure
      const enclosure = item.querySelector('enclosure');
      if (enclosure) {
        const url = enclosure.getAttribute('url');
        if (url) audioUrl = url.trim();
      }

      // Check media content
      if (!audioUrl) {
        const mediaContent = item.querySelector('content, media\\:content');
        if (mediaContent) {
          const url = mediaContent.getAttribute('url');
          if (url) audioUrl = url.trim();
        }
      }

      // Check links
      if (!audioUrl) {
        const links = Array.from(item.querySelectorAll('link'));
        for (const l of links) {
          const href = l.getAttribute('href') || l.textContent || '';
          const rel = l.getAttribute('rel') || '';
          const type = l.getAttribute('type') || '';
          if ((rel === 'enclosure' || type.includes('audio') || href.match(/\.(mp3|m4a|aac|ogg)($|\?)/i)) && href) {
            audioUrl = href.trim();
            break;
          }
        }
      }

      // Check GUID
      if (!audioUrl) {
        const guid = item.querySelector('guid');
        if (guid && guid.textContent && guid.textContent.match(/^https?:\/\/.*\.(mp3|m4a|aac|ogg)($|\?)/i)) {
          audioUrl = guid.textContent.trim();
        }
      }

      if (!audioUrl || !audioUrl.startsWith('http')) continue;

      const titleEl = item.querySelector('title');
      const title = titleEl && titleEl.textContent ? titleEl.textContent.trim() : `Bölüm ${idx + 1}`;

      const descEl = item.querySelector('description, summary, itunes\\:summary, content\\:encoded');
      const rawDesc = descEl && descEl.textContent ? descEl.textContent.trim() : title;
      const description = rawDesc.replace(/<[^>]+>/g, '').trim() || title;

      const pubDateEl = item.querySelector('pubDate, published, updated, dc\\:date');
      const pubDateStr = pubDateEl && pubDateEl.textContent ? pubDateEl.textContent.trim() : '';

      let pubMillis = 0;
      let formattedDate = 'Güncel';
      if (pubDateStr) {
        try {
          const d = new Date(pubDateStr);
          if (!isNaN(d.getTime())) {
            pubMillis = d.getTime();
            formattedDate = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
          }
        } catch {}
      }

      const durEl = item.querySelector('itunes\\:duration');
      let durSecs = 1800;
      if (durEl && durEl.textContent) {
        const dStr = durEl.textContent.trim();
        if (dStr.includes(':')) {
          const p = dStr.split(':').map(Number);
          if (p.length === 3) durSecs = p[0] * 3600 + p[1] * 60 + p[2];
          else if (p.length === 2) durSecs = p[0] * 60 + p[1];
        } else {
          const s = parseInt(dStr, 10);
          if (!isNaN(s) && s > 0) durSecs = s;
        }
      }

      let epCover = show.coverUrl;
      const itunesImg = item.querySelector('itunes\\:image');
      if (itunesImg) {
        const href = itunesImg.getAttribute('href');
        if (href) epCover = href;
      }

      episodes.push({
        id: `client-ep-${idx}-${audioUrl.slice(-30)}`,
        showId: show.id,
        showTitle: show.title,
        title,
        description,
        audioUrl,
        durationSeconds: durSecs,
        publishedDate: formattedDate,
        pubDateMillis: pubMillis,
        coverUrl: epCover,
        category: show.category || 'Podcast'
      });

      idx++;
    }

    return episodes;
  } catch {
    return [];
  }
}

async function fetchAndParseRssFeed(feedUrl: string, show: PodcastShow): Promise<{ episodes: PodcastEpisode[]; success: boolean; errorCode?: string }> {
  // 1. First try backend feed proxy
  try {
    const url = `/api/podcasts/feed?url=${encodeURIComponent(feedUrl)}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.episodes) && data.episodes.length > 0) {
        const episodes = data.episodes.map((ep: any, idx: number) => {
          const pubMillis = safeParseEpisodeDateMillis(ep);
          return {
            id: ep.id || `ep-${show.id}-${idx}`,
            showId: show.id,
            showTitle: data.podcast?.title || show.title,
            title: ep.title,
            description: ep.description || `${show.publisher || 'Podcast'} yayını.`,
            audioUrl: ep.audioUrl,
            durationSeconds: ep.durationSeconds || 1800,
            publishedDate: ep.publishedDate || 'Güncel',
            pubDateMillis: pubMillis,
            coverUrl: ep.coverUrl || show.coverUrl,
            category: show.category || 'Podcast'
          };
        });
        return { episodes, success: true };
      }
    }
  } catch {}

  // 2. Client-side direct RSS fetch fallback
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const directRes = await fetch(feedUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (directRes.ok) {
      const xmlText = await directRes.text();
      const episodes = parseXmlClientSide(xmlText, show);
      if (episodes.length > 0) {
        return { episodes, success: true };
      }
    }
  } catch {}

  // 3. Client-side CORS Proxy Fallback
  const corsProxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`,
    `https://corsproxy.io/?${encodeURIComponent(feedUrl)}`
  ];

  for (const proxyUrl of corsProxies) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const proxyRes = await fetch(proxyUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (proxyRes.ok) {
        const xmlText = await proxyRes.text();
        const episodes = parseXmlClientSide(xmlText, show);
        if (episodes.length > 0) {
          return { episodes, success: true };
        }
      }
    } catch {}
  }

  return { episodes: [], success: false, errorCode: 'FEED_FETCH_FAILED' };
}

export async function getPodcastEpisodesResult(show: PodcastShow): Promise<{ episodes: PodcastEpisode[]; success: boolean; errorCode?: string }> {
  if (show.feedUrl) {
    const res = await fetchAndParseRssFeed(show.feedUrl, show);
    if (res.success || res.episodes.length > 0) {
      const sorted = res.episodes
        .map((ep, originalIndex) => ({ ep, originalIndex }))
        .sort((a, b) => {
          const timeA = safeParseEpisodeDateMillis(a.ep);
          const timeB = safeParseEpisodeDateMillis(b.ep);

          if (timeA > 0 && timeB > 0) {
            if (timeB !== timeA) return timeB - timeA;
            return a.originalIndex - b.originalIndex;
          }
          if (timeA > 0 && timeB === 0) return -1;
          if (timeA === 0 && timeB > 0) return 1;
          return a.originalIndex - b.originalIndex;
        })
        .map(item => item.ep);

      return { episodes: sorted, success: true };
    }
    return { episodes: [], success: false, errorCode: res.errorCode || 'FEED_FETCH_FAILED' };
  }

  if (show.episodes && show.episodes.length > 0) {
    return { episodes: show.episodes, success: true };
  }

  return { episodes: [], success: true };
}

export async function getPodcastEpisodes(show: PodcastShow): Promise<PodcastEpisode[]> {
  const result = await getPodcastEpisodesResult(show);
  return result.episodes;
}

function generateFallbackEpisodesForShow(_show: PodcastShow): PodcastEpisode[] {
  return [];
}

const FALLBACK_PODCAST_SHOWS: PodcastShow[] = [
  {
    id: 'felsefeyle-tanis',
    title: 'Felsefeyle Tanış',
    publisher: 'Felsefe Kulübü',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
    category: 'Felsefe & Kültür',
    description: 'Sokrates’ten Stoacılığa, Nietzsche’den varoluşçuluğa uzanan felsefe sohbetleri.',
    episodes: []
  },
  {
    id: 'gelecegin-teknolojileri',
    title: 'Geleceğin Teknolojileri & Yapay Zeka',
    publisher: 'TeknoVizyon',
    coverUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&q=80',
    category: 'Bilim & Teknoloji',
    description: 'Büyük dil modelleri, AGI ve dijital dönüşüm üzerine haftalık analizler.',
    episodes: []
  },
  {
    id: 'nereden-baslasam',
    title: 'Nereden Başlasam? - Kültür & Bilim',
    publisher: 'Bilim Rehberi',
    coverUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&q=80',
    category: 'Kültür & Bilim',
    description: 'Astrofizikten sanat tarihine merak edilen her şeyin başlangıç noktası.',
    episodes: []
  },
  {
    id: 'psikoloji-sohbetleri',
    title: 'Psikoloji Sohbetleri & Farkındalık',
    publisher: 'Mindful Life',
    coverUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80',
    category: 'Psikoloji & İnsan',
    description: 'Stres yönetimi, zihinsel detoks ve duygusal denge üzerine konuşmalar.',
    episodes: []
  }
];
