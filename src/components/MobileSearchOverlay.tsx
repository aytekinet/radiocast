import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  ArrowLeft, 
  Search, 
  X, 
  Play, 
  Radio, 
  Mic, 
  ArrowRight, 
  Loader2,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { RadioStation, PodcastShow, PodcastEpisode } from '../types';
import { ALL_TURKISH_STATIONS } from '../data/fallbackStations';
import { CURATED_TURKISH_PODCASTS } from '../data/curatedTurkishPodcasts';
import { normalizeTurkishText, calculateRelevanceScore } from '../utils/turkishSearch';
import { searchStations } from '../services/radioApi';
import { searchPodcasts } from '../services/podcastApi';

interface MobileSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onNavigateToSearch: (query: string, type?: 'all' | 'radio' | 'podcast') => void;
  onPlayStation: (station: RadioStation) => void;
  onOpenPodcastShow?: (show: PodcastShow) => void;
  onPlayPodcastEpisode?: (episode: PodcastEpisode) => void;
}

const POPULAR_SEARCH_CHIPS = [
  'Kral Pop',
  'TRT FM',
  'Evrim Ağacı',
  'Kafa Radyo',
  'Aposto Altı Otuz',
  'PowerTürk',
  'SlowTürk',
  'Yazılımcının Dünyası',
  'Haber',
  'Spor'
];

