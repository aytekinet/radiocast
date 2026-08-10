import React, { useState, useEffect, useRef } from 'react';
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
import { GENRE_CATEGORIES, RADIO_GROUPS, ALL_COUNTRIES, POPULAR_COUNTRIES, COUNTRY_NAMES_TR } from '../constants/categories';
import { StationCard } from './StationCard';
import { PlaybackStatus } from '../services/audioEngine';
import { getRecentlyPlayed } from '../services/storage';

interface VirtualizedStationGridProps {
  stations: RadioStation[];
  currentStation: RadioStation | null;
  isPlaying: boolean;
  playbackStatus?: PlaybackStatus;
  favorites: RadioStation[];
  favoriteSet: Set<string>;
  onPlayStation: (station: RadioStation) => void;
  onToggleFavorite: (station: RadioStation) => void;
  playlists: Playlist[];
  onAddToPlaylist: (playlistId: string, stationUuid: string) => void;
}

const ROW_HEIGHT = 168;
const OVERSCAN_ROWS = 3;

const VirtualizedStationGrid: React.FC<VirtualizedStationGridProps> = React.memo(({
  stations,
  currentStation,
  isPlaying,
  playbackStatus,
  favoriteSet,
  onPlayStation,
  onToggleFavorite,
  playlists,
  onAddToPlaylist
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [columns, setColumns] = useState(1);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(800);

  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth;
      if (width >= 1280) setColumns(4);
      else if (width >= 768) setColumns(3);
      else if (width >= 640) setColumns(2);
      else setColumns(1);

      if (containerRef.current) {
        const scrollParent = containerRef.current.closest('main') || window;
        const h = scrollParent === window ? window.innerHeight : (scrollParent as HTMLElement).clientHeight;
        setContainerHeight(h || 800);
      }
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scrollParent = el.closest('main') || window;

    const handleScroll = () => {
      if (!containerRef.current) return;
      let currentScrollY = 0;
      let gridTopInParent = 0;

      if (scrollParent === window) {
        currentScrollY = window.scrollY;
        const rect = containerRef.current.getBoundingClientRect();
        gridTopInParent = rect.top + window.scrollY;
      } else {
        const parentEl = scrollParent as HTMLElement;
        currentScrollY = parentEl.scrollTop;
        const rect = containerRef.current.getBoundingClientRect();
        const parentRect = parentEl.getBoundingClientRect();
        gridTopInParent = rect.top - parentRect.top + parentEl.scrollTop;
      }

      const relativeScroll = Math.max(0, currentScrollY - gridTopInParent);
      setScrollTop(relativeScroll);
    };

    handleScroll();
    scrollParent.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollParent.removeEventListener('scroll', handleScroll as any);
  }, [stations]);

  useEffect(() => {
    setScrollTop(0);
  }, [stations.length]);

  const totalRows = Math.ceil(stations.length / columns);
  const totalHeight = totalRows * ROW_HEIGHT;

  const startRow = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN_ROWS);
  const endRow = Math.min(Math.max(0, totalRows - 1), Math.ceil((scrollTop + containerHeight) / ROW_HEIGHT) + OVERSCAN_ROWS);

  const visibleRows = [];
  for (let r = startRow; r <= endRow && r < totalRows; r++) {
    const startIdx = r * columns;
    const rowStations = stations.slice(startIdx, startIdx + columns);
    visibleRows.push({
      rowIndex: r,
      top: r * ROW_HEIGHT,
      stations: rowStations
    });
  }

  return (
    <div ref={containerRef} style={{ height: Math.max(totalHeight, 180), position: 'relative' }} className="w-full">
      {visibleRows.map((row) => (
        <div
          key={row.rowIndex}
          style={{
            position: 'absolute',
            top: row.top,
            left: 0,
            right: 0,
            height: ROW_HEIGHT - 16
          }}
          className={`grid gap-4 ${
            columns === 4
              ? 'grid-cols-4'
              : columns === 3
              ? 'grid-cols-3'
              : columns === 2
              ? 'grid-cols-2'
              : 'grid-cols-1'
          }`}
        >
          {row.stations.map((station) => (
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
      ))}
    </div>
  );
});

interface DiscoverViewProps {
  stations: RadioStation[];
  isLoading: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  selectedCategory: string;
  setSelectedCategory: (catId: string) => void;
  selectedGroup: string;
  setSelectedGroup: (groupId: string) => void;
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

export const DiscoverView: React.FC<DiscoverViewProps> = React.memo(({
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
  const favoriteSet = React.useMemo(() => new Set(favorites.map((f) => f.stationuuid)), [favorites]);
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const groupScrollRef = useRef<HTMLDivElement>(null);

  const recentRadioStations = React.useMemo(() => {
    const list = getRecentlyPlayed();
    return list
      .filter((item) => item.type === 'radio' && item.radioStation)
      .map((item) => item.radioStation!)
      .slice(0, 10);
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

  // Map category icon name to Lucide icon component
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
    <div className="space-y-6">
      {/* Top Banner / Genre Chips */}
      <div className="space-y-3">
        {selectedCountry && selectedCountry !== 'TR' ? (
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-zinc-900/90 border border-amber-500/30 text-zinc-800 dark:text-zinc-200 shadow-sm">
            <div className="flex items-center space-x-3">
              <span className="text-xl">
                {ALL_COUNTRIES.find((c) => c.code === selectedCountry)?.flag || '🌍'}
              </span>
              <div>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white">
                  {ALL_COUNTRIES.find((c) => c.code === selectedCountry)?.name || COUNTRY_NAMES_TR[selectedCountry] || selectedCountry} Radyoları
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Yabancı ülke seçiminde tüm popüler istasyonlar kategori sınırlaması olmaksızın listelenmektedir.
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedCountry('TR')}
              className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-semibold shrink-0 transition-colors"
            >
              🇹🇷 Türkiye Radyoları
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h2 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                  Kategoriler & Müzik Türleri
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={onRefresh}
                  disabled={isLoading}
                  className="flex items-center space-x-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-amber-500 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-500' : ''}`} />
                  <span>Yenile</span>
                </button>
              </div>
            </div>

            {/* Scrollable Category Chips Container with Arrows */}
            <div className="relative group">
              {/* Left Scroll Arrow Button */}
              <button
                onClick={() => scrollCategory('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-zinc-700 shadow-md flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:text-amber-500 hover:scale-110 active:scale-95 transition-all opacity-80 group-hover:opacity-100"
                title="Sola Kaydır"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Category Items Scroll Wrapper */}
              <div
                ref={categoryScrollRef}
                onWheel={handleCategoryWheel}
                className="flex items-center space-x-2 overflow-x-auto py-1 px-8 sm:px-9 scroll-smooth touch-pan-x whitespace-nowrap scrollbar-thin scrollbar-thumb-amber-500/30 scrollbar-track-transparent select-none max-w-full overscroll-x-contain"
              >
                {GENRE_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setSelectedGroup('all_groups');
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-medium shrink-0 flex items-center space-x-2 border transition-all ${
                        isSelected
                          ? 'bg-amber-500 text-zinc-950 font-bold border-amber-500 shadow-md shadow-amber-500/20 scale-[1.02]'
                          : 'bg-white dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      {renderCategoryIcon(cat.iconName)}
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Right Scroll Arrow Button */}
              <button
                onClick={() => scrollCategory('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-zinc-700 shadow-md flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:text-amber-500 hover:scale-110 active:scale-95 transition-all opacity-80 group-hover:opacity-100"
                title="Sağa Kaydır"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Son Dinlenen Radyolar Widget */}
            {recentRadioStations.length > 0 && !searchQuery && (
              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <h3 className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Son Dinlenen Radyolar
                    </h3>
                  </div>
                </div>

                <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-none max-w-full touch-pan-x overscroll-x-contain">
                  {recentRadioStations.map((st) => {
                    const isThisPlaying = (currentStation?.id || currentStation?.stationuuid) === (st.id || st.stationuuid) && isPlaying;
                    return (
                      <div
                        key={st.id || st.stationuuid}
                        onClick={() => onPlayStation(st)}
                        className={`flex items-center space-x-2.5 px-3 py-2 rounded-xl border shrink-0 cursor-pointer transition-all ${
                          isThisPlaying
                            ? 'bg-amber-500/15 border-amber-500/60 shadow-sm'
                            : 'bg-white dark:bg-zinc-900/80 hover:bg-zinc-50 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800'
                        }`}
                      >
                        <img
                          src={st.favicon || 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=100&q=80'}
                          alt={st.name}
                          className="w-7 h-7 rounded-lg object-cover bg-zinc-800"
                          onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=100&q=80'; }}
                        />
                        <div className="min-w-0 pr-1">
                          <span className="text-xs font-bold text-zinc-900 dark:text-white truncate block max-w-[120px]">
                            {st.name}
                          </span>
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate block max-w-[120px]">
                            {st.tags ? st.tags.split(',')[0] : 'Radyo'}
                          </span>
                        </div>
                        {isThisPlaying ? (
                          <Pause className="w-3.5 h-3.5 text-amber-500 fill-current shrink-0" />
                        ) : (
                          <Play className="w-3.5 h-3.5 text-zinc-400 fill-current shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Radio Broadcasting Groups (Radyo Grupları) */}
            <div className="pt-2 space-y-2">
              <div className="flex items-center space-x-2">
                <Radio className="w-3.5 h-3.5 text-amber-500" />
                <h3 className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Radyo Grupları & Medya Ağları
                </h3>
              </div>

              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-amber-500/20 scrollbar-track-transparent">
                <button
                  onClick={() => {
                    setSelectedGroup('all_groups');
                    setSelectedCategory('all');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold shrink-0 transition-all border ${
                    selectedGroup === 'all_groups' || !selectedGroup
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 border-zinc-900 dark:border-zinc-100 shadow-sm'
                      : 'bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  Tüm Gruplar
                </button>
                {RADIO_GROUPS.map((grp) => {
                  const isGrpSelected = selectedGroup === grp.id;
                  return (
                    <button
                      key={grp.id}
                      onClick={() => {
                        setSelectedGroup(grp.id);
                        setSelectedCategory('all');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold shrink-0 transition-all border ${
                        isGrpSelected
                          ? 'bg-amber-500 text-zinc-950 border-amber-500 font-bold shadow-sm scale-[1.02]'
                          : 'bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      {grp.name}
                    </button>
                  );
                })}
                <button
                  onClick={() => {
                    setSelectedGroup('diger_grup');
                    setSelectedCategory('all');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold shrink-0 transition-all border ${
                    selectedGroup === 'diger_grup'
                      ? 'bg-amber-500 text-zinc-950 border-amber-500 font-bold shadow-sm scale-[1.02]'
                      : 'bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  Diğer Gruplar
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Stations Grid Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 pb-3">
        <div>
          <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
            <span>
              {searchQuery
                ? `Arama Sonuçları: "${searchQuery}"`
                : selectedGroup && selectedGroup !== 'all_groups'
                ? `${RADIO_GROUPS.find((g) => g.id === selectedGroup)?.name || (selectedGroup === 'diger_grup' ? 'Diğer Gruplar' : 'Medya Grubu')} Radyoları`
                : selectedCategory && selectedCategory !== 'all'
                ? `${GENRE_CATEGORIES.find((c) => c.id === selectedCategory)?.name || 'Kategori'} Radyoları`
                : selectedCountry
                ? `${ALL_COUNTRIES.find((c) => c.code === selectedCountry)?.name || COUNTRY_NAMES_TR[selectedCountry] || selectedCountry} Radyoları`
                : 'En Çok Dinlenen Radyolar'}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/60 font-mono">
              {stations.length} İstasyon
            </span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Canlı yayın akışını dinlemek için karta tıklayın
          </p>
        </div>

        {/* Quick Country Pills if no country filter selected */}
        {!selectedCountry && (
          <div className="hidden lg:flex items-center space-x-1 text-xs">
            {POPULAR_COUNTRIES.slice(0, 5).map((c) => (
              <button
                key={c.code}
                onClick={() => setSelectedCountry(c.code)}
                className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/50 flex items-center space-x-1 transition-colors"
              >
                <span>{c.flag}</span>
                <span className="text-[11px]">{c.code}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading Skeleton or Stations Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, idx) => (
            <div
              key={idx}
              className="h-36 rounded-2xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 animate-pulse p-4 flex flex-col justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
                  <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
                </div>
              </div>
              <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
            </div>
          ))}
        </div>
      ) : stations.length > 0 ? (
        <div className="space-y-6">
          <VirtualizedStationGrid
            stations={stations}
            currentStation={currentStation}
            isPlaying={isPlaying}
            playbackStatus={playbackStatus}
            favorites={favorites}
            favoriteSet={favoriteSet}
            onPlayStation={onPlayStation}
            onToggleFavorite={onToggleFavorite}
            playlists={playlists}
            onAddToPlaylist={onAddToPlaylist}
          />

          {/* Load More Button - Only show when no group/category filter is active and API has more results */}
          {hasMore !== false && onLoadMore && !selectedGroup || selectedGroup === 'all_groups' ? (
            selectedCategory === 'all' || !selectedCategory ? (
              !searchQuery ? (
                <div className="pt-4 pb-2 text-center">
                  <button
                    onClick={onLoadMore}
                    disabled={isLoadingMore}
                    className="px-6 py-3 rounded-2xl bg-white dark:bg-zinc-900/90 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-amber-500/40 text-amber-600 dark:text-amber-400 text-xs font-bold transition-all shadow-md hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center space-x-2 mx-auto"
                  >
                    {isLoadingMore ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                        <span>Daha Fazla İstasyon Yükleniyor...</span>
                      </>
                    ) : (
                      <>
                        <Radio className="w-4 h-4 text-amber-500" />
                        <span>Daha Fazla Radyo Yükle ({stations.length} İstasyon Gösteriliyor)</span>
                      </>
                    )}
                  </button>
                </div>
              ) : null
            ) : null
          ) : null}
        </div>
      ) : (
        <div className="py-16 text-center space-y-3 bg-white dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-800/60 p-8 shadow-sm">
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
              setSelectedGroup('all_groups');
              setSelectedCountry('TR');
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold rounded-xl transition-colors shadow-md"
          >
            Filtreleri Sıfırla (Türkiye)
          </button>
        </div>
      )}
    </div>
  );
});
