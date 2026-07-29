import { AppSettings, Playlist, RadioStation, RecentlyPlayedItem, PlayableItem } from '../types';

const FAVORITES_KEY = 'radyo_dunyasi_favorites_v1';
const RECENTLY_PLAYED_KEY = 'radyo_dunyasi_recent_v1';
const PLAYLISTS_KEY = 'radyo_dunyasi_playlists_v1';
const SETTINGS_KEY = 'radyo_dunyasi_settings_v1';
export interface PodcastProgressEntry {
  timeSeconds: number;
  durationSeconds?: number;
  completed?: boolean;
  updatedAt?: number;
}

const PODCAST_PROGRESS_KEY = 'radyo_dunyasi_podcast_progress_v1';
const LAST_ITEM_KEY = 'radyo_dunyasi_last_item_v1';

export function getAllPodcastProgress(): Record<string, PodcastProgressEntry> {
  try {
    const raw = localStorage.getItem(PODCAST_PROGRESS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const result: Record<string, PodcastProgressEntry> = {};
    for (const id in parsed) {
      const val = parsed[id];
      if (typeof val === 'number') {
        result[id] = { timeSeconds: val, completed: false };
      } else if (val && typeof val === 'object') {
        result[id] = {
          timeSeconds: Number(val.timeSeconds || val.time || 0),
          durationSeconds: val.durationSeconds ? Number(val.durationSeconds) : undefined,
          completed: Boolean(val.completed),
          updatedAt: val.updatedAt ? Number(val.updatedAt) : undefined
        };
      }
    }
    return result;
  } catch {
    return {};
  }
}

export function getPodcastProgress(episodeId: string): number {
  const all = getAllPodcastProgress();
  return all[episodeId]?.timeSeconds || 0;
}

export function getPodcastProgressEntry(episodeId: string): PodcastProgressEntry | null {
  const all = getAllPodcastProgress();
  return all[episodeId] || null;
}

export function savePodcastProgress(
  episodeId: string,
  timeSeconds: number,
  durationSeconds?: number,
  completed?: boolean
): void {
  try {
    const all = getAllPodcastProgress();
    const existing = all[episodeId] || { timeSeconds: 0 };
    const dur = durationSeconds && durationSeconds > 0 ? durationSeconds : existing.durationSeconds;

    // Auto mark completed if passed or played >= 92% of duration
    const isCompleted = completed !== undefined
      ? completed
      : (dur && dur > 0 ? timeSeconds >= dur * 0.92 : false);

    all[episodeId] = {
      timeSeconds: Math.max(0, timeSeconds),
      durationSeconds: dur,
      completed: isCompleted,
      updatedAt: Date.now()
    };

    localStorage.setItem(PODCAST_PROGRESS_KEY, JSON.stringify(all));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('podcastProgressChanged', {
        detail: { episodeId, entry: all[episodeId] }
      }));
    }
  } catch (err) {
    console.error('Failed to save podcast progress', err);
  }
}

export function markPodcastEpisodeCompleted(episodeId: string, completed: boolean, durationSeconds?: number): void {
  const all = getAllPodcastProgress();
  const existing = all[episodeId] || { timeSeconds: 0 };
  const dur = durationSeconds || existing.durationSeconds || 0;

  savePodcastProgress(
    episodeId,
    completed ? (dur > 0 ? dur : 99999) : 0,
    dur,
    completed
  );
}

export function clearPodcastProgress(episodeId?: string): void {
  try {
    if (episodeId) {
      const all = getAllPodcastProgress();
      delete all[episodeId];
      localStorage.setItem(PODCAST_PROGRESS_KEY, JSON.stringify(all));
    } else {
      localStorage.removeItem(PODCAST_PROGRESS_KEY);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('podcastProgressChanged', { detail: {} }));
    }
  } catch (err) {
    console.error('Failed to clear podcast progress', err);
  }
}

export const DEFAULT_SETTINGS: AppSettings = {
  themeMode: 'dark',
  themePalette: 'pure-carbon',
  lowDataMode: false,
  defaultCountry: 'TR',
  autoPlayLastStation: false,
  volume: 0.8
};

