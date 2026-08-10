import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Timer, X, Clock } from 'lucide-react';

interface SleepTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTimerSeconds: number | null;
  onStartTimer: (minutes: number) => void;
  onCancelTimer: () => void;
  isPodcast?: boolean;
  sleepOnEpisodeEnd?: boolean;
  onSetEndOfEpisodeTimer?: () => void;
}

export const SleepTimerModal: React.FC<SleepTimerModalProps> = ({
  isOpen,
  onClose,
  activeTimerSeconds,
  onStartTimer,
  onCancelTimer,
  isPodcast = false,
  sleepOnEpisodeEnd = false,
  onSetEndOfEpisodeTimer
}) => {
  const [customMinutes, setCustomMinutes] = useState('20');

  if (!isOpen) return null;

  const PRESETS = [15, 30, 45, 60, 90];

  const formatRemaining = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return createPortal(
    <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-4 z-[1000] animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-500">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Uyku Zamanlayıcısı</h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Yayın belirlenen süre sonunda otomatik durur</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Active Timer Display or End of Episode Display */}
        {sleepOnEpisodeEnd ? (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center space-y-2">
            <span className="text-xs text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider block">
              Bölüm Sonu Zamanlayıcısı Aktif
            </span>
            <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">
              Çalmakta olan podcast bölümü bittiğinde yayın otomatik olarak durdurulacak.
            </p>
            <button
              onClick={onCancelTimer}
              className="mt-2 text-xs px-4 py-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/30 transition-colors font-medium"
            >
              Zamanlayıcıyı İptal Et
            </button>
          </div>
        ) : activeTimerSeconds !== null && activeTimerSeconds > 0 ? (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center space-y-2">
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium uppercase tracking-wider block">
              Geri Sayım Devam Ediyor
            </span>
            <div className="text-3xl font-mono font-bold text-zinc-900 dark:text-zinc-100 tracking-wider">
              {formatRemaining(activeTimerSeconds)}
            </div>
            <button
              onClick={onCancelTimer}
              className="mt-2 text-xs px-4 py-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/30 transition-colors font-medium"
            >
              Zamanlayıcıyı İptal Et
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Podcast Special Option: Bölüm Sonu */}
            {isPodcast && onSetEndOfEpisodeTimer && (
              <div className="pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={() => {
                    onSetEndOfEpisodeTimer();
                    onClose();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs flex items-center justify-between shadow-md active:scale-98 transition-all cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Bölüm Sonu (Bölüm bitince durdur)</span>
                  </div>
                  <span className="text-[10px] bg-zinc-950/20 px-2 py-0.5 rounded-md font-mono">
                    PODCAST
                  </span>
                </button>
              </div>
            )}

            {/* Quick Preset Buttons */}
            <div>
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-2">
                Hızlı Süre Seçimi (Dakika)
              </span>
              <div className="grid grid-cols-5 gap-2">
                {PRESETS.map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      onStartTimer(m);
                      onClose();
                    }}
                    className="py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 border border-zinc-200 dark:border-zinc-700/60 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-all flex flex-col items-center justify-center space-y-0.5 active:scale-95 cursor-pointer"
                  >
                    <span>{m}</span>
                    <span className="text-[9px] opacity-75">dk</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Minutes Input */}
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-2">
                Özel Süre
              </span>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min="1"
                    max="360"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                    placeholder="Dakika"
                  />
                  <Clock className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
                <button
                  onClick={() => {
                    const val = parseInt(customMinutes, 10);
                    if (!isNaN(val) && val > 0) {
                      onStartTimer(val);
                      onClose();
                    }
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Başlat
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
