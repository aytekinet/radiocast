import React, { useState } from 'react';
import { Shield, ArrowLeft, Globe, Send, CheckCircle2, AlertTriangle, FileText, Lock, Scale, Mail } from 'lucide-react';

export type LegalPageType =
  | 'copyright'
  | 'dmca'
  | 'takedown'
  | 'counter-notice'
  | 'privacy'
  | 'terms'
  | 'content-policy';

interface LegalViewProps {
  currentPage: LegalPageType;
  onNavigate: (page: LegalPageType | 'discover') => void;
}

export const LegalView: React.FC<LegalViewProps> = ({ currentPage, onNavigate }) => {
  const [lang, setLang] = useState<'tr' | 'en'>('tr');

  // Form state for Takedown Request
  const [formData, setFormData] = useState({
    claimantName: '',
    organization: '',
    email: '',
    phone: '',
    contentType: 'radio_station',
    stationName: '',
    podcastName: '',
    targetUrl: '',
    complaintDescription: '',
    goodFaith: false,
    accuracy: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmitTakedown = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.goodFaith || !formData.accuracy) {
      alert(
        lang === 'tr'
          ? 'Lütfen beyan kutularını onaylayınız.'
          : 'Please accept the mandatory declarations.'
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    const targetName = formData.stationName || formData.podcastName || 'İçerik';
    const mailSubject = encodeURIComponent(`[Telif Kaldırma Talebi] ${targetName} - ${formData.claimantName}`);
    const mailBody = encodeURIComponent(`Yeni Telif / İçerik Kaldırma Talebi:

Talep Eden: ${formData.claimantName}
Kurum / Yayıncı: ${formData.organization || 'Belirtilmedi'}
E-posta: ${formData.email}
Telefon: ${formData.phone || 'Belirtilmedi'}
İçerik Türü: ${formData.contentType}
Hedef İçerik: ${targetName}

Açıklama:
${formData.complaintDescription}
`);

    const mailtoUrl = `mailto:radiocastlive@proton.me?subject=${mailSubject}&body=${mailBody}`;

    try {
      const res = await fetch('/api/takedown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.emailSent) {
          setSubmitStatus({
            success: true,
            message: lang === 'tr'
              ? 'Talebiniz sunucu üzerinden e-posta ile radiocastlive@proton.me adresine ulaştırıldı.'
              : 'Your request was sent via email to radiocastlive@proton.me.',
          });
        } else {
          // Open mailto as automatic fallback
          window.open(mailtoUrl, '_blank');
          setSubmitStatus({
            success: true,
            message: lang === 'tr'
              ? 'Talebiniz sistemimize kaydedildi. Garantili e-posta iletimi için açılan e-posta istemcinizdeki "Gönder" butonuna basınız. (Eğer açılmadıysa aşağıdaki "E-posta İstemcisiyle Gönder" butonunu kullanabilirsiniz).'
              : 'Your request was logged. To ensure instant delivery, please send via your email client using the button below.',
          });
        }
      } else {
        window.open(mailtoUrl, '_blank');
        setSubmitStatus({
          success: false,
          message: data.error || (lang === 'tr' ? 'Sunucu bağlantısında hata oluştu. E-posta istemciniz açılıyor...' : 'Server connection error. Opening email client...'),
        });
      }
    } catch {
      window.open(mailtoUrl, '_blank');
      setSubmitStatus({
        success: true,
        message:
          lang === 'tr'
            ? 'Talebiniz hazırlandı. Lütfen açılan e-posta istemcinizden radiocastlive@proton.me adresine gönderimi onaylayınız.'
            : 'Your email draft is ready. Please confirm sending to radiocastlive@proton.me in your mail client.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const navLinks: { id: LegalPageType; labelTr: string; labelEn: string }[] = [
    { id: 'copyright', labelTr: 'Telif Hakkı Politikası', labelEn: 'Copyright Policy' },
    { id: 'dmca', labelTr: 'DMCA / Bildirim', labelEn: 'DMCA Policy' },
    { id: 'takedown', labelTr: 'İçerik Kaldırma Formu', labelEn: 'Online Takedown Form' },
    { id: 'counter-notice', labelTr: 'Karşı Bildirim', labelEn: 'Counter Notice' },
    { id: 'privacy', labelTr: 'Gizlilik Politikası', labelEn: 'Privacy Policy' },
    { id: 'terms', labelTr: 'Kullanım Şartları', labelEn: 'Terms of Service' },
    { id: 'content-policy', labelTr: 'İçerik Politikası', labelEn: 'Content Policy' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 select-text">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800 mb-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('discover')}
            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-amber-500/10 hover:text-amber-500 transition-colors flex items-center space-x-1 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'tr' ? 'Anasayfaya Dön' : 'Back to Home'}</span>
          </button>
          <div className="flex items-center space-x-2 text-amber-500 font-bold text-sm">
            <Shield className="w-5 h-5" />
            <span>RadioCast Legal & Policy</span>
          </div>
        </div>

        {/* Language switcher */}
        <div className="flex items-center space-x-2 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
          <Globe className="w-3.5 h-3.5 text-zinc-400 ml-1.5" />
          <button
            onClick={() => setLang('tr')}
            className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all ${
              lang === 'tr'
                ? 'bg-amber-500 text-zinc-950 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            Türkçe (TR)
          </button>
          <button
            onClick={() => setLang('en')}
            className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all ${
              lang === 'en'
                ? 'bg-amber-500 text-zinc-950 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            English (EN)
          </button>
        </div>
      </div>

      {/* Navigation Sub-menu */}
      <div className="flex flex-wrap gap-2 mb-8">
        {navLinks.map((link) => {
          const isActive = currentPage === link.id;
          return (
            <button
              key={link.id}
              onClick={() => onNavigate(link.id)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-md'
                  : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700/60'
              }`}
            >
              {lang === 'tr' ? link.labelTr : link.labelEn}
            </button>
          );
        })}
      </div>

      {/* Contact Notice Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-8 flex items-start space-x-3 text-amber-700 dark:text-amber-300 text-xs">
        <Mail className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
        <div>
          <p className="font-bold text-sm">
            {lang === 'tr' ? 'Resmi İletişim & Hak Sahipleri Bildirim E-postası' : 'Official Rights Holder Contact Email'}
          </p>
          <p className="mt-1">
            {lang === 'tr'
              ? 'Telif hakkı, marka veya radyo kanalı kaldırma taleplerinizi doğrudan '
              : 'Send copyright, trademark, or broadcaster delisting notices directly to '}
            <a href="mailto:radiocastlive@proton.me" className="underline font-bold text-amber-600 dark:text-amber-400">
              radiocastlive@proton.me
            </a>
            {lang === 'tr'
              ? ' e-posta adresimize iletebilir veya aşağıdaki çevrimiçi formu kullanabilirsiniz.'
              : ' or submit via the online form below.'}
          </p>
        </div>
      </div>

      {/* Page Contents */}
      {currentPage === 'copyright' && (
        <div className="space-y-6 text-zinc-800 dark:text-zinc-200 text-sm leading-relaxed bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center space-x-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
            <Scale className="w-6 h-6 text-amber-500" />
            <h1>{lang === 'tr' ? 'Telif Hakkı Bildirimi ve İçerik Kaldırma Politikası' : 'Copyright Notice & Takedown Policy'}</h1>
          </div>

          <p>
            {lang === 'tr'
              ? 'RadioCast, internet üzerinden herkese açık olarak yayınlanan canlı radyo akışlarını ve podcast RSS beslemelerini dizinleyen ve arama kolaylığı sağlayan bir radyo rehber platformudur.'
              : 'RadioCast operates as an index and discovery directory for publicly available online live radio streams and podcast RSS feeds.'}
          </p>

          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 pt-2 border-b border-zinc-200 dark:border-zinc-800 pb-1">
            {lang === 'tr' ? '1. İçerik ve Depolama İlkesi' : '1. Content & Hosting Policy'}
          </h2>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>
              {lang === 'tr'
                ? 'RadioCast sunucularında hiçbir müzik dosyası, radyo yayını kaydı veya MP3/AAC dosyası KALICI OLARAK DEPOLANMAZ ve BARINDIRILMAZ.'
                : 'RadioCast servers DO NOT permanently store or host any music files, radio stream recordings, or MP3/AAC audio files.'}
            </li>
            <li>
              {lang === 'tr'
                ? 'Uygulamada dinlenen tüm yayınlar, ilgili yayıncı kuruluşun herkese açık sunucu adresinden (URL) anlık olarak doğrudan istemciye (tarayıcıya) aktarılır.'
                : 'All stream playback occurs transiently by connecting to the official broadcaster URL.'}
            </li>
            <li>
              {lang === 'tr'
                ? 'Kullanıcılara indirme, dönüştürme veya kaydetme imkanı sunulmaz.'
                : 'No recording, offline conversion, or audio downloading features are provided.'}
            </li>
          </ul>

          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 pt-2 border-b border-zinc-200 dark:border-zinc-800 pb-1">
            {lang === 'tr' ? '2. Hak Sahipleri ve Yayıncı Hakları' : '2. Broadcaster & Rights Holder Protections'}
          </h2>
          <p className="text-xs">
            {lang === 'tr'
              ? 'Yayıncı kuruluşlar veya telif hakkı sahipleri, kanallarının RadioCast rehberinden kaldırılmasını talep etme hakkına sahiptir. Geçerli bir bildirim alındığında, ilgili radyo veya podcast kanalı sistemdeki kalıcı engelleme listesine (data/content-blacklist.json) eklenerek arama ve keşif listelerinden derhal çıkarılır.'
              : 'Broadcasters or rights holders can request delisting at any time. Verified requests result in immediate blacklisting from search, discovery, and API relay services.'}
          </p>
        </div>
      )}

      {currentPage === 'dmca' && (
        <div className="space-y-6 text-zinc-800 dark:text-zinc-200 text-sm leading-relaxed bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center space-x-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
            <FileText className="w-6 h-6 text-amber-500" />
            <h1>{lang === 'tr' ? 'DMCA ve Bildirim-Kaldırma Prosedürü' : 'DMCA Notice & Takedown Procedure'}</h1>
          </div>

          <p className="text-xs">
            {lang === 'tr'
              ? '5651 sayılı Kanun ve Digital Millennium Copyright Act (DMCA) hükümleri uyarınca, telif ihlali bildirimleri aşağıdaki bilgileri içermelidir:'
              : 'In compliance with 5651 Law and DMCA guidelines, copyright notices must include:'}
          </p>

          <ol className="list-decimal pl-5 space-y-1 text-xs">
            <li>{lang === 'tr' ? 'Hak sahibinin veya yetkili temsilcinin adı, soyadı ve iletişim bilgileri.' : 'Name and contact info of rights holder or authorized agent.'}</li>
            <li>{lang === 'tr' ? 'Telif hakkı ihlaline konu olan radyo istasyonu veya podcast adı.' : 'Specific station name, podcast name, or stream identifier.'}</li>
            <li>{lang === 'tr' ? 'İçeriğin hak sahibi olduğunuza dair mülkiyet beyanı.' : 'Good-faith representation statement of copyright ownership.'}</li>
            <li>{lang === 'tr' ? 'Verilen bilgilerin doğru olduğuna dair imza / elektronik beyan.' : 'Signature / electronic declaration of accuracy.'}</li>
          </ol>

          <p className="text-xs bg-zinc-100 dark:bg-zinc-800 p-3 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <strong>E-Posta:</strong> radiocastlive@proton.me
          </p>
        </div>
      )}

      {currentPage === 'takedown' && (
        <div className="space-y-6 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center space-x-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            <h1>{lang === 'tr' ? 'Çevrimiçi Telif / İçerik Kaldırma Formu' : 'Online Content Takedown Request Form'}</h1>
          </div>

          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            {lang === 'tr'
              ? 'Radyo kanalınızın veya podcast içeriğinizin rehberimizden kaldırılması için aşağıdaki formu doldurunuz. Talepler 24 saat içerisinde incelenerek işleme alınır.'
              : 'Submit this form to request removal of your radio station or podcast from our index. Requests are processed within 24 hours.'}
          </p>

          {submitStatus && (
            <div
              className={`p-4 rounded-xl text-xs flex items-center space-x-2 ${
                submitStatus.success
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400'
              }`}
            >
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{submitStatus.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmitTakedown} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  {lang === 'tr' ? 'Ad Soyad / Unvan *' : 'Full Name / Entity Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.claimantName}
                  onChange={(e) => setFormData({ ...formData, claimantName: e.target.value })}
                  placeholder="Ahmet Yılmaz"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  {lang === 'tr' ? 'Kurum / Yayıncı Adı' : 'Company / Station Name'}
                </label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="Radyo Yayın A.Ş."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  {lang === 'tr' ? 'E-Posta Adresi *' : 'Email Address *'}
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="iletisim@radyo.com.tr"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  {lang === 'tr' ? 'İçerik Türü' : 'Content Type'}
                </label>
                <select
                  value={formData.contentType}
                  onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="radio_station">{lang === 'tr' ? 'Radyo İstasyonu' : 'Radio Station'}</option>
                  <option value="podcast">{lang === 'tr' ? 'Podcast Programı' : 'Podcast Show'}</option>
                  <option value="other">{lang === 'tr' ? 'Diğer' : 'Other'}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                {lang === 'tr' ? 'Kaldırılması İstenen Radyo / Podcast Adı *' : 'Target Station / Podcast Name *'}
              </label>
              <input
                type="text"
                required
                value={formData.stationName}
                onChange={(e) => setFormData({ ...formData, stationName: e.target.value })}
                placeholder="Süper FM / Kral Pop"
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                {lang === 'tr' ? 'Açıklama ve Hak Sahipliği Bilgisi *' : 'Description & Ownership Proof *'}
              </label>
              <textarea
                required
                rows={4}
                value={formData.complaintDescription}
                onChange={(e) => setFormData({ ...formData, complaintDescription: e.target.value })}
                placeholder={
                  lang === 'tr'
                    ? 'Yayın hakları kurumumuza aittir, rehberden çıkarılmasını talep ediyoruz...'
                    : 'We own the broadcasting rights for this station and request immediate delisting...'
                }
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <label className="flex items-start space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.goodFaith}
                  onChange={(e) => setFormData({ ...formData, goodFaith: e.target.checked })}
                  className="mt-0.5 rounded text-amber-500 focus:ring-amber-500"
                />
                <span className="text-[11px] text-zinc-600 dark:text-zinc-400">
                  {lang === 'tr'
                    ? 'İşbu talebin iyi niyet kuralları çerçevesinde yapıldığını ve hak sahibi/yetkili temsilci olduğumu beyan ederim.'
                    : 'I declare in good faith that I am the rights holder or authorized representative.'}
                </span>
              </label>

              <label className="flex items-start space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.accuracy}
                  onChange={(e) => setFormData({ ...formData, accuracy: e.target.checked })}
                  className="mt-0.5 rounded text-amber-500 focus:ring-amber-500"
                />
                <span className="text-[11px] text-zinc-600 dark:text-zinc-400">
                  {lang === 'tr'
                    ? 'Verilen bilgilerin doğru olduğunu ve yanlış beyanda hukuki sorumluluğu kabul ettiğimi beyan ederim.'
                    : 'I certify that the information provided is accurate and true under penalty of perjury.'}
                </span>
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold transition-all flex items-center justify-center space-x-2 shadow-md cursor-pointer disabled:opacity-50 text-xs"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? (lang === 'tr' ? 'Gönderiliyor...' : 'Submitting...') : (lang === 'tr' ? 'Formu Gönder' : 'Submit Form')}</span>
              </button>

              <a
                href={`mailto:radiocastlive@proton.me?subject=${encodeURIComponent(
                  `[Telif Kaldırma Talebi] ${formData.stationName || formData.podcastName || 'İçerik'} - ${formData.claimantName || 'Başvuru'}`
                )}&body=${encodeURIComponent(
                  `Talep Eden: ${formData.claimantName}\nKurum: ${formData.organization}\nE-posta: ${formData.email}\nHedef İçerik: ${formData.stationName || formData.podcastName}\n\nAçıklama:\n${formData.complaintDescription}`
                )}`}
                className="px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold transition-all flex items-center justify-center space-x-2 border border-zinc-200 dark:border-zinc-700 text-xs"
              >
                <Mail className="w-4 h-4 text-amber-500" />
                <span>{lang === 'tr' ? 'E-posta Uygulamanız İle Gönder (mailto)' : 'Send via Email Client'}</span>
              </a>
            </div>
          </form>
        </div>
      )}

      {currentPage === 'counter-notice' && (
        <div className="space-y-6 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{lang === 'tr' ? 'Karşı Bildirim Prosedürü' : 'Counter Notice Procedure'}</h1>
          <p>
            {lang === 'tr'
              ? 'Yanlışlıkla kaldırıldığını düşündüğünüz yayınlar için karşı bildirim hakkınız saklıdır. Talebiniz için radiocastlive@proton.me adresine resmi başvuruda bulunabilirsiniz.'
              : 'If you believe content was removed in error, you may file a counter notice via radiocastlive@proton.me.'}
          </p>
        </div>
      )}

      {currentPage === 'privacy' && (
        <div className="space-y-6 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed">
          <div className="flex items-center space-x-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
            <Lock className="w-6 h-6 text-amber-500" />
            <h1>{lang === 'tr' ? 'Gizlilik Politikası' : 'Privacy Policy'}</h1>
          </div>
          <p>
            {lang === 'tr'
              ? 'RadioCast kullanıcı gizliliğine önem verir. Favori istasyonlarınız, dinleme geçmişiniz ve uygulama ayarlarınız yalnızca tarayıcınızın yerel depolama alanında (localStorage) saklanır. Sunucularımızda kişisel profil veya hesap verisi toplanmaz.'
              : 'RadioCast respects user privacy. Your favorites, history, and app preferences remain locally stored on your browser (localStorage). No user account tracking is required or logged.'}
          </p>
        </div>
      )}

      {currentPage === 'terms' && (
        <div className="space-y-6 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed">
          <div className="flex items-center space-x-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
            <Scale className="w-6 h-6 text-amber-500" />
            <h1>{lang === 'tr' ? 'Kullanım Şartları' : 'Terms of Service'}</h1>
          </div>
          <p>
            {lang === 'tr'
              ? 'Uygulamayı kullanarak canlı yayın akışlarının ve podcast kanallarının üçüncü taraf yayıncılara ait olduğunu kabul etmiş olursunuz. RadioCast yayın içeriklerinden doğrudan sorumlu tutulamaz.'
              : 'By using this app, you acknowledge that live radio streams and podcasts belong to their respective third-party broadcasters. RadioCast functions solely as an aggregator directory.'}
          </p>
        </div>
      )}

      {currentPage === 'content-policy' && (
        <div className="space-y-6 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed">
          <div className="flex items-center space-x-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
            <Shield className="w-6 h-6 text-amber-500" />
            <h1>{lang === 'tr' ? 'İçerik Moderasyonu ve Yayın İlkesi' : 'Content Moderation & Listing Policy'}</h1>
          </div>
          <p>
            {lang === 'tr'
              ? 'Tüm radyo ve podcast listeleri düzenli olarak erişilebilirlik ve içerik standartlarına göre taranır. Çalışmayan, kaldırılan veya engellenen içerikler otomatik olarak katalogdan çıkarılır.'
              : 'Catalog listings are routinely scanned for accessibility and compliance. Inaccessible or blacklisted streams are automatically omitted from directory indices.'}
          </p>
        </div>
      )}
    </div>
  );
};
