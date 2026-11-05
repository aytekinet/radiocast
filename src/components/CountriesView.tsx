import React, { useState, useEffect, useMemo, memo } from 'react';
import { 
  Globe2, 
  Search, 
  ChevronRight, 
  Radio, 
  Heart, 
  Play, 
  Pause, 
  ArrowLeft,
  Filter,
  Loader2
} from 'lucide-react';
import { RadioStation } from '../types';
import { getCountries } from '../services/radioApi';
import { ALL_COUNTRIES, COUNTRY_NAMES_TR, getCountryFlagEmoji } from '../constants/categories';

interface CountriesViewProps {
  selectedCountry: string;
  onSelectCountry: (code: string) => void;
  stations: RadioStation[];
  isLoading: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onPlayStation: (station: RadioStation) => void;
  onToggleFavorite: (station: RadioStation) => void;
  favorites: RadioStation[];
  currentStation: RadioStation | null;
  isPlaying: boolean;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
}

interface CountryInfo {
  name: string;
  iso_3166_1: string;
  stationcount: number;
  displayName: string;
  flag: string;
}

const CATEGORY_FILTERS = [
  { id: 'all', name: 'Tüm' },
  { id: 'news', name: 'Haber' },
  { id: 'pop', name: 'Pop & Müzik' },
  { id: 'rock', name: 'Rock' },
  { id: 'jazz', name: 'Jazz & Klasik' },
  { id: 'sports', name: 'Spor' },
  { id: 'culture', name: 'Kültür' }
];

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

const COUNTRY_TITLES: Record<string, string> = {
  TR: 'Türkiye Radyoları',
  DE: 'Almanya Radyoları',
  RU: 'Rusya Radyoları',
  US: 'ABD Radyoları',
  GB: 'İngiltere Radyoları',
  FR: 'Fransa Radyoları',
  IT: 'İtalya Radyoları',
  ES: 'İspanya Radyoları',
  NL: 'Hollanda Radyoları',
  AZ: 'Azerbaycan Radyoları',
  GR: 'Yunanistan Radyoları',
  UA: 'Ukrayna Radyoları',
  BR: 'Brezilya Radyoları',
  JP: 'Japonya Radyoları',
  CA: 'Kanada Radyoları',
  AU: 'Avustralya Radyoları',
  CH: 'İsviçre Radyoları',
  AT: 'Avusturya Radyoları',
  BE: 'Belçika Radyoları',
  SE: 'İsveç Radyoları',
  NO: 'Norveç Radyoları',
  PL: 'Polonya Radyoları',
  RO: 'Romanya Radyoları',
  BG: 'Bulgaristan Radyoları'
};

