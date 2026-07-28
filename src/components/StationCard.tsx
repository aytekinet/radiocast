import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Heart, 
  ListPlus, 
  Radio, 
  Volume2, 
  Check,
  RefreshCw
} from 'lucide-react';
import { Playlist, RadioStation } from '../types';
import { PlaybackStatus } from '../services/audioEngine';

interface StationCardProps {
  station: RadioStation;
  isPlaying: boolean;
  status?: PlaybackStatus;
  isCurrentStation: boolean;
  isFavorite: boolean;
  onPlay: (station: RadioStation) => void;
  onToggleFavorite: (station: RadioStation) => void;
  playlists: Playlist[];
  onAddToPlaylist: (playlistId: string, stationUuid: string) => void;
}

export const StationCard: React.FC<StationCardProps> = React.memo(({
  station,
  isPlaying,
  status,
  isCurrentStation,
  isFavorite,
  onPlay,
  onToggleFavorite,
  playlists,
  onAddToPlaylist
}) => {
  const [imgError, setImgError] = useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  const tagsList = station.tags ? station.tags.split(',').filter(Boolean).slice(0, 2) : [];

  const handlePlaylistSelect = (playlistId: string, playlistName: string) => {
    onAddToPlaylist(playlistId, station.stationuuid);
    setShowPlaylistMenu(false);
    setAddedNotice(playlistName);
    setTimeout(() => setAddedNotice(null), 2000);
  };

  return (
    <div
      data-station-card="true"
      onClick={() => onPlay(station)}
      className={`group relative rounded-2xl p-3 border transition-all duration-200 ease-out flex flex-col justify-between cursor-pointer h-[156px] min-h-[156px] max-h-[156px] overflow-hidden ${
        isCurrentStation
          ? 'bg-amber-500/10 dark:bg-zinc-900/95 border-amber-500 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30'
          : 'bg-white dark:bg-zinc-900/70 border-zinc-200 dark:border-zinc-800/80 hover:border-amber-500/50 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 shadow-sm'
      }`}
    >
      {/* Upper Content Section */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Logo + Action Buttons */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="relative shrink-0">
            {station.favicon && !imgError ? (
              <img
                src={station.favicon}
                alt={station.name || 'Radyo'}
                loading="lazy"
                decoding="async"
                onError={() => setImgError(true)}
                className="w-9 h-9 rounded-xl object-contain bg-zinc-100 dark:bg-zinc-950 p-1 border border-zinc-200 dark:border-zinc-800 shadow-inner"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-zinc-800 border border-amber-500/30 dark:border-zinc-700/80 flex items-center justify-center text-amber-500">
                <Radio className="w-4 h-4 text-amber-500" />
              </div>
            )}

            {isCurrentStation && isPlaying && (
              <div className="absolute -bottom-1 -right-1 p-0.5 bg-amber-500 text-zinc-950 rounded-full border border-zinc-950 shadow">
                <Volume2 className="w-2.5 h-2.5 animate-pulse" />
              </div>
            )}
          </div>

          <div className="flex items-center space-x-1 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(station);
              }}
              className={`p-1.5 rounded-lg border transition-all ${
                isFavorite
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-500'
                  : 'bg-zinc-100 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700/50 text-zinc-400 hover:text-rose-500 hover:bg-zinc-200 dark:hover:bg-zinc-800'
              }`}
              title={isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>

            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPlaylistMenu(!showPlaylistMenu);
                }}
                className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/50 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all"
                title="Çalma Listesine Ekle"
              >
                <ListPlus className="w-3.5 h-3.5" />
              </button>

              {showPlaylistMenu && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-1.5 w-52 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl p-2 z-50 animate-fadeIn space-y-1"
                >
                  <div className="flex items-center justify-between pb-1.5 mb-1 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider px-1">
                      Çalma Listesi Seç
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPlaylistMenu(false);
                      }}
                      className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs px-1"
                    >
                      ✕
                    </button>
                  </div>

                  {addedNotice && (
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold flex items-center space-x-1">
                      <Check className="w-3 h-3 shrink-0" />
                      <span className="truncate">{addedNotice} eklendi</span>
                    </div>
                  )}

                  {playlists.length > 0 ? (
                    <div className="max-h-40 overflow-y-auto space-y-0.5">
                      {playlists.map((p) => {
                        const isAdded = p.stationUuids.includes(station.stationuuid);
                        return (
                          <button
                            key={p.id}
                            onClick={() => handlePlaylistSelect(p.id, p.name)}
                            className={`w-full text-left px-2 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                              isAdded
                                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold'
                                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                            }`}
                          >
                            <span className="truncate">{p.name}</span>
                            {isAdded && <Check className="w-3 h-3 text-amber-500 shrink-0 ml-1" />}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-2.5 text-center bg-zinc-50 dark:bg-zinc-800/40 rounded-lg">
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium">Henüz liste yok</p>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                        Çalma Listelerim sekmesinden oluşturun.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Station Title */}
        <div className="my-0.5 min-w-0">
          <h3 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-amber-500 transition-colors truncate leading-tight">
            {station.name || 'İsimsiz Radyo'}
          </h3>
        </div>

        {/* Tags / Location */}
        <div className="flex items-center gap-1 my-0.5 overflow-hidden whitespace-nowrap">
          {station.countrycode && (
            <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60 shrink-0">
              {station.countrycode}
            </span>
          )}
          {tagsList.map((tag, idx) => (
            <span
              key={idx}
              className="text-[9px] font-medium px-1 py-0.2 rounded bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/40 truncate max-w-[80px] shrink-0"
            >
              #{tag.trim()}
            </span>
          ))}
        </div>
      </div>

      {/* Footer: Codec Badge & Play Button */}
      <div className="flex items-center justify-between pt-1.5 border-t border-zinc-200 dark:border-zinc-800/80 mt-auto shrink-0">
        <div className="flex items-center space-x-1 text-[10px] text-zinc-400 dark:text-zinc-500 font-mono shrink-0">
          {station.codec && (
            <span className="uppercase text-zinc-400 font-medium">
              {station.codec}
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlay(station);
          }}
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all shadow-md active:scale-90 shrink-0 ${
            isCurrentStation && (isPlaying || status === 'connecting' || status === 'buffering')
              ? 'bg-amber-500 text-zinc-950 font-bold shadow-amber-500/20 scale-105'
              : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700/80 shadow-sm'
          }`}
          title={isCurrentStation && (isPlaying || status === 'connecting' || status === 'buffering') ? 'Durdur' : 'Dinle'}
        >
          {isCurrentStation && (status === 'connecting' || status === 'buffering') ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-zinc-950" />
          ) : isCurrentStation && (isPlaying || status === 'playing') ? (
            <Pause className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          )}
        </button>
      </div>
    </div>
  );
});
