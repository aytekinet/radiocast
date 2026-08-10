import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  VolumeX, 
  Timer, 
  Radio, 
  Heart, 
  RefreshCw,
  RotateCcw,
  RotateCw,
  Mic,
  ListPlus,
  Check,
  SkipBack,
  SkipForward,
  Share2,
  ChevronDown,
  ChevronRight,
  Maximize2,
  X,
  DownloadCloud,
  CheckCircle2,
  Loader2,
  Zap
} from 'lucide-react';
import { RadioStation, PlayableItem, ThemePalette, Playlist, PodcastEpisode } from '../types';
import { PlaybackStatus, audioEngine } from '../services/audioEngine';
import { AudioVisualizer } from './AudioVisualizer';
import { 
  downloadPodcastEpisode, 
  deleteDownloadedEpisode, 
  isEpisodeDownloaded, 
  getActiveDownloadsMap,
  ActiveDownloadState
} from '../services/offlineStorage';

interface PlayerBarProps {
  currentItem: PlayableItem | null;
  status: PlaybackStatus;
  retryCount: number;
  volume: number;
  isMuted: boolean;
  currentTime?: number;
  duration?: number;
  onPlayPause: () => void;
  onStop: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  isFavorite: boolean;
  onToggleFavorite: (station: RadioStation) => void;
  playlists?: Playlist[];
  onAddToPlaylist?: (playlistId: string, stationUuid: string) => void;
  onCreatePlaylist?: (name: string, description?: string, initialStationUuid?: string) => void;
  sleepTimerSeconds: number | null;
  onOpenSleepTimer: () => void;
  lowDataMode: boolean;
  themePalette: ThemePalette;
  onNavigateToDiscover?: () => void;
  onNavigateToPodcastShow?: (episode: PodcastEpisode) => void;
}

