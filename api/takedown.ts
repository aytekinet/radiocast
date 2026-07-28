import type { VercelRequest, VercelResponse } from '@vercel/node';
import { processTakedownRequest } from '../src/services/takedownHandler';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS & Security headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed',
      errorEn: 'Method Not Allowed'
    });
  }

  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

  try {
    const result = await processTakedownRequest(req.body || {}, clientIp);
    return res.status(result.httpCode).json({
      success: result.success,
      caseId: result.caseId,
      message: result.message,
      messageEn: result.messageEn,
      contactEmail: 'radiocastlive@proton.me',
    });
  } catch {
    return res.status(500).json({
      success: false,
      error: 'Talep gönderilemedi. Lütfen radiocastlive@proton.me adresine e-posta gönderin.',
      errorEn: 'The request could not be sent. Please email radiocastlive@proton.me.',
      contactEmail: 'radiocastlive@proton.me',
    });
  }
}
