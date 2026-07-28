import { CuratedTurkishPodcast } from '../../data/curatedTurkishPodcasts';
import { PodcastIndexItem } from './podcastIndexClient';
import { ApplePodcastItem } from './applePodcastClient';
import { calculateTurkishConfidence, isTurkishPodcast } from './turkishLanguageVerifier';

export interface WebPodcast {
  id: string;
  podcastIndexId?: number;
  appleCollectionId?: number;
  title: string;
  author: string;
  description: string;
  feedUrl: string;
  normalizedFeedUrl: string;
  image: string;
  website?: string;
  language: string;
  categories: string[];
  latestEpisodeDate?: string;
  releaseDateMillis?: number;
  episodeCount?: number;
  source: 'curated' | 'podcast-index' | 'apple' | 'merged';
  sources: string[];
  turkishConfidence: number;
}

export function normalizeFeedUrl(urlStr: string): string {
  if (!urlStr) return '';
  try {
    const parsed = new URL(urlStr.trim());
    const host = parsed.hostname.toLowerCase();
    let pathname = parsed.pathname.replace(/\/+$/, '');
    if (!pathname) pathname = '/';
    return `${host}${pathname}`.toLowerCase();
  } catch {
    return urlStr.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '');
  }
}

export function buildUnifiedPodcastCatalog(
  curatedList: CuratedTurkishPodcast[],
  podcastIndexItems: PodcastIndexItem[],
  appleItems: ApplePodcastItem[]
): WebPodcast[] {
  const catalogMap = new Map<string, WebPodcast>();

  // 1. Ingest Curated Podcasts
  for (const c of curatedList) {
    if (!c.enabled || !c.feedUrl) continue;
    const normFeed = normalizeFeedUrl(c.feedUrl);
    const podcastId = `curated-${c.id}`;

    const podcastObj: WebPodcast = {
      id: podcastId,
      title: c.title,
      author: c.publisher || 'Yayıncı',
      description: c.description || '',
      feedUrl: c.feedUrl,
      normalizedFeedUrl: normFeed,
      image: c.coverUrl,
      language: c.language || 'tr',
      categories: [c.category || 'Podcast'],
      source: 'curated',
      sources: ['curated'],
      turkishConfidence: 1.0,
      releaseDateMillis: Date.now()
    };

    catalogMap.set(normFeed, podcastObj);
  }

  // 2. Ingest Podcast Index Items
  for (const p of podcastIndexItems) {
    if (!p.url) continue;
    const normFeed = normalizeFeedUrl(p.url);

    let categoryList: string[] = [];
    if (p.categories) {
      if (Array.isArray(p.categories)) {
        categoryList = p.categories;
      } else if (typeof p.categories === 'object') {
        categoryList = Object.values(p.categories);
      }
    }
    if (categoryList.length === 0) categoryList = ['Podcast'];

    const confidence = calculateTurkishConfidence({
      language: p.language,
      title: p.title,
      description: p.description,
      publisher: p.author
    });

    if (confidence < 0.35) continue;

    const existing = catalogMap.get(normFeed);
    if (existing) {
      existing.podcastIndexId = p.id;
      if (!existing.sources.includes('podcast-index')) existing.sources.push('podcast-index');
      if (existing.source !== 'curated') existing.source = 'merged';
      if (!existing.description && p.description) existing.description = p.description;
      if (p.episodeCount && p.episodeCount > (existing.episodeCount || 0)) existing.episodeCount = p.episodeCount;
      if (p.newestItemPubdate) {
        const millis = p.newestItemPubdate * 1000;
        if (millis > (existing.releaseDateMillis || 0)) existing.releaseDateMillis = millis;
      }
      if (p.itunesId) existing.appleCollectionId = p.itunesId;
    } else {
      const podcastObj: WebPodcast = {
        id: `pi-${p.id}`,
        podcastIndexId: p.id,
        appleCollectionId: p.itunesId,
        title: p.title || 'Podcast',
        author: p.author || 'Yayıncı',
        description: p.description || '',
        feedUrl: p.url,
        normalizedFeedUrl: normFeed,
        image: p.artwork || p.image || '',
        website: p.link || '',
        language: p.language || 'tr',
        categories: categoryList,
        episodeCount: p.episodeCount || 0,
        releaseDateMillis: p.newestItemPubdate ? p.newestItemPubdate * 1000 : Date.now(),
        source: 'podcast-index',
        sources: ['podcast-index'],
        turkishConfidence: confidence
      };
      catalogMap.set(normFeed, podcastObj);
    }
  }

  // 3. Ingest Apple Items
  for (const a of appleItems) {
    if (!a.feedUrl) continue;
    const normFeed = normalizeFeedUrl(a.feedUrl);

    const confidence = calculateTurkishConfidence({
      country: a.country,
      title: a.collectionName,
      publisher: a.artistName
    });

    if (confidence < 0.35) continue;

    let releaseMillis = 0;
    if (a.releaseDate) {
      const d = new Date(a.releaseDate);
      if (!isNaN(d.getTime())) releaseMillis = d.getTime();
    }

    const existing = catalogMap.get(normFeed);
    if (existing) {
      existing.appleCollectionId = a.collectionId;
      if (!existing.sources.includes('apple')) existing.sources.push('apple');
      if (existing.source !== 'curated') existing.source = 'merged';
      if (!existing.image && a.artworkUrl600) existing.image = a.artworkUrl600;
      if (releaseMillis > (existing.releaseDateMillis || 0)) existing.releaseDateMillis = releaseMillis;
      if (a.trackCount && a.trackCount > (existing.episodeCount || 0)) existing.episodeCount = a.trackCount;
    } else {
      const podcastObj: WebPodcast = {
        id: `apple-${a.collectionId}`,
        appleCollectionId: a.collectionId,
        title: a.collectionName || 'Podcast',
        author: a.artistName || 'Yayıncı',
        description: `${a.artistName || 'Yayıncı'} - ${a.primaryGenreName || 'Türkçe'} podcast serisi.`,
        feedUrl: a.feedUrl,
        normalizedFeedUrl: normFeed,
        image: a.artworkUrl600 || a.artworkUrl100 || '',
        website: a.collectionViewUrl || '',
        language: 'tr',
        categories: [a.primaryGenreName || 'Podcast'],
        episodeCount: a.trackCount || 0,
        releaseDateMillis: releaseMillis || Date.now(),
        source: 'apple',
        sources: ['apple'],
        turkishConfidence: confidence
      };
      catalogMap.set(normFeed, podcastObj);
    }
  }

  const resultList = Array.from(catalogMap.values());

  // Filter with Turkish language verifier
  const turkishVerified = resultList.filter(item => isTurkishPodcast({
    language: item.language,
    title: item.title,
    description: item.description,
    publisher: item.author,
    isCurated: item.sources.includes('curated')
  }));

  // Sort newest episode release first
  turkishVerified.sort((a, b) => (b.releaseDateMillis || 0) - (a.releaseDateMillis || 0));

  return turkishVerified;
}
