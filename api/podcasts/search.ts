import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handlePodcastSearch } from '../../src/server/podcastHandler';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return handlePodcastSearch(req as any, res as any);
}
