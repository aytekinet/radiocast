import React, { useState, useEffect } from 'react';
import { Terminal, X, RefreshCw, Radio, Play, AlertCircle, CheckCircle2 } from 'lucide-react';
import { audioEngine, AudioEngineDebugInfo } from '../services/audioEngine';

export const DebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState<AudioEngineDebugInfo | null>(null);

  // Debug panel only renders in non-production environments
  const isDev = process.env.NODE_ENV !== 'production' || Boolean((import.meta as any)?.env?.DEV);

  useEffect(() => {
    if (!isDev) return;

    const interval = setInterval(() => {
      setDebugInfo(audioEngine.getDebugInfo());
    }, 500);

    return () => clearInterval(interval);
  }, [isDev]);

  if (!isDev) return null;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-50 px-3 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/40 text-cyan-400 text-xs font-mono font-bold shadow-2xl hover:scale-105 transition-all flex items-center space-x-2"
        title="Player Debug Paneli (Sadece Dev Modu)"
      >
        <Terminal className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
        <span>DEV DEBUG</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] rounded-2xl bg-slate-950/95 border border-cyan-500/40 shadow-2xl backdrop-blur-xl p-4 text-slate-200 text-xs font-mono space-y-3 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2 text-cyan-400 font-bold">
          <Terminal className="w-4 h-4" />
          <span>Player Debug Info</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-slate-400 hover:text-white p-1 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {debugInfo ? (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">DURUM (STATUS)</span>
              <span className={`font-bold ${debugInfo.status === 'playing' ? 'text-emerald-400' : debugInfo.status === 'connecting' ? 'text-amber-400 animate-pulse' : 'text-slate-300'}`}>
                {debugInfo.status.toUpperCase()}
              </span>
            </div>

            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">MOD</span>
              <span className="font-bold text-cyan-300">
                {debugInfo.mode ? debugInfo.mode.toUpperCase() : 'BOŞTA'}
              </span>
            </div>
          </div>

          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[10px] block">BAŞLIK</span>
            <span className="font-bold text-white truncate block">{debugInfo.currentTitle}</span>
          </div>

          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[10px] block">
              ADAY URL ({debugInfo.candidateIndex + 1} / {debugInfo.totalCandidates || 1})
            </span>
            <span className="text-[10px] text-cyan-300 break-all block">{debugInfo.currentUrl}</span>
          </div>

          {debugInfo.watchdogRemainingSec > 0 && (
            <div className="bg-amber-950/40 border border-amber-500/30 p-2 rounded-lg flex items-center justify-between">
              <span className="text-amber-300 text-[10px]">15s WATCHDOG KALAN SÜRE:</span>
              <span className="font-bold text-amber-400 text-sm">{debugInfo.watchdogRemainingSec}s</span>
            </div>
          )}

          {debugInfo.startupDurationMs !== null && (
            <div className="bg-emerald-950/30 border border-emerald-500/30 p-2 rounded-lg flex items-center justify-between">
              <span className="text-emerald-300 text-[10px]">BAŞLANGIÇ SÜRESİ:</span>
              <span className="font-bold text-emerald-400">{debugInfo.startupDurationMs} ms</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">SES SEVİYESİ</span>
              <span>{Math.round(debugInfo.volume * 100)}% {debugInfo.muted ? '(SESSİZ)' : ''}</span>
            </div>

            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[10px] block">HLS MOTORU</span>
              <span className={debugInfo.hlsActive ? 'text-purple-400 font-bold' : 'text-slate-400'}>
                {debugInfo.hlsActive ? 'AKTİF (hls.js)' : 'PASİF'}
              </span>
            </div>
          </div>

          <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-[10px] space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">READY STATE:</span>
              <span className="font-bold text-slate-200">{debugInfo.readyState}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">NETWORK STATE:</span>
              <span className="font-bold text-slate-200">{debugInfo.networkState}</span>
            </div>
            {debugInfo.errorCode && (
              <div className="flex justify-between text-rose-400 font-bold">
                <span>HATA KODU:</span>
                <span>{debugInfo.errorCode} - {debugInfo.errorMessage || 'Bilinmiyor'}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="py-4 text-center text-slate-500 text-xs">Debug bilgisi yükleniyor...</div>
      )}
    </div>
  );
};
