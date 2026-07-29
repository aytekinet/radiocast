import React, { useState } from 'react';
import { Heart, Search, ArrowUpDown, Trash2, Radio, Mic, Headphones, Play, Pause, ChevronRight, Calendar, Clock } from 'lucide-react';
import { Playlist, RadioStation, PodcastShow, PodcastEpisode } from '../types';
import { StationCard } from './StationCard';
import { PlaybackStatus } from '../services/audioEngine';

interface FavoritesViewProps {
  favorites: RadioStation[];
  favoritePodcasts?: PodcastShow[];
  favoriteEpisodes?: PodcastEpisode[];
  currentStation: RadioStation | null;
  currentEpisodeId?: string | null;
  isPlaying: boolean;
  playbackStatus?: PlaybackStatus;
  onPlayStation: (station: RadioStation) => void;
  onPlayPodcastEpisode?: (episode: PodcastEpisode, episodes?: PodcastEpisode[]) => void;
  onToggleFavorite: (station: RadioStation) => void;
  onToggleFavoritePodcast?: (show: PodcastShow) => void;
  onToggleFavoriteEpisode?: (episode: PodcastEpisode) => void;
  playlists: Playlist[];
  onAddToPlaylist: (playlistId: string, stationUuid: string) => void;
  onClearAllFavorites: () => void;
  onOpenPodcastShow?: (show: PodcastShow) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = React.memo(({
  favorites,
  favoritePodcasts = [],
  favoriteEpisodes = [],
  currentStation,
  currentEpisodeId,
  isPlaying,
  playbackStatus,
  onPlayStation,
  onPlayPodcastEpisode,
  onToggleFavorite,
  onToggleFavoritePodcast,
  onToggleFavoriteEpisode,
  playlists,
  onAddToPlaylist,
  onClearAllFavorites,
  onOpenPodcastShow
}) => {
  const [activeFavTab, setActiveFavTab] = useState<'radios' | 'podcasts' | 'episodes'>('radios');
  const [filterQuery, setFilterQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'clicks' | 'recent'>('recent');

  // Filter & Sort Radios
  const filteredRadios = favorites.filter((s) =>
    s.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    (s.tags && s.tags.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  const sortedRadios = [...filteredRadios].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'clicks') return (b.clickcount || 0) - (a.clickcount || 0);
    return 0;
  });

  // Filter Podcasts
  const filteredPodcasts = favoritePodcasts.filter((p) =>
    p.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
    (p.publisher && p.publisher.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  // Filter Episodes
  const filteredEpisodes = favoriteEpisodes.filter((e) =>
    e.title.toLowerCase().includes(filterQuery.toLowerCase()) ||
    e.showTitle.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const totalFavoritesCount = favorites.length + favoritePodcasts.length + favoriteEpisodes.length;

  return (
    <div className="space-y-6">
      {/* Top Header & Sub-Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2.5">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <span>Favorilerim</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/30 font-mono font-bold">
              {totalFavoritesCount} İçerik
            </span>
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Favorilere eklediğiniz canlı radyolar, podcast serileri ve bölümleri
          </p>
        </div>

        {/* Category Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs overflow-x-auto">
          <button
            onClick={() => setActiveFavTab('radios')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeFavTab === 'radios'
                ? 'bg-amber-500 text-zinc-950 shadow-md scale-[1.02]'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Radyolar ({favorites.length})</span>
          </button>

          <button
            onClick={() => setActiveFavTab('podcasts')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeFavTab === 'podcasts'
                ? 'bg-amber-500 text-zinc-950 shadow-md scale-[1.02]'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Podcastler ({favoritePodcasts.length})</span>
          </button>

          <button
            onClick={() => setActiveFavTab('episodes')}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeFavTab === 'episodes'
                ? 'bg-amber-500 text-zinc-950 shadow-md scale-[1.02]'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            <Headphones className="w-4 h-4" />
            <span>Bölümler ({favoriteEpisodes.length})</span>
          </button>
        </div>
      </div>

      {/* Filter Search & Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder={
              activeFavTab === 'radios'
                ? 'Favori radyolar arasında ara...'
                : activeFavTab === 'podcasts'
                ? 'Favori podcastler arasında ara...'
                : 'Favori bölümler arasında ara...'
            }
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-amber-500 transition-colors shadow-sm"
          />
        </div>

        {activeFavTab === 'radios' && favorites.length > 0 && (
          <div className="flex items-center space-x-3 shrink-0">
            <div className="flex items-center space-x-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400 ml-1.5" />
              <button
                onClick={() => setSortBy('recent')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  sortBy === 'recent' ? 'bg-amber-500 text-zinc-950 font-bold' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                Son Eklenen
              </button>
              <button
                onClick={() => setSortBy('name')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  sortBy === 'name' ? 'bg-amber-500 text-zinc-950 font-bold' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                İsim A-Z
              </button>
            </div>

            <button
              onClick={onClearAllFavorites}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-500 text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Radyoları Temizle</span>
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: RADIOS */}
      {activeFavTab === 'radios' && (
        <>
          {favorites.length === 0 ? (
            <div className="py-20 text-center space-y-4 bg-white dark:bg-zinc-900/30 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 p-8 shadow-sm">
              <Radio className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
              <div>
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  Henüz favori radyonuz bulunmuyor
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-1">
                  Beğendiğiniz radyo kartlarındaki kalp ikonuna tıklayarak favorilerinize ekleyebilirsiniz.
                </p>
              </div>
            </div>
          ) : sortedRadios.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500 dark:text-zinc-400">
              Aramanızla eşleşen favori radyo bulunamadı.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {sortedRadios.map((station) => (
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
        </>
      )}

      {/* TAB 2: PODCAST SHOWS */}
      {activeFavTab === 'podcasts' && (
        <>
          {favoritePodcasts.length === 0 ? (
            <div className="py-20 text-center space-y-4 bg-white dark:bg-zinc-900/30 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 p-8 shadow-sm">
              <Mic className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
              <div>
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  Henüz favori podcast seriniz bulunmuyor
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-1">
                  Podcast sayfasındaki serilerin üzerindeki kalp ikonuna tıklayarak favori podcast listenize ekleyebilirsiniz.
                </p>
              </div>
            </div>
          ) : filteredPodcasts.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500 dark:text-zinc-400">
              Aramanızla eşleşen favori podcast bulunamadı.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPodcasts.map((show) => (
                <div
                  key={show.id || show.feedUrl}
                  className="group bg-white dark:bg-zinc-900/80 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50 rounded-2xl p-4 transition-all duration-300 hover:shadow-lg flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-950">
                      <img
                        src={show.coverUrl}
                        alt={show.title}
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&q=80'; }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Remove from favorites button */}
                      {onToggleFavoritePodcast && (
                        <button
                          onClick={() => onToggleFavoritePodcast(show)}
                          title="Favorilerden Çıkar"
                          className="absolute top-2 right-2 p-2 rounded-xl bg-rose-500 text-white shadow-md hover:scale-110 transition-all z-10 cursor-pointer"
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </button>
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-zinc-900 dark:text-white text-base line-clamp-1 group-hover:text-amber-500 transition-colors">
                        {show.title}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">{show.publisher}</p>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400/80 line-clamp-2 leading-relaxed">
                      {show.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between text-[11px]">
                    <button
                      onClick={() => onOpenPodcastShow && onOpenPodcastShow(show)}
                      className="w-full py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-600 dark:text-amber-400 hover:text-zinc-950 font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>Bölümleri Gör</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* TAB 3: PODCAST EPISODES */}
      {activeFavTab === 'episodes' && (
        <>
          {favoriteEpisodes.length === 0 ? (
            <div className="py-20 text-center space-y-4 bg-white dark:bg-zinc-900/30 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 p-8 shadow-sm">
              <Headphones className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
              <div>
                <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  Henüz favori podcast bölümünüz bulunmuyor
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-1">
                  Podcast detay sayfasındaki bölümlerin yanında bulunan kalp ikonuna basarak bölümleri favorilerinize kaydedebilirsiniz.
                </p>
              </div>
            </div>
          ) : filteredEpisodes.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500 dark:text-zinc-400">
              Aramanızla eşleşen favori bölüm bulunamadı.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEpisodes.map((ep) => {
                const isThisPlaying = currentEpisodeId === ep.id && isPlaying;

                return (
                  <div
                    key={ep.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isThisPlaying
                        ? 'bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/10'
                        : 'bg-white dark:bg-zinc-900/70 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        <img
                          src={ep.coverUrl}
                          alt={ep.title}
                          className="w-14 h-14 rounded-xl object-cover shrink-0 border border-zinc-200 dark:border-zinc-800"
                        />
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 text-[10px] text-zinc-500 dark:text-zinc-400">
                            <span className="font-bold text-amber-500">{ep.showTitle}</span>
                            {ep.publishedDate && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-zinc-400" /> {ep.publishedDate}</span>
                              </>
                            )}
                            {ep.durationSeconds > 0 && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-zinc-400" /> {Math.floor(ep.durationSeconds / 60)} dk</span>
                              </>
                            )}
                          </div>

                          <h3 className={`text-sm font-bold line-clamp-1 ${isThisPlaying ? 'text-amber-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
                            {ep.title}
                          </h3>
                          <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-1">
                            {ep.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {onToggleFavoriteEpisode && (
                          <button
                            onClick={() => onToggleFavoriteEpisode(ep)}
                            title="Favorilerden Çıkar"
                            className="p-2.5 rounded-xl bg-rose-500/15 text-rose-500 border border-rose-500/30 hover:bg-rose-500/25 transition-all cursor-pointer"
                          >
                            <Heart className="w-4 h-4 fill-current" />
                          </button>
                        )}

                        {onPlayPodcastEpisode && (
                          <button
                            onClick={() => onPlayPodcastEpisode(ep)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 active:scale-95 shadow-md cursor-pointer ${
                              isThisPlaying
                                ? 'bg-amber-500 text-zinc-950 shadow-amber-500/30'
                                : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700'
                            }`}
                          >
                            {isThisPlaying ? (
                              <>
                                <Pause className="w-4 h-4 fill-current" /> Duraklat
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 fill-current" /> Dinle
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
});
