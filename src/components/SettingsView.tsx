import React, { useRef, useState } from 'react';
import { 
  Settings, 
  Palette, 
  Moon, 
  Sun, 
  Wifi, 
  Trash2, 
  Linkedin,
  Github,
  ExternalLink,
  Download,
  Upload,
  Check,
  Smartphone,
  Share,
  SquarePlus
} from 'lucide-react';
import { AppSettings } from '../types';
import { exportUserData, importUserData } from '../services/storage';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onResetAllData: () => void;
  onNavigate?: (tab: string) => void;
  onOpenIOSGuide?: () => void;
  onInstallPWA?: () => void;
  isIOS?: boolean;
  isStandalone?: boolean;
  hasDeferredPrompt?: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onResetAllData,
  onNavigate,
  onOpenIOSGuide,
  onInstallPWA,
  isIOS,
  isStandalone,
  hasDeferredPrompt
}) => {
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const jsonStr = exportUserData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RadioCast_Yedek_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importUserData(content);
      if (success) {
        setImportStatus('success');
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        setImportStatus('error');
      }
    };
    reader.readAsText(file);
  };

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
          Görünüm, ses akış kalitesi ve bağlantılar
        </p>
      </div>

      {/* Mobil Uygulama Kurulum Kartı */}
      <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-purple-500/10 p-5 rounded-2xl border border-amber-500/30 space-y-3 shadow-sm transition-colors">
        <div className="flex items-center space-x-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
          <Smartphone className="w-4 h-4" />
          <span>Mobil & Masaüstü Uygulama Kurulumu (PWA)</span>
        </div>
        <p className="text-zinc-700 dark:text-zinc-300 text-xs leading-relaxed">
          RadioCast'i cihazınıza yükleyerek internetiniz koptuğunda indirilen podcast'leri kesintisiz dinleyebilir ve uygulamayı doğrudan ana ekranınızdan başlatabilirsiniz.
        </p>

        {isStandalone ? (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>RadioCast uygulamanız ana ekranınıza başarıyla yüklenmiş durumda!</span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {hasDeferredPrompt && onInstallPWA && (
              <button
                onClick={onInstallPWA}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Smartphone className="w-4 h-4" />
                <span>Tek Tıkla Yükle (Android / Chrome)</span>
              </button>
            )}

            {onOpenIOSGuide && (
              <button
                onClick={onOpenIOSGuide}
                className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Share className="w-4 h-4 text-amber-400" />
                <span>iPhone / iPad Yükleme Rehberi (Safari)</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Yasal & Telif Hakları Politikaları */}
      <div className="bg-white dark:bg-zinc-900/80 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-sm dark:shadow-md transition-colors">
        <div className="flex items-center space-x-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
          <Settings className="w-4 h-4 text-amber-500" />
          <span>Yasal Haklar & Politikalar</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          <button
            onClick={() => onNavigate?.('copyright')}
            className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:border-amber-500 hover:text-amber-500 font-medium transition-colors text-left"
          >
            Telif Hakkı Politikası
          </button>
          <button
            onClick={() => onNavigate?.('dmca')}
            className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:border-amber-500 hover:text-amber-500 font-medium transition-colors text-left"
          >
            DMCA Bildirimi
          </button>
          <button
            onClick={() => onNavigate?.('takedown')}
            className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:border-amber-500 hover:text-amber-500 font-bold text-amber-600 dark:text-amber-400 transition-colors text-left"
          >
            İçerik Kaldırma Formu
          </button>
          <button
            onClick={() => onNavigate?.('privacy')}
            className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:border-amber-500 hover:text-amber-500 font-medium transition-colors text-left"
          >
            Gizlilik Politikası
          </button>
          <button
            onClick={() => onNavigate?.('terms')}
            className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:border-amber-500 hover:text-amber-500 font-medium transition-colors text-left"
          >
            Kullanım Şartları
          </button>
          <button
            onClick={() => onNavigate?.('content-policy')}
            className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:border-amber-500 hover:text-amber-500 font-medium transition-colors text-left"
          >
            İçerik Politikası
          </button>
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

      {/* Backup & Restore Data */}
      <div className="bg-white dark:bg-zinc-900/80 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3 shadow-sm dark:shadow-md transition-colors">
        <div className="flex items-center space-x-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
          <Download className="w-4 h-4 text-amber-500" />
          <span>Veri Yedekleme & Geri Yükleme</span>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400 text-xs">
          Favorilerinizi, podcast dinleme geçmişinizi ve çalma listelerinizi JSON formatında cihazınıza indirebilir veya başka bir cihazdan yükleyebilirsiniz.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={handleExport}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Yedeği İndir (.json)</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Yedekten Geri Yükle</span>
          </button>

          {importStatus === 'success' && (
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
              <Check className="w-4 h-4" /> Yükleme başarılı, yenileniyor...
            </span>
          )}
          {importStatus === 'error' && (
            <span className="text-xs font-bold text-red-500">
              Yedek dosyası okunamadı veya geçersiz.
            </span>
          )}
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

      {/* Social & Project Links Footer */}
      <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-center gap-3">
        <a
          href="https://github.com/aytekinet/radiocast/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white text-xs font-semibold transition-all shadow-md active:scale-95"
        >
          <Github className="w-4 h-4 text-white" />
          <span>GitHub</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-75" />
        </a>

        <a
          href="https://www.linkedin.com/in/aytekin-tanrisever/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-md active:scale-95"
        >
          <Linkedin className="w-4 h-4 text-white fill-current" />
          <span>LinkedIn</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-75" />
        </a>
      </div>
    </div>
  );
};
