import React, { useState, useEffect } from 'react';
import { Globe2, Search, ChevronRight } from 'lucide-react';
import { getCountries } from '../services/radioApi';
import { COUNTRY_NAMES_TR } from '../constants/categories';

interface CountriesViewProps {
  onSelectCountry: (code: string) => void;
}

interface CountryInfo {
  name: string;
  iso_3166_1: string;
  stationcount: number;
  displayName?: string;
}

export const CountriesView: React.FC<CountriesViewProps> = React.memo(({ onSelectCountry }) => {
  const [countries, setCountries] = useState<CountryInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setIsLoading(true);
        const list = await getCountries();
        if (isMounted) {
          const normalized = list.map((item: any) => {
            const iso = (item.iso_3166_1 || item.code || '').toUpperCase();
            const trName = COUNTRY_NAMES_TR[iso];
            return {
              name: item.name || iso,
              iso_3166_1: iso,
              stationcount: item.stationcount || item.stationCount || 0,
              displayName: trName || item.name || iso
            };
          }).filter(c => c.iso_3166_1 && c.iso_3166_1.length === 2);

          // Sort: TR and AZ first, then by station count descending
          normalized.sort((a, b) => {
            if (a.iso_3166_1 === 'TR') return -1;
            if (b.iso_3166_1 === 'TR') return 1;
            if (a.iso_3166_1 === 'AZ') return -1;
            if (b.iso_3166_1 === 'AZ') return 1;
            return b.stationcount - a.stationcount;
          });

          setCountries(normalized);
        }
      } catch (err) {
        console.error('Failed to load countries', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  const filtered = countries.filter((c) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      c.displayName?.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.iso_3166_1.toLowerCase().includes(q)
    );
  });

  const getCountryEmoji = (code: string) => {
    if (!code || code.length !== 2) return '🌐';
    const codePoints = code
      .toUpperCase()
      .split('')
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2.5">
            <Globe2 className="w-5 h-5 text-amber-500" />
            <span>Dünya Ülke Radyoları</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-mono font-bold">
              {countries.length} Ülke
            </span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Tüm dünya ülkelerinin canlı radyo yayınlarını tek tıkla dinleyin
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ülke adı veya kod ara (örn: Türkiye, Almanya)..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-amber-500 transition-colors shadow-sm"
          />
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 24 }).map((_, idx) => (
            <div
              key={idx}
              className="h-20 bg-white dark:bg-zinc-900/60 rounded-2xl border border-zinc-200 dark:border-zinc-800 animate-pulse p-3 flex flex-col justify-between"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white dark:bg-zinc-900/30 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 p-8 shadow-sm">
          <Globe2 className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Aradığınız ülke bulunamadı</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Arama terimini değiştirerek tekrar deneyiniz.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filtered.map((country) => {
            const flag = getCountryEmoji(country.iso_3166_1);
            return (
              <button
                key={country.iso_3166_1}
                onClick={() => onSelectCountry(country.iso_3166_1)}
                className="group bg-white dark:bg-zinc-900/80 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800/80 hover:border-amber-500/50 rounded-2xl p-3.5 transition-all text-left flex flex-col justify-between h-24 shadow-sm hover:shadow-md cursor-pointer active:scale-95"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{flag}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold border border-zinc-200 dark:border-zinc-700/60">
                    {country.iso_3166_1}
                  </span>
                </div>

                <div>
                  <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-amber-500 transition-colors truncate">
                    {country.displayName}
                  </div>
                  <div className="text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between mt-0.5">
                    <span>{country.stationcount} Yayın</span>
                    <ChevronRight className="w-3 h-3 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
});

