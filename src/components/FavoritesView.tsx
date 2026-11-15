import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Heart,
  Search,
  ArrowUpDown,
  Trash2,
  Radio,
  Mic,
  Headphones,
  Play,
  Pause,
  ChevronRight,
  Calendar,
  Clock,
  RefreshCw,
  ListPlus,
  Check,
  X
} from 'lucide-react';
import { Playlist, RadioStation, PodcastShow, PodcastEpisode } from '../types';
import { PlaybackStatus } from '../services/audioEngine';
import { isSyntheticPodcastStation } from '../services/storage';

interface FavoritesViewProps {
  favorites: RadioStation[];
  favoritePodcasts?: PodcastShow[];
  favoriteEpisodes?: PodcastEpisode[];
  currentStation: RadioStation | null;
  currentEpisodeId?: string | null;
  isPlaying: boolean;
  playbackStatus?: PlaybackStatus;
  onPlayStation: (station: RadioStation, queue?: RadioStation[]) => void;
  onPlayPodcastEpisode?: (episode: PodcastEpisode, episodes?: PodcastEpisode[]) => void;
  onToggleFavorite: (station: RadioStation) => void;
  onToggleFavoritePodcast?: (show: PodcastShow) => void;
  onToggleFavoriteEpisode?: (episode: PodcastEpisode) => void;
  playlists: Playlist[];
  onAddToPlaylist: (playlistId: string, stationUuid: string) => void;
  onClearAllFavorites: () => void;
  onOpenPodcastShow?: (show: PodcastShow) => void;
}

