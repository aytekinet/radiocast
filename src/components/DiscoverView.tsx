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
  Loader2,
  RefreshCw,
  Globe2
} from 'lucide-react';
import { RadioStation, Playlist } from '../types';
import { PlaybackStatus } from '../services/audioEngine';
import { getRecentlyPlayed } from '../services/storage';
import { CURATED_TURKISH_PODCASTS } from '../data/curatedTurkishPodcasts';
import { EDITORIAL_PRIORITY_STATIONS, PriorityStationDef } from '../constants/priorityStations';
import { ALL_COUNTRIES } from '../constants/categories';

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
  onNavigateToPodcasts?: () => void;
  onNavigateToRadios?: () => void;
  onOpenPodcastShow?: (show: any) => void;
}

const CATEGORY_CHIPS = [
  { id: 'all', name: 'Tüm Kategoriler' },
  { id: 'news', name: 'Haber' },
  { id: 'pop', name: 'Müzik' },
  { id: 'sports', name: 'Spor' },
  { id: 'culture', name: 'Kültür & Sanat' },
  { id: 'science', name: 'Bilim & Teknoloji' },
  { id: 'education', name: 'Eğitim' },
  { id: 'life', name: 'Yaşam' },
  { id: 'business', name: 'Ekonomi' },
  { id: 'health', name: 'Sağlık' },
  { id: 'travel', name: 'Seyahat' }
];

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
  TR: "Türkiye'de Popüler Radyolar",
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
    if (isTurkey) return "Türkiye'de Popüler Radyolar";
    return COUNTRY_POPULAR_TITLES[selectedCountry.toUpperCase()] || 'Popüler Dünya Radyoları';
  }, [isTurkey, selectedCountry]);

  // When country is Turkey, render the 12 editorial priority stations (or 8 by default)
  const turkeyRadios = useMemo(() => {
    return EDITORIAL_PRIORITY_STATIONS.map((def: PriorityStationDef, idx: number) => {
      const cleanDef = def.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const matched = stations.find((s) => {
        const cleanS = s.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        return cleanS === cleanDef || cleanS.includes(cleanDef) || cleanDef.includes(cleanS);
      });

      const stationuuid = matched?.stationuuid || `editorial-${idx + 1}-${cleanDef}`;
      const radioObj: RadioStation = {
        stationuuid,
        id: stationuuid,
        name: def.name,
        url: def.streamUrl,
        url_resolved: def.streamUrl,
        homepage: matched?.homepage || '',
        favicon: matched?.favicon || def.favicon || '',
        tags: def.tags,
        country: 'Turkey',
        countrycode: 'TR',
        language: 'Turkish',
        votes: Math.max(matched?.votes || 0, 1000 - idx * 30),
        codec: 'MP3',
        bitrate: matched?.bitrate || 128
      };

      return {
        radio: radioObj,
        badgeText: def.badgeText,
        badgeBg: `${def.badgeBg} ${def.badgeTextColor}`,
        tags: def.tags
      };
    });
  }, [stations]);

  // When country is NOT Turkey, render actual loaded stations from `stations` prop
  const foreignRadios = useMemo(() => {
    if (isTurkey) return [];
    const limit = showAllPriority ? 24 : 10;
    return stations.slice(0, limit).map((s) => ({
      radio: s,
      badgeText: getStationMonogram(s.name),
      badgeBg: getBadgeStyle(s.name),
      tags: s.tags ? s.tags.replace(/,/g, ' • ').slice(0, 32) : (s.country || 'Dünya Radyosu')
    }));
  }, [isTurkey, stations, showAllPriority]);

  const activeDisplayList = useMemo(() => {
    if (isTurkey) {
      return showAllPriority ? turkeyRadios : turkeyRadios.slice(0, 8);
    }
    return foreignRadios;
  }, [isTurkey, turkeyRadios, foreignRadios, showAllPriority]);

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
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Keşfet
        </h1>

        {/* Mobile Country Selector (Requirement 10) */}
        <div className="flex md:hidden relative items-center shrink-0" title="Radyo ülkesi">
          <Globe2 className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 pointer-events-none" />
          <select
            aria-label="Radyo ülkesi"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="pl-7 pr-6 py-1.5 text-xs font-semibold rounded-full bg-[#131B24] text-zinc-200 border border-[#1F2937] focus:outline-none focus:border-teal-500 appearance-none cursor-pointer"
          >
            <option value="TR">🇹🇷 Türkiye</option>
            {ALL_COUNTRIES.filter(c => c.code !== 'TR').map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
          <span className="absolute right-2 pointer-events-none text-zinc-400 text-[9px]">▼</span>
        </div>
      </div>

      {/* 1. Popüler Radyolar (Country-aware) */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Radio className="w-5 h-5 text-teal-400" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {sectionTitle}
            </h2>
            {!isTurkey && stations.length > 0 && (
              <span className="text-[11px] font-semibold text-teal-400/80 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20">
                {stations.length} istasyon
              </span>
            )}
          </div>
          <button
            onClick={() => {
              if (onNavigateToRadios) {
                onNavigateToRadios();
              } else {
                setShowAllPriority(!showAllPriority);
              }
            }}
            className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>{showAllPriority ? 'Daha Az Göster' : 'Tümünü Gör'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Loading State for foreign country */}
        {isLoading && !isTurkey ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div 
                key={i}
                className="p-3 rounded-xl bg-[#131B24] border border-[#1F2937]/80 flex items-center justify-between gap-3 animate-pulse"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-xl bg-zinc-800" />
                  <div className="space-y-2">
                    <div className="w-32 h-3.5 rounded bg-zinc-800" />
                    <div className="w-20 h-2.5 rounded bg-zinc-800/60" />
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full bg-zinc-800" />
              </div>
            ))}
          </div>
        ) : !isLoading && !isTurkey && stations.length === 0 ? (
          /* Empty State for foreign country without leaking Turkish stations */
          <div className="p-8 rounded-xl bg-[#131B24] border border-[#1F2937] text-center space-y-3">
            <Radio className="w-8 h-8 text-zinc-500 mx-auto" />
            <h3 className="font-bold text-sm text-white">Bu ülkede radyo istasyonu bulunamadı</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
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
          /* 2-Column Compact Station Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeDisplayList.map(({ radio, badgeText, badgeBg, tags }) => {
              const stId = radio.stationuuid || radio.id;
              const isFav = favoriteSet.has(stId);
              const isCurrent = currentStation?.stationuuid === radio.stationuuid || currentStation?.name === radio.name;
              const isPlayingThis = isCurrent && isPlaying;

              return (
                <div
                  key={stId}
                  onClick={() => onPlayStation(radio)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                    isCurrent
                      ? 'bg-[#152331] border-teal-500/40 shadow-md ring-1 ring-teal-500/30'
                      : 'bg-[#131B24] border-[#1F2937]/80 hover:bg-[#182330] hover:border-zinc-700/80'
                  }`}
                >
                  {/* Left: Badge Logo + Info */}
                  <div className="flex items-center space-x-3 min-w-0">
                    {/* Styled Monogram / Brand Badge */}
                    <div className={`w-11 h-11 rounded-xl shrink-0 flex items-center justify-center font-black text-xs shadow-md tracking-wider ${badgeBg}`}>
                      {badgeText}
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-white group-hover:text-teal-300 transition-colors truncate">
                        {radio.name}
                      </h3>
                      <p className="text-xs text-zinc-400 truncate mt-0.5">
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
                      className="p-1.5 rounded-full text-zinc-500 hover:text-white transition-colors cursor-pointer"
                      title={isFav ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'text-teal-400 fill-teal-400' : ''}`} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlayStation(radio);
                      }}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shadow ${
                        isPlayingThis
                          ? 'bg-teal-500 text-black'
                          : 'bg-white/10 text-white group-hover:bg-teal-500 group-hover:text-black'
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
        )}
      </section>

      {/* 2. Güncel Türkçe Podcastler - (Remains 100% Turkish regardless of radio country) */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mic className="w-5 h-5 text-teal-400" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Güncel Türkçe Podcastler
            </h2>
          </div>
          {onNavigateToPodcasts && (
            <button
              onClick={onNavigateToPodcasts}
              className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors cursor-pointer"
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
                className="min-w-[200px] sm:min-w-[220px] p-3 rounded-xl bg-[#131B24] border border-[#1F2937]/80 hover:bg-[#182330] hover:border-zinc-700/80 transition-all cursor-pointer flex items-center space-x-3 shrink-0 group"
              >
                {/* Podcast Monogram Avatar */}
                <div className={`w-11 h-11 rounded-xl shrink-0 flex items-center justify-center font-black text-xs shadow-md ${pod.badgeBg}`}>
                  {pod.badgeText}
                </div>

                <div className="min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-teal-300 transition-colors truncate">
                    {pod.title}
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
                    Son bölüm: {pod.dateLabel}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Kategorilere Göz At */}
      <section className="space-y-3.5">
        <div className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-teal-400" />
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Kategorilere Göz At
          </h2>
        </div>

        {/* Horizontal Category Pill Buttons */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar flex-wrap gap-y-2">
          {CATEGORY_CHIPS.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  if (onNavigateToRadios) onNavigateToRadios();
                }}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold'
                    : 'bg-[#131B24] text-zinc-300 border border-[#1F2937] hover:bg-[#182330] hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. Son Dinlenenler */}
      {recentItems.length > 0 && (
        <section className="space-y-3.5 pt-2">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-teal-400" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Son Dinlenenler
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {recentItems.map((item, idx) => {
              const isRadio = item.type === 'radio';
              const name = isRadio ? item.radioStation?.name : item.podcastEpisode?.title;
              const sub = isRadio ? 'Canlı Radyo' : item.podcastEpisode?.showTitle;

              return (
                <div
                  key={`${item.id}-${idx}`}
                  onClick={() => {
                    if (isRadio && item.radioStation) onPlayStation(item.radioStation);
                  }}
                  className="p-3 rounded-xl bg-[#131B24] border border-[#1F2937]/80 hover:bg-[#182330] transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-2 font-bold text-xs">
                    {name?.slice(0, 2).toUpperCase() || 'RC'}
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-white group-hover:text-teal-300 transition-colors truncate">
                      {name}
                    </h5>
                    <p className="text-[10px] text-zinc-500 truncate mt-0.5">
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
