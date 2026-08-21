type CacheEntry<T> = { value?: T; promise?: Promise<T>; expiresAt: number };

const cache = new Map<string, CacheEntry<unknown>>();

export function cachedRequest<T>(key: string, request: () => Promise<T>, ttl = 30000): Promise<T> {
  const now = Date.now();
  const existing = cache.get(key) as CacheEntry<T> | undefined;
  if (existing && existing.expiresAt > now) {
    if (existing.promise) return existing.promise;
    if (existing.value !== undefined) return Promise.resolve(existing.value);
  }

  const promise = request().then((value) => {
    cache.set(key, { value, expiresAt: Date.now() + ttl });
    return value;
  }).finally(() => {
    const current = cache.get(key);
    if (current?.promise === promise) cache.delete(key);
  });
  cache.set(key, { promise, expiresAt: now + ttl });
  return promise;
}

export function invalidateCache(keyPrefix: string) {
  for (const key of cache.keys()) {
    if (key.startsWith(keyPrefix)) cache.delete(key);
  }
}

export function clearRequestCache() {
  cache.clear();
}
