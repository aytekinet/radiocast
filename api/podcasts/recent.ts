import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handlePodcastRecent } from '../../src/server/podcastHandler';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return handlePodcastRecent(req as any, res as any);
}
