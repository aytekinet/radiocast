import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import { 
  Sparkles, 
  Radio, 
  RefreshCw, 
  Flame, 
  Mic2, 
  Zap, 
  HeartHandshake, 
  Music, 
  Disc, 
  Guitar, 
  Newspaper, 
  Sun, 
  BoomBox, 
  Globe, 
  Wifi, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Play, 
  Pause 
} from 'lucide-react';
import { Playlist, RadioStation } from '../types';
import { GENRE_CATEGORIES, ALL_COUNTRIES, POPULAR_COUNTRIES, COUNTRY_NAMES_TR } from '../constants/categories';
import { StationCard } from './StationCard';
import { PlaybackStatus } from '../services/audioEngine';
import { getRecentlyPlayed } from '../services/storage';

interface DiscoverViewProps {
  stations: RadioStation[];
  isLoading: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  selectedCategory: string;
  setSelectedCategory: (catId: string) => void;
  selectedGroup?: string;
  setSelectedGroup?: (groupId: string) => void;
  selectedCountry: string;
  setSelectedCountry: (country: string) => void;
  currentStation: RadioStation | null;
  isPlaying: boolean;
  playbackStatus?: PlaybackStatus;
  favorites: RadioStation[];
  onPlayStation: (station: RadioStation) => void;
  onToggleFavorite: (station: RadioStation) => void;
  playlists: Playlist[];
  onAddToPlaylist: (playlistId: string, stationUuid: string) => void;
  onRefresh: () => void;
  searchQuery: string;
}

const BATCH_SIZE = 48;

