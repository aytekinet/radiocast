import { AppSettings, Playlist, RadioStation, RecentlyPlayedItem, PlayableItem } from '../types';

const FAVORITES_KEY = 'radyo_dunyasi_favorites_v1';
const RECENTLY_PLAYED_KEY = 'radyo_dunyasi_recent_v1';
const PLAYLISTS_KEY = 'radyo_dunyasi_playlists_v1';
const SETTINGS_KEY = 'radyo_dunyasi_settings_v1';
const PODCAST_PROGRESS_KEY = 'radyo_dunyasi_podcast_progress_v1';
const LAST_ITEM_KEY = 'radyo_dunyasi_last_item_v1';

export function getPodcastProgress(episodeId: string): number {
  try {
    const raw = localStorage.getItem(PODCAST_PROGRESS_KEY);
    if (!raw) return 0;
    const progressMap = JSON.parse(raw);
    return progressMap[episodeId] || 0;
  } catch {
    return 0;
  }
}

export function savePodcastProgress(episodeId: string, timeSeconds: number): void {
  try {
    const raw = localStorage.getItem(PODCAST_PROGRESS_KEY);
    const progressMap = raw ? JSON.parse(raw) : {};
    progressMap[episodeId] = timeSeconds;
    localStorage.setItem(PODCAST_PROGRESS_KEY, JSON.stringify(progressMap));
  } catch (err) {
    console.error('Failed to save podcast progress', err);
  }
}

export function getAllPodcastProgress(): Record<string, number> {
  try {
    const raw = localStorage.getItem(PODCAST_PROGRESS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
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
