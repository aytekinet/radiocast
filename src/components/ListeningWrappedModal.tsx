import React, { useState, useMemo } from 'react';
import { 
  X, 
  Sparkles, 
  Flame, 
  Clock, 
  Award, 
  Calendar, 
  Share2, 
  CheckCircle2, 
  Headphones, 
  BarChart2, 
  TrendingUp, 
  Radio, 
  Mic,
  Copy
} from 'lucide-react';
import { getRecentlyPlayed, getAllPodcastProgress } from '../services/storage';

interface ListeningWrappedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ListeningWrappedModal: React.FC<ListeningWrappedModalProps> = ({
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Compute Statistics & Heatmap
  const stats = useMemo(() => {
    const recent = getRecentlyPlayed();
    const progressMap = getAllPodcastProgress();

    // Calculate total podcast listened seconds
    let totalPodcastSeconds = 0;
    let completedCount = 0;
    const showCounts: Record<string, { title: string; count: number; coverUrl: string }> = {};

    Object.values(progressMap).forEach(entry => {
      totalPodcastSeconds += entry.timeSeconds || 0;
      if (entry.completed) completedCount++;
      if (entry.episode) {
        const showTitle = entry.episode.showTitle || 'Podcast';
        if (!showCounts[showTitle]) {
          showCounts[showTitle] = { title: showTitle, count: 0, coverUrl: entry.episode.coverUrl };
        }
        showCounts[showTitle].count += 1;
      }
    });

    // Top Show
    let topShow = { title: 'Tüm Podcastler', count: 0, coverUrl: '' };
    Object.values(showCounts).forEach(s => {
      if (s.count > topShow.count) topShow = s;
    });

    const totalMinutes = Math.round(totalPodcastSeconds / 60);
    const totalHours = (totalPodcastSeconds / 3600).toFixed(1);

    // Heatmap calculation for the last 30 days
    const now = new Date();
    const daysMap = new Map<string, number>(); // 'YYYY-MM-DD' => minutes

    // Fill last 30 days
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      daysMap.set(dateStr, 0);
    }

    // Populate activity from recent logs & progress updates
    recent.forEach(item => {
      if (item.playedAt) {
        const dateStr = new Date(item.playedAt).toISOString().split('T')[0];
        if (daysMap.has(dateStr)) {
          // Assume average session 15-20 min if logged
          daysMap.set(dateStr, (daysMap.get(dateStr) || 0) + 15);
        }
      }
    });

    // Also populate from progress entries
    Object.values(progressMap).forEach(entry => {
      if (entry.updatedAt) {
        const dateStr = new Date(entry.updatedAt).toISOString().split('T')[0];
        if (daysMap.has(dateStr)) {
          const mins = Math.min(60, Math.round((entry.timeSeconds || 0) / 60));
          daysMap.set(dateStr, Math.max(daysMap.get(dateStr) || 0, mins));
        }
      }
    });

    // Heatmap array
    const heatmapDays = Array.from(daysMap.entries()).map(([dateStr, mins]) => {
      const d = new Date(dateStr);
      const dayName = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
      let level = 0; // 0: none, 1: low, 2: med, 3: high, 4: max
      if (mins > 0 && mins <= 10) level = 1;
      else if (mins > 10 && mins <= 30) level = 2;
      else if (mins > 30 && mins <= 60) level = 3;
      else if (mins > 60) level = 4;

      return { dateStr, dayName, mins, level };
    });

    // Calculate current listening streak
    let currentStreak = 0;
    for (let i = heatmapDays.length - 1; i >= 0; i--) {
      if (heatmapDays[i].mins > 0) currentStreak++;
      else if (i < heatmapDays.length - 1) break; // Streak broken
    }

    return {
      totalMinutes,
      totalHours,
      completedCount,
      topShow,
      heatmapDays,
      currentStreak: Math.max(1, currentStreak)
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyShare = () => {
    const text = `🎧 Benim Podcast & Dinleme Özeti:\n⏱ Toplam Dinleme: ${stats.totalMinutes} Dk (${stats.totalHours} Saat)\n🔥 Dinleme Serisi: ${stats.currentStreak} Gün Üst Üste\n🎙 En Çok Dinlenen: ${stats.topShow.title}\n✅ Tamamlanan Bölüm: ${stats.completedCount}\n\nRadioCast Web App ile dinliyorum!`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-zinc-900 to-zinc-900">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-amber-500 text-zinc-950 font-black shadow-lg shadow-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Kişisel Podcast Wrapped</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-zinc-950">2026</span>
              </h3>
              <p className="text-[11px] text-zinc-400">Dinleme Isı Haritanız ve İstatistikleriniz</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-6 text-zinc-200">
          {/* Main Hero Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30">
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold mb-1">
                <Clock className="w-4 h-4" />
                <span>Toplam Dinleme</span>
              </div>
              <div className="text-2xl font-black text-white">
                {stats.totalMinutes} <span className="text-xs font-normal text-zinc-400">dakika</span>
              </div>
              <div className="text-[11px] text-zinc-400 mt-1 font-mono">
                ~{stats.totalHours} saat yayında
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-500/20 to-rose-500/5 border border-rose-500/30">
              <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold mb-1">
                <Flame className="w-4 h-4" />
                <span>Aktif Dinleme Serisi</span>
              </div>
              <div className="text-2xl font-black text-white">
                {stats.currentStreak} <span className="text-xs font-normal text-zinc-400">gün</span>
              </div>
              <div className="text-[11px] text-zinc-400 mt-1">
                Düzenli dinleyici rozeti
              </div>
            </div>
          </div>

          {/* Listening Pulse Heatmap (Son 30 Gün Isı Haritası) */}
          <div className="p-4 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BarChart2 className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-white">Dinleme Nabzı (Son 30 Gün)</span>
              </div>
              <span className="text-[10px] text-zinc-400">Günlük Isı Haritası</span>
            </div>

            {/* Heatmap Grid */}
            <div className="grid grid-cols-10 gap-1.5 pt-1">
              {stats.heatmapDays.map((d, idx) => {
                let bgClass = 'bg-zinc-800 border-zinc-700/50';
                if (d.level === 1) bgClass = 'bg-amber-500/30 border-amber-500/40';
                else if (d.level === 2) bgClass = 'bg-amber-500/60 border-amber-500/70';
                else if (d.level === 3) bgClass = 'bg-amber-500 border-amber-400';
                else if (d.level === 4) bgClass = 'bg-emerald-500 border-emerald-400 shadow-sm shadow-emerald-500/30';

                return (
                  <div
                    key={idx}
                    title={`${d.dayName}: ${d.mins} dakika dinleme`}
                    className={`h-8 rounded-lg border ${bgClass} flex flex-col items-center justify-center transition-all hover:scale-110 cursor-pointer group relative`}
                  >
                    <span className="text-[9px] font-mono text-zinc-300 font-bold leading-none">
                      {d.mins > 0 ? `${d.mins}m` : ''}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1">
              <span>Az Aktivite</span>
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded bg-zinc-800 border border-zinc-700" />
                <span className="w-2.5 h-2.5 rounded bg-amber-500/30 border border-amber-500/40" />
                <span className="w-2.5 h-2.5 rounded bg-amber-500 border border-amber-400" />
                <span className="w-2.5 h-2.5 rounded bg-emerald-500 border border-emerald-400" />
              </div>
              <span>Yoğun Dinleme</span>
            </div>
          </div>

          {/* Top Podcast Card */}
          <div className="p-4 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5 min-w-0">
              {stats.topShow.coverUrl && !imgError ? (
                <img 
                  src={stats.topShow.coverUrl} 
                  alt={stats.topShow.title}
                  className="w-12 h-12 rounded-xl object-cover shrink-0"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                  <Mic className="w-6 h-6" />
                </div>
              )}
              <div className="min-w-0">
                <div className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">
                  En Favori Yayın
                </div>
                <h4 className="text-sm font-bold text-white truncate">
                  {stats.topShow.title}
                </h4>
                <p className="text-xs text-zinc-400">
                  {stats.completedCount} Tamamlanan Bölüm
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <div className="text-xs text-zinc-400 flex items-center space-x-1">
            <Headphones className="w-4 h-4 text-amber-500 mr-1" />
            <span>RadioCast İstatistik Modülü</span>
          </div>

          <button
            onClick={handleCopyShare}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center space-x-2 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            {copied ? <CheckCircle2 className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? 'Kopyalandı!' : 'Özeti Paylaş'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
