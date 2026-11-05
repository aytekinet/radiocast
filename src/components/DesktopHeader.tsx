import React, { useState, useRef, useEffect, memo, useMemo } from 'react';
import { 
  Search, 
  Moon, 
  Sun, 
  X, 
  Play, 
  Radio, 
  Mic, 
  ArrowRight,
  Loader2,
  Globe2
} from 'lucide-react';
import { RadioStation, PodcastShow, PodcastEpisode, AppThemeMode, ThemePalette } from '../types';
import { ALL_COUNTRIES } from '../constants/categories';
import { ALL_TURKISH_STATIONS } from '../data/fallbackStations';
import { CURATED_TURKISH_PODCASTS } from '../data/curatedTurkishPodcasts';
import { normalizeTurkishText, turkishIncludes, calculateRelevanceScore } from '../utils/turkishSearch';
import { AppLocale } from '../services/localization';

interface DesktopHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCountry: string;
  setSelectedCountry: (code: string) => void;
  themeMode: AppThemeMode;
  setThemeMode: (mode: AppThemeMode) => void;
  themePalette?: ThemePalette;
  setThemePalette?: (palette: ThemePalette) => void;
  lowDataMode?: boolean;
  setLowDataMode?: (val: boolean) => void;
  activeTab?: string;
  onNavigateToDiscover?: () => void;
  onNavigateToSearch?: (query: string, type?: 'all' | 'radio' | 'podcast') => void;
  onOpenSearch?: () => void;
  onPlayStation?: (station: RadioStation) => void;
  onPlayPodcastEpisode?: (episode: PodcastEpisode) => void;
  onOpenPodcastShow?: (show: PodcastShow) => void;
  locale?: AppLocale;
  onSelectLocale?: (loc: AppLocale) => void;
}

