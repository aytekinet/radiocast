import type { VercelRequest, VercelResponse } from '@vercel/node';
import { app } from '../src/serverApp';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Normalize req.url for Express router when executing inside Vercel Serverless Function
  const rawUrl = req.url || '/';

  // If Vercel rewrote /api/... to /api/index.ts, recover the real route from headers or originalUrl
  if (rawUrl.startsWith('/api/index.ts')) {
    const invokePath = (req.headers['x-invoke-path'] as string) || (req.headers['x-matched-path'] as string);
    const queryIdx = rawUrl.indexOf('?');
    const queryString = queryIdx !== -1 ? rawUrl.slice(queryIdx) : '';

    const origUrl = (req as any).originalUrl as string | undefined;
    if (invokePath && invokePath.startsWith('/api')) {
      req.url = invokePath + queryString;
    } else if (origUrl && origUrl.startsWith('/api')) {
      req.url = origUrl;
    } else {
      // Fallback: remove /api/index.ts
      const cleanPath = rawUrl.replace(/^\/api\/index\.ts/, '');
      req.url = (cleanPath.startsWith('/') ? '/api' + cleanPath : '/api/' + cleanPath);
    }
  } else if (!rawUrl.startsWith('/api/') && rawUrl !== '/api') {
    // Ensure route starts with /api for Express matching
    req.url = '/api' + (rawUrl.startsWith('/') ? '' : '/') + rawUrl;
  }

  return app(req, res);
}
