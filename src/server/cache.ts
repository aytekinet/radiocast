interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

export function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setToCache<T>(key: string, data: T, ttlMs: number): void {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

export function clearCacheKey(key: string): void {
  cache.delete(key);
}
