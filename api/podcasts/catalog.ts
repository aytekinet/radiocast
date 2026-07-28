import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handlePodcastCatalog } from '../../src/server/podcastHandler';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return handlePodcastCatalog(req as any, res as any);
}
