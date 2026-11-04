import React, { useState, useMemo, useEffect, useRef } from 'react';
import { RadioStation, PodcastShow, PodcastEpisode, Playlist, ThemePalette } from '../types';
import { StationCard } from './StationCard';
import { 
  Search, 
  Radio, 
  Mic, 
  ArrowRight, 
  SlidersHorizontal, 
  Clock, 
  Sparkles, 
  Layers, 
  Play, 
  Heart, 
  X, 
  RefreshCw,
  Calendar,
  Filter
} from 'lucide-react';
import { ALL_TURKISH_STATIONS } from '../data/fallbackStations';
import { CURATED_TURKISH_PODCASTS } from '../data/curatedTurkishPodcasts';
import { searchStations } from '../services/radioApi';
import { searchPodcasts, getLocalCuratedPodcasts } from '../services/podcastApi';
import { calculateRelevanceScore, normalizeTurkishText } from '../utils/turkishSearch';
import { PlaybackStatus } from '../services/audioEngine';

interface SearchResultsViewProps {
  initialQuery: string;
  initialType?: 'all' | 'radio' | 'podcast';
  onPlayStation: (station: RadioStation) => void;
  onPlayPodcastEpisode: (episode: PodcastEpisode) => void;
  onOpenPodcastShow: (show: PodcastShow) => void;
  onToggleFavoriteStation: (station: RadioStation) => void;
  onToggleFavoritePodcast: (show: PodcastShow) => void;
  favorites: RadioStation[];
  favoritePodcasts: PodcastShow[];
  currentStation: RadioStation | null;
  currentEpisodeId: string | null;
  isPlaying: boolean;
  playbackStatus?: PlaybackStatus;
  playlists: Playlist[];
  onAddToPlaylist: (playlistId: string, stationUuid: string) => void;
  themePalette?: ThemePalette;
  onUpdateQuery?: (newQuery: string) => void;
}

function formatDate(millis?: number): string {
  if (!millis || millis <= 0) return 'Güncel';
  try {
    const d = new Date(millis);
    if (isNaN(d.getTime())) return 'Güncel';
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return 'Güncel';
  }
}