export const CountriesView: React.FC<CountriesViewProps> = memo(({
  selectedCountry,
  onSelectCountry,
  stations,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  onPlayStation,
  onToggleFavorite,
  favorites,
  currentStation,
  isPlaying,
  selectedCategory,
  setSelectedCategory
}) => {
  const [viewMode, setViewMode] = useState<'stations' | 'countries'>('stations');
  const [countrySearch, setCountrySearch] = useState('');
  const [stationLocalSearch, setStationLocalSearch] = useState('');
  const [allCountries, setAllCountries] = useState<CountryInfo[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);

  const favoriteSet = useMemo(() => new Set(favorites.map((f) => f.stationuuid || f.id)), [favorites]);

  const activeCountryCode = selectedCountry?.toUpperCase() || 'TR';
  const countryName = COUNTRY_NAMES_TR[activeCountryCode] || activeCountryCode;
  const pageTitle = COUNTRY_TITLES[activeCountryCode] || `${countryName} Radyoları`;
  const countryFlag = getCountryFlagEmoji(activeCountryCode);

  // Load 190+ countries catalog for the picker modal/tab
  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setIsLoadingCountries(true);
        const list: any[] = await getCountries();
        if (!isMounted) return;

        const countMap = new Map<string, number>();
        if (Array.isArray(list)) {
          for (const item of list) {
            const iso = (item.iso_3166_1 || item.code || '').toUpperCase();
            if (iso) {
              countMap.set(iso, item.stationcount || item.stationCount || 0);
            }
          }
        }

        const combinedMap = new Map<string, CountryInfo>();
        for (const c of ALL_COUNTRIES) {
          const apiCount = countMap.get(c.code);
          combinedMap.set(c.code, {
            name: c.name,
            iso_3166_1: c.code,
            stationcount: apiCount && apiCount > 0 ? apiCount : 100,
            displayName: c.name,
            flag: c.flag
          });
        }

        if (Array.isArray(list)) {
          for (const item of list) {
            const iso = (item.iso_3166_1 || item.code || '').toUpperCase();
            if (iso && iso.length === 2 && !combinedMap.has(iso)) {
              const trName = COUNTRY_NAMES_TR[iso] || item.name || iso;
              combinedMap.set(iso, {
                name: item.name || iso,
                iso_3166_1: iso,
                stationcount: item.stationcount || item.stationCount || 0,
                displayName: trName,
                flag: getCountryFlagEmoji(iso)
              });
            }
          }
        }

        const normalized = Array.from(combinedMap.values());
        normalized.sort((a, b) => {
          if (a.iso_3166_1 === 'TR') return -1;
          if (b.iso_3166_1 === 'TR') return 1;
          if (a.iso_3166_1 === 'AZ') return -1;
          if (b.iso_3166_1 === 'AZ') return 1;
          return b.stationcount - a.stationcount;
        });

        setAllCountries(normalized);
      } catch (err) {
        console.warn('Failed to load countries list', err);
        const fallbackList = ALL_COUNTRIES.map(c => ({
          name: c.name,
          iso_3166_1: c.code,
          stationcount: 100,
          displayName: c.name,
          flag: c.flag
        }));
        if (isMounted) setAllCountries(fallbackList);
      } finally {
        if (isMounted) setIsLoadingCountries(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  // Filtered countries for the picker
  const filteredCountries = useMemo(() => {
    const q = countrySearch.toLowerCase().trim();
    if (!q) return allCountries;
    return allCountries.filter(c => 
      c.displayName.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.iso_3166_1.toLowerCase().includes(q)
    );
  }, [allCountries, countrySearch]);

  // Filtered stations for active country
  const displayedStations = useMemo(() => {
    let result = stations;
    if (stationLocalSearch.trim()) {
      const q = stationLocalSearch.toLowerCase().trim();
      result = result.filter(s => 
        s.name.toLowerCase().includes(q) ||
        (s.tags && s.tags.toLowerCase().includes(q))
      );
    }
    return result;
  }, [stations, stationLocalSearch]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 select-none">
      {/* Top Header & Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1F2937] pb-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <Radio className="w-6 h-6 text-teal-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {viewMode === 'stations' ? pageTitle : 'Tüm Dünya Ülkeleri'}
            </h1>
            {viewMode === 'stations' && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/25 font-bold">
                {countryFlag} {activeCountryCode} • {stations.length} İstasyon
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            {viewMode === 'stations' 
              ? `${countryName} canlı radyo istasyonlarını dinleyin ve filtreleyin.`
              : 'Dinlemek istediğiniz ülkeyi seçin, anında o ülkenin canlı istasyonlarına bağlanın.'}
          </p>
        </div>

        {/* View Toggle Buttons */}
        <div className="flex items-center space-x-2">
          {viewMode === 'stations' ? (
            <button
              onClick={() => setViewMode('countries')}
              className="px-3.5 py-1.5 rounded-full bg-[#131B24] border border-[#1F2937] hover:bg-[#182330] text-teal-400 hover:text-teal-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>Ülke Değiştir ({allCountries.length || 190}+)</span>
            </button>
          ) : (
            <button
              onClick={() => setViewMode('stations')}
              className="px-3.5 py-1.5 rounded-full bg-teal-500 text-black hover:bg-teal-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{countryName} Radyolarına Dön</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: STATIONS FOR SELECTED COUNTRY */}
      {viewMode === 'stations' && (
        <div className="space-y-5">
          {/* Controls: Search in country + Category Chips */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Category Pills */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
              {CATEGORY_FILTERS.map((cat) => {
                const isSelected = (!selectedCategory && cat.id === 'all') || selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id === 'all' ? '' : cat.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer shrink-0 ${
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

            {/* In-country Search */}
            <div className="relative max-w-xs w-full">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={stationLocalSearch}
                onChange={(e) => setStationLocalSearch(e.target.value)}
                placeholder={`${countryName} radyolarında filtrele...`}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-full bg-[#131B24] text-zinc-100 placeholder-zinc-500 border border-[#1F2937] focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Stations List */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
          ) : displayedStations.length === 0 ? (
            <div className="p-12 rounded-xl bg-[#131B24] border border-[#1F2937] text-center space-y-3">
              <Radio className="w-10 h-10 text-zinc-600 mx-auto" />
              <h3 className="font-bold text-sm text-white">Bu kategoride radyo bulunamadı</h3>
              <p className="text-xs text-zinc-400">
                Seçilen filtre için istasyon bulunamadı. Filtreyi temizleyebilir veya başka bir ülke seçebilirsiniz.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setStationLocalSearch('');
                }}
                className="px-4 py-2 rounded-full bg-teal-500 text-black font-bold text-xs hover:bg-teal-400 transition-colors cursor-pointer"
              >
                Tüm İstasyonları Göster
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {displayedStations.map((station) => {
                  const stId = station.stationuuid || station.id;
                  const isFav = favoriteSet.has(stId);
                  const isCurrent = currentStation?.stationuuid === station.stationuuid || currentStation?.name === station.name;
                  const isPlayingThis = isCurrent && isPlaying;
                  const monogram = getStationMonogram(station.name);
                  const badgeClass = getBadgeStyle(station.name);

                  return (
                    <div
                      key={stId}
                      onClick={() => onPlayStation(station)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                        isCurrent
                          ? 'bg-[#152331] border-teal-500/40 shadow-md ring-1 ring-teal-500/30'
                          : 'bg-[#131B24] border-[#1F2937]/80 hover:bg-[#182330] hover:border-zinc-700/80'
                      }`}
                    >
                      {/* Left: Badge Logo + Info */}
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className={`w-11 h-11 rounded-xl shrink-0 flex items-center justify-center font-black text-xs shadow-md tracking-wider ${badgeClass}`}>
                          {monogram}
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-bold text-sm text-white group-hover:text-teal-300 transition-colors truncate">
                            {station.name}
                          </h3>
                          <p className="text-xs text-zinc-400 truncate mt-0.5">
                            {station.tags ? station.tags.replace(/,/g, ' • ').slice(0, 36) : (station.country || countryName)}
                          </p>
                        </div>
                      </div>

                      {/* Right: Heart & Play Actions */}
                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(station);
                          }}
                          className="p-1.5 rounded-full text-zinc-500 hover:text-white transition-colors cursor-pointer"
                          title={isFav ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                        >
                          <Heart className={`w-4 h-4 ${isFav ? 'text-teal-400 fill-teal-400' : ''}`} />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onPlayStation(station);
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

              {/* Load More Button */}
              {hasMore && onLoadMore && (
                <div className="text-center pt-4">
                  <button
                    onClick={onLoadMore}
                    disabled={isLoadingMore}
                    className="px-6 py-2.5 rounded-full bg-[#131B24] border border-[#1F2937] hover:bg-[#182330] text-teal-400 hover:text-teal-300 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isLoadingMore ? 'Yükleniyor...' : 'Daha Fazla İstasyon Yükle'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: COUNTRY PICKER */}
      {viewMode === 'countries' && (
        <div className="space-y-4">
          {/* Country Search */}
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={countrySearch}
              onChange={(e) => setCountrySearch(e.target.value)}
              placeholder="Ülke adı veya ISO kodu ara (örn: Almanya, DE, Fransa)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-full bg-[#131B24] text-zinc-100 placeholder-zinc-500 border border-[#1F2937] focus:outline-none focus:border-teal-500 shadow-sm"
            />
          </div>

          {/* Country Cards Grid */}
          {isLoadingCountries ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {Array.from({ length: 18 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-20 bg-[#131B24] rounded-xl border border-[#1F2937] animate-pulse p-3"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {filteredCountries.map((c) => {
                const isCurrent = c.iso_3166_1 === activeCountryCode;
                return (
                  <button
                    key={c.iso_3166_1}
                    onClick={() => {
                      onSelectCountry(c.iso_3166_1);
                      setViewMode('stations');
                    }}
                    className={`p-3 rounded-xl border transition-all text-left flex flex-col justify-between h-22 cursor-pointer group ${
                      isCurrent
                        ? 'bg-[#152331] border-teal-500/50 shadow-md ring-1 ring-teal-500/30'
                        : 'bg-[#131B24] border-[#1F2937] hover:bg-[#182330] hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{c.flag}</span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/10">
                        {c.iso_3166_1}
                      </span>
                    </div>

                    <div>
                      <div className="font-bold text-xs text-white group-hover:text-teal-300 transition-colors truncate">
                        {c.displayName}
                      </div>
                      <div className="text-[10px] text-zinc-500 flex items-center justify-between mt-0.5">
                        <span>{c.stationcount} Yayın</span>
                        <ChevronRight className="w-3 h-3 text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
});
