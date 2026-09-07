import React, { useState, memo } from 'react';
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

export const StationCard: React.FC<StationCardProps> = memo(({
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

  const handlePlaylistSelect = (playlistId: string, playlistName: string) => {
    onAddToPlaylist(playlistId, station.stationuuid);
    setShowPlaylistMenu(false);
    setAddedNotice(playlistName);
    setTimeout(() => setAddedNotice(null), 2000);
  };

  const isBuffering = isCurrentStation && (status === 'connecting' || status === 'buffering');
  const isCurrentlyActive = isCurrentStation && (isPlaying || isBuffering);

  const fallbackGenre = station.mainCategory || (station.tags ? station.tags.split(',')[0].trim() : 'Canlı Radyo');

  return (
    <div
      data-station-card="true"
      onClick={() => onPlay(station)}
      className={`group relative rounded-2xl p-3 transition-all duration-200 ease-out flex flex-col cursor-pointer cv-auto select-none ${
        isCurrentStation
          ? 'bg-emerald-500/10 dark:bg-emerald-500/[0.08] border border-emerald-500/40 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30'
          : 'bg-white/80 dark:bg-white/[0.03] hover:bg-white dark:hover:bg-white/[0.08] border border-zinc-200/70 dark:border-white/[0.06] hover:border-zinc-300 dark:hover:border-white/15 shadow-sm hover:shadow-xl hover:-translate-y-1'
      }`}
    >
      {/* Artwork Cover Box with Floating Play Button (Spotify / Fizy Style) */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900/90 mb-2.5 flex items-center justify-center shrink-0 shadow-inner">
        {station.favicon && !imgError ? (
          <img
            src={station.favicon}
            alt={station.name || 'Radyo'}
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900 text-zinc-400 p-4">
            <Radio className="w-8 h-8 text-emerald-400/80 mb-1" />
            <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-500 line-clamp-1">
              {station.name ? station.name.slice(0, 10) : 'RADYO'}
            </span>
          </div>
        )}

        {/* Soft dark vignette on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

        {/* Top Badges: Live / Codec */}
        <div className="absolute top-2 left-2 flex items-center gap-1 pointer-events-none z-10">
          {isCurrentlyActive ? (
            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-zinc-950 shadow-md">
              <Volume2 className="w-2.5 h-2.5 animate-pulse" />
              <span>YAYINDA</span>
            </span>
          ) : station.codec ? (
            <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-black/60 text-white/90 backdrop-blur-md border border-white/10">
              {station.codec}
            </span>
          ) : null}
        </div>

        {/* Top Right Quick Actions: Favorite + Playlist */}
        <div className="absolute top-2 right-2 flex items-center gap-1 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(station);
            }}
            className={`p-1.5 rounded-full backdrop-blur-md transition-all duration-150 ${
              isFavorite
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                : 'bg-black/50 hover:bg-black/70 text-white/80 hover:text-rose-400 opacity-0 group-hover:opacity-100 hover:scale-110'
            }`}
            title={isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPlaylistMenu(!showPlaylistMenu);
              }}
              className="p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white/80 hover:text-white opacity-0 group-hover:opacity-100 hover:scale-110 backdrop-blur-md transition-all duration-150"
              title="Çalma Listesine Ekle"
            >
              <ListPlus className="w-3.5 h-3.5" />
            </button>

            {/* Playlist Popup Menu */}
            {showPlaylistMenu && (
              <div 
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-1.5 w-52 bg-white dark:bg-[#18191e] border border-zinc-200 dark:border-white/10 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 space-y-1"
              >
                <div className="flex items-center justify-between pb-1.5 mb-1 border-b border-zinc-100 dark:border-white/5">
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
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold'
                              : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/[0.06]'
                          }`}
                        >
                          <span className="truncate">{p.name}</span>
                          {isAdded && <Check className="w-3 h-3 text-emerald-500 shrink-0 ml-1" />}
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

        {/* Circular Floating Play Button (Spotify / Fizy Signature) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlay(station);
          }}
          className={`absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 z-20 shadow-xl ${
            isCurrentlyActive
              ? 'bg-emerald-500 text-zinc-950 scale-100 opacity-100 shadow-emerald-500/40'
              : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/30 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 hover:scale-105 active:scale-95'
          }`}
          title={isCurrentlyActive ? 'Durdur' : 'Dinle'}
        >
          {isBuffering ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : isCurrentlyActive ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>
      </div>

      {/* Station Information */}
      <div className="flex-1 min-w-0">
        <h3 className={`font-semibold text-xs sm:text-sm truncate transition-colors leading-tight ${
          isCurrentStation ? 'text-emerald-500 font-bold' : 'text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-400'
        }`}>
          {station.name || 'İsimsiz Radyo'}
        </h3>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-1">
          {fallbackGenre}
        </p>
      </div>
    </div>
  );
}, (prev, next) => {
  // Ultra-fast memo equality check to prevent needless re-renders of static cards
  return (
    prev.station.stationuuid === next.station.stationuuid &&
    prev.isPlaying === next.isPlaying &&
    prev.isCurrentStation === next.isCurrentStation &&
    prev.status === next.status &&
    prev.isFavorite === next.isFavorite &&
    prev.playlists.length === next.playlists.length
  );
});
