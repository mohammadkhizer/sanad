import { Redis } from 'ioredis';
import { env } from './env.js';
import { logger } from './logger.js';

export class MemoryRedisMock {
  private store = new Map<string, string>();

  async get(key: string): Promise<string | null> {
    return this.store.get(key) ?? null;
  }

  async set(key: string, value: string, ..._args: (string | number)[]): Promise<'OK'> {
    this.store.set(key, value);
    return 'OK';
  }

  async del(key: string): Promise<number> {
    return this.store.delete(key) ? 1 : 0;
  }

  async incr(key: string): Promise<number> {
    const current = Number(this.store.get(key) || 0) + 1;
    this.store.set(key, String(current));
    return current;
  }

  async expire(_key: string, _seconds: number): Promise<number> {
    return 1;
  }

  status = 'ready';
}

const memoryFallback = new MemoryRedisMock();

export interface RedisClientLike {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ...args: (string | number)[]): Promise<'OK'>;
  del(key: string): Promise<number>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
  status: string;
}

let underlyingClient: Redis | null = null;
const isValidRedisUrl =
  typeof env.REDIS_URL === 'string' &&
  (env.REDIS_URL.startsWith('redis://') || env.REDIS_URL.startsWith('rediss://'));

if (isValidRedisUrl) {
  try {
    const client = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
      retryStrategy(times) {
        if (times > 2) return null;
        return 200;
      },
      lazyConnect: true,
    });

    client.on('error', (err) => {
      logger.warn({ err }, 'Redis connection error; operating in MemoryRedisMock fallback');
    });

    underlyingClient = client;
  } catch (err) {
    logger.warn({ err }, 'Failed to initialize Redis; using in-memory fallback');
  }
} else {
  logger.info('REDIS_URL is not a valid redis:// or rediss:// connection string; using MemoryRedisMock');
}

export const redis: RedisClientLike = {
  get status() {
    return underlyingClient?.status || memoryFallback.status;
  },

  async get(key: string): Promise<string | null> {
    if (!underlyingClient) return memoryFallback.get(key);
    try {
      return await underlyingClient.get(key);
    } catch {
      return memoryFallback.get(key);
    }
  },

  async set(key: string, value: string, ...args: (string | number)[]): Promise<'OK'> {
    if (!underlyingClient) return memoryFallback.set(key, value, ...args);
    try {
      await (underlyingClient as any).set(key, value, ...args);
      return 'OK';
    } catch {
      return memoryFallback.set(key, value, ...args);
    }
  },

  async del(key: string): Promise<number> {
    if (!underlyingClient) return memoryFallback.del(key);
    try {
      return await underlyingClient.del(key);
    } catch {
      return memoryFallback.del(key);
    }
  },

  async incr(key: string): Promise<number> {
    if (!underlyingClient) return memoryFallback.incr(key);
    try {
      return await underlyingClient.incr(key);
    } catch {
      return memoryFallback.incr(key);
    }
  },

  async expire(key: string, seconds: number): Promise<number> {
    if (!underlyingClient) return memoryFallback.expire(key, seconds);
    try {
      return await underlyingClient.expire(key, seconds);
    } catch {
      return memoryFallback.expire(key, seconds);
    }
  },
};

