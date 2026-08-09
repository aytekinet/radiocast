import { CURATED_TURKISH_PODCASTS } from '../../data/curatedTurkishPodcasts';
import { fetchPodcastIndexTrending, fetchPodcastIndexRecent, searchPodcastIndexByTerm } from './podcastIndexClient';
import { fetchMultiKeywordApplePodcasts, fetchApplePodcastsByKeyword } from './applePodcastClient';
import { buildUnifiedPodcastCatalog, WebPodcast } from './podcastDeduplicator';
import { getFromCache, setToCache } from '../cache';

let globalCatalogMemory: WebPodcast[] = [];
let lastCatalogBuildTime = 0;
const CATALOG_REBUILD_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

export async function getOrBuildPodcastCatalog(forceRefresh = false): Promise<WebPodcast[]> {
  const now = Date.now();
  if (!forceRefresh && globalCatalogMemory.length > 0 && (now - lastCatalogBuildTime) < CATALOG_REBUILD_INTERVAL_MS) {
    return globalCatalogMemory;
  }

  const cached = getFromCache<WebPodcast[]>('podcast_global_catalog_v3');
  if (!forceRefresh && cached && Array.isArray(cached) && cached.length > 0) {
    globalCatalogMemory = cached;
    lastCatalogBuildTime = now;
    return globalCatalogMemory;
  }

  console.info('[podcast-catalog] Building multi-source Turkish podcast catalog...');

  const [piTrending, piRecent, appleItems] = await Promise.allSettled([
    fetchPodcastIndexTrending('tr', 100),
    fetchPodcastIndexRecent('tr', 100),
    fetchMultiKeywordApplePodcasts()
  ]);

  const piTrendingList = piTrending.status === 'fulfilled' ? piTrending.value : [];
  const piRecentList = piRecent.status === 'fulfilled' ? piRecent.value : [];
  const appleList = appleItems.status === 'fulfilled' ? appleItems.value : [];

  const combinedPiItems = [...piTrendingList, ...piRecentList];

  const unifiedCatalog = buildUnifiedPodcastCatalog(
    CURATED_TURKISH_PODCASTS,
    combinedPiItems,
    appleList
  );

  globalCatalogMemory = unifiedCatalog;
  lastCatalogBuildTime = now;

  setToCache('podcast_global_catalog_v3', globalCatalogMemory, CATALOG_REBUILD_INTERVAL_MS);
  console.info(`[podcast-catalog] Catalog ready with ${globalCatalogMemory.length} Turkish podcasts.`);

  return globalCatalogMemory;
}

export async function queryPodcastCatalogPage(options: {
  limit?: number;
  offset?: number;
  category?: string;
  query?: string;
}): Promise<{
  items: WebPodcast[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}> {
  const limit = Math.max(1, Math.min(100, options.limit || 50));
  const offset = Math.max(0, options.offset || 0);
  const category = (options.category || 'all').toLowerCase().trim();
  const searchQ = (options.query || '').toLowerCase().trim();

  let fullCatalog = await getOrBuildPodcastCatalog();

  // If search query provided and yields low results in catalog, query remote sources dynamically!
  if (searchQ && searchQ !== 'podcast' && searchQ !== 'popular') {
    const localFiltered = fullCatalog.filter(p =>
      p.title.toLowerCase().includes(searchQ) ||
      p.author.toLowerCase().includes(searchQ) ||
      p.description.toLowerCase().includes(searchQ) ||
      p.categories.some(c => c.toLowerCase().includes(searchQ))
    );

    if (localFiltered.length < 15) {
      // Live dynamic query expansion
      const [remotePi, remoteApple] = await Promise.allSettled([
        searchPodcastIndexByTerm(searchQ, 'tr', 50),
        fetchApplePodcastsByKeyword(searchQ, 'TR', 50)
      ]);

      const piHits = remotePi.status === 'fulfilled' ? remotePi.value : [];
      const appleHits = remoteApple.status === 'fulfilled' ? remoteApple.value : [];

      if (piHits.length > 0 || appleHits.length > 0) {
        const liveCatalog = buildUnifiedPodcastCatalog([], piHits, appleHits);
        
        // Merge into global memory
        const existingNorms = new Set(fullCatalog.map(x => x.normalizedFeedUrl));
        for (const item of liveCatalog) {
          if (!existingNorms.has(item.normalizedFeedUrl)) {
            existingNorms.add(item.normalizedFeedUrl);
            fullCatalog.push(item);
          }
        }
      }
    }
  }

  // Category filtering
  let filtered = fullCatalog;

  if (category && category !== 'all') {
    filtered = filtered.filter(p => {
      const catsStr = p.categories.join(' ').toLowerCase();
      if (category === 'haber') return catsStr.includes('haber') || catsStr.includes('gündem') || catsStr.includes('news');
      if (category === 'felsefe') return catsStr.includes('felsefe') || catsStr.includes('kültür') || catsStr.includes('philosophy');
      if (category === 'mizah') return catsStr.includes('mizah') || catsStr.includes('eğlence') || catsStr.includes('comedy');
      if (category === 'teknoloji') return catsStr.includes('teknoloji') || catsStr.includes('bilim') || catsStr.includes('tech') || catsStr.includes('science');
      if (category === 'psikoloji') return catsStr.includes('psikoloji') || catsStr.includes('yaşam') || catsStr.includes('insan') || catsStr.includes('health');
      if (category === 'tarih') return catsStr.includes('tarih') || catsStr.includes('hikaye') || catsStr.includes('history');
      if (category === 'ekonomi') return catsStr.includes('ekonomi') || catsStr.includes('iş') || catsStr.includes('finans') || catsStr.includes('business');
      if (category === 'spor') return catsStr.includes('spor') || catsStr.includes('sports');
      if (category === 'sanat') return catsStr.includes('sanat') || catsStr.includes('edebiyat') || catsStr.includes('arts');
      return catsStr.includes(category);
    });
  }

  // Text query filtering
  if (searchQ && searchQ !== 'podcast' && searchQ !== 'popular') {
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(searchQ) ||
      p.author.toLowerCase().includes(searchQ) ||
      p.description.toLowerCase().includes(searchQ) ||
      p.categories.some(c => c.toLowerCase().includes(searchQ))
    );
  }

  // Sort strictly by recency / release date descending (newest first)
  filtered.sort((a, b) => (b.releaseDateMillis || 0) - (a.releaseDateMillis || 0));

  const total = filtered.length;
  const pagedItems = filtered.slice(offset, offset + limit);
  const hasMore = (offset + limit) < total;

  return {
    items: pagedItems,
    total,
    limit,
    offset,
    hasMore
  };
}
