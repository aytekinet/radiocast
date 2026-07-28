import type { Request, Response } from 'express';
import { getFromCache, setToCache } from './cache';
import { fetchAndParsePodcastRss } from './rssParser';

export async function handlePodcastFeed(req: Request, res: Response) {
  const feedUrl = (req.query.url as string || req.query.feedUrl as string || '').trim();
  
  if (!feedUrl) {
    return res.status(400).json({
      success: false,
      podcast: null,
      episodes: [],
      count: 0,
      errorCode: 'INVALID_URL'
    });
  }

  const cacheKey = `podcast_feed_v2_${encodeURIComponent(feedUrl)}`;
  const cached = getFromCache<any>(cacheKey);
  if (cached) {
    return res.setHeader('Content-Type', 'application/json').json(cached);
  }

  const result = await fetchAndParsePodcastRss(feedUrl);

  if (result.success) {
    // Cache successful feeds for 15 minutes
    setToCache(cacheKey, result, 15 * 60 * 1000);
  } else {
    // Cache failures briefly (1 minute) to avoid spamming broken RSS endpoints
    setToCache(cacheKey, result, 1 * 60 * 1000);
  }

  return res.setHeader('Content-Type', 'application/json').json(result);
}

export async function handlePodcastSearch(req: Request, res: Response) {
  const q = (req.query.q as string || '').trim();
  const country = (req.query.country as string || 'TR').toUpperCase();
  const page = Math.max(1, parseInt(req.query.page as string || '1', 10));

  const cacheKey = `podcast_search_${encodeURIComponent(q)}_${country}_p${page}`;
  const cached = getFromCache<any[]>(cacheKey);
  if (cached) {
    return res.setHeader('Content-Type', 'application/json').json(cached);
  }

  try {
    let searchTerms: string[] = [];
    if (!q || q.toLowerCase() === 'podcast' || q.toLowerCase() === 'popular') {
      searchTerms = [
        'türkçe', 'podcast', 'haber', 'gündem', 'felsefe', 'psikoloji', 
        'teknoloji', 'bilim', 'tarih', 'sohbet', 'müzik', 'spor', 
        'mizah', 'ekonomi', 'sanat'
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
            headers: { 'User-Agent': 'GlobalRadioWeb/1.0 (Mozilla/5.0)' }
          });

          if (response.ok) {
            const data = await response.json() as { results?: any[] };
            if (data.results && Array.isArray(data.results)) {
              for (const item of data.results) {
                if (item.feedUrl && item.collectionName && item.collectionId) {
                  const key = `itunes-${item.collectionId}`;
                  if (!resultsMap.has(key)) {
                    const releaseDateStr = item.releaseDate || '';
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
                      description: `${item.artistName || 'Yayıncı'} - ${item.primaryGenreName || 'Türkçe'} podcast serisi.`,
                      releaseDate: releaseDateStr,
                      releaseDateMillis: releaseDateMillis
                    });
                  }
                }
              }
            }
          }
        } catch {
          // ignore term failure
        }
      })
    );

    const podcasts = Array.from(resultsMap.values());
    podcasts.sort((a, b) => (b.releaseDateMillis || 0) - (a.releaseDateMillis || 0));

    setToCache(cacheKey, podcasts, 30 * 60 * 1000);
    return res.setHeader('Content-Type', 'application/json').json(podcasts);
  } catch {
    return res.status(502).json({ error: 'Podcast search failed' });
  }
}
