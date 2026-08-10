import React, { useState, useEffect } from 'react';
import { PodcastShow, PodcastEpisode } from '../types';
import { searchPodcasts, getPopularPodcasts, fetchPodcastCatalog, getPodcastEpisodesResult, safeParseEpisodeDateMillis } from '../services/podcastApi';
import { getAllPodcastProgress, markPodcastEpisodeCompleted, clearPodcastProgress, PodcastProgressEntry, getRecentlyPlayed } from '../services/storage';
import { CURATED_TURKISH_PODCASTS } from '../data/curatedTurkishPodcasts';
import { 
  downloadPodcastEpisode, 
  cancelDownloadEpisode,
  isEpisodeDownloaded, 
  deleteDownloadedEpisode, 
  getActiveDownloadsMap, 
  ActiveDownloadState,
  getAllDownloadedEpisodes
} from '../services/offlineStorage';
import { ListeningWrappedModal } from './ListeningWrappedModal';
import { 
  Mic, 
  Play, 
  Pause, 
  Search, 
  Clock, 
  Sparkles, 
  RotateCcw, 
  ChevronRight,
  ChevronLeft,
  Headphones,
  Calendar,
  Layers,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  Trash2,
  Heart,
  X,
  LayoutGrid,
  List,
  PlayCircle,
  DownloadCloud,
  FolderDown,
  BarChart2,
  Loader2
} from 'lucide-react';

function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/<[^>]+>/g, '')
    .trim();
}

interface PodcastViewProps {
  currentEpisodeId: string | null;
  isPlaying: boolean;
  onPlayEpisode: (episode: PodcastEpisode, episodes?: PodcastEpisode[]) => void;
  favoritePodcasts?: PodcastShow[];
  favoriteEpisodes?: PodcastEpisode[];
  onToggleFavoritePodcast?: (show: PodcastShow) => void;
  onToggleFavoriteEpisode?: (episode: PodcastEpisode) => void;
}

