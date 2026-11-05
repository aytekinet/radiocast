import { RadioStation, PodcastEpisode, PlayableItem, Audiobook, AudiobookTrack, ReconnectState, SleepTimerState } from '../types';
import { registerStationClick } from './radioApi';
import { getPodcastProgress, savePodcastProgress, getPodcastProgressEntry, addRecentlyPlayed } from './storage';
import { getOfflineAudioUrl } from './offlineStorage';
import { getCandidateUrlsForStation } from '../data/fallbackStations';
import Hls from 'hls.js';

export type PlaybackStatus = 'idle' | 'connecting' | 'playing' | 'paused' | 'buffering' | 'error';

export interface AudioEngineCallbacks {
  onStatusChange?: (status: PlaybackStatus) => void;
  onError?: (errorMsg: string) => void;
  onItemChange?: (item: PlayableItem | null) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onPlaybackRateChange?: (rate: number) => void;
  onEnded?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onReconnectChange?: (state: ReconnectState) => void;
  onSleepTimerTick?: (state: SleepTimerState) => void;
}

export interface AudioEngineDebugInfo {
  status: PlaybackStatus;
  mode: string | null;
  currentTitle: string;
  currentUrl: string;
  candidateIndex: number;
  totalCandidates: number;
  candidates: string[];
  watchdogRemainingSec: number;
  volume: number;
  muted: boolean;
  readyState: number;
  networkState: number;
  hlsActive: boolean;
  errorCode: number | null;
  errorMessage: string | null;
  startupDurationMs: number | null;
  sessionId: number;
  reconnectAttempt: number;
  isReconnecting: boolean;
  sleepTimerRemainingSec: number;
}

class AudioEngine {
  private audio: HTMLAudioElement;
  private currentItem: PlayableItem | null = null;
  private status: PlaybackStatus = 'idle';
  private callbacks: AudioEngineCallbacks = {};
  
  private watchdogTimer: ReturnType<typeof setTimeout> | null = null;
  private watchdogStartTime: number = 0;
  private watchdogDurationMs: number = 5500;
  private progressSaveTimer: ReturnType<typeof setInterval> | null = null;
  
  private candidates: string[] = [];
  private candidateIndex: number = 0;
  private playbackRate = 1.0;
  private hlsInstance: any = null;
  private clickTimestamp: number = 0;
  private startupDurationMs: number | null = null;

  private currentSessionId: number = 0;
  private timeUpdateListeners = new Set<(curr: number, dur: number) => void>();

  // 3-stage fast exponential reconnect for live radio
  private reconnectAttempt: number = 0;
  private readonly maxReconnectAttempts: number = 3;
  private readonly reconnectDelaysSec: number[] = [1, 2, 4];
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectCountdownTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectNextInSec: number = 0;
  private isReconnecting: boolean = false;

  // Sleep timer with 30s gradual fade-out
  private sleepTimerInterval: ReturnType<typeof setInterval> | null = null;
  private sleepTimerEndAt: number = 0;
  private sleepTimerTotalDurationMinutes: number = 0;
  private originalVolumeBeforeFade: number = 0.8;
  private isFadingOut: boolean = false;

  public subscribeTimeUpdate(listener: (curr: number, dur: number) => void): () => void {
    this.timeUpdateListeners.add(listener);
    return () => {
      this.timeUpdateListeners.delete(listener);
    };
  }

  public getTimeUpdateListenerCount(): number {
    return this.timeUpdateListeners.size;
  }

