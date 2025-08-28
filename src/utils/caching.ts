/**
 * Caching strategy utility for optimizing data access and reducing API calls
 */

export interface CacheItem<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  key: string;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds (default: 5 minutes)
  maxSize?: number; // Maximum number of items in cache (default: 100)
  storage?: 'memory' | 'localStorage' | 'sessionStorage';
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  maxSize: number;
  hitRate: number;
}

class CacheManager {
  private memoryCache: Map<string, CacheItem> = new Map();
  private stats = {
    hits: 0,
    misses: 0,
  };
  private options: Required<CacheOptions>;

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl || 5 * 60 * 1000, // 5 minutes default
      maxSize: options.maxSize || 100,
      storage: options.storage || 'memory',
    };

    // Clean up expired items periodically
    setInterval(() => this.cleanup(), 60000); // Clean up every minute
  }

  /**
   * Set a value in the cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.options.ttl,
      key,
    };

    // Check if item is expired
    if (this.isExpired(item)) {
      return;
    }

    // Remove oldest items if cache is full
    if (this.memoryCache.size >= this.options.maxSize) {
      this.evictOldest();
    }

    // Store in appropriate storage
    switch (this.options.storage) {
      case 'localStorage':
        this.setLocalStorage(key, item);
        break;
      case 'sessionStorage':
        this.setSessionStorage(key, item);
        break;
      default:
        this.memoryCache.set(key, item);
    }
  }

  /**
   * Get a value from the cache
   */
  get<T>(key: string): T | null {
    let item: CacheItem<T> | null = null;

    // Retrieve from appropriate storage
    switch (this.options.storage) {
      case 'localStorage':
        item = this.getLocalStorage<T>(key);
        break;
      case 'sessionStorage':
        item = this.getSessionStorage<T>(key);
        break;
      default:
        item = this.memoryCache.get(key) as CacheItem<T> || null;
    }

    if (!item) {
      this.stats.misses++;
      return null;
    }

    // Check if item is expired
    if (this.isExpired(item)) {
      this.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return item.data;
  }

  /**
   * Check if a key exists in cache and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete a key from cache
   */
  delete(key: string): boolean {
    let deleted = false;

    switch (this.options.storage) {
      case 'localStorage':
        deleted = this.deleteLocalStorage(key);
        break;
      case 'sessionStorage':
        deleted = this.deleteSessionStorage(key);
        break;
      default:
        deleted = this.memoryCache.delete(key);
    }

    return deleted;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    switch (this.options.storage) {
      case 'localStorage':
        this.clearLocalStorage();
        break;
      case 'sessionStorage':
        this.clearSessionStorage();
        break;
      default:
        this.memoryCache.clear();
    }

    this.stats.hits = 0;
    this.stats.misses = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? this.stats.hits / total : 0;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.getSize(),
      maxSize: this.options.maxSize,
      hitRate,
    };
  }

  /**
   * Get cache size
   */
  getSize(): number {
    switch (this.options.storage) {
      case 'localStorage':
        return this.getLocalStorageSize();
      case 'sessionStorage':
        return this.getSessionStorageSize();
      default:
        return this.memoryCache.size;
    }
  }

  /**
   * Get all cache keys
   */
  getKeys(): string[] {
    switch (this.options.storage) {
      case 'localStorage':
        return this.getLocalStorageKeys();
      case 'sessionStorage':
        return this.getSessionStorageKeys();
      default:
        return Array.from(this.memoryCache.keys());
    }
  }

  /**
   * Invalidate cache by pattern
   */
  invalidatePattern(pattern: RegExp): number {
    const keys = this.getKeys();
    const matchingKeys = keys.filter(key => pattern.test(key));
    
    let deletedCount = 0;
    matchingKeys.forEach(key => {
      if (this.delete(key)) {
        deletedCount++;
      }
    });

    return deletedCount;
  }

  /**
   * Check if cache item is expired
   */
  private isExpired(item: CacheItem): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }

  /**
   * Evict oldest items from cache
   */
  private evictOldest(): void {
    const entries = Array.from(this.memoryCache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Remove 10% of oldest items
    const toRemove = Math.ceil(this.options.maxSize * 0.1);
    entries.slice(0, toRemove).forEach(([key]) => {
      this.memoryCache.delete(key);
    });
  }

  /**
   * Clean up expired items
   */
  private cleanup(): void {
    const keys = this.getKeys();
    keys.forEach(key => {
      // Check if item is expired by trying to get it
      // The get method will automatically remove expired items
      this.get(key);
    });
  }

  // localStorage methods
  private setLocalStorage<T>(key: string, item: CacheItem<T>): void {
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to set localStorage cache:', error);
    }
  }

  private getLocalStorage<T>(key: string): CacheItem<T> | null {
    try {
      const item = localStorage.getItem(`cache_${key}`);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.warn('Failed to get localStorage cache:', error);
      return null;
    }
  }

  private deleteLocalStorage(key: string): boolean {
    try {
      localStorage.removeItem(`cache_${key}`);
      return true;
    } catch (error) {
      console.warn('Failed to delete localStorage cache:', error);
      return false;
    }
  }

  private clearLocalStorage(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear localStorage cache:', error);
    }
  }

  private getLocalStorageSize(): number {
    try {
      const keys = Object.keys(localStorage);
      return keys.filter(key => key.startsWith('cache_')).length;
    } catch {
      return 0;
    }
  }

  private getLocalStorageKeys(): string[] {
    try {
      const keys = Object.keys(localStorage);
      return keys
        .filter(key => key.startsWith('cache_'))
        .map(key => key.replace('cache_', ''));
    } catch {
      return [];
    }
  }

  // sessionStorage methods
  private setSessionStorage<T>(key: string, item: CacheItem<T>): void {
    try {
      sessionStorage.setItem(`cache_${key}`, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to set sessionStorage cache:', error);
    }
  }

  private getSessionStorage<T>(key: string): CacheItem<T> | null {
    try {
      const item = sessionStorage.getItem(`cache_${key}`);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.warn('Failed to get sessionStorage cache:', error);
      return null;
    }
  }

  private deleteSessionStorage(key: string): boolean {
    try {
      sessionStorage.removeItem(`cache_${key}`);
      return true;
    } catch (error) {
      console.warn('Failed to delete sessionStorage cache:', error);
      return false;
    }
  }

  private clearSessionStorage(): void {
    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear sessionStorage cache:', error);
    }
  }

  private getSessionStorageSize(): number {
    try {
      const keys = Object.keys(sessionStorage);
      return keys.filter(key => key.startsWith('cache_')).length;
    } catch {
      return 0;
    }
  }

  private getSessionStorageKeys(): string[] {
    try {
      const keys = Object.keys(sessionStorage);
      return keys
        .filter(key => key.startsWith('cache_'))
        .map(key => key.replace('cache_', ''));
    } catch {
      return [];
    }
  }
}

// Create default cache instances
export const memoryCache = new CacheManager({ storage: 'memory' });
export const localStorageCache = new CacheManager({ storage: 'localStorage' });
export const sessionStorageCache = new CacheManager({ storage: 'sessionStorage' });

// Export convenience functions
export const cacheGet = <T>(key: string, cache: CacheManager = memoryCache): T | null =>
  cache.get<T>(key);

export const cacheSet = <T>(key: string, data: T, ttl?: number, cache: CacheManager = memoryCache): void =>
  cache.set(key, data, ttl);

export const cacheHas = (key: string, cache: CacheManager = memoryCache): boolean =>
  cache.has(key);

export const cacheDelete = (key: string, cache: CacheManager = memoryCache): boolean =>
  cache.delete(key);

export const cacheClear = (cache: CacheManager = memoryCache): void =>
  cache.clear();

export const cacheStats = (cache: CacheManager = memoryCache): CacheStats =>
  cache.getStats();

export default CacheManager; 