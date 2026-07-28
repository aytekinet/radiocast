import React, { useState, useEffect, useRef } from 'react';
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
  SkipForward
} from 'lucide-react';
import { RadioStation, PlayableItem, ThemePalette, Playlist } from '../types';
import { PlaybackStatus, audioEngine } from '../services/audioEngine';
import { AudioVisualizer } from './AudioVisualizer';

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
  onNavigateToDiscover
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
  const playlistRef = useRef<HTMLDivElement>(null);

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

  if (!currentItem) {
    return (
      <div className="fixed bottom-14 md:bottom-4 left-1/2 -translate-x-1/2 w-[96%] sm:w-[92%] max-w-5xl z-30 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl px-4 py-2.5 shadow-xl dark:shadow-2xl shrink-0 select-none flex items-center justify-between gap-3 transition-all duration-300">
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
            className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white text-xs flex items-center space-x-1.5 active:scale-95 transition-all"
          >
            <Timer className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Uyku Zamanlayıcı</span>
          </button>
        </div>
      </div>
    );
  }

  const isPodcast = currentItem.type === 'podcast';
  const radio = currentItem.radio;
  const podcast = currentItem.podcastEpisode;

  const title = isPodcast ? podcast?.title : radio?.name;
  const subtitle = liveIcyTitle 
    ? `🎵 ${liveIcyTitle}` 
    : (isPodcast ? podcast?.showTitle : (radio?.tags ? `Canlı • ${radio.tags}` : 'Canlı Akış'));
  const coverUrl = isPodcast ? (podcast?.coverUrl || '') : (radio?.favicon || '');

  // Target object for favoriting (RadioStation structure)
  const favoriteStationTarget: RadioStation | null = isPodcast && podcast ? {
    stationuuid: `podcast-${podcast.id}`,
    name: podcast.title,
    playUrl: podcast.audioUrl,
    url: podcast.audioUrl,
    url_resolved: podcast.audioUrl,
    homepage: podcast.showTitle,
    favicon: podcast.coverUrl || '',
    tags: `podcast,${podcast.showTitle}`,
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

  const activeDuration = duration || podcast?.durationSeconds || 1;
  const currentPos = isDragging ? dragTime : currentTime;
  const progressPercent = Math.min(100, Math.max(0, (currentPos / activeDuration) * 100));

  const handleSkip = (seconds: number) => {
    const nextTime = Math.max(0, Math.min(activeDuration, currentTime + seconds));
    audioEngine.seek(nextTime);
  };

  const handlePlaylistSelect = (playlistId: string, playlistName: string) => {
    const targetUuid = radio?.stationuuid || radio?.id || (podcast ? `podcast-${podcast.id}` : null);
    if (targetUuid && onAddToPlaylist) {
      onAddToPlaylist(playlistId, targetUuid);
      setPlaylistNotice(playlistName);
      setTimeout(() => setPlaylistNotice(null), 3000);
    }
  };

  const handleQuickCreateAndAdd = () => {
    if (!newPlaylistName.trim()) return;
    const targetUuid = radio?.stationuuid || radio?.id || (podcast ? `podcast-${podcast.id}` : null);
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
    <div className="fixed bottom-14 md:bottom-3 left-1/2 -translate-x-1/2 w-[98%] sm:w-[95%] max-w-5xl z-30 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl shadow-xl dark:shadow-2xl shrink-0 select-none transition-all duration-300 overflow-hidden">
      {/* Prominent Interactive Podcast Scrubber Bar */}
      {isPodcast && (
        <div className="bg-amber-500/10 dark:bg-amber-500/5 border-b border-zinc-200 dark:border-zinc-800/80 px-3 sm:px-5 py-2 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-xs sm:text-sm text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/30">
                {formatTime(currentPos)}
              </span>
              <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 font-medium">
                / {formatTime(activeDuration)}
              </span>
            </div>
          </div>

          {/* Interactive Range Track & Visible Floating Thumb */}
          <div className="relative w-full group cursor-pointer py-1.5 flex items-center">
            {/* Background Track */}
            <div className="w-full h-2.5 sm:h-3 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden border border-zinc-300/80 dark:border-zinc-700/60 relative">
              {/* Progress Fill */}
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Glowing Drag Handle Thumb */}
            <div
              className="absolute w-4 h-4 sm:w-5 sm:h-5 bg-amber-400 border-2 border-zinc-950 rounded-full shadow-lg pointer-events-none transform -translate-x-1/2 group-hover:scale-125 transition-transform z-20"
              style={{ left: `${progressPercent}%` }}
            />

            {/* Actual Range Input for high precision dragging & clicking */}
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
                  setDragTime(null);
                }, 150);
              }}
              onTouchEnd={(e) => {
                const val = parseFloat((e.target as HTMLInputElement).value);
                audioEngine.seek(val);
                setTimeout(() => {
                  setIsDragging(false);
                  setDragTime(null);
                }, 150);
              }}
              className="absolute inset-0 w-full h-full opacity-0 z-30 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Main Persistent Sticky Player Bar */}
      <div className="px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Artwork, Title, Favorite & Playlist Add */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 flex-1 sm:flex-initial sm:max-w-[320px]">
          <div 
            className="relative shrink-0 cursor-pointer group" 
            onClick={() => {
              onNavigateToDiscover?.();
            }}
          >
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
            <div className="flex items-center space-x-1.5">
              <h4 
                onClick={() => {
                  onNavigateToDiscover?.();
                }}
                className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate hover:text-amber-500 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span className="truncate">{title}</span>
                {status === 'playing' && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/20 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    <span>CANLI</span>
                  </span>
                )}
              </h4>

              {/* Heart Favorite Toggle Button */}
              {favoriteStationTarget && (
                <button
                  onClick={() => onToggleFavorite(favoriteStationTarget)}
                  className="text-zinc-400 hover:text-rose-500 transition-colors p-1 shrink-0 active:scale-90"
                  title={isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                >
                  <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
              )}
            </div>

            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Center Controls: Skip 10s, Stop, Play/Pause, Skip 30s, Equalizer (Centered) */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0 justify-center">
            {/* Podcast Backward -10s Button */}
            {isPodcast && (
              <button
                onClick={() => handleSkip(-10)}
                className="p-1.5 sm:p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-amber-500 transition-all active:scale-90 flex items-center gap-0.5"
                title="10 saniye geri sar"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold font-mono hidden sm:inline">10s</span>
              </button>
            )}

            {/* Stop Button */}
            <button
              onClick={onStop}
              className="p-1.5 sm:p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors active:scale-95"
              title="Durdur"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>

            {/* Main Play/Pause Big Button */}
            <button
              onClick={onPlayPause}
              className={`p-2.5 sm:p-3 rounded-2xl transition-all shadow-lg active:scale-95 ${
                status === 'playing'
                  ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold shadow-amber-500/20 scale-105'
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

            {/* Previous (Geri) Button */}
            {onPrevious && (
              <button
                onClick={onPrevious}
                className="p-1.5 sm:p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-amber-500 transition-all active:scale-90 flex items-center justify-center"
                title={isPodcast ? 'Önceki Bölüm' : 'Önceki Radyo'}
              >
                <SkipBack className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
              </button>
            )}

            {/* Next (İleri) Button */}
            {onNext && (
              <button
                onClick={onNext}
                className="p-1.5 sm:p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-amber-500 transition-all active:scale-90 flex items-center justify-center"
                title={isPodcast ? 'Sonraki Bölüm' : 'Sonraki Radyo'}
              >
                <SkipForward className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
              </button>
            )}

            {/* Podcast Forward +30s Button */}
            {isPodcast && (
              <button
                onClick={() => handleSkip(30)}
                className="p-1.5 sm:p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-amber-500 transition-all active:scale-90 flex items-center gap-0.5"
                title="30 saniye ileri sar"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold font-mono hidden sm:inline">30s</span>
              </button>
            )}

            {/* Speed Rate Switcher for Podcast */}
            {isPodcast && (
              <button
                onClick={handleNextRate}
                className="px-2 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-amber-500 hover:text-zinc-950 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 text-[11px] font-bold font-mono transition-all active:scale-95"
                title="Oynatma Hızı"
              >
                {playbackRate}x
              </button>
            )}

            {/* Mini Visualizer Canvas */}
            <div className="hidden lg:block">
              <AudioVisualizer
                status={status}
                barCount={16}
                colorTheme={themePalette}
                className="w-20 h-6"
              />
            </div>
          </div>

          {/* Time indicator for podcast */}
          {isPodcast && (
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-500 font-medium mt-0.5">
              <span>{formatTime(currentTime)}</span>
              <span>/</span>
              <span>{formatTime(duration || podcast?.durationSeconds || 0)}</span>
            </div>
          )}
        </div>

        {/* Right: Volume & Sleep Timer */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          {playlistNotice && (
            <span className="hidden xl:inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40 px-2 py-1 rounded-lg">
              <Check className="w-3 h-3" />
              <span>{playlistNotice}'e eklendi</span>
            </span>
          )}

          {/* Volume Slider Control */}
          <div className="hidden md:flex items-center space-x-2">
            <button
              onClick={onToggleMute}
              className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors p-1"
              title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-20 accent-amber-500 cursor-pointer h-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800"
            />
          </div>

          {/* Sleep Timer Button */}
          <button
            onClick={onOpenSleepTimer}
            className={`px-2.5 py-1.5 rounded-xl border flex items-center space-x-1 text-xs transition-all active:scale-95 ${
              sleepTimerSeconds !== null
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-600 dark:text-amber-300 font-mono font-medium'
                : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
            title="Uyku Zamanlayıcısı"
          >
            <Timer className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[11px] hidden lg:inline">
              {sleepTimerSeconds !== null ? formatTime(sleepTimerSeconds) : 'Uyku Modu'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
});

