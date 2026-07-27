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

export async function getPopularPodcasts(country = 'TR', page = 1): Promise<PodcastShow[]> {
  try {
    const res = await fetch(`/api/podcasts/search?q=podcast&country=${encodeURIComponent(country)}&page=${page}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.sort((a, b) => (b.releaseDateMillis || 0) - (a.releaseDateMillis || 0));
      }
    }
  } catch (err) {
    console.warn('Popular podcasts fetch warning:', err);
  }

  return FALLBACK_PODCAST_SHOWS;
}

export async function searchPodcasts(query: string, country = 'TR', page = 1): Promise<PodcastShow[]> {
  if (!query.trim()) return getPopularPodcasts(country, page);

  try {
    const res = await fetch(`/api/podcasts/search?q=${encodeURIComponent(query)}&country=${encodeURIComponent(country)}&page=${page}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.sort((a, b) => (b.releaseDateMillis || 0) - (a.releaseDateMillis || 0));
      }
    }
  } catch (err) {
    console.warn('Podcast search error:', err);
  }

  return FALLBACK_PODCAST_SHOWS.filter(p =>
    p.title.toLowerCase().includes(query.toLowerCase()) ||
    p.publisher.toLowerCase().includes(query.toLowerCase())
  );
}

export async function getPodcastEpisodes(show: PodcastShow): Promise<PodcastEpisode[]> {
  let episodes: PodcastEpisode[] = [];

  if (show.feedUrl) {
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
  }

  if (episodes.length === 0) {
    episodes = show.episodes && show.episodes.length > 0 ? show.episodes : generateFallbackEpisodes(show);
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

function generateFallbackEpisodes(show: PodcastShow): PodcastEpisode[] {
  return [
    {
      id: `${show.id}-ep1`,
      showId: show.id,
      showTitle: show.title,
      title: `${show.title} - Bölüm 1: Güncel Analizler ve Sohbet`,
      description: `${show.publisher} tarafından sunulan bu bölümde gündem, kültür ve yaşam üzerine derinlemesine değerlendirmeler.`,
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      durationSeconds: 372,
      publishedDate: '22 Temmuz 2026',
      pubDateMillis: new Date(2026, 6, 22).getTime(),
      coverUrl: show.coverUrl,
      category: show.category
    },
    {
      id: `${show.id}-ep2`,
      showId: show.id,
      showTitle: show.title,
      title: `${show.title} - Bölüm 2: Bilgi, Deneyim ve Yeni Yaklaşımlar`,
      description: 'Geleceğe dair vizyoner değerlendirmeler ve samimi sohbetler.',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      durationSeconds: 423,
      publishedDate: '15 Temmuz 2026',
      pubDateMillis: new Date(2026, 6, 15).getTime(),
      coverUrl: show.coverUrl,
      category: show.category
    },
    {
      id: `${show.id}-ep3`,
      showId: show.id,
      showTitle: show.title,
      title: `${show.title} - Bölüm 3: Soru-Cevap & Özel Söyleşi`,
      description: 'Dinleyicilerden gelen soruların yanıtlandığı özel bölüm.',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      durationSeconds: 344,
      publishedDate: '08 Temmuz 2026',
      pubDateMillis: new Date(2026, 6, 8).getTime(),
      coverUrl: show.coverUrl,
      category: show.category
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
