import { Resend } from 'resend';

export interface TakedownFormData {
  requestType?: 'copyright' | 'trademark' | 'station_owner' | 'privacy' | 'unauthorized_listing' | 'other';
  claimantName: string;
  organization?: string;
  email: string;
  phone?: string;
  contentType?: 'radio_station' | 'podcast' | 'podcast_episode' | 'logo' | 'other';
  stationName?: string;
  stationId?: string;
  podcastName?: string;
  podcastId?: string;
  episodeGuid?: string;
  applicationUrl?: string;
  sourceUrl?: string;
  protectedWorkDescription?: string;
  complaintDescription: string;
  requestedAction?: string;
  goodFaithStatement?: boolean;
  accuracyStatement?: boolean;
  authorityStatement?: boolean;
  electronicSignature?: string;
  locale?: 'tr' | 'en';
}

function escapeHtml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function generateCaseId(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `RC-${dateStr}-${randomHex}`;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUrl(urlStr?: string): boolean {
  if (!urlStr || !urlStr.trim()) return true;
  try {
    const parsed = new URL(urlStr);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

// Simple in-memory rate limiting map
const ipRateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limitWindow = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 5;

  const current = ipRateLimitMap.get(ip);
  if (!current || now > current.resetAt) {
    ipRateLimitMap.set(ip, { count: 1, resetAt: now + limitWindow });
    return true;
  }

  if (current.count >= maxRequests) {
    return false;
  }

  current.count += 1;
  return true;
}

export function validateEmailConfiguration(): void {
  const required = [
    'RESEND_API_KEY',
  ];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing server environment configuration: ${missing.join(', ')}`);
  }
}

export async function processTakedownRequest(
  data: Partial<TakedownFormData>,
  clientIp = '127.0.0.1'
): Promise<{
  success: boolean;
  caseId: string;
  message: string;
  messageEn: string;
  httpCode: number;
}> {
  const caseId = generateCaseId();

  // Rate limit check
  if (!checkRateLimit(clientIp)) {
    return {
      success: false,
      caseId,
      message: 'Çok fazla talep gönderildi. Lütfen daha sonra tekrar deneyiniz.',
      messageEn: 'Too many requests. Please try again later.',
      httpCode: 429,
    };
  }

  // Sanitization and required checks
  const claimantName = (data.claimantName || '').trim();
  const email = (data.email || '').trim().toLowerCase();
  const complaintDescription = (data.complaintDescription || '').trim();
  const requestedAction = (data.requestedAction || 'Telifli içeriğin veya kanalın rehberden tamamen kaldırılması').trim();
  const electronicSignature = (data.electronicSignature || claimantName).trim();

  if (!claimantName || claimantName.length > 200) {
    return {
      success: false,
      caseId,
      message: 'Geçerli bir ad ve soyad girilmesi zorunludur.',
      messageEn: 'A valid name is required.',
      httpCode: 400,
    };
  }

  if (!email || !isValidEmail(email) || email.length > 250) {
    return {
      success: false,
      caseId,
      message: 'Geçerli bir e-posta adresi girilmesi zorunludur.',
      messageEn: 'A valid email address is required.',
      httpCode: 400,
    };
  }

  if (!complaintDescription || complaintDescription.length > 4000) {
    return {
      success: false,
      caseId,
      message: 'Şikayet açıklaması zorunludur (maksimum 4000 karakter).',
      messageEn: 'Complaint description is required (max 4000 chars).',
      httpCode: 400,
    };
  }

  if (data.goodFaithStatement === false || data.accuracyStatement === false || data.authorityStatement === false) {
    return {
      success: false,
      caseId,
      message: 'Tüm yasal beyan kutularının onaylanması zorunludur.',
      messageEn: 'All legal statements must be accepted.',
      httpCode: 400,
    };
  }

  if (!isValidUrl(data.applicationUrl) || !isValidUrl(data.sourceUrl)) {
    return {
      success: false,
      caseId,
      message: 'URL alanları yalnızca http:// veya https:// formatında olmalıdır.',
      messageEn: 'URL fields must start with http:// or https://.',
      httpCode: 400,
    };
  }

  // Check Resend key existence
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(`[TAKEDOWN_CONFIG_ERROR] caseId=${caseId} RESEND_API_KEY is missing`);
    return {
      success: false,
      caseId,
      message: 'Talep gönderilemedi. Lütfen radiocastlive@proton.me adresine e-posta gönderin.',
      messageEn: 'The request could not be sent. Please email radiocastlive@proton.me.',
      httpCode: 500,
    };
  }

  const toEmail = process.env.TAKEDOWN_TO_EMAIL || 'radiocastlive@proton.me';
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'RadioCast Live <onboarding@resend.dev>';
  const siteUrl = process.env.PUBLIC_SITE_URL || 'https://radiocastlive.vercel.app';

  const requestType = data.requestType || 'copyright';
  const contentType = data.contentType || 'radio_station';
  const targetName = data.stationName || data.podcastName || 'Belirtilmedi';

  // Build plain text body
  const plainTextBody = `
RadioCast Live - Telif / İçerik Kaldırma Bildirimi
==================================================
Case ID: ${caseId}
Tarih: ${new Date().toISOString()}
Site: ${siteUrl}

BAŞVURU SAHİBİ BİLGİLERİ:
-------------------------
Ad Soyad / Unvan: ${claimantName}
Kurum / Yayıncı: ${data.organization || 'Belirtilmedi'}
E-Posta: ${email}
Telefon: ${data.phone || 'Belirtilmedi'}
Elektronik İmza: ${electronicSignature}

ŞİKAYET DETAYLARI:
------------------
Başvuru Türü: ${requestType}
İçerik Türü: ${contentType}
Radyo / Podcast Adı: ${targetName}
Station ID / UUID: ${data.stationId || 'Belirtilmedi'}
Podcast ID: ${data.podcastId || 'Belirtilmedi'}
Episode GUID: ${data.episodeGuid || 'Belirtilmedi'}
Uygulama URL: ${data.applicationUrl || siteUrl}
Kaynak / Yayın URL: ${data.sourceUrl || 'Belirtilmedi'}

KORUNAN ESER VE ŞİKAYET AÇIKLAMASI:
-----------------------------------
Eser Açıklaması: ${data.protectedWorkDescription || 'Belirtilmedi'}
Şikayet Açıklaması:
${complaintDescription}

Talep Edilen İşlem: ${requestedAction}

BEYANLAR:
---------
[X] İyi Niyet Beyanı: Onaylandı
[X] Doğruluk Beyanı: Onaylandı
[X] Yetki Beyanı: Onaylandı
`;

  // Build safe HTML body
  const safeHtmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #18181b; background-color: #f4f4f5; padding: 20px; }
    .card { max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e4e4e7; padding: 24px; }
    .header { border-bottom: 2px solid #f59e0b; padding-bottom: 12px; margin-bottom: 20px; }
    .title { font-size: 18px; font-weight: bold; color: #09090b; }
    .case-id { font-size: 14px; color: #d97706; font-weight: bold; margin-top: 4px; }
    .section { margin-bottom: 18px; }
    .section-title { font-size: 13px; font-weight: bold; text-transform: uppercase; color: #71717a; margin-bottom: 8px; border-bottom: 1px solid #f4f4f5; padding-bottom: 4px; }
    .field { margin-bottom: 6px; font-size: 14px; }
    .label { font-weight: bold; color: #3f3f46; }
    .box { background: #fafafa; border: 1px solid #e4e4e7; padding: 12px; border-radius: 8px; font-size: 13px; white-space: pre-wrap; word-break: break-word; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="title">RadioCast Live - İçerik Kaldırma Bildirimi</div>
      <div class="case-id">Case ID: ${escapeHtml(caseId)}</div>
    </div>

    <div class="section">
      <div class="section-title">Başvuru Sahibi Bilgileri</div>
      <div class="field"><span class="label">Ad Soyad:</span> ${escapeHtml(claimantName)}</div>
      <div class="field"><span class="label">Kurum:</span> ${escapeHtml(data.organization || 'Belirtilmedi')}</div>
      <div class="field"><span class="label">E-Posta:</span> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></div>
      <div class="field"><span class="label">Telefon:</span> ${escapeHtml(data.phone || 'Belirtilmedi')}</div>
      <div class="field"><span class="label">Elektronik İmza:</span> ${escapeHtml(electronicSignature)}</div>
    </div>

    <div class="section">
      <div class="section-title">İçerik Detayları</div>
      <div class="field"><span class="label">Başvuru Türü:</span> ${escapeHtml(requestType)}</div>
      <div class="field"><span class="label">İçerik Türü:</span> ${escapeHtml(contentType)}</div>
      <div class="field"><span class="label">Hedef İsim:</span> ${escapeHtml(targetName)}</div>
      <div class="field"><span class="label">Station ID / UUID:</span> ${escapeHtml(data.stationId || 'Belirtilmedi')}</div>
      <div class="field"><span class="label">Podcast ID:</span> ${escapeHtml(data.podcastId || 'Belirtilmedi')}</div>
      <div class="field"><span class="label">Episode GUID:</span> ${escapeHtml(data.episodeGuid || 'Belirtilmedi')}</div>
      <div class="field"><span class="label">Uygulama URL:</span> ${escapeHtml(data.applicationUrl || siteUrl)}</div>
      <div class="field"><span class="label">Kaynak URL:</span> ${escapeHtml(data.sourceUrl || 'Belirtilmedi')}</div>
    </div>

    <div class="section">
      <div class="section-title">Şikayet Açıklaması ve Talep</div>
      <div class="field"><span class="label">Korunan Eser:</span> ${escapeHtml(data.protectedWorkDescription || 'Belirtilmedi')}</div>
      <div class="label" style="margin-top: 8px; margin-bottom: 4px;">Açıklama:</div>
      <div class="box">${escapeHtml(complaintDescription)}</div>
      <div class="field" style="margin-top: 8px;"><span class="label">Talep Edilen İşlem:</span> ${escapeHtml(requestedAction)}</div>
    </div>

    <div class="section">
      <div class="section-title">Onaylanan Yasal Beyanlar</div>
      <div class="field">✅ İyi Niyet Beyanı (Good Faith Statement)</div>
      <div class="field">✅ Doğruluk Beyanı (Accuracy Statement)</div>
      <div class="field">✅ Yetki Beyanı (Authority Statement)</div>
    </div>
  </div>
</body>
</html>
`;

  try {
    const resend = new Resend(apiKey);
    const subject = `[RadioCast Live Takedown] ${caseId} - ${requestType}`;

    const { data: resendData, error: resendError } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: email,
      subject,
      text: plainTextBody,
      html: safeHtmlBody,
    });

    if (resendError) {
      console.error(`[TAKEDOWN_RESEND_ERROR] caseId=${caseId} message=${resendError.message}`);
      return {
        success: false,
        caseId,
        message: 'Talep gönderilemedi. Lütfen radiocastlive@proton.me adresine e-posta gönderin.',
        messageEn: 'The request could not be sent. Please email radiocastlive@proton.me.',
        httpCode: 500,
      };
    }

    console.log(`[TAKEDOWN_SUCCESS] caseId=${caseId} resendId=${resendData?.id}`);

    return {
      success: true,
      caseId,
      message: `Talebiniz alındı. Başvuru numaranız: ${caseId}`,
      messageEn: `Your request has been received. Case number: ${caseId}`,
      httpCode: 200,
    };
  } catch (err: any) {
    console.error(`[TAKEDOWN_EXCEPTION] caseId=${caseId} err=${err?.message || err}`);
    return {
      success: false,
      caseId,
      message: 'Talep gönderilemedi. Lütfen radiocastlive@proton.me adresine e-posta gönderin.',
      messageEn: 'The request could not be sent. Please email radiocastlive@proton.me.',
      httpCode: 500,
    };
  }
}
