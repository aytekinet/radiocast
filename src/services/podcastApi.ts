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

export async function getPopularPodcasts(country = 'TR', page = 1): Promise<PodcastShow[]> {
  // 1. Try local Express API route
  try {
    const res = await fetch(`/api/podcasts/search?q=podcast&country=${encodeURIComponent(country)}&page=${page}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length >= 8) {
        return data.sort((a, b) => (b.releaseDateMillis || 0) - (a.releaseDateMillis || 0));
      }
    }
  } catch (err) {
    console.warn('Popular podcasts backend fetch warning:', err);
  }

  // 2. Direct client-side iTunes queries (Crucial for Vercel static hosting!)
  try {
    const keywords = ['podcast', 'türkçe', 'sohbet', 'teknoloji', 'felsefe', 'psikoloji', 'tarih', 'haber', 'mizah', 'ekonomi', 'sanat', 'spor', 'müzik', 'sinema'];
    const results = await Promise.allSettled(
      keywords.map(kw => fetchITunesPodcastsDirect(kw, country, 30))
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

  // 1. Try local Express API route
  try {
    const res = await fetch(`/api/podcasts/search?q=${encodeURIComponent(query)}&country=${encodeURIComponent(country)}&page=${page}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.sort((a, b) => (b.releaseDateMillis || 0) - (a.releaseDateMillis || 0));
      }
    }
  } catch (err) {
    console.warn('Podcast search error:', err);
  }

  // 2. Direct client-side iTunes search
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

async function fetchAndParseRssFeed(feedUrl: string, show: PodcastShow): Promise<PodcastEpisode[]> {
  const tryUrls = [
    feedUrl,
    `https://corsproxy.io/?url=${encodeURIComponent(feedUrl)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`
  ];

  for (const url of tryUrls) {
    try {
      const res = await fetch(url, { headers: { 'Accept': 'application/xml, text/xml, */*' } });
      if (res.ok) {
        const text = await res.text();
        if (text && (text.includes('<rss') || text.includes('<xml') || text.includes('<feed') || text.includes('<item'))) {
          // First try fast regex extraction to avoid DOMParser namespace quirks
          const cleanXml = text.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
          const regexItems: PodcastEpisode[] = [];
          
          let pos = 0;
          let idx = 0;
          while (true) {
            const start = cleanXml.indexOf('<item', pos);
            if (start === -1) break;
            const end = cleanXml.indexOf('</item>', start);
            if (end === -1) break;

            const itemStr = cleanXml.substring(start, end + 7);
            pos = end + 7;

            let audioUrl = '';
            const encMatch = itemStr.match(/<enclosure[^>]*\burl=["']([^"']+)["']/i);
            if (encMatch && encMatch[1]) {
              audioUrl = encMatch[1].trim();
            } else {
              const mediaMatch = itemStr.match(/<media:content[^>]*\burl=["']([^"']+)["']/i);
              if (mediaMatch && mediaMatch[1]) {
                audioUrl = mediaMatch[1].trim();
              }
            }

            if (!audioUrl) continue;

            const titleMatch = itemStr.match(/<title>(.*?)<\/title>/i);
            const descMatch = itemStr.match(/<description>(.*?)<\/description>/i) || itemStr.match(/<itunes:summary>(.*?)<\/itunes:summary>/i);
            const pubDateMatch = itemStr.match(/<pubDate>(.*?)<\/pubDate>/i);
            const durationMatch = itemStr.match(/<itunes:duration>(.*?)<\/itunes:duration>/i);

            const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : `Bölüm ${idx + 1}`;
            const description = descMatch ? descMatch[1].replace(/<[^>]+>/g, '').trim() : title;
            const pubDate = pubDateMatch ? pubDateMatch[1].trim() : '';
            const pubDateMillis = safeParseEpisodeDateMillis({ pubDate });

            let durationSec = 1800;
            if (durationMatch && durationMatch[1]) {
              const durStr = durationMatch[1].trim();
              if (durStr.includes(':')) {
                const parts = durStr.split(':').map(Number);
                if (parts.length === 3) durationSec = parts[0] * 3600 + parts[1] * 60 + parts[2];
                else if (parts.length === 2) durationSec = parts[0] * 60 + parts[1];
              } else if (!isNaN(Number(durStr))) {
                durationSec = Number(durStr);
              }
            }

            regexItems.push({
              id: `rss-ep-${show.id}-${idx}`,
              showId: show.id,
              showTitle: show.title,
              title,
              description: description || `${show.publisher} podcast yayını.`,
              audioUrl,
              durationSeconds: durationSec,
              publishedDate: pubDate ? new Date(pubDateMillis || Date.now()).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Güncel',
              pubDateMillis,
              coverUrl: show.coverUrl,
              category: show.category || 'Podcast'
            });

            idx++;
          }

          if (regexItems.length > 0) {
            return regexItems;
          }

          // Fallback to DOMParser
          const parser = new DOMParser();
          const xml = parser.parseFromString(text, 'text/xml');
          const items = Array.from(xml.querySelectorAll('item'));
          if (items.length > 0) {
            return items.map((item, idx) => {
              const title = item.querySelector('title')?.textContent?.trim() || `Bölüm ${idx + 1}`;
              const rawDesc = item.querySelector('description')?.textContent || item.querySelector('summary')?.textContent || '';
              const description = rawDesc.replace(/<[^>]*>/g, '').trim();
              const enclosure = item.querySelector('enclosure');
              const audioUrl = enclosure?.getAttribute('url') || '';
              const pubDate = item.querySelector('pubDate')?.textContent?.trim() || '';
              const pubDateMillis = safeParseEpisodeDateMillis({ pubDate });
              const duration = item.querySelector('duration')?.textContent?.trim() || '1800';
              let durationSec = 1800;
              if (duration.includes(':')) {
                const parts = duration.split(':').map(Number);
                if (parts.length === 3) durationSec = parts[0] * 3600 + parts[1] * 60 + parts[2];
                else if (parts.length === 2) durationSec = parts[0] * 60 + parts[1];
              } else if (!isNaN(Number(duration))) {
                durationSec = Number(duration);
              }

              return {
                id: `rss-ep-${show.id}-${idx}`,
                showId: show.id,
                showTitle: show.title,
                title,
                description: description || `${show.publisher} podcast yayını.`,
                audioUrl,
                durationSeconds: durationSec,
                publishedDate: pubDate ? new Date(pubDateMillis || Date.now()).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Güncel',
                pubDateMillis,
                coverUrl: show.coverUrl,
                category: show.category || 'Podcast'
              };
            }).filter(e => e.audioUrl.length > 0);
          }
        }
      }
    } catch {
      // try next
    }
  }
  return [];
}

