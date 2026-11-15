import React, { useState, useMemo, memo } from 'react';
import { 
  Radio, 
  Mic, 
  Heart, 
  Play, 
  Pause, 
  Layers, 
  Clock, 
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Globe2,
  Sparkles,
  Music,
  Globe,
  HeartHandshake,
  Flame,
  Disc,
  Newspaper,
  Sun,
  Guitar,
  Wifi
} from 'lucide-react';
import { RadioStation, Playlist } from '../types';
import { PlaybackStatus } from '../services/audioEngine';
import { getRecentlyPlayed } from '../services/storage';
import { CURATED_TURKISH_PODCASTS } from '../data/curatedTurkishPodcasts';
import { EDITORIAL_PRIORITY_STATIONS, getEditorialPriorityStations } from '../constants/priorityStations';
import { ALL_COUNTRIES, GENRE_CATEGORIES, getParentGroupId, getSubcategoriesForGroup, matchesCategory } from '../constants/categories';
import { ALL_TURKISH_STATIONS } from '../data/fallbackStations';

interface DiscoverViewProps {
  stations: RadioStation[];
  allStations?: RadioStation[];
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
  onPlayStation: (station: RadioStation, queue?: RadioStation[]) => void;
  onToggleFavorite: (station: RadioStation) => void;
  playlists: Playlist[];
  onAddToPlaylist: (playlistId: string, stationUuid: string) => void;
  onRefresh: () => void;
  searchQuery: string;
  onNavigateToPodcasts?: () => void;
  onNavigateToRadios?: () => void;
  onOpenPodcastShow?: (show: any) => void;
}

const CURATED_PODCAST_CARDS = [
  {
    id: 'apple-1582236894',
    title: 'Evrim Ağacı',
    dateLabel: '4 Kas 2026',
    badgeText: 'EA',
    badgeBg: 'bg-[#B91C1C] text-white'
  },
  {
    id: 'apple-1488399831',
    title: 'Aposto Altı Otuz',
    dateLabel: '4 Kas 2026',
    badgeText: 'A6',
    badgeBg: 'bg-[#FEF3C7] text-zinc-900'
  },
  {
    id: 'apple-1214693100',
    title: 'Kendine İyi Davran',
    dateLabel: '1 Kas 2026',
    badgeText: 'KB',
    badgeBg: 'bg-[#A7F3D0] text-zinc-900'
  },
  {
    id: 'apple-1090333454',
    title: 'Socrates',
    dateLabel: '3 Kas 2026',
    badgeText: 'S',
    badgeBg: 'bg-black text-white border border-white/20'
  },
  {
    id: 'apple-1502441989',
    title: 'Yazılımcının Dünyası',
    dateLabel: '30 Eki 2026',
    badgeText: 'YD',
    badgeBg: 'bg-teal-600 text-white'
  },
  {
    id: 'apple-1463131362',
    title: 'Felsefe Açıklarından',
    dateLabel: '4 Kas 2026',
    badgeText: 'FA',
    badgeBg: 'bg-[#0284C7] text-white'
  }
];

const COUNTRY_POPULAR_TITLES: Record<string, string> = {
  TR: "Türkiye'de Popüler İlk 20 Radyo",
  DE: "Almanya'da Popüler Radyolar",
  RU: "Rusya'da Popüler Radyolar",
  US: "ABD'de Popüler Radyolar",
  GB: "İngiltere'de Popüler Radyolar",
  FR: "Fransa'da Popüler Radyolar",
  IT: "İtalya'da Popüler Radyolar",
  ES: "İspanya'da Popüler Radyolar",
  NL: "Hollanda'da Popüler Radyolar",
  AZ: "Azerbaycan'da Popüler Radyolar",
  GR: "Yunanistan'da Popüler Radyolar",
  UA: "Ukrayna'da Popüler Radyolar",
  BR: "Brezilya'da Popüler Radyolar",
  JP: "Japonya'da Popüler Radyolar",
  CA: "Kanada'da Popüler Radyolar",
  AU: "Avustralya'da Popüler Radyolar",
  CH: "İsviçre'de Popüler Radyolar",
  AT: "Avusturya'da Popüler Radyolar",
  BE: "Belçika'da Popüler Radyolar",
  SE: "İsveç'te Popüler Radyolar",
  NO: "Norveç'te Popüler Radyolar",
  PL: "Polonya'da Popüler Radyolar",
  RO: "Romanya'da Popüler Radyolar",
  BG: "Bulgaristan'da Popüler Radyolar"
};