function getStationMonogram(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getBadgeStyle(name: string): string {
  const styles = [
    'bg-teal-950/80 border border-teal-500/40 text-teal-300',
    'bg-sky-950/80 border border-sky-500/40 text-sky-300',
    'bg-indigo-950/80 border border-indigo-500/40 text-indigo-300',
    'bg-purple-950/80 border border-purple-500/40 text-purple-300',
    'bg-rose-950/80 border border-rose-500/40 text-rose-300',
    'bg-amber-950/80 border border-amber-500/40 text-amber-300',
    'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return styles[Math.abs(hash) % styles.length];
}

const StationCardBadge: React.FC<{ station: RadioStation; isActive: boolean }> = ({ station, isActive }) => {
  const [imgError, setImgError] = useState(false);

  if (station.favicon && !imgError) {
    return (
      <div
        className={`w-11 h-11 rounded-xl shrink-0 overflow-hidden bg-slate-100 dark:bg-[#0D131A] border flex items-center justify-center shadow-sm ${
          isActive ? 'border-teal-500/60' : 'border-slate-200 dark:border-[#1F2937]'
        }`}
      >
        <img
          src={station.favicon}
          alt={station.name}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`w-11 h-11 rounded-xl shrink-0 flex items-center justify-center font-black text-[11px] shadow-sm tracking-tight text-center leading-tight px-1 ${getBadgeStyle(
        station.name
      )}`}
    >
      {getStationMonogram(station.name)}
    </div>
  );
};

export const FavoritesView: React.FC<FavoritesViewProps> = React.memo(({
  favorites,
  favoritePodcasts = [],
  favoriteEpisodes = [],
  currentStation,
  currentEpisodeId,
  isPlaying,
  playbackStatus,
  onPlayStation,
  onPlayPodcastEpisode,
  onToggleFavorite,
  onToggleFavoritePodcast,
  onToggleFavoriteEpisode,
  playlists,
  onAddToPlaylist,
  onClearAllFavorites,
  onOpenPodcastShow
}) => {
  // Strictly ensure NO synthetic podcast items appear in Radios
  const cleanRadios = useMemo(
    () => favorites.filter((s) => !isSyntheticPodcastStation(s)),
    [favorites]
  );

  const [activeFavTab, setActiveFavTab] = useState<'radios' | 'podcasts' | 'episodes'>(() => {
    if (cleanRadios.length > 0) return 'radios';
    if (favoritePodcasts.length > 0) return 'podcasts';
    if (favoriteEpisodes.length > 0) return 'episodes';
    return 'radios';
  });

  const [filterQuery, setFilterQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'recent'>('recent');
  const [openPlaylistMenuId, setOpenPlaylistMenuId] = useState<string | null>(null);
  const menuContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!openPlaylistMenuId) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target as Node)) {
        setOpenPlaylistMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openPlaylistMenuId]);

  const normalizedQuery = filterQuery.trim().toLowerCase();

  // Filter & Sort Radios (strictly radios only)
  const filteredRadios = cleanRadios.filter((s) => {
    if (!normalizedQuery) return true;
    return (
      s.name.toLowerCase().includes(normalizedQuery) ||
      (s.tags && s.tags.toLowerCase().includes(normalizedQuery)) ||
      (s.mainCategory && s.mainCategory.toLowerCase().includes(normalizedQuery)) ||
      (s.state && s.state.toLowerCase().includes(normalizedQuery))
    );
  });

  const sortedRadios = [...filteredRadios].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name, 'tr');
    return 0;
  });

  // Filter Podcasts (strictly podcast shows only)
  const filteredPodcasts = favoritePodcasts.filter((p) => {
    if (!normalizedQuery) return true;
    return (
      p.title.toLowerCase().includes(normalizedQuery) ||
      (p.publisher && p.publisher.toLowerCase().includes(normalizedQuery)) ||
      (p.category && p.category.toLowerCase().includes(normalizedQuery))
    );
  });

  // Filter Episodes (strictly podcast episodes only)
  const filteredEpisodes = favoriteEpisodes.filter((e) => {
    if (!normalizedQuery) return true;
    return (
      e.title.toLowerCase().includes(normalizedQuery) ||
      e.showTitle.toLowerCase().includes(normalizedQuery)
    );
  });

  const totalFavoritesCount = cleanRadios.length + favoritePodcasts.length + favoriteEpisodes.length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header & Sub-Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#1F2937] pb-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500 shrink-0" />
            <span>Favorilerim</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-400 border border-teal-500/25 font-mono font-bold">
              {totalFavoritesCount}
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Favorilere eklediğiniz canlı radyolar, podcast serileri ve bölümler
          </p>
        </div>

        {/* Category Selector Tabs — always fits cleanly with zero scrollbar */}
        <div className="grid grid-cols-3 sm:inline-flex sm:items-center gap-1 p-1 bg-slate-100 dark:bg-[#131B24] border border-slate-200 dark:border-[#1F2937] rounded-xl text-[11px] sm:text-xs shrink-0 w-full sm:w-auto">
          <button
            onClick={() => setActiveFavTab('radios')}
            className={`px-1.5 sm:px-3.5 py-2 rounded-lg font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeFavTab === 'radios'
                ? 'bg-teal-500 text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Radio className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="truncate">Radyolar ({cleanRadios.length})</span>
          </button>

          <button
            onClick={() => setActiveFavTab('podcasts')}
            className={`px-1.5 sm:px-3.5 py-2 rounded-lg font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeFavTab === 'podcasts'
                ? 'bg-teal-500 text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Mic className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="truncate">Podcastler ({favoritePodcasts.length})</span>
          </button>

          <button
            onClick={() => setActiveFavTab('episodes')}
            className={`px-1.5 sm:px-3.5 py-2 rounded-lg font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeFavTab === 'episodes'
                ? 'bg-teal-500 text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Headphones className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="truncate">Bölümler ({favoriteEpisodes.length})</span>
          </button>
        </div>
      </div>

      {/* Filter Search & Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder={
              activeFavTab === 'radios'
                ? 'Favori radyolar arasında ara...'
                : activeFavTab === 'podcasts'
                ? 'Favori podcastler arasında ara...'
                : 'Favori bölümler arasında ara...'
            }
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-white dark:bg-[#131B24] border border-slate-200 dark:border-[#1F2937] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-teal-500 transition-colors shadow-sm"
          />
          {filterQuery && (
            <button
              type="button"
              onClick={() => setFilterQuery('')}
              aria-label="Aramayı temizle"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {activeFavTab === 'radios' && cleanRadios.length > 0 && (
          <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#131B24] border border-slate-200 dark:border-[#1F2937] rounded-xl p-1 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 ml-1.5" />
              <button
                onClick={() => setSortBy('recent')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  sortBy === 'recent'
                    ? 'bg-teal-500 text-slate-950 font-bold'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Son Eklenen
              </button>
              <button
                onClick={() => setSortBy('name')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  sortBy === 'name'
                    ? 'bg-teal-500 text-slate-950 font-bold'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                İsim A-Z
              </button>
            </div>

            <button
              onClick={onClearAllFavorites}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Favori radyoları temizle"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Radyoları Temizle</span>
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: RADIOS (Homepage-style 2-column compact horizontal cards) */}
      {activeFavTab === 'radios' && (
        <>
          {cleanRadios.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-white dark:bg-[#131B24] rounded-xl border border-slate-200 dark:border-[#1F2937] p-8 shadow-sm">
              <Radio className="w-10 h-10 text-slate-300 dark:text-zinc-600 mx-auto" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Henüz favori radyonuz bulunmuyor
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto mt-1">
                  Beğendiğiniz radyoların yanındaki kalp ikonuna dokunarak favorilerinize ekleyebilirsiniz.
                </p>
              </div>
            </div>
          ) : sortedRadios.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 dark:text-zinc-400 bg-white dark:bg-[#131B24] rounded-xl border border-slate-200 dark:border-[#1F2937]">
              Aramanızla eşleşen favori radyo bulunamadı.
            </div>
          ) : (
            <div ref={menuContainerRef} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sortedRadios.map((station) => {
                const stId = station.stationuuid || station.id;
                const isCurrent =
                  currentStation?.stationuuid === station.stationuuid ||
                  (!!currentStation?.id && currentStation.id === station.id);
                const isBuffering =
                  isCurrent && (playbackStatus === 'connecting' || playbackStatus === 'buffering');
                const isPlayingThis = isCurrent && isPlaying && !isBuffering;

                const subtitleParts: string[] = [];
                if (station.mainCategory) subtitleParts.push(station.mainCategory);
                else if (station.tags) subtitleParts.push(station.tags.split(',').slice(0, 2).join(' • '));
                const locationLabel =
                  station.state && station.state !== 'Turkey'
                    ? station.state
                    : station.country || '';
                if (locationLabel) subtitleParts.push(locationLabel);
                const subtitle = subtitleParts.join(' • ') || 'Canlı Radyo';

                const isMenuOpen = openPlaylistMenuId === stId;

                return (
                  <div
                    key={stId}
                    onClick={() => onPlayStation(station, sortedRadios)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 group relative ${
                      isCurrent
                        ? 'bg-teal-50/80 dark:bg-[#152331] border-teal-500/50 dark:border-teal-500/40 shadow-sm ring-1 ring-teal-500/30'
                        : 'bg-white dark:bg-[#131B24] border-slate-200 dark:border-[#1F2937]/80 hover:bg-slate-50 dark:hover:bg-[#182330] hover:border-slate-300 dark:hover:border-zinc-700/80 shadow-sm'
                    }`}
                  >
                    {/* Left: Badge Logo + Info */}
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <StationCardBadge station={station} isActive={isCurrent} />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <h3
                            className={`font-bold text-sm truncate transition-colors ${
                              isCurrent
                                ? 'text-teal-700 dark:text-teal-300'
                                : 'text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-300'
                            }`}
                          >
                            {station.name}
                          </h3>
                          {isPlayingThis && (
                            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-teal-500/15 text-teal-700 dark:text-teal-300">
                              Canlı
                            </span>
                          )}
                          {isBuffering && (
                            <span className="shrink-0 text-[10px] font-semibold text-teal-600 dark:text-teal-400">
                              Bağlanıyor...
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                          {subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center space-x-1.5 shrink-0">
                      {playlists.length > 0 && (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenPlaylistMenuId(isMenuOpen ? null : stId);
                            }}
                            title="Çalma Listesine Ekle"
                            aria-label="Çalma Listesine Ekle"
                            className="p-1.5 rounded-full text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                          >
                            <ListPlus className="w-4 h-4" />
                          </button>

                          {isMenuOpen && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-9 z-30 w-48 rounded-xl bg-white dark:bg-[#0D131A] border border-slate-200 dark:border-[#1F2937] shadow-xl py-1.5 text-xs"
                            >
                              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                                Listeye Ekle
                              </div>
                              {playlists.map((pl) => {
                                const alreadyIn = pl.stationUuids.includes(station.stationuuid);
                                return (
                                  <button
                                    key={pl.id}
                                    type="button"
                                    onClick={() => {
                                      onAddToPlaylist(pl.id, station.stationuuid);
                                      setOpenPlaylistMenuId(null);
                                    }}
                                    className="w-full px-3 py-2 text-left flex items-center justify-between gap-2 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-[#182330] transition-colors cursor-pointer"
                                  >
                                    <span className="truncate">{pl.name}</span>
                                    {alreadyIn && <Check className="w-3.5 h-3.5 text-teal-500 shrink-0" />}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(station);
                        }}
                        title="Favorilerden Çıkar"
                        aria-label="Favorilerden Çıkar"
                        className="p-1.5 rounded-full text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlayStation(station, sortedRadios);
                        }}
                        title={isPlayingThis ? 'Durdur' : 'Oynat'}
                        aria-label={isPlayingThis ? 'Durdur' : 'Oynat'}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm ${
                          isPlayingThis || isBuffering
                            ? 'bg-teal-500 text-black'
                            : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white group-hover:bg-teal-500 group-hover:text-black'
                        }`}
                      >
                        {isBuffering ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : isPlayingThis ? (
                          <Pause className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* TAB 2: PODCAST SHOWS (Homepage-style 2-column compact horizontal cards) */}
      {activeFavTab === 'podcasts' && (
        <>
          {favoritePodcasts.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-white dark:bg-[#131B24] rounded-xl border border-slate-200 dark:border-[#1F2937] p-8 shadow-sm">
              <Mic className="w-10 h-10 text-slate-300 dark:text-zinc-600 mx-auto" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Henüz favori podcast seriniz bulunmuyor
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto mt-1">
                  Podcast sayfasındaki serilerin üzerindeki kalp ikonuna dokunarak favori listenize ekleyebilirsiniz.
                </p>
              </div>
            </div>
          ) : filteredPodcasts.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 dark:text-zinc-400 bg-white dark:bg-[#131B24] rounded-xl border border-slate-200 dark:border-[#1F2937]">
              Aramanızla eşleşen favori podcast bulunamadı.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredPodcasts.map((show) => (
                <div
                  key={show.id || show.feedUrl}
                  onClick={() => onOpenPodcastShow && onOpenPodcastShow(show)}
                  className="p-3 rounded-xl bg-white dark:bg-[#131B24] border border-slate-200 dark:border-[#1F2937]/80 hover:bg-slate-50 dark:hover:bg-[#182330] hover:border-slate-300 dark:hover:border-zinc-700/80 transition-all cursor-pointer flex items-center justify-between gap-3 group shadow-sm"
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <img
                      src={show.coverUrl}
                      alt={show.title}
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=300&q=80';
                      }}
                      className="w-11 h-11 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-[#1F2937] bg-slate-100 dark:bg-[#0D131A]"
                    />

                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors truncate">
                        {show.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                        {[show.publisher, show.category].filter(Boolean).join(' • ') || 'Podcast Serisi'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    {onToggleFavoritePodcast && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavoritePodcast(show);
                        }}
                        title="Favorilerden Çıkar"
                        aria-label="Favorilerden Çıkar"
                        className="p-1.5 rounded-full text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                    )}

                    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white group-hover:bg-teal-500 group-hover:text-black flex items-center justify-center transition-all shadow-sm">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* TAB 3: PODCAST EPISODES (Homepage-style 2-column compact horizontal cards) */}
      {activeFavTab === 'episodes' && (
        <>
          {favoriteEpisodes.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-white dark:bg-[#131B24] rounded-xl border border-slate-200 dark:border-[#1F2937] p-8 shadow-sm">
              <Headphones className="w-10 h-10 text-slate-300 dark:text-zinc-600 mx-auto" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Henüz favori podcast bölümünüz bulunmuyor
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto mt-1">
                  Podcast detay sayfasındaki veya oynatıcıdaki kalp ikonuna basarak bölümleri listenize kaydedebilirsiniz.
                </p>
              </div>
            </div>
          ) : filteredEpisodes.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 dark:text-zinc-400 bg-white dark:bg-[#131B24] rounded-xl border border-slate-200 dark:border-[#1F2937]">
              Aramanızla eşleşen favori bölüm bulunamadı.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredEpisodes.map((ep) => {
                const isThisCurrent = currentEpisodeId === ep.id;
                const isThisPlaying = isThisCurrent && isPlaying;

                return (
                  <div
                    key={ep.id}
                    onClick={() => onPlayPodcastEpisode && onPlayPodcastEpisode(ep, filteredEpisodes)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                      isThisCurrent
                        ? 'bg-teal-50/80 dark:bg-[#152331] border-teal-500/50 dark:border-teal-500/40 shadow-sm ring-1 ring-teal-500/30'
                        : 'bg-white dark:bg-[#131B24] border-slate-200 dark:border-[#1F2937]/80 hover:bg-slate-50 dark:hover:bg-[#182330] hover:border-slate-300 dark:hover:border-zinc-700/80 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <img
                        src={ep.coverUrl}
                        alt={ep.title}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.src =
                            'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=300&q=80';
                        }}
                        className="w-11 h-11 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-[#1F2937] bg-slate-100 dark:bg-[#0D131A]"
                      />

                      <div className="min-w-0 flex-1">
                        <h3
                          className={`text-sm font-bold truncate transition-colors ${
                            isThisCurrent
                              ? 'text-teal-700 dark:text-teal-300'
                              : 'text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-300'
                          }`}
                        >
                          {ep.title}
                        </h3>

                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 mt-0.5 min-w-0">
                          <span className="font-medium text-teal-700 dark:text-teal-400 truncate">
                            {ep.showTitle}
                          </span>
                          {ep.publishedDate && (
                            <span className="hidden sm:inline-flex items-center gap-1 shrink-0">
                              <span>•</span>
                              <Calendar className="w-3 h-3" />
                              {ep.publishedDate}
                            </span>
                          )}
                          {ep.durationSeconds > 0 && (
                            <span className="inline-flex items-center gap-1 shrink-0">
                              <span>•</span>
                              <Clock className="w-3 h-3" />
                              {Math.floor(ep.durationSeconds / 60)} dk
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      {onToggleFavoriteEpisode && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavoriteEpisode(ep);
                          }}
                          title="Favorilerden Çıkar"
                          aria-label="Favorilerden Çıkar"
                          className="p-1.5 rounded-full text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </button>
                      )}

                      {onPlayPodcastEpisode && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onPlayPodcastEpisode(ep, filteredEpisodes);
                          }}
                          title={isThisPlaying ? 'Duraklat' : 'Dinle'}
                          aria-label={isThisPlaying ? 'Duraklat' : 'Dinle'}
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm ${
                            isThisPlaying
                              ? 'bg-teal-500 text-black'
                              : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white group-hover:bg-teal-500 group-hover:text-black'
                          }`}
                        >
                          {isThisPlaying ? (
                            <Pause className="w-4 h-4 fill-current" />
                          ) : (
                            <Play className="w-4 h-4 fill-current ml-0.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
});