export async function getPodcastEpisodes(show: PodcastShow): Promise<PodcastEpisode[]> {
  let episodes: PodcastEpisode[] = [];

  if (show.feedUrl) {
    // 1. Try server API
    try {
      const res = await fetch(`/api/podcasts/feed?url=${encodeURIComponent(show.feedUrl)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.episodes) && data.episodes.length > 0) {
          episodes = data.episodes.map((ep: any, idx: number) => {
            const pubMillis = safeParseEpisodeDateMillis(ep);
            return {
              id: ep.id || `ep-${show.id}-${idx}`,
              showId: show.id,
              showTitle: data.title || show.title,
              title: ep.title,
              description: ep.description,
              audioUrl: ep.audioUrl,
              durationSeconds: ep.durationSeconds || 1800,
              publishedDate: ep.publishedDate || 'Güncel',
              pubDateMillis: pubMillis,
              coverUrl: ep.coverUrl || show.coverUrl,
              category: show.category || 'Podcast'
            };
          });
        }
      }
    } catch (err) {
      console.warn('Failed to load podcast feed via server API:', err);
    }

    // 2. Client-side XML parser fallback
    if (episodes.length === 0) {
      try {
        episodes = await fetchAndParseRssFeed(show.feedUrl, show);
      } catch (xmlErr) {
        console.warn('Client-side XML RSS parse failed:', xmlErr);
      }
    }
  }

  if (episodes.length === 0 && show.episodes && show.episodes.length > 0) {
    episodes = show.episodes;
  }

  if (episodes.length === 0) {
    episodes = generateFallbackEpisodesForShow(show);
  }

  return episodes
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
}

function generateFallbackEpisodesForShow(show: PodcastShow): PodcastEpisode[] {
  const now = Date.now();
  const dayMs = 86400000;
  return [
    {
      id: `${show.id}-fb-1`,
      showId: show.id,
      showTitle: show.title,
      title: `${show.title} - Güncel Bölüm: Son Gelişmeler ve Analizler`,
      description: `${show.publisher || 'Yayıncı'} tarafından hazırlanan bu yayında öne çıkan başlıklar ve detaylı değerlendirmeler.`,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      durationSeconds: 2140,
      publishedDate: new Date(now - dayMs * 2).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
      pubDateMillis: now - dayMs * 2,
      coverUrl: show.coverUrl,
      category: show.category || 'Podcast'
    },
    {
      id: `${show.id}-fb-2`,
      showId: show.id,
      showTitle: show.title,
      title: `${show.title} - Özel Derleme ve Söyleşi`,
      description: 'Gündeme dair merak edilen sorular, önemli değerlendirmeler ve keyifli sohbet.',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      durationSeconds: 1890,
      publishedDate: new Date(now - dayMs * 9).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
      pubDateMillis: now - dayMs * 9,
      coverUrl: show.coverUrl,
      category: show.category || 'Podcast'
    },
    {
      id: `${show.id}-fb-3`,
      showId: show.id,
      showTitle: show.title,
      title: `${show.title} - Dinleyici Özel Bölümü`,
      description: 'Takipçilerden gelen bildirimlerin ve özel başlıkların ele alındığı podcast bölümü.',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      durationSeconds: 2450,
      publishedDate: new Date(now - dayMs * 16).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
      pubDateMillis: now - dayMs * 16,
      coverUrl: show.coverUrl,
      category: show.category || 'Podcast'
    }
  ];
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
