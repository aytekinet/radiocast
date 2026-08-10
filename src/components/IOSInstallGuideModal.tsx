import React from 'react';
import { createPortal } from 'react-dom';
import { Share, SquarePlus, X, Smartphone, Check, ArrowDown } from 'lucide-react';

interface IOSInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IOSInstallGuideModal: React.FC<IOSInstallGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-amber-500/30 p-6 shadow-2xl space-y-6 text-slate-900 dark:text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600" />

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>iPhone Uygulama Yükleme</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                RadioCast'i iPhone ana ekranınıza ekleyin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informative alert box */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 space-y-1">
          <p className="font-bold">Apple iOS (Safari) Güvenlik Gereksinimi:</p>
          <p className="leading-relaxed opacity-90">
            iPhone cihazlarda uygulamalar doğrudan yükleme butonu yerine Safari'nin <b>"Ana Ekrana Ekle"</b> özelliği ile kurulur.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-4 pt-1">
          {/* Step 1 */}
          <div className="flex items-start space-x-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              1
            </div>
            <div className="space-y-1 text-xs">
              <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                Safari alt/üst çubuğundaki <Share className="w-4 h-4 text-amber-500 shrink-0 inline" /> <b>Paylaş</b> butonuna dokunun.
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Ekranın en altındaki kare ve yukarı ok simgesine basın.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start space-x-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              2
            </div>
            <div className="space-y-1 text-xs">
              <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                Menüyü kaydırıp <SquarePlus className="w-4 h-4 text-amber-500 shrink-0 inline" /> <b>"Ana Ekrana Ekle"</b> seçeneğine basın.
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Açılan menüdeki artı kare simgesine tıklayın.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start space-x-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              3
            </div>
            <div className="space-y-1 text-xs">
              <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                Sağ üstteki <Check className="w-4 h-4 text-emerald-500 shrink-0 inline" /> <b>"Ekle"</b> butonuna dokunun.
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                RadioCast logosu anında iPhone ana ekranınıza ikon olarak yerleşir!
              </p>
            </div>
          </div>
        </div>

        {/* Pointer hint */}
        <div className="flex items-center justify-center gap-2 text-center text-amber-500 font-bold text-xs pt-1 animate-bounce">
          <ArrowDown className="w-4 h-4" />
          <span>Paylaş butonu ekranınızın en alt ortasındadır</span>
          <ArrowDown className="w-4 h-4" />
        </div>

        {/* Action button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
        >
          Anladım, Kapat
        </button>
      </div>
    </div>,
    document.body
  );
};
