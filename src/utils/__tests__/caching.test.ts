import CacheManager, { 
  memoryCache, 
  cacheGet,
  cacheSet,
  cacheHas,
  cacheDelete,
  cacheClear,
  cacheStats
} from '../caching';

describe('CacheManager', () => {
  let cache: CacheManager;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    cache = new CacheManager({ storage: 'memory' });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('memory cache', () => {
    it('should set and get values', () => {
      const testData = { name: 'test', value: 123 };
      cache.set('test-key', testData);

      const result = cache.get('test-key');
      expect(result).toEqual(testData);
    });

    it('should return null for non-existent keys', () => {
      const result = cache.get('non-existent');
      expect(result).toBeNull();
    });

    it('should check if key exists', () => {
      cache.set('test-key', 'test-value');
      
      expect(cache.has('test-key')).toBe(true);
      expect(cache.has('non-existent')).toBe(false);
    });

    it('should delete keys', () => {
      cache.set('test-key', 'test-value');
      expect(cache.has('test-key')).toBe(true);

      const deleted = cache.delete('test-key');
      expect(deleted).toBe(true);
      expect(cache.has('test-key')).toBe(false);
    });

    it('should clear all cache', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      expect(cache.getSize()).toBe(2);

      cache.clear();
      expect(cache.getSize()).toBe(0);
    });

    it('should respect TTL', () => {
      cache.set('test-key', 'test-value', 1000); // 1 second TTL
      
      // Before expiration
      expect(cache.get('test-key')).toBe('test-value');
      
      // After expiration
      jest.advanceTimersByTime(1001);
      expect(cache.get('test-key')).toBeNull();
    });

    it('should evict oldest items when cache is full', () => {
      const smallCache = new CacheManager({ maxSize: 3, storage: 'memory' });
      
      smallCache.set('key1', 'value1');
      smallCache.set('key2', 'value2');
      smallCache.set('key3', 'value3');
      expect(smallCache.getSize()).toBe(3);

      // Adding a fourth item should evict the oldest
      smallCache.set('key4', 'value4');
      expect(smallCache.getSize()).toBe(3);
      expect(smallCache.get('key1')).toBeNull(); // Oldest item should be evicted
      expect(smallCache.get('key4')).toBe('value4'); // Newest item should be available
    });

    it('should get cache statistics', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      // Get some values to increase hits
      cache.get('key1');
      cache.get('key2');
      cache.get('non-existent'); // This should increase misses
      
      const stats = cache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.size).toBe(2);
    });

    it('should get all keys', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      const keys = cache.getKeys();
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toHaveLength(2);
    });

    it('should invalidate cache by pattern', () => {
      cache.set('user:1', 'user1');
      cache.set('user:2', 'user2');
      cache.set('config:theme', 'dark');
      
      const invalidatedCount = cache.invalidatePattern(/^user:/);
      expect(invalidatedCount).toBe(2);
      expect(cache.get('user:1')).toBeNull();
      expect(cache.get('user:2')).toBeNull();
      expect(cache.get('config:theme')).toBe('dark'); // Should still exist
    });
  });

  describe('default cache instances', () => {
    it('should provide default memory cache', () => {
      memoryCache.set('test-key', 'test-value');
      expect(memoryCache.get('test-key')).toBe('test-value');
    });
  });

  describe('convenience functions', () => {
    it('should provide cacheGet function', () => {
      memoryCache.set('test-key', 'test-value');
      expect(cacheGet('test-key')).toBe('test-value');
    });

    it('should provide cacheSet function', () => {
      cacheSet('test-key', 'test-value');
      expect(memoryCache.get('test-key')).toBe('test-value');
    });

    it('should provide cacheHas function', () => {
      memoryCache.set('test-key', 'test-value');
      expect(cacheHas('test-key')).toBe(true);
    });

    it('should provide cacheDelete function', () => {
      memoryCache.set('test-key', 'test-value');
      expect(cacheDelete('test-key')).toBe(true);
      expect(memoryCache.get('test-key')).toBeNull();
    });

    it('should provide cacheClear function', () => {
      memoryCache.set('test-key', 'test-value');
      cacheClear();
      expect(memoryCache.getSize()).toBe(0);
    });

    it('should provide cacheStats function', () => {
      memoryCache.set('test-key', 'test-value');
      memoryCache.get('test-key');
      const stats = cacheStats();
      expect(stats.hits).toBe(1);
      expect(stats.size).toBe(1);
    });
  });

  describe('cleanup', () => {
    it('should clean up expired items periodically', () => {
      cache.set('expired-key', 'expired-value', 1000); // 1 second TTL
      cache.set('valid-key', 'valid-value', 10000); // 10 seconds TTL
      
      // Advance time past expiration
      jest.advanceTimersByTime(1001);
      
      // Manually trigger cleanup by calling get on expired item
      expect(cache.get('expired-key')).toBeNull();
      
      // The valid key should still be available since it hasn't expired yet
      expect(cache.get('valid-key')).toBe('valid-value');
    });

    it('should handle cleanup with no expired items', () => {
      cache.set('valid-key', 'valid-value', 10000); // 10 seconds TTL
      
      // The valid key should still be available since it hasn't expired yet
      expect(cache.get('valid-key')).toBe('valid-value');
    });
  });
}); 