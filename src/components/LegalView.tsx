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

  // Form state for Takedown Request according to TakedownFormData specification
  const [formData, setFormData] = useState({
    requestType: 'copyright' as 'copyright' | 'trademark' | 'station_owner' | 'privacy' | 'unauthorized_listing' | 'other',
    claimantName: '',
    organization: '',
    email: '',
    phone: '',
    contentType: 'radio_station' as 'radio_station' | 'podcast' | 'podcast_episode' | 'logo' | 'other',
    stationName: '',
    stationId: '',
    podcastName: '',
    podcastId: '',
    episodeGuid: '',
    applicationUrl: 'https://radiocastlive.vercel.app',
    sourceUrl: '',
    protectedWorkDescription: '',
    complaintDescription: '',
    requestedAction: 'Kalıcı Olarak Kaldırma (Delisting)',
    goodFaithStatement: false,
    accuracyStatement: false,
    authorityStatement: false,
    electronicSignature: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ success: boolean; caseId?: string; message: string } | null>(null);

  const handleSubmitTakedown = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.goodFaithStatement || !formData.accuracyStatement || !formData.authorityStatement) {
      alert(
        lang === 'tr'
          ? 'Lütfen üç yasal beyan kutusunun tamamını onaylayınız.'
          : 'Please accept all three required legal declarations.'
      );
      return;
    }

    if (!formData.electronicSignature.trim()) {
      alert(
        lang === 'tr'
          ? 'Lütfen elektronik imza alanını doldurunuz.'
          : 'Please enter your electronic signature.'
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    const targetName = formData.stationName || formData.podcastName || 'İçerik';
    const mailSubject = encodeURIComponent(`[RadioCast Live Takedown] ${targetName} - ${formData.claimantName}`);
    const mailBody = encodeURIComponent(`Telif / İçerik Kaldırma Talebi:

Talep Eden: ${formData.claimantName}
Kurum: ${formData.organization || 'Belirtilmedi'}
E-posta: ${formData.email}
Telefon: ${formData.phone || 'Belirtilmedi'}
Başvuru Türü: ${formData.requestType}
İçerik Türü: ${formData.contentType}
Hedef İçerik: ${targetName}
Station ID: ${formData.stationId}
Podcast ID: ${formData.podcastId}
Uygulama URL: ${formData.applicationUrl}
Kaynak URL: ${formData.sourceUrl}

Korunan Eser: ${formData.protectedWorkDescription}
Açıklama:
${formData.complaintDescription}

Talep Edilen İşlem: ${formData.requestedAction}
İmza: ${formData.electronicSignature}
`);

    const mailtoUrl = `mailto:radiocastlive@proton.me?subject=${mailSubject}&body=${mailBody}`;

    try {
      const res = await fetch('/api/takedown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          locale: lang,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmitStatus({
          success: true,
          caseId: data.caseId,
          message: lang === 'tr' ? data.message : (data.messageEn || data.message),
        });
      } else {
        setSubmitStatus({
          success: false,
          message:
            lang === 'tr'
              ? 'Talep gönderilemedi. Lütfen radiocastlive@proton.me adresine e-posta gönderin.'
              : 'The request could not be sent. Please email radiocastlive@proton.me.',
        });
      }
    } catch {
      window.open(mailtoUrl, '_blank');
      setSubmitStatus({
        success: false,
        message:
          lang === 'tr'
            ? 'Talep gönderilemedi. Lütfen radiocastlive@proton.me adresine e-posta gönderin.'
            : 'The request could not be sent. Please email radiocastlive@proton.me.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => onNavigate('discover')}
          className="flex items-center space-x-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-amber-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'tr' ? 'Anasayfaya Dön' : 'Back to Discover'}</span>
        </button>

        <div className="flex items-center space-x-2">
          <Globe className="w-4 h-4 text-zinc-400" />
          <button
            onClick={() => setLang('tr')}
            className={`px-2 py-1 text-xs font-bold rounded-lg transition-colors ${
              lang === 'tr'
                ? 'bg-amber-500 text-zinc-950'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            TR
          </button>
          <button
            onClick={() => setLang('en')}
            className={`px-2 py-1 text-xs font-bold rounded-lg transition-colors ${
              lang === 'en'
                ? 'bg-amber-500 text-zinc-950'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            EN
          </button>
        </div>
      </div>

      {/* Navigation Tabs for Legal Pages */}
      <div className="flex flex-wrap gap-2 text-xs font-medium bg-zinc-100 dark:bg-zinc-900/80 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => onNavigate('copyright')}
          className={`px-3 py-2 rounded-xl transition-all ${
            currentPage === 'copyright'
              ? 'bg-white dark:bg-zinc-800 text-amber-500 font-bold shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          {lang === 'tr' ? 'Telif Hakkı' : 'Copyright'}
        </button>
        <button
          onClick={() => onNavigate('dmca')}
          className={`px-3 py-2 rounded-xl transition-all ${
            currentPage === 'dmca'
              ? 'bg-white dark:bg-zinc-800 text-amber-500 font-bold shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          DMCA
        </button>
        <button
          onClick={() => onNavigate('takedown')}
          className={`px-3 py-2 rounded-xl transition-all ${
            currentPage === 'takedown'
              ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          {lang === 'tr' ? 'İçerik Kaldırma Formu' : 'Takedown Form'}
        </button>
        <button
          onClick={() => onNavigate('counter-notice')}
          className={`px-3 py-2 rounded-xl transition-all ${
            currentPage === 'counter-notice'
              ? 'bg-white dark:bg-zinc-800 text-amber-500 font-bold shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          {lang === 'tr' ? 'Karşı Bildirim' : 'Counter Notice'}
        </button>
        <button
          onClick={() => onNavigate('privacy')}
          className={`px-3 py-2 rounded-xl transition-all ${
            currentPage === 'privacy'
              ? 'bg-white dark:bg-zinc-800 text-amber-500 font-bold shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          {lang === 'tr' ? 'Gizlilik' : 'Privacy'}
        </button>
        <button
          onClick={() => onNavigate('terms')}
          className={`px-3 py-2 rounded-xl transition-all ${
            currentPage === 'terms'
              ? 'bg-white dark:bg-zinc-800 text-amber-500 font-bold shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          {lang === 'tr' ? 'Şartlar' : 'Terms'}
        </button>
        <button
          onClick={() => onNavigate('content-policy')}
          className={`px-3 py-2 rounded-xl transition-all ${
            currentPage === 'content-policy'
              ? 'bg-white dark:bg-zinc-800 text-amber-500 font-bold shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          {lang === 'tr' ? 'İçerik Politikası' : 'Content Policy'}
        </button>
      </div>

      {/* Official Notice Box */}
      <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-start space-x-3 text-xs">
        <Shield className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
            {lang === 'tr' ? 'Resmi Telif Hakkı & Kaldırma Bildirimi İletişimi' : 'Official Copyright & Takedown Contact'}
          </div>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {lang === 'tr'
              ? 'Telif hakkı, marka hakları veya yayıncı kaldırma bildirimlerinizi doğrudan '
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
              ? 'Yayıncı kuruluşlar veya telif hakkı sahipleri, kanallarının RadioCast rehberinden kaldırılmasını talep etme hakkına sahiptir. Geçerli bir bildirim alındığında, ilgili radyo veya podcast kanalı sistemdeki kalıcı engelleme listesine eklenerek arama ve keşif listelerinden derhal çıkarılır.'
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
              ? 'Radyo kanalınızın, podcastinizin veya logonuzun rehberimizden kaldırılması için aşağıdaki formu eksiksiz doldurunuz. Bildirimler Resend güvenli sunucu altyapısıyla doğrudan yetkili adresimize ulaştırılır.'
              : 'Submit this form to request removal of your radio station, podcast, or logo from our directory. Notifications are securely transmitted directly to our compliance inbox via Resend.'}
          </p>

          {submitStatus && (
            <div
              className={`p-4 rounded-xl text-xs space-y-2 ${
                submitStatus.success
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400'
              }`}
            >
              <div className="flex items-center space-x-2 font-bold">
                {submitStatus.success ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
                <span>{submitStatus.message}</span>
              </div>
              {submitStatus.caseId && (
                <div className="text-[11px] font-mono bg-emerald-500/20 px-2 py-1 rounded inline-block">
                  Case ID: {submitStatus.caseId}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmitTakedown} className="space-y-4 text-xs">
            {/* Request Type & Content Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  {lang === 'tr' ? 'Başvuru Türü *' : 'Request Type *'}
                </label>
                <select
                  value={formData.requestType}
                  onChange={(e) => setFormData({ ...formData, requestType: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="copyright">{lang === 'tr' ? 'Telif Hakkı İhlali (Copyright)' : 'Copyright Infringement'}</option>
                  <option value="trademark">{lang === 'tr' ? 'Marka / Ticari İsim İhlali' : 'Trademark Infringement'}</option>
                  <option value="station_owner">{lang === 'tr' ? 'İstasyon / Kanal Sahibi Talebi' : 'Broadcaster / Owner Request'}</option>
                  <option value="privacy">{lang === 'tr' ? 'Gizlilik & Kişisel Veri' : 'Privacy & Personal Data'}</option>
                  <option value="unauthorized_listing">{lang === 'tr' ? 'İzinsiz Liste İlanı' : 'Unauthorized Listing'}</option>
                  <option value="other">{lang === 'tr' ? 'Diğer' : 'Other'}</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  {lang === 'tr' ? 'İçerik Türü *' : 'Content Type *'}
                </label>
                <select
                  value={formData.contentType}
                  onChange={(e) => setFormData({ ...formData, contentType: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="radio_station">{lang === 'tr' ? 'Radyo İstasyonu' : 'Radio Station'}</option>
                  <option value="podcast">{lang === 'tr' ? 'Podcast Programı' : 'Podcast Show'}</option>
                  <option value="podcast_episode">{lang === 'tr' ? 'Podcast Bölümü' : 'Podcast Episode'}</option>
                  <option value="logo">{lang === 'tr' ? 'Logo / Görsel Materyal' : 'Logo / Graphic Asset'}</option>
                  <option value="other">{lang === 'tr' ? 'Diğer Materyal' : 'Other Material'}</option>
                </select>
              </div>
            </div>

            {/* Claimant Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  {lang === 'tr' ? 'Başvuran Adı Soyadı *' : 'Claimant Name *'}
                </label>
                <input
                  type="text"
                  required
                  maxLength={200}
                  value={formData.claimantName}
                  onChange={(e) => setFormData({ ...formData, claimantName: e.target.value })}
                  placeholder="Ahmet Yılmaz"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  {lang === 'tr' ? 'Kurum / Şirket Adı' : 'Organization / Entity'}
                </label>
                <input
                  type="text"
                  maxLength={200}
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="Süper FM Medya A.Ş."
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  {lang === 'tr' ? 'E-Posta Adresi *' : 'Email Address *'}
                </label>
                <input
                  type="email"
                  required
                  maxLength={250}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="yasal@radyokanal.com"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  {lang === 'tr' ? 'Telefon Numarası' : 'Phone Number'}
                </label>
                <input
                  type="tel"
                  maxLength={50}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+90 212 000 00 00"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Content Target Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  {lang === 'tr' ? 'Radyo / Podcast Adı *' : 'Station / Podcast Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.stationName}
                  onChange={(e) => setFormData({ ...formData, stationName: e.target.value, podcastName: e.target.value })}
                  placeholder="Kral Pop / Joy FM / Bilim Podcast"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  {lang === 'tr' ? 'Station ID / Podcast ID (Varsa)' : 'Station ID / Podcast ID (Optional)'}
                </label>
                <input
                  type="text"
                  value={formData.stationId}
                  onChange={(e) => setFormData({ ...formData, stationId: e.target.value, podcastId: e.target.value })}
                  placeholder="UUID / ID"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* URLs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  {lang === 'tr' ? 'Uygulamadaki Sayfa URL\'si *' : 'Application URL *'}
                </label>
                <input
                  type="url"
                  required
                  value={formData.applicationUrl}
                  onChange={(e) => setFormData({ ...formData, applicationUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  {lang === 'tr' ? 'Resmi Yayın / Kaynak URL\'si' : 'Official Stream / Source URL'}
                </label>
                <input
                  type="url"
                  value={formData.sourceUrl}
                  onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                  placeholder="https://resmiradyo.com/live"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Protected Work & Complaint Description */}
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                {lang === 'tr' ? 'Korunan Eser / Hak Tanımı' : 'Protected Work / Right Description'}
              </label>
              <input
                type="text"
                value={formData.protectedWorkDescription}
                onChange={(e) => setFormData({ ...formData, protectedWorkDescription: e.target.value })}
                placeholder="Canlı Radyo Yayın Hakları / Tescilli Logo / Marka İsim Hakkı"
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                {lang === 'tr' ? 'Şikayet ve Hak Sahipliği Açıklaması *' : 'Complaint & Rights Ownership Details *'}
              </label>
              <textarea
                required
                rows={4}
                maxLength={4000}
                value={formData.complaintDescription}
                onChange={(e) => setFormData({ ...formData, complaintDescription: e.target.value })}
                placeholder={
                  lang === 'tr'
                    ? 'Yayın hakları kurumumuza aittir, ilgili akışın rehberden derhal çıkarılmasını rica ederiz...'
                    : 'We own all broadcast rights for this station and request immediate delisting from your index...'
                }
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Electronic Signature */}
            <div>
              <label className="block font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                {lang === 'tr' ? 'Elektronik İmza (Ad Soyad) *' : 'Electronic Signature (Full Name) *'}
              </label>
              <input
                type="text"
                required
                maxLength={200}
                value={formData.electronicSignature}
                onChange={(e) => setFormData({ ...formData, electronicSignature: e.target.value })}
                placeholder="Ahmet Yılmaz"
                className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            {/* Declarations */}
            <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <label className="flex items-start space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.goodFaithStatement}
                  onChange={(e) => setFormData({ ...formData, goodFaithStatement: e.target.checked })}
                  className="mt-0.5 rounded text-amber-500 focus:ring-amber-500"
                />
                <span className="text-[11px] text-zinc-600 dark:text-zinc-400">
                  {lang === 'tr'
                    ? '1. [İyi Niyet Beyanı]: Şikayet konusu materyalin hak sahibi veya yasalarca yetkilendirilmediğine iyi niyetle inandığımı beyan ederim.'
                    : '1. [Good Faith Statement]: I have a good faith belief that use of the material is not authorized by the copyright owner or law.'}
                </span>
              </label>

              <label className="flex items-start space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.accuracyStatement}
                  onChange={(e) => setFormData({ ...formData, accuracyStatement: e.target.checked })}
                  className="mt-0.5 rounded text-amber-500 focus:ring-amber-500"
                />
                <span className="text-[11px] text-zinc-600 dark:text-zinc-400">
                  {lang === 'tr'
                    ? '2. [Doğruluk Beyanı]: İşbu bildirimdeki bilgilerin doğru olduğunu ve yalan beyanda hukuki sorumluluğu kabul ettiğimi beyan ederim.'
                    : '2. [Accuracy Statement]: I certify under penalty of perjury that the information in this notice is accurate.'}
                </span>
              </label>

              <label className="flex items-start space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.authorityStatement}
                  onChange={(e) => setFormData({ ...formData, authorityStatement: e.target.checked })}
                  className="mt-0.5 rounded text-amber-500 focus:ring-amber-500"
                />
                <span className="text-[11px] text-zinc-600 dark:text-zinc-400">
                  {lang === 'tr'
                    ? '3. [Yetki Beyanı]: İhlal edildiği iddia edilen münhasır hakkın sahibi adına hareket etmeye yetkili olduğumu beyan ederim.'
                    : '3. [Authority Statement]: I am authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.'}
                </span>
              </label>
            </div>

            {/* Submit buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold transition-all flex items-center justify-center space-x-2 shadow-md cursor-pointer disabled:opacity-50 text-xs"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? (lang === 'tr' ? 'Gönderiliyor...' : 'Submitting...') : (lang === 'tr' ? 'Formu Gönder (Resend API)' : 'Submit Form (Resend API)')}</span>
              </button>

              <a
                href={`mailto:radiocastlive@proton.me?subject=${encodeURIComponent(
                  `[RadioCast Live Takedown] ${formData.stationName || formData.podcastName || 'İçerik'} - ${formData.claimantName || 'Başvuru'}`
                )}&body=${encodeURIComponent(
                  `Talep Eden: ${formData.claimantName}\nKurum: ${formData.organization}\nE-posta: ${formData.email}\nHedef İçerik: ${formData.stationName || formData.podcastName}\n\nAçıklama:\n${formData.complaintDescription}`
                )}`}
                className="px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold transition-all flex items-center justify-center space-x-2 border border-zinc-200 dark:border-zinc-700 text-xs"
              >
                <Mail className="w-4 h-4 text-amber-500" />
                <span>{lang === 'tr' ? 'E-posta İstemcisiyle Gönder (mailto)' : 'Send via Mail Client (mailto)'}</span>
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