export const PodcastView: React.FC<PodcastViewProps> = React.memo(({
  currentEpisodeId,
  isPlaying,
  onPlayEpisode,
  favoritePodcasts = [],
  favoriteEpisodes = [],
  onToggleFavoritePodcast,
  onToggleFavoriteEpisode
}) => {
  const [podcasts, setPodcasts] = useState<PodcastShow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedShow, setSelectedShow] = useState<PodcastShow | null>(null);
  const [showEpisodes, setShowEpisodes] = useState<PodcastEpisode[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState<boolean>(false);
  const [episodeStatus, setEpisodeStatus] = useState<'idle' | 'loading' | 'success' | 'empty' | 'failed'>('idle');
  const [progressMap, setProgressMap] = useState<Record<string, PodcastProgressEntry>>({});
  const [episodeFilter, setEpisodeFilter] = useState<'all' | 'in-progress' | 'unplayed' | 'completed'>('all');
  const [historyFilter, setHistoryFilter] = useState<'in-progress' | 'completed' | 'all'>('in-progress');
  const [historyLayout, setHistoryLayout] = useState<'carousel' | 'grid'>('carousel');
  const [isHistoryExpanded, setIsHistoryExpanded] = useState<boolean>(false);
  const [isWrappedOpen, setIsWrappedOpen] = useState<boolean>(false);
  const [downloadedSet, setDownloadedSet] = useState<Set<string>>(new Set());
  const [activeDownloadsState, setActiveDownloadsState] = useState<Map<string, ActiveDownloadState>>(new Map());
  const historyCarouselRef = React.useRef<HTMLDivElement>(null);

  const syncDownloadedSet = React.useCallback(async () => {
    try {
      const items = await getAllDownloadedEpisodes();
      setDownloadedSet(new Set(items.map(i => i.episode.id)));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    syncDownloadedSet();

    const handleOfflineChange = () => syncDownloadedSet();
    const handleProgressChange = () => {
      setActiveDownloadsState(new Map(getActiveDownloadsMap()));
      syncDownloadedSet();
    };

    window.addEventListener('offlineEpisodesChanged', handleOfflineChange);
    window.addEventListener('downloadProgressChanged', handleProgressChange);

    return () => {
      window.removeEventListener('offlineEpisodesChanged', handleOfflineChange);
      window.removeEventListener('downloadProgressChanged', handleProgressChange);
    };
  }, [syncDownloadedSet]);

  const handleDownloadToggle = async (ep: PodcastEpisode, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const isDownloaded = downloadedSet.has(ep.id);
    if (isDownloaded) {
      if (confirm(`"${ep.title}" bölümünü yerel hafızadan silmek istiyor musunuz?`)) {
        await deleteDownloadedEpisode(ep.id);
        await syncDownloadedSet();
      }
    } else {
      const ok = await downloadPodcastEpisode(ep);
      await syncDownloadedSet();
      if (!ok) {
        alert(`"${ep.title}" bölümü indirilemedi. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.`);
      }
    }
  };

  const scrollHistoryCarousel = (direction: 'left' | 'right') => {
    if (historyCarouselRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      historyCarouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleRemoveHistoryItem = (episodeId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    clearPodcastProgress(episodeId);
    setProgressMap(getAllPodcastProgress());
  };

  const requestIdRef = React.useRef<number>(0);
  const episodesCacheRef = React.useRef<Map<string, PodcastEpisode[]>>(new Map());

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

  const selectedShowRef = React.useRef<PodcastShow | null>(selectedShow);
  selectedShowRef.current = selectedShow;

  const resolveShowFromId = (showId: string): PodcastShow => {
    const cleanId = decodeURIComponent(showId.trim());

    // 1. Check CURATED_TURKISH_PODCASTS (support with or without apple- prefix)
    const curatedMatch = CURATED_TURKISH_PODCASTS.find(p => 
      p.id === cleanId || 
      p.feedUrl === cleanId ||
      p.id.replace('apple-', '') === cleanId.replace('apple-', '')
    );
    if (curatedMatch) {
      return {
        id: curatedMatch.id,
        title: curatedMatch.title,
        publisher: curatedMatch.publisher,
        feedUrl: curatedMatch.feedUrl,
        coverUrl: curatedMatch.coverUrl,
        category: curatedMatch.category,
        description: curatedMatch.description,
        episodes: []
      };
    }

    // 2. Check loaded podcasts list
    const stateMatch = podcasts.find(p => p && (p.id === cleanId || p.feedUrl === cleanId || (p.id && p.id.replace('apple-', '') === cleanId.replace('apple-', ''))));
    if (stateMatch) return stateMatch;

    // 3. Check favoritePodcasts
    const favoriteMatch = (favoritePodcasts || []).find(p => p && (p.id === cleanId || p.feedUrl === cleanId || (p.id && p.id.replace('apple-', '') === cleanId.replace('apple-', ''))));
    if (favoriteMatch) return favoriteMatch;

    // 4. Construct a dynamic show object (for iTunes/Apple ID or custom IDs)
    return {
      id: cleanId,
      title: 'Podcast Serisi',
      publisher: 'Podcast',
      feedUrl: '',
      coverUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&q=80',
      category: 'Podcast',
      description: 'Podcast bölümleri yükleniyor...',
      episodes: []
    };
  };

  const syncShowFromLocation = () => {
    if (typeof window === 'undefined') return;

    const hash = window.location.hash.replace(/^#\/?/, '');
    
    // Check if hash is #podcasts/some-id or podcasts/some-id
    if (hash.startsWith('podcasts/')) {
      const showId = hash.replace(/^podcasts\//, '');
      if (showId) {
        const cleanShowId = decodeURIComponent(showId.trim());
        const curr = selectedShowRef.current;
        
        // If current selectedShow is already this ID, do nothing to prevent re-fetching
        if (curr && (curr.id === cleanShowId || curr.feedUrl === cleanShowId || (curr.id && curr.id.replace('apple-', '') === cleanShowId.replace('apple-', '')))) {
          return;
        }

        // Check window.history.state first
        if (window.history?.state?.podcastShow) {
          const showFromState = window.history.state.podcastShow as PodcastShow;
          if (showFromState && (showFromState.id === cleanShowId || showFromState.feedUrl === cleanShowId || (showFromState.id && showFromState.id.replace('apple-', '') === cleanShowId.replace('apple-', '')))) {
            setSelectedShow(showFromState);
            loadEpisodesForShow(showFromState);
            return;
          }
        }

        // Otherwise resolve show by ID
        const resolvedShow = resolveShowFromId(cleanShowId);
        setSelectedShow(resolvedShow);
        loadEpisodesForShow(resolvedShow);
        return;
      }
    }

    // If hash is just #podcasts or empty or another tab, clear selected show
    if (!hash || hash === 'podcasts' || !hash.includes('podcasts/')) {
      if (selectedShowRef.current !== null) {
        setSelectedShow(null);
      }
    }
  };

  useEffect(() => {
    loadPodcasts();

    const syncProgress = () => {
      setProgressMap(getAllPodcastProgress());
    };
    syncProgress();

    window.addEventListener('podcastProgressChanged', syncProgress);
    window.addEventListener('storage', syncProgress);

    syncShowFromLocation();

    const handlePopState = () => {
      syncShowFromLocation();
    };

    const handleHashChange = () => {
      syncShowFromLocation();
    };

    const handleOpenPodcastShowEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ show: PodcastShow }>;
      if (customEvent.detail?.show) {
        handleOpenShow(customEvent.detail.show);
      }
    };

    window.addEventListener('openPodcastShow', handleOpenPodcastShowEvent);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('podcastProgressChanged', syncProgress);
      window.removeEventListener('storage', syncProgress);
      window.removeEventListener('openPodcastShow', handleOpenPodcastShowEvent);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const loadEpisodesForShow = async (show: PodcastShow) => {
    const showKey = show.id || show.feedUrl || show.title;
    const currentReqId = ++requestIdRef.current;
    
    // Check if cached in memory for instant loading
    const cached = episodesCacheRef.current.get(showKey);
    if (cached && cached.length > 0) {
      setShowEpisodes(cached);
      setEpisodeStatus('success');
      setLoadingEpisodes(false);
    } else {
      setLoadingEpisodes(true);
      setEpisodeStatus('loading');
      setShowEpisodes([]);
    }

    try {
      const res = await getPodcastEpisodesResult(show);
      if (requestIdRef.current !== currentReqId) return;

      setSelectedShow(prev => prev ? {
        ...prev,
        ...show,
        title: decodeHtmlEntities(show.title || prev.title),
        description: decodeHtmlEntities(show.description || prev.description)
      } : {
        ...show,
        title: decodeHtmlEntities(show.title),
        description: decodeHtmlEntities(show.description)
      });

      if (res.success) {
        const sorted = [...res.episodes].sort((a, b) => {
          const timeA = safeParseEpisodeDateMillis(a);
          const timeB = safeParseEpisodeDateMillis(b);
          return timeB - timeA;
        }).map(ep => ({
          ...ep,
          title: decodeHtmlEntities(ep.title),
          description: decodeHtmlEntities(ep.description)
        }));

        episodesCacheRef.current.set(showKey, sorted);
        setShowEpisodes(sorted);
        setEpisodeStatus(sorted.length > 0 ? 'success' : 'empty');
      } else if (!cached) {
        setShowEpisodes([]);
        setEpisodeStatus('failed');
      }
    } catch {
      if (requestIdRef.current !== currentReqId) return;
      if (!cached) {
        setShowEpisodes([]);
        setEpisodeStatus('failed');
      }
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

  const handleCategorySelect = (catId: string) => {
    setActiveCategory(catId);
    setSearchQuery('');
    loadPodcasts('', catId, true);
  };

  const handleOpenShow = async (show: PodcastShow) => {
    setSelectedShow(show);
    setEpisodeFilter('all');
    if (typeof window !== 'undefined' && window.history) {
      const targetHash = `#podcasts/${show.id || show.feedUrl}`;
      if (window.location.hash !== targetHash) {
        window.history.pushState(
          { tab: 'podcasts', podcastShow: show },
          '',
          targetHash
        );
      }
    }
    loadEpisodesForShow(show);
  };

  const handleBackToShows = () => {
    setSelectedShow(null);
    if (typeof window !== 'undefined' && window.history) {
      if (window.location.hash.includes('podcasts/')) {
        window.history.back();
      } else {
        window.history.pushState({ tab: 'podcasts' }, '', '#podcasts');
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

  const getEpisodeState = (ep: PodcastEpisode) => {
    if (!ep || !ep.id) {
      return { entry: undefined, savedSecs: 0, dur: 0, isCompleted: false, hasProgress: false, isUnplayed: true, pct: 0 };
    }
    const entry = (progressMap || {})[ep.id];
    const savedSecs = entry?.timeSeconds || 0;
    const dur = ep.durationSeconds || entry?.durationSeconds || 0;
    const isCompleted = Boolean(entry?.completed || (dur > 0 && savedSecs >= dur * 0.92));
    const hasProgress = !isCompleted && savedSecs > 10;
    const isUnplayed = !isCompleted && savedSecs <= 10;
    const pct = isCompleted ? 100 : (dur > 0 && savedSecs > 0 ? Math.min(99, Math.round((savedSecs / dur) * 100)) : 0);

    return {
      entry,
      savedSecs,
      dur,
      isCompleted,
      hasProgress,
      isUnplayed,
      pct
    };
  };

  const handleToggleCompleted = (ep: PodcastEpisode, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const state = getEpisodeState(ep);
    if (state.isCompleted) {
      clearPodcastProgress(ep.id);
    } else {
      markPodcastEpisodeCompleted(ep.id, true, ep.durationSeconds);
    }
    setProgressMap(getAllPodcastProgress());
  };

  const handleClearAllHistory = () => {
    if (window.confirm('Tüm podcast dinleme geçmişinizi sıfırlamak istediğinize emin misiniz?')) {
      clearPodcastProgress();
      setProgressMap({});
    }
  };

  const savedHistoryList = React.useMemo(() => {
    const recentList = getRecentlyPlayed();
    const savedIds = Object.keys(progressMap).filter(id => {
      const entry = progressMap[id];
      return entry && (entry.timeSeconds > 0 || entry.completed);
    });

    const recentPodcastEps = recentList
      .filter(r => r.type === 'podcast' && r.podcastEpisode)
      .map(r => r.podcastEpisode!);

    const knownEpisodesMap = new Map<string, PodcastEpisode>();

    for (const p of podcasts) {
      if (p.episodes) {
        for (const e of p.episodes) {
          knownEpisodesMap.set(e.id, e);
        }
      }
    }

    for (const e of showEpisodes) {
      knownEpisodesMap.set(e.id, e);
    }

    for (const e of (favoriteEpisodes || [])) {
      if (e && e.id) knownEpisodesMap.set(e.id, e);
    }

    for (const p of (favoritePodcasts || [])) {
      if (p && p.episodes) {
        for (const e of p.episodes) {
          if (e && e.id) knownEpisodesMap.set(e.id, e);
        }
      }
    }

    for (const ep of recentPodcastEps) {
      if (!knownEpisodesMap.has(ep.id)) {
        knownEpisodesMap.set(ep.id, ep);
      }
    }

    for (const id of savedIds) {
      const entry = progressMap[id];
      if (entry?.episode && !knownEpisodesMap.has(id)) {
        knownEpisodesMap.set(id, entry.episode);
      }
    }

    const allIdsSet = new Set([...savedIds, ...recentPodcastEps.map(e => e.id)]);
    const results: { episode: PodcastEpisode; entry?: PodcastProgressEntry; updatedAt: number }[] = [];

    allIdsSet.forEach(id => {
      const entry = progressMap[id];
      let ep = knownEpisodesMap.get(id);

      if (!ep) {
        const recentMatch = recentList.find(r => r.type === 'podcast' && (r.podcastEpisode?.id === id || r.id === `podcast-${id}`));
        if (recentMatch) {
          ep = {
            id,
            showId: recentMatch.podcastEpisode?.showId || 'unknown',
            title: recentMatch.title || 'Podcast Bölümü',
            showTitle: recentMatch.subtitle || 'Podcast',
            description: recentMatch.podcastEpisode?.description || '',
            audioUrl: recentMatch.podcastEpisode?.audioUrl || '',
            coverUrl: recentMatch.coverUrl || 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=200&q=80',
            durationSeconds: entry?.durationSeconds || recentMatch.podcastEpisode?.durationSeconds || 0,
            publishedDate: recentMatch.podcastEpisode?.publishedDate || '',
            category: recentMatch.podcastEpisode?.category || 'Podcast'
          };
        } else if (entry?.episode) {
          ep = entry.episode;
        } else {
          ep = {
            id,
            showId: 'unknown',
            title: 'Dinlenen Podcast Bölümü',
            showTitle: 'Podcast',
            description: '',
            audioUrl: '',
            coverUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=200&q=80',
            durationSeconds: entry?.durationSeconds || 0,
            publishedDate: '',
            category: 'Podcast'
          };
        }
      }

      const updatedAt = entry?.updatedAt || (recentList.find(r => r.type === 'podcast' && r.podcastEpisode?.id === id)?.playedAt) || 0;
      results.push({ episode: ep, entry, updatedAt });
    });

    results.sort((a, b) => b.updatedAt - a.updatedAt);
    return results;
  }, [progressMap, podcasts, showEpisodes, favoriteEpisodes, favoritePodcasts]);

  const inProgressList = React.useMemo(() => {
    return savedHistoryList.filter(item => {
      const savedSecs = item.entry?.timeSeconds || 0;
      const dur = item.episode.durationSeconds || item.entry?.durationSeconds || 0;
      const isCompleted = Boolean(item.entry?.completed || (dur > 0 && savedSecs >= dur * 0.92));
      return !isCompleted && savedSecs > 0;
    });
  }, [savedHistoryList]);

  const completedList = React.useMemo(() => {
    return savedHistoryList.filter(item => {
      const savedSecs = item.entry?.timeSeconds || 0;
      const dur = item.episode.durationSeconds || item.entry?.durationSeconds || 0;
      return Boolean(item.entry?.completed || (dur > 0 && savedSecs >= dur * 0.92));
    });
  }, [savedHistoryList]);

  const latestResumeItem = inProgressList[0] || null;

  const displayHistoryList = React.useMemo(() => {
    if (historyFilter === 'in-progress') return inProgressList;
    if (historyFilter === 'completed') return completedList;
    return savedHistoryList;
  }, [historyFilter, inProgressList, completedList, savedHistoryList]);

  // -------------------------------------------------------------
  // SINGLE SHOW EPISODES DETAIL VIEW
  // -------------------------------------------------------------
  if (selectedShow) {
    const inProgressCount = showEpisodes.filter(ep => getEpisodeState(ep).hasProgress).length;
    const completedCount = showEpisodes.filter(ep => getEpisodeState(ep).isCompleted).length;
    const unplayedCount = showEpisodes.filter(ep => getEpisodeState(ep).isUnplayed).length;

    const filteredEpisodes = showEpisodes.filter(ep => {
      const state = getEpisodeState(ep);
      if (episodeFilter === 'in-progress') return state.hasProgress;
      if (episodeFilter === 'completed') return state.isCompleted;
      if (episodeFilter === 'unplayed') return state.isUnplayed;
      return true;
    });

    // Smart banner logic
    const inProgressEpisodes = showEpisodes.filter(ep => getEpisodeState(ep).hasProgress);
    const activeResumeEp = inProgressEpisodes.length > 0
      ? inProgressEpisodes.sort((a, b) => (progressMap[b.id]?.updatedAt || 0) - (progressMap[a.id]?.updatedAt || 0))[0]
      : null;

    let recommendedNextEp: PodcastEpisode | null = null;
    if (!activeResumeEp && showEpisodes.length > 0) {
      for (let i = showEpisodes.length - 1; i >= 0; i--) {
        const epState = getEpisodeState(showEpisodes[i]);
        if (epState.isCompleted && i > 0) {
          const newerEp = showEpisodes[i - 1];
          if (getEpisodeState(newerEp).isUnplayed) {
            recommendedNextEp = newerEp;
            break;
          }
        }
      }
    }

    return (
      <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto pb-56 sm:pb-48 md:pb-40">
        {/* Back Button & General Stats */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBackToShows}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:text-amber-500 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-amber-500" />
            <span>Tüm Podcast Serilerine Dön</span>
          </button>

          {(completedCount > 0 || inProgressCount > 0) && (
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-emerald-500 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {completedCount} Tamamlandı
              </span>
              {inProgressCount > 0 && (
                <span className="font-bold text-amber-500 flex items-center gap-1">
                  • <Clock className="w-3.5 h-3.5" /> {inProgressCount} Devam Ediyor
                </span>
              )}
            </div>
          )}
        </div>

        {/* Show Banner Info */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 shadow-md flex flex-col md:flex-row items-start md:items-center gap-6">
          <img
            src={selectedShow.coverUrl}
            alt={selectedShow.title}
            referrerPolicy="no-referrer"
            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&q=80'; }}
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

            {/* Direct Play Latest Episode Button & Favorite Button */}
            <div className="pt-1 flex flex-wrap items-center gap-3">
              {showEpisodes.length > 0 && (
                <button
                  onClick={() => onPlayEpisode(showEpisodes[0], showEpisodes)}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs md:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                  <span>En Son Bölümü Dinle ({showEpisodes[0].publishedDate || 'Güncel'})</span>
                </button>
              )}

              {onToggleFavoritePodcast && (
                <button
                  onClick={() => onToggleFavoritePodcast(selectedShow)}
                  className={`px-4 py-2.5 rounded-xl border text-xs md:text-sm font-bold flex items-center gap-2 transition-all active:scale-95 cursor-pointer ${
                    favoritePodcasts.some(p => (p.id || p.feedUrl) === (selectedShow.id || selectedShow.feedUrl))
                      ? 'bg-rose-500/15 border-rose-500/40 text-rose-500 hover:bg-rose-500/25 shadow-sm'
                      : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-rose-500'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${favoritePodcasts.some(p => (p.id || p.feedUrl) === (selectedShow.id || selectedShow.feedUrl)) ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>{favoritePodcasts.some(p => (p.id || p.feedUrl) === (selectedShow.id || selectedShow.feedUrl)) ? 'Favorilerimde' : 'Favorilere Ekle'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Smart Banner: Active Resume or Next Recommended Episode */}
        {activeResumeEp && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/40 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1 flex-1 min-w-0">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500 text-zinc-950 font-extrabold text-[10px] uppercase tracking-wider shadow-sm">
                  <Clock className="w-3 h-3 fill-current" /> Kaldığın Yerden Devam Et
                </span>
                <h3 className="text-sm md:text-base font-black text-zinc-900 dark:text-zinc-100 line-clamp-1">
                  {activeResumeEp.title}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Kaldığın yer: <strong className="text-amber-500">{formatDuration(progressMap[activeResumeEp.id]?.timeSeconds || 0)}</strong> / {formatDuration(activeResumeEp.durationSeconds)} (%{getEpisodeState(activeResumeEp).pct} tamamlandı)
                </p>
              </div>
              <button
                onClick={() => onPlayEpisode(activeResumeEp, showEpisodes)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs md:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95 shrink-0 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>Kaldığın Yerden Devam Et ({formatDuration(progressMap[activeResumeEp.id]?.timeSeconds || 0)})</span>
              </button>
            </div>
            <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full transition-all duration-300" style={{ width: `${getEpisodeState(activeResumeEp).pct}%` }} />
            </div>
          </div>
        )}

        {!activeResumeEp && recommendedNextEp && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-transparent border border-emerald-500/40 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 flex-1 min-w-0">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500 text-zinc-950 font-extrabold text-[10px] uppercase tracking-wider shadow-sm">
                <CheckCircle2 className="w-3 h-3 fill-current" /> Sıradaki Bölüm Önerisi
              </span>
              <h3 className="text-sm md:text-base font-black text-zinc-900 dark:text-zinc-100 line-clamp-1">
                {recommendedNextEp.title}
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Önceki bölümü başarıyla tamamladınız. Bir sonraki bölüme doğrudan geçebilirsiniz!
              </p>
            </div>
            <button
              onClick={() => onPlayEpisode(recommendedNextEp!, showEpisodes)}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs md:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95 shrink-0 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
              <span>Sonraki Bölümü Başlat</span>
            </button>
          </div>
        )}

        {/* Episodes List Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-200 dark:border-zinc-800/80">
            <div className="flex items-center gap-2">
              <Headphones className="w-5 h-5 text-amber-500" />
              <h2 className="text-base md:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Podcast Bölümleri
              </h2>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
              <button
                onClick={() => setEpisodeFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  episodeFilter === 'all'
                    ? 'bg-amber-500 text-zinc-950 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                Tümü ({showEpisodes.length})
              </button>
              {inProgressCount > 0 && (
                <button
                  onClick={() => setEpisodeFilter('in-progress')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    episodeFilter === 'in-progress'
                      ? 'bg-amber-500 text-zinc-950 shadow-sm'
                      : 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
                  }`}
                >
                  <Clock className="w-3 h-3" /> Yarıda Kalan ({inProgressCount})
                </button>
              )}
              {completedCount > 0 && (
                <button
                  onClick={() => setEpisodeFilter('completed')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    episodeFilter === 'completed'
                      ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                      : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" /> Tamamlanan ({completedCount})
                </button>
              )}
              {unplayedCount > 0 && (
                <button
                  onClick={() => setEpisodeFilter('unplayed')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    episodeFilter === 'unplayed'
                      ? 'bg-amber-500 text-zinc-950 shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  Dinlenmedi ({unplayedCount})
                </button>
              )}
            </div>
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

            {episodeStatus === 'success' && filteredEpisodes.length === 0 && (
              <div className="p-10 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                <p className="font-bold text-zinc-800 dark:text-zinc-200 text-sm">Bu filtreye uygun bölüm bulunamadı.</p>
                <button
                  onClick={() => setEpisodeFilter('all')}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs cursor-pointer"
                >
                  Tüm Bölümleri Göster
                </button>
              </div>
            )}

            {episodeStatus === 'success' && filteredEpisodes.map((ep) => {
              const idxInFullList = showEpisodes.findIndex(e => e.id === ep.id);
              const isThisPlaying = currentEpisodeId === ep.id && isPlaying;
              const epState = getEpisodeState(ep);

              return (
                <div
                  key={ep.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isThisPlaying
                      ? 'bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/10'
                      : epState.isCompleted
                      ? 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/30'
                      : epState.hasProgress
                      ? 'bg-amber-500/5 dark:bg-amber-950/20 border-amber-500/30'
                      : 'bg-white dark:bg-zinc-900/70 border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-zinc-500 dark:text-zinc-400">
                        {idxInFullList === 0 ? (
                          <span className="font-bold text-[10px] px-2 py-0.5 rounded-md bg-amber-500 text-zinc-950 flex items-center gap-1 shadow-sm">
                            <Sparkles className="w-3 h-3 fill-current" /> En Son Bölüm (Güncel)
                          </span>
                        ) : (
                          <span className="font-bold text-amber-500">Bölüm {showEpisodes.length - idxInFullList}</span>
                        )}

                        {/* Status Badges */}
                        {epState.isCompleted ? (
                          <span className="font-bold text-[10px] px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Tamamlandı
                          </span>
                        ) : epState.hasProgress ? (
                          <span className="font-bold text-[10px] px-2.5 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-500" /> Kaldığın Yer: {formatDuration(epState.savedSecs)} (%{epState.pct})
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                            Dinlenmedi
                          </span>
                        )}

                        <span>•</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-zinc-400" /> {ep.publishedDate}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-zinc-400" /> {formatDuration(ep.durationSeconds)}</span>
                      </div>

                      <h3 className={`text-sm md:text-base font-bold ${isThisPlaying ? 'text-amber-500' : epState.isCompleted ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-900 dark:text-zinc-100'}`}>
                        {ep.title}
                      </h3>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2">
                        {ep.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Offline Download Button */}
                      {(() => {
                        const isDownloaded = downloadedSet.has(ep.id);
                        const activeDl = activeDownloadsState.get(ep.id);

                        if (activeDl) {
                          return (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                cancelDownloadEpisode(ep.id);
                              }}
                              title={`İndiriliyor: %${activeDl.progressPct} (İptal etmek için tıkla)`}
                              className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-red-500/20 border border-amber-500/40 hover:border-red-500/40 text-amber-500 hover:text-red-500 font-mono text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                            >
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                              <span>%{activeDl.progressPct} (Dur)</span>
                            </button>
                          );
                        }

                        return (
                          <button
                            onClick={(e) => handleDownloadToggle(ep, e)}
                            title={isDownloaded ? "Çevrimdışı İndirildi (Tıkla ve Sil)" : "Çevrimdışı İndir (İnternetsiz Dinle)"}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                              isDownloaded
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/25'
                                : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-400 hover:text-amber-500 border-zinc-200 dark:border-zinc-700'
                            }`}
                          >
                            <DownloadCloud className={`w-4 h-4 ${isDownloaded ? 'text-emerald-500' : ''}`} />
                          </button>
                        );
                      })()}

                      {/* Favorite Episode Toggle Button */}
                      {onToggleFavoriteEpisode && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavoriteEpisode(ep);
                          }}
                          title={(favoriteEpisodes || []).some(e => e && e.id === ep.id) ? "Favorilerden Çıkar" : "Favorilere Ekle"}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                            (favoriteEpisodes || []).some(e => e && e.id === ep.id)
                              ? 'bg-rose-500/15 text-rose-500 border-rose-500/40 hover:bg-rose-500/25'
                              : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-400 hover:text-rose-500 border-zinc-200 dark:border-zinc-700'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${(favoriteEpisodes || []).some(e => e && e.id === ep.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                        </button>
                      )}

                      {/* Manual Complete/Reset Toggle Button */}
                      <button
                        onClick={(e) => handleToggleCompleted(ep, e)}
                        title={epState.isCompleted ? "Tamamlandı olarak işaretlendi (Tıkla ve sıfırla)" : "Tamamlandı olarak işaretle"}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                          epState.isCompleted
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                            : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-400 hover:text-emerald-500 border-zinc-200 dark:border-zinc-700'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>

                      {/* Main Play/Resume Button */}
                      <button
                        onClick={() => onPlayEpisode(ep, showEpisodes)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 active:scale-95 shadow-md cursor-pointer ${
                          isThisPlaying
                            ? 'bg-amber-500 text-zinc-950 shadow-amber-500/30'
                            : epState.hasProgress
                            ? 'bg-amber-500 text-zinc-950 hover:bg-amber-400 shadow-amber-500/20'
                            : epState.isCompleted
                            ? 'bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-500 hover:text-zinc-950 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700'
                            : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700'
                        }`}
                      >
                        {isThisPlaying ? (
                          <>
                            <Pause className="w-4 h-4 fill-current" /> Duraklat
                          </>
                        ) : epState.hasProgress ? (
                          <>
                            <RotateCcw className="w-4 h-4" /> Devam Et ({formatDuration(epState.savedSecs)})
                          </>
                        ) : epState.isCompleted ? (
                          <>
                            <RotateCcw className="w-4 h-4" /> Yeniden Dinle
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 fill-current ml-0.5" /> Bölümü Dinle
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Progress bar under episode */}
                  {(epState.hasProgress || epState.isCompleted) && (
                    <div className="mt-3 pt-2 border-t border-zinc-200 dark:border-zinc-800/60 space-y-1">
                      <div className="flex justify-between text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                        {epState.isCompleted ? (
                          <span className="text-emerald-500 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Tüm bölüm dinlendi (%100)
                          </span>
                        ) : (
                          <span className="text-amber-500 font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Kaldığın Yer: {formatDuration(epState.savedSecs)}
                          </span>
                        )}
                        <span>%{epState.pct}</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            epState.isCompleted ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${epState.pct}%` }}
                        />
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
    <div className="p-4 md:p-6 space-y-8 max-w-7xl mx-auto pb-56 sm:pb-48 md:pb-40">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 p-6 md:p-8 border border-zinc-200 dark:border-zinc-800 shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold tracking-wide uppercase border border-amber-500/30">
              <Mic className="w-3.5 h-3.5 text-amber-500" /> Canlı Apple Podcast Ağı
            </div>

            <button
              onClick={() => setIsWrappedOpen(true)}
              className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 hover:from-amber-500/30 hover:to-rose-500/30 border border-amber-500/40 text-amber-600 dark:text-amber-300 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <BarChart2 className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
              <span>Podcast Wrapped & Isı Haritası</span>
            </button>
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
            Türkiye Podcast Yayınları
          </h1>
          <p className="text-zinc-600 dark:text-zinc-300 text-xs md:text-sm leading-relaxed">
            Popüler Türkçe podcast serilerini ve güncel bölümlerini doğrudan dinleyin. İleri-geri sarma, bölüm takip durumu ve otomatik kaldığın yerden devam etme özelliğinin tadını çıkarın.
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
                  onClick={() => handleCategorySelect(cat.id)}
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

      {/* Quick Resume & Podcast History Widget (At Top) */}
      <section className="space-y-6 pb-6 border-b border-zinc-200 dark:border-zinc-800/80">
        {/* Header & Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 dark:bg-amber-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                Dinleme Geçmişi ve Kaldığın Yerler
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Bölümlere kaldığınız dakikadan devam edebilir veya geçmişi yönetebilirsiniz.
              </p>
            </div>
          </div>

          {savedHistoryList.length > 0 && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {/* Layout toggle */}
              <div className="flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60">
                <button
                  onClick={() => setHistoryLayout('carousel')}
                  className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                    historyLayout === 'carousel'
                      ? 'bg-amber-500 text-zinc-950 shadow-sm'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                  title="Yatay Kaydırıcı Görünümü"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setHistoryLayout('grid')}
                  className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                    historyLayout === 'grid'
                      ? 'bg-amber-500 text-zinc-950 shadow-sm'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                  title="Kompakt Izgara Görünümü"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleClearAllHistory}
                className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                title="Tüm dinleme geçmişini sıfırla"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sıfırla</span>
              </button>
            </div>
          )}
        </div>

        {savedHistoryList.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 text-center space-y-2 shadow-sm">
            <Clock className="w-8 h-8 text-zinc-400 mx-auto opacity-50" />
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Henüz dinlenmiş podcast bölümünüz bulunmuyor
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
              Bir podcast bölümü dinlemeye başladığınızda, kaldığınız süre ve tamamlanma oranınız otomatik olarak burada listelenir.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Featured "Son Kaldığın Bölüm" Hero Resume Card (If active in-progress exists) */}
            {latestResumeItem && historyFilter !== 'completed' && (
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/20 dark:via-zinc-900/90 dark:to-zinc-900/60 border border-amber-500/30 p-4 md:p-5 shadow-sm group">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 shadow-md border border-amber-500/20">
                      <img
                        src={latestResumeItem.episode.coverUrl || 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=200&q=80'}
                        alt={latestResumeItem.episode.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=200&q=80'; }}
                      />
                      <div className="absolute inset-0 bg-zinc-950/40 flex items-center justify-center">
                        {currentEpisodeId === latestResumeItem.episode.id && isPlaying ? (
                          <Pause className="w-7 h-7 text-amber-400 fill-current" />
                        ) : (
                          <Play className="w-7 h-7 text-white fill-current ml-0.5" />
                        )}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-md bg-amber-500 text-zinc-950 flex items-center gap-1">
                          <RotateCcw className="w-3 h-3" /> Son Kaldığın Yer
                        </span>
                        <span className="text-xs text-amber-500 font-bold">
                          %{Math.min(99, Math.round(((latestResumeItem.entry?.timeSeconds || 0) / (latestResumeItem.episode.durationSeconds || latestResumeItem.entry?.durationSeconds || 1)) * 100))}
                        </span>
                      </div>

                      <h3 className="text-sm md:text-base font-bold text-zinc-900 dark:text-white truncate">
                        {latestResumeItem.episode.title}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                        {latestResumeItem.episode.showTitle || 'Podcast'}
                      </p>

                      {/* Progress bar */}
                      <div className="pt-1 space-y-1 max-w-md">
                        <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all"
                            style={{
                              width: `${Math.min(99, Math.round(((latestResumeItem.entry?.timeSeconds || 0) / (latestResumeItem.episode.durationSeconds || latestResumeItem.entry?.durationSeconds || 1)) * 100))}%`
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                          <span>Kaldığın Süre: {formatDuration(latestResumeItem.entry?.timeSeconds || 0)}</span>
                          {latestResumeItem.episode.durationSeconds ? (
                            <span>Kalan: {formatDuration(Math.max(0, latestResumeItem.episode.durationSeconds - (latestResumeItem.entry?.timeSeconds || 0)))}</span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-amber-500/20">
                    <button
                      onClick={() => onPlayEpisode(latestResumeItem.episode)}
                      className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-amber-500/20 transition-all cursor-pointer"
                    >
                      {currentEpisodeId === latestResumeItem.episode.id && isPlaying ? (
                        <>
                          <Pause className="w-4 h-4 fill-current" />
                          <span>Duraklat</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>Devam Et ({formatDuration(latestResumeItem.entry?.timeSeconds || 0)})</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={(e) => handleRemoveHistoryItem(latestResumeItem.episode.id, e)}
                      className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-red-500/10 hover:text-red-500 text-zinc-400 transition-colors cursor-pointer"
                      title="Geçmişten Kaldır"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Filter Tabs */}
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 pb-2 max-w-full overflow-hidden">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full touch-pan-x overscroll-x-contain">
                <button
                  onClick={() => setHistoryFilter('in-progress')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    historyFilter === 'in-progress'
                      ? 'bg-amber-500 text-zinc-950 shadow-sm'
                      : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Kaldığım Yerler ({inProgressList.length})</span>
                </button>

                <button
                  onClick={() => setHistoryFilter('completed')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    historyFilter === 'completed'
                      ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                      : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Tamamlananlar ({completedList.length})</span>
                </button>

                <button
                  onClick={() => setHistoryFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                    historyFilter === 'all'
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                      : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Tüm Geçmiş ({savedHistoryList.length})</span>
                </button>
              </div>

              {/* Carousel navigation arrows */}
              {historyLayout === 'carousel' && displayHistoryList.length > 2 && (
                <div className="hidden sm:flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => scrollHistoryCarousel('left')}
                    className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-amber-500 hover:text-zinc-950 transition-colors cursor-pointer"
                    title="Sola Kaydır"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollHistoryCarousel('right')}
                    className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-amber-500 hover:text-zinc-950 transition-colors cursor-pointer"
                    title="Sağa Kaydır"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Items View (Carousel or Grid) */}
            {displayHistoryList.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-500 dark:text-zinc-400 italic bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-zinc-200 dark:border-zinc-800/50">
                {historyFilter === 'in-progress' && 'Yarıda kalmış podcast bölümü bulunmuyor.'}
                {historyFilter === 'completed' && 'Tamamlanmış podcast bölümü bulunmuyor.'}
                {historyFilter === 'all' && 'Geçmiş listenizde hiç bölüm bulunmuyor.'}
              </div>
            ) : historyLayout === 'carousel' ? (
              /* CAROUSEL MODE */
              <div
                ref={historyCarouselRef}
                className="flex gap-3.5 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x scroll-smooth max-w-full touch-pan-x overscroll-x-contain"
              >
                {displayHistoryList.map(({ episode: ep, entry }) => {
                  const savedSecs = entry?.timeSeconds || 0;
                  const dur = ep.durationSeconds || entry?.durationSeconds || 0;
                  const isCompleted = Boolean(entry?.completed || (dur > 0 && savedSecs >= dur * 0.92));
                  const pct = isCompleted ? 100 : (dur > 0 && savedSecs > 0 ? Math.min(99, Math.round((savedSecs / dur) * 100)) : 0);
                  const isThisPlaying = currentEpisodeId === ep.id && isPlaying;

                  return (
                    <div
                      key={ep.id}
                      onClick={() => onPlayEpisode(ep)}
                      className={`w-64 md:w-72 shrink-0 snap-start flex flex-col justify-between p-3.5 rounded-2xl border cursor-pointer transition-all relative group shadow-sm ${
                        isThisPlaying
                          ? 'bg-amber-500/10 border-amber-500/50 shadow-amber-500/10'
                          : isCompleted
                          ? 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/20 hover:border-emerald-500/40'
                          : 'bg-white dark:bg-zinc-900/80 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 border-zinc-200 dark:border-zinc-800'
                      }`}
                    >
                      {/* Top right delete x button */}
                      <button
                        onClick={(e) => handleRemoveHistoryItem(ep.id, e)}
                        className="absolute top-2.5 right-2.5 p-1 rounded-lg bg-zinc-900/80 hover:bg-red-500 text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all z-10 cursor-pointer"
                        title="Geçmişten Kaldır"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-zinc-800">
                          <img
                            src={ep.coverUrl || 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=200&q=80'}
                            alt={ep.title}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=200&q=80'; }}
                          />
                          <div className="absolute inset-0 bg-zinc-950/40 flex items-center justify-center">
                            {isThisPlaying ? (
                              <Pause className="w-5 h-5 text-amber-400 fill-current" />
                            ) : isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                            )}
                          </div>
                        </div>

                        <div className="min-w-0 flex-1 pr-4">
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-1 group-hover:text-amber-500 transition-colors">
                            {ep.title}
                          </h4>
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                            {ep.showTitle || 'Podcast'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/60 space-y-1.5">
                        <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-medium">
                          {isCompleted ? (
                            <span className="text-emerald-500 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Tamamlandı
                            </span>
                          ) : savedSecs > 0 ? (
                            <span className="text-amber-500 font-bold flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {formatDuration(savedSecs)}
                            </span>
                          ) : (
                            <span className="text-zinc-400 font-bold">Başlatıldı</span>
                          )}
                          <span className={isCompleted ? 'text-emerald-500 font-bold' : 'text-amber-500 font-bold'}>
                            %{pct}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* GRID MODE */
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {(isHistoryExpanded ? displayHistoryList : displayHistoryList.slice(0, 6)).map(({ episode: ep, entry }) => {
                    const savedSecs = entry?.timeSeconds || 0;
                    const dur = ep.durationSeconds || entry?.durationSeconds || 0;
                    const isCompleted = Boolean(entry?.completed || (dur > 0 && savedSecs >= dur * 0.92));
                    const pct = isCompleted ? 100 : (dur > 0 && savedSecs > 0 ? Math.min(99, Math.round((savedSecs / dur) * 100)) : 0);
                    const isThisPlaying = currentEpisodeId === ep.id && isPlaying;

                    return (
                      <div
                        key={ep.id}
                        onClick={() => onPlayEpisode(ep)}
                        className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all relative group shadow-sm ${
                          isThisPlaying
                            ? 'bg-amber-500/10 border-amber-500/50'
                            : isCompleted
                            ? 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/20 hover:border-emerald-500/40'
                            : 'bg-white dark:bg-zinc-900/80 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 border-zinc-200 dark:border-zinc-800'
                        }`}
                      >
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-zinc-800">
                          <img
                            src={ep.coverUrl || 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=200&q=80'}
                            alt={ep.title}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=200&q=80'; }}
                          />
                          <div className="absolute inset-0 bg-zinc-950/40 flex items-center justify-center">
                            {isThisPlaying ? (
                              <Pause className="w-5 h-5 text-amber-400 fill-current" />
                            ) : isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                            )}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0 pr-6 space-y-1">
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-1 group-hover:text-amber-500 transition-colors">
                            {ep.title}
                          </h4>
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                            {ep.showTitle || 'Podcast'}
                          </p>
                          <div className="space-y-1">
                            <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[9px] font-medium">
                              {isCompleted ? (
                                <span className="text-emerald-500 font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-2.5 h-2.5" /> Tamamlandı
                                </span>
                              ) : savedSecs > 0 ? (
                                <span className="text-amber-500 font-bold">
                                  {formatDuration(savedSecs)} dinlendi
                                </span>
                              ) : (
                                <span className="text-zinc-400 font-bold">Başlatıldı</span>
                              )}
                              <span className={isCompleted ? 'text-emerald-500 font-bold' : 'text-amber-500 font-bold'}>%{pct}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={(e) => handleRemoveHistoryItem(ep.id, e)}
                          className="absolute top-2 right-2 p-1 rounded-lg bg-zinc-900/80 hover:bg-red-500 text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all z-10 cursor-pointer"
                          title="Geçmişten Kaldır"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {displayHistoryList.length > 6 && (
                  <div className="text-center pt-2">
                    <button
                      onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                      className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      {isHistoryExpanded ? (
                        <>Daralt</>
                      ) : (
                        <>Tümünü Göster ({displayHistoryList.length} öge)</>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </section>
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
                const showEpIds = show.episodes ? show.episodes.map(e => e.id) : [];
                const listenedInShow = showEpIds.filter(id => progressMap[id]);
                const completedInShow = showEpIds.filter(id => progressMap[id]?.completed);

                return (
                  <div
                    key={show.id}
                    onClick={() => handleOpenShow(show)}
                    className="group bg-white dark:bg-zinc-900/80 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50 rounded-2xl p-4 transition-all duration-300 hover:shadow-lg cursor-pointer flex flex-col justify-between relative overflow-hidden"
                  >
                    <div className="space-y-3">
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-950">
                        <img
                          src={show.coverUrl}
                          alt={show.title}
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&q=80'; }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-zinc-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="p-3 bg-amber-500 text-zinc-950 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all font-bold">
                            <Play className="w-6 h-6 fill-current ml-0.5" />
                          </span>
                        </div>

                        {/* Favorite button on cover */}
                        {onToggleFavoritePodcast && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleFavoritePodcast(show);
                            }}
                            title={favoritePodcasts.some(p => (p.id || p.feedUrl) === (show.id || show.feedUrl)) ? "Favorilerden Çıkar" : "Favorilere Ekle"}
                            className={`absolute top-2 left-2 p-2 rounded-xl backdrop-blur-md transition-all shadow-md z-10 cursor-pointer ${
                              favoritePodcasts.some(p => (p.id || p.feedUrl) === (show.id || show.feedUrl))
                                ? 'bg-rose-500 text-white shadow-rose-500/30'
                                : 'bg-zinc-950/60 hover:bg-rose-500 text-white opacity-80 hover:opacity-100'
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${favoritePodcasts.some(p => (p.id || p.feedUrl) === (show.id || show.feedUrl)) ? 'fill-current' : ''}`} />
                          </button>
                        )}

                        {/* Listening indicator badge on cover */}
                        {completedInShow.length > 0 ? (
                          <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-emerald-500 text-zinc-950 font-black text-[10px] shadow-md flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> {completedInShow.length} Dinlendi
                          </div>
                        ) : listenedInShow.length > 0 ? (
                          <div className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-amber-500 text-zinc-950 font-black text-[10px] shadow-md flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Devam Ediyor
                          </div>
                        ) : null}
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
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-zinc-950 font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
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
        </div>
      )}
      {/* Listening Wrapped Modal */}
      <ListeningWrappedModal
        isOpen={isWrappedOpen}
        onClose={() => setIsWrappedOpen(false)}
      />
    </div>
  );
});
