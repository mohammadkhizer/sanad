import { Redis } from 'ioredis';
import { env } from './env.js';
import { logger } from './logger.js';

class MemoryRedisMock {
  private store = new Map<string, string>();

  async get(key: string): Promise<string | null> {
    return this.store.get(key) ?? null;
  }

  async set(key: string, value: string, ...args: (string | number)[]): Promise<'OK'> {
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

let redisClientInstance: Redis | MemoryRedisMock;

try {
  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      if (times > 2) return null;
      return 200;
    },
    lazyConnect: true,
  });

  client.on('error', (err) => {
    logger.warn({ err }, 'Redis connection error; fallback enabled');
  });

  redisClientInstance = client;
} catch {
  redisClientInstance = new MemoryRedisMock();
}

export const redis = redisClientInstance;