export const PlayerBar: React.FC<PlayerBarProps> = React.memo(({
  currentItem,
  status,
  volume,
  isMuted,
  currentTime: propCurrentTime,
  duration: propDuration,
  onPlayPause,
  onStop,
  onNext,
  onPrevious,
  onVolumeChange,
  onToggleMute,
  isFavorite,
  onToggleFavorite,
  playlists = [],
  onAddToPlaylist,
  onCreatePlaylist,
  sleepTimerSeconds,
  onOpenSleepTimer,
  themePalette,
  onNavigateToDiscover,
  onNavigateToPodcastShow
}) => {
  const [localCurrentTime, setLocalCurrentTime] = useState(0);
  const [localDuration, setLocalDuration] = useState(0);

  const currentTime = propCurrentTime !== undefined ? propCurrentTime : localCurrentTime;
  const duration = propDuration !== undefined ? propDuration : localDuration;

  useEffect(() => {
    setLocalCurrentTime(0);
    setLocalDuration(0);
  }, [currentItem]);

  useEffect(() => {
    const unsubscribe = audioEngine.subscribeTimeUpdate((curr, dur) => {
      setLocalCurrentTime(curr);
      setLocalDuration(dur);
    });
    return () => unsubscribe();
  }, []);

  const [imgError, setImgError] = useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [playlistNotice, setPlaylistNotice] = useState<string | null>(null);
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [liveIcyTitle, setLiveIcyTitle] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragTime, setDragTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [shareNotice, setShareNotice] = useState(false);
  const playlistRef = useRef<HTMLDivElement>(null);

  const handleShare = () => {
    if (!currentItem) return;
    const title = currentItem.type === 'podcast' ? (currentItem.podcastEpisode?.title || 'Podcast Episode') : (currentItem.radio?.name || 'Radyo');
    const shareUrl = window.location.href;

    if (navigator.share) {
      navigator.share({
        title: `RadioCast - ${title}`,
        text: `${title} dinliyorum! RadioCast ile kesintisiz radyo ve podcast dinle:`,
        url: shareUrl
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setShareNotice(true);
        setTimeout(() => setShareNotice(false), 3000);
      });
    }
  };

  useEffect(() => {
    setImgError(false);
  }, [currentItem]);

  // Close playlist popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (playlistRef.current && !playlistRef.current.contains(e.target as Node)) {
        setShowPlaylistMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch live ICY radio metadata (paused when tab hidden)
  useEffect(() => {
    if (currentItem?.type === 'radio' && currentItem.radio && status === 'playing') {
      const fetchIcy = async () => {
        if (document.visibilityState === 'hidden') return;
        try {
          const rawUrl = currentItem.radio?.url_resolved || currentItem.radio?.url;
          if (!rawUrl) return;
          const res = await fetch(`/api/radio/icy-metadata?url=${encodeURIComponent(rawUrl)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.title) {
              setLiveIcyTitle(data.title);
            }
          }
        } catch {
          // Ignore ICY errors
        }
      };

      fetchIcy();
      const interval = setInterval(fetchIcy, 20000);
      return () => clearInterval(interval);
    } else {
      setLiveIcyTitle(null);
    }
  }, [currentItem, status]);

  const [isExpanded, setIsExpanded] = useState(false);
  const isExpandedRef = React.useRef(isExpanded);
  isExpandedRef.current = isExpanded;

  const handleSetExpanded = React.useCallback((expanded: boolean) => {
    if (expanded === isExpandedRef.current) return;
    setIsExpanded(expanded);
    if (expanded) {
      if (typeof window !== 'undefined' && window.history) {
        window.history.pushState(
          { ...window.history.state, overlay: 'player' },
          '',
          window.location.hash || '#discover'
        );
      }
    } else {
      if (typeof window !== 'undefined' && window.history && window.history.state?.overlay === 'player') {
        window.history.back();
      }
    }
  }, []);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (isExpandedRef.current && e.state?.overlay !== 'player') {
        setIsExpanded(false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!currentItem) {
      setIsExpanded(false);
    }
  }, [currentItem]);

  // Download State Management for Podcast Episodes
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [activeDownload, setActiveDownload] = useState<ActiveDownloadState | null>(null);

  const episodeId = currentItem?.type === 'podcast' ? currentItem.podcastEpisode?.id : null;

  const syncDownloadState = React.useCallback(async () => {
    if (!episodeId) {
      setIsDownloaded(false);
      setActiveDownload(null);
      return;
    }
    try {
      const downloaded = await isEpisodeDownloaded(episodeId);
      setIsDownloaded(downloaded);

      const activeMap = getActiveDownloadsMap();
      setActiveDownload(activeMap.get(episodeId) || null);
    } catch {
      // ignore
    }
  }, [episodeId]);

  useEffect(() => {
    syncDownloadState();

    const handleOfflineChange = () => syncDownloadState();
    const handleProgressChange = () => syncDownloadState();

    window.addEventListener('offlineEpisodesChanged', handleOfflineChange);
    window.addEventListener('downloadProgressChanged', handleProgressChange);

    return () => {
      window.removeEventListener('offlineEpisodesChanged', handleOfflineChange);
      window.removeEventListener('downloadProgressChanged', handleProgressChange);
    };
  }, [syncDownloadState]);

  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isExpanded]);

  if (!currentItem) {
    return (
      <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] md:bottom-3 inset-x-2 sm:inset-x-4 max-w-5xl mx-auto z-40 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl px-4 py-2.5 shadow-2xl shrink-0 select-none flex items-center justify-between gap-3 transition-all duration-300">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-zinc-950 font-black shadow-md shrink-0">
            <Radio className="w-4 h-4 animate-pulse text-zinc-950" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 truncate">
              <span>Canlı Radyo & Podcast Çalar</span>
            </h4>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
              Dinlemek istediğiniz radyo istasyonu veya podcast bölümüne dokunun
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={onOpenSleepTimer}
            className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white text-xs flex items-center space-x-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <Timer className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Uyku Zamanlayıcı</span>
          </button>
        </div>
      </div>
    );
  }

  const handleDownloadToggle = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!currentItem?.podcastEpisode) return;
    const ep = currentItem.podcastEpisode;
    
    if (isDownloaded) {
      if (confirm(`"${ep.title}" bölümünü yerel hafızadan silmek istiyor musunuz?`)) {
        await deleteDownloadedEpisode(ep.id);
        await syncDownloadState();
      }
    } else {
      const ok = await downloadPodcastEpisode(ep);
      await syncDownloadState();
      if (!ok) {
        alert(`"${ep.title}" bölümü indirilemedi. İnternet bağlantınızı kontrol edip tekrar deneyin.`);
      }
    }
  };

  const isPodcast = currentItem.type === 'podcast';
  const radio = currentItem.radio || null;
  const podcastEpisode = currentItem.podcastEpisode || null;

  const title = isPodcast
    ? (podcastEpisode?.title || 'Podcast Bölümü')
    : (radio?.name || 'Radyo İstasyonu');

  const subtitle = liveIcyTitle 
    ? `🎵 ${liveIcyTitle}` 
    : (isPodcast 
        ? (podcastEpisode?.showTitle || podcastEpisode?.category || 'Podcast') 
        : (radio?.tags ? `Canlı • ${radio.tags}` : 'Canlı Akış'));

  const coverUrl = isPodcast 
    ? (podcastEpisode?.coverUrl || '') 
    : (radio?.favicon || '');

  const favoriteStationTarget: RadioStation | null = isPodcast && podcastEpisode ? {
    stationuuid: `podcast-${podcastEpisode.id}`,
    name: podcastEpisode.title,
    playUrl: podcastEpisode.audioUrl,
    url: podcastEpisode.audioUrl,
    url_resolved: podcastEpisode.audioUrl,
    homepage: podcastEpisode.showTitle,
    favicon: podcastEpisode.coverUrl || '',
    tags: `podcast,${podcastEpisode.showTitle}`,
    country: 'Global',
    countrycode: 'GLOBAL',
    language: 'tr',
    votes: 100
  } : radio || null;

  const formatTime = (sec: number) => {
    if (isNaN(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleNextRate = () => {
    const rates = [1, 1.25, 1.5, 2, 0.75];
    const next = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(next);
    audioEngine.setPlaybackRate(next);
  };

  const activeDuration = isPodcast
    ? (duration || localDuration || podcastEpisode?.durationSeconds || 0)
    : 0;

  const currentPos = isDragging ? dragTime : currentTime;
  const progressPercent = activeDuration > 0 ? Math.min(100, Math.max(0, (currentPos / activeDuration) * 100)) : 0;

  const handleSkip = (seconds: number) => {
    const nextTime = Math.max(0, Math.min(activeDuration, currentTime + seconds));
    audioEngine.seek(nextTime);
  };

  const handlePlaylistSelect = (playlistId: string, playlistName: string) => {
    const targetUuid = radio?.stationuuid || radio?.id || (podcastEpisode ? `podcast-${podcastEpisode.id}` : null);
    if (targetUuid && onAddToPlaylist) {
      onAddToPlaylist(playlistId, targetUuid);
      setPlaylistNotice(playlistName);
      setTimeout(() => setPlaylistNotice(null), 3000);
    }
  };

  const handleQuickCreateAndAdd = () => {
    if (!newPlaylistName.trim()) return;
    const targetUuid = radio?.stationuuid || radio?.id || (podcastEpisode ? `podcast-${podcastEpisode.id}` : null);
    const name = newPlaylistName.trim();
    if (onCreatePlaylist && targetUuid) {
      onCreatePlaylist(name, undefined, targetUuid);
      setNewPlaylistName('');
      setShowCreateInput(false);
      setPlaylistNotice(name);
      setTimeout(() => setPlaylistNotice(null), 3000);
    }
  };

  return (
    <>
      {/* Sticky Bottom Mini Player Bar (Hidden when player is expanded fullscreen) */}
      {!isExpanded && (
        <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] md:bottom-3 inset-x-2 sm:inset-x-4 max-w-5xl mx-auto z-40 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl shadow-2xl shrink-0 select-none transition-all duration-300 overflow-hidden">
          {/* Top 2px Progress Indicator Bar for Podcasts */}
          {isPodcast && (
            <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 relative">
              <div
                className="h-full bg-amber-500 transition-all duration-150"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}

          <div className="px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2">
            {/* Left: Artwork & Info (Tap anywhere on left side to Expand Fullscreen Player) */}
            <div 
              onClick={() => handleSetExpanded(true)}
              className="flex items-center space-x-2.5 min-w-0 flex-1 cursor-pointer group py-0.5"
              title="Tam Ekran Çalara Geç"
            >
              <div className="relative shrink-0">
                {coverUrl && !imgError ? (
                  <img
                    src={coverUrl}
                    alt={title || ''}
                    onError={() => setImgError(true)}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-500 flex items-center justify-center text-zinc-950 shadow-md">
                    {isPodcast ? <Mic className="w-5 h-5 text-zinc-950" /> : <Radio className="w-5 h-5 text-zinc-950" />}
                  </div>
                )}
                {status === 'playing' && (
                  <div className="absolute -bottom-1 -right-1 bg-amber-500 text-zinc-950 p-0.5 rounded-full border border-zinc-950 shadow flex items-center justify-center">
                    <div className="flex items-end gap-[1px] h-2.5 w-2.5">
                      <span className="w-0.5 bg-zinc-950 animate-[bounce_0.6s_infinite_0.1s] h-full" />
                      <span className="w-0.5 bg-zinc-950 animate-[bounce_0.6s_infinite_0.3s] h-2/3" />
                      <span className="w-0.5 bg-zinc-950 animate-[bounce_0.6s_infinite_0.2s] h-5/6" />
                    </div>
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate group-hover:text-amber-500 transition-colors">
                  {title}
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5 flex items-center gap-1">
                  <span>{subtitle}</span>
                  {isPodcast && activeDuration > 0 && (
                    <span className="text-[10px] font-mono text-amber-500 shrink-0">
                      • {formatTime(currentPos)} / {formatTime(activeDuration)}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Right: Clean Controls: [Heart/Download] -> [Geri] -> [Duraklat/Oynat] -> [İleri] -> [Tam Ekran] */}
            <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
              {/* Download Button on Mini Player for Podcasts */}
              {isPodcast && (
                <button
                  onClick={handleDownloadToggle}
                  className="p-1.5 sm:p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-all active:scale-95 cursor-pointer hidden xs:flex"
                  title={
                    activeDownload
                      ? `İndiriliyor: %${activeDownload.progressPct.toFixed(0)}`
                      : isDownloaded
                      ? 'İndirilmiş (Sil)'
                      : 'İndir'
                  }
                >
                  {activeDownload ? (
                    <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                  ) : isDownloaded ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
                  ) : (
                    <DownloadCloud className="w-4 h-4 hover:text-amber-500" />
                  )}
                </button>
              )}

              {/* Heart Favorite Toggle Button */}
              {favoriteStationTarget && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(favoriteStationTarget);
                  }}
                  className="text-zinc-400 hover:text-rose-500 transition-colors p-1.5 shrink-0 active:scale-90 cursor-pointer hidden xs:flex"
                  title={isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                >
                  <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
              )}

              {/* Geri (-10s) Button for Podcast */}
              {isPodcast && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSkip(-10);
                  }}
                  className="p-1.5 sm:p-2 rounded-xl text-zinc-700 dark:text-zinc-200 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all active:scale-90 cursor-pointer hidden xs:flex"
                  title="10 saniye geri sar"
                >
                  <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}

              {/* Geri (Önceki) Button */}
              {onPrevious && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPrevious();
                  }}
                  className="p-1.5 sm:p-2 rounded-xl text-zinc-700 dark:text-zinc-200 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all active:scale-90 cursor-pointer"
                  title={isPodcast ? 'Önceki Bölüm' : 'Önceki Radyo'}
                >
                  <SkipBack className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                </button>
              )}

              {/* Play / Pause Main Button (Duraklat / Oynat) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayPause();
                }}
                className={`p-2 sm:p-2.5 rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer ${
                  status === 'playing'
                    ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold shadow-amber-500/20'
                    : 'bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-950 font-bold'
                }`}
                title={status === 'playing' ? 'Duraklat' : 'Oynat'}
              >
                {status === 'connecting' || status === 'buffering' ? (
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : status === 'playing' ? (
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                ) : (
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
                )}
              </button>

              {/* İleri (Sonraki) Button */}
              {onNext && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNext();
                  }}
                  className="p-1.5 sm:p-2 rounded-xl text-zinc-700 dark:text-zinc-200 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all active:scale-90 cursor-pointer"
                  title={isPodcast ? 'Sonraki Bölüm' : 'Sonraki Radyo'}
                >
                  <SkipForward className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                </button>
              )}

              {/* İleri (+30s) Button for Podcast */}
              {isPodcast && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSkip(30);
                  }}
                  className="p-1.5 sm:p-2 rounded-xl text-zinc-700 dark:text-zinc-200 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all active:scale-90 cursor-pointer hidden xs:flex"
                  title="30 saniye ileri sar"
                >
                  <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}

              {/* Expand Fullscreen Button */}
              <button
                onClick={() => handleSetExpanded(true)}
                className="p-1.5 sm:p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 font-bold transition-all active:scale-95 cursor-pointer ml-0.5"
                title="Tam Ekran Çalar"
              >
                <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL-SCREEN OVERLAY PLAYER (RESPONSIVE, FULL VIEWPORT, PERFECTLY ISOLATED) */}
      {isExpanded &&
        createPortal(
          <div className="fixed inset-0 z-[9000] bg-slate-950 text-white flex flex-col justify-between px-4 sm:px-6 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] overflow-y-auto no-scrollbar w-screen h-screen min-h-[100dvh] max-h-[100dvh] select-none touch-none overscroll-none animate-in fade-in duration-200">
            {/* Ambient Artwork Glow */}
            {coverUrl && !imgError && (
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-20 blur-3xl scale-110 pointer-events-none -z-10 overflow-hidden"
                style={{ backgroundImage: `url(${coverUrl})` }}
              />
            )}

            {/* Top Bar Navigation */}
            <div className="flex items-center justify-between w-full max-w-lg mx-auto pt-1 shrink-0 gap-2">
              <button
                onClick={() => handleSetExpanded(false)}
                className="p-2 sm:p-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all cursor-pointer active:scale-95 shadow-md flex items-center gap-1 shrink-0"
                title="Çaları Daralt"
              >
                <ChevronDown className="w-5 h-5 text-amber-400" />
              </button>

              <div className="text-center truncate min-w-0">
                <span className="text-[10px] sm:text-xs uppercase font-extrabold tracking-widest text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 truncate inline-block">
                  {isPodcast ? 'Podcast Çalar' : 'Canlı Radyo'}
                </span>
              </div>

              <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
                <button
                  onClick={handleShare}
                  className="p-2 sm:p-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800 transition-all cursor-pointer relative"
                  title="Paylaş"
                >
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  {shareNotice && (
                    <span className="absolute -bottom-8 right-0 bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap z-50">
                      Kopyalandı!
                    </span>
                  )}
                </button>
                <button
                  onClick={onOpenSleepTimer}
                  className={`p-2 sm:p-2.5 rounded-2xl border transition-all cursor-pointer ${
                    sleepTimerSeconds !== null
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 font-mono'
                      : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white'
                  }`}
                  title="Uyku Zamanlayıcı"
                >
                  <Timer className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => handleSetExpanded(false)}
                  className="p-2 sm:p-2.5 rounded-2xl bg-slate-900/90 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-800 transition-all cursor-pointer active:scale-95 shadow-md"
                  title="Kapat"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* Center Content Section: Artwork + Title + Visualizer */}
            <div className="w-full max-w-md mx-auto my-auto py-1 sm:py-2 flex flex-col items-center text-center space-y-2 sm:space-y-3 flex-1 justify-center min-h-0 overflow-hidden">
              {/* Album Artwork Cover */}
              <div 
                onClick={() => {
                  if (isPodcast && currentItem && onNavigateToPodcastShow) {
                    handleSetExpanded(false);
                    onNavigateToPodcastShow(currentItem as PodcastEpisode);
                  }
                }}
                className={`relative w-28 h-28 xs:w-36 xs:h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 max-h-[22vh] sm:max-h-[28vh] aspect-square rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-800/80 bg-slate-900 shrink-0 group ${
                  isPodcast ? 'cursor-pointer' : ''
                }`}
                title={isPodcast ? 'Podcast Kanalına Git' : undefined}
              >
                {coverUrl && !imgError ? (
                  <img
                    src={coverUrl}
                    alt={title || ''}
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-slate-950">
                    {isPodcast ? <Mic className="w-10 h-10 sm:w-12 sm:h-12" /> : <Radio className="w-10 h-10 sm:w-12 sm:h-12" />}
                  </div>
                )}

                {/* Glowing Aura Background */}
                <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 to-purple-500/20 rounded-full blur-2xl -z-10 opacity-70" />
              </div>

              {/* Title & Subtitle (Line clamped & nicely padded) */}
              <div className="space-y-0.5 sm:space-y-1 w-full px-2 max-w-full flex flex-col items-center">
                <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                  <h2 className="text-xs xs:text-sm sm:text-base md:text-lg font-black text-white text-center leading-tight sm:leading-snug line-clamp-2">
                    {title}
                  </h2>
                  {favoriteStationTarget && (
                    <button
                      onClick={() => onToggleFavorite(favoriteStationTarget)}
                      className="text-slate-400 hover:text-rose-500 transition-colors p-1 shrink-0 active:scale-90 cursor-pointer"
                      title={isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                    >
                      <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                  )}
                </div>

                {isPodcast && currentItem && (currentItem as PodcastEpisode) ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetExpanded(false);
                      if (onNavigateToPodcastShow) {
                        onNavigateToPodcastShow(currentItem as PodcastEpisode);
                      }
                    }}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1 mt-1 rounded-full bg-amber-500/15 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 hover:text-white text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95 shadow-md group/chan max-w-full"
                    title="Podcast Kanalına / Sayfasına Git"
                  >
                    <Mic className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate max-w-[240px] sm:max-w-[320px]">{subtitle}</span>
                    <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover/chan:translate-x-0.5 transition-transform" />
                  </button>
                ) : (
                  <p className="text-[11px] sm:text-xs md:text-sm font-semibold text-amber-400/90 text-center truncate px-2">
                    {subtitle}
                  </p>
                )}
              </div>

              {/* Visualizer Wave */}
              <div className="w-full max-w-xs shrink-0 pt-0.5">
                <AudioVisualizer
                  status={status}
                  barCount={20}
                  colorTheme={themePalette}
                  className="w-full h-5 sm:h-6"
                />
              </div>
            </div>

            {/* Bottom Interactive Controls (Scrubber + 5-Slot Centered Control Bar + Volume) */}
            <div className="w-full max-w-lg mx-auto space-y-2 sm:space-y-3 pb-1 shrink-0">
              {/* Scrubber Range Bar for Podcasts */}
              {isPodcast && (
                <div className="space-y-0.5 px-1">
                  <div className="relative w-full group cursor-pointer py-1 flex items-center">
                    <div className="w-full h-2 sm:h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700 relative">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div
                      className="absolute w-3.5 h-3.5 sm:w-4 sm:h-4 bg-amber-400 border-2 border-slate-950 rounded-full shadow-lg pointer-events-none transform -translate-x-1/2 top-1/2 -translate-y-1/2 z-20"
                      style={{ left: `${progressPercent}%` }}
                    />
                    <input
                      type="range"
                      min="0"
                      max={activeDuration || 100}
                      step="0.5"
                      value={currentPos}
                      onMouseDown={() => setIsDragging(true)}
                      onTouchStart={() => setIsDragging(true)}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setDragTime(val);
                        audioEngine.seek(val);
                      }}
                      onMouseUp={(e) => {
                        const val = parseFloat((e.target as HTMLInputElement).value);
                        audioEngine.seek(val);
                        setTimeout(() => {
                          setIsDragging(false);
                          setDragTime(0);
                        }, 150);
                      }}
                      onTouchEnd={(e) => {
                        const val = parseFloat((e.target as HTMLInputElement).value);
                        audioEngine.seek(val);
                        setTimeout(() => {
                          setIsDragging(false);
                          setDragTime(0);
                        }, 150);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 z-30 cursor-pointer"
                    />
                  </div>

                  {/* Timestamps */}
                  <div className="flex justify-between items-center text-[10px] sm:text-xs font-mono text-slate-400 font-bold px-0.5">
                    <span>{formatTime(currentPos)}</span>
                    <span>{formatTime(activeDuration)}</span>
                  </div>
                </div>
              )}

              {/* Secondary Quick Action Bar for Podcast (Speed, Download, Timer) */}
              {isPodcast && (
                <div className="flex items-center justify-center gap-3 py-1">
                  <button
                    onClick={handleNextRate}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 text-xs font-black font-mono transition-all active:scale-95 cursor-pointer flex items-center gap-1 shadow"
                    title="Oynatma Hızı"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>{playbackRate}x Hız</span>
                  </button>

                  <button
                    onClick={handleDownloadToggle}
                    className={`px-3 py-1.5 rounded-xl border transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 text-xs font-semibold shadow ${
                      isDownloaded
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                        : activeDownload
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                        : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                    title={
                      activeDownload
                        ? `İndiriliyor: %${activeDownload.progressPct.toFixed(0)}`
                        : isDownloaded
                        ? 'Cihazda İndirilmiş (Silmek İçin Tıkla)'
                        : 'Çevrimdışı Dinlemek İçin İndir'
                    }
                  >
                    {activeDownload ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                        <span>%{activeDownload.progressPct.toFixed(0)}</span>
                      </>
                    ) : isDownloaded ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 fill-emerald-500/20" />
                        <span>İndirildi</span>
                      </>
                    ) : (
                      <>
                        <DownloadCloud className="w-3.5 h-3.5" />
                        <span>İndir</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* PERFECT 5-SLOT SYMMETRICAL CONTROL ROW - Play/Pause is ALWAYS strictly in Slot 3 (DEAD CENTER) */}
              <div className="grid grid-cols-5 items-center justify-items-center w-full gap-1 sm:gap-2 px-1">
                
                {/* SLOT 1 (FAR LEFT): Önceki Bölüm (Podcast) OR Stop Button (Radio) */}
                <div className="flex items-center justify-center">
                  {isPodcast ? (
                    onPrevious ? (
                      <button
                        onClick={onPrevious}
                        className="w-9 h-9 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-amber-400 transition-all active:scale-90 cursor-pointer flex items-center justify-center shadow-md"
                        title="Önceki Bölüm"
                      >
                        <SkipBack className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                      </button>
                    ) : (
                      <div className="w-9 h-9 xs:w-10 xs:h-10 sm:w-12 sm:h-12" />
                    )
                  ) : (
                    <button
                      onClick={onStop}
                      className="w-9 h-9 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-all active:scale-95 cursor-pointer flex items-center justify-center shadow-md"
                      title="Durdur"
                    >
                      <Square className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                    </button>
                  )}
                </div>

                {/* SLOT 2 (INNER LEFT): Skip -10s for Podcast OR Previous for Radio */}
                <div className="flex items-center justify-center">
                  {isPodcast ? (
                    <button
                      onClick={() => handleSkip(-10)}
                      className="w-9 h-9 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-amber-400 transition-all active:scale-90 cursor-pointer flex items-center justify-center shadow-md"
                      title="10 saniye geri sar"
                    >
                      <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  ) : onPrevious ? (
                    <button
                      onClick={onPrevious}
                      className="w-9 h-9 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-amber-400 transition-all active:scale-90 cursor-pointer flex items-center justify-center shadow-md"
                      title="Önceki Radyo"
                    >
                      <SkipBack className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                    </button>
                  ) : (
                    <div className="w-9 h-9 xs:w-10 xs:h-10 sm:w-12 sm:h-12" />
                  )}
                </div>

                {/* SLOT 3 (DEAD CENTER): HUGE HIGHLIGHT PLAY / PAUSE BUTTON */}
                <div className="flex items-center justify-center">
                  <button
                    onClick={onPlayPause}
                    className={`w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all shadow-2xl active:scale-90 cursor-pointer ${
                      status === 'playing'
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/40 scale-105'
                        : 'bg-white hover:bg-slate-200 text-slate-950'
                    }`}
                    title={status === 'playing' ? 'Duraklat' : 'Oynat'}
                  >
                    {status === 'connecting' || status === 'buffering' ? (
                      <RefreshCw className="w-6 h-6 sm:w-7 sm:h-7 animate-spin" />
                    ) : status === 'playing' ? (
                      <Pause className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
                    ) : (
                      <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-current ml-0.5" />
                    )}
                  </button>
                </div>

                {/* SLOT 4 (INNER RIGHT): Skip +30s for Podcast OR Next for Radio */}
                <div className="flex items-center justify-center">
                  {isPodcast ? (
                    <button
                      onClick={() => handleSkip(30)}
                      className="w-9 h-9 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-amber-400 transition-all active:scale-90 cursor-pointer flex items-center justify-center shadow-md"
                      title="30 saniye ileri sar"
                    >
                      <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  ) : onNext ? (
                    <button
                      onClick={onNext}
                      className="w-9 h-9 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-amber-400 transition-all active:scale-90 cursor-pointer flex items-center justify-center shadow-md"
                      title="Sonraki Radyo"
                    >
                      <SkipForward className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                    </button>
                  ) : (
                    <div className="w-9 h-9 xs:w-10 xs:h-10 sm:w-12 sm:h-12" />
                  )}
                </div>

                {/* SLOT 5 (FAR RIGHT): Sonraki Bölüm (Podcast) OR Favorite (Radio) */}
                <div className="flex items-center justify-center">
                  {isPodcast ? (
                    onNext ? (
                      <button
                        onClick={onNext}
                        className="w-9 h-9 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-amber-400 transition-all active:scale-90 cursor-pointer flex items-center justify-center shadow-md"
                        title="Sonraki Bölüm"
                      >
                        <SkipForward className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                      </button>
                    ) : (
                      <div className="w-9 h-9 xs:w-10 xs:h-10 sm:w-12 sm:h-12" />
                    )
                  ) : favoriteStationTarget ? (
                    <button
                      onClick={() => onToggleFavorite(favoriteStationTarget)}
                      className="w-9 h-9 xs:w-10 xs:h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-rose-500 transition-all active:scale-95 cursor-pointer flex items-center justify-center shadow-md"
                      title={isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                    >
                      <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                    </button>
                  ) : (
                    <div className="w-9 h-9 xs:w-10 xs:h-10 sm:w-12 sm:h-12" />
                  )}
                </div>

              </div>

              {/* Volume Control Bar */}
              <div className="flex items-center justify-center space-x-2.5 sm:space-x-3 pt-0.5">
                <button
                  onClick={onToggleMute}
                  className="text-slate-400 hover:text-white transition-colors p-1.5 cursor-pointer"
                  title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />
                  ) : (
                    <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                  className="w-28 xs:w-36 sm:w-48 accent-amber-500 cursor-pointer h-1.5 sm:h-2 rounded-lg bg-slate-800"
                />
              </div>
            </div>
          </div>,
        document.body
      )}
    </>
  );
});

