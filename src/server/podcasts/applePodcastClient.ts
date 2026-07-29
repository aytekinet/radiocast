export interface ApplePodcastItem {
  collectionId: number;
  collectionName: string;
  artistName?: string;
  feedUrl: string;
  artworkUrl600?: string;
  artworkUrl100?: string;
  artworkUrl60?: string;
  collectionViewUrl?: string;
  trackCount?: number;
  primaryGenreName?: string;
  country?: string;
  releaseDate?: string;
}

export const TURKISH_SEARCH_KEYWORDS = [
  'felsefe', 'haber', 'gündem', 'teknoloji', 'bilim', 'psikoloji', 'tarih',
  'mizah', 'ekonomi', 'spor', 'sanat', 'edebiyat', 'müzik', 'bilişim',
  'eğitim', 'finans', 'girişimcilik', 'sinema', 'dizi', 'sağlık', 'yaşam',
  'kişisel gelişim', 'oyun', 'çocuk', 'ebeveyn', 'futbol', 'türkçe', 'türkiye',
  'kripto', 'podcast', 'sohbet', 'kültür', 'hikaye'
];

export async function fetchApplePodcastsByKeyword(keyword: string, country = 'TR', limit = 100): Promise<ApplePodcastItem[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const url = `https://itunes.apple.com/search?media=podcast&entity=podcast&country=${encodeURIComponent(country)}&limit=${limit}&term=${encodeURIComponent(keyword)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'RadioCastLive/1.0 (+https://radiocastlive.vercel.app)',
        'Accept': 'application/json'
      },
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.results)) {
        return data.results
          .filter((item: any) => typeof item.feedUrl === 'string' && item.feedUrl.trim().length > 0 && item.collectionName)
          .map((item: any) => ({
            collectionId: item.collectionId,
            collectionName: item.collectionName.trim(),
            artistName: (item.artistName || 'Yayıncı').trim(),
            feedUrl: item.feedUrl.trim(),
            artworkUrl600: item.artworkUrl600 || item.artworkUrl100 || item.artworkUrl60 || '',
            artworkUrl100: item.artworkUrl100 || '',
            artworkUrl60: item.artworkUrl60 || '',
            collectionViewUrl: item.collectionViewUrl || '',
            trackCount: item.trackCount || 0,
            primaryGenreName: item.primaryGenreName || 'Podcast',
            country: item.country || country,
            releaseDate: item.releaseDate || ''
          }));
      }
    }
  } catch (err) {
    // Timeout or network error, silently continue
  }
  return [];
}

export async function fetchMultiKeywordApplePodcasts(keywords: string[] = TURKISH_SEARCH_KEYWORDS, country = 'TR'): Promise<ApplePodcastItem[]> {
  const itemsMap = new Map<string, ApplePodcastItem>();

  // Process in batches of 6 to prevent overwhelming network sockets or hitting serverless timeouts
  const BATCH_SIZE = 6;
  for (let i = 0; i < keywords.length; i += BATCH_SIZE) {
    const batch = keywords.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map(kw => fetchApplePodcastsByKeyword(kw, country, 100))
    );

    for (const res of results) {
      if (res.status === 'fulfilled' && Array.isArray(res.value)) {
        for (const item of res.value) {
          const normFeed = item.feedUrl.toLowerCase().trim();
          if (!itemsMap.has(normFeed)) {
            itemsMap.set(normFeed, item);
          }
        }
      }
    }
  }

  return Array.from(itemsMap.values());
}
