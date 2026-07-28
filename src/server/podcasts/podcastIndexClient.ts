import crypto from 'crypto';

export interface PodcastIndexItem {
  id: number;
  title: string;
  url: string;
  originalUrl?: string;
  link?: string;
  description?: string;
  author?: string;
  image?: string;
  artwork?: string;
  itunesId?: number;
  language?: string;
  categories?: Record<string, string> | string[];
  episodeCount?: number;
  newestItemPubdate?: number;
}

function getAuthHeaders() {
  const apiKey = process.env.PODCAST_INDEX_API_KEY;
  const apiSecret = process.env.PODCAST_INDEX_API_SECRET;
  const userAgent = process.env.PODCAST_INDEX_USER_AGENT || 'RadioCastLive/1.0 (+https://radiocastlive.vercel.app)';

  if (!apiKey || !apiSecret) {
    return null;
  }

  const epochTime = Math.floor(Date.now() / 1000);
  const data4Hash = apiKey + apiSecret + epochTime;
  const sha1Hash = crypto.createHash('sha1').update(data4Hash).digest('hex');

  return {
    'User-Agent': userAgent,
    'X-Auth-Date': String(epochTime),
    'X-Auth-Key': apiKey,
    'Authorization': sha1Hash,
    'Accept': 'application/json'
  };
}

export async function fetchPodcastIndexTrending(lang = 'tr', limit = 100): Promise<PodcastIndexItem[]> {
  const headers = getAuthHeaders();
  if (!headers) {
    console.info('[podcast-index] API keys not configured. Safe fallback active.');
    return [];
  }

  try {
    const url = `https://api.podcastindex.org/api/1.0/podcasts/trending?lang=${encodeURIComponent(lang)}&max=${limit}`;
    const res = await fetch(url, { headers });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.feeds)) {
        return data.feeds;
      }
    }
  } catch (err) {
    console.warn('[podcast-index:error] Trending fetch failed:', err);
  }
  return [];
}

export async function fetchPodcastIndexRecent(lang = 'tr', limit = 100): Promise<PodcastIndexItem[]> {
  const headers = getAuthHeaders();
  if (!headers) return [];

  try {
    const url = `https://api.podcastindex.org/api/1.0/recent/feeds?lang=${encodeURIComponent(lang)}&max=${limit}`;
    const res = await fetch(url, { headers });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.feeds)) {
        return data.feeds;
      }
    }
  } catch (err) {
    console.warn('[podcast-index:error] Recent fetch failed:', err);
  }
  return [];
}

export async function searchPodcastIndexByTerm(query: string, lang = 'tr', limit = 100): Promise<PodcastIndexItem[]> {
  const headers = getAuthHeaders();
  if (!headers) return [];

  try {
    const url = `https://api.podcastindex.org/api/1.0/search/byterm?q=${encodeURIComponent(query)}&max=${limit}`;
    const res = await fetch(url, { headers });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.feeds)) {
        return data.feeds.filter((f: any) => !lang || (f.language || '').toLowerCase().startsWith(lang));
      }
    }
  } catch (err) {
    console.warn('[podcast-index:error] Search by term failed:', err);
  }
  return [];
}

export async function lookupPodcastIndexByFeedUrl(feedUrl: string): Promise<PodcastIndexItem | null> {
  const headers = getAuthHeaders();
  if (!headers) return null;

  try {
    const url = `https://api.podcastindex.org/api/1.0/podcasts/byfeedurl?url=${encodeURIComponent(feedUrl)}`;
    const res = await fetch(url, { headers });
    if (res.ok) {
      const data = await res.json();
      if (data && data.feed) return data.feed;
    }
  } catch (err) {
    console.warn('[podcast-index:error] Lookup by feedUrl failed:', err);
  }
  return null;
}