export const DiscoverView: React.FC<DiscoverViewProps> = memo(({
  stations,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  selectedCategory,
  setSelectedCategory,
  selectedGroup,
  setSelectedGroup,
  selectedCountry,
  setSelectedCountry,
  currentStation,
  isPlaying,
  playbackStatus,
  favorites,
  onPlayStation,
  onToggleFavorite,
  playlists,
  onAddToPlaylist,
  onRefresh,
  searchQuery
}) => {
  const favoriteSet = useMemo(() => new Set(favorites.map((f) => f.stationuuid)), [favorites]);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Progressive batch rendering for 120 FPS smooth scrolling
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);

  // Reset batch count when category, search query, or group changes
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [selectedCategory, selectedGroup, selectedCountry, searchQuery]);

  // Infinite scroll sentinel using IntersectionObserver (ZERO layout thrashing!)
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => {
            if (prev < stations.length) {
              return Math.min(prev + BATCH_SIZE, stations.length);
            }
            return prev;
          });
        }
      },
      { rootMargin: '400px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [stations.length]);

  const visibleStations = useMemo(() => {
    return stations.slice(0, visibleCount);
  }, [stations, visibleCount]);

  const recentRadioStations = useMemo(() => {
    const list = getRecentlyPlayed();
    return list
      .filter((item) => item.type === 'radio' && item.radioStation)
      .map((item) => item.radioStation!)
      .slice(0, 8);
  }, [currentStation, isPlaying]);

  const scrollCategory = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleCategoryWheel = (e: React.WheelEvent) => {
    if (categoryScrollRef.current && Math.abs(e.deltaY) > 0) {
      categoryScrollRef.current.scrollLeft += e.deltaY * 0.9;
    }
  };

  const renderCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Music': return <Music className="w-3.5 h-3.5" />;
      case 'HeartHandshake': return <HeartHandshake className="w-3.5 h-3.5" />;
      case 'Disc': return <Disc className="w-3.5 h-3.5" />;
      case 'Guitar': return <Guitar className="w-3.5 h-3.5" />;
      case 'Flame': return <Flame className="w-3.5 h-3.5" />;
      case 'Sparkles': return <Sparkles className="w-3.5 h-3.5" />;
      case 'Mic2': return <Mic2 className="w-3.5 h-3.5" />;
      case 'Newspaper': return <Newspaper className="w-3.5 h-3.5" />;
      case 'Sun': return <Sun className="w-3.5 h-3.5" />;
      case 'Zap': return <Zap className="w-3.5 h-3.5" />;
      case 'BoomBox': return <BoomBox className="w-3.5 h-3.5" />;
      case 'Globe': return <Globe className="w-3.5 h-3.5" />;
      case 'Wifi': return <Wifi className="w-3.5 h-3.5" />;
      default: return <Radio className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Category Pills Header (Spotify / Fizy Style) */}
      <div className="space-y-3">
        {selectedCountry && selectedCountry !== 'TR' ? (
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] shadow-sm">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">
                {ALL_COUNTRIES.find((c) => c.code === selectedCountry)?.flag || '🌍'}
              </span>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  {ALL_COUNTRIES.find((c) => c.code === selectedCountry)?.name || COUNTRY_NAMES_TR[selectedCountry] || selectedCountry} Radyoları
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Tüm popüler istasyonlar kategori sınırlaması olmaksızın listelenmektedir.
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedCountry('TR')}
              className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-semibold shrink-0 transition-colors"
            >
              🇹🇷 Türkiye Radyoları
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <h2 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Kategoriler & Müzik Türleri
                </h2>
              </div>
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="flex items-center space-x-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-500' : ''}`} />
                <span>Yenile</span>
              </button>
            </div>

            {/* Scrollable Category Chips Container with Smooth Arrows */}
            <div className="relative group">
              <button
                onClick={() => scrollCategory('left')}
                className="absolute -left-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 dark:bg-zinc-800/90 border border-zinc-200 dark:border-white/10 shadow-lg flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:text-emerald-500 hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                title="Sola Kaydır"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div
                ref={categoryScrollRef}
                onWheel={handleCategoryWheel}
                className="flex items-center space-x-2 overflow-x-auto py-1 px-1 scroll-smooth touch-pan-x whitespace-nowrap no-scrollbar select-none max-w-full"
              >
                {GENRE_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        if (setSelectedGroup) setSelectedGroup('all_groups');
                      }}
                      className={`px-4 py-2 rounded-full text-xs font-semibold shrink-0 flex items-center space-x-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md shadow-emerald-500/20 scale-[1.02]'
                          : 'bg-white dark:bg-white/[0.05] hover:bg-zinc-100 dark:hover:bg-white/[0.1] text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-white/[0.06]'
                      }`}
                    >
                      {renderCategoryIcon(cat.iconName)}
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => scrollCategory('right')}
                className="absolute -right-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 dark:bg-zinc-800/90 border border-zinc-200 dark:border-white/10 shadow-lg flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:text-emerald-500 hover:scale-110 active:scale-95 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                title="Sağa Kaydır"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Recently Played Stations Strip (Spotify Style) */}
            {recentRadioStations.length > 0 && !searchQuery && (
              <div className="pt-2 space-y-2">
                <div className="flex items-center space-x-2 px-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-500" />
                  <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Son Dinlenen Radyolar
                  </h3>
                </div>

                <div className="flex items-center space-x-3 overflow-x-auto pb-2 no-scrollbar max-w-full touch-pan-x">
                  {recentRadioStations.map((st) => {
                    const isThisPlaying = (currentStation?.id || currentStation?.stationuuid) === (st.id || st.stationuuid) && isPlaying;
                    return (
                      <div
                        key={st.id || st.stationuuid}
                        onClick={() => onPlayStation(st)}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-xl shrink-0 cursor-pointer transition-all duration-150 border ${
                          isThisPlaying
                            ? 'bg-emerald-500/15 border-emerald-500/50 shadow-sm'
                            : 'bg-white dark:bg-white/[0.04] hover:bg-zinc-100 dark:hover:bg-white/[0.08] border-zinc-200/70 dark:border-white/[0.06]'
                        }`}
                      >
                        <img
                          src={st.favicon || 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=100&q=80'}
                          alt={st.name}
                          className="w-8 h-8 rounded-lg object-cover bg-zinc-800 shrink-0"
                          onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=100&q=80'; }}
                        />
                        <div className="min-w-0 pr-1">
                          <span className={`text-xs font-semibold truncate block max-w-[130px] ${
                            isThisPlaying ? 'text-emerald-500' : 'text-zinc-900 dark:text-zinc-100'
                          }`}>
                            {st.name}
                          </span>
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate block max-w-[130px]">
                            {st.tags ? st.tags.split(',')[0] : 'Canlı'}
                          </span>
                        </div>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                          isThisPlaying ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-100 dark:bg-white/10 text-zinc-600 dark:text-zinc-300'
                        }`}>
                          {isThisPlaying ? (
                            <Pause className="w-3 h-3 fill-current" />
                          ) : (
                            <Play className="w-3 h-3 fill-current ml-0.5" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Main Stations Header */}
      <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-white/[0.06] pb-3 px-1">
        <div>
          <h1 className="text-base font-bold text-zinc-900 dark:text-white flex items-center space-x-2">
            <span>
              {searchQuery
                ? `Arama Sonuçları: "${searchQuery}"`
                : selectedCategory && selectedCategory !== 'all'
                ? `${GENRE_CATEGORIES.find((c) => c.id === selectedCategory)?.name || 'Kategori'} Radyoları`
                : selectedCountry
                ? `${ALL_COUNTRIES.find((c) => c.code === selectedCountry)?.name || COUNTRY_NAMES_TR[selectedCountry] || selectedCountry} Radyoları`
                : 'Popüler Radyolar'}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-white/[0.06] font-mono">
              {stations.length} İstasyon
            </span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Dinlemek istediğiniz radyonun üzerine tıklayın
          </p>
        </div>

        {!selectedCountry && (
          <div className="hidden lg:flex items-center space-x-1.5 text-xs">
            {POPULAR_COUNTRIES.slice(0, 5).map((c) => (
              <button
                key={c.code}
                onClick={() => setSelectedCountry(c.code)}
                className="px-2.5 py-1 rounded-full bg-white dark:bg-white/[0.04] hover:bg-zinc-100 dark:hover:bg-white/[0.08] text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-white/[0.06] flex items-center space-x-1 transition-colors cursor-pointer"
              >
                <span>{c.flag}</span>
                <span className="text-[11px] font-medium">{c.code}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* High-Performance Smooth CSS Grid (Zero forced reflow, 120 FPS) */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 12 }).map((_, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white dark:bg-white/[0.03] border border-zinc-200/70 dark:border-white/[0.06] p-3 animate-pulse space-y-3"
            >
              <div className="aspect-square w-full rounded-xl bg-zinc-200 dark:bg-white/[0.06]" />
              <div className="h-3 bg-zinc-200 dark:bg-white/[0.06] rounded w-3/4" />
              <div className="h-2.5 bg-zinc-200 dark:bg-white/[0.06] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : stations.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {visibleStations.map((station) => (
              <StationCard
                key={station.stationuuid}
                station={station}
                isPlaying={isPlaying}
                status={playbackStatus}
                isCurrentStation={currentStation?.stationuuid === station.stationuuid}
                isFavorite={favoriteSet.has(station.stationuuid)}
                onPlay={onPlayStation}
                onToggleFavorite={onToggleFavorite}
                playlists={playlists}
                onAddToPlaylist={onAddToPlaylist}
              />
            ))}
          </div>

          {/* Invisible sentinel for buttery smooth continuous infinite loading */}
          <div ref={sentinelRef} className="h-10 w-full" />

          {/* Load More Button for remote API fetch */}
          {hasMore !== false && onLoadMore && (!selectedCategory || selectedCategory === 'all') && !searchQuery && (
            <div className="pt-2 pb-4 text-center">
              <button
                onClick={onLoadMore}
                disabled={isLoadingMore}
                className="px-6 py-2.5 rounded-full bg-white dark:bg-white/[0.05] hover:bg-zinc-100 dark:hover:bg-white/[0.1] border border-zinc-200 dark:border-white/10 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-all shadow-sm hover:scale-105 disabled:opacity-50 inline-flex items-center space-x-2 cursor-pointer"
              >
                {isLoadingMore ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                    <span>Daha Fazla Yükleniyor...</span>
                  </>
                ) : (
                  <>
                    <Radio className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Daha Fazla Radyo Yükle</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="py-16 text-center space-y-3 bg-white dark:bg-white/[0.02] rounded-2xl border border-zinc-200/80 dark:border-white/[0.06] p-8 shadow-sm">
          <Radio className="w-12 h-12 text-zinc-400 dark:text-zinc-600 mx-auto" />
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-300">
            Aradığınız kriterlere uygun radyo bulunamadı
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            Filtreleri veya arama terimini değiştirerek tekrar deneyebilirsiniz.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              if (setSelectedGroup) setSelectedGroup('all_groups');
              setSelectedCountry('TR');
            }}
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold rounded-full transition-all shadow-md cursor-pointer"
          >
            Filtreleri Sıfırla
          </button>
        </div>
      )}
    </div>
  );
});
