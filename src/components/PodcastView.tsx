import React, { useState, useEffect } from 'react';
import { PodcastShow, PodcastEpisode } from '../types';
import { searchPodcasts, getPopularPodcasts, fetchPodcastCatalog, getPodcastEpisodesResult, safeParseEpisodeDateMillis } from '../services/podcastApi';
import { getAllPodcastProgress } from '../services/storage';
import { 
  Mic, 
  Play, 
  Pause, 
  Search, 
  Clock, 
  Sparkles, 
  RotateCcw, 
  ChevronRight,
  Headphones,
  Calendar,
  Layers,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';

interface PodcastViewProps {
  currentEpisodeId: string | null;
  isPlaying: boolean;
  onPlayEpisode: (episode: PodcastEpisode, episodes?: PodcastEpisode[]) => void;
}

export const PodcastView: React.FC<PodcastViewProps> = React.memo(({
  currentEpisodeId,
  isPlaying,
  onPlayEpisode
}) => {
  const [podcasts, setPodcasts] = useState<PodcastShow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedShow, setSelectedShow] = useState<PodcastShow | null>(null);
  const [showEpisodes, setShowEpisodes] = useState<PodcastEpisode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState<boolean>(false);
  const [episodeStatus, setEpisodeStatus] = useState<'idle' | 'loading' | 'success' | 'empty' | 'failed'>('idle');
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const requestIdRef = React.useRef<number>(0);

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [offset, setOffset] = useState<number>(0);
  const [totalPodcasts, setTotalPodcasts] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  const PODCAST_CATEGORIES = [
    { id: 'all', name: 'Tüm Podcastler', query: '' },
    { id: 'haber', name: 'Haber & Gündem', query: 'haber' },
    { id: 'felsefe', name: 'Felsefe & Kültür', query: 'felsefe' },
    { id: 'mizah', name: 'Mizah & Eğlence', query: 'mizah' },
    { id: 'teknoloji', name: 'Teknoloji & Bilim', query: 'teknoloji' },
    { id: 'psikoloji', name: 'Psikoloji & Yaşam', query: 'psikoloji' },
    { id: 'tarih', name: 'Tarih & Hikaye', query: 'tarih' },
    { id: 'ekonomi', name: 'İş & Ekonomi', query: 'ekonomi' },
    { id: 'spor', name: 'Spor', query: 'spor' },
    { id: 'sanat', name: 'Sanat & Edebiyat', query: 'sanat' }
  ];

  useEffect(() => {
    loadPodcasts();
    setProgressMap(getAllPodcastProgress());

    // Check if initial state has podcast show
    if (typeof window !== 'undefined' && window.history?.state?.podcastShow) {
      const show = window.history.state.podcastShow;
      setSelectedShow(show);
      loadEpisodesForShow(show);
    }

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.podcastShow) {
        setSelectedShow(event.state.podcastShow);
        loadEpisodesForShow(event.state.podcastShow);
      } else {
        setSelectedShow(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const loadEpisodesForShow = async (show: PodcastShow) => {
    const currentReqId = ++requestIdRef.current;
    setLoadingEpisodes(true);
    setEpisodeStatus('loading');
    setShowEpisodes([]);

    try {
      const res = await getPodcastEpisodesResult(show);
      if (requestIdRef.current !== currentReqId) return;

      if (res.success) {
        const sorted = [...res.episodes].sort((a, b) => {
          const timeA = safeParseEpisodeDateMillis(a);
          const timeB = safeParseEpisodeDateMillis(b);
          return timeB - timeA;
        });
        setShowEpisodes(sorted);
        setEpisodeStatus(sorted.length > 0 ? 'success' : 'empty');
      } else {
        setShowEpisodes([]);
        setEpisodeStatus('failed');
      }
    } catch {
      if (requestIdRef.current !== currentReqId) return;
      setShowEpisodes([]);
      setEpisodeStatus('failed');
    } finally {
      if (requestIdRef.current === currentReqId) {
        setLoadingEpisodes(false);
      }
    }
  };

  const loadPodcasts = async (query = '', category = activeCategory, isReset = true) => {
    if (isReset) {
      setLoading(true);
      setOffset(0);
    }
    try {
      const res = await fetchPodcastCatalog({
        limit: 50,
        offset: isReset ? 0 : offset,
        category,
        query
      });

      if (isReset) {
        setPodcasts(res.items);
      } else {
        setPodcasts(prev => {
          const seen = new Set(prev.map(p => p.feedUrl || p.id));
          const newItems = res.items.filter(p => !seen.has(p.feedUrl || p.id));
          return [...prev, ...newItems];
        });
      }

      setTotalPodcasts(res.total);
      setHasMore(res.hasMore);
      setOffset((isReset ? 0 : offset) + res.items.length);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMorePodcasts = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await loadPodcasts(searchQuery, activeCategory, false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadPodcasts(searchQuery, activeCategory, true);
  };

  const handleCategorySelect = (catId: string, catQuery: string) => {
    setActiveCategory(catId);
    setSearchQuery(catQuery);
    loadPodcasts(catQuery, catId, true);
  };

  const handleOpenShow = async (show: PodcastShow) => {
    setSelectedShow(show);
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState(
        { tab: 'podcasts', podcastShow: show },
        '',
        `#podcasts/${show.id}`
      );
    }
    loadEpisodesForShow(show);
  };

  const handleBackToShows = () => {
    if (typeof window !== 'undefined' && window.history && window.history.state?.podcastShow) {
      window.history.back();
    } else {
      setSelectedShow(null);
      if (typeof window !== 'undefined' && window.history) {
        window.history.replaceState({ tab: 'podcasts' }, '', '#podcasts');
      }
    }
  };

  const formatDuration = (secs: number) => {
    if (!secs) return 'Bilinmiyor';
    const m = Math.floor(secs / 60);
    if (m < 60) return `${m} dk`;
    const h = Math.floor(m / 60);
    const remM = m % 60;
    return `${h} sa ${remM} dk`;
  };

  // -------------------------------------------------------------
  // SINGLE SHOW EPISODES DETAIL VIEW
  // -------------------------------------------------------------
  if (selectedShow) {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto pb-24">
        {/* Back Button */}
        <button
          onClick={handleBackToShows}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:text-amber-500 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-amber-500" />
          <span>Tüm Podcast Serilerine Dön</span>
        </button>

        {/* Show Banner Info */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 shadow-md flex flex-col md:flex-row items-start md:items-center gap-6">
          <img
            src={selectedShow.coverUrl}
            alt={selectedShow.title}
            className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover shadow-lg shrink-0 border border-zinc-200 dark:border-zinc-800"
          />
          <div className="space-y-3 flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/30">
              <Mic className="w-3.5 h-3.5 text-amber-500" />
              <span>{selectedShow.publisher || 'Podcast Serisi'}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-zinc-100">
              {selectedShow.title}
            </h1>
            <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed line-clamp-3">
              {selectedShow.description}
            </p>

            {/* Direct Play Latest Episode Button */}
            {showEpisodes.length > 0 && (
              <div className="pt-1">
                <button
                  onClick={() => onPlayEpisode(showEpisodes[0], showEpisodes)}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs md:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>En Son Bölümü Dinle ({showEpisodes[0].publishedDate || 'Güncel'})</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Episodes List Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800/80">
            <h2 className="text-base md:text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Headphones className="w-5 h-5 text-amber-500" /> Podcast Bölümleri
            </h2>
            {loadingEpisodes ? (
              <span className="text-xs text-amber-500 flex items-center gap-2 font-medium animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin text-amber-500" /> Bölümler yükleniyor...
              </span>
            ) : (
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                {showEpisodes.length} bölüm mevcut
              </span>
            )}
          </div>

          <div className="space-y-3">
            {episodeStatus === 'loading' && (
              <div className="p-12 text-center text-amber-500 font-bold flex flex-col items-center gap-3 bg-white dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <RefreshCw className="w-8 h-8 animate-spin" />
                <p className="text-sm">Bölümler yükleniyor...</p>
              </div>
            )}

            {episodeStatus === 'failed' && (
              <div className="p-10 text-center bg-red-500/10 rounded-2xl border border-red-500/30 space-y-3">
                <p className="font-bold text-red-500 text-sm">Bölümler yüklenemedi. Yayıncının RSS sunucusuna veya akışına ulaşılamadı.</p>
                <button
                  onClick={() => loadEpisodesForShow(selectedShow)}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs inline-flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Tekrar Dene</span>
                </button>
              </div>
            )}

            {episodeStatus === 'empty' && (
              <div className="p-12 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-1">
                <p className="font-bold text-zinc-800 dark:text-zinc-200 text-sm">Bu podcast kanalında henüz yayınlanmış bölüm bulunmuyor.</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Yayıncı henüz RSS akışına geçerli bir ses dosyası eklememiş olabilir.</p>
              </div>
            )}

            {episodeStatus === 'success' && showEpisodes.map((ep, idx) => {
              const isThisPlaying = currentEpisodeId === ep.id && isPlaying;
              const savedSecs = progressMap[ep.id] || 0;
              const hasProgress = savedSecs > 0;
              const pct = hasProgress ? Math.min(100, Math.round((savedSecs / ep.durationSeconds) * 100)) : 0;

              return (
                <div
                  key={ep.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isThisPlaying
                      ? 'bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/10'
                      : 'bg-white dark:bg-zinc-900/70 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-zinc-500 dark:text-zinc-400">
                        {idx === 0 ? (
                          <span className="font-bold text-[10px] px-2 py-0.5 rounded-md bg-amber-500 text-zinc-950 flex items-center gap-1 shadow-sm">
                            <Sparkles className="w-3 h-3 fill-current" /> En Son Bölüm (Güncel)
                          </span>
                        ) : (
                          <span className="font-bold text-amber-500">Bölüm {showEpisodes.length - idx}</span>
                        )}
                        <span>•</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-zinc-400" /> {ep.publishedDate}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-zinc-400" /> {formatDuration(ep.durationSeconds)}</span>
                      </div>
                      <h3 className={`text-sm md:text-base font-bold ${isThisPlaying ? 'text-amber-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
                        {ep.title}
                      </h3>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2">
                        {ep.description}
                      </p>
                    </div>

                    <button
                      onClick={() => onPlayEpisode(ep, showEpisodes)}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 active:scale-95 shadow-md ${
                        isThisPlaying
                          ? 'bg-amber-500 text-zinc-950 shadow-amber-500/30'
                          : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700'
                      }`}
                    >
                      {isThisPlaying ? (
                        <>
                          <Pause className="w-4 h-4 fill-current" /> Duraklat
                        </>
                      ) : hasProgress ? (
                        <>
                          <RotateCcw className="w-4 h-4" /> Devam Et ({formatDuration(savedSecs)})
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current ml-0.5" /> Bölümü Dinle
                        </>
                      )}
                    </button>
                  </div>

                  {/* Progress bar under episode */}
                  {hasProgress && (
                    <div className="mt-3 pt-2 border-t border-zinc-200 dark:border-zinc-800/60 space-y-1">
                      <div className="flex justify-between text-[10px] text-zinc-500 dark:text-zinc-400">
                        <span className="text-amber-500 font-medium">Kaldığın Yer: {formatDuration(savedSecs)}</span>
                        <span>%{pct} tamamlandı</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // MAIN PODCAST SHOWS CATALOG VIEW
  // -------------------------------------------------------------
  return (
    <div className="p-4 md:p-6 space-y-8 max-w-7xl mx-auto pb-24">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 p-6 md:p-8 border border-zinc-200 dark:border-zinc-800 shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold tracking-wide uppercase border border-amber-500/30">
            <Mic className="w-3.5 h-3.5 text-amber-500" /> Canlı Apple Podcast Ağı
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
            Türkiye Podcast Yayınları
          </h1>
          <p className="text-zinc-600 dark:text-zinc-300 text-xs md:text-sm leading-relaxed">
            Popüler Türkçe podcast serilerini ve güncel bölümlerini doğrudan dinleyin. İleri-geri sarma ve kaldığın yerden otomatik devam etme özelliğinin tadını çıkarın.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 pt-2 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Podcast veya konu ara (örn: felsefe, haber)..."
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-100 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-xs md:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-amber-500 transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs md:text-sm rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 shrink-0 cursor-pointer"
            >
              Ara
            </button>
          </form>

          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {PODCAST_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id, cat.query)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all active:scale-95 border cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-zinc-950 border-amber-500 font-bold shadow-md'
                      : 'bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Podcast Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="bg-white dark:bg-zinc-900/50 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 animate-pulse space-y-3">
              <div className="aspect-square bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
              <div className="h-3 bg-zinc-200 dark:bg-zinc-800/60 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : podcasts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900/30 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 space-y-3 p-8">
          <Mic className="w-12 h-12 text-zinc-400 dark:text-zinc-600 mx-auto" />
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Podcast Bulunamadı</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Arama sorgunuzu değiştirmeyi deneyin.</p>
        </div>
      ) : (
        <div className="space-y-10">
          <section className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Mic className="w-5 h-5 text-amber-500" />
                Öne Çıkan Türkçe Podcast Yayınları
              </h2>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                {podcasts.length} / {totalPodcasts || podcasts.length} Türkçe Podcast
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {podcasts.map((show) => {
                return (
                  <div
                    key={show.id}
                    onClick={() => handleOpenShow(show)}
                    className="group bg-white dark:bg-zinc-900/80 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50 rounded-2xl p-4 transition-all duration-300 hover:shadow-lg cursor-pointer flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-950">
                        <img
                          src={show.coverUrl}
                          alt={show.title}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-zinc-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="p-3 bg-amber-500 text-zinc-950 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all font-bold">
                            <Play className="w-6 h-6 fill-current ml-0.5" />
                          </span>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-bold text-zinc-900 dark:text-white text-base line-clamp-1 group-hover:text-amber-500 transition-colors">
                          {show.title}
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">{show.publisher}</p>
                      </div>

                      <p className="text-xs text-zinc-600 dark:text-zinc-400/80 line-clamp-2 leading-relaxed">
                        {show.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-2 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1 text-amber-500 font-medium">
                        <Layers className="w-3.5 h-3.5" /> Canlı Yayın Akışı
                      </span>
                      <span className="flex items-center gap-1 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                        Bölümleri Gör <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {hasMore && (
              <div className="text-center pt-6">
                <button
                  onClick={loadMorePodcasts}
                  disabled={loadingMore}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-zinc-950 font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-2 text-sm disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Yükleniyor...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Daha Fazla Podcast Göster ({podcasts.length} / {totalPodcasts})
                    </>
                  )}
                </button>
              </div>
            )}
          </section>

          {/* Quick Resume Carousel / List if user has saved episode progress */}
          <section className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800/60">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Kaldığın Yerden Devam Et
            </h2>
            
            <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm">
              {Object.keys(progressMap).length === 0 ? (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 italic">
                  Henüz dinlenmiş podcast bölümünüz bulunmuyor. Bir bölüm başlattığınızda süreniz otomatik olarak kaydedilir.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {podcasts.flatMap(s => s.episodes || []).filter(e => (progressMap[e.id] || 0) > 0).map(ep => {
                    const savedSecs = progressMap[ep.id] || 0;
                    const pct = Math.min(100, Math.round((savedSecs / ep.durationSeconds) * 100));
                    const isThisPlaying = currentEpisodeId === ep.id && isPlaying;

                    return (
                      <div
                        key={ep.id}
                        onClick={() => onPlayEpisode(ep)}
                        className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-950/80 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800 rounded-xl cursor-pointer transition-all group"
                      >
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                          <img src={ep.coverUrl} alt={ep.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-zinc-950/40 flex items-center justify-center">
                            {isThisPlaying ? (
                              <Pause className="w-5 h-5 text-amber-400 fill-current" />
                            ) : (
                              <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                            )}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-1 group-hover:text-amber-500">
                            {ep.title}
                          </h4>
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-1">{ep.showTitle}</p>
                          <div className="space-y-1">
                            <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <div className="flex justify-between text-[9px] text-amber-500 font-medium">
                              <span>{formatDuration(savedSecs)} dinlendi</span>
                              <span>%{pct}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
});

