import React, { useState } from 'react';
import { 
  ListMusic, 
  Plus, 
  Trash2, 
  X, 
  Music2
} from 'lucide-react';
import { Playlist, RadioStation } from '../types';
import { StationCard } from './StationCard';
import { PlaybackStatus } from '../services/audioEngine';

interface PlaylistsViewProps {
  playlists: Playlist[];
  allStations: RadioStation[];
  favorites: RadioStation[];
  currentStation: RadioStation | null;
  isPlaying: boolean;
  playbackStatus?: PlaybackStatus;
  onPlayStation: (station: RadioStation) => void;
  onToggleFavorite: (station: RadioStation) => void;
  onCreatePlaylist: (name: string, description?: string) => void;
  onDeletePlaylist: (id: string) => void;
  onRemoveFromPlaylist: (playlistId: string, stationUuid: string) => void;
  onAddToPlaylist: (playlistId: string, stationUuid: string) => void;
}

export const PlaylistsView: React.FC<PlaylistsViewProps> = React.memo(({
  playlists,
  allStations,
  favorites,
  currentStation,
  isPlaying,
  playbackStatus,
  onPlayStation,
  onToggleFavorite,
  onCreatePlaylist,
  onDeletePlaylist,
  onRemoveFromPlaylist,
  onAddToPlaylist
}) => {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>(playlists[0]?.id || '');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');

  const activePlaylist = playlists.find((p) => p.id === selectedPlaylistId) || playlists[0];

  // Helper to resolve stations in playlist from stationUuids
  const allKnownStations = [...allStations, ...favorites];
  const stationMap = new Map<string, RadioStation>();
  allKnownStations.forEach((s) => stationMap.set(s.stationuuid, s));

  const playlistStations = activePlaylist
    ? activePlaylist.stationUuids
        .map((id) => stationMap.get(id))
        .filter((s): s is RadioStation => s !== undefined)
    : [];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      onCreatePlaylist(newPlaylistName.trim(), newPlaylistDesc.trim());
      setNewPlaylistName('');
      setNewPlaylistDesc('');
      setShowCreateModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2.5">
            <ListMusic className="w-5 h-5 text-amber-500" />
            <span>Özel Çalma Listelerim</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-mono font-bold">
              {playlists.length} Liste
            </span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Kendi tematik radyo gruplarınızı oluşturun ve yönetin
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center space-x-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Liste Oluştur</span>
        </button>
      </div>

      {/* Playlist Selector Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-zinc-200 dark:border-zinc-800/60 scrollbar-none">
        {playlists.map((p) => {
          const isSelected = p.id === activePlaylist?.id;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedPlaylistId(p.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 flex items-center space-x-2 border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-amber-500 text-zinc-950 font-bold border-amber-500 shadow-md'
                  : 'bg-white dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Music2 className="w-3.5 h-3.5" />
              <span>{p.name}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                isSelected ? 'bg-zinc-950 text-amber-400 font-bold' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
              }`}>
                {p.stationUuids.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Playlist Details & Content */}
      {activePlaylist ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white dark:bg-zinc-900/60 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {activePlaylist.name}
              </h2>
              {activePlaylist.description && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {activePlaylist.description}
                </p>
              )}
            </div>

            {playlists.length > 1 && (
              <button
                onClick={() => onDeletePlaylist(activePlaylist.id)}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-semibold border border-rose-500/30 flex items-center space-x-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Listeyi Sil</span>
              </button>
            )}
          </div>

          {playlistStations.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-white dark:bg-zinc-900/30 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 p-8 shadow-sm">
              <Music2 className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                Bu listede henüz radyo bulunmuyor
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                Radyo kartlarındaki liste ikonunu kullanarak bu çalma listesine radyo ekleyebilirsiniz.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {playlistStations.map((station) => (
                <div key={station.stationuuid} className="relative group">
                  <StationCard
                    station={station}
                    isPlaying={isPlaying}
                    status={playbackStatus}
                    isCurrentStation={currentStation?.stationuuid === station.stationuuid}
                    isFavorite={favorites.some((f) => f.stationuuid === station.stationuuid)}
                    onPlay={onPlayStation}
                    onToggleFavorite={onToggleFavorite}
                    playlists={playlists}
                    onAddToPlaylist={onAddToPlaylist}
                  />
                  <button
                    onClick={() => onRemoveFromPlaylist(activePlaylist.id, station.stationuuid)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-zinc-950/80 hover:bg-rose-600 text-zinc-300 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-10"
                    title="Listeden Çıkar"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center space-x-2">
                <ListMusic className="w-4 h-4 text-amber-500" />
                <span>Yeni Çalma Listesi</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                  Liste Adı *
                </label>
                <input
                  type="text"
                  required
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="örn. Yol Müzikleri, Haber ve Spor"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-zinc-700 dark:text-zinc-300 font-semibold mb-1">
                  Açıklama (İsteğe Bağlı)
                </label>
                <input
                  type="text"
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  placeholder="örn. Uzun seyahatlerde dinlediğim favori radyolar"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold"
                >
                  Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
});

