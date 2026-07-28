import type { VercelRequest, VercelResponse } from '@vercel/node';
import { parseRssXml } from '../../src/serverApp';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const feedUrl = (req.query.url as string || req.query.feedUrl as string || '').trim();
  if (!feedUrl) {
    return res.status(400).json({ error: 'RSS feed URL parameter required' });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'GlobalRadioWeb/1.0 (Mozilla/5.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const xmlText = await response.text();
      const parsed = parseRssXml(xmlText);
      return res.status(200).json(parsed);
    }

    return res.status(502).json({ error: 'Failed to fetch RSS feed' });
  } catch (err: any) {
    return res.status(500).json({ error: 'RSS parsing failed', details: err?.message || String(err) });
  }
}
