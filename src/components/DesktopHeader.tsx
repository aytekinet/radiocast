import React, { useState, useRef, useEffect } from 'react';
import { 
  Radio, 
  Search, 
  Globe2, 
  Wifi, 
  WifiOff, 
  Palette, 
  Moon, 
  Sun, 
  X,
  Check
} from 'lucide-react';
import { AppThemeMode, ThemePalette } from '../types';
import { POPULAR_COUNTRIES } from '../constants/categories';

interface DesktopHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCountry: string;
  setSelectedCountry: (code: string) => void;
  themeMode: AppThemeMode;
  setThemeMode: (mode: AppThemeMode) => void;
  themePalette: ThemePalette;
  setThemePalette: (palette: ThemePalette) => void;
  lowDataMode: boolean;
  setLowDataMode: (val: boolean) => void;
  activeTab: string;
}

export const DesktopHeader: React.FC<DesktopHeaderProps> = React.memo(({
  searchQuery,
  setSearchQuery,
  selectedCountry,
  setSelectedCountry,
  themeMode,
  setThemeMode,
  themePalette,
  setThemePalette,
  lowDataMode,
  setLowDataMode,
}) => {
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const paletteRef = useRef<HTMLDivElement>(null);

  // Close palette dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (paletteRef.current && !paletteRef.current.contains(event.target as Node)) {
        setIsPaletteOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const palettes: { id: ThemePalette; name: string; color: string }[] = [
    { id: 'pure-carbon', name: 'Pure Carbon', color: 'bg-zinc-900 border-zinc-700' },
    { id: 'neon-ocean', name: 'Slate Minimal', color: 'bg-slate-700' },
    { id: 'cyber-orchid', name: 'Warm Amber', color: 'bg-amber-500' },
    { id: 'cosmic-slate', name: 'Midnight Emerald', color: 'bg-emerald-600' },
  ];

  return (
    <header className="flex flex-wrap items-center justify-between px-3 sm:px-4 py-2 border-b border-zinc-200 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-900/90 backdrop-blur-md select-none shrink-0 gap-2 z-40 transition-colors">
      {/* Title & App Branding */}
      <div className="flex items-center space-x-2.5">
        <div className="p-1.5 rounded-xl bg-amber-500 text-zinc-950 font-bold shadow-md">
          <Radio className="w-5 h-5 animate-pulse text-zinc-950" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-black text-base tracking-wide text-zinc-900 dark:text-zinc-100">
              RadioCast
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-mono font-bold">
              CANLI
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 leading-none">30.000+ Canlı Radyo & Podcast</p>
        </div>
      </div>

      {/* Center Live Search Bar */}
      <div className="flex-1 max-w-md mx-2 min-w-[180px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Radyo, podcast, frekans veya tür ara..."
            className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 border border-zinc-200 dark:border-zinc-700/70 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right Controls: Country Selector, Low Data Mode, Palette Selector, Dark/Light */}
      <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs">
        {/* Country Quick Switcher */}
        <div className="relative hidden sm:flex items-center">
          <Globe2 className="w-3.5 h-3.5 text-zinc-400 absolute left-2 pointer-events-none" />
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="pl-7 pr-3 py-1.5 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800/90 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700/70 focus:outline-none focus:border-amber-500 appearance-none cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <option value="">Tüm Ülkeler</option>
            {POPULAR_COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Low Data Mode Toggle Button */}
        <button
          onClick={() => setLowDataMode(!lowDataMode)}
          title={lowDataMode ? 'Düşük Veri Modu Açık' : 'Düşük Veri Modunu Aç'}
          className={`px-2 py-1.5 rounded-xl border flex items-center space-x-1 transition-all ${
            lowDataMode
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-600 dark:text-amber-300 font-semibold'
              : 'bg-zinc-100 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700/70 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800'
          }`}
        >
          {lowDataMode ? <WifiOff className="w-3.5 h-3.5 text-amber-500" /> : <Wifi className="w-3.5 h-3.5 text-emerald-500" />}
          <span className="hidden md:inline font-medium text-[11px]">
            {lowDataMode ? 'Tasarruf' : 'Normal'}
          </span>
        </button>

        {/* Theme Palette Click Popover */}
        <div className="relative" ref={paletteRef}>
          <button
            onClick={() => setIsPaletteOpen(!isPaletteOpen)}
            title="Renk Temasını Değiştir"
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border flex items-center space-x-1.5 transition-all active:scale-95 ${
              isPaletteOpen
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-600 dark:text-amber-300'
                : 'bg-zinc-100 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700/70 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden lg:inline text-[11px] font-medium">Tema</span>
          </button>

          {isPaletteOpen && (
            <div className="absolute right-0 top-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl p-2.5 w-44 space-y-1.5 z-50 animate-fadeIn">
              <span className="text-[10px] text-zinc-400 font-bold px-2 uppercase tracking-wider block">
                Tema Paleti
              </span>
              {palettes.map((p) => {
                const isActive = themePalette === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setThemePalette(p.id);
                      setIsPaletteOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition-all ${
                      isActive
                        ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 font-bold border border-amber-500/30'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className={`w-3 h-3 rounded-full ${p.color}`} />
                      <span>{p.name}</span>
                    </div>
                    {isActive && <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Dark/Light Mode Direct Switcher */}
        <button
          onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
          title={themeMode === 'dark' ? 'Gündüz Moduna Geç' : 'Gece Moduna Geç'}
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/70 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center space-x-1.5 transition-all active:scale-95"
        >
          {themeMode === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline text-[11px] font-medium">Gündüz</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-zinc-800" />
              <span className="hidden lg:inline text-[11px] font-medium">Gece</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
});

