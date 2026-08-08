/**
 * Dual-Layer Caching Service (Redis Client with Automatic In-Memory Fallback)
 * Provides ultra-fast, low-latency key-value caching for read-heavy operations.
 */
class CacheService {
  constructor() {
    this.memoryCache = new Map();
    this.redisClient = null;
    this.useRedis = false;

    // Optional Redis Initialization
    if (process.env.REDIS_URL || process.env.REDIS_HOST) {
      try {
        const Redis = require('ioredis');
        this.redisClient = new Redis(process.env.REDIS_URL || {
          host: process.env.REDIS_HOST || '127.0.0.1',
          port: parseInt(process.env.REDIS_PORT || '6379', 10),
          lazyConnect: true
        });

        this.redisClient.on('connect', () => {
          console.log('⚡ Redis Cache Service connected successfully.');
          this.useRedis = true;
        });

        this.redisClient.on('error', (err) => {
          console.warn('⚠️ Redis Connection Warning (falling back to in-memory cache):', err.message);
          this.useRedis = false;
        });
      } catch (e) {
        console.warn('ℹ️ ioredis module not found. Operating with high-performance In-Memory Cache Service.');
      }
    }
  }

  /**
   * Get cached value by key
   * @param {string} key
   * @returns {Promise<any|null>}
   */
  async get(key) {
    if (this.useRedis && this.redisClient) {
      try {
        const val = await this.redisClient.get(key);
        return val ? JSON.parse(val) : null;
      } catch (err) {
        console.error('Redis Get Error:', err.message);
      }
    }

    // In-memory fallback lookup
    const item = this.memoryCache.get(key);
    if (!item) return null;

    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Set cached key-value pair with TTL in seconds
   * @param {string} key
   * @param {any} value
   * @param {number} ttlSeconds
   */
  async set(key, value, ttlSeconds = 300) {
    if (this.useRedis && this.redisClient) {
      try {
        await this.redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
        return;
      } catch (err) {
        console.error('Redis Set Error:', err.message);
      }
    }

    // In-memory fallback assignment
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.memoryCache.set(key, { value, expiresAt });
  }

  /**
   * Invalidate cached key
   * @param {string} key
   */
  async del(key) {
    if (this.useRedis && this.redisClient) {
      try {
        await this.redisClient.del(key);
      } catch (err) {
        console.error('Redis Del Error:', err.message);
      }
    }
    this.memoryCache.delete(key);
  }

  /**
   * Clear all matching cache keys
   * @param {string} pattern
   */
  async flushPattern(pattern) {
    this.memoryCache.clear();
    if (this.useRedis && this.redisClient) {
      try {
        const keys = await this.redisClient.keys(`${pattern}*`);
        if (keys.length > 0) {
          await this.redisClient.del(...keys);
        }
      } catch (err) {
        console.error('Redis Flush Error:', err.message);
      }
    }
  }
}

// Export singleton instance
module.exports = new CacheService();
