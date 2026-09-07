import React, { memo } from 'react';
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

export const Sidebar: React.FC<SidebarProps> = memo(({
  activeTab,
  setActiveTab,
  favoritesCount,
  playlistsCount,
  currentlyPlayingName,
  onSelectQuickFilter
}) => {
  const mainNavItems = [
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
      description: 'Türkçe Popüler Seriler'
    },
    {
      id: 'countries',
      label: 'Dünya Radyoları',
      icon: Globe2,
      description: 'Ülkelere Göre Keşfet'
    }
  ];

  const libraryNavItems = [
    {
      id: 'favorites',
      label: 'Favorilerim',
      icon: Heart,
      count: favoritesCount,
      description: 'Beğendiğin İstasyonlar'
    },
    {
      id: 'playlists',
      label: 'Çalma Listelerim',
      icon: ListMusic,
      count: playlistsCount,
      description: 'Özel Radyo Listelerin'
    },
    {
      id: 'downloads',
      label: 'İndirilenler',
      icon: FolderDown,
      description: 'Çevrimdışı Bölümler'
    },
    {
      id: 'settings',
      label: 'Ayarlar',
      icon: Settings,
      description: 'Görünüm & Tercihler'
    }
  ];

  return (
    <aside className="hidden md:flex w-60 bg-[#0c0d10] dark:bg-[#0c0d10] border-r border-zinc-200/60 dark:border-white/[0.06] flex-col justify-between shrink-0 p-3.5 select-none transition-colors">
      {/* Navigation Links */}
      <div className="space-y-6">
        {/* Main Section */}
        <div>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-3">
            Menü
          </span>
          <nav className="mt-2 space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer group ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-emerald-400' : 'text-zinc-400 group-hover:text-white'
                    }`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Library Section */}
        <div>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-3">
            Kitaplığım
          </span>
          <nav className="mt-2 space-y-1">
            {libraryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer group ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-emerald-400' : 'text-zinc-400 group-hover:text-white'
                    }`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono shrink-0 ml-1 ${
                      isActive 
                        ? 'bg-emerald-500 text-zinc-950' 
                        : 'bg-white/10 text-zinc-300'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Highlights */}
        <div>
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-3">
            Hızlı Filtreler
          </span>
          <div className="mt-2 space-y-1">
            <button
              onClick={() => {
                setActiveTab('discover');
                onSelectQuickFilter?.('popular');
              }}
              className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>En Çok Dinlenenler</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('discover');
                onSelectQuickFilter?.('aac');
              }}
              className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Yüksek Kalite (HD)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Currently Playing Card */}
      {currentlyPlayingName ? (
        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
          <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1">
            <Radio className="w-3 h-3 animate-spin text-emerald-400" />
            <span>Şu An Çalıyor</span>
          </div>
          <p className="text-xs font-semibold text-white truncate">
            {currentlyPlayingName}
          </p>
        </div>
      ) : (
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-zinc-400 text-center text-xs">
          <p className="font-semibold text-zinc-300">RadioCast</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Kesintisiz Canlı Yayın</p>
        </div>
      )}
    </aside>
  );
});
