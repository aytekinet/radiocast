import { RadioStation, RadioCountry } from '../types';
import { VERIFIED_TURKISH_STATIONS } from '../data/fallbackStations';
import { GENRE_CATEGORIES, matchesCategory } from '../constants/categories';

function normalizeName(name: string): string {
  if (!name) return '';
  const cleaned = name
    .toLowerCase()
    .replace(/[\(\)\[\]\{\}\-_,.\/\\|]/g, ' ')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/\b(fm|am|radio|radyo|stream|live|canli|official|online|hd|hq|hq1|mp3|aac|tr|turkey|turkiye)\b/g, '')
    .replace(/\s+/g, '')
    .trim();

  return cleaned.length >= 2 ? cleaned : name.toLowerCase().replace(/\s+/g, '').trim();
}

function deduplicateStationsByName(list: RadioStation[]): RadioStation[] {
  const seen = new Set<string>();
  const result: RadioStation[] = [];

  for (const item of list) {
    if (!item || !item.name) continue;
    const key = normalizeName(item.name);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }

  return result;
}

export async function getStationsByCountry(countryCode = 'TR', page = 1): Promise<RadioStation[]> {
  try {
    const res = await fetch(`/api/radio/stations?country=${encodeURIComponent(countryCode)}&page=${page}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        if (countryCode === 'TR' && page === 1) {
          const merged = [...VERIFIED_TURKISH_STATIONS, ...data];
          return deduplicateStationsByName(merged);
        }
        return deduplicateStationsByName(data);
      }
    }
  } catch (err) {
    console.warn('Radio API fetch warning, using verified fallback:', err);
  }

  if (countryCode === 'TR' && page === 1) {
    return deduplicateStationsByName(VERIFIED_TURKISH_STATIONS);
  }
  return [];
}

export async function searchStations(params: {
  q?: string;
  name?: string;
  tag?: string;
  language?: string;
  country?: string;
  countrycode?: string;
  page?: number;
}): Promise<RadioStation[]> {
  const query = (params.q || params.name || '').trim();
  const country = params.country || params.countrycode || '';
  const tag = params.tag || '';
  const language = params.language || '';
  const page = params.page || 1;

  try {
    const queryParams = new URLSearchParams({
      page: page.toString()
    });
    if (query) queryParams.set('q', query);
    if (country) queryParams.set('country', country);
    if (tag) queryParams.set('tag', tag);
    if (language) queryParams.set('language', language);

    const res = await fetch(`/api/radio/search?${queryParams.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return deduplicateStationsByName(data);
    }
  } catch (err) {
    console.warn('Radio search error:', err);
  }

  if ((!country || country === 'TR') && query) {
    return VERIFIED_TURKISH_STATIONS.filter(s =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.tags.toLowerCase().includes(query.toLowerCase())
    );
  }

  return [];
}

export async function getTopStationsByCountry(countryCode = 'TR', page = 1): Promise<RadioStation[]> {
  return getStationsByCountry(countryCode, page);
}

export async function getStationsByTag(categoryOrTag: string, countrycode = 'TR'): Promise<RadioStation[]> {
  const cat = GENRE_CATEGORIES.find(c => c.id === categoryOrTag || c.tag === categoryOrTag);
  const searchTags = cat?.tags && cat.tags.length > 0 ? cat.tags : [categoryOrTag];

  let aggregated: RadioStation[] = [];

  // Fetch stations for up to 3 associated tags in parallel
  await Promise.all(
    searchTags.slice(0, 3).map(async (tag) => {
      try {
        const list = await searchStations({ tag, country: countrycode, page: 1 });
        if (list.length > 0) {
          aggregated.push(...list);
        }
      } catch (e) {
        // ignore single tag query failure
      }
    })
  );

  // Merge with verified stations matching this category
  const verifiedMatches = VERIFIED_TURKISH_STATIONS.filter(s => matchesCategory(s, cat?.id || categoryOrTag));
  aggregated = [...verifiedMatches, ...aggregated];

  const result = deduplicateStationsByName(aggregated);
  if (result.length > 0) return result;

  // Fallback: if tag returned 0 results, return top country stations so page is never empty
  const countryStations = await getStationsByCountry(countrycode, 1);
  return countryStations;
}

export async function getCountries(): Promise<RadioCountry[]> {
  try {
    const res = await fetch('/api/radio/countries');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch countries:', err);
  }

  return [
    { code: 'TR', name: 'Türkiye', stationCount: 850 },
    { code: 'DE', name: 'Almanya', stationCount: 3000 },
    { code: 'US', name: 'Amerika Birleşik Devletleri', stationCount: 5000 },
    { code: 'GB', name: 'Birleşik Krallık', stationCount: 2200 },
    { code: 'FR', name: 'Fransa', stationCount: 1800 },
    { code: 'NL', name: 'Hollanda', stationCount: 1200 },
    { code: 'AZ', name: 'Azerbaycan', stationCount: 150 }
  ];
}

export async function getPopularTags(): Promise<{ name: string; stationCount: number }[]> {
  try {
    const res = await fetch('/api/radio/tags');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    console.warn('Failed to fetch tags:', err);
  }

  return [
    { name: 'pop', stationCount: 2500 },
    { name: 'news', stationCount: 1800 },
    { name: 'rock', stationCount: 1500 },
    { name: 'talk', stationCount: 1200 },
    { name: 'classical', stationCount: 900 },
    { name: 'jazz', stationCount: 800 },
    { name: 'folk', stationCount: 600 }
  ];
}

export async function registerStationClick(stationId: string): Promise<void> {
  if (!stationId) return;
  try {
    fetch('/api/radio/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stationId })
    }).catch(() => {});
  } catch {
    // Non-blocking fire-and-forget
  }
}
