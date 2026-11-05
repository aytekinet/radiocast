/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { RadioStation, Playlist, AppSettings, ThemePalette, AppThemeMode, PodcastShow, PodcastEpisode, PlayableItem } from './types';
import { 
  getTopStationsByCountry, 
  getStationsByTag, 
  searchStations 
} from './services/radioApi';
import { matchesCategory, matchesGroup } from './constants/categories';
import { VERIFIED_TURKISH_STATIONS, ALL_TURKISH_STATIONS } from './data/fallbackStations';
import { CURATED_TURKISH_PODCASTS } from './data/curatedTurkishPodcasts';
import GENERATED_PODCAST_CATALOG from './data/generatedPodcastCatalog.json';
import { audioEngine, PlaybackStatus } from './services/audioEngine';
import { 
  getStoredFavorites, 
  toggleFavoriteStation, 
  getStoredPlaylists, 
  savePlaylists, 
  getStoredSettings, 
  saveSettings, 
  saveFavorites,
  getStoredFavoritePodcasts,
  toggleFavoritePodcastShow,
  getStoredFavoriteEpisodes,
  toggleFavoritePodcastEpisode
} from './services/storage';

import { DesktopHeader } from './components/DesktopHeader';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { PlayerBar } from './components/PlayerBar';
import { DiscoverView } from './components/DiscoverView';
import { PodcastView } from './components/PodcastView';
import { FavoritesView } from './components/FavoritesView';
import { PlaylistsView } from './components/PlaylistsView';
import { CountriesView } from './components/CountriesView';
import { SettingsView } from './components/SettingsView';
import { DownloadsView } from './components/DownloadsView';
import { SleepTimerModal } from './components/SleepTimerModal';
import { BigScreenModal } from './components/BigScreenModal';
import { LegalView, LegalPageType } from './components/LegalView';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { SearchResultsView } from './components/SearchResultsView';
import { HistoryView } from './components/HistoryView';
import { IOSInstallGuideModal } from './components/IOSInstallGuideModal';
import { WifiOff, DownloadCloud, Smartphone, Share, X, SquarePlus, ChevronRight } from 'lucide-react';
import { ReconnectState } from './types';

