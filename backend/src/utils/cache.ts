import logger from './logger'

interface CacheItem<T> {
  value: T
  expiry: number
}

class MemoryCache {
  private cache = new Map<string, CacheItem<any>>()

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }

    return item.value as T
  }

  set<T>(key: string, value: T, ttlSeconds: number): void {
    const expiry = Date.now() + ttlSeconds * 1000
    this.cache.set(key, { value, expiry })
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }
}

export const memoryCache = new MemoryCache()

/**
 * Generic caching wrapper for expensive database reads.
 * @param key Unique cache key
 * @param ttlSeconds Time-to-live in seconds
 * @param fetcher Async function to fetch data if cache misses
 * @returns The cached or freshly fetched data
 */
export async function getCachedOrFetch<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  try {
    const cached = memoryCache.get<T>(key)
    if (cached !== null) {
      logger.debug(`Cache hit: ${key}`)
      return cached
    }

    logger.debug(`Cache miss: ${key}`)
    const data = await fetcher()
    
    if (data !== undefined && data !== null) {
      memoryCache.set(key, data, ttlSeconds)
    }
    
    return data
  } catch (error) {
    logger.error(`Error in getCachedOrFetch for key ${key}:`, error)
    // On cache failure, try fetching directly
    return await fetcher()
  }
}
