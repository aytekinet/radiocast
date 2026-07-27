import React, { useState } from 'react';
import { Heart, Search, ArrowUpDown, Trash2, Radio } from 'lucide-react';
import { Playlist, RadioStation } from '../types';
import { StationCard } from './StationCard';
import { PlaybackStatus } from '../services/audioEngine';

interface FavoritesViewProps {
  favorites: RadioStation[];
  currentStation: RadioStation | null;
  isPlaying: boolean;
  playbackStatus?: PlaybackStatus;
  onPlayStation: (station: RadioStation) => void;
  onToggleFavorite: (station: RadioStation) => void;
  playlists: Playlist[];
  onAddToPlaylist: (playlistId: string, stationUuid: string) => void;
  onClearAllFavorites: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = React.memo(({
  favorites,
  currentStation,
  isPlaying,
  playbackStatus,
  onPlayStation,
  onToggleFavorite,
  playlists,
  onAddToPlaylist,
  onClearAllFavorites
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'clicks' | 'recent'>('recent');

  const filtered = favorites.filter((s) =>
    s.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    (s.tags && s.tags.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'clicks') return (b.clickcount || 0) - (a.clickcount || 0);
    return 0; // Default recent order
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2.5">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <span>Favori Radyolarım</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/30 font-mono font-bold">
              {favorites.length} Radyo
            </span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Tek tıkla favorilerinize eklediğiniz canlı radyolar
          </p>
        </div>

        {favorites.length > 0 && (
          <div className="flex items-center space-x-3">
            {/* Sort options */}
            <div className="flex items-center space-x-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400 ml-1.5" />
              <button
                onClick={() => setSortBy('recent')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  sortBy === 'recent' ? 'bg-amber-500 text-zinc-950 font-bold' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                Son Eklenen
              </button>
              <button
                onClick={() => setSortBy('name')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  sortBy === 'name' ? 'bg-amber-500 text-zinc-950 font-bold' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                İsim A-Z
              </button>
            </div>

            <button
              onClick={onClearAllFavorites}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-500 text-xs font-medium flex items-center space-x-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tümünü Temizle</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter Search */}
      {favorites.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Favoriler arasında ara..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-amber-500 transition-colors shadow-sm"
          />
        </div>
      )}

      {/* Favorites Grid / Empty State */}
      {favorites.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-white dark:bg-zinc-900/30 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 p-8 shadow-sm">
          <Heart className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
          <div>
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              Henüz favori radyonuz bulunmuyor
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-1">
              Beğendiğiniz radyo kartlarındaki kalp ikonuna tıklayarak favorilerinize ekleyebilirsiniz.
            </p>
          </div>
        </div>
      ) : sorted.length === 0 ? (
        <div className="py-12 text-center text-xs text-zinc-500 dark:text-zinc-400">
          Aramanızla eşleşen favori radyo bulunamadı.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {sorted.map((station) => (
            <StationCard
              key={station.stationuuid}
              station={station}
              isPlaying={isPlaying}
              status={playbackStatus}
              isCurrentStation={currentStation?.stationuuid === station.stationuuid}
              isFavorite={true}
              onPlay={onPlayStation}
              onToggleFavorite={onToggleFavorite}
              playlists={playlists}
              onAddToPlaylist={onAddToPlaylist}
            />
          ))}
        </div>
      )}
    </div>
  );
});

