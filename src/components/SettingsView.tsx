import React from 'react';
import { 
  Settings, 
  Palette, 
  Moon, 
  Sun, 
  Wifi, 
  Trash2, 
  Linkedin,
  ExternalLink
} from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onResetAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onResetAllData
}) => {
  const handleResetWithConfirm = () => {
    const isConfirmed = window.confirm(
      "Tüm favoriler, çalma listeleri ve uygulama ayarlarınız sıfırlanacaktır. Bu işlemi onaylıyor musunuz?"
    );
    if (isConfirmed) {
      onResetAllData();
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2.5">
          <Settings className="w-5 h-5 text-amber-500" />
          <span>Uygulama Ayarları</span>
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Görünüm, ses akış kalitesi ve geliştirici bilgilerini yapılandırın
        </p>
      </div>

      {/* Support & Copyright Contact Card (LinkedIn Profile) */}
      <div className="bg-white dark:bg-zinc-900/80 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-sm dark:shadow-lg transition-colors">
        <div className="flex items-center space-x-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
          <Linkedin className="w-4 h-4 text-blue-500" />
          <span>Geliştirici, Destek & Telif Hakları İletişimi</span>
        </div>
        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
          RadioCast, dünya genelindeki açık radyo dizinlerini ve kamuya açık canlı yayın akışlarını derleyen bağımsız bir radyo dinleme platformudur. Telif hakkı bildirimleri, yayın kaldırma talepleri, iş birlikleri veya görüş ve önerileriniz için LinkedIn profilim üzerinden doğrudan iletişime geçebilirsiniz.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <a
            href="https://www.linkedin.com/in/aytekin-tanrisever/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-md active:scale-95 text-xs shrink-0"
          >
            <Linkedin className="w-4 h-4 text-white fill-current" />
            <span>LinkedIn Profilim: Aytekin Tanrısever</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
        </div>
      </div>

      {/* Theme Palettes Section */}
      <div className="bg-white dark:bg-zinc-900/80 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm dark:shadow-md transition-colors">
        <div className="flex items-center space-x-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
          <Palette className="w-4 h-4 text-amber-500" />
          <span>Tema & Renk Paletleri</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Pure Carbon */}
          <button
            onClick={() => onUpdateSettings({ themePalette: 'pure-carbon' })}
            className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
              settings.themePalette === 'pure-carbon'
                ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 font-bold'
                : 'bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-700'
            }`}
          >
            <div>
              <span className="font-semibold block">Pure Carbon</span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Siyah / AMOLED Karbon Tonları</span>
            </div>
            <div className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-700" />
          </button>

          {/* Neon Ocean */}
          <button
            onClick={() => onUpdateSettings({ themePalette: 'neon-ocean' })}
            className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
              settings.themePalette === 'neon-ocean'
                ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 font-bold'
                : 'bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-700'
            }`}
          >
            <div>
              <span className="font-semibold block">Slate Minimal</span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Koyu Mat Antrasit Tonları</span>
            </div>
            <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-600" />
          </button>

          {/* Cyber Orchid */}
          <button
            onClick={() => onUpdateSettings({ themePalette: 'cyber-orchid' })}
            className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
              settings.themePalette === 'cyber-orchid'
                ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 font-bold'
                : 'bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-700'
            }`}
          >
            <div>
              <span className="font-semibold block">Warm Amber</span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Sıcak Kehribar & Ahşap Dokunuş</span>
            </div>
            <div className="w-5 h-5 rounded-full bg-amber-500 border border-amber-600" />
          </button>

          {/* Cosmic Slate */}
          <button
            onClick={() => onUpdateSettings({ themePalette: 'cosmic-slate' })}
            className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
              settings.themePalette === 'cosmic-slate'
                ? 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 font-bold'
                : 'bg-zinc-50 dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-700'
            }`}
          >
            <div>
              <span className="font-semibold block">Midnight Emerald</span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">Zümrüt Derinlik & Gece Modu</span>
            </div>
            <div className="w-5 h-5 rounded-full bg-emerald-600 border border-emerald-500" />
          </button>
        </div>

        {/* Dark/Light Mode Switch */}
        <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
          <div>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">Karanlık / Aydınlık Mod</span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Gündüz (Gündüz modu) ve Gece (Karanlık mod) görünümü</span>
          </div>
          <div className="flex items-center space-x-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <button
              onClick={() => onUpdateSettings({ themeMode: 'dark' })}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all active:scale-95 ${
                settings.themeMode === 'dark'
                  ? 'bg-zinc-900 text-amber-400 font-bold shadow-md'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Gece Modu</span>
            </button>
            <button
              onClick={() => onUpdateSettings({ themeMode: 'light' })}
              className={`px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all active:scale-95 ${
                settings.themeMode === 'light'
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-md'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Gündüz Modu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Network & Audio Quality Section */}
      <div className="bg-white dark:bg-zinc-900/80 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm dark:shadow-md transition-colors">
        <div className="flex items-center space-x-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
          <Wifi className="w-4 h-4 text-amber-500" />
          <span>Ağ & Ses Akış Yönetimi</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 block">Düşük Veri Modu (Low Data Mode)</span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Kotalı ve hücresel bağlantılarda varsayılan olarak daha düşük bitrate yayınlarını tercih eder
            </span>
          </div>

          <button
            onClick={() => onUpdateSettings({ lowDataMode: !settings.lowDataMode })}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              settings.lowDataMode ? 'bg-amber-500' : 'bg-zinc-300 dark:bg-zinc-800'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.lowDataMode ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Danger Zone: Reset Data */}
      <div className="bg-rose-500/10 border border-rose-500/30 p-5 rounded-2xl space-y-3 text-xs">
        <div className="flex items-center space-x-2 font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
          <Trash2 className="w-4 h-4" />
          <span>Verileri Sıfırla</span>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400 text-[11px]">
          Favori radyolarınızı, özel çalma listelerinizi ve tüm yerel tercihlerinizi siler.
        </p>
        <button
          onClick={handleResetWithConfirm}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl transition-colors active:scale-95 shadow-md shadow-rose-600/30"
        >
          Tüm Hafızayı ve Favorileri Sıfırla
        </button>
      </div>
    </div>
  );
};
