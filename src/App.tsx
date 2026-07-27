/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { RadioStation, Playlist, AppSettings, ThemePalette, AppThemeMode, PodcastEpisode, PlayableItem } from './types';
import { 
  getTopStationsByCountry, 
  getStationsByTag, 
  searchStations 
} from './services/radioApi';
import { matchesCategory } from './constants/categories';
import { VERIFIED_TURKISH_STATIONS } from './data/fallbackStations';
import { audioEngine, PlaybackStatus } from './services/audioEngine';
import { 
  getStoredFavorites, 
  toggleFavoriteStation, 
  getStoredPlaylists, 
  savePlaylists, 
  getStoredSettings, 
  saveSettings, 
  saveFavorites 
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
import { SleepTimerModal } from './components/SleepTimerModal';

export default function App() {
  // Navigation & Settings
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace('#', '');
      const validTabs = ['discover', 'podcasts', 'favorites', 'playlists', 'countries', 'settings'];
      if (validTabs.includes(hash)) return hash;
    }
    return 'discover';
  });

  const [settings, setSettings] = useState<AppSettings>(() => getStoredSettings());
  const [favorites, setFavorites] = useState<RadioStation[]>(() => getStoredFavorites());
  const [playlists, setPlaylists] = useState<Playlist[]>(() => getStoredPlaylists());

  // History & Tab Navigation
  const changeTab = useCallback((newTab: string, pushHistory = true) => {
    setActiveTab(newTab);
    if (pushHistory && typeof window !== 'undefined' && window.history) {
      if (window.location.hash !== `#${newTab}`) {
        window.history.pushState({ tab: newTab }, '', `#${newTab}`);
      }
    }
  }, []);

  // Sync initial tab and listen to browser back/forward buttons (popstate)
  useEffect(() => {
    const validTabs = ['discover', 'podcasts', 'favorites', 'playlists', 'countries', 'settings'];
    const currentHash = window.location.hash.replace('#', '');
    const initialTab = validTabs.includes(currentHash) ? currentHash : 'discover';

    if (window.history && !window.history.state) {
      window.history.replaceState({ tab: initialTab }, '', `#${initialTab}`);
    }

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.tab && validTabs.includes(event.state.tab)) {
        setActiveTab(event.state.tab);
      } else {
        const hash = window.location.hash.replace('#', '');
        if (validTabs.includes(hash)) {
          setActiveTab(hash);
        } else {
          setActiveTab('discover');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('TR');
  const [quickFilter, setQuickFilter] = useState<'all' | 'popular' | 'aac'>('all');

  // Stations Data & Pagination
  const [stations, setStations] = useState<RadioStation[]>(() => VERIFIED_TURKISH_STATIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Filtered and sorted stations memo
  const filteredStations = useMemo(() => {
    let result = stations;

    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter((s) => matchesCategory(s, selectedCategory));
    }

    if (quickFilter === 'popular') {
      result = [...result].sort((a, b) => (b.votes || 0) - (a.votes || 0));
    } else if (quickFilter === 'aac') {
      const aacList = result.filter((s) => (s.codec || '').toLowerCase().includes('aac') || (s.bitrate || 0) >= 128);
      if (aacList.length > 0) result = aacList;
    }

    return result;
  }, [stations, selectedCategory, quickFilter]);

  // Audio Playback Engine State
  const [currentItem, setCurrentItem] = useState<PlayableItem | null>(null);
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>('idle');
  const [retryCount, setRetryCount] = useState(0);
  const [volume, setVolume] = useState(settings.volume);
  const [isMuted, setIsMuted] = useState(false);

  // Sleep Timer
  const [sleepTimerSeconds, setSleepTimerSeconds] = useState<number | null>(null);
  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);

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

  // Setup Audio Engine Callbacks
  useEffect(() => {
    audioEngine.setCallbacks({
      onStatusChange: (status) => setPlaybackStatus(status),
      onItemChange: (item) => setCurrentItem(item)
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

  // Load Radio Stations when filters or search change
  const fetchStationsData = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      let list: RadioStation[] = [];

      if (searchQuery.trim()) {
        list = await searchStations({
          name: searchQuery.trim(),
          countrycode: selectedCountry || undefined,
          page: pageNum
        });
      } else if (selectedCountry && selectedCountry !== 'TR') {
        list = await getTopStationsByCountry(selectedCountry, pageNum);
      } else if (selectedCategory && selectedCategory !== 'all') {
        list = await getStationsByTag(selectedCategory, selectedCountry || 'TR');
      } else {
        list = await getTopStationsByCountry('TR', pageNum);
      }

      if (list.length < 15) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      if (append) {
        setStations((prev) => {
          const existingUuids = new Set(prev.map((s) => s.stationuuid));
          const uniqueNew = list.filter((s) => !existingUuids.has(s.stationuuid));
          return [...prev, ...uniqueNew];
        });
      } else {
        setStations(list);
      }
    } catch (err) {
      console.error('Radio stations load error:', err);
      showToast('Radyo istasyonları yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [searchQuery, selectedCategory, selectedCountry]);

  // Reset pagination and reload on search/filter change
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    const timer = setTimeout(() => {
      fetchStationsData(1, false);
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchStationsData]);

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
  const handlePlayPodcastEpisode = useCallback((episode: PodcastEpisode) => {
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
  useEffect(() => {
    if (sleepTimerSeconds === null) return;

    if (sleepTimerSeconds <= 0) {
      audioEngine.stop();
      setSleepTimerSeconds(null);
      showToast('Uyku zamanlayıcısı doldu. Ses durduruldu.');
      return;
    }

    const interval = setInterval(() => {
      setSleepTimerSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerSeconds]);

  const handleStartSleepTimer = (minutes: number) => {
    setSleepTimerSeconds(minutes * 60);
    showToast(`Yayın ${minutes} dakika sonra durdurulacak.`);
  };

  const handleCancelSleepTimer = () => {
    setSleepTimerSeconds(null);
    showToast('Uyku zamanlayıcısı iptal edildi.');
  };

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
          if (q && activeTab !== 'discover') setActiveTab('discover');
        }}
        selectedCountry={selectedCountry}
        setSelectedCountry={(c) => {
          setSelectedCountry(c);
          setSelectedCategory('');
          if (activeTab !== 'discover') changeTab('discover');
        }}
        themeMode={settings.themeMode}
        setThemeMode={(m) => updateSettings({ themeMode: m })}
        themePalette={settings.themePalette}
        setThemePalette={(p) => updateSettings({ themePalette: p })}
        lowDataMode={settings.lowDataMode}
        setLowDataMode={(val) => updateSettings({ lowDataMode: val })}
        activeTab={activeTab}
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
        />

        {/* Main Content Scrollable Workspace */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 pb-36 md:pb-24">
          {activeTab === 'discover' && (
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
              selectedCountry={selectedCountry}
              setSelectedCountry={setSelectedCountry}
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
            />
          )}

          {activeTab === 'podcasts' && (
            <PodcastView
              currentEpisodeId={currentItem?.type === 'podcast' ? (currentItem.podcastEpisode?.id || null) : null}
              isPlaying={playbackStatus === 'playing'}
              onPlayEpisode={handlePlayPodcastEpisode}
            />
          )}

          {activeTab === 'favorites' && (
            <FavoritesView
              favorites={favorites}
              currentStation={currentStation}
              isPlaying={playbackStatus === 'playing'}
              playbackStatus={playbackStatus}
              onPlayStation={handlePlayStation}
              onToggleFavorite={handleToggleFavorite}
              playlists={playlists}
              onAddToPlaylist={handleAddToPlaylist}
              onClearAllFavorites={handleClearAllFavorites}
            />
          )}

          {activeTab === 'playlists' && (
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
          )}

          {activeTab === 'countries' && (
            <CountriesView
              onSelectCountry={(countryCode) => {
                setSelectedCountry(countryCode);
                setSelectedCategory('');
                setSearchQuery('');
                changeTab('discover');
              }}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={updateSettings}
              onResetAllData={handleResetAllData}
            />
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
      />
    </div>
  );
}
