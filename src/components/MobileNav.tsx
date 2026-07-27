import React, { useState } from 'react';
import { 
  Compass, 
  Heart, 
  Mic, 
  Globe2, 
  Menu, 
  ListMusic, 
  Settings, 
  X, 
  Radio, 
  Wifi, 
  WifiOff, 
  Sparkles 
} from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  favoritesCount: number;
  playlistsCount: number;
  lowDataMode: boolean;
  setLowDataMode: (val: boolean) => void;
  currentlyPlayingName?: string;
}

export const MobileNav: React.FC<MobileNavProps> = React.memo(({
  activeTab,
  setActiveTab,
  favoritesCount,
  playlistsCount,
  lowDataMode,
  setLowDataMode,
  currentlyPlayingName
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const mainTabs = [
    { id: 'discover', label: 'Keşfet', icon: Compass },
    { id: 'podcasts', label: 'Podcast', icon: Mic },
    { id: 'favorites', label: 'Favoriler', icon: Heart, count: favoritesCount },
    { id: 'countries', label: 'Ülkeler', icon: Globe2 },
  ];

  const drawerItems = [
    { id: 'playlists', label: 'Çalma Listelerim', icon: ListMusic, count: playlistsCount, desc: 'Özel radyo listelerin' },
    { id: 'settings', label: 'Ayarlar & İletişim', icon: Settings, desc: 'Tema, ses & LinkedIn iletişim' },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation Bar (Visible only on < md screens) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800/80 px-2 py-1.5 flex items-center justify-around shadow-2xl pb-[calc(0.5rem+env(safe-area-inset-bottom))] transition-colors">
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsMenuOpen(false);
              }}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl min-w-[56px] min-h-[44px] transition-all relative active:scale-95 ${
                isActive ? 'text-amber-500 font-bold' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-amber-500 scale-110' : 'text-zinc-500 dark:text-zinc-400'}`} />
              </div>
              <span className="text-[10px] mt-1 tracking-tight leading-none">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500" />
              )}
            </button>
          );
        })}

        {/* Menu/More Button */}
        <button
          onClick={() => setIsMenuOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl min-w-[56px] min-h-[44px] transition-all active:scale-95 ${
            isMenuOpen || ['playlists', 'settings'].includes(activeTab)
              ? 'text-amber-500 font-bold'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight leading-none">Menü</span>
        </button>
      </nav>

      {/* Slide-Over Drawer Modal for Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-sm bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 h-full p-5 flex flex-col justify-between shadow-2xl z-10">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-amber-500 text-zinc-950 font-bold">
                    <Radio className="w-5 h-5 text-zinc-950" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-white">RadioCast</h3>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Tüm Uygulama Menüsü</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Menu Items */}
              <div className="mt-4 space-y-2">
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider px-2">
                  Ekstra Bölümler
                </span>
                {drawerItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
                        isActive
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/40 font-semibold'
                          : 'bg-zinc-100 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-5 h-5 ${isActive ? 'text-amber-500' : 'text-zinc-400 dark:text-zinc-500'}`} />
                        <div>
                          <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{item.label}</div>
                          <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-normal">{item.desc}</div>
                        </div>
                      </div>
                      {item.count !== undefined && item.count > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-300">
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Quick Preferences */}
              <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800/80">
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider px-2">
                  Bağlantı Modu
                </span>
                <button
                  onClick={() => setLowDataMode(!lowDataMode)}
                  className="mt-2 w-full flex items-center justify-between p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200"
                >
                  <div className="flex items-center space-x-2.5">
                    {lowDataMode ? <WifiOff className="w-4 h-4 text-amber-500" /> : <Wifi className="w-4 h-4 text-emerald-500" />}
                    <div className="text-left">
                      <div className="font-semibold text-xs">Düşük Veri Modu</div>
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-400">
                        {lowDataMode ? 'Açık (Mobil internet tasarrufu)' : 'Kapalı (Maksimum kalite)'}
                      </div>
                    </div>
                  </div>
                  <span className={`w-3 h-3 rounded-full ${lowDataMode ? 'bg-amber-500' : 'bg-zinc-400 dark:bg-zinc-600'}`} />
                </button>
              </div>
            </div>

            {/* Currently Playing Status */}
            {currentlyPlayingName && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-300 mt-4">
                <div className="flex items-center space-x-1.5 text-[10px] font-bold text-amber-500 mb-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Şu An Çalıyor</span>
                </div>
                <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">{currentlyPlayingName}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
});

