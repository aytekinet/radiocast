import React, { useState, useEffect } from 'react';
import { PlayableItem } from '../types';
import { audioEngine, PlaybackStatus } from '../services/audioEngine';
import { AppLocale, getTranslation } from '../services/localization';
import { Play, Pause, Volume2, VolumeX, X, Radio, Disc3, Maximize, Minimize } from 'lucide-react';

interface BigScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentItem: PlayableItem | null;
  status: PlaybackStatus;
  locale: AppLocale;
  clock24h?: boolean;
}

export function BigScreenModal({
  isOpen,
  onClose,
  currentItem,
  status,
  locale,
  clock24h = true
}: BigScreenModalProps) {
  const [timeStr, setTimeStr] = useState<string>('');
  const [secondsStr, setSecondsStr] = useState<string>('');
  const [volume, setVolume] = useState<number>(() => audioEngine.getVolume());
  const [isMuted, setIsMuted] = useState<boolean>(() => audioEngine.isMuted());
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Digital clock updates every second
  useEffect(() => {
    if (!isOpen) return;

    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');

      if (!clock24h) {
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        setTimeStr(`${hours}:${minutes} ${ampm}`);
      } else {
        setTimeStr(`${hours.toString().padStart(2, '0')}:${minutes}`);
      }
      setSecondsStr(seconds);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [isOpen, clock24h]);

  // Handle Escape key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        audioEngine.togglePlayPause();
      } else if (e.key.toLowerCase() === 'm' && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        const muted = audioEngine.toggleMute();
        setIsMuted(muted);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Fullscreen not permitted in iframe sandbox, graceful fallback
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    audioEngine.setVolume(val);
    if (isMuted && val > 0) {
      audioEngine.toggleMute();
      setIsMuted(false);
    }
  };

  const handleMuteToggle = () => {
    const muted = audioEngine.toggleMute();
    setIsMuted(muted);
  };

  if (!isOpen) return null;

  let title = 'RadioCast';
  let subtitle = getTranslation('appName', locale);
  let coverUrl = 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&q=80';
  const isRadio = currentItem?.type === 'radio';

  if (currentItem?.type === 'radio' && currentItem.radio) {
    title = currentItem.radio.name;
    subtitle = [currentItem.radio.country, currentItem.radio.tags].filter(Boolean).join(' · ');
    coverUrl = currentItem.radio.favicon || coverUrl;
  } else if (currentItem?.type === 'podcast' && currentItem.podcastEpisode) {
    title = currentItem.podcastEpisode.title;
    subtitle = currentItem.podcastEpisode.showTitle;
    coverUrl = currentItem.podcastEpisode.coverUrl || coverUrl;
  }

  const isPlaying = status === 'playing';
  const isConnecting = status === 'connecting';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={getTranslation('bigScreen', locale)}
      className="fixed inset-0 z-50 bg-slate-50 dark:bg-[#0A0F17] text-slate-900 dark:text-white flex flex-col justify-between p-6 md:p-12 select-none overflow-hidden"
    >
      {/* Top Bar: Brand, Live indicator, Fullscreen & Close button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">RadioCast</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 block">{getTranslation('bigScreen', locale)}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isRadio && isPlaying && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold tracking-wider">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              {getTranslation('live', locale)}
            </div>
          )}

          <button
            onClick={toggleFullscreen}
            title="Tam Ekran"
            className="p-2.5 rounded-xl bg-slate-200/80 dark:bg-slate-800/60 hover:bg-slate-300 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer shadow-sm"
            aria-label="Tam Ekran"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>

          <button
            onClick={onClose}
            title={getTranslation('escapeToExit', locale)}
            className="p-2.5 rounded-xl bg-slate-200/80 dark:bg-slate-800/60 hover:bg-rose-500/20 hover:text-rose-600 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shadow-sm"
            aria-label="Kapat"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Center Display: Giant Digital Clock + Artwork & Title */}
      <div className="flex flex-col items-center justify-center my-auto text-center max-w-4xl mx-auto w-full">
        {/* Big Digital Clock */}
        <div className="mb-8 select-none">
          <div className="font-mono text-6xl sm:text-8xl md:text-9xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-baseline justify-center gap-2">
            <span>{timeStr}</span>
            <span className="text-2xl sm:text-4xl text-teal-600 dark:text-teal-400/80 font-normal">{secondsStr}</span>
          </div>
        </div>

        {/* Media Artwork with Subtle Glow */}
        <div className="relative mb-6 group">
          <div className="absolute -inset-4 bg-teal-500/10 rounded-3xl blur-xl group-hover:bg-teal-500/20 transition-all pointer-events-none" />
          <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl relative bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <Disc3 className="w-20 h-20 text-slate-400 dark:text-slate-700 animate-spin-slow" />
            )}
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-2 max-w-2xl px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight line-clamp-2">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium line-clamp-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Bottom Controls Bar: Play/Pause, Volume, Shortcuts notice */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-800/80">
        <span className="text-xs text-slate-500 hidden sm:block">
          {getTranslation('escapeToExit', locale)} · Space: {isPlaying ? getTranslation('pause', locale) : getTranslation('play', locale)} · M: Mute
        </span>

        {/* Center Main Play/Pause Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => audioEngine.togglePlayPause()}
            disabled={isConnecting}
            className="w-16 h-16 rounded-full bg-teal-500 hover:bg-teal-400 active:scale-95 text-black flex items-center justify-center shadow-lg shadow-teal-500/30 transition-all focus:outline-none focus:ring-4 focus:ring-teal-500/40 cursor-pointer"
            aria-label={isPlaying ? getTranslation('pause', locale) : getTranslation('play', locale)}
          >
            {isConnecting ? (
              <div className="w-6 h-6 border-3 border-black border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current translate-x-0.5" />
            )}
          </button>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleMuteToggle}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            aria-label={isMuted ? 'Sesi Aç' : 'Sessiz'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-5 h-5 text-rose-500" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-24 sm:w-32 accent-teal-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg"
            aria-label={getTranslation('volume', locale)}
          />
        </div>
      </div>
    </div>
  );
}