export function getStoredFavorites(): RadioStation[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveFavorites(favorites: RadioStation[]): void {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (err) {
    console.error('Failed to save favorites to localStorage', err);
  }
}

export function toggleFavoriteStation(station: RadioStation): RadioStation[] {
  const favorites = getStoredFavorites();
  const stationId = station.id || station.stationuuid;
  const exists = favorites.some(s => (s.id || s.stationuuid) === stationId);
  
  let updated: RadioStation[];
  if (exists) {
    updated = favorites.filter(s => (s.id || s.stationuuid) !== stationId);
  } else {
    updated = [station, ...favorites];
  }
  
  saveFavorites(updated);
  return updated;
}

export function getRecentlyPlayed(): RecentlyPlayedItem[] {
  try {
    const raw = localStorage.getItem(RECENTLY_PLAYED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addRecentlyPlayed(item: PlayableItem): RecentlyPlayedItem[] {
  try {
    const list = getRecentlyPlayed();
    let newItem: RecentlyPlayedItem | null = null;

    if (item.type === 'radio' && item.radio) {
      const id = item.radio.id || item.radio.stationuuid;
      newItem = {
        id: `radio-${id}`,
        type: 'radio',
        title: item.radio.name,
        subtitle: item.radio.tags ? item.radio.tags.split(',')[0] : (item.radio.country || 'Canlı Radyo'),
        coverUrl: item.radio.favicon || '',
        playedAt: Date.now(),
        radioStation: item.radio
      };
    } else if (item.type === 'podcast' && item.podcastEpisode) {
      newItem = {
        id: `podcast-${item.podcastEpisode.id}`,
        type: 'podcast',
        title: item.podcastEpisode.title,
        subtitle: item.podcastEpisode.showTitle,
        coverUrl: item.podcastEpisode.coverUrl || '',
        playedAt: Date.now(),
        podcastEpisode: item.podcastEpisode
      };
    } else if (item.type === 'audiobook' && item.audiobookTrack) {
      newItem = {
        id: `audiobook-${item.audiobookTrack.track.id}`,
        type: 'audiobook',
        title: item.audiobookTrack.track.title,
        subtitle: item.audiobookTrack.book.title,
        coverUrl: item.audiobookTrack.book.cover || '',
        playedAt: Date.now(),
        audiobookTrack: item.audiobookTrack
      };
    }

    if (!newItem) return list;

    // Filter out existing record with same ID to avoid duplicates
    const filtered = list.filter(r => r.id !== newItem!.id);
    const updated = [newItem, ...filtered].slice(0, 50); // Keep max 50 items

    localStorage.setItem(RECENTLY_PLAYED_KEY, JSON.stringify(updated));
    saveLastPlayedItem(item);
    return updated;
  } catch (err) {
    console.error('Failed to save recently played item:', err);
    return getRecentlyPlayed();
  }
}

export function saveLastPlayedItem(item: PlayableItem): void {
  try {
    localStorage.setItem(LAST_ITEM_KEY, JSON.stringify(item));
  } catch (err) {
    console.error('Failed to save last item', err);
  }
}

export function getLastPlayedItem(): PlayableItem | null {
  try {
    const raw = localStorage.getItem(LAST_ITEM_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getStoredPlaylists(): Playlist[] {
  try {
    const raw = localStorage.getItem(PLAYLISTS_KEY);
    if (!raw) {
      const initial: Playlist[] = [
        {
          id: 'p-favorites',
          name: 'Favori İstasyonlarım',
          description: 'Sık dinlediğim radyolar',
          createdAt: Date.now(),
          stationUuids: []
        },
        {
          id: 'p-night',
          name: 'Gece & Slow',
          description: 'Gece saatlerinde sakin ve huzurlu müzikler',
          createdAt: Date.now(),
          stationUuids: []
        }
      ];
      localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function savePlaylists(playlists: Playlist[]): void {
  try {
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
  } catch (err) {
    console.error('Failed to save playlists', err);
  }
}

export function getStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings', err);
  }
}
