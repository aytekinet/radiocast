export interface RadioStation {
  id?: string; // stationuuid
  stationuuid: string;
  name: string;
  playUrl?: string;
  streamUrl?: string; // url_resolved || url
  fallbackUrl?: string | null;
  url: string;
  url_resolved: string;
  homepage: string;
  favicon: string;
  tags: string;
  country: string;
  countrycode: string;
  countryCode?: string;
  state?: string;
  language: string;
  votes: number;
  codec: string;
  bitrate: number;
  hls?: boolean | number;
  clickcount?: number;
  clickCount?: number;
  lastcheckok?: number;
  lastCheckOk?: boolean;
  sslError?: number;
  isHttps?: boolean;
}

export interface RadioCountry {
  code: string; // ISO code (e.g., 'TR')
  name: string; // Turkish/Localized display name
  stationCount: number;
  iso_3166_1?: string;
  stationcount?: number;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  stationUuids: string[];
}

export type ThemePalette = 'pure-carbon' | 'neon-ocean' | 'cyber-orchid' | 'cosmic-slate';
export type AppThemeMode = 'dark' | 'light';

export interface AppSettings {
  themeMode: AppThemeMode;
  themePalette: ThemePalette;
  lowDataMode: boolean;
  defaultCountry: string;
  autoPlayLastStation: boolean;
  volume: number;
}

export interface SleepTimerState {
  active: boolean;
  durationMinutes: number;
  remainingSeconds: number;
}

export interface GenreCategory {
  id: string;
  name: string;
  tag: string;
  tags?: string[];
  excludeKeywords?: string[];
  iconName: string;
  color: string;
}

export interface PodcastEpisode {
  id: string;
  showId: string;
  showTitle: string;
  title: string;
  description: string;
  audioUrl: string;
  durationSeconds: number;
  publishedDate: string;
  pubDateMillis?: number;
  coverUrl: string;
  category: string;
}

export interface PodcastShow {
  id: string;
  title: string;
  publisher: string;
  coverUrl: string;
  feedUrl?: string;
  category: string;
  description: string;
  episodes: PodcastEpisode[];
  episodeCount?: number;
  storeUrl?: string;
  releaseDate?: string;
  releaseDateMillis?: number;
}

export interface AudiobookTrack {
  id: string;
  sectionNumber: number;
  title: string;
  listenUrl: string;
  durationSeconds: number;
}

export interface Audiobook {
  id: string;
  title: string;
  description: string;
  language: string;
  authors: string;
  cover: string;
  totalTime: string;
  totalTimeSeconds: number;
  rssUrl?: string;
  librivoxUrl?: string;
  archiveUrl?: string;
  tracks?: AudiobookTrack[];
}

export type PlayableType = 'radio' | 'podcast' | 'audiobook';

export interface PlayableItem {
  type: PlayableType;
  radio?: RadioStation;
  podcastEpisode?: PodcastEpisode;
  audiobookTrack?: {
    book: Audiobook;
    track: AudiobookTrack;
  };
}

export interface RecentlyPlayedItem {
  id: string;
  type: PlayableType;
  title: string;
  subtitle: string;
  coverUrl: string;
  playedAt: number;
  radioStation?: RadioStation;
  podcastEpisode?: PodcastEpisode;
  audiobookTrack?: {
    book: Audiobook;
    track: AudiobookTrack;
  };
}
