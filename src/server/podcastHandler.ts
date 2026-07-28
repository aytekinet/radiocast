import type { Request, Response } from 'express';
import { getFromCache, setToCache } from './cache';
import { fetchAndParsePodcastRss } from './rssParser';
import { queryPodcastCatalogPage, getOrBuildPodcastCatalog } from './podcasts/podcastCatalogService';

export async function handlePodcastCatalog(req: Request, res: Response) {
  const limit = parseInt(req.query.limit as string || '50', 10);
  const offset = parseInt(req.query.offset as string || '0', 10);
  const category = (req.query.category as string || 'all').trim();
  const q = (req.query.q as string || '').trim();

  try {
    const result = await queryPodcastCatalogPage({ limit, offset, category, query: q });
    res.setHeader('Content-Type', 'application/json');
    return res.json({
      success: true,
      items: result.items,
      count: result.items.length,
      total: result.total,
      limit: result.limit,
      offset: result.offset,
      hasMore: result.hasMore
    });
  } catch (err) {
    console.error('[podcast-catalog:error]', err);
    return res.status(500).json({ success: false, error: 'Catalog retrieval failed' });
  }
}

export async function handlePodcastTrending(req: Request, res: Response) {
  try {
    const catalog = await getOrBuildPodcastCatalog();
    const trending = catalog.slice(0, 30);
    res.setHeader('Content-Type', 'application/json');
    return res.json({
      success: true,
      items: trending,
      total: trending.length
    });
  } catch {
    return res.status(500).json({ success: false, error: 'Trending fetch failed' });
  }
}

export async function handlePodcastRecent(req: Request, res: Response) {
  try {
    const catalog = await getOrBuildPodcastCatalog();
    const sortedByDate = [...catalog].sort((a, b) => (b.releaseDateMillis || 0) - (a.releaseDateMillis || 0));
    const recent = sortedByDate.slice(0, 30);
    res.setHeader('Content-Type', 'application/json');
    return res.json({
      success: true,
      items: recent,
      total: recent.length
    });
  } catch {
    return res.status(500).json({ success: false, error: 'Recent fetch failed' });
  }
}

export async function handlePodcastFeed(req: Request, res: Response) {
  let rawUrl = (req.query.url as string || req.query.feedUrl as string || '').trim();

  // Handle double-encoding if needed
  if (rawUrl.includes('%253A') || rawUrl.includes('%252F')) {
    try {
      rawUrl = decodeURIComponent(rawUrl);
    } catch {}
  }

  if (!rawUrl) {
    console.error('[podcast-feed:error]', { requestId: Date.now(), errorCode: 'MISSING_FEED_URL' });
    return res.status(400).json({
      success: false,
      podcast: null,
      episodes: [],
      count: 0,
      errorCode: 'MISSING_FEED_URL'
    });
  }

  let hostname = '';
  try {
    hostname = new URL(rawUrl).hostname;
  } catch {}

  const requestId = Date.now();
  console.info('[podcast-feed:start]', { requestId, hostname });

  const cacheKey = `podcast_feed_v3_${encodeURIComponent(rawUrl)}`;
  const cached = getFromCache<any>(cacheKey);
  if (cached) {
    res.setHeader('Content-Type', 'application/json');
    return res.json(cached);
  }

  const result = await fetchAndParsePodcastRss(rawUrl);

  if (result.success) {
    console.info('[podcast-feed:parsed]', {
      requestId,
      rawItemCount: result.diagnostics?.totalItems || 0,
      validEpisodeCount: result.count,
      parseFormat: result.diagnostics?.parseFormat || 'unknown'
    });
    setToCache(cacheKey, result, 15 * 60 * 1000);
  } else {
    console.error('[podcast-feed:error]', {
      requestId,
      errorCode: result.errorCode || 'UNKNOWN_ERROR',
      durationMs: result.diagnostics?.fetchDurationMs || 0,
      hostname
    });
    setToCache(cacheKey, result, 1 * 60 * 1000);
  }

  res.setHeader('Content-Type', 'application/json');
  return res.json(result);
}

export async function handlePodcastSearch(req: Request, res: Response) {
  const q = (req.query.q as string || '').trim();
  const category = (req.query.category as string || 'all').trim();
  const limit = parseInt(req.query.limit as string || '50', 10);
  const offset = parseInt(req.query.offset as string || '0', 10);

  try {
    const result = await queryPodcastCatalogPage({ limit, offset, category, query: q });
    res.setHeader('Content-Type', 'application/json');
    
    // Return array or object based on client format support
    const legacyArray = result.items.map(item => ({
      id: item.id,
      title: item.title,
      publisher: item.author,
      coverUrl: item.image,
      category: item.categories[0] || 'Podcast',
      description: item.description,
      feedUrl: item.feedUrl,
      releaseDateMillis: item.releaseDateMillis || 0
    }));

    return res.json(legacyArray);
  } catch {
    return res.status(502).json({ error: 'Podcast search failed' });
  }
}

export async function handlePodcastRefresh(req: Request, res: Response) {
  const authHeader = req.headers.authorization || '';
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ success: false, error: 'Unauthorized cron trigger' });
  }

  try {
    const freshCatalog = await getOrBuildPodcastCatalog(true);
    return res.json({
      success: true,
      message: 'Podcast catalog refreshed successfully',
      totalPodcasts: freshCatalog.length,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Catalog refresh failed' });
  }
}
