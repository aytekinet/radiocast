import React, { useState, useEffect, useRef } from 'react';
import { Search, Radio, Mic, Globe, X, Play, Volume2, ArrowRight } from 'lucide-react';
import { RadioStation, PodcastShow, PodcastEpisode } from '../types';
import { ALL_TURKISH_STATIONS } from '../data/fallbackStations';
import { CURATED_TURKISH_PODCASTS } from '../data/curatedTurkishPodcasts';
import { ALL_COUNTRIES, COUNTRY_NAMES_TR } from '../constants/categories';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayStation: (station: RadioStation) => void;
  onPlayPodcastEpisode: (episode: PodcastEpisode) => void;
  onSelectCountry: (countryCode: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onPlayStation,
  onPlayPodcastEpisode,
  onSelectCountry
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Global ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const normalizedQuery = query.trim().toLowerCase();

  // Search Stations
  const matchingStations = normalizedQuery
    ? ALL_TURKISH_STATIONS.filter(
        s =>
          s.name.toLowerCase().includes(normalizedQuery) ||
          (s.tags && s.tags.toLowerCase().includes(normalizedQuery))
      ).slice(0, 5)
    : [];

  // Search Podcasts
  const matchingPodcasts = normalizedQuery
    ? CURATED_TURKISH_PODCASTS.filter(
        p =>
          p.title.toLowerCase().includes(normalizedQuery) ||
          p.publisher.toLowerCase().includes(normalizedQuery) ||
          p.category.toLowerCase().includes(normalizedQuery) ||
          p.description.toLowerCase().includes(normalizedQuery)
      ).slice(0, 5)
    : [];

  // Search Countries
  const matchingCountries = normalizedQuery
    ? ALL_COUNTRIES.filter(
        c =>
          c.name.toLowerCase().includes(normalizedQuery) ||
          c.code.toLowerCase().includes(normalizedQuery) ||
          (COUNTRY_NAMES_TR[c.code] && COUNTRY_NAMES_TR[c.code].toLowerCase().includes(normalizedQuery))
      ).slice(0, 4)
    : [];

  const hasResults = matchingStations.length > 0 || matchingPodcasts.length > 0 || matchingCountries.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-zinc-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-zinc-200 dark:border-zinc-800">
          <Search className="w-5 h-5 text-amber-500 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Radyo, podcast, konu veya ülke ara... (Örn: Power FM, Evrim Ağacı, Power)"
            className="w-full bg-transparent text-sm md:text-base font-medium text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-2 px-2.5 py-1 text-xs font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="p-4 overflow-y-auto space-y-5 flex-1">
          {!normalizedQuery ? (
            <div className="py-8 text-center space-y-2 text-zinc-400 dark:text-zinc-500">
              <Search className="w-10 h-10 mx-auto opacity-40 text-amber-500" />
              <p className="text-xs font-semibold">Tüm platformda anında arama yapın</p>
              <div className="flex flex-wrap justify-center gap-2 pt-2 text-[11px]">
                <span className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400">
                  🎙️ Canlı Radyolar
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400">
                  🎧 Podcast Bölümleri
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400">
                  🌍 Dünya Ülkeleri
                </span>
              </div>
            </div>
          ) : !hasResults ? (
            <div className="py-8 text-center text-xs text-zinc-500 dark:text-zinc-400">
              "{query}" aramanızla eşleşen sonuç bulunamadı.
            </div>
          ) : (
            <>
              {/* Radio Stations Results */}
              {matchingStations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5" /> Canlı Radyolar ({matchingStations.length})
                  </h4>
                  <div className="space-y-1.5">
                    {matchingStations.map(station => (
                      <div
                        key={station.id || station.stationuuid}
                        onClick={() => {
                          onPlayStation(station);
                          onClose();
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 hover:bg-amber-500/10 dark:hover:bg-amber-500/20 border border-zinc-200 dark:border-zinc-700/60 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={station.favicon || 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=100&q=80'}
                            alt={station.name}
                            className="w-10 h-10 rounded-lg object-cover shrink-0 border border-zinc-200 dark:border-zinc-700"
                            onError={e => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=100&q=80';
                            }}
                          />
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-zinc-900 dark:text-white truncate group-hover:text-amber-500">
                              {station.name}
                            </h5>
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                              {station.tags || station.country || 'Radyo'}
                            </p>
                          </div>
                        </div>
                        <button className="p-2 rounded-lg bg-amber-500 text-zinc-950 font-bold text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Dinle</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Podcast Results */}
              {matchingPodcasts.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5" /> Podcast Serileri ({matchingPodcasts.length})
                  </h4>
                  <div className="space-y-1.5">
                    {matchingPodcasts.map(pod => (
                      <div
                        key={pod.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={pod.coverUrl || 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=100&q=80'}
                            alt={pod.title}
                            className="w-10 h-10 rounded-lg object-cover shrink-0 border border-zinc-200 dark:border-zinc-700"
                            onError={e => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=100&q=80';
                            }}
                          />
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                              {pod.title}
                            </h5>
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                              {pod.publisher} • {pod.category}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Country Results */}
              {matchingCountries.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" /> Ülkeler
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {matchingCountries.map(c => (
                      <div
                        key={c.code}
                        onClick={() => {
                          onSelectCountry(c.code);
                          onClose();
                        }}
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 hover:bg-amber-500/10 border border-zinc-200 dark:border-zinc-700/60 transition-all cursor-pointer group"
                      >
                        <span className="text-lg">{c.flag}</span>
                        <span className="text-xs font-bold text-zinc-900 dark:text-white group-hover:text-amber-500 truncate">
                          {COUNTRY_NAMES_TR[c.code] || c.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950/60 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-400 flex justify-between items-center">
          <span>İpucu: İstediğiniz an <kbd className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-[10px]">Cmd + K</kbd> tuşlarına basarak aramayı açabilirsiniz.</span>
        </div>
      </div>
    </div>
  );
};
