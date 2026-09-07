import React, { useState, useRef, useEffect, memo, useMemo } from 'react';
import { 
  Radio, 
  Search, 
  Globe2, 
  Wifi, 
  WifiOff, 
  Palette, 
  Moon, 
  Sun, 
  X,
  Check,
  Play,
  Mic,
  ArrowRight,
  Loader2,
  Sparkles,
  Layers
} from 'lucide-react';
import { RadioStation, PodcastShow, PodcastEpisode, AppThemeMode, ThemePalette } from '../types';
import { ALL_COUNTRIES, COUNTRY_NAMES_TR } from '../constants/categories';
import { ALL_TURKISH_STATIONS } from '../data/fallbackStations';
import { CURATED_TURKISH_PODCASTS } from '../data/curatedTurkishPodcasts';
import { searchStations } from '../services/radioApi';
import { searchPodcasts } from '../services/podcastApi';

interface DesktopHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCountry: string;
  setSelectedCountry: (code: string) => void;
  themeMode: AppThemeMode;
  setThemeMode: (mode: AppThemeMode) => void;
  themePalette: ThemePalette;
  setThemePalette: (palette: ThemePalette) => void;
  lowDataMode: boolean;
  setLowDataMode: (val: boolean) => void;
  activeTab: string;
  onNavigateToDiscover?: () => void;
  onOpenSearch?: () => void;
  onPlayStation?: (station: RadioStation) => void;
  onPlayPodcastEpisode?: (episode: PodcastEpisode) => void;
  onOpenPodcastShow?: (show: PodcastShow) => void;
}

const TRENDING_SEARCH_CHIPS = [
  'Power FM',
  'Kral Pop',
  'BBC World',
  'Virgin Radio',
  'Rock',
  'Haber',
  'Jazz',
  'Teknoloji'
];

