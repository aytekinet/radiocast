import type { VercelRequest, VercelResponse } from '@vercel/node';
import { app } from '../src/serverApp';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Normalize req.url for Express router when executing inside Vercel Serverless Function
  const rawUrl = req.url || '/';

  // Detect real URL from Vercel headers if rewritten
  const forwardedUri = req.headers['x-forwarded-uri'] as string | undefined;
  const invokePath = (req.headers['x-invoke-path'] as string) || (req.headers['x-matched-path'] as string);
  const origUrl = (req as any).originalUrl as string | undefined;

  let targetUrl = rawUrl;
  if (forwardedUri && forwardedUri.startsWith('/api')) {
    targetUrl = forwardedUri;
  } else if (invokePath && invokePath.startsWith('/api')) {
    const queryIdx = rawUrl.indexOf('?');
    const queryString = queryIdx !== -1 ? rawUrl.slice(queryIdx) : '';
    targetUrl = invokePath.includes('?') ? invokePath : invokePath + queryString;
  } else if (origUrl && origUrl.startsWith('/api')) {
    targetUrl = origUrl;
  } else if (rawUrl.startsWith('/api/index.ts') || rawUrl.startsWith('/api/index')) {
    const cleanPath = rawUrl.replace(/^\/api\/index(\.ts|\.js)?/, '');
    targetUrl = cleanPath.startsWith('/') ? '/api' + cleanPath : '/api/' + cleanPath;
  }

  if (!targetUrl.startsWith('/api/') && targetUrl !== '/api') {
    targetUrl = '/api' + (targetUrl.startsWith('/') ? '' : '/') + targetUrl;
  }

  req.url = targetUrl;

  return app(req, res);
}
