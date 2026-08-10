import React, { useState, useEffect } from 'react';
import { 
  DownloadCloud, 
  Trash2, 
  Play, 
  Pause, 
  HardDrive, 
  CheckCircle2, 
  Search, 
  Clock, 
  AlertCircle, 
  WifiOff, 
  Mic, 
  Sparkles,
  Loader2,
  FolderDown
} from 'lucide-react';
import { PodcastEpisode, PlayableItem } from '../types';
import { 
  getAllDownloadedEpisodes, 
  getTotalOfflineStorageUsed, 
  deleteDownloadedEpisode, 
  clearAllDownloadedEpisodes, 
  formatBytes,
  getActiveDownloadsMap,
  ActiveDownloadState,
  cancelDownloadEpisode
} from '../services/offlineStorage';
import { audioEngine, PlaybackStatus } from '../services/audioEngine';

interface DownloadsViewProps {
  onSelectPodcastShow?: (showId: string) => void;
  onNavigateToPodcasts?: () => void;
  onPlayEpisode?: (episode: PodcastEpisode, episodes?: PodcastEpisode[]) => void;
}

export const DownloadsView: React.FC<DownloadsViewProps> = ({
  onSelectPodcastShow,
  onNavigateToPodcasts,
  onPlayEpisode
}) => {
  const [downloadedItems, setDownloadedItems] = useState<{ episode: PodcastEpisode; sizeBytes: number; downloadedAt: number }[]>([]);
  const [totalSizeStr, setTotalSizeStr] = useState<string>('0 B');
  const [totalBytes, setTotalBytes] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeDownloads, setActiveDownloads] = useState<ActiveDownloadState[]>([]);
  
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>(audioEngine.getStatus());
  const [currentItem, setCurrentItem] = useState<PlayableItem | null>(audioEngine.getCurrentItem());

  const loadData = async () => {
    try {
      const items = await getAllDownloadedEpisodes();
      const storage = await getTotalOfflineStorageUsed();
      setDownloadedItems(items);
      setTotalSizeStr(storage.formattedSize);
      setTotalBytes(storage.totalBytes);
    } catch (err) {
      console.error('Failed to load downloaded episodes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Listen to offline storage & download events
    const handleStorageChange = () => {
      loadData();
    };

    const handleProgressChange = () => {
      const map = getActiveDownloadsMap();
      setActiveDownloads(Array.from(map.values()));
    };

    window.addEventListener('offlineEpisodesChanged', handleStorageChange);
    window.addEventListener('downloadProgressChanged', handleProgressChange);

    // Initial check of active downloads
    handleProgressChange();

    // Audio Engine state listeners
    audioEngine.setCallbacks({
      onStatusChange: (status) => setPlaybackStatus(status),
      onItemChange: (item) => setCurrentItem(item)
    });

    return () => {
      window.removeEventListener('offlineEpisodesChanged', handleStorageChange);
      window.removeEventListener('downloadProgressChanged', handleProgressChange);
    };
  }, []);

  const handleDeleteItem = async (episodeId: string) => {
    if (confirm('Bu bölüm cihaz yerel hafızasından silinsin mi?')) {
      await deleteDownloadedEpisode(episodeId);
      await loadData();
    }
  };

  const handleClearAll = async () => {
    if (confirm('İndirilen TÜM podcast bölümleri cihazınızdan silinecek. Emin misiniz?')) {
      await clearAllDownloadedEpisodes();
      await loadData();
    }
  };

  const handlePlayEpisode = (episode: PodcastEpisode) => {
    if (onPlayEpisode) {
      const allEps = downloadedItems.map(item => item.episode);
      onPlayEpisode(episode, allEps);
    } else {
      audioEngine.playPodcastEpisode(episode);
    }
  };

  const filteredItems = downloadedItems.filter(item => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      item.episode.title.toLowerCase().includes(query) ||
      item.episode.showTitle.toLowerCase().includes(query) ||
      (item.episode.category && item.episode.category.toLowerCase().includes(query))
    );
  });

  const formatDuration = (seconds?: number) => {
    if (!seconds || seconds <= 0) return 'Bilinmiyor';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    if (m >= 60) {
      const h = Math.floor(m / 60);
      const remM = m % 60;
      return `${h} sa ${remM} dk`;
    }
    return `${m} dk ${s > 0 ? `${s} sn` : ''}`;
  };

  return (
    <div className="p-4 md:p-6 space-y-8 max-w-7xl mx-auto pb-56 sm:pb-48 md:pb-40">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-500 font-bold text-xs uppercase tracking-widest mb-1">
            <FolderDown className="w-4 h-4" />
            <span>Çevrimdışı İndirme Yöneticisi</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            İndirilen Podcast'ler
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            İnternetiniz olmasa bile uçak modunda kesintisiz dinleyebileceğiniz ses arşiviniz.
          </p>
        </div>

        {downloadedItems.length > 0 && (
          <button
            onClick={handleClearAll}
            className="self-start md:self-auto px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Tüm İndirilenleri Sil</span>
          </button>
        )}
      </div>

      {/* Device Storage Status Card */}
      <div className="p-5 md:p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-zinc-900/40 to-zinc-900/60 border border-amber-500/30 dark:border-amber-500/20 shadow-xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <HardDrive className="w-40 h-40 text-amber-500" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="p-3.5 rounded-2xl bg-amber-500 text-zinc-950 font-black shadow-lg shadow-amber-500/20 shrink-0">
              <HardDrive className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                Cihaz Yerel Hafızası
              </div>
              <div className="text-2xl font-black text-zinc-900 dark:text-white mt-0.5">
                {totalSizeStr} <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">kullanılıyor</span>
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center space-x-2">
                <span>{downloadedItems.length} İndirilmiş Bölüm</span>
                <span>•</span>
                <span className="text-emerald-500 dark:text-emerald-400 font-semibold flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> IndexedDB İzolasyonu
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-zinc-100 dark:bg-zinc-800/80 px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700/80 text-xs">
            <WifiOff className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
            <div className="text-zinc-700 dark:text-zinc-300">
              <span className="font-bold block text-zinc-900 dark:text-white">Çevrimdışı Hazır</span>
              <span>İnternet kopsa da çalınır</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Background Downloads Section (if downloading) */}
      {activeDownloads.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center space-x-2">
            <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
            <span>Devam Eden İndirmeler ({activeDownloads.length})</span>
          </h3>

          <div className="space-y-2">
            {activeDownloads.map((dl) => (
              <div 
                key={dl.episodeId}
                className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <img 
                    src={dl.episode.coverUrl} 
                    alt={dl.episode.title}
                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                      {dl.episode.title}
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                      {dl.episode.showTitle}
                    </p>
                    {dl.error && (
                      <p className="text-[11px] text-rose-500 font-semibold mt-0.5">
                        {dl.error}
                      </p>
                    )}
                  </div>
                </div>

                <div className="w-full sm:w-56 shrink-0 space-y-1">
                  <div className="flex justify-between items-center text-[11px] font-bold text-amber-600 dark:text-amber-400">
                    <span>İndiriliyor... %{dl.progressPct}</span>
                    <button
                      onClick={() => cancelDownloadEpisode(dl.episodeId)}
                      className="px-2 py-0.5 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-[10px] font-bold transition-all cursor-pointer"
                    >
                      Durdur / İptal
                    </button>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full transition-all duration-300" 
                      style={{ width: `${dl.progressPct}%` }}
                    />
                  </div>
                  {dl.totalBytes > 0 && (
                    <div className="text-[10px] text-zinc-400 text-right">
                      {formatBytes(dl.downloadedBytes)} / {formatBytes(dl.totalBytes)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Downloaded Episodes Search & List */}
      <div className="space-y-4">
        {/* Search Input */}
        {downloadedItems.length > 0 && (
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="İndirilen bölümlerde ara (başlık, podcast adı...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-amber-500 transition-all"
            />
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center text-zinc-500 dark:text-zinc-400 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            <p className="text-xs">Çevrimdışı dosyalar taranıyor...</p>
          </div>
        ) : downloadedItems.length === 0 ? (
          <div className="p-8 md:p-12 rounded-3xl bg-zinc-100/80 dark:bg-zinc-900/50 border border-dashed border-zinc-300 dark:border-zinc-800 text-center flex flex-col items-center justify-center space-y-4">
            <div className="p-4 rounded-full bg-amber-500/10 text-amber-500">
              <DownloadCloud className="w-10 h-10" />
            </div>
            <div className="max-w-md">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Henüz Çevrimdışı Bölüm İndirilmedi
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                Podcast bölümlerinin yanındaki <strong>"Çevrimdışı İndir"</strong> butonuna basarak istediğiniz yayını cihazınıza kaydedebilir, internetiniz yokken veya uçak modundayken kesintisiz dinleyebilirsiniz.
              </p>
            </div>
            {onNavigateToPodcasts && (
              <button
                onClick={onNavigateToPodcasts}
                className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center space-x-2 transition-all cursor-pointer"
              >
                <Mic className="w-4 h-4" />
                <span>Podcast'leri Keşfet</span>
              </button>
            )}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 text-xs">
            Aramanızla eşleşen indirilen bölüm bulunamadı.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map(({ episode, sizeBytes, downloadedAt }) => {
              const isPlaying = currentItem?.type === 'podcast' && currentItem.podcastEpisode?.id === episode.id && playbackStatus === 'playing';
              const isCurrent = currentItem?.type === 'podcast' && currentItem.podcastEpisode?.id === episode.id;

              return (
                <div
                  key={episode.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                    isCurrent
                      ? 'bg-amber-500/10 border-amber-500/40'
                      : 'bg-white dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={episode.coverUrl || 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=200&q=80'}
                        alt={episode.title}
                        className="w-14 h-14 rounded-xl object-cover shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        onClick={() => handlePlayEpisode(episode)}
                        className={`absolute inset-0 m-auto w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                          isPlaying 
                            ? 'bg-amber-500 text-zinc-950 shadow-md scale-100' 
                            : 'bg-zinc-950/70 text-white opacity-0 group-hover:opacity-100 backdrop-blur-sm'
                        }`}
                      >
                        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                      </button>
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Çevrimdışı İndirildi
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {formatBytes(sizeBytes)}
                        </span>
                      </div>

                      <h4 className="text-xs md:text-sm font-bold text-zinc-900 dark:text-white truncate group-hover:text-amber-500 transition-colors">
                        {episode.title}
                      </h4>

                      <div className="flex items-center space-x-2 text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                        <span className="font-medium text-amber-600 dark:text-amber-400 truncate">
                          {episode.showTitle}
                        </span>
                        <span>•</span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1 text-zinc-400" />
                          {formatDuration(episode.durationSeconds)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800 shrink-0">
                    <button
                      onClick={() => handlePlayEpisode(episode)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                        isPlaying
                          ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20'
                          : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-zinc-800 dark:text-zinc-200'
                      }`}
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      <span>{isPlaying ? 'Duraklat' : 'Çevrimdışı Dinle'}</span>
                    </button>

                    <button
                      onClick={() => handleDeleteItem(episode.id)}
                      title="Cihazdan Sil"
                      className="p-2 rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