export const SearchResultsView: React.FC<SearchResultsViewProps> = ({
  initialQuery,
  initialType = 'all',
  onPlayStation,
  onPlayPodcastEpisode,
  onOpenPodcastShow,
  onToggleFavoriteStation,
  onToggleFavoritePodcast,
  favorites,
  favoritePodcasts,
  currentStation,
  currentEpisodeId,
  isPlaying,
  playbackStatus,
  playlists,
  onAddToPlaylist,
  onUpdateQuery
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'all' | 'radio' | 'podcast'>(initialType);
  const [podcastSort, setPodcastSort] = useState<'newest' | 'popular' | 'az'>('newest');
  const [radioFilter, setRadioFilter] = useState<'all' | 'popular' | 'aac'>('all');
  
  const [remoteStations, setRemoteStations] = useState<RadioStation[]>([]);
  const [remotePodcasts, setRemotePodcasts] = useState<PodcastShow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync internal state when prop query changes
  useEffect(() => {
    if (initialQuery !== query) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    if (initialType && initialType !== activeTab) {
      setActiveTab(initialType);
    }
  }, [initialType]);

  // Fetch remote stations and podcasts debounced
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setRemoteStations([]);
      setRemotePodcasts([]);
      setIsLoading(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const ac = new AbortController();
    abortControllerRef.current = ac;

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const [stationsRes, podcastsRes] = await Promise.allSettled([
          searchStations({ q: trimmed }),
          searchPodcasts(trimmed)
        ]);

        if (!ac.signal.aborted) {
          if (stationsRes.status === 'fulfilled') {
            setRemoteStations(stationsRes.value || []);
          }
          if (podcastsRes.status === 'fulfilled') {
            setRemotePodcasts(podcastsRes.value || []);
          }
        }
      } catch (err) {
        console.warn('Search remote fetch error:', err);
      } finally {
        if (!ac.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 280);

    return () => {
      clearTimeout(timer);
      ac.abort();
    };
  }, [query]);

  // Merge, Score & Deduplicate Radios
  const scoredRadios = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const radioMap = new Map<string, { station: RadioStation; score: number }>();

    // 1. Local 629 verified stations (high reliability)
    for (const s of ALL_TURKISH_STATIONS) {
      const score = calculateRelevanceScore(
        s.name,
        s.country || 'TR',
        s.tags || '',
        s.state || '',
        trimmed
      );
      if (score > 0) {
        const key = normalizeTurkishText(s.name);
        radioMap.set(key, { station: s, score: score + 100 }); // boost local curated
      }
    }

    // 2. Remote / Radio Browser stations
    for (const s of remoteStations) {
      const key = normalizeTurkishText(s.name);
      const score = calculateRelevanceScore(
        s.name,
        s.country || '',
        s.tags || '',
        s.state || '',
        trimmed
      );
      if (score > 0) {
        const existing = radioMap.get(key);
        if (!existing || score > existing.score) {
          radioMap.set(key, { station: s, score });
        }
      }
    }

    let list = Array.from(radioMap.values());

    // Apply quick radio filters
    if (radioFilter === 'popular') {
      list.sort((a, b) => (b.station.votes || 0) - (a.station.votes || 0));
    } else if (radioFilter === 'aac') {
      list = list.filter(item => (item.station.codec || '').toLowerCase().includes('aac') || (item.station.bitrate || 0) >= 128);
      list.sort((a, b) => b.score - a.score);
    } else {
      // Relevance sort
      list.sort((a, b) => b.score - a.score);
    }

    return list.map(item => item.station);
  }, [query, remoteStations, radioFilter]);

  // Merge, Score & Deduplicate Podcasts (100% Turkish only)
  const scoredPodcasts = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const podcastMap = new Map<string, { podcast: PodcastShow; score: number }>();

    // 1. Curated & local verified podcasts
    const localPodcasts = getLocalCuratedPodcasts();
    for (const p of localPodcasts) {
      const score = calculateRelevanceScore(
        p.title,
        p.publisher,
        p.category,
        p.description,
        trimmed
      );
      if (score > 0) {
        const key = normalizeTurkishText(p.title);
        podcastMap.set(key, { podcast: p, score: score + 150 }); // boost verified curated
      }
    }

    // 2. Remote podcasts
    for (const p of remotePodcasts) {
      const key = normalizeTurkishText(p.title);
      const score = calculateRelevanceScore(
        p.title,
        p.publisher,
        p.category,
        p.description,
        trimmed
      );
      if (score > 0) {
        const existing = podcastMap.get(key);
        if (!existing || score > existing.score) {
          podcastMap.set(key, { podcast: p, score });
        }
      }
    }

    let list = Array.from(podcastMap.values());

    // Apply sorting
    if (podcastSort === 'newest') {
      list.sort((a, b) => (b.podcast.releaseDateMillis || 0) - (a.podcast.releaseDateMillis || 0));
    } else if (podcastSort === 'az') {
      list.sort((a, b) => a.podcast.title.localeCompare(b.podcast.title, 'tr'));
    } else {
      // Relevance
      list.sort((a, b) => b.score - a.score);
    }

    return list.map(item => item.podcast);
  }, [query, remotePodcasts, podcastSort]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateQuery) {
      onUpdateQuery(query);
    }
  };

  const handleClear = () => {
    setQuery('');
    if (onUpdateQuery) {
      onUpdateQuery('');
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-7xl mx-auto">
      {/* Search Header Banner & Refined Input */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#111A26] to-[#0A0F17] border border-white/[0.08] shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <Search className="w-3.5 h-3.5" />
                <span>Arama Merkezi</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                {query ? (
                  <>
                    <span className="text-emerald-400">"{query}"</span> için Arama Sonuçları
                  </>
                ) : (
                  'Radyo ve Podcast Ara'
                )}
              </h1>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
              <span className="px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] font-mono">
                {scoredRadios.length} Radyo
              </span>
              <span className="px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] font-mono">
                {scoredPodcasts.length} Podcast
              </span>
            </div>
          </div>

          {/* Search Bar with Submit & Clear */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (onUpdateQuery) onUpdateQuery(e.target.value);
              }}
              placeholder="Radyo istasyonu, podcast, tür veya sanatçı ara..."
              className="w-full pl-11 pr-24 py-3 text-sm rounded-2xl bg-black/40 text-white placeholder-zinc-400 border border-white/10 focus:outline-none focus:border-emerald-500/80 focus:bg-black/60 transition-all shadow-inner"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
              {query && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Temizle"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-all active:scale-95 shadow cursor-pointer"
              >
                Ara
              </button>
            </div>
          </form>

          {/* Tab Selector: Tümü | Radyolar | Podcastler */}
          <div className="flex items-center space-x-2 pt-2 border-t border-white/[0.06] overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/[0.06]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tümü ({scoredRadios.length + scoredPodcasts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('radio')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'radio'
                  ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/[0.06]'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Radyolar ({scoredRadios.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('podcast')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'podcast'
                  ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/[0.06]'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Podcastler ({scoredPodcasts.length})</span>
            </button>

            {isLoading && (
              <div className="flex items-center space-x-1 text-xs text-amber-400 pl-2">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Aranıyor...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Empty State when no results found */}
      {!isLoading && query && scoredRadios.length === 0 && scoredPodcasts.length === 0 && (
        <div className="py-16 px-6 text-center rounded-3xl bg-[#111A26] border border-white/[0.06] space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto text-zinc-400">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Sonuç Bulunamadı</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              "{query}" ile eşleşen bir radyo istasyonu veya Türkçe podcast bulunamadı. Yazımı kontrol edip tekrar deneyebilirsiniz.
            </p>
          </div>

          <div className="pt-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Popüler Aramalar</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['Yazılımcının Dünyası', 'Evrim Ağacı', 'Socrates', 'Kafa Radyo', 'TRT', 'Kral Pop', 'Beyhan Budak'].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setQuery(term);
                    if (onUpdateQuery) onUpdateQuery(term);
                  }}
                  className="px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/40 text-zinc-300 border border-white/[0.08] text-xs transition-all cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ALL TAB: Two Sections (Radios & Podcasts) */}
      {activeTab === 'all' && (
        <div className="space-y-10">
          {/* Top Podcasts Section (Priority if query matches podcasts) */}
          {scoredPodcasts.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <div className="flex items-center space-x-2">
                  <Mic className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg font-bold text-white">Türkçe Podcastler</h2>
                  <span className="text-xs text-zinc-400">({scoredPodcasts.length})</span>
                </div>
                {scoredPodcasts.length > 4 && (
                  <button
                    onClick={() => setActiveTab('podcast')}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 cursor-pointer transition-colors"
                  >
                    <span>Tümünü Gör ({scoredPodcasts.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {scoredPodcasts.slice(0, 4).map((podcast) => (
                  <PodcastCard
                    key={podcast.id || podcast.feedUrl}
                    podcast={podcast}
                    onOpen={() => onOpenPodcastShow(podcast)}
                    isFavorite={favoritePodcasts.some(f => (f.id || f.feedUrl) === (podcast.id || podcast.feedUrl))}
                    onToggleFavorite={() => onToggleFavoritePodcast(podcast)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Radios Section */}
          {scoredRadios.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <div className="flex items-center space-x-2">
                  <Radio className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg font-bold text-white">Radyo İstasyonları</h2>
                  <span className="text-xs text-zinc-400">({scoredRadios.length})</span>
                </div>
                {scoredRadios.length > 8 && (
                  <button
                    onClick={() => setActiveTab('radio')}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 cursor-pointer transition-colors"
                  >
                    <span>Tümünü Gör ({scoredRadios.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {scoredRadios.slice(0, 12).map((station) => (
                  <StationCard
                    key={station.id || station.stationuuid}
                    station={station}
                    isPlaying={isPlaying}
                    status={playbackStatus}
                    isCurrentStation={(currentStation?.id || currentStation?.stationuuid) === (station.id || station.stationuuid)}
                    isFavorite={favorites.some(f => (f.id || f.stationuuid) === (station.id || station.stationuuid))}
                    onPlay={onPlayStation}
                    onToggleFavorite={onToggleFavoriteStation}
                    playlists={playlists}
                    onAddToPlaylist={onAddToPlaylist}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* RADIOS ONLY TAB */}
      {activeTab === 'radio' && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Radio className="w-5 h-5 text-emerald-400" />
                <span>Radyo Sonuçları ({scoredRadios.length})</span>
              </h2>
              <p className="text-xs text-zinc-400">Canlı çalmak için istasyonun üzerine tıklayın</p>
            </div>

            {/* Radio Filter Selector */}
            <div className="flex items-center space-x-1.5 text-xs">
              <button
                onClick={() => setRadioFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  radioFilter === 'all'
                    ? 'bg-emerald-500 text-zinc-950'
                    : 'bg-white/[0.04] text-zinc-400 hover:text-white'
                }`}
              >
                Tümü
              </button>
              <button
                onClick={() => setRadioFilter('popular')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  radioFilter === 'popular'
                    ? 'bg-emerald-500 text-zinc-950'
                    : 'bg-white/[0.04] text-zinc-400 hover:text-white'
                }`}
              >
                Popülerler
              </button>
              <button
                onClick={() => setRadioFilter('aac')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  radioFilter === 'aac'
                    ? 'bg-emerald-500 text-zinc-950'
                    : 'bg-white/[0.04] text-zinc-400 hover:text-white'
                }`}
              >
                Yüksek Kalite (AAC)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {scoredRadios.map((station) => (
              <StationCard
                key={station.id || station.stationuuid}
                station={station}
                isPlaying={isPlaying}
                status={playbackStatus}
                isCurrentStation={(currentStation?.id || currentStation?.stationuuid) === (station.id || station.stationuuid)}
                isFavorite={favorites.some(f => (f.id || f.stationuuid) === (station.id || station.stationuuid))}
                onPlay={onPlayStation}
                onToggleFavorite={onToggleFavoriteStation}
                playlists={playlists}
                onAddToPlaylist={onAddToPlaylist}
              />
            ))}
          </div>
        </section>
      )}

      {/* PODCASTS ONLY TAB */}
      {activeTab === 'podcast' && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Mic className="w-5 h-5 text-emerald-400" />
                <span>Türkçe Podcast Sonuçları ({scoredPodcasts.length})</span>
              </h2>
              <p className="text-xs text-zinc-400">Program detaylarına gidip tüm gerçek RSS bölümlerini dinleyin</p>
            </div>

            {/* Sort options: En Yeni Bölüm | Popüler | A-Z */}
            <div className="flex items-center space-x-1.5 text-xs">
              <span className="text-zinc-500 text-[11px] font-medium hidden sm:inline">Sıralama:</span>
              <button
                onClick={() => setPodcastSort('newest')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center space-x-1 cursor-pointer ${
                  podcastSort === 'newest'
                    ? 'bg-emerald-500 text-zinc-950'
                    : 'bg-white/[0.04] text-zinc-400 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>En Yeni Bölüm</span>
              </button>
              <button
                onClick={() => setPodcastSort('popular')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  podcastSort === 'popular'
                    ? 'bg-emerald-500 text-zinc-950'
                    : 'bg-white/[0.04] text-zinc-400 hover:text-white'
                }`}
              >
                Alaka / Popüler
              </button>
              <button
                onClick={() => setPodcastSort('az')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  podcastSort === 'az'
                    ? 'bg-emerald-500 text-zinc-950'
                    : 'bg-white/[0.04] text-zinc-400 hover:text-white'
                }`}
              >
                A – Z
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {scoredPodcasts.map((podcast) => (
              <PodcastCard
                key={podcast.id || podcast.feedUrl}
                podcast={podcast}
                onOpen={() => onOpenPodcastShow(podcast)}
                isFavorite={favoritePodcasts.some(f => (f.id || f.feedUrl) === (podcast.id || podcast.feedUrl))}
                onToggleFavorite={() => onToggleFavoritePodcast(podcast)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

interface PodcastCardProps {
  podcast: PodcastShow;
  onOpen: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const PodcastCard: React.FC<PodcastCardProps> = ({ podcast, onOpen, isFavorite, onToggleFavorite }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={onOpen}
      className="group p-3.5 rounded-2xl bg-[#111A26] hover:bg-[#162233] border border-white/[0.08] hover:border-emerald-500/40 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-lg hover:shadow-2xl hover:-translate-y-1 relative"
    >
      <div className="space-y-3">
        {/* Cover artwork with overlay button */}
        <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-white/[0.06] shadow-inner">
          {podcast.coverUrl && !imgError ? (
            <img
              src={podcast.coverUrl}
              alt={podcast.title}
              loading="lazy"
              decoding="async"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-emerald-400 p-4">
              <Mic className="w-8 h-8 mb-1" />
              <span className="text-[10px] font-bold uppercase text-zinc-400 text-center line-clamp-1">
                {podcast.title.slice(0, 14)}
              </span>
            </div>
          )}

          {/* Hover play button overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="w-11 h-11 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center shadow-xl shadow-emerald-500/40 font-bold transform translate-y-1 group-hover:translate-y-0 transition-transform">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </span>
          </div>

          {/* Heart favorite button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className={`absolute top-2 left-2 p-1.5 rounded-full backdrop-blur-md transition-all shadow-md z-10 cursor-pointer ${
              isFavorite
                ? 'bg-rose-500 text-white shadow-rose-500/30'
                : 'bg-black/50 text-white/80 hover:text-white hover:bg-rose-500/80'
            }`}
            title={isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          {/* Category Tag on cover */}
          <div className="absolute bottom-2 left-2 pointer-events-none">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/70 text-emerald-400 backdrop-blur-md border border-white/10 uppercase">
              {podcast.category || 'Podcast'}
            </span>
          </div>
        </div>

        {/* Title & Publisher */}
        <div>
          <h3 className="font-bold text-sm text-white line-clamp-1 group-hover:text-emerald-400 transition-colors">
            {podcast.title}
          </h3>
          <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
            {podcast.publisher || 'Yayıncı'}
          </p>
        </div>

        {/* Description */}
        <p className="text-xs text-zinc-400/80 line-clamp-2 leading-relaxed">
          {podcast.description || `${podcast.title} podcast serisi.`}
        </p>
      </div>

      {/* Recency Footer: Son Bölüm Tarihi */}
      <div className="pt-3 mt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-400 font-medium">
        <span className="flex items-center gap-1.5 text-zinc-300">
          <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Son bölüm: {formatDate(podcast.releaseDateMillis)}</span>
        </span>
        <span className="text-emerald-400 text-[10px] font-bold group-hover:translate-x-0.5 transition-transform">
          Bölümleri Aç →
        </span>
      </div>
    </div>
  );
};
