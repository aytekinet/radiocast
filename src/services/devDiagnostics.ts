/**
 * Development Diagnostics Tracker
 * Excluded from production builds
 */

import { audioEngine } from './audioEngine';

export interface DevDiagnosticsState {
  activeAudioElement: number;
  activeHlsInstance: number;
  activeWatchdog: number;
  activeVisualizerLoops: number;
  activeTimeUpdateListeners: number;
  domStationCards: number;
  appRenders: number;
  playerBarRenders: number;
  discoverViewRenders: number;
}

class DevDiagnosticsTracker {
  public appRenders = 0;
  public playerBarRenders = 0;
  public discoverViewRenders = 0;

  public getSnapshot(): DevDiagnosticsState {
    if (typeof window === 'undefined') {
      return {
        activeAudioElement: 0,
        activeHlsInstance: 0,
        activeWatchdog: 0,
        activeVisualizerLoops: 0,
        activeTimeUpdateListeners: 0,
        domStationCards: 0,
        appRenders: 0,
        playerBarRenders: 0,
        discoverViewRenders: 0
      };
    }

    const domCards = document.querySelectorAll('[data-station-card]').length;

    return {
      activeAudioElement: 1,
      activeHlsInstance: (window as any).__DEV_HLS_ACTIVE__ ? 1 : 0,
      activeWatchdog: (window as any).__DEV_WATCHDOG_ACTIVE__ ? 1 : 0,
      activeVisualizerLoops: (window as any).__DEV_VISUALIZER_LOOPS__ || 0,
      activeTimeUpdateListeners: audioEngine.getTimeUpdateListenerCount(),
      domStationCards: domCards,
      appRenders: this.appRenders,
      playerBarRenders: this.playerBarRenders,
      discoverViewRenders: this.discoverViewRenders
    };
  }
}

export const devDiagnostics = new DevDiagnosticsTracker();

if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).__DEV_DIAGNOSTICS__ = devDiagnostics;
}