function getMonogram(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export const MobileSearchOverlay: React.FC<MobileSearchOverlayProps> = ({
  isOpen,
  onClose,
  searchQuery,
  setSearchQuery,
  onNavigateToSearch,
  onPlayStation,
  onOpenPodcastShow,
  onPlayPodcastEpisode
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [remoteStations, setRemoteStations] = useState<RadioStation[]>([]);
  const [remotePodcasts, setRemotePodcasts] = useState<PodcastShow[]>([]);
  const [isSearchingRemote, setIsSearchingRemote] = useState(false);
  const pushedHistoryRef = useRef(false);

  // Auto-focus input when opened & prevent iOS zoom with 16px font
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 60);

      // Push history state so Android gesture/hardware back button closes this overlay
      try {
        if (!pushedHistoryRef.current) {
          window.history.pushState({ mobileSearchOverlay: true }, '');
          pushedHistoryRef.current = true;
        }
      } catch {
        // sandbox safe
      }

      const handlePopState = () => {
        pushedHistoryRef.current = false;
        onClose();
      };

      window.addEventListener('popstate', handlePopState);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('popstate', handlePopState);
      };
    } else {
      pushedHistoryRef.current = false;
    }
  }, [isOpen, onClose]);

  // Handle explicit close via Back Arrow button
  const handleBackClose = useCallback(() => {
    if (pushedHistoryRef.current) {
      pushedHistoryRef.current = false;
      try {
        window.history.back();
      } catch {
        onClose();
      }
    } else {
      onClose();
    }
  }, [onClose]);

  // Turkish-aware normalized query
  const normalizedQuery = useMemo(() => normalizeTurkishText(searchQuery), [searchQuery]);

  // Remote debounced search for queries >= 2 chars
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setRemoteStations([]);
      setRemotePodcasts([]);
      setIsSearchingRemote(false);
      return;
    }

    setIsSearchingRemote(true);
    const timer = setTimeout(async () => {
      try {
        const [stRes, podRes] = await Promise.allSettled([
          searchStations({ q: trimmed }),
          searchPodcasts(trimmed)
        ]);
        if (stRes.status === 'fulfilled') {
          setRemoteStations(stRes.value || []);
        }
        if (podRes.status === 'fulfilled') {
          // Strictly Turkish podcasts only
          const filteredPods = (podRes.value || []).filter(p => {
            const lang = ((p as any).language || '').toLowerCase();
            return !lang || lang.startsWith('tr') || lang.includes('turkish');
          });
          setRemotePodcasts(filteredPods);
        }
      } catch {
        // ignore network error
      } finally {
        setIsSearchingRemote(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Local scored stations + deduplicated remote
  const matchingStations = useMemo(() => {
    if (!normalizedQuery) return [];
    const seenUuids = new Set<string>();
    const seenNames = new Set<string>();
    const list: RadioStation[] = [];

    // 1. Scored local stations
    const scoredLocal = ALL_TURKISH_STATIONS
      .map(station => ({
        station,
        score: calculateRelevanceScore(station.name, '', station.tags || '', '', normalizedQuery)
      }))
      .filter(m => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(m => m.station);

    for (const s of scoredLocal) {
      const id = s.stationuuid || s.id;
      const cleanName = s.name.toLowerCase().trim();
      if (!seenUuids.has(id) && !seenNames.has(cleanName)) {
        seenUuids.add(id);
        seenNames.add(cleanName);
        list.push(s);
      }
    }

    // 2. Remote station search results
    for (const s of remoteStations) {
      const id = s.stationuuid || s.id;
      const cleanName = s.name.toLowerCase().trim();
      if (!seenUuids.has(id) && !seenNames.has(cleanName)) {
        seenUuids.add(id);
        seenNames.add(cleanName);
        list.push(s);
      }
    }

    return list.slice(0, 8);
  }, [normalizedQuery, remoteStations]);

  // Local scored Turkish podcasts + remote
  const matchingPodcasts = useMemo(() => {
    if (!normalizedQuery) return [];
    const seenIds = new Set<string>();
    const seenTitles = new Set<string>();
    const list: PodcastShow[] = [];

    // 1. Curated Turkish podcasts
    const scoredCurated = CURATED_TURKISH_PODCASTS
      .map(podcast => ({
        podcast: {
          id: podcast.id,
          title: podcast.title,
          publisher: podcast.publisher,
          feedUrl: podcast.feedUrl,
          coverUrl: podcast.coverUrl,
          category: podcast.category,
          description: podcast.description,
          lastEpisodeDate: (podcast as any).lastEpisodeDate || (podcast as any).dateLabel || '',
          episodes: []
        } as PodcastShow,
        score: calculateRelevanceScore(podcast.title, podcast.publisher, podcast.category, podcast.description, normalizedQuery)
      }))
      .filter(m => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(m => m.podcast);

    for (const p of scoredCurated) {
      const cleanTitle = p.title.toLowerCase().trim();
      if (!seenIds.has(p.id) && !seenTitles.has(cleanTitle)) {
        seenIds.add(p.id);
        seenTitles.add(cleanTitle);
        list.push(p);
      }
    }

    // 2. Remote Turkish podcasts
    for (const p of remotePodcasts) {
      const cleanTitle = p.title.toLowerCase().trim();
      if (!seenIds.has(p.id) && !seenTitles.has(cleanTitle)) {
        seenIds.add(p.id);
        seenTitles.add(cleanTitle);
        list.push(p);
      }
    }

    return list.slice(0, 6);
  }, [normalizedQuery, remotePodcasts]);

  const handleSubmitSearch = useCallback(() => {
    const q = searchQuery.trim();
    if (!q) return;
    onNavigateToSearch(q, 'all');
    handleBackClose();
  }, [searchQuery, onNavigateToSearch, handleBackClose]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmitSearch();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleBackClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#070B0E] text-white select-none overscroll-contain h-[100dvh]">
      {/* Search Header Bar */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-[#0D1219] border-b border-[#1A2330] shrink-0">
        {/* Back Button */}
        <button
          type="button"
          onClick={handleBackClose}
          className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-zinc-300 hover:text-white hover:bg-[#161F2B] active:scale-95 transition-all cursor-pointer"
          aria-label="Aramayı Kapat ve Geri Dön"
        >
          <ArrowLeft className="w-5 h-5 text-zinc-300" />
        </button>

        {/* Search Input Box */}
        <div className="flex-1 relative flex items-center">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 pointer-events-none" />
          <input
            ref={inputRef}
            type="search"
            inputMode="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Radyo veya podcast ara..."
            style={{ fontSize: '16px' }}
            className="w-full h-11 pl-10 pr-10 rounded-xl bg-[#131B24] border border-[#1F2937] text-white placeholder-zinc-500 text-base focus:outline-none focus:border-teal-500/70 focus:ring-1 focus:ring-teal-500/30 transition-all"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                inputRef.current?.focus();
              }}
              className="absolute right-0 top-0 bottom-0 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
              aria-label="Aramayı Temizle"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Submit "Ara" Button */}
        {searchQuery.trim() && (
          <button
            type="button"
            onClick={handleSubmitSearch}
            className="h-11 px-3.5 min-h-[44px] rounded-xl bg-teal-500 text-black font-bold text-xs hover:bg-teal-400 active:scale-95 transition-all flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <span>Ara</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        )}
      </div>

      {/* Scrollable Results & Suggestions Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 overscroll-contain">
        {/* Loading Spinner Indicator */}
        {isSearchingRemote && (
          <div className="flex items-center justify-center gap-2 py-1 text-xs text-teal-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Arama sonuçları güncelleniyor...</span>
          </div>
        )}

        {/* When Query is Empty: Show Popular Searches */}
        {!normalizedQuery ? (
          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
              <span>Popüler Aramalar</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {POPULAR_SEARCH_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    setSearchQuery(chip);
                    inputRef.current?.focus();
                  }}
                  className="px-3.5 py-2 min-h-[40px] rounded-full bg-[#131B24] hover:bg-[#1A2532] border border-[#1F2937] text-xs font-medium text-zinc-200 hover:text-teal-300 transition-colors cursor-pointer active:scale-95"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Quick Hints */}
            <div className="p-4 rounded-2xl bg-[#0D1219] border border-[#161F2B] space-y-1.5 text-xs text-zinc-400">
              <p className="font-semibold text-zinc-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                Hızlı Arama İpuçları
              </p>
              <p className="text-[11px] leading-relaxed">
                İstasyon adı (örn. <em>Kral Pop</em>), müzik türü (örn. <em>Pop, Haber</em>) veya podcast yayıncısı (örn. <em>Evrim Ağacı</em>) yazarak arayabilirsiniz.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* "Tüm Sonuçları Gör" Prominent Action Card */}
            <div
              onClick={handleSubmitSearch}
              className="p-3.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/15 border border-teal-500/30 flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <Search className="w-4 h-4 text-teal-400 shrink-0" />
                <span className="text-xs font-bold text-white truncate">
                  "{searchQuery}" için tüm sonuçları gör
                </span>
              </div>
              <div className="flex items-center gap-1 text-teal-400 text-xs font-bold shrink-0">
                <span>Sonuçlar</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Matching Radio Stations Section */}
            {matchingStations.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5" /> Radyolar ({matchingStations.length})
                  </span>
                </div>

                <div className="space-y-1.5">
                  {matchingStations.map((station) => {
                    const stId = station.stationuuid || station.id;
                    return (
                      <div
                        key={stId}
                        onClick={() => {
                          onPlayStation(station);
                          handleBackClose();
                        }}
                        className="p-2.5 rounded-xl bg-[#131B24] hover:bg-[#182330] border border-[#1F2937] flex items-center justify-between gap-3 cursor-pointer active:scale-[0.99] transition-all"
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          {/* Station Monogram or Favicon */}
                          <div className="w-10 h-10 min-w-[40px] rounded-lg bg-[#1B2735] border border-white/10 flex items-center justify-center font-black text-xs text-teal-400 shrink-0 shadow-sm">
                            {getMonogram(station.name)}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-white truncate">
                              {station.name}
                            </h4>
                            <p className="text-[11px] text-zinc-400 truncate">
                              {station.tags || 'Canlı Radyo • Türkiye'}
                            </p>
                          </div>
                        </div>

                        {/* Play Button */}
                        <div className="w-8 h-8 rounded-full bg-teal-500 text-black flex items-center justify-center shrink-0 shadow-md">
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Matching Turkish Podcasts Section */}
            {matchingPodcasts.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5" /> Türkçe Podcastler ({matchingPodcasts.length})
                  </span>
                </div>

                <div className="space-y-1.5">
                  {matchingPodcasts.map((podcast) => (
                    <div
                      key={podcast.id}
                      onClick={() => {
                        if (onOpenPodcastShow) {
                          onOpenPodcastShow(podcast);
                        } else {
                          handleSubmitSearch();
                        }
                        handleBackClose();
                      }}
                      className="p-2.5 rounded-xl bg-[#131B24] hover:bg-[#182330] border border-[#1F2937] flex items-center justify-between gap-3 cursor-pointer active:scale-[0.99] transition-all"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        {/* Podcast Cover or Monogram */}
                        {podcast.coverUrl ? (
                          <img
                            src={podcast.coverUrl}
                            alt={podcast.title}
                            className="w-10 h-10 min-w-[40px] rounded-lg object-cover border border-white/10 shrink-0"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 min-w-[40px] rounded-lg bg-[#1B2735] border border-white/10 flex items-center justify-center font-black text-xs text-teal-400 shrink-0">
                            {getMonogram(podcast.title)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-white truncate">
                            {podcast.title}
                          </h4>
                          <p className="text-[11px] text-zinc-400 truncate">
                            {podcast.publisher} {(podcast as any).lastEpisodeDate || (podcast as any).dateLabel ? `• Son bölüm: ${(podcast as any).lastEpisodeDate || (podcast as any).dateLabel}` : ''}
                          </p>
                        </div>
                      </div>

                      <ArrowRight className="w-4 h-4 text-zinc-500 shrink-0 mr-1" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {matchingStations.length === 0 && matchingPodcasts.length === 0 && !isSearchingRemote && (
              <div className="py-12 px-4 text-center space-y-3">
                <Search className="w-10 h-10 text-zinc-600 mx-auto" />
                <h3 className="font-bold text-sm text-white">Sonuç bulunamadı</h3>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  "{searchQuery}" aramanızla eşleşen radyo veya Türkçe podcast bulunamadı.
                </p>
                <button
                  type="button"
                  onClick={handleSubmitSearch}
                  className="px-4 py-2 rounded-xl bg-teal-500 text-black font-bold text-xs hover:bg-teal-400 transition-colors cursor-pointer"
                >
                  Geniş Kapsamlı Arama Yap
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
