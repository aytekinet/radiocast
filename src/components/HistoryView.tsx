import React, { useState, useEffect, memo } from 'react';
import { Clock, Play, Trash2, Radio, Mic } from 'lucide-react';
import { RadioStation, PodcastEpisode } from '../types';
import { getRecentlyPlayed, clearRecentlyPlayed } from '../services/storage';

interface HistoryViewProps {
  onPlayStation: (station: RadioStation) => void;
  onPlayPodcastEpisode: (episode: PodcastEpisode) => void;
  currentStation: RadioStation | null;
  isPlaying: boolean;
}

export const HistoryView: React.FC<HistoryViewProps> = memo(({
  onPlayStation,
  onPlayPodcastEpisode,
  currentStation,
  isPlaying
}) => {
  const [historyItems, setHistoryItems] = useState<any[]>([]);

  useEffect(() => {
    setHistoryItems(getRecentlyPlayed());
  }, [currentStation, isPlaying]);

  const handleClear = () => {
    clearRecentlyPlayed();
    setHistoryItems([]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <Clock className="w-6 h-6 text-teal-600 dark:text-teal-400" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Dinleme Geçmişi</h1>
        </div>

        {historyItems.length > 0 && (
          <button
            onClick={handleClear}
            className="px-3.5 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Geçmişi Temizle</span>
          </button>
        )}
      </div>

      {historyItems.length === 0 ? (
        <div className="text-center py-20 p-8 rounded-2xl bg-white dark:bg-[#131B24] border border-slate-200 dark:border-[#1F2937] shadow-sm">
          <Clock className="w-12 h-12 text-slate-400 dark:text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Henüz dinleme geçmişiniz yok</h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Dinlediğiniz radyo istasyonları ve podcast bölümleri burada listelenecektir.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {historyItems.map((item, idx) => {
            const isRadio = item.type === 'radio';
            const title = isRadio ? item.radioStation?.name : item.podcastEpisode?.title;
            const subtitle = isRadio ? (item.radioStation?.tags || 'Canlı Radyo') : item.podcastEpisode?.showTitle;

            return (
              <div
                key={`${item.id}-${idx}`}
                onClick={() => {
                  if (isRadio && item.radioStation) {
                    onPlayStation(item.radioStation);
                  } else if (!isRadio && item.podcastEpisode) {
                    onPlayPodcastEpisode(item.podcastEpisode);
                  }
                }}
                className="p-3 rounded-xl bg-white dark:bg-[#131B24] border border-slate-200 dark:border-[#1F2937]/80 hover:bg-slate-50 dark:hover:bg-[#182330] hover:border-slate-300 dark:hover:border-zinc-700 transition-all flex items-center justify-between cursor-pointer group shadow-sm"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0 font-bold text-xs">
                    {isRadio ? <Radio className="w-4 h-4 text-teal-600 dark:text-teal-400" /> : <Mic className="w-4 h-4 text-teal-600 dark:text-teal-400" />}
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors truncate">
                      {title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                      {subtitle}
                    </p>
                  </div>
                </div>

                <button
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 group-hover:bg-teal-500 text-slate-700 dark:text-white group-hover:text-black flex items-center justify-center transition-all shrink-0 ml-3 shadow-sm"
                  title="Tekrar Dinle"
                >
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});
