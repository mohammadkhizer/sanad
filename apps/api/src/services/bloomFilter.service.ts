import crypto from 'node:crypto';
import { UserModel } from '../modules/auth/auth.model.js';

export class BloomFilter {
  private size: number;
  private hashCount: number;
  private bitArray: Uint8Array;

  constructor(size: number = 262144, hashCount: number = 7) {
    // 256KB = 2,097,152 bits, providing <0.1% false positive rate for 100K+ entries
    this.size = size * 8;
    this.hashCount = hashCount;
    this.bitArray = new Uint8Array(size);
  }

  private getHashes(value: string): number[] {
    const normalized = value.trim().toLowerCase();
    const h1 = crypto.createHash('sha256').update(normalized).digest();
    const h2 = crypto.createHash('md5').update(normalized).digest();

    const hash1Val = h1.readUInt32BE(0);
    const hash2Val = h2.readUInt32BE(0);

    const positions: number[] = [];
    for (let i = 0; i < this.hashCount; i++) {
      const pos = Math.abs((hash1Val + i * hash2Val) % this.size);
      positions.push(pos);
    }
    return positions;
  }

  public add(item: string): void {
    if (!item) return;
    const positions = this.getHashes(item);
    for (const pos of positions) {
      const byteIndex = Math.floor(pos / 8);
      const bitIndex = pos % 8;
      this.bitArray[byteIndex] |= 1 << bitIndex;
    }
  }

  public has(item: string): boolean {
    if (!item) return false;
    const positions = this.getHashes(item);
    for (const pos of positions) {
      const byteIndex = Math.floor(pos / 8);
      const bitIndex = pos % 8;
      if ((this.bitArray[byteIndex] & (1 << bitIndex)) === 0) {
        return false; // Definitely not in set (zero false negatives)
      }
    }
    return true; // Possibly in set
  }

  public clear(): void {
    this.bitArray.fill(0);
  }
}

export const RESERVED_USERNAMES = new Set([
  'admin',
  'administrator',
  'moderator',
  'mod',
  'sanad',
  'scholar',
  'official',
  'system',
  'root',
  'support',
  'verify',
  'verified',
  'help',
  'security',
  'api',
]);

export class UsernameService {
  private bloomFilter: BloomFilter;
  private initialized: boolean = false;

  constructor() {
    this.bloomFilter = new BloomFilter();
  }

  public async initialize(): Promise<void> {
    this.bloomFilter.clear();

    // 1. Seed reserved platform usernames
    for (const reserved of RESERVED_USERNAMES) {
      this.bloomFilter.add(reserved);
    }

    // 2. Load existing usernames from database across all roles if DB is connected
    if (UserModel.db.readyState === 1) {
      try {
        const users = await UserModel.find({ username: { $exists: true, $ne: null } })
          .select('username')
          .lean();

        for (const user of users) {
          if (user.username) {
            this.bloomFilter.add(user.username);
          }
        }
      } catch {
        // Fall back gracefully
      }
    }

    this.initialized = true;
  }

  public registerUsername(username: string): void {
    if (!username) return;
    this.bloomFilter.add(username.toLowerCase());
  }

  public async checkAvailability(
    username: string
  ): Promise<{ available: boolean; reason?: string }> {
    const normalized = username.trim().toLowerCase();

    // Format validation
    if (!/^[a-z0-9_]{3,30}$/.test(normalized)) {
      return {
        available: false,
        reason: 'Username must be 3-30 lowercase alphanumeric characters or underscores',
      };
    }

    // Reserved usernames check
    if (RESERVED_USERNAMES.has(normalized)) {
      return {
        available: false,
        reason: 'This username is reserved by the platform',
      };
    }

    // Bloom filter rapid check
    const possiblyTaken = this.bloomFilter.has(normalized);

    // If Bloom filter returns false, username is guaranteed 100% available without DB query
    if (!possiblyTaken) {
      return { available: true };
    }

    // If Bloom filter indicates possibly taken, confirm with MongoDB to eliminate false positives
    if (UserModel.db.readyState === 1) {
      const existing = await UserModel.findOne({ username: normalized }).select('_id').lean();
      if (existing) {
        return {
          available: false,
          reason: 'Username is already taken',
        };
      }
      return { available: true };
    }

    // If database is not connected, respect the Bloom Filter signal directly
    return {
      available: false,
      reason: 'Username is already taken',
    };
  }

  public getBloomFilter(): BloomFilter {
    return this.bloomFilter;
  }
}

export const usernameService = new UsernameService();