export const DesktopHeader: React.FC<DesktopHeaderProps> = memo(({
  searchQuery,
  setSearchQuery,
  selectedCountry,
  setSelectedCountry,
  themeMode,
  setThemeMode,
  themePalette,
  setThemePalette,
  lowDataMode,
  setLowDataMode,
  onNavigateToDiscover,
  onOpenSearch,
  onPlayStation,
  onPlayPodcastEpisode,
  onOpenPodcastShow
}) => {
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const paletteRef = useRef<HTMLDivElement>(null);

  // Search dropdown state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchFilterTab, setSearchFilterTab] = useState<'all' | 'radio' | 'podcast'>('all');
  const [liveStations, setLiveStations] = useState<RadioStation[]>([]);
  const [livePodcasts, setLivePodcasts] = useState<PodcastShow[]>([]);
  const [isLiveLoading, setIsLiveLoading] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close palette & search dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (paletteRef.current && !paletteRef.current.contains(event.target as Node)) {
        setIsPaletteOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search for world stations & podcasts
  useEffect(() => {
    const trimmed = searchQuery.trim().toLowerCase();
    if (trimmed.length < 2) {
      setLiveStations([]);
      setLivePodcasts([]);
      setIsLiveLoading(false);
      return;
    }

    setIsLiveLoading(true);
    const timer = setTimeout(async () => {
      try {
        const [stationsRes, podcastsRes] = await Promise.allSettled([
          searchStations({ q: trimmed }),
          searchPodcasts(trimmed)
        ]);

        if (stationsRes.status === 'fulfilled') {
          setLiveStations(stationsRes.value || []);
        }
        if (podcastsRes.status === 'fulfilled') {
          setLivePodcasts(podcastsRes.value || []);
        }
      } catch (err) {
        console.warn('Live search error:', err);
      } finally {
        setIsLiveLoading(false);
      }
    }, 260);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Merge matching stations (Turkish + World)
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const matchingStations = useMemo(() => {
    if (!normalizedQuery) return [];
    const seenNames = new Set<string>();
    const list: RadioStation[] = [];

    // Local Turkish verified stations
    for (const s of ALL_TURKISH_STATIONS) {
      if (
        s.name.toLowerCase().includes(normalizedQuery) ||
        (s.tags && s.tags.toLowerCase().includes(normalizedQuery))
      ) {
        const key = s.name.toLowerCase().trim();
        if (!seenNames.has(key)) {
          seenNames.add(key);
          list.push(s);
        }
      }
    }

    // Live World stations
    for (const s of liveStations) {
      const key = s.name.toLowerCase().trim();
      if (!seenNames.has(key)) {
        seenNames.add(key);
        list.push(s);
      }
    }

    return list.slice(0, 8);
  }, [normalizedQuery, liveStations]);

  // Merge matching podcasts (Curated + Live)
  const matchingPodcasts = useMemo(() => {
    if (!normalizedQuery) return [];
    const seenTitles = new Set<string>();
    const list: PodcastShow[] = [];

    // Live podcasts
    for (const p of livePodcasts) {
      const key = (p.feedUrl || p.title).toLowerCase().trim();
      if (!seenTitles.has(key)) {
        seenTitles.add(key);
        list.push(p);
      }
    }

    // Curated Turkish podcasts
    for (const p of CURATED_TURKISH_PODCASTS) {
      if (
        p.title.toLowerCase().includes(normalizedQuery) ||
        p.publisher.toLowerCase().includes(normalizedQuery) ||
        p.category.toLowerCase().includes(normalizedQuery) ||
        p.description.toLowerCase().includes(normalizedQuery)
      ) {
        const key = (p.feedUrl || p.title).toLowerCase().trim();
        if (!seenTitles.has(key)) {
          seenTitles.add(key);
          list.push({
            id: p.id,
            title: p.title,
            publisher: p.publisher,
            feedUrl: p.feedUrl,
            coverUrl: p.coverUrl,
            category: p.category,
            description: p.description,
            episodes: []
          });
        }
      }
    }

    return list.slice(0, 6);
  }, [normalizedQuery, livePodcasts]);

  // Country match shortcut
  const matchedCountry = useMemo(() => {
    if (!normalizedQuery || normalizedQuery.length < 2) return null;
    return ALL_COUNTRIES.find(
      c => c.name.toLowerCase().includes(normalizedQuery) || c.code.toLowerCase() === normalizedQuery
    );
  }, [normalizedQuery]);

  // Top result calculation
  const topResult = useMemo(() => {
    if (!normalizedQuery) return null;
    if (matchingStations.length > 0) {
      return { type: 'station' as const, item: matchingStations[0] };
    }
    if (matchingPodcasts.length > 0) {
      return { type: 'podcast' as const, item: matchingPodcasts[0] };
    }
    return null;
  }, [normalizedQuery, matchingStations, matchingPodcasts]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsSearchOpen(false);
      inputRef.current?.blur();
    } else if (e.key === 'Enter') {
      setIsSearchOpen(false);
      if (onNavigateToDiscover) onNavigateToDiscover();
    }
  };

  const handleSelectChip = (chip: string) => {
    setSearchQuery(chip);
    setIsSearchOpen(true);
    inputRef.current?.focus();
  };

  const palettes: { id: ThemePalette; name: string; color: string }[] = [
    { id: 'pure-carbon', name: 'Velvet Carbon', color: 'bg-zinc-800' },
    { id: 'neon-ocean', name: 'Slate Night', color: 'bg-slate-700' },
    { id: 'cyber-orchid', name: 'Warm Amber', color: 'bg-amber-500' },
    { id: 'cosmic-slate', name: 'Emerald Soft', color: 'bg-emerald-500' },
  ];

  return (
    <header className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-2.5 border-b border-zinc-200/60 dark:border-white/[0.06] bg-white/90 dark:bg-[#0e0f12]/95 backdrop-blur-xl select-none shrink-0 gap-3 z-40 transition-colors">
      {/* Title & App Branding */}
      <div 
        onClick={onNavigateToDiscover}
        className="flex items-center space-x-2.5 cursor-pointer hover:opacity-90 transition-opacity"
        title="Anasayfaya Git"
      >
        <div className="w-8 h-8 rounded-xl bg-emerald-500 text-zinc-950 font-bold shadow-md shadow-emerald-500/20 flex items-center justify-center">
          <Radio className="w-4 h-4 text-zinc-950" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-sm sm:text-base tracking-tight text-zinc-900 dark:text-white">
              RadioCast
            </span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
              CANLI
            </span>
          </div>
        </div>
      </div>

      {/* Center Live Search Bar (Spotify / Fizy Rounded Pill with Inline Dropdown) */}
      <div className="flex-1 max-w-lg mx-2 min-w-[220px] relative" ref={searchContainerRef}>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (!isSearchOpen) setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Radyo, podcast, tür veya sanatçı ara..."
            className="w-full pl-10 pr-16 py-2 text-xs rounded-full bg-zinc-100 dark:bg-white/[0.06] text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 border border-zinc-200/80 dark:border-white/[0.08] focus:outline-none focus:border-emerald-500/60 focus:bg-white dark:focus:bg-[#14151a] transition-all shadow-inner"
          />

          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {isLiveLoading && (
              <Loader2 className="w-3.5 h-3.5 text-emerald-500 animate-spin mr-1" />
            )}
            {searchQuery ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setLiveStations([]);
                  setLivePodcasts([]);
                  inputRef.current?.focus();
                }}
                className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors cursor-pointer"
                title="Aramayı Temizle"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onOpenSearch}
                className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-200 dark:bg-white/10 text-zinc-500 dark:text-zinc-400 hover:bg-emerald-500 hover:text-zinc-950 transition-colors cursor-pointer"
                title="Gelişmiş Arama Penceresi (⌘K)"
              >
                ⌘K
              </button>
            )}
          </div>
        </div>

        {/* Floating Velvety Soft Search Dropdown */}
        {isSearchOpen && (
          <div className="absolute left-0 right-0 top-full mt-2 w-full min-w-[320px] sm:min-w-[440px] md:min-w-[500px] max-h-[460px] overflow-y-auto bg-white/95 dark:bg-[#121318]/98 backdrop-blur-2xl border border-zinc-200/80 dark:border-white/10 rounded-2xl shadow-2xl z-50 p-3.5 space-y-3 animate-in fade-in zoom-in-95">
            {/* Filter Tabs if query is typed */}
            {normalizedQuery && (
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/[0.06] pb-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSearchFilterTab('all')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      searchFilterTab === 'all'
                        ? 'bg-emerald-500 text-zinc-950'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5'
                    }`}
                  >
                    Tümü
                  </button>
                  <button
                    onClick={() => setSearchFilterTab('radio')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      searchFilterTab === 'radio'
                        ? 'bg-emerald-500 text-zinc-950'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5'
                    }`}
                  >
                    Radyolar ({matchingStations.length})
                  </button>
                  <button
                    onClick={() => setSearchFilterTab('podcast')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      searchFilterTab === 'podcast'
                        ? 'bg-emerald-500 text-zinc-950'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5'
                    }`}
                  >
                    Podcastler ({matchingPodcasts.length})
                  </button>
                </div>

                <span className="text-[10px] text-zinc-400">
                  {matchingStations.length + matchingPodcasts.length} sonuç
                </span>
              </div>
            )}

            {/* Empty State: Trending Search Suggestions */}
            {!normalizedQuery && (
              <div className="space-y-2 py-1">
                <div className="flex items-center justify-between text-[11px] text-zinc-400 font-bold px-1">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Popüler Aramalar
                  </span>
                  <span className="text-[10px] text-zinc-500">Doğrudan Ara</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {TRENDING_SEARCH_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => handleSelectChip(chip)}
                      className="px-3 py-1.5 rounded-full text-xs bg-zinc-100 dark:bg-white/[0.06] hover:bg-emerald-500/15 hover:text-emerald-500 border border-zinc-200/80 dark:border-white/[0.06] text-zinc-700 dark:text-zinc-300 font-medium transition-all active:scale-95 cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Country Shortcut Banner */}
            {matchedCountry && (
              <div 
                onClick={() => {
                  setSelectedCountry(matchedCountry.code);
                  setIsSearchOpen(false);
                  if (onNavigateToDiscover) onNavigateToDiscover();
                }}
                className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{matchedCountry.flag}</span>
                  <div>
                    <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                      {matchedCountry.name} Radyoları
                    </span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      Bu ülkedeki tüm canlı yayınları filtrele
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-500" />
              </div>
            )}

            {/* Top Match Card */}
            {normalizedQuery && topResult && searchFilterTab === 'all' && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1 block">
                  En İyi Eşleşme
                </span>
                <div 
                  onClick={() => {
                    if (topResult.type === 'station') {
                      onPlayStation?.(topResult.item as RadioStation);
                    } else if (topResult.type === 'podcast') {
                      onOpenPodcastShow?.(topResult.item as PodcastShow);
                    }
                    setIsSearchOpen(false);
                  }}
                  className="p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.04] hover:bg-emerald-500/10 border border-zinc-200/80 dark:border-white/[0.06] hover:border-emerald-500/30 flex items-center justify-between gap-3 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {topResult.type === 'station' ? (
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                        <Radio className="w-5 h-5" />
                      </div>
                    ) : (
                      <img 
                        src={(topResult.item as PodcastShow).coverUrl || 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=100'} 
                        alt="" 
                        className="w-10 h-10 rounded-lg object-cover shrink-0" 
                      />
                    )}
                    <div className="min-w-0">
                      <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white truncate block group-hover:text-emerald-500 transition-colors">
                        {(topResult.item as any).name || (topResult.item as any).title}
                      </span>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block truncate">
                        {topResult.type === 'station' 
                          ? `${(topResult.item as RadioStation).country || 'Radyo'} • ${(topResult.item as RadioStation).tags || 'Canlı'}`
                          : `${(topResult.item as PodcastShow).publisher || 'Podcast'} • ${(topResult.item as PodcastShow).category || ''}`
                        }
                      </span>
                    </div>
                  </div>

                  <button
                    className="p-2 rounded-full bg-emerald-500 text-zinc-950 shadow-md group-hover:scale-105 transition-transform shrink-0"
                    title="Oynat"
                  >
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Radio Stations List */}
            {normalizedQuery && (searchFilterTab === 'all' || searchFilterTab === 'radio') && matchingStations.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1 block">
                  Radyo İstasyonları ({matchingStations.length})
                </span>
                <div className="space-y-1">
                  {matchingStations.map((station) => (
                    <div
                      key={station.stationuuid || station.id}
                      onClick={() => {
                        onPlayStation?.(station);
                        setIsSearchOpen(false);
                      }}
                      className="px-2.5 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/[0.06] flex items-center justify-between gap-2.5 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-zinc-200 dark:bg-white/10 flex items-center justify-center text-zinc-600 dark:text-zinc-300 shrink-0 group-hover:bg-emerald-500 group-hover:text-zinc-950 transition-colors">
                          <Radio className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate block group-hover:text-emerald-500 transition-colors">
                            {station.name}
                          </span>
                          <span className="text-[10px] text-zinc-400 truncate block">
                            {station.country || 'Global'} • {station.codec || 'MP3'} {station.bitrate ? `${station.bitrate}kbps` : ''}
                          </span>
                        </div>
                      </div>

                      <button
                        className="p-1.5 rounded-full text-zinc-400 group-hover:text-emerald-500 group-hover:bg-emerald-500/10 transition-colors"
                        title="Oynat"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Podcasts List */}
            {normalizedQuery && (searchFilterTab === 'all' || searchFilterTab === 'podcast') && matchingPodcasts.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1 block">
                  Podcastler ({matchingPodcasts.length})
                </span>
                <div className="space-y-1">
                  {matchingPodcasts.map((podcast) => (
                    <div
                      key={podcast.id || podcast.feedUrl}
                      onClick={() => {
                        onOpenPodcastShow?.(podcast);
                        setIsSearchOpen(false);
                      }}
                      className="px-2.5 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/[0.06] flex items-center justify-between gap-2.5 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={podcast.coverUrl || 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=100'}
                          alt=""
                          className="w-7 h-7 rounded-lg object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate block group-hover:text-amber-500 transition-colors">
                            {podcast.title}
                          </span>
                          <span className="text-[10px] text-zinc-400 truncate block">
                            {podcast.publisher} • {podcast.category}
                          </span>
                        </div>
                      </div>

                      <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-amber-500 transition-colors shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results Found */}
            {normalizedQuery && !isLiveLoading && matchingStations.length === 0 && matchingPodcasts.length === 0 && (
              <div className="py-6 text-center text-zinc-400 text-xs space-y-2">
                <p>"{searchQuery}" için doğrudan eşleşen istasyon veya podcast bulunamadı.</p>
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    if (onNavigateToDiscover) onNavigateToDiscover();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs transition-all active:scale-95 cursor-pointer"
                >
                  Keşfet Sayfasında Canlı Ara
                </button>
              </div>
            )}

            {/* Footer Quick Action */}
            {normalizedQuery && (
              <div className="pt-2 border-t border-zinc-100 dark:border-white/[0.06] flex items-center justify-between text-[11px]">
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    if (onNavigateToDiscover) onNavigateToDiscover();
                  }}
                  className="font-bold text-emerald-500 hover:text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Tüm sonuçları Keşfet sekmesinde listele</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline">
                  Enter ↵
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls: Country Selector, Low Data Mode, Palette Selector, Dark/Light */}
      <div className="flex items-center space-x-2 text-xs">
        {/* Country Quick Switcher */}
        <div className="relative hidden sm:flex items-center">
          <Globe2 className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 pointer-events-none" />
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="pl-7 pr-3 py-1.5 text-xs rounded-full bg-zinc-100 dark:bg-white/[0.06] text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-white/[0.08] focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer hover:bg-zinc-200 dark:hover:bg-white/10 transition-colors"
          >
            <option value="">Tüm Ülkeler</option>
            {ALL_COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Low Data Mode Toggle Button */}
        <button
          onClick={() => setLowDataMode(!lowDataMode)}
          title={lowDataMode ? 'Düşük Veri Modu Açık' : 'Düşük Veri Modunu Aç'}
          className={`px-3 py-1.5 rounded-full border flex items-center space-x-1.5 transition-all cursor-pointer ${
            lowDataMode
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 font-semibold'
              : 'bg-zinc-100 dark:bg-white/[0.06] border-zinc-200/80 dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/10'
          }`}
        >
          {lowDataMode ? <WifiOff className="w-3.5 h-3.5 text-amber-400" /> : <Wifi className="w-3.5 h-3.5 text-emerald-400" />}
          <span className="hidden md:inline font-medium text-[11px]">
            {lowDataMode ? 'Tasarruf' : 'Normal'}
          </span>
        </button>

        {/* Theme Palette Click Popover */}
        <div className="relative" ref={paletteRef}>
          <button
            onClick={() => setIsPaletteOpen(!isPaletteOpen)}
            title="Renk Temasını Değiştir"
            className={`p-1.5 sm:px-3 sm:py-1.5 rounded-full border flex items-center space-x-1.5 transition-all cursor-pointer ${
              isPaletteOpen
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'bg-zinc-100 dark:bg-white/[0.06] border-zinc-200/80 dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-white/10'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden lg:inline text-[11px] font-medium">Tema</span>
          </button>

          {isPaletteOpen && (
            <div className="absolute right-0 top-full mt-2 bg-white dark:bg-[#18191e] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl p-2.5 w-44 space-y-1.5 z-50 animate-in fade-in zoom-in-95">
              <span className="text-[10px] text-zinc-400 font-bold px-2 uppercase tracking-wider block">
                Tema Paleti
              </span>
              {palettes.map((p) => {
                const isActive = themePalette === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setThemePalette(p.id);
                      setIsPaletteOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className={`w-3 h-3 rounded-full ${p.color}`} />
                      <span>{p.name}</span>
                    </div>
                    {isActive && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Dark/Light Mode Direct Switcher */}
        <button
          onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
          title={themeMode === 'dark' ? 'Gündüz Moduna Geç' : 'Gece Moduna Geç'}
          className="p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-zinc-100 dark:bg-white/[0.06] border border-zinc-200/80 dark:border-white/[0.08] text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-white/10 flex items-center space-x-1.5 transition-all cursor-pointer"
        >
          {themeMode === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline text-[11px] font-medium">Gündüz</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-zinc-800" />
              <span className="hidden lg:inline text-[11px] font-medium">Gece</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
});
