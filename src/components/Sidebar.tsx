import React, { memo } from 'react';
import { 
  Compass, 
  Radio, 
  Mic, 
  Heart, 
  Clock, 
  Settings,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  favoritesCount: number;
  playlistsCount?: number;
  currentlyPlayingName?: string;
  onSelectQuickFilter?: (filter: 'popular' | 'aac') => void;
  onOpenBigScreen?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = memo(({
  activeTab,
  setActiveTab,
  favoritesCount
}) => {
  const navItems = [
    {
      id: 'discover',
      label: 'Keşfet',
      icon: Compass
    },
    {
      id: 'radios',
      label: 'Radyolar',
      icon: Radio
    },
    {
      id: 'podcasts',
      label: 'Podcastler',
      icon: Mic
    },
    {
      id: 'favorites',
      label: 'Favoriler',
      icon: Heart,
      count: favoritesCount
    },
    {
      id: 'history',
      label: 'Geçmiş',
      icon: Clock
    },
    {
      id: 'settings',
      label: 'Ayarlar',
      icon: Settings
    }
  ];

  return (
    <aside className="hidden md:flex w-56 lg:w-60 bg-white dark:bg-[#0B0E14] border-r border-slate-200 dark:border-[#161F2B] flex-col justify-between shrink-0 p-4 select-none transition-colors">
      <div>
        {/* Logo / Brand Header */}
        <div 
          onClick={() => setActiveTab('discover')}
          className="flex items-center space-x-2.5 px-3 py-2 cursor-pointer group mb-6"
        >
          <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:bg-teal-500/25 transition-colors">
            <Radio className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
            RadioCast
          </span>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer group ${
                  isActive
                    ? 'bg-teal-50 dark:bg-[#0E2A2E] text-teal-700 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-500/20 shadow-sm'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
                    isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-zinc-400 group-hover:text-slate-700 dark:group-hover:text-zinc-200'
                  }`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300' : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-zinc-400'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Branding */}
      <div className="pt-4 border-t border-slate-200 dark:border-[#161F2B] px-3">
        <h4 className="font-bold text-xs text-slate-900 dark:text-white">RadioCast</h4>
        <p className="text-[11px] text-slate-500 dark:text-zinc-500 mt-0.5">Radyo & Podcast</p>
      </div>
    </aside>
  );
});
