import React, { useState, useEffect, useMemo, memo } from 'react';
import {
  Globe2,
  Search,
  ChevronRight,
  ChevronDown,
  Radio,
  Heart,
  Play,
  Pause,
  ArrowLeft,
  ArrowUpDown,
  Layers,
  X
} from 'lucide-react';
import { RadioStation } from '../types';
import { getCountries } from '../services/radioApi';
import {
  ALL_COUNTRIES,
  COUNTRY_NAMES_TR,
  GENRE_CATEGORIES,
  getCountryFlagEmoji,
  getParentGroupId,
  getSubcategoriesForGroup,
  matchesCategory
} from '../constants/categories';
import { ALL_TURKISH_STATIONS } from '../data/fallbackStations';

interface CountriesViewProps {
  selectedCountry: string;
  onSelectCountry: (code: string) => void;
  stations: RadioStation[];
  allStations?: RadioStation[];
  isLoading: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onPlayStation: (station: RadioStation, queue?: RadioStation[]) => void;
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
  allStations,
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
  const [sortMode, setSortMode] = useState<'popular' | 'az'>('popular');
  const [allCountries, setAllCountries] = useState<CountryInfo[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(false);

  const favoriteSet = useMemo(() => new Set(favorites.map((f) => f.stationuuid || f.id)), [favorites]);

  const activeCountryCode = selectedCountry?.toUpperCase() || 'TR';
  const isTurkey = activeCountryCode === 'TR';
  const countryName = COUNTRY_NAMES_TR[activeCountryCode] || activeCountryCode;
  const pageTitle = COUNTRY_TITLES[activeCountryCode] || `${countryName} Radyoları`;
  const countryFlag = getCountryFlagEmoji(activeCountryCode);

  // Unfiltered country stations pool for accurate category counts
  const countryPool = useMemo(() => {
    if (allStations && allStations.length > 0) return allStations;
    if (isTurkey) return ALL_TURKISH_STATIONS;
    return stations;
  }, [allStations, isTurkey, stations]);

  // Active top-level group ID
  const activeGroupId = useMemo(() => {
    if (!selectedCategory || selectedCategory === 'all') return 'all';
    return getParentGroupId(selectedCategory);
  }, [selectedCategory]);

  // Expanded groups in the category tree (auto-includes activeGroupId)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (activeGroupId && activeGroupId !== 'all' && activeGroupId !== 'populer') {
      setExpandedGroups((prev) => ({ ...prev, [activeGroupId]: true }));
    }
  }, [activeGroupId]);

  // Full category + sub-category tree with live station counts
  const categoryTree = useMemo(() => {
    return GENRE_CATEGORIES.map((cat) => {
      const count =
        cat.id === 'all'
          ? countryPool.length
          : countryPool.filter((s) => matchesCategory(s, cat.id)).length;
      const subs =
        cat.id !== 'all' && cat.id !== 'populer'
          ? getSubcategoriesForGroup(cat.id)
              .map((sub) => ({
                ...sub,
                count: countryPool.filter((s) => matchesCategory(s, sub.id)).length
              }))
              .filter((sub) => isTurkey || sub.count > 0)
          : [];
      return { ...cat, count, subs };
    }).filter((cat) => isTurkey || cat.id === 'all' || cat.id === activeGroupId || cat.count > 0);
  }, [countryPool, isTurkey, activeGroupId]);

  const activeBreadcrumb = useMemo(() => {
    if (!selectedCategory || selectedCategory === 'all') {
      return { groupName: 'Tüm Kategoriler', subName: '' };
    }
    for (const cat of categoryTree) {
      if (cat.id === selectedCategory) {
        return { groupName: cat.name, subName: '' };
      }
      const subMatch = cat.subs.find((s) => s.id === selectedCategory);
      if (subMatch) {
        return { groupName: cat.name, subName: subMatch.name };
      }
    }
    return { groupName: 'Tüm Kategoriler', subName: '' };
  }, [selectedCategory, categoryTree]);

  // Load 190+ countries catalog
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
        const fallbackList = ALL_COUNTRIES.map((c) => ({
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
    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered countries for the picker
  const filteredCountries = useMemo(() => {
    const q = countrySearch.toLowerCase().trim();
    if (!q) return allCountries;
    return allCountries.filter(
      (c) =>
        c.displayName.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.iso_3166_1.toLowerCase().includes(q)
    );
  }, [allCountries, countrySearch]);

  // Filtered & sorted stations for active country
  const displayedStations = useMemo(() => {
    let result = stations;
    if (stationLocalSearch.trim()) {
      const q = stationLocalSearch.toLocaleLowerCase('tr').trim();
      result = result.filter(
        (s) =>
          s.name.toLocaleLowerCase('tr').includes(q) ||
          (s.tags && s.tags.toLocaleLowerCase('tr').includes(q)) ||
          (s.mainCategory && s.mainCategory.toLocaleLowerCase('tr').includes(q)) ||
          (s.state && s.state.toLocaleLowerCase('tr').includes(q))
      );
    }

    if (sortMode === 'az') {
      return [...result].sort((a, b) => a.name.localeCompare(b.name, 'tr'));
    }

    if (isTurkey) {
      return [...result].sort((a, b) => {
        const ra = a.popularRank ?? 9999;
        const rb = b.popularRank ?? 9999;
        if (ra !== rb) return ra - rb;
        return (b.votes || 0) - (a.votes || 0);
      });
    }

    return result;
  }, [stations, stationLocalSearch, sortMode, isTurkey]);

  const handleSelectGroupOrSub = (id: string, closeMobile = false) => {
    setSelectedCategory(id === 'all' ? '' : id);
    if (closeMobile) setMobileCategoryOpen(false);
  };

  const renderCategoryTree = (isMobileDrawer = false) => (
    <div className="space-y-0.5">
      {categoryTree.map((cat) => {
        const hasSubs = cat.subs.length > 0;
        const isGroupActive = (!selectedCategory && cat.id === 'all') || activeGroupId === cat.id;
        const isDirectGroupSelected =
          (!selectedCategory && cat.id === 'all') || selectedCategory === cat.id;
        const isExpanded = Boolean(expandedGroups[cat.id]);

        return (
          <div key={cat.id}>
            <div
              className={`flex items-center justify-between gap-1 rounded-xl transition-colors ${
                isDirectGroupSelected
                  ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
                  : isGroupActive
                  ? 'bg-teal-500/10 text-teal-700 dark:text-teal-300 font-semibold'
                  : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-[#182330]'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  handleSelectGroupOrSub(cat.id, isMobileDrawer && !hasSubs);
                  if (hasSubs) {
                    setExpandedGroups((prev) => ({ ...prev, [cat.id]: true }));
                  }
                }}
                className="flex-1 flex items-center justify-between gap-2 px-3 py-2 text-xs text-left cursor-pointer min-w-0"
              >
                <span className="truncate">{cat.id === 'all' ? 'Tüm Radyolar' : cat.name}</span>
                <span
                  className={`text-[11px] tabular-nums shrink-0 ${
                    isDirectGroupSelected
                      ? 'text-slate-950/80 font-bold'
                      : 'text-slate-400 dark:text-zinc-500'
                  }`}
                >
                  {cat.count}
                </span>
              </button>

              {hasSubs && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedGroups((prev) => ({ ...prev, [cat.id]: !prev[cat.id] }));
                  }}
                  aria-label={`${cat.name} alt kategorileri`}
                  className={`p-2 rounded-lg cursor-pointer shrink-0 transition-colors ${
                    isDirectGroupSelected
                      ? 'text-slate-950 hover:bg-black/10'
                      : 'text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>

            {hasSubs && isExpanded && (
              <div className="ml-3 pl-2.5 mt-1 mb-1.5 border-l border-slate-200 dark:border-[#1F2937] space-y-0.5">
                {cat.subs.map((sub) => {
                  const isSubActive = selectedCategory === sub.id;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => handleSelectGroupOrSub(sub.id, isMobileDrawer)}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-[11px] flex items-center justify-between gap-2 transition-colors cursor-pointer text-left ${
                        isSubActive
                          ? 'bg-teal-500/15 text-teal-700 dark:text-teal-300 font-bold border border-teal-500/30'
                          : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-[#182330] hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <span className="truncate">{sub.name}</span>
                      <span className="text-[10px] opacity-70 tabular-nums shrink-0">{sub.count}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 select-none">
      {/* Top Header & Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#1F2937] pb-4">
        <div>
          <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
            <Radio className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {viewMode === 'stations' ? pageTitle : 'Tüm Dünya Ülkeleri'}
            </h1>
            {viewMode === 'stations' && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/25 font-bold">
                {countryFlag} {activeCountryCode} • {displayedStations.length} İstasyon
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            {viewMode === 'stations'
              ? `${countryName} canlı radyo istasyonlarını kategorilere ve alt türlere göre kolayca filtreleyin.`
              : 'Dinlemek istediğiniz ülkeyi seçin, anında o ülkenin canlı istasyonlarına bağlanın.'}
          </p>
        </div>

        {/* View Toggle Buttons */}
        <div className="flex items-center space-x-2">
          {viewMode === 'stations' ? (
            <button
              onClick={() => setViewMode('countries')}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#131B24] border border-slate-200 dark:border-[#1F2937] hover:bg-slate-50 dark:hover:bg-[#182330] text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>Ülke Değiştir ({allCountries.length || 190}+)</span>
            </button>
          ) : (
            <button
              onClick={() => setViewMode('stations')}
              className="px-3.5 py-2 rounded-xl bg-teal-500 text-black hover:bg-teal-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{countryName} Radyolarına Dön</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: STATIONS FOR SELECTED COUNTRY */}
      {viewMode === 'stations' && (
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          {/* Desktop Left Category Tree Sidebar (always visible, zero layout jump) */}
          <aside className="hidden lg:block w-64 shrink-0 bg-white dark:bg-[#131B24] border border-slate-200 dark:border-[#1F2937] rounded-2xl p-2.5 shadow-sm lg:sticky lg:top-0 lg:max-h-[calc(100vh-11rem)] lg:overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between px-2.5 pb-2 mb-1 border-b border-slate-100 dark:border-[#1F2937]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                Kategoriler
              </span>
              {selectedCategory && selectedCategory !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory('')}
                  className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                >
                  Sıfırla
                </button>
              )}
            </div>
            {renderCategoryTree(false)}
          </aside>

          {/* Main Right Content Column */}
          <div className="flex-1 min-w-0 w-full space-y-4">
            {/* Search + Mobile Category Trigger + Sort Row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
              <div className="relative flex-1 min-w-0">
                <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={stationLocalSearch}
                  onChange={(e) => setStationLocalSearch(e.target.value)}
                  placeholder={`${countryName} radyolarında ara (ad, tür, il)...`}
                  className="w-full pl-9 pr-8 py-2.5 text-xs rounded-xl bg-white dark:bg-[#131B24] text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 border border-slate-200 dark:border-[#1F2937] focus:outline-none focus:border-teal-500 shadow-sm"
                />
                {stationLocalSearch && (
                  <button
                    type="button"
                    onClick={() => setStationLocalSearch('')}
                    aria-label="Aramayı temizle"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Mobile Category Accordion Button */}
                <button
                  type="button"
                  onClick={() => setMobileCategoryOpen((prev) => !prev)}
                  className={`lg:hidden flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2 transition-colors cursor-pointer shadow-sm ${
                    mobileCategoryOpen || (selectedCategory && selectedCategory !== 'all')
                      ? 'bg-teal-500/10 border-teal-500/40 text-teal-700 dark:text-teal-300'
                      : 'bg-white dark:bg-[#131B24] border-slate-200 dark:border-[#1F2937] text-slate-700 dark:text-zinc-300'
                  }`}
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <Layers className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                    <span className="truncate">
                      {activeBreadcrumb.subName || activeBreadcrumb.groupName}
                    </span>
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                      mobileCategoryOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Sort Toggle */}
                <button
                  type="button"
                  onClick={() => setSortMode((m) => (m === 'popular' ? 'az' : 'popular'))}
                  className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#131B24] border border-slate-200 dark:border-[#1F2937] hover:bg-slate-50 dark:hover:bg-[#182330] text-slate-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm shrink-0"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>{sortMode === 'popular' ? 'Popüler' : 'A–Z'}</span>
                </button>
              </div>
            </div>

            {/* Mobile Expandable Category & Sub-category Accordion */}
            {mobileCategoryOpen && (
              <div className="lg:hidden bg-white dark:bg-[#131B24] border border-slate-200 dark:border-[#1F2937] rounded-2xl p-2.5 shadow-sm">
                <div className="flex items-center justify-between px-2 pb-2 mb-1.5 border-b border-slate-100 dark:border-[#1F2937]">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    Kategori ve Alt Tür Seçin
                  </span>
                  <button
                    type="button"
                    onClick={() => setMobileCategoryOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {renderCategoryTree(true)}
              </div>
            )}

            {/* Active Filter Breadcrumb Bar */}
            {selectedCategory && selectedCategory !== 'all' && (
              <div className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-teal-50/70 dark:bg-[#131B24] border border-teal-500/25 dark:border-[#1F2937] text-xs">
                <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                  <span className="text-slate-500 dark:text-zinc-400">Kategori:</span>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(activeGroupId)}
                    className={`font-bold cursor-pointer hover:underline ${
                      !activeBreadcrumb.subName
                        ? 'text-teal-700 dark:text-teal-300'
                        : 'text-slate-700 dark:text-zinc-300'
                    }`}
                  >
                    {activeBreadcrumb.groupName}
                  </button>
                  {activeBreadcrumb.subName && (
                    <>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-bold text-teal-700 dark:text-teal-300">
                        {activeBreadcrumb.subName}
                      </span>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('')}
                  className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <span>Tümünü Göster</span>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Stations List */}
            {isLoading ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
            ) : displayedStations.length === 0 ? (
              <div className="p-12 rounded-xl bg-white dark:bg-[#131B24] border border-slate-200 dark:border-[#1F2937] text-center space-y-3">
                <Radio className="w-10 h-10 text-slate-400 dark:text-zinc-600 mx-auto" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Bu kategoride radyo bulunamadı
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Seçilen filtre için istasyon bulunamadı. Filtreyi temizleyebilir veya başka bir kategori seçebilirsiniz.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setStationLocalSearch('');
                  }}
                  className="px-4 py-2 rounded-xl bg-teal-500 text-black font-bold text-xs hover:bg-teal-400 transition-colors cursor-pointer"
                >
                  Tüm İstasyonları Göster
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                  {displayedStations.map((station) => {
                    const stId = station.stationuuid || station.id;
                    const isFav = favoriteSet.has(stId);
                    const isCurrent =
                      currentStation?.stationuuid === station.stationuuid ||
                      currentStation?.name === station.name;
                    const isPlayingThis = isCurrent && isPlaying;
                    const monogram = getStationMonogram(station.name);
                    const badgeClass = getBadgeStyle(station.name);

                    const subtitle = station.mainCategory
                      ? station.state && station.state !== 'Turkey' && station.state !== 'Türkiye'
                        ? `${station.mainCategory} • ${station.state}`
                        : station.mainCategory
                      : station.tags
                      ? station.tags.replace(/,/g, ' • ').slice(0, 38)
                      : station.country || countryName;

                    return (
                      <div
                        key={stId}
                        onClick={() => onPlayStation(station, displayedStations)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                          isCurrent
                            ? 'bg-teal-50/80 dark:bg-[#152331] border-teal-500/50 dark:border-teal-500/40 shadow-sm ring-1 ring-teal-500/30'
                            : 'bg-white dark:bg-[#131B24] border-slate-200 dark:border-[#1F2937]/80 hover:bg-slate-50 dark:hover:bg-[#182330] hover:border-slate-300 dark:hover:border-zinc-700/80 shadow-sm'
                        }`}
                      >
                        {/* Left: Badge Logo + Info */}
                        <div className="flex items-center space-x-3 min-w-0">
                          <div
                            className={`w-11 h-11 rounded-xl shrink-0 flex items-center justify-center font-black text-xs shadow-sm tracking-wider ${badgeClass}`}
                          >
                            {monogram}
                          </div>

                          <div className="min-w-0">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors truncate">
                              {station.name}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                              {subtitle}
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
                            className="p-1.5 rounded-full text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                            title={isFav ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                          >
                            <Heart
                              className={`w-4 h-4 ${
                                isFav
                                  ? 'text-teal-600 dark:text-teal-400 fill-teal-600 dark:fill-teal-400'
                                  : ''
                              }`}
                            />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onPlayStation(station, displayedStations);
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

                {/* Load More Button */}
                {hasMore && onLoadMore && !isTurkey && (
                  <div className="text-center pt-4">
                    <button
                      onClick={onLoadMore}
                      disabled={isLoadingMore}
                      className="px-6 py-2.5 rounded-xl bg-white dark:bg-[#131B24] border border-slate-200 dark:border-[#1F2937] hover:bg-slate-50 dark:hover:bg-[#182330] text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 text-xs font-bold transition-all cursor-pointer disabled:opacity-50 shadow-sm"
                    >
                      {isLoadingMore ? 'Yükleniyor...' : 'Daha Fazla İstasyon Yükle'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: COUNTRY PICKER */}
      {viewMode === 'countries' && (
        <div className="space-y-4">
          {/* Country Search */}
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={countrySearch}
              onChange={(e) => setCountrySearch(e.target.value)}
              placeholder="Ülke adı veya ISO kodu ara (örn: Almanya, DE, Fransa)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-white dark:bg-[#131B24] text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 border border-slate-200 dark:border-[#1F2937] focus:outline-none focus:border-teal-500 shadow-sm"
            />
          </div>

          {/* Country Cards Grid */}
          {isLoadingCountries ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {Array.from({ length: 18 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-20 bg-white dark:bg-[#131B24] rounded-xl border border-slate-200 dark:border-[#1F2937] animate-pulse p-3"
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
                    className={`p-3 rounded-xl border transition-all text-left flex flex-col justify-between h-22 cursor-pointer group shadow-sm ${
                      isCurrent
                        ? 'bg-teal-50/80 dark:bg-[#152331] border-teal-500/50 shadow-md ring-1 ring-teal-500/30'
                        : 'bg-white dark:bg-[#131B24] border-slate-200 dark:border-[#1F2937] hover:bg-slate-50 dark:hover:bg-[#182330] hover:border-slate-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{c.flag}</span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-white/10">
                        {c.iso_3166_1}
                      </span>
                    </div>

                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors truncate">
                        {c.displayName}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-zinc-500 flex items-center justify-between mt-0.5">
                        <span>{c.stationcount} Yayın</span>
                        <ChevronRight className="w-3 h-3 text-slate-400 dark:text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
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