  constructor() {
    if (typeof Audio !== 'undefined') {
      this.audio = new Audio();
      this.audio.preload = 'none';

      let savedVol = 0.8;
      try {
        const raw = localStorage.getItem('player-volume');
        if (raw) {
          const parsed = parseFloat(raw);
          if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 1) {
            savedVol = parsed;
          }
        }
      } catch {
        // ignore
      }

      this.audio.volume = savedVol;
      this.originalVolumeBeforeFade = savedVol;
      this.audio.muted = false;

      this.setupAudioListeners();
    } else {
      this.audio = {} as HTMLAudioElement;
    }
  }

  public setCallbacks(callbacks: AudioEngineCallbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  private setupAudioListeners() {
    this.audio.addEventListener('loadstart', () => {
      if (this.status !== 'playing' && this.status !== 'paused') {
        this.setStatus('connecting');
      }
    });

    const handleActivePlaybackState = () => {
      if (!this.audio.paused && (this.status === 'connecting' || this.status === 'buffering')) {
        this.clearWatchdogTimer();
        this.setStatus('playing');
      }
    };

    this.audio.addEventListener('waiting', () => {
      if (this.status === 'playing') {
        this.setStatus('buffering');
      }
    });

    this.audio.addEventListener('stalled', () => {
      if (this.status === 'playing') {
        this.setStatus('buffering');
      }
    });

    this.audio.addEventListener('canplay', () => {
      this.clearWatchdogTimer();
      handleActivePlaybackState();
    });

    this.audio.addEventListener('canplaythrough', () => {
      this.clearWatchdogTimer();
      handleActivePlaybackState();
    });

    this.audio.addEventListener('progress', () => {
      handleActivePlaybackState();
    });

    this.audio.addEventListener('playing', () => {
      this.clearWatchdogTimer();
      this.setStatus('playing');

      if (this.clickTimestamp > 0) {
        this.startupDurationMs = Date.now() - this.clickTimestamp;
      }

      this.updateMediaSession();
      this.startProgressSaveLoop();

      if (this.currentItem) {
        addRecentlyPlayed(this.currentItem);
      }
    });

    this.audio.addEventListener('pause', () => {
      if (this.status !== 'error' && this.status !== 'connecting') {
        this.setStatus('paused');
        this.saveCurrentProgress();
        this.stopProgressSaveLoop();
      }
    });

    this.audio.addEventListener('timeupdate', () => {
      handleActivePlaybackState();
      const curr = this.audio.currentTime || 0;
      const dur = this.audio.duration || 0;
      if (this.callbacks.onTimeUpdate && this.currentItem?.type !== 'radio') {
        this.callbacks.onTimeUpdate(curr, dur);
      }
      if (this.currentItem?.type !== 'radio') {
        this.timeUpdateListeners.forEach((listener) => listener(curr, dur));
      }
    });

    this.audio.addEventListener('ended', () => {
      this.setStatus('paused');
      if (this.currentItem?.type === 'podcast' && this.currentItem.podcastEpisode) {
        const ep = this.currentItem.podcastEpisode;
        const dur = Math.floor(ep.durationSeconds || this.audio.duration || 0);
        savePodcastProgress(ep.id, dur > 0 ? dur : 99999, dur, true);
      }
      if (this.callbacks.onEnded) {
        this.callbacks.onEnded();
      }
    });

    this.audio.addEventListener('error', () => {
      if (!this.audio.getAttribute('src') && !this.hlsInstance) return;
      if (this.status === 'idle' || this.status === 'paused') return;
      const activeSession = this.currentSessionId;
      this.tryNextCandidate(activeSession);
    });
  }

  private clearWatchdogTimer() {
    if (this.watchdogTimer) {
      clearTimeout(this.watchdogTimer);
      this.watchdogTimer = null;
    }
  }

  private destroyHls() {
    if (this.hlsInstance) {
      try {
        this.hlsInstance.detachMedia();
        this.hlsInstance.destroy();
      } catch {
        // ignore
      }
      this.hlsInstance = null;
    }
  }

  private cleanupPlayback() {
    this.clearWatchdogTimer();
    this.destroyHls();
    this.stopProgressSaveLoop();

    if (this.audio) {
      this.audio.pause();
      this.audio.removeAttribute('src');
      this.audio.load();
    }
  }

  private setStatus(newStatus: PlaybackStatus) {
    this.status = newStatus;
    if (this.callbacks.onStatusChange) {
      this.callbacks.onStatusChange(newStatus);
    }
    this.updateMediaSessionState();
  }

  private startProgressSaveLoop() {
    this.stopProgressSaveLoop();
    this.progressSaveTimer = setInterval(() => {
      this.saveCurrentProgress();
    }, 5000);
  }

  private stopProgressSaveLoop() {
    if (this.progressSaveTimer) {
      clearInterval(this.progressSaveTimer);
      this.progressSaveTimer = null;
    }
  }

  private saveCurrentProgress() {
    if (this.currentItem?.type === 'podcast' && this.currentItem.podcastEpisode) {
      const ep = this.currentItem.podcastEpisode;
      const currTime = Math.floor(this.audio.currentTime);
      const dur = Math.floor(ep.durationSeconds || this.audio.duration || 0);
      if (currTime > 2) {
        const isCompleted = dur > 0 && currTime >= dur - 15;
        savePodcastProgress(ep.id, currTime, dur, isCompleted, ep);
      }
    }
  }

  /**
   * Play Radio Station
   */
  public async playStation(station: RadioStation) {
    this.currentSessionId++;
    const sessionId = this.currentSessionId;

    this.clickTimestamp = Date.now();
    this.saveCurrentProgress();
    this.cleanupPlayback();

    this.currentItem = { type: 'radio', radio: station };
    if (this.callbacks.onItemChange) {
      this.callbacks.onItemChange(this.currentItem);
    }
    this.updateMediaSession();

    this.setStatus('connecting');

    const stationId = station.id || station.stationuuid;
    const baseCandidates = getCandidateUrlsForStation(station);
    const stationRelayUrl = stationId ? `/api/radio/stream/${encodeURIComponent(stationId)}` : null;

    let rawCandidates: (string | null | undefined)[] = [];
    const isHttpsOrigin = typeof window !== 'undefined' && window.location.protocol === 'https:';

    for (const url of baseCandidates) {
      if (!url) continue;
      const cleanUrl = url.trim();
      const proxyUrl = `/api/radio/proxy?url=${encodeURIComponent(cleanUrl)}`;
      const corsProxy = `https://corsproxy.io/?url=${encodeURIComponent(cleanUrl)}`;

      if (cleanUrl.toLowerCase().startsWith('https://')) {
        // Direct HTTPS stream FIRST: Browser plays directly from CDN without timeouts
        rawCandidates.push(cleanUrl);
        rawCandidates.push(proxyUrl);
      } else if (cleanUrl.toLowerCase().startsWith('http://')) {
        const isIpHost = /^https?:\/\/\d+\.\d+\.\d+\.\d+/i.test(cleanUrl);
        if (isHttpsOrigin) {
          // On HTTPS pages:
          // 1. If domain name, try upgraded HTTPS first (direct browser audio has lowest latency & zero proxy load)
          if (!isIpHost) {
            rawCandidates.push(cleanUrl.replace(/^http:\/\//i, 'https://'));
          }
          // 2. Local backend proxy (bypasses browser mixed-content block & Shoutcast ICY headers)
          rawCandidates.push(proxyUrl);
          // 3. Public CORS proxy as backup
          rawCandidates.push(corsProxy);
          // 4. Raw HTTP
          rawCandidates.push(cleanUrl);
        } else {
          // On HTTP pages (localhost)
          rawCandidates.push(cleanUrl);
          rawCandidates.push(proxyUrl);
        }
      } else {
        rawCandidates.push(cleanUrl);
        rawCandidates.push(proxyUrl);
      }
    }

    if (stationRelayUrl) {
      rawCandidates.push(stationRelayUrl);
    }

    if (sessionId !== this.currentSessionId) return;

    this.candidates = rawCandidates
      .filter((u): u is string => typeof u === 'string' && u.trim().length > 0)
      .map(u => u.trim())
      .filter((url, index, self) => self.indexOf(url) === index);

    if (this.candidates.length === 0) {
      this.handlePlaybackFailure(sessionId);
      return;
    }

    this.candidateIndex = 0;

    if (stationId) {
      registerStationClick(stationId);
    }

    this.startPlaybackCurrentCandidate(sessionId);
  }

  /**
   * Play Podcast Episode
   */
  public async playPodcastEpisode(episode: PodcastEpisode) {
    this.currentSessionId++;
    const sessionId = this.currentSessionId;

    this.clickTimestamp = Date.now();
    this.saveCurrentProgress();
    this.cleanupPlayback();

    this.currentItem = { type: 'podcast', podcastEpisode: episode };
    if (this.callbacks.onItemChange) {
      this.callbacks.onItemChange(this.currentItem);
    }
    this.updateMediaSession();
    addRecentlyPlayed(this.currentItem);

    this.setStatus('connecting');

    const offlineBlobUrl = await getOfflineAudioUrl(episode.id);
    const cleanUrl = (episode.audioUrl || '').trim();
    const rawCandidates: string[] = [];

    if (offlineBlobUrl) {
      rawCandidates.push(offlineBlobUrl);
    }

    if (cleanUrl) {
      if (cleanUrl.startsWith('http://')) {
        rawCandidates.push(cleanUrl.replace(/^http:\/\//i, 'https://'));
      }
      rawCandidates.push(cleanUrl);
      rawCandidates.push(`/api/radio/proxy?url=${encodeURIComponent(cleanUrl)}`);
    }

    this.candidates = rawCandidates.filter((u, idx, self) => u && self.indexOf(u) === idx);
    this.candidateIndex = 0;

    const entry = getPodcastProgressEntry(episode.id);
    const isCompleted = Boolean(entry?.completed || (entry?.durationSeconds && entry.timeSeconds >= entry.durationSeconds - 10));
    const savedTime = isCompleted ? 0 : (entry?.timeSeconds || 0);

    // Immediately register progress entry with full episode object
    savePodcastProgress(episode.id, savedTime, episode.durationSeconds, isCompleted, episode);

    this.startPlaybackCurrentCandidate(sessionId, savedTime);
  }

  /**
   * Play Audiobook Chapter / Track
   */
  public async playAudiobookTrack(track: AudiobookTrack, book: Audiobook) {
    this.currentSessionId++;
    const sessionId = this.currentSessionId;

    this.clickTimestamp = Date.now();
    this.saveCurrentProgress();
    this.cleanupPlayback();

    this.currentItem = {
      type: 'audiobook',
      audiobookTrack: { book, track }
    };

    if (this.callbacks.onItemChange) {
      this.callbacks.onItemChange(this.currentItem);
    }
    this.updateMediaSession();

    this.setStatus('connecting');

    const cleanUrl = (track.listenUrl || '').trim();
    const rawCandidates: string[] = [];

    if (cleanUrl) {
      if (cleanUrl.startsWith('http://')) {
        rawCandidates.push(cleanUrl.replace(/^http:\/\//i, 'https://'));
      }
      rawCandidates.push(cleanUrl);
      rawCandidates.push(`/api/radio/proxy?url=${encodeURIComponent(cleanUrl)}`);
      rawCandidates.push(`https://corsproxy.io/?url=${encodeURIComponent(cleanUrl)}`);
    }

    this.candidates = rawCandidates.filter((u, idx, self) => u && self.indexOf(u) === idx);
    this.candidateIndex = 0;

    this.startPlaybackCurrentCandidate(sessionId);
  }

  private async startPlaybackCurrentCandidate(sessionId: number, seekToSeconds = 0) {
    if (sessionId !== this.currentSessionId) return;

    this.clearWatchdogTimer();
    this.destroyHls();

    if (this.candidateIndex >= this.candidates.length) {
      this.handlePlaybackFailure(sessionId);
      return;
    }

    const currentUrl = this.candidates[this.candidateIndex];

    this.watchdogStartTime = Date.now();
    this.watchdogTimer = setTimeout(() => {
      if (sessionId === this.currentSessionId) {
        this.tryNextCandidate(sessionId);
      }
    }, this.watchdogDurationMs);

    let playableUrl = currentUrl;

    if (typeof window !== 'undefined') {
      if (playableUrl.startsWith('/')) {
        playableUrl = window.location.origin + playableUrl;
      } else if (
        window.location.protocol === 'https:' &&
        playableUrl.startsWith('http://') &&
        !playableUrl.includes('/api/radio/') &&
        !playableUrl.includes('corsproxy.io') &&
        !playableUrl.includes('allorigins.win')
      ) {
        // Direct HTTP is blocked on HTTPS pages (Mixed Content). Route through proxy.
        playableUrl = `/api/radio/proxy?url=${encodeURIComponent(playableUrl)}`;
        playableUrl = window.location.origin + playableUrl;
      }
    }

    const isHls = playableUrl.toLowerCase().includes('.m3u8') || (this.currentItem?.type === 'radio' && this.currentItem.radio?.hls);

    this.audio.pause();
    this.audio.playbackRate = this.playbackRate;

    if (seekToSeconds > 0) {
      const handleLoadedMeta = () => {
        if (sessionId !== this.currentSessionId) return;
        try {
          this.audio.currentTime = seekToSeconds;
        } catch {
          // Ignore range error
        }
        this.audio.removeEventListener('loadedmetadata', handleLoadedMeta);
      };
      this.audio.addEventListener('loadedmetadata', handleLoadedMeta);
    }

    const safePlay = () => {
      if (sessionId !== this.currentSessionId) return;
      const p = this.audio.play();
      if (p !== undefined) {
        p.catch((err) => {
          if (sessionId !== this.currentSessionId) return;
          console.warn('[AudioEngine] Playback error on candidate:', currentUrl, err?.message || err);
          if (err.name !== 'AbortError') {
            this.tryNextCandidate(sessionId);
          }
        });
      }
    };

    if (isHls) {
      if (Hls.isSupported()) {
        this.hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          manifestLoadingTimeOut: 4500,
          manifestLoadingMaxRetry: 1,
          levelLoadingTimeOut: 4500,
          levelLoadingMaxRetry: 1,
          fragLoadingTimeOut: 4500,
          fragLoadingMaxRetry: 1,
          maxBufferLength: 8,
          maxMaxBufferLength: 16,
          maxBufferSize: 10 * 1024 * 1024,
          backBufferLength: 0
        });
        this.hlsInstance.loadSource(playableUrl);
        this.hlsInstance.attachMedia(this.audio);
        this.hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
          if (sessionId === this.currentSessionId) {
            safePlay();
          }
        });
        this.hlsInstance.on(Hls.Events.ERROR, (_: any, data: any) => {
          if (sessionId !== this.currentSessionId) return;
          if (data.fatal) {
            console.warn('[AudioEngine] Fatal HLS error on candidate:', currentUrl, data.type, data.details);
            this.destroyHls();
            this.tryNextCandidate(sessionId);
          }
        });
        // Invoke safePlay to preserve browser user gesture
        safePlay();
      } else if (this.audio.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS for Safari (iOS and macOS)
        this.audio.src = playableUrl;
        this.audio.load();
        safePlay();
      } else {
        this.audio.src = playableUrl;
        this.audio.load();
        safePlay();
      }
    } else {
      this.audio.src = playableUrl;
      this.audio.load();
      safePlay();
    }
  }

  private tryNextCandidate(sessionId: number) {
    if (sessionId !== this.currentSessionId) return;

    this.clearWatchdogTimer();
    this.destroyHls();
    this.candidateIndex++;

    if (this.candidateIndex < this.candidates.length) {
      this.startPlaybackCurrentCandidate(sessionId);
    } else {
      this.handlePlaybackFailure(sessionId);
    }
  }

  private handlePlaybackFailure(sessionId: number) {
    if (sessionId !== this.currentSessionId) return;

    this.cleanupPlayback();

    // If current item is a live radio station, attempt 6-stage exponential reconnect
    if (this.currentItem?.type === 'radio' && this.reconnectAttempt < this.maxReconnectAttempts) {
      this.scheduleReconnect(sessionId);
      return;
    }

    this.clearReconnectState();
    this.setStatus('error');
    const errMsg = this.currentItem?.type === 'radio'
      ? 'Yayın şu anda açılamıyor. Lütfen daha sonra tekrar deneyin veya alternatif bir istasyon seçin.'
      : 'Medya dosyası oynatılamadı. Lütfen internet bağlantınızı kontrol edin.';
    if (this.callbacks.onError) {
      this.callbacks.onError(errMsg);
    }
  }

  private scheduleReconnect(sessionId: number) {
    this.clearReconnectTimers();
    this.isReconnecting = true;
    const delaySec = this.reconnectDelaysSec[this.reconnectAttempt] || 30;
    this.reconnectNextInSec = delaySec;
    this.setStatus('connecting');

    this.emitReconnectState();

    this.reconnectCountdownTimer = setInterval(() => {
      if (sessionId !== this.currentSessionId) {
        this.clearReconnectState();
        return;
      }
      this.reconnectNextInSec = Math.max(0, this.reconnectNextInSec - 1);
      this.emitReconnectState();
    }, 1000);

    this.reconnectTimer = setTimeout(() => {
      if (sessionId !== this.currentSessionId) return;
      this.clearReconnectTimers();
      this.reconnectAttempt++;
      this.candidateIndex = 0;
      this.startPlaybackCurrentCandidate(sessionId);
    }, delaySec * 1000);
  }

  public clearReconnectState() {
    this.clearReconnectTimers();
    this.isReconnecting = false;
    this.reconnectAttempt = 0;
    this.reconnectNextInSec = 0;
    this.emitReconnectState();
  }

  private clearReconnectTimers() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.reconnectCountdownTimer) {
      clearInterval(this.reconnectCountdownTimer);
      this.reconnectCountdownTimer = null;
    }
  }

  private emitReconnectState() {
    if (this.callbacks.onReconnectChange) {
      this.callbacks.onReconnectChange(this.getReconnectState());
    }
  }

  public getReconnectState(): ReconnectState {
    return {
      isReconnecting: this.isReconnecting,
      attempt: this.reconnectAttempt,
      maxAttempts: this.maxReconnectAttempts,
      nextRetrySeconds: this.reconnectNextInSec
    };
  }

  // --- Sleep Timer with 30s Gradual Fade-out ---
  public startSleepTimer(durationMinutes: number, onComplete?: () => void) {
    this.cancelSleepTimer();
    if (durationMinutes <= 0) return;

    this.sleepTimerTotalDurationMinutes = durationMinutes;
    this.sleepTimerEndAt = Date.now() + durationMinutes * 60 * 1000;
    this.originalVolumeBeforeFade = this.audio.volume || 0.8;
    this.isFadingOut = false;

    this.emitSleepTimerState();

    this.sleepTimerInterval = setInterval(() => {
      const remainingMs = this.sleepTimerEndAt - Date.now();
      const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));

      // Gradual 30-second fade-out before expiration
      if (remainingSec <= 30 && remainingSec > 0) {
        this.isFadingOut = true;
        const ratio = remainingSec / 30;
        this.audio.volume = Math.max(0, this.originalVolumeBeforeFade * ratio);
      } else if (remainingSec > 30) {
        this.isFadingOut = false;
      }

      this.emitSleepTimerState();

      if (remainingSec <= 0) {
        this.cancelSleepTimer();
        // Pause playback
        this.audio.pause();
        this.setStatus('paused');
        // Restore original volume so user is not stuck at 0!
        this.audio.volume = this.originalVolumeBeforeFade;
        this.isFadingOut = false;
        if (onComplete) onComplete();
      }
    }, 1000);
  }

  public cancelSleepTimer() {
    if (this.sleepTimerInterval) {
      clearInterval(this.sleepTimerInterval);
      this.sleepTimerInterval = null;
    }
    if (this.isFadingOut) {
      this.audio.volume = this.originalVolumeBeforeFade;
      this.isFadingOut = false;
    }
    this.sleepTimerEndAt = 0;
    this.sleepTimerTotalDurationMinutes = 0;
    this.emitSleepTimerState();
  }

  public getSleepTimerRemainingSec(): number {
    if (!this.sleepTimerEndAt) return 0;
    return Math.max(0, Math.ceil((this.sleepTimerEndAt - Date.now()) / 1000));
  }

  public isSleepTimerActive(): boolean {
    return this.sleepTimerEndAt > Date.now();
  }

  private emitSleepTimerState() {
    if (this.callbacks.onSleepTimerTick) {
      const rem = this.getSleepTimerRemainingSec();
      this.callbacks.onSleepTimerTick({
        active: rem > 0,
        durationMinutes: this.sleepTimerTotalDurationMinutes,
        remainingSeconds: rem,
        isFadingOut: this.isFadingOut
      });
    }
  }

  public togglePlayPause() {
    if (!this.currentItem) return;

    if (this.status === 'playing') {
      this.clearReconnectState();
      this.audio.pause();
    } else if (this.status === 'paused' || this.status === 'idle') {
      if (this.audio.src) {
        this.setStatus('connecting');
        this.audio.play().catch((err) => {
          if (err.name !== 'NotAllowedError' && err.name !== 'AbortError') {
            this.tryNextCandidate(this.currentSessionId);
          }
        });
      } else if (this.currentItem.type === 'radio' && this.currentItem.radio) {
        this.playStation(this.currentItem.radio);
      } else if (this.currentItem.type === 'podcast' && this.currentItem.podcastEpisode) {
        this.playPodcastEpisode(this.currentItem.podcastEpisode);
      }
    }
  }

  public seek(seconds: number) {
    if (this.audio && !isNaN(seconds) && this.currentItem?.type !== 'radio') {
      const target = Math.max(0, Math.min(seconds, this.audio.duration || seconds));
      this.audio.currentTime = target;
      this.saveCurrentProgress();
    }
  }

  public seekRelative(deltaSeconds: number) {
    if (this.audio && this.currentItem?.type !== 'radio') {
      const target = Math.max(0, Math.min(this.audio.currentTime + deltaSeconds, this.audio.duration || 0));
      this.audio.currentTime = target;
      this.saveCurrentProgress();
    }
  }

  public setPlaybackRate(rate: number) {
    this.playbackRate = rate;
    if (this.audio) {
      this.audio.playbackRate = rate;
    }
    if (this.callbacks.onPlaybackRateChange) {
      this.callbacks.onPlaybackRateChange(rate);
    }
  }

  public getPlaybackRate(): number {
    return this.playbackRate;
  }

  public stop() {
    this.currentSessionId++;
    this.clearReconnectState();
    this.saveCurrentProgress();
    this.cleanupPlayback();
    this.setStatus('idle');
  }

  public setVolume(volume: number) {
    const v = Math.max(0, Math.min(1, volume));
    this.originalVolumeBeforeFade = v;
    if (!this.isFadingOut) {
      this.audio.volume = v;
    }
    try {
      localStorage.setItem('player-volume', v.toString());
    } catch {
      // ignore
    }
  }

  public toggleMute(): boolean {
    this.audio.muted = !this.audio.muted;
    return this.audio.muted;
  }

  public getVolume(): number {
    return this.audio.volume;
  }

  public isMuted(): boolean {
    return this.audio.muted;
  }

  public getStatus(): PlaybackStatus {
    return this.status;
  }

  public getCurrentItem(): PlayableItem | null {
    return this.currentItem;
  }

  public getAudioElement(): HTMLAudioElement {
    return this.audio;
  }

  public getAudioAnalyser(): AnalyserNode | null {
    return null;
  }

  public getDebugInfo(): AudioEngineDebugInfo {
    const remainingWatchdog = this.watchdogStartTime > 0 
      ? Math.max(0, Math.ceil((this.watchdogDurationMs - (Date.now() - this.watchdogStartTime)) / 1000))
      : 0;

    let currentTitle = 'Yok';
    if (this.currentItem?.type === 'radio') {
      currentTitle = this.currentItem.radio?.name || 'Radyo';
    } else if (this.currentItem?.type === 'podcast') {
      currentTitle = this.currentItem.podcastEpisode?.title || 'Podcast';
    } else if (this.currentItem?.type === 'audiobook') {
      currentTitle = this.currentItem.audiobookTrack?.track.title || 'Sesli Kitap';
    }

    return {
      status: this.status,
      mode: this.currentItem ? this.currentItem.type : null,
      currentTitle,
      currentUrl: this.candidates[this.candidateIndex] || 'Yok',
      candidateIndex: this.candidateIndex,
      totalCandidates: this.candidates.length,
      candidates: this.candidates,
      watchdogRemainingSec: this.status === 'connecting' ? remainingWatchdog : 0,
      volume: this.audio.volume,
      muted: this.audio.muted,
      readyState: this.audio.readyState,
      networkState: this.audio.networkState,
      hlsActive: !!this.hlsInstance,
      errorCode: this.audio.error ? this.audio.error.code : null,
      errorMessage: this.audio.error ? this.audio.error.message : null,
      startupDurationMs: this.startupDurationMs,
      sessionId: this.currentSessionId,
      reconnectAttempt: this.reconnectAttempt,
      isReconnecting: this.isReconnecting,
      sleepTimerRemainingSec: this.getSleepTimerRemainingSec()
    };
  }

  private setMediaSessionHandler(action: MediaSessionAction, handler: MediaSessionActionHandler | null) {
    if ('mediaSession' in navigator && typeof navigator.mediaSession.setActionHandler === 'function') {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch {
        // Unsupported action in this browser
      }
    }
  }

  private updateMediaSessionState() {
    if ('mediaSession' in navigator) {
      try {
        if (this.status === 'playing') {
          navigator.mediaSession.playbackState = 'playing';
        } else if (this.status === 'paused') {
          navigator.mediaSession.playbackState = 'paused';
        } else if (this.status === 'idle' || this.status === 'error') {
          navigator.mediaSession.playbackState = 'none';
        }
      } catch {
        // ignore
      }
    }
  }

  private updateMediaSession() {
    if ('mediaSession' in navigator && this.currentItem) {
      let title = 'Radyo Dünyası';
      let artist = 'Canlı Yayın';
      let album = 'Radyo Dünyası App';
      let coverUrl = 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=128&q=80';

      if (this.currentItem.type === 'radio' && this.currentItem.radio) {
        title = this.currentItem.radio.name;
        artist = this.currentItem.radio.country || 'Canlı Radyo';
        album = 'Canlı Radyo';
        coverUrl = this.currentItem.radio.favicon || coverUrl;
      } else if (this.currentItem.type === 'podcast' && this.currentItem.podcastEpisode) {
        title = this.currentItem.podcastEpisode.title;
        artist = this.currentItem.podcastEpisode.showTitle;
        album = 'Podcast';
        coverUrl = this.currentItem.podcastEpisode.coverUrl || coverUrl;
      } else if (this.currentItem.type === 'audiobook' && this.currentItem.audiobookTrack) {
        title = this.currentItem.audiobookTrack.track.title;
        artist = this.currentItem.audiobookTrack.book.authors || this.currentItem.audiobookTrack.book.title;
        album = 'Sesli Kitap';
        coverUrl = this.currentItem.audiobookTrack.book.cover || coverUrl;
      }

      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title,
          artist,
          album,
          artwork: [
            {
              src: coverUrl,
              sizes: '128x128',
              type: 'image/png'
            },
            {
              src: coverUrl,
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        });
      } catch {
        // ignore metadata errors
      }

      this.updateMediaSessionState();

      this.setMediaSessionHandler('play', () => this.togglePlayPause());
      this.setMediaSessionHandler('pause', () => this.togglePlayPause());
      this.setMediaSessionHandler('stop', () => this.stop());
      this.setMediaSessionHandler('nexttrack', () => {
        if (this.callbacks.onNext) this.callbacks.onNext();
      });
      this.setMediaSessionHandler('previoustrack', () => {
        if (this.callbacks.onPrevious) this.callbacks.onPrevious();
      });

      if (this.currentItem.type !== 'radio') {
        this.setMediaSessionHandler('seekbackward', (details: any) => {
          const offset = details?.seekOffset || 15;
          this.seekRelative(-offset);
        });
        this.setMediaSessionHandler('seekforward', (details: any) => {
          const offset = details?.seekOffset || 30;
          this.seekRelative(offset);
        });
        this.setMediaSessionHandler('seekto', (details: any) => {
          if (details && typeof details.seekTime === 'number') {
            this.seek(details.seekTime);
          }
        });
      } else {
        this.setMediaSessionHandler('seekbackward', null);
        this.setMediaSessionHandler('seekforward', null);
        this.setMediaSessionHandler('seekto', null);
      }
    }
  }
}

export const audioEngine = new AudioEngine();