function getCategoryIcon(iconName: string) {
  switch (iconName) {
    case 'Sparkles': return Sparkles;
    case 'Music': return Music;
    case 'Globe': return Globe;
    case 'HeartHandshake': return HeartHandshake;
    case 'Flame': return Flame;
    case 'Disc': return Disc;
    case 'Newspaper': return Newspaper;
    case 'Sun': return Sun;
    case 'Guitar': return Guitar;
    case 'Wifi': return Wifi;
    default: return Radio;
  }
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

export const DiscoverView: React.FC<DiscoverViewProps> = memo(({
  stations,
  allStations,
  isLoading,
  selectedCategory,
  setSelectedCategory,
  selectedCountry,
  setSelectedCountry,
  currentStation,
  isPlaying,
  favorites,
  onPlayStation,
  onToggleFavorite,
  onNavigateToPodcasts,
  onNavigateToRadios,
  onOpenPodcastShow
}) => {
  const [showAllPriority, setShowAllPriority] = useState(false);
  const favoriteSet = useMemo(() => new Set(favorites.map((f) => f.stationuuid || f.id)), [favorites]);

  const isTurkey = !selectedCountry || selectedCountry === 'TR';

  // Section title dynamically computed from selectedCountry
  const sectionTitle = useMemo(() => {
    if (isTurkey) return "Türkiye'de Popüler İlk 20 Radyo";
    return COUNTRY_POPULAR_TITLES[selectedCountry.toUpperCase()] || 'Popüler Dünya Radyoları';
  }, [isTurkey, selectedCountry]);

  // Exact Popüler İlk 20 list for Turkey
  const turkeyRadios = useMemo(() => {
    const resolved = getEditorialPriorityStations();
    return resolved.map((radio, idx) => {
      const def = EDITORIAL_PRIORITY_STATIONS[idx];
      const cityLabel = radio.state && radio.state !== 'Turkey' ? radio.state : def.city;
      const categoryLabel = radio.mainCategory || def.mainCategory;
      return {
        radio,
        rank: def.popularRank,
        badgeText: def.badgeText,
        badgeBg: `${def.badgeBg} ${def.badgeTextColor}`,
        tags: cityLabel && cityLabel !== 'Türkiye' ? `${categoryLabel} • ${cityLabel}` : `${categoryLabel} • Türkiye`
      };
    });
  }, []);

  // When country is NOT Turkey, render actual loaded stations from `stations` prop
  const foreignRadios = useMemo(() => {
    if (isTurkey) return [];
    const limit = showAllPriority ? 24 : 10;
    return stations.slice(0, limit).map((s, idx) => ({
      radio: s,
      rank: idx + 1,
      badgeText: getStationMonogram(s.name),
      badgeBg: getBadgeStyle(s.name),
      tags: s.tags ? s.tags.replace(/,/g, ' • ').slice(0, 36) : (s.country || 'Dünya Radyosu')
    }));
  }, [isTurkey, stations, showAllPriority]);

  const activeDisplayList = useMemo(() => {
    if (isTurkey) {
      return showAllPriority ? turkeyRadios : turkeyRadios.slice(0, 10);
    }
    return foreignRadios;
  }, [isTurkey, turkeyRadios, foreignRadios, showAllPriority]);

  // Category cards with live station counts and visible sub-categories
  const categoryStats = useMemo(() => {
    const sourceList = isTurkey
      ? (allStations && allStations.length > 0 ? allStations : ALL_TURKISH_STATIONS)
      : (allStations && allStations.length > 0 ? allStations : stations);

    return GENRE_CATEGORIES.map((cat) => {
      const count = cat.id === 'all'
        ? sourceList.length
        : sourceList.filter((s) => matchesCategory(s, cat.id)).length;
      const subs =
        cat.id !== 'all' && cat.id !== 'populer'
          ? getSubcategoriesForGroup(cat.id)
              .map((sub) => ({
                ...sub,
                count: sourceList.filter((s) => matchesCategory(s, sub.id)).length
              }))
              .filter((sub) => isTurkey || sub.count > 0)
          : [];
      return {
        ...cat,
        count,
        subs
      };
    }).filter((c) => isTurkey || c.id === 'all' || c.count > 0);
  }, [isTurkey, allStations, stations]);

  // Recent history items - deduplicated by title and ID
  const recentItems = useMemo(() => {
    const list = getRecentlyPlayed();
    const seen = new Set<string>();
    const deduplicated = [];
    for (const item of list) {
      const key = item.type === 'radio' && item.radioStation 
        ? `radio-${item.radioStation.name.toLowerCase().trim()}`
        : item.id;
      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(item);
      }
      if (deduplicated.length >= 6) break;
    }
    return deduplicated;
  }, [currentStation, isPlaying]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 select-none">
      {/* Page Title & Mobile Country Selector */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Keşfet
        </h1>

        {/* Mobile Country Selector */}
        <div className="flex md:hidden relative items-center shrink-0" title="Radyo ülkesi">
          <Globe2 className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400 absolute left-2.5 pointer-events-none" />
          <select
            aria-label="Radyo ülkesi"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="pl-7 pr-6 py-1.5 text-xs font-semibold rounded-full bg-slate-100 dark:bg-[#131B24] text-slate-800 dark:text-zinc-200 border border-slate-300 dark:border-[#1F2937] focus:outline-none focus:border-teal-500 appearance-none cursor-pointer"
          >
            <option value="TR">🇹🇷 Türkiye</option>
            {ALL_COUNTRIES.filter(c => c.code !== 'TR').map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
          <span className="absolute right-2 pointer-events-none text-slate-500 dark:text-zinc-400 text-[9px]">▼</span>
        </div>
      </div>

      {/* 1. Popüler İlk 20 / Ülke Popüler Radyoları */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 min-w-0">
            <Radio className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight truncate">
              {sectionTitle}
            </h2>
            {!isTurkey && stations.length > 0 && (
              <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-400/80 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20 shrink-0">
                {stations.length} istasyon
              </span>
            )}
          </div>
          <button
            onClick={() => {
              if (onNavigateToRadios) {
                if (isTurkey) setSelectedCategory('all');
                onNavigateToRadios();
              } else {
                setShowAllPriority(!showAllPriority);
              }
            }}
            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center gap-1 transition-colors cursor-pointer shrink-0"
          >
            <span>{isTurkey ? 'Tüm Radyolar' : 'Tümünü Gör'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Loading State for foreign country */}
        {isLoading && !isTurkey ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div 
                key={i}
                className="p-3 rounded-xl bg-white dark:bg-[#131B24] border border-slate-200 dark:border-[#1F2937]/80 flex items-center justify-between gap-3 animate-pulse"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-200 dark:bg-zinc-800" />
                  <div className="space-y-2">
                    <div className="w-32 h-3.5 rounded bg-slate-200 dark:bg-zinc-800" />
                    <div className="w-20 h-2.5 rounded bg-slate-200/60 dark:bg-zinc-800/60" />
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-zinc-800" />
              </div>
            ))}
          </div>
        ) : !isLoading && !isTurkey && stations.length === 0 ? (
          /* Empty State for foreign country without leaking Turkish stations */
          <div className="p-8 rounded-xl bg-white dark:bg-[#131B24] border border-slate-200 dark:border-[#1F2937] text-center space-y-3">
            <Radio className="w-8 h-8 text-slate-400 dark:text-zinc-500 mx-auto" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Bu ülkede radyo istasyonu bulunamadı</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
              Seçilen ülke için istasyon bilgisi alınamadı. Farklı bir ülke seçebilir veya Türkiye radyolarına dönebilirsiniz.
            </p>
            <button
              onClick={() => setSelectedCountry('TR')}
              className="px-4 py-2 rounded-full bg-teal-500 text-black font-bold text-xs hover:bg-teal-400 transition-colors cursor-pointer"
            >
              Türkiye Radyolarına Dön
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {/* 2-Column Compact Station Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeDisplayList.map(({ radio, rank, badgeText, badgeBg, tags }) => {
                const stId = radio.stationuuid || radio.id;
                const isFav = favoriteSet.has(stId);
                const isCurrent = currentStation?.stationuuid === radio.stationuuid || currentStation?.name === radio.name;
                const isPlayingThis = isCurrent && isPlaying;
                const queue = isTurkey ? turkeyRadios.map((t) => t.radio) : foreignRadios.map((f) => f.radio);

                return (
                  <div
                    key={`${rank}-${stId}`}
                    onClick={() => onPlayStation(radio, queue)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                      isCurrent
                        ? 'bg-teal-50/80 dark:bg-[#152331] border-teal-500/50 dark:border-teal-500/40 shadow-sm ring-1 ring-teal-500/30'
                        : 'bg-white dark:bg-[#131B24] border-slate-200 dark:border-[#1F2937]/80 hover:bg-slate-50 dark:hover:bg-[#182330] hover:border-slate-300 dark:hover:border-zinc-700/80 shadow-sm'
                    }`}
                  >
                    {/* Left: Badge Logo + Info */}
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className={`w-11 h-11 rounded-xl shrink-0 flex items-center justify-center font-black text-[11px] shadow-sm tracking-tight text-center leading-tight px-1 ${badgeBg}`}>
                        {badgeText}
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors truncate">
                          {radio.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                          {tags}
                        </p>
                      </div>
                    </div>

                    {/* Right: Heart & Play Actions */}
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(radio);
                        }}
                        className="p-1.5 rounded-full text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                        title={isFav ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'text-teal-600 dark:text-teal-400 fill-teal-600 dark:fill-teal-400' : ''}`} />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlayStation(radio, queue);
                        }}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm ${
                          isPlayingThis
                            ? 'bg-teal-500 text-black'
                            : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white group-hover:bg-teal-500 group-hover:text-black'
                        }`}
                        title={isPlayingThis ? 'Durdur' : 'Oynat'}
                      >
                        {isPlayingThis ? (
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

            {/* Expand / Collapse Popüler İlk 20 */}
            {((isTurkey && turkeyRadios.length > 10) || (!isTurkey && stations.length > 10)) && (
              <div className="flex justify-center pt-1">
                <button
                  onClick={() => setShowAllPriority(!showAllPriority)}
                  className="px-4 py-2 rounded-full bg-white dark:bg-[#131B24] border border-slate-200 dark:border-[#1F2937] hover:bg-slate-50 dark:hover:bg-[#182330] text-xs font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  {showAllPriority ? (
                    <>
                      <span>Daha Az Göster</span>
                      <ChevronUp className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <span>{isTurkey ? "Popüler İlk 20'nin Tamamını Göster (20)" : 'Daha Fazla Göster'}</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 2. Güncel Türkçe Podcastler */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mic className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Güncel Türkçe Podcastler
            </h2>
          </div>
          {onNavigateToPodcasts && (
            <button
              onClick={onNavigateToPodcasts}
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Tümünü Gör</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Horizontal Scrollable Row of Compact Podcast Cards */}
        <div className="flex items-center space-x-3 overflow-x-auto pb-2 no-scrollbar">
          {CURATED_PODCAST_CARDS.map((pod) => {
            const rawPod = CURATED_TURKISH_PODCASTS.find(p => p.id === pod.id || p.title.toLowerCase().includes(pod.title.toLowerCase()));

            return (
              <div
                key={pod.id}
                onClick={() => {
                  if (rawPod && onOpenPodcastShow) {
                    onOpenPodcastShow(rawPod);
                  } else if (onNavigateToPodcasts) {
                    onNavigateToPodcasts();
                  }
                }}
                className="min-w-[200px] sm:min-w-[220px] p-3 rounded-xl bg-white dark:bg-[#131B24] border border-slate-200 dark:border-[#1F2937]/80 hover:bg-slate-50 dark:hover:bg-[#182330] hover:border-slate-300 dark:hover:border-zinc-700/80 transition-all cursor-pointer flex items-center space-x-3 shrink-0 group shadow-sm"
              >
                {/* Podcast Monogram Avatar */}
                <div className={`w-11 h-11 rounded-xl shrink-0 flex items-center justify-center font-black text-xs shadow-sm ${pod.badgeBg}`}>
                  {pod.badgeText}
                </div>

                <div className="min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors truncate">
                    {pod.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
                    Son bölüm: {pod.dateLabel}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Radyo Kategorileri */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Kategorilere Göz At
            </h2>
          </div>
          {onNavigateToRadios && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                onNavigateToRadios();
              }}
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Tüm Kategoriler</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Clean Category Grid Cards with visible sub-categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categoryStats.map((cat) => {
            const activeParent = selectedCategory ? getParentGroupId(selectedCategory) : 'all';
            const isSelected = (!selectedCategory && cat.id === 'all') || activeParent === cat.id;
            const IconComp = getCategoryIcon(cat.iconName);
            return (
              <div
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id === 'all' ? '' : cat.id);
                  if (onNavigateToRadios) onNavigateToRadios();
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedCategory(cat.id === 'all' ? '' : cat.id);
                    if (onNavigateToRadios) onNavigateToRadios();
                  }
                }}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 group shadow-sm ${
                  isSelected
                    ? 'bg-teal-50/80 dark:bg-[#152331] border-teal-500/50 dark:border-teal-500/40 ring-1 ring-teal-500/30'
                    : 'bg-white dark:bg-[#131B24] border-slate-200 dark:border-[#1F2937]/80 hover:bg-slate-50 dark:hover:bg-[#182330] hover:border-slate-300 dark:hover:border-zinc-700/80'
                }`}
              >
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg shrink-0 flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-teal-500 text-slate-950'
                          : 'bg-teal-500/10 text-teal-600 dark:text-teal-400 group-hover:bg-teal-500/20'
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div
                        className={`text-xs sm:text-sm font-bold truncate ${
                          isSelected
                            ? 'text-teal-700 dark:text-teal-300'
                            : 'text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-300'
                        }`}
                      >
                        {cat.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-zinc-400 tabular-nums">
                        {cat.count} radyo
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>

                {cat.subs.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-[#1F2937]/80">
                    {cat.subs.map((sub) => {
                      const isSubSelected = selectedCategory === sub.id;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCategory(sub.id);
                            if (onNavigateToRadios) onNavigateToRadios();
                          }}
                          className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                            isSubSelected
                              ? 'bg-teal-500 text-slate-950 font-bold'
                              : 'bg-slate-100 dark:bg-white/[0.04] hover:bg-teal-500/15 text-slate-600 dark:text-zinc-300 hover:text-teal-700 dark:hover:text-teal-300'
                          }`}
                        >
                          <span>{sub.name}</span>
                          <span className="opacity-65 tabular-nums text-[10px]">{sub.count}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Son Dinlenenler */}
      {recentItems.length > 0 && (
        <section className="space-y-3.5 pt-2">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Son Dinlenenler
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {recentItems.map((item, idx) => {
              const isRadio = item.type === 'radio';
              const name = isRadio ? item.radioStation?.name : item.podcastEpisode?.title;
              const sub = isRadio ? (item.radioStation?.mainCategory || 'Canlı Radyo') : item.podcastEpisode?.showTitle;

              return (
                <div
                  key={`${item.id}-${idx}`}
                  onClick={() => {
                    if (isRadio && item.radioStation) onPlayStation(item.radioStation);
                  }}
                  className="p-3 rounded-xl bg-white dark:bg-[#131B24] border border-slate-200 dark:border-[#1F2937]/80 hover:bg-slate-50 dark:hover:bg-[#182330] transition-all cursor-pointer flex flex-col justify-between group shadow-sm"
                >
                  <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-2 font-bold text-xs">
                    {name?.slice(0, 2).toUpperCase() || 'RC'}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors truncate">
                      {name}
                    </h5>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-500 truncate mt-0.5">
                      {sub}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
});