export const DesktopHeader: React.FC<DesktopHeaderProps> = memo(({
  searchQuery,
  setSearchQuery,
  selectedCountry,
  setSelectedCountry,
  themeMode,
  setThemeMode,
  onNavigateToDiscover,
  onNavigateToSearch,
  onPlayStation,
  onOpenPodcastShow
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchFilterTab, setSearchFilterTab] = useState<'all' | 'radio' | 'podcast'>('all');
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close search dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const normalizedQuery = useMemo(() => normalizeTurkishText(searchQuery), [searchQuery]);

  // Fast scored station matches
  const matchingStations = useMemo(() => {
    if (!normalizedQuery) return [];
    return ALL_TURKISH_STATIONS
      .map(station => ({
        station,
        score: calculateRelevanceScore(station.name, '', station.tags || '', '', normalizedQuery)
      }))
      .filter(m => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(m => m.station);
  }, [normalizedQuery]);

  // Fast scored podcast matches
  const matchingPodcasts = useMemo(() => {
    if (!normalizedQuery) return [];
    return CURATED_TURKISH_PODCASTS
      .map(podcast => ({
        podcast,
        score: calculateRelevanceScore(podcast.title, podcast.publisher, podcast.category, podcast.description, normalizedQuery)
      }))
      .filter(m => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(m => m.podcast);
  }, [normalizedQuery]);

  // Determine top relevant result
  const topResult = useMemo(() => {
    if (!normalizedQuery) return null;
    const topStation = matchingStations[0];
    const topPodcast = matchingPodcasts[0];

    if (!topStation && !topPodcast) return null;
    if (topStation && !topPodcast) return { type: 'station', item: topStation };
    if (!topStation && topPodcast) return { type: 'podcast', item: topPodcast };

    const stationScore = calculateRelevanceScore(topStation.name, '', topStation.tags || '', '', normalizedQuery);
    const podcastScore = calculateRelevanceScore(topPodcast.title, topPodcast.publisher, topPodcast.category, topPodcast.description, normalizedQuery);

    return stationScore >= podcastScore
      ? { type: 'station', item: topStation }
      : { type: 'podcast', item: topPodcast };
  }, [normalizedQuery, matchingStations, matchingPodcasts]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setIsSearchOpen(false);
      const q = searchQuery.trim();
      if (q && onNavigateToSearch) {
        onNavigateToSearch(q, searchFilterTab);
      } else if (onNavigateToDiscover) {
        onNavigateToDiscover();
      }
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <header className="h-16 bg-[#0B0E14] border-b border-[#161F2B] px-4 sm:px-6 flex items-center justify-between gap-4 select-none shrink-0 z-30 transition-colors">
      {/* Mobile Brand Icon (hidden on desktop where Sidebar has it) */}
      <div 
        onClick={() => onNavigateToDiscover?.()}
        className="flex md:hidden items-center space-x-2 cursor-pointer shrink-0"
      >
        <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
          <Radio className="w-4 h-4 text-teal-400" />
        </div>
        <span className="font-bold text-base text-white tracking-tight">RadioCast</span>
      </div>

      {/* Global Center Search Bar */}
      <div className="relative flex-1 max-w-2xl mx-auto" ref={searchContainerRef}>
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
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
            placeholder="Radyo veya podcast ara..."
            className="w-full pl-10 pr-10 py-2 text-xs rounded-full bg-[#131B24] text-zinc-100 placeholder-zinc-500 border border-[#1F2937] focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/30 transition-all"
          />

          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                inputRef.current?.focus();
              }}
              className="absolute right-3 p-1 text-zinc-500 hover:text-white transition-colors cursor-pointer"
              title="Aramayı Temizle"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Lightweight Search Suggestion Popover */}
        {isSearchOpen && normalizedQuery && (
          <div className="absolute left-0 right-0 top-full mt-2 w-full max-h-[420px] overflow-y-auto bg-[#111822] border border-[#1F2937] rounded-2xl shadow-2xl z-50 p-3 space-y-3">
            {/* Top Match */}
            {topResult && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider px-1">
                  En İyi Eşleşme
                </span>
                <div
                  onClick={() => {
                    if (topResult.type === 'station') {
                      onPlayStation?.(topResult.item as RadioStation);
                    } else if (onOpenPodcastShow) {
                      onOpenPodcastShow(topResult.item as any);
                    }
                    setIsSearchOpen(false);
                  }}
                  className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-teal-500/10 border border-white/[0.06] hover:border-teal-500/30 flex items-center justify-between cursor-pointer transition-all"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-[#182330] border border-white/[0.08] flex items-center justify-center text-teal-400 shrink-0 font-bold text-xs">
                      {topResult.type === 'station' ? (topResult.item as RadioStation).name.slice(0, 2).toUpperCase() : (topResult.item as any).title.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-white truncate">
                        {topResult.type === 'station' ? (topResult.item as RadioStation).name : (topResult.item as any).title}
                      </h4>
                      <p className="text-[11px] text-zinc-400 truncate">
                        {topResult.type === 'station' ? ((topResult.item as RadioStation).tags || 'Canlı Radyo') : ((topResult.item as any).publisher || 'Podcast')}
                      </p>
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-teal-500 text-black flex items-center justify-center shrink-0">
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </div>
                </div>
              </div>
            )}

            {/* Matching Stations List */}
            {matchingStations.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1">
                  Radyolar ({matchingStations.length})
                </span>
                {matchingStations.slice(0, 3).map((st) => (
                  <div
                    key={st.stationuuid || st.id}
                    onClick={() => {
                      onPlayStation?.(st);
                      setIsSearchOpen(false);
                    }}
                    className="p-2 rounded-lg hover:bg-white/[0.04] flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <Radio className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span className="text-xs font-semibold text-zinc-200 truncate">{st.name}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 shrink-0">{st.tags?.split('•')[0] || 'Radyo'}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Matching Podcasts List */}
            {matchingPodcasts.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1">
                  Podcastler ({matchingPodcasts.length})
                </span>
                {matchingPodcasts.slice(0, 3).map((pod) => (
                  <div
                    key={pod.id}
                    onClick={() => {
                      if (onOpenPodcastShow) onOpenPodcastShow(pod as any);
                      setIsSearchOpen(false);
                    }}
                    className="p-2 rounded-lg hover:bg-white/[0.04] flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <Mic className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span className="text-xs font-semibold text-zinc-200 truncate">{pod.title}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 shrink-0">{pod.publisher}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Footer Navigation */}
            <div className="pt-2 border-t border-[#1F2937] flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  const q = searchQuery.trim();
                  if (onNavigateToSearch) onNavigateToSearch(q, searchFilterTab);
                }}
                className="font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>"{searchQuery}" için tüm sonuçları gör</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] text-zinc-500 font-mono">Enter ↵</span>
            </div>
          </div>
        )}
      </div>

      {/* Right Controls: Country Selector & Moon Theme Button */}
      <div className="flex items-center space-x-2 text-xs shrink-0">
        {/* Country Selector */}
        <div className="relative flex items-center">
          <Globe2 className="w-3.5 h-3.5 text-zinc-400 absolute left-3 pointer-events-none" />
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="pl-8 pr-7 py-1.5 text-xs font-medium rounded-full bg-[#131B24] text-zinc-200 border border-[#1F2937] focus:outline-none focus:border-teal-500 appearance-none cursor-pointer hover:bg-[#182330] transition-colors"
          >
            <option value="TR">Türkiye</option>
            <option value="">Tüm Dünya</option>
            {ALL_COUNTRIES.filter(c => c.code !== 'TR').map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
          <span className="absolute right-2.5 pointer-events-none text-zinc-400 text-[10px]">▼</span>
        </div>

        {/* Theme Mode Toggle (Moon / Sun) */}
        <button
          onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
          title={themeMode === 'dark' ? 'Açık Temaya Geç' : 'Koyu Temaya Geç'}
          className="w-8 h-8 rounded-full bg-[#131B24] border border-[#1F2937] text-zinc-300 hover:text-teal-400 hover:bg-[#182330] flex items-center justify-center transition-all cursor-pointer"
        >
          {themeMode === 'dark' ? (
            <Moon className="w-4 h-4 text-zinc-300 hover:text-teal-400 transition-colors" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400" />
          )}
        </button>
      </div>
    </header>
  );
});
