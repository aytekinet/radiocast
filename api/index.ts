import type { VercelRequest, VercelResponse } from '@vercel/node';
import { app } from '../src/serverApp';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Normalize req.url for Express router when executing inside Vercel Serverless Function
  const rawUrl = req.url || '/';

  // Detect real URL from Vercel edge headers
  const forwardedUri = req.headers['x-forwarded-uri'] as string | undefined;
  const invokePath = (req.headers['x-invoke-path'] as string) || (req.headers['x-matched-path'] as string);
  const origUrl = (req as any).originalUrl as string | undefined;

  let targetUrl = rawUrl;

  if (forwardedUri && forwardedUri.startsWith('/api')) {
    targetUrl = forwardedUri;
  } else if (origUrl && origUrl.startsWith('/api') && !origUrl.includes('/api/index')) {
    targetUrl = origUrl;
  } else if (invokePath && invokePath.startsWith('/api') && !invokePath.includes('index')) {
    const queryIdx = rawUrl.indexOf('?');
    const queryString = queryIdx !== -1 ? rawUrl.slice(queryIdx) : '';
    targetUrl = invokePath.includes('?') ? invokePath : invokePath + queryString;
  }

  // Strip any accidental /api/index.ts or /api/index prefix
  if (targetUrl.startsWith('/api/index.ts') || targetUrl.startsWith('/api/index')) {
    const queryIdx = targetUrl.indexOf('?');
    const query = queryIdx !== -1 ? targetUrl.slice(queryIdx) : '';
    const cleanPath = targetUrl.slice(0, queryIdx !== -1 ? queryIdx : undefined).replace(/^\/api\/index(\.ts|\.js)?/, '');
    targetUrl = (cleanPath ? cleanPath : '/api') + query;
  }

  if (!targetUrl.startsWith('/api/') && targetUrl !== '/api') {
    targetUrl = '/api' + (targetUrl.startsWith('/') ? '' : '/') + targetUrl;
  }

  req.url = targetUrl;

  return app(req, res);
}
