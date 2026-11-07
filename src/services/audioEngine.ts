import { RadioStation, PodcastEpisode, PlayableItem, Audiobook, AudiobookTrack, ReconnectState, SleepTimerState } from '../types';
import { registerStationClick } from './radioApi';
import { getPodcastProgress, savePodcastProgress, getPodcastProgressEntry, addRecentlyPlayed } from './storage';
import { getOfflineAudioUrl } from './offlineStorage';
import { 
  getSmartCandidatesForStation, 
  saveWorkingStream, 
  invalidateWorkingStream, 
  isRealAudioProgressing,
  fetchOnDemandRadioBrowserAlternatives
} from './smartStreamSelector';
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
  private hasTriedOnDemandAlternatives: boolean = false;

  private currentSessionId: number = 0;
  private timeUpdateListeners = new Set<(curr: number, dur: number) => void>();
  private statusListeners = new Set<(status: PlaybackStatus) => void>();
  private itemListeners = new Set<(item: PlayableItem | null) => void>();
  private lastPositionUpdate: number = 0;

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

  public subscribeStatus(listener: (status: PlaybackStatus) => void): () => void {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  public subscribeItem(listener: (item: PlayableItem | null) => void): () => void {
    this.itemListeners.add(listener);
    listener(this.currentItem);
    return () => {
      this.itemListeners.delete(listener);
    };
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
    this.updateMediaSessionHandlers();
  }

  private confirmWorkingStreamSuccess() {
    this.clearWatchdogTimer();
    if (this.currentItem?.type === 'radio' && this.currentItem.radio) {
      const stationId = this.currentItem.radio.id || this.currentItem.radio.stationuuid;
      const currentUrl = this.candidates[this.candidateIndex];
      if (stationId && currentUrl) {
        const isHls = currentUrl.includes('.m3u8') || Boolean(this.hlsInstance);
        saveWorkingStream(stationId, currentUrl, isHls, this.currentItem.radio.codec);
      }
    }
  }

  private setupAudioListeners() {
    this.audio.addEventListener('loadstart', () => {
      if (this.status !== 'playing' && this.status !== 'paused') {
        this.setStatus('connecting');
      }
    });

    const handleActivePlaybackState = () => {
      if (!this.audio.paused && (this.status === 'connecting' || this.status === 'buffering')) {
        this.confirmWorkingStreamSuccess();
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
      this.confirmWorkingStreamSuccess();
      this.setStatus('playing');

      if (this.clickTimestamp > 0) {
        this.startupDurationMs = Date.now() - this.clickTimestamp;
      }

      this.updateMediaSession();
      this.updatePositionState();
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
        this.updatePositionState();
      }
    });

    this.audio.addEventListener('seeked', () => {
      this.updatePositionState();
    });

    this.audio.addEventListener('ratechange', () => {
      this.updatePositionState();
    });

    this.audio.addEventListener('timeupdate', () => {
      if (isRealAudioProgressing(this.audio)) {
        handleActivePlaybackState();
      }
      const curr = this.audio.currentTime || 0;
      const dur = this.audio.duration || 0;
      if (this.callbacks.onTimeUpdate && this.currentItem?.type !== 'radio') {
        this.callbacks.onTimeUpdate(curr, dur);
      }
      if (this.currentItem?.type !== 'radio') {
        this.timeUpdateListeners.forEach((listener) => listener(curr, dur));
        const now = Date.now();
        if (now - this.lastPositionUpdate > 1000) {
          this.lastPositionUpdate = now;
          this.updatePositionState();
        }
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
    }
  }

  private setStatus(newStatus: PlaybackStatus) {
    this.status = newStatus;
    if (this.callbacks.onStatusChange) {
      this.callbacks.onStatusChange(newStatus);
    }
    this.statusListeners.forEach((listener) => {
      try {
        listener(newStatus);
      } catch {
        // ignore
      }
    });
    this.updateMediaSessionState();
    if (newStatus === 'playing' || newStatus === 'paused') {
      this.updatePositionState();
    } else if (newStatus === 'idle') {
      this.clearPositionState();
    }
  }

  private emitItemChange() {
    if (this.callbacks.onItemChange) {
      this.callbacks.onItemChange(this.currentItem);
    }
    this.itemListeners.forEach((listener) => {
      try {
        listener(this.currentItem);
      } catch {
        // ignore
      }
    });
    this.updateMediaSession();
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
   * Play Radio Station with Intelligent Stream Selection
   */
  public playStation(station: RadioStation) {
    this.currentSessionId++;
    const sessionId = this.currentSessionId;
    this.hasTriedOnDemandAlternatives = false;

    this.clickTimestamp = Date.now();
    this.saveCurrentProgress();
    this.cleanupPlayback();

    this.currentItem = { type: 'radio', radio: station };
    this.emitItemChange();

    this.setStatus('connecting');

    // Automatically resolve format-aware, ranked stream candidates
    const smartCandidates = getSmartCandidatesForStation(station);
    this.candidates = smartCandidates.map(c => c.url);

    if (this.candidates.length === 0) {
      this.handlePlaybackFailure(sessionId);
      return;
    }

    this.candidateIndex = 0;

    const stationId = station.id || station.stationuuid;
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
    this.emitItemChange();
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

    this.emitItemChange();

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

    // Invalidate cached stream if current candidate failed
    if (this.currentItem?.type === 'radio' && this.currentItem.radio) {
      const stationId = this.currentItem.radio.id || this.currentItem.radio.stationuuid;
      const failedUrl = this.candidates[this.candidateIndex];
      invalidateWorkingStream(stationId, failedUrl);
    }

    this.candidateIndex++;

    if (this.candidateIndex < this.candidates.length) {
      this.startPlaybackCurrentCandidate(sessionId);
    } else if (
      this.currentItem?.type === 'radio' &&
      this.currentItem.radio?.stationuuid &&
      !this.hasTriedOnDemandAlternatives
    ) {
      // On-demand alternative resolution from Radio Browser API for this specific station
      this.hasTriedOnDemandAlternatives = true;
      const uuid = this.currentItem.radio.stationuuid;
      fetchOnDemandRadioBrowserAlternatives(uuid)
        .then((freshUrls) => {
          if (sessionId !== this.currentSessionId) return;
          const newUrls = freshUrls.filter((u) => !this.candidates.includes(u));
          if (newUrls.length > 0) {
            for (const u of newUrls) {
              this.candidates.push(u);
              this.candidates.push(`/api/radio/proxy?url=${encodeURIComponent(u)}`);
            }
            this.startPlaybackCurrentCandidate(sessionId);
          } else {
            this.handlePlaybackFailure(sessionId);
          }
        })
        .catch(() => {
          if (sessionId === this.currentSessionId) {
            this.handlePlaybackFailure(sessionId);
          }
        });
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
      ? 'Bu radyo istasyonunun yayın akışına şu anda ulaşılamıyor. Yayıncı sunucusu geçici olarak kapalı olabilir veya format tarayıcınızda desteklenmiyor.'
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

  public pause(): void {
    if (!this.currentItem) return;
    this.clearReconnectState();
    try {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
    } catch {
      // ignore
    }
    this.audio.pause();
    this.setStatus('paused');
    this.updatePositionState();
  }

  public resume(): void {
    if (!this.currentItem) return;
    if (this.status === 'playing') return;

    this.clearReconnectState();
    try {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
      }
    } catch {
      // ignore
    }

    if (this.audio.src) {
      this.setStatus('connecting');
      const p = this.audio.play();
      if (p !== undefined) {
        p.then(() => {
          this.setStatus('playing');
        }).catch((err: any) => {
          console.warn('[AudioEngine] Playback error on resume:', err?.message || err);
          if (err.name !== 'NotAllowedError' && err.name !== 'AbortError') {
            this.tryNextCandidate(this.currentSessionId);
          } else {
            this.setStatus('paused');
          }
        });
      }
    } else if (this.currentItem.type === 'radio' && this.currentItem.radio) {
      this.playStation(this.currentItem.radio);
    } else if (this.currentItem.type === 'podcast' && this.currentItem.podcastEpisode) {
      this.playPodcastEpisode(this.currentItem.podcastEpisode);
    } else if (this.currentItem.type === 'audiobook' && this.currentItem.audiobookTrack) {
      this.playAudiobookTrack(this.currentItem.audiobookTrack.track, this.currentItem.audiobookTrack.book);
    }
  }

  public togglePlayPause(): void {
    if (this.status === 'playing') {
      this.pause();
    } else {
      this.resume();
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
    if (this.audio) {
      this.audio.removeAttribute('src');
      this.audio.load();
    }
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
        // Unsupported action in this browser/OS
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
        } else if (this.status === 'idle') {
          navigator.mediaSession.playbackState = 'none';
        }
        // In case of 'connecting' or 'buffering', keep current state (don't set 'none')
        // to prevent OS lock screen/notification widget from tearing down abruptly
      } catch {
        // ignore
      }
    }
  }

  private getArtworkList(rawUrl?: string): MediaImage[] {
    let resolvedUrl = '';
    const origin = typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://radiocast.app';
    const fallbackUrl = new URL('/favicon.svg', origin).href;

    if (rawUrl && typeof rawUrl === 'string' && rawUrl.trim()) {
      const trimmed = rawUrl.trim();
      if (trimmed.startsWith('data:')) {
        resolvedUrl = trimmed;
      } else {
        try {
          resolvedUrl = new URL(trimmed, origin).href;
        } catch {
          resolvedUrl = fallbackUrl;
        }
      }
    } else {
      resolvedUrl = fallbackUrl;
    }

    const lower = resolvedUrl.toLowerCase();
    const type = lower.endsWith('.svg')
      ? 'image/svg+xml'
      : (lower.endsWith('.jpg') || lower.endsWith('.jpeg') ? 'image/jpeg' : 'image/png');

    return [
      { src: resolvedUrl, sizes: '96x96', type },
      { src: resolvedUrl, sizes: '128x128', type },
      { src: resolvedUrl, sizes: '192x192', type },
      { src: resolvedUrl, sizes: '256x256', type },
      { src: resolvedUrl, sizes: '384x384', type },
      { src: resolvedUrl, sizes: '512x512', type }
    ];
  }

  public clearPositionState() {
    if ('mediaSession' in navigator && typeof (navigator.mediaSession as any).setPositionState === 'function') {
      try {
        (navigator.mediaSession as any).setPositionState(null);
      } catch {
        try {
          (navigator.mediaSession as any).setPositionState();
        } catch {
          // ignore
        }
      }
    }
  }

  public updatePositionState() {
    if (!('mediaSession' in navigator) || typeof (navigator.mediaSession as any).setPositionState !== 'function') {
      return;
    }
    if (!this.currentItem) {
      this.clearPositionState();
      return;
    }

    // Live radio: clear position state completely to prevent fake scrubber
    if (this.currentItem.type === 'radio') {
      this.clearPositionState();
      return;
    }

    // Podcasts & Audiobooks
    try {
      const rawDur = this.audio.duration || this.currentItem.podcastEpisode?.durationSeconds || 0;
      const rawPos = this.audio.currentTime || 0;
      const rate = this.audio.playbackRate || this.playbackRate || 1.0;

      if (isFinite(rawDur) && rawDur > 0 && isFinite(rawPos) && rawPos >= 0) {
        const position = Math.min(rawPos, rawDur);
        (navigator.mediaSession as any).setPositionState({
          duration: rawDur,
          playbackRate: Math.max(0.25, Math.min(rate, 4.0)),
          position
        });
      }
    } catch {
      // Browser might reject out-of-range position
    }
  }

  public updateMediaSessionHandlers() {
    if (!('mediaSession' in navigator) || !this.currentItem) {
      return;
    }

    // Direct play/pause/stop
    this.setMediaSessionHandler('play', () => {
      try {
        navigator.mediaSession.playbackState = 'playing';
      } catch {
        // ignore
      }
      this.resume();
    });
    this.setMediaSessionHandler('pause', () => {
      try {
        navigator.mediaSession.playbackState = 'paused';
      } catch {
        // ignore
      }
      this.pause();
    });
    this.setMediaSessionHandler('stop', () => {
      this.stop();
    });

    // Next track handler: only enabled if onNext callback exists in current context
    if (typeof this.callbacks.onNext === 'function') {
      this.setMediaSessionHandler('nexttrack', () => {
        this.callbacks.onNext?.();
      });
    } else {
      this.setMediaSessionHandler('nexttrack', null);
    }

    // Previous track handler: only enabled if onPrevious callback exists in current context
    if (typeof this.callbacks.onPrevious === 'function') {
      this.setMediaSessionHandler('previoustrack', () => {
        this.callbacks.onPrevious?.();
      });
    } else {
      this.setMediaSessionHandler('previoustrack', null);
    }

    // Seeking handlers: only for podcasts / audiobooks
    if (this.currentItem.type === 'podcast' || this.currentItem.type === 'audiobook') {
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
      // Live radio: explicitly remove seek actions so OS does not show seek buttons/scrubbing
      this.setMediaSessionHandler('seekbackward', null);
      this.setMediaSessionHandler('seekforward', null);
      this.setMediaSessionHandler('seekto', null);
    }
  }

  private updateMediaSession() {
    if (!('mediaSession' in navigator) || !this.currentItem) {
      return;
    }

    let title = 'RadioCast';
    let artist = 'Canlı Yayın';
    const album = 'RadioCast';
    let rawCoverUrl = '/favicon.svg';

    if (this.currentItem.type === 'radio' && this.currentItem.radio) {
      title = this.currentItem.radio.name || 'Canlı Radyo';
      const country = this.currentItem.radio.country;
      artist = country ? `${country} • Canlı Radyo` : 'Canlı Radyo';
      rawCoverUrl = this.currentItem.radio.favicon || rawCoverUrl;
    } else if (this.currentItem.type === 'podcast' && this.currentItem.podcastEpisode) {
      title = this.currentItem.podcastEpisode.title || 'Podcast Bölümü';
      artist = this.currentItem.podcastEpisode.showTitle || 'Türkçe Podcast';
      rawCoverUrl = this.currentItem.podcastEpisode.coverUrl || rawCoverUrl;
    } else if (this.currentItem.type === 'audiobook' && this.currentItem.audiobookTrack) {
      title = this.currentItem.audiobookTrack.track.title || 'Sesli Kitap';
      artist = this.currentItem.audiobookTrack.book.authors || this.currentItem.audiobookTrack.book.title || 'Sesli Kitap';
      rawCoverUrl = this.currentItem.audiobookTrack.book.cover || rawCoverUrl;
    }

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title,
        artist,
        album,
        artwork: this.getArtworkList(rawCoverUrl)
      });
    } catch {
      // ignore metadata errors
    }

    this.updateMediaSessionState();
    this.updateMediaSessionHandlers();
    this.updatePositionState();
  }
}

export const audioEngine = new AudioEngine();

