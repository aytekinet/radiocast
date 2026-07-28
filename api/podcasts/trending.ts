import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handlePodcastTrending } from '../../src/server/podcastHandler';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return handlePodcastTrending(req as any, res as any);
}
