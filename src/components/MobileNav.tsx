import React, { useState } from 'react';
import { 
  Compass, 
  Search,
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
  Sparkles,
  FolderDown
} from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  favoritesCount: number;
  playlistsCount: number;
  lowDataMode: boolean;
  setLowDataMode: (val: boolean) => void;
  currentlyPlayingName?: string;
  onOpenSearch?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = React.memo(({
  activeTab,
  setActiveTab,
  favoritesCount,
  playlistsCount,
  lowDataMode,
  setLowDataMode,
  currentlyPlayingName,
  onOpenSearch
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const mainTabs = [
    { id: 'discover', label: 'Keşfet', icon: Compass },
    { id: 'search', label: 'Ara', icon: Search },
    { id: 'podcasts', label: 'Podcast', icon: Mic },
    { id: 'favorites', label: 'Favoriler', icon: Heart, count: favoritesCount },
  ];

  const drawerItems = [
    { id: 'countries', label: 'Dünya Radyoları', icon: Globe2, desc: 'Ülkelere göre canlı radyo keşfet' },
    { id: 'downloads', label: 'İndirilen Podcast’ler', icon: FolderDown, desc: 'Çevrimdışı internetsiz dinle' },
    { id: 'playlists', label: 'Çalma Listelerim', icon: ListMusic, count: playlistsCount, desc: 'Özel radyo listelerin' },
    { id: 'settings', label: 'Ayarlar & İletişim', icon: Settings, desc: 'Tema, ses & LinkedIn iletişim' },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation Bar (Visible only on < md screens) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0D1219]/95 backdrop-blur-lg border-t border-slate-200 dark:border-[#1E2836] px-2 py-1.5 flex items-center justify-around shadow-2xl pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] transition-colors">
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'search' && onOpenSearch) {
                  onOpenSearch();
                } else {
                  setActiveTab(tab.id);
                }
                setIsMenuOpen(false);
              }}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl min-w-[56px] min-h-[44px] transition-all relative active:scale-95 cursor-pointer ${
                isActive ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-teal-600 dark:text-teal-400 scale-110' : 'text-slate-400 dark:text-zinc-400'}`} />
              </div>
              <span className="text-[10px] mt-1 tracking-tight leading-none">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 rounded-full bg-teal-600 dark:bg-teal-400 shadow-sm shadow-teal-500/50" />
              )}
            </button>
          );
        })}

        {/* Menu/More Button */}
        <button
          onClick={() => setIsMenuOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl min-w-[56px] min-h-[44px] transition-all active:scale-95 cursor-pointer ${
            isMenuOpen || ['playlists', 'settings', 'countries', 'history'].includes(activeTab)
              ? 'text-teal-600 dark:text-teal-400 font-bold'
              : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
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
            className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-sm bg-white dark:bg-[#0D1219] border-l border-slate-200 dark:border-[#1E2836] h-full p-5 flex flex-col justify-between shadow-2xl z-10">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#1E2836]">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-600 dark:text-teal-400 font-bold">
                    <Radio className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">RadioCast</h3>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400">Tüm Uygulama Menüsü</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-[#131B24] text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Menu Items */}
              <div className="mt-4 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-2">
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
                      className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-500/40 font-semibold'
                          : 'bg-slate-50 dark:bg-[#131B24] hover:bg-slate-100 dark:hover:bg-[#182330] text-slate-800 dark:text-zinc-300 border border-slate-200 dark:border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-5 h-5 ${isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-zinc-500'}`} />
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-zinc-100">{item.label}</div>
                          <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-normal">{item.desc}</div>
                        </div>
                      </div>
                      {item.count !== undefined && item.count > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300">
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Quick Preferences */}
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-[#1E2836]">
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-2">
                  Bağlantı Modu
                </span>
                <button
                  onClick={() => setLowDataMode(!lowDataMode)}
                  className="mt-2 w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-[#131B24] border border-slate-200 dark:border-[#1F2937] text-xs text-slate-800 dark:text-zinc-200 cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5">
                    {lowDataMode ? <WifiOff className="w-4 h-4 text-amber-500" /> : <Wifi className="w-4 h-4 text-emerald-500" />}
                    <div className="text-left">
                      <div className="font-semibold text-xs">Düşük Veri Modu</div>
                      <div className="text-[10px] text-slate-500 dark:text-zinc-400">
                        {lowDataMode ? 'Açık (Mobil internet tasarrufu)' : 'Kapalı (Maksimum kalite)'}
                      </div>
                    </div>
                  </div>
                  <span className={`w-3 h-3 rounded-full ${lowDataMode ? 'bg-amber-500' : 'bg-slate-400 dark:bg-zinc-600'}`} />
                </button>
              </div>
            </div>

            {/* Currently Playing Status */}
            {currentlyPlayingName && (
              <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/30 text-teal-800 dark:text-teal-300 mt-4">
                <div className="flex items-center space-x-1.5 text-[10px] font-bold text-teal-600 dark:text-teal-400 mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Şu An Çalıyor</span>
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentlyPlayingName}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
});

