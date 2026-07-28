import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handlePodcastRefresh } from '../../src/server/podcastHandler';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return handlePodcastRefresh(req as any, res as any);
}