export default function App() {
  // Navigation & Settings
  const [activeTab, setActiveTab] = useState<string>('discover');
  const [searchTabType, setSearchTabType] = useState<'all' | 'radio' | 'podcast'>('all');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Scroll Position Preservation Container Ref
  const mainRef = useRef<HTMLDivElement>(null);
  const tabScrollPositions = useRef<Record<string, number>>({});

  const [settings, setSettings] = useState<AppSettings>(() => getStoredSettings());
  const [favorites, setFavorites] = useState<RadioStation[]>(() => getStoredFavorites());
  const [playlists, setPlaylists] = useState<Playlist[]>(() => getStoredPlaylists());
  const [favoritePodcasts, setFavoritePodcasts] = useState<PodcastShow[]>(() => getStoredFavoritePodcasts());
  const [favoriteEpisodes, setFavoriteEpisodes] = useState<PodcastEpisode[]>(() => getStoredFavoriteEpisodes());

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');

  // History & Tab Navigation
  const changeTab = useCallback((newTab: string, pushHistory = true) => {
    if (mainRef.current) {
      tabScrollPositions.current[activeTab] = mainRef.current.scrollTop;
    }
    setActiveTab(newTab);
    if (pushHistory && typeof window !== 'undefined' && window.history) {
      try {
        let targetHash = `#${newTab}`;
        if (newTab === 'search' && searchQuery) {
          targetHash = `#search?q=${encodeURIComponent(searchQuery)}${searchTabType !== 'all' ? `&type=${searchTabType}` : ''}`;
        }
        if (window.location.hash !== targetHash) {
          window.history.pushState({ tab: newTab, q: searchQuery, type: searchTabType }, '', targetHash);
        }
      } catch {
        // Ignore iframe sandbox restriction
      }
    }
    setTimeout(() => {
      if (mainRef.current && tabScrollPositions.current[newTab] !== undefined) {
        mainRef.current.scrollTop = tabScrollPositions.current[newTab];
      }
    }, 10);
  }, [activeTab, searchQuery, searchTabType]);

  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // iOS & PWA Install Guide state
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isIOSModalOpen, setIsIOSModalOpen] = useState<boolean>(false);
  const [iosGuideDismissed, setIosGuideDismissed] = useState<boolean>(false);

  // Online status & PWA install prompt & iOS environment detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      const userAgent = navigator.userAgent || '';
      const iosDevice = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
      const standaloneMode = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
      const dismissed = localStorage.getItem('pwa_ios_guide_dismissed') === 'true';

      setIsIOS(iosDevice);
      setIsStandalone(standaloneMode);
      setIosGuideDismissed(dismissed);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleDismissIOSGuide = () => {
    setIosGuideDismissed(true);
    try {
      localStorage.setItem('pwa_ios_guide_dismissed', 'true');
    } catch {
      // ignore
    }
  };

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // Sync initial tab and listen to browser back/forward buttons (popstate)
  useEffect(() => {
    const legalRoutes = ['copyright', 'dmca', 'takedown', 'counter-notice', 'privacy', 'terms', 'content-policy'];
    const validTabs = ['discover', 'search', 'radios', 'podcasts', 'history', 'downloads', 'favorites', 'playlists', 'countries', 'settings', ...legalRoutes];

    const syncFromLocation = () => {
      const pathname = window.location.pathname.replace(/^\//, '').toLowerCase();
      const rawHash = window.location.hash.replace(/^#\/?/, '');
      const rawTarget = pathname || rawHash.toLowerCase();
      const target = rawTarget.split('/')[0].split('?')[0];

      if (rawHash.includes('?')) {
        const queryPart = rawHash.slice(rawHash.indexOf('?') + 1);
        try {
          const searchParams = new URLSearchParams(queryPart);
          const q = searchParams.get('q');
          const type = searchParams.get('type') as 'all' | 'radio' | 'podcast' | null;
          if (q) setSearchQuery(q);
          if (type && (type === 'all' || type === 'radio' || type === 'podcast')) setSearchTabType(type);
        } catch {}
      }

      if (validTabs.includes(target)) {
        setActiveTab(target);
      } else {
        setActiveTab('discover');
      }
    };

    if (typeof window !== 'undefined' && window.history) {
      try {
        const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
        const rawTarget = hash.split('/')[0];
        const initialTab = validTabs.includes(rawTarget) ? rawTarget : 'discover';
        if (!window.history.state || !window.history.state.tab) {
          window.history.replaceState({ tab: initialTab }, '', window.location.hash || `#${initialTab}`);
        }
      } catch {
        // Ignore iframe sandbox restriction
      }
    }

    syncFromLocation();

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state?.overlay !== 'search') {
        setIsSearchModalOpen(false);
      }
      let targetTab = '';
      if (state && state.tab && validTabs.includes(state.tab)) {
        targetTab = state.tab;
        setActiveTab(targetTab);
      } else {
        const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase().split('/')[0];
        if (validTabs.includes(hash)) {
          targetTab = hash;
          setActiveTab(targetTab);
        } else {
          syncFromLocation();
        }
      }

      if (targetTab) {
        setTimeout(() => {
          if (mainRef.current && tabScrollPositions.current[targetTab] !== undefined) {
            mainRef.current.scrollTop = tabScrollPositions.current[targetTab];
          }
        }, 20);
      }
    };

    const handleOpenPodcastShowEvent = () => {
      setActiveTab('podcasts');
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', syncFromLocation);
    window.addEventListener('openPodcastShow', handleOpenPodcastShowEvent);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', syncFromLocation);
      window.removeEventListener('openPodcastShow', handleOpenPodcastShowEvent);
    };
  }, []);

  // Search & Filters
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('all_groups');
  const [selectedCountry, setSelectedCountry] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('radiocast_selected_country') || 'TR';
      } catch {
        return 'TR';
      }
    }
    return 'TR';
  });
  const [quickFilter, setQuickFilter] = useState<'all' | 'popular' | 'aac'>('all');

  const handleCountryChange = useCallback((newCountry: string) => {
    setSelectedCountry(newCountry);
    setSelectedCategory('');
    try {
      localStorage.setItem('radiocast_selected_country', newCountry);
    } catch {}
  }, []);

  // Stations Data & Pagination
  const [stations, setStations] = useState<RadioStation[]>(() => {
    const initCountry = typeof window !== 'undefined' ? (localStorage.getItem('radiocast_selected_country') || 'TR') : 'TR';
    return initCountry === 'TR' ? ALL_TURKISH_STATIONS : [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Filtered and sorted stations memo
  const filteredStations = useMemo(() => {
    let result = stations;

    // Filter by search query if active
    if (searchQuery.trim()) {
      const qLower = searchQuery.trim().toLowerCase();
      const searchMatches = result.filter((s) => 
        s.name.toLowerCase().includes(qLower) ||
        (s.tags && s.tags.toLowerCase().includes(qLower)) ||
        (s.country && s.country.toLowerCase().includes(qLower))
      );
      // If client-side search matches, use it; otherwise use the remote search result directly
      if (searchMatches.length > 0) {
        result = searchMatches;
      }
    } else {
      // Filter by selected category if no search query is active
      if (selectedCategory && selectedCategory !== 'all') {
        const catMatches = result.filter((s) => matchesCategory(s, selectedCategory));
        if (catMatches.length > 0) {
          result = catMatches;
        } else if (selectedCountry === 'TR') {
          const fallbackCat = ALL_TURKISH_STATIONS.filter((s) => matchesCategory(s, selectedCategory));
          if (fallbackCat.length > 0) result = fallbackCat;
        } else {
          result = [];
        }
      }

      // Filter by selected radio group if no search query is active
      if (selectedGroup && selectedGroup !== 'all_groups') {
        result = result.filter((s) => matchesGroup(s, selectedGroup));
      }
    }

    if (quickFilter === 'popular') {
      result = [...result].sort((a, b) => (b.votes || 0) - (a.votes || 0));
    } else if (quickFilter === 'aac') {
      const aacList = result.filter((s) => (s.codec || '').toLowerCase().includes('aac') || (s.bitrate || 0) >= 128);
      if (aacList.length > 0) result = aacList;
    }

    return result;
  }, [stations, selectedCategory, selectedGroup, quickFilter, searchQuery]);

  // Audio Playback Engine State
  const [currentItem, setCurrentItem] = useState<PlayableItem | null>(null);
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>('idle');
  const [retryCount, setRetryCount] = useState(0);
  const [volume, setVolume] = useState(settings.volume);
  const [isMuted, setIsMuted] = useState(false);
  const [podcastEpisodesList, setPodcastEpisodesList] = useState<PodcastEpisode[]>([]);

  // Sleep Timer & Big Screen
  const [sleepTimerSeconds, setSleepTimerSeconds] = useState<number | null>(null);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [sleepOnEpisodeEnd, setSleepOnEpisodeEnd] = useState(false);
  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);
  const [isBigScreenOpen, setIsBigScreenOpen] = useState(false);
  const [reconnectState, setReconnectState] = useState<ReconnectState>({
    isReconnecting: false,
    attempt: 0,
    maxAttempts: 6,
    nextRetrySeconds: 0
  });

  const sleepOnEpisodeEndRef = useRef(sleepOnEpisodeEnd);
  sleepOnEpisodeEndRef.current = sleepOnEpisodeEnd;

  // Continuously preserve scroll position per tab
  useEffect(() => {
    const mainEl = mainRef.current;
    if (!mainEl) return;
    const handleScroll = () => {
      tabScrollPositions.current[activeTab] = mainEl.scrollTop;
    };
    mainEl.addEventListener('scroll', handleScroll, { passive: true });
    return () => mainEl.removeEventListener('scroll', handleScroll);
  }, [activeTab]);

  // Notification Toast Message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Theme & Palette Synchronization with DOM root
  useEffect(() => {
    const root = document.documentElement;
    if (settings.themeMode === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
    root.setAttribute('data-theme-palette', settings.themePalette);
  }, [settings.themeMode, settings.themePalette]);

  // Global Keyboard Shortcuts (Cmd+K / Ctrl+K, Space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
        return;
      }

      const target = e.target as HTMLElement;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if (!isInput && e.code === 'Space' && currentItem) {
        e.preventDefault();
        handlePlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentItem]);

  // Next / Previous Handlers
  const handleNext = useCallback(() => {
    if (currentItem?.type === 'podcast' && currentItem.podcastEpisode) {
      if (podcastEpisodesList.length > 0) {
        const idx = podcastEpisodesList.findIndex((ep) => ep.id === currentItem.podcastEpisode?.id);
        if (idx !== -1 && idx < podcastEpisodesList.length - 1) {
          audioEngine.playPodcastEpisode(podcastEpisodesList[idx + 1]);
        } else if (idx !== -1 && idx === podcastEpisodesList.length - 1) {
          audioEngine.playPodcastEpisode(podcastEpisodesList[0]);
        }
      }
    } else if (currentItem?.type === 'radio') {
      const currentStation = currentItem.radio;
      if (!currentStation) return;
      const list = activeTab === 'favorites' && favorites.length > 0 ? favorites : (stations.length > 0 ? stations : ALL_TURKISH_STATIONS);
      if (list.length > 0) {
        const idx = list.findIndex((s) => (s.id || s.stationuuid) === (currentStation.id || currentStation.stationuuid));
        if (idx !== -1 && idx < list.length - 1) {
          audioEngine.playStation(list[idx + 1]);
        } else if (idx !== -1 && idx === list.length - 1) {
          audioEngine.playStation(list[0]);
        } else {
          audioEngine.playStation(list[0]);
        }
      }
    }
  }, [currentItem, podcastEpisodesList, activeTab, favorites, stations]);

  const handlePrevious = useCallback(() => {
    if (currentItem?.type === 'podcast' && currentItem.podcastEpisode) {
      if (podcastEpisodesList.length > 0) {
        const idx = podcastEpisodesList.findIndex((ep) => ep.id === currentItem.podcastEpisode?.id);
        if (idx > 0) {
          audioEngine.playPodcastEpisode(podcastEpisodesList[idx - 1]);
        } else if (idx === 0) {
          audioEngine.playPodcastEpisode(podcastEpisodesList[podcastEpisodesList.length - 1]);
        } else {
          audioEngine.playPodcastEpisode(podcastEpisodesList[0]);
        }
      }
    } else if (currentItem?.type === 'radio') {
      const currentStation = currentItem.radio;
      if (!currentStation) return;
      const list = activeTab === 'favorites' && favorites.length > 0 ? favorites : (stations.length > 0 ? stations : ALL_TURKISH_STATIONS);
      if (list.length > 0) {
        const idx = list.findIndex((s) => (s.id || s.stationuuid) === (currentStation.id || currentStation.stationuuid));
        if (idx > 0) {
          audioEngine.playStation(list[idx - 1]);
        } else if (idx === 0) {
          audioEngine.playStation(list[list.length - 1]);
        } else {
          audioEngine.playStation(list[0]);
        }
      }
    }
  }, [currentItem, podcastEpisodesList, activeTab, favorites, stations]);

  const handleNextRef = useRef(handleNext);
  handleNextRef.current = handleNext;

  const handlePreviousRef = useRef(handlePrevious);
  handlePreviousRef.current = handlePrevious;

  // Setup Audio Engine Callbacks
  useEffect(() => {
    audioEngine.setCallbacks({
      onStatusChange: (status) => setPlaybackStatus(status),
      onItemChange: (item) => setCurrentItem(item),
      onEnded: () => {
        if (sleepOnEpisodeEndRef.current) {
          setSleepOnEpisodeEnd(false);
          audioEngine.stop();
          showToast('Bölüm bitti, uyku zamanlayıcısı durdurdu.');
        } else {
          handleNextRef.current();
        }
      },
      onNext: () => {
        handleNextRef.current();
      },
      onPrevious: () => {
        handlePreviousRef.current();
      },
      onReconnectChange: (state) => {
        setReconnectState(state);
      },
      onSleepTimerTick: (state) => {
        setSleepTimerSeconds(state.active ? state.remainingSeconds : null);
        setIsFadingOut(Boolean(state.isFadingOut));
      }
    });
    audioEngine.setVolume(settings.volume);
  }, [settings.volume]);

  // Keyboard Shortcuts (Space: play/pause, M: mute, Arrows: volume & seek, Esc: close modals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        audioEngine.togglePlayPause();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        const muted = audioEngine.toggleMute();
        setIsMuted(muted);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const newVol = Math.min(1, volume + 0.05);
        audioEngine.setVolume(newVol);
        setVolume(newVol);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const newVol = Math.max(0, volume - 0.05);
        audioEngine.setVolume(newVol);
        setVolume(newVol);
      } else if (e.key === 'ArrowLeft') {
        if (currentItem && currentItem.type !== 'radio') {
          e.preventDefault();
          audioEngine.seekRelative(-15);
        }
      } else if (e.key === 'ArrowRight') {
        if (currentItem && currentItem.type !== 'radio') {
          e.preventDefault();
          audioEngine.seekRelative(30);
        }
      } else if (e.key === 'Escape') {
        setIsSleepModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [volume, currentItem]);

  // Active Request ID to prevent delayed responses from older country requests from overwriting newer ones
  const activeStationRequestIdRef = useRef(0);

  // Load Radio Stations when filters or search change
  const fetchStationsData = useCallback(async (pageNum = 1, append = false) => {
    const requestId = ++activeStationRequestIdRef.current;
    const isDefaultTurkeyView = !searchQuery.trim() && (!selectedCountry || selectedCountry === 'TR');

    try {
      if (append) {
        setIsLoadingMore(true);
      } else if (!isDefaultTurkeyView) {
        setIsLoading(true);
      }

      let list: RadioStation[] = [];

      if (searchQuery.trim()) {
        const countryFilter = selectedCountry && selectedCountry !== 'TR' ? selectedCountry : undefined;
        list = await searchStations({
          name: searchQuery.trim(),
          countrycode: countryFilter,
          page: pageNum
        });

        if (list.length === 0 && countryFilter) {
          list = await searchStations({
            name: searchQuery.trim(),
            page: pageNum
          });
        }
      } else {
        const code = selectedCountry || 'TR';
        if (code === 'TR' && pageNum === 1) {
          list = ALL_TURKISH_STATIONS;
        } else {
          list = await getTopStationsByCountry(code, pageNum);
        }
      }

      // Discard delayed response if user changed country or fired another request
      if (requestId !== activeStationRequestIdRef.current) {
        return;
      }

      if (list.length < 15) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      if (append) {
        setStations((prev) => {
          const existingUuids = new Set(prev.map((s) => s.stationuuid || s.id));
          const uniqueNew = list.filter((s) => !existingUuids.has(s.stationuuid || s.id));
          return [...prev, ...uniqueNew];
        });
      } else {
        setStations(list);
      }
    } catch (err) {
      if (requestId !== activeStationRequestIdRef.current) return;
      console.warn('Radio stations load error:', err);
      if (!append) {
        if (selectedCountry === 'TR') {
          setStations(ALL_TURKISH_STATIONS);
        } else {
          setStations([]);
        }
      }
    } finally {
      if (requestId === activeStationRequestIdRef.current) {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    }
  }, [searchQuery, selectedCountry]);

  const prevCountryRef = useRef(selectedCountry);

  // Reset pagination and reload on search/filter change
  useEffect(() => {
    setPage(1);
    setHasMore(true);

    if (prevCountryRef.current !== selectedCountry) {
      prevCountryRef.current = selectedCountry;
      setStations([]);
      setIsLoading(true);
      fetchStationsData(1, false);
      return;
    }

    const timer = setTimeout(() => {
      fetchStationsData(1, false);
    }, 150);
    return () => clearTimeout(timer);
  }, [fetchStationsData, selectedCountry]);

  // Settings Update
  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const merged = { ...prev, ...newSettings };
      saveSettings(merged);
      return merged;
    });
  }, []);

  const handleLoadMore = useCallback(() => {
    setPage((prevPage) => {
      const nextPage = prevPage + 1;
      fetchStationsData(nextPage, true);
      return nextPage;
    });
  }, [fetchStationsData]);

  // Handle Play Station
  const handlePlayStation = useCallback((station: RadioStation) => {
    const stationId = station.id || station.stationuuid;
    const currentStationId = currentItem?.radio?.id || currentItem?.radio?.stationuuid;

    if (currentItem?.type === 'radio' && currentStationId === stationId) {
      if (playbackStatus === 'playing' || playbackStatus === 'connecting' || playbackStatus === 'buffering') {
        audioEngine.togglePlayPause();
      } else {
        audioEngine.playStation(station);
      }
    } else {
      audioEngine.playStation(station);
    }
  }, [currentItem, playbackStatus]);

  // Handle Play Podcast Episode
  const handlePlayPodcastEpisode = useCallback((episode: PodcastEpisode, episodes?: PodcastEpisode[]) => {
    if (episodes && episodes.length > 0) {
      setPodcastEpisodesList(episodes);
    }
    if (currentItem?.type === 'podcast' && currentItem.podcastEpisode?.id === episode.id && playbackStatus === 'playing') {
      audioEngine.togglePlayPause();
    } else {
      audioEngine.playPodcastEpisode(episode);
    }
  }, [currentItem, playbackStatus]);

  // Handle Play Pause Toggle
  const handlePlayPause = useCallback(() => {
    audioEngine.togglePlayPause();
  }, []);

  // Handle Stop
  const handleStop = useCallback(() => {
    audioEngine.stop();
  }, []);

  // Handle Volume Change
  const handleVolumeChange = useCallback((newVol: number) => {
    setVolume(newVol);
    audioEngine.setVolume(newVol);
    updateSettings({ volume: newVol });
  }, [updateSettings]);

  // Handle Toggle Mute
  const handleToggleMute = useCallback(() => {
    const muted = audioEngine.toggleMute();
    setIsMuted(muted);
  }, []);

  // Favorites Toggle
  const handleToggleFavorite = useCallback((station: RadioStation) => {
    const updated = toggleFavoriteStation(station);
    setFavorites(updated);
  }, []);

  const handleToggleFavoritePodcast = useCallback((show: PodcastShow) => {
    const updated = toggleFavoritePodcastShow(show);
    setFavoritePodcasts(updated);
    const exists = updated.some(s => (s.id || s.feedUrl) === (show.id || show.feedUrl));
    showToast(exists ? `"${show.title}" favori podcastlere eklendi.` : `"${show.title}" favorilerden çıkarıldı.`);
  }, []);

  const handleToggleFavoriteEpisode = useCallback((episode: PodcastEpisode) => {
    const updated = toggleFavoritePodcastEpisode(episode);
    setFavoriteEpisodes(updated);
    const exists = updated.some(e => e.id === episode.id);
    showToast(exists ? `"${episode.title}" favori bölümlere eklendi.` : `"${episode.title}" favorilerden çıkarıldı.`);
  }, []);

  const handleOpenPodcastShowFromFav = useCallback((show: PodcastShow) => {
    changeTab('podcasts', false);
    if (typeof window !== 'undefined' && window.history) {
      const showId = show.id || show.feedUrl || show.title;
      window.history.pushState({ tab: 'podcasts', podcastShow: show }, '', `#podcasts/${encodeURIComponent(showId)}`);
    }
    window.dispatchEvent(new CustomEvent('openPodcastShow', { detail: { show } }));
  }, [changeTab]);

  const handleNavigateToPodcastShow = useCallback((episode: PodcastEpisode) => {
    changeTab('podcasts', false);

    const showTitleLower = (episode.showTitle || '').toLowerCase();
    const curatedMatch = CURATED_TURKISH_PODCASTS.find(
      p => p.id === episode.showId || (showTitleLower && p.title.toLowerCase() === showTitleLower)
    );

    const catalogMatch = !curatedMatch
      ? (GENERATED_PODCAST_CATALOG as any[]).find(
          item => (item.id && item.id === episode.showId) || (showTitleLower && item.title && item.title.toLowerCase() === showTitleLower)
        )
      : null;

    let targetShow: PodcastShow;
    if (curatedMatch) {
      targetShow = {
        id: curatedMatch.id,
        title: curatedMatch.title,
        publisher: curatedMatch.publisher,
        coverUrl: curatedMatch.coverUrl || episode.coverUrl,
        feedUrl: curatedMatch.feedUrl,
        category: curatedMatch.category || episode.category || 'Genel',
        description: curatedMatch.description || `${curatedMatch.title} podcast serisi.`,
        episodes: [episode]
      };
    } else if (catalogMatch) {
      targetShow = {
        id: catalogMatch.id || episode.showId || `show-${episode.id}`,
        title: catalogMatch.title || episode.showTitle || 'Podcast',
        publisher: catalogMatch.author || episode.category || 'Yayıncı',
        coverUrl: catalogMatch.image || catalogMatch.coverUrl || episode.coverUrl,
        feedUrl: catalogMatch.feedUrl,
        category: (catalogMatch.categories && catalogMatch.categories[0]) || episode.category || 'Genel',
        description: catalogMatch.description || episode.description || '',
        episodes: [episode]
      };
    } else {
      targetShow = {
        id: episode.showId || `show-${episode.id}`,
        title: episode.showTitle || 'Podcast',
        publisher: episode.category || 'Podcast',
        coverUrl: episode.coverUrl,
        category: episode.category || 'Genel',
        description: episode.description || '',
        episodes: [episode]
      };
    }

    if (typeof window !== 'undefined' && window.history) {
      const showId = targetShow.id || targetShow.feedUrl || targetShow.title;
      window.history.pushState({ tab: 'podcasts', podcastShow: targetShow }, '', `#podcasts/${encodeURIComponent(showId)}`);
    }
    window.dispatchEvent(new CustomEvent('openPodcastShow', { detail: { show: targetShow } }));
  }, [changeTab]);

  const handleClearAllFavorites = useCallback(() => {
    if (window.confirm('Tüm favori radyolarınızı silmek istediğinize emin misiniz?')) {
      saveFavorites([]);
      setFavorites([]);
      showToast('Tüm favoriler temizlendi.');
    }
  }, []);

  // Playlists Management
  const handleCreatePlaylist = useCallback((name: string, description?: string, initialStationUuid?: string) => {
    const newPlaylist: Playlist = {
      id: `p-${Date.now()}`,
      name,
      description,
      createdAt: Date.now(),
      stationUuids: initialStationUuid ? [initialStationUuid] : []
    };
    setPlaylists((prev) => {
      const updated = [...prev, newPlaylist];
      savePlaylists(updated);
      return updated;
    });
    showToast(`"${name}" listesi oluşturuldu.`);
  }, []);

  const handleDeletePlaylist = useCallback((id: string) => {
    setPlaylists((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      savePlaylists(updated);
      return updated;
    });
    showToast('Çalma listesi silindi.');
  }, []);

  const handleAddToPlaylist = useCallback((playlistId: string, stationUuid: string) => {
    setPlaylists((prev) => {
      const updated = prev.map((p) => {
        if (p.id === playlistId) {
          if (!p.stationUuids.includes(stationUuid)) {
            return { ...p, stationUuids: [...p.stationUuids, stationUuid] };
          }
        }
        return p;
      });
      savePlaylists(updated);
      return updated;
    });
  }, []);

  const handleRemoveFromPlaylist = useCallback((playlistId: string, stationUuid: string) => {
    setPlaylists((prev) => {
      const updated = prev.map((p) => {
        if (p.id === playlistId) {
          return { ...p, stationUuids: p.stationUuids.filter((id) => id !== stationUuid) };
        }
        return p;
      });
      savePlaylists(updated);
      return updated;
    });
  }, []);

  // Sleep Timer Countdown Effect
  const handleStartSleepTimer = (minutes: number) => {
    audioEngine.startSleepTimer(minutes, () => {
      showToast('Uyku zamanlayıcısı süresi doldu. Ses durduruldu.');
    });
    setSleepOnEpisodeEnd(false);
    showToast(`Yayın ${minutes} dakika sonra durdurulacak.`);
  };

  const handleCancelSleepTimer = () => {
    audioEngine.cancelSleepTimer();
    setSleepTimerSeconds(null);
    setSleepOnEpisodeEnd(false);
    setIsFadingOut(false);
    showToast('Uyku zamanlayıcısı iptal edildi.');
  };

  const handleAddSleepMinutes = (extraMinutes: number) => {
    const currentRemaining = audioEngine.getSleepTimerRemainingSec();
    const newTotalMinutes = Math.ceil(currentRemaining / 60) + extraMinutes;
    audioEngine.startSleepTimer(newTotalMinutes, () => {
      showToast('Uyku zamanlayıcısı süresi doldu. Ses durduruldu.');
    });
    showToast(`Zamanlayıcıya +${extraMinutes} dakika eklendi.`);
  };

  const handleSetEndOfEpisodeTimer = useCallback(() => {
    setSleepOnEpisodeEnd(true);
    audioEngine.cancelSleepTimer();
    setSleepTimerSeconds(null);
    setIsFadingOut(false);
    showToast('Uyku Zamanlayıcısı: Bölüm sonunda durdurulacak.');
  }, []);

  // Reset All Storage Data
  const handleResetAllData = () => {
    if (window.confirm('Tüm favoriler, çalma listeleri ve ayarlar sıfırlanacak. Onaylıyor musunuz?')) {
      localStorage.clear();
      setFavorites([]);
      setPlaylists(getStoredPlaylists());
      setSettings(getStoredSettings());
      showToast('Tüm uygulama verileri varsayılana sıfırlandı.');
    }
  };

  // Determine Palette background classes
  const getPaletteBg = (palette: ThemePalette, mode: AppThemeMode) => {
    if (mode === 'light') {
      return 'bg-slate-50 text-slate-900';
    }
    switch (palette) {
      case 'pure-carbon': return 'bg-black text-zinc-100';
      case 'neon-ocean': return 'bg-slate-950 text-slate-100';
      case 'cyber-orchid': return 'bg-stone-950 text-stone-100';
      case 'cosmic-slate': return 'bg-emerald-950/40 text-emerald-100';
      default: return 'bg-zinc-950 text-zinc-100';
    }
  };

  const currentStation = currentItem?.type === 'radio' ? (currentItem.radio || null) : null;
  const currentPlayingName = currentItem?.type === 'podcast'
    ? currentItem.podcastEpisode?.title
    : currentItem?.type === 'audiobook'
    ? currentItem.audiobookTrack?.track.title
    : currentItem?.radio?.name;

  return (
    <div className={`h-screen max-h-screen flex flex-col font-sans ${getPaletteBg(settings.themePalette, settings.themeMode)} antialiased selection:bg-amber-500 selection:text-zinc-950 overflow-hidden`}>
      {/* Desktop Top Titlebar & Header */}
      <DesktopHeader
        searchQuery={searchQuery}
        setSearchQuery={(q) => {
          setSearchQuery(q);
        }}
        selectedCountry={selectedCountry}
        setSelectedCountry={handleCountryChange}
        themeMode={settings.themeMode}
        setThemeMode={(m) => updateSettings({ themeMode: m })}
        themePalette={settings.themePalette}
        setThemePalette={(p) => updateSettings({ themePalette: p })}
        lowDataMode={settings.lowDataMode}
        setLowDataMode={(val) => updateSettings({ lowDataMode: val })}
        activeTab={activeTab}
        onNavigateToDiscover={() => {
          setSelectedCategory('');
          setSearchQuery('');
          changeTab('discover');
        }}
        onNavigateToSearch={(q, type) => {
          setSearchQuery(q);
          if (type) setSearchTabType(type);
          setActiveTab('search');
          if (typeof window !== 'undefined' && window.history) {
            try {
              window.history.pushState(
                { tab: 'search', q, type: type || 'all' },
                '',
                `#search?q=${encodeURIComponent(q)}${type ? `&type=${type}` : ''}`
              );
            } catch {}
          }
        }}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onPlayStation={handlePlayStation}
        onPlayPodcastEpisode={handlePlayPodcastEpisode}
        onOpenPodcastShow={handleOpenPodcastShowFromFav}
        locale={settings.locale || 'tr'}
        onSelectLocale={(loc) => updateSettings({ locale: loc })}
      />

      {/* TuneIn & SoundCloud Sticky Top Player Bar */}
      <PlayerBar
        currentItem={currentItem}
        status={playbackStatus}
        retryCount={retryCount}
        volume={volume}
        isMuted={isMuted}
        onPlayPause={handlePlayPause}
        onStop={handleStop}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onVolumeChange={handleVolumeChange}
        onToggleMute={handleToggleMute}
        isFavorite={
          currentItem?.type === 'podcast' && currentItem.podcastEpisode
            ? favorites.some((f) => f.stationuuid === `podcast-${currentItem.podcastEpisode?.id}`)
            : currentStation
            ? favorites.some((f) => (f.id || f.stationuuid) === (currentStation.id || currentStation.stationuuid))
            : false
        }
        onToggleFavorite={handleToggleFavorite}
        playlists={playlists}
        onAddToPlaylist={handleAddToPlaylist}
        onCreatePlaylist={handleCreatePlaylist}
        sleepTimerSeconds={sleepTimerSeconds}
        onOpenSleepTimer={() => setIsSleepModalOpen(true)}
        lowDataMode={settings.lowDataMode}
        themePalette={settings.themePalette}
        onNavigateToDiscover={() => changeTab('discover')}
        onNavigateToPodcastShow={handleNavigateToPodcastShow}
        onOpenBigScreen={() => setIsBigScreenOpen(true)}
        reconnectState={reconnectState}
      />

      {/* Main Body: Sidebar + Active View Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            changeTab(tab);
            if (tab === 'discover' && searchQuery) setSearchQuery('');
          }}
          favoritesCount={favorites.length}
          playlistsCount={playlists.length}
          currentlyPlayingName={playbackStatus === 'playing' ? currentPlayingName : undefined}
          onSelectQuickFilter={(filter) => {
            setQuickFilter(filter);
            setSelectedCategory('all');
            setSearchQuery('');
          }}
          onOpenBigScreen={() => setIsBigScreenOpen(true)}
        />

        {/* Main Content Scrollable Workspace */}
        <main ref={mainRef} className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 pb-64 md:pb-48">
          {/* Offline Warning Banner */}
          {!isOnline && (
            <div className="mb-4 p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-600 dark:text-amber-300 text-xs font-bold flex flex-wrap items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center space-x-2.5">
                <WifiOff className="w-5 h-5 text-amber-500 animate-pulse shrink-0" />
                <div>
                  <span className="block font-black text-sm text-zinc-900 dark:text-amber-300">İnternet Bağlantısı Kesildi — Çevrimdışı Mod</span>
                  <span className="font-normal text-[11px] text-zinc-600 dark:text-zinc-300">
                    Sadece cihazınıza önceden indirilmiş podcast bölümlerini kesintisiz dinleyebilirsiniz.
                  </span>
                </div>
              </div>
              <button
                onClick={() => changeTab('downloads')}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shrink-0 cursor-pointer shadow-sm active:scale-95 transition-all"
              >
                İndirilenler Sekmesine Git
              </button>
            </div>
          )}



          {/* Dedicated Full Search Results View */}
          <div className={activeTab === 'search' ? 'block' : 'hidden'}>
            <SearchResultsView
              initialQuery={searchQuery}
              initialType={searchTabType}
              onPlayStation={handlePlayStation}
              onPlayPodcastEpisode={handlePlayPodcastEpisode}
              onOpenPodcastShow={handleOpenPodcastShowFromFav}
              onToggleFavoriteStation={handleToggleFavorite}
              onToggleFavoritePodcast={handleToggleFavoritePodcast}
              favorites={favorites}
              favoritePodcasts={favoritePodcasts}
              currentStation={currentStation}
              currentEpisodeId={currentItem?.type === 'podcast' ? (currentItem.podcastEpisode?.id || null) : null}
              isPlaying={playbackStatus === 'playing'}
              playbackStatus={playbackStatus}
              playlists={playlists}
              onAddToPlaylist={handleAddToPlaylist}
              themePalette={settings.themePalette}
              onUpdateQuery={(newQ) => {
                setSearchQuery(newQ);
                if (typeof window !== 'undefined' && window.history && newQ) {
                  try {
                    window.history.replaceState(
                      { tab: 'search', q: newQ, type: searchTabType },
                      '',
                      `#search?q=${encodeURIComponent(newQ)}${searchTabType !== 'all' ? `&type=${searchTabType}` : ''}`
                    );
                  } catch {}
                }
              }}
            />
          </div>

          <div className={activeTab === 'discover' ? 'block' : 'hidden'}>
            <DiscoverView
              stations={filteredStations}
              isLoading={isLoading}
              isLoadingMore={isLoadingMore}
              hasMore={hasMore}
              onLoadMore={handleLoadMore}
              selectedCategory={selectedCategory}
              setSelectedCategory={(catId) => {
                setSelectedCategory(catId);
                setQuickFilter('all');
                setSearchQuery('');
              }}
              selectedGroup={selectedGroup}
              setSelectedGroup={(groupId) => {
                setSelectedGroup(groupId);
                setQuickFilter('all');
                setSearchQuery('');
              }}
              selectedCountry={selectedCountry}
              setSelectedCountry={handleCountryChange}
              currentStation={currentStation}
              isPlaying={playbackStatus === 'playing'}
              playbackStatus={playbackStatus}
              favorites={favorites}
              onPlayStation={handlePlayStation}
              onToggleFavorite={handleToggleFavorite}
              playlists={playlists}
              onAddToPlaylist={handleAddToPlaylist}
              onRefresh={() => fetchStationsData(1, false)}
              searchQuery={searchQuery}
              onNavigateToRadios={() => changeTab('radios')}
              onNavigateToPodcasts={() => changeTab('podcasts')}
              onOpenPodcastShow={handleOpenPodcastShowFromFav}
            />
          </div>

          {/* Full Radios & Countries View */}
          <div className={activeTab === 'radios' ? 'block' : 'hidden'}>
            <CountriesView
              selectedCountry={selectedCountry}
              onSelectCountry={handleCountryChange}
              stations={filteredStations}
              isLoading={isLoading}
              isLoadingMore={isLoadingMore}
              hasMore={hasMore}
              onLoadMore={handleLoadMore}
              onPlayStation={handlePlayStation}
              onToggleFavorite={handleToggleFavorite}
              favorites={favorites}
              currentStation={currentStation}
              isPlaying={playbackStatus === 'playing'}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
          </div>

          {/* Listening History View */}
          <div className={activeTab === 'history' ? 'block' : 'hidden'}>
            <HistoryView
              onPlayStation={handlePlayStation}
              onPlayPodcastEpisode={handlePlayPodcastEpisode}
              currentStation={currentStation}
              isPlaying={playbackStatus === 'playing'}
            />
          </div>

          <div className={activeTab === 'podcasts' ? 'block' : 'hidden'}>
            <PodcastView
              currentEpisodeId={currentItem?.type === 'podcast' ? (currentItem.podcastEpisode?.id || null) : null}
              isPlaying={playbackStatus === 'playing'}
              onPlayEpisode={handlePlayPodcastEpisode}
              favoritePodcasts={favoritePodcasts}
              favoriteEpisodes={favoriteEpisodes}
              onToggleFavoritePodcast={handleToggleFavoritePodcast}
              onToggleFavoriteEpisode={handleToggleFavoriteEpisode}
            />
          </div>

          <div className={activeTab === 'downloads' ? 'block' : 'hidden'}>
            <DownloadsView
              onPlayEpisode={handlePlayPodcastEpisode}
              onNavigateToPodcasts={() => changeTab('podcasts')}
            />
          </div>

          <div className={activeTab === 'favorites' ? 'block' : 'hidden'}>
            <FavoritesView
              favorites={favorites}
              favoritePodcasts={favoritePodcasts}
              favoriteEpisodes={favoriteEpisodes}
              currentStation={currentStation}
              currentEpisodeId={currentItem?.type === 'podcast' ? (currentItem.podcastEpisode?.id || null) : null}
              isPlaying={playbackStatus === 'playing'}
              playbackStatus={playbackStatus}
              onPlayStation={handlePlayStation}
              onPlayPodcastEpisode={handlePlayPodcastEpisode}
              onToggleFavorite={handleToggleFavorite}
              onToggleFavoritePodcast={handleToggleFavoritePodcast}
              onToggleFavoriteEpisode={handleToggleFavoriteEpisode}
              playlists={playlists}
              onAddToPlaylist={handleAddToPlaylist}
              onClearAllFavorites={handleClearAllFavorites}
              onOpenPodcastShow={handleOpenPodcastShowFromFav}
            />
          </div>

          <div className={activeTab === 'playlists' ? 'block' : 'hidden'}>
            <PlaylistsView
              playlists={playlists}
              allStations={stations}
              favorites={favorites}
              currentStation={currentStation}
              isPlaying={playbackStatus === 'playing'}
              playbackStatus={playbackStatus}
              onPlayStation={handlePlayStation}
              onToggleFavorite={handleToggleFavorite}
              onCreatePlaylist={handleCreatePlaylist}
              onDeletePlaylist={handleDeletePlaylist}
              onRemoveFromPlaylist={handleRemoveFromPlaylist}
              onAddToPlaylist={handleAddToPlaylist}
            />
          </div>

          <div className={activeTab === 'countries' ? 'block' : 'hidden'}>
            <CountriesView
              selectedCountry={selectedCountry}
              onSelectCountry={handleCountryChange}
              stations={filteredStations}
              isLoading={isLoading}
              isLoadingMore={isLoadingMore}
              hasMore={hasMore}
              onLoadMore={handleLoadMore}
              onPlayStation={handlePlayStation}
              onToggleFavorite={handleToggleFavorite}
              favorites={favorites}
              currentStation={currentStation}
              isPlaying={playbackStatus === 'playing'}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
          </div>

          <div className={activeTab === 'settings' ? 'block' : 'hidden'}>
            <SettingsView
              settings={settings}
              onUpdateSettings={updateSettings}
              onResetAllData={handleResetAllData}
              onNavigate={changeTab}
              onOpenIOSGuide={() => setIsIOSModalOpen(true)}
              onInstallPWA={handleInstallPWA}
              isIOS={isIOS}
              isStandalone={isStandalone}
              hasDeferredPrompt={!!deferredPrompt}
            />
          </div>

          {['copyright', 'dmca', 'takedown', 'counter-notice', 'privacy', 'terms', 'content-policy'].includes(activeTab) && (
            <div className="block">
              <LegalView
                currentPage={activeTab as LegalPageType}
                onNavigate={(tab) => changeTab(tab)}
              />
            </div>
          )}
        </main>
      </div>

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-20 right-6 bg-slate-900 border border-purple-500/60 text-purple-200 text-xs px-4 py-2.5 rounded-2xl shadow-2xl z-50 animate-bounce flex items-center space-x-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Touch-optimized Mobile Bottom Navigation */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={(tab) => changeTab(tab)}
        favoritesCount={favorites.length}
        playlistsCount={playlists.length}
        lowDataMode={settings.lowDataMode}
        setLowDataMode={(val) => updateSettings({ lowDataMode: val })}
        currentlyPlayingName={playbackStatus === 'playing' ? currentPlayingName : undefined}
      />

      {/* Sleep Timer Modal */}
      <SleepTimerModal
        isOpen={isSleepModalOpen}
        onClose={() => setIsSleepModalOpen(false)}
        activeTimerSeconds={sleepTimerSeconds}
        onStartTimer={handleStartSleepTimer}
        onCancelTimer={handleCancelSleepTimer}
        onAddMinutes={handleAddSleepMinutes}
        isFadingOut={isFadingOut}
        isPodcast={currentItem?.type === 'podcast'}
        sleepOnEpisodeEnd={sleepOnEpisodeEnd}
        onSetEndOfEpisodeTimer={handleSetEndOfEpisodeTimer}
      />

      {/* Big Screen Modal */}
      <BigScreenModal
        isOpen={isBigScreenOpen}
        onClose={() => setIsBigScreenOpen(false)}
        currentItem={currentItem}
        status={playbackStatus}
        locale={settings.locale || 'tr'}
        clock24h={settings.clock24h ?? true}
      />

      {/* Global Search Modal (Cmd+K) */}
      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onPlayStation={handlePlayStation}
        onPlayPodcastEpisode={handlePlayPodcastEpisode}
        onSelectCountry={(countryCode) => {
          handleCountryChange(countryCode);
          setSearchQuery('');
          changeTab('discover');
        }}
      />

      {/* iOS Safari PWA Installation Guide Modal */}
      <IOSInstallGuideModal
        isOpen={isIOSModalOpen}
        onClose={() => setIsIOSModalOpen(false)}
      />
    </div>
  );
}
