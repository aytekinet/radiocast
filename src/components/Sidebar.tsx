import React from 'react';
import { 
  Compass, 
  Heart, 
  ListMusic, 
  Globe2, 
  Settings, 
  Radio, 
  Sparkles,
  Zap,
  Mic,
  FolderDown
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  favoritesCount: number;
  playlistsCount: number;
  currentlyPlayingName?: string;
  onSelectQuickFilter?: (filter: 'popular' | 'aac') => void;
}

export const Sidebar: React.FC<SidebarProps> = React.memo(({
  activeTab,
  setActiveTab,
  favoritesCount,
  playlistsCount,
  currentlyPlayingName,
  onSelectQuickFilter
}) => {
  const navItems = [
    {
      id: 'discover',
      label: 'Keşfet',
      icon: Compass,
      description: 'Canlı Radyolar & Türler'
    },
    {
      id: 'podcasts',
      label: 'Podcast’ler',
      icon: Mic,
      description: 'Türkçe Popüler Podcastler'
    },
    {
      id: 'downloads',
      label: 'İndirilenler',
      icon: FolderDown,
      description: 'Çevrimdışı Podcast Arşivi'
    },
    {
      id: 'favorites',
      label: 'Favorilerim',
      icon: Heart,
      count: favoritesCount,
      description: 'Favori Radyoların'
    },
    {
      id: 'playlists',
      label: 'Çalma Listelerim',
      icon: ListMusic,
      count: playlistsCount,
      description: 'Özel Radyo Listelerin'
    },
    {
      id: 'countries',
      label: 'Ülkeler',
      icon: Globe2,
      description: 'Dünya Radyoları'
    },
    {
      id: 'settings',
      label: 'Ayarlar',
      icon: Settings,
      description: 'Tema & İletişim'
    }
  ];

  return (
    <aside className="hidden md:flex w-60 bg-white dark:bg-zinc-900/90 border-r border-zinc-200 dark:border-zinc-800/80 flex-col justify-between shrink-0 p-3 select-none transition-colors">
      {/* Upper Navigation Links */}
      <div className="space-y-6">
        {/* Navigation Category Header */}
        <div>
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-3">
            Gezinti
          </span>
          <nav className="mt-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-amber-500' : 'text-zinc-400 dark:text-zinc-500'
                    }`} />
                    <div className="text-left truncate">
                      <div className="leading-none truncate">{item.label}</div>
                      <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 leading-none font-normal truncate">
                        {item.description}
                      </div>
                    </div>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono shrink-0 ml-1 ${
                      isActive 
                        ? 'bg-amber-500 text-zinc-950' 
                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Filters / Highlights */}
        <div>
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-3">
            Hızlı Erişim
          </span>
          <div className="mt-2 space-y-1">
            <button
              onClick={() => {
                setActiveTab('discover');
                onSelectQuickFilter?.('popular');
              }}
              className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>En Çok Dinlenenler</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('discover');
                onSelectQuickFilter?.('aac');
              }}
              className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Yüksek Kalite (AAC)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lower Status Box */}
      {currentlyPlayingName ? (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300">
          <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider text-amber-500 mb-1">
            <Radio className="w-3 h-3 animate-spin text-amber-500" />
            <span>Şu An Çalıyor</span>
          </div>
          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
            {currentlyPlayingName}
          </p>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 text-center text-xs">
          <p className="font-medium text-zinc-700 dark:text-zinc-300">RadioCast</p>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">Kesintisiz Canlı Yayınlar</p>
        </div>
      )}
    </aside>
  );
});

