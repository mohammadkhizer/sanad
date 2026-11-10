import crypto from 'crypto';
import { User } from '../models/User';

export class BloomFilter {
  private size: number;
  private hashCount: number;
  private bitArray: Uint8Array;

  constructor(size: number = 262144, hashCount: number = 7) {
    // Default size is 256KB (2,097,152 bits) providing sub-0.1% false positive rate for 100K+ users
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
      // Kirsch-Mitzenmacher double hashing: (h1 + i * h2) % size
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
        return false; // Definitely not in set
      }
    }
    return true; // Possibly in set
  }

  public clear(): void {
    this.bitArray.fill(0);
  }
}

// System-wide reserved usernames across all roles
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

    // 1. Seed reserved usernames
    for (const reserved of RESERVED_USERNAMES) {
      this.bloomFilter.add(reserved);
    }

    // 2. Load all existing usernames from MongoDB across all RBAC user roles (member, scholar, moderator, admin)
    const users = await User.find({ username: { $exists: true, $ne: null } })
      .select('username')
      .lean();

    for (const user of users) {
      if (user.username) {
        this.bloomFilter.add(user.username);
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

    // Syntax validation
    if (!/^[a-z0-9_]{3,30}$/.test(normalized)) {
      return {
        available: false,
        reason: 'Username must be 3-30 lowercase alphanumeric characters or underscores',
      };
    }

    // Reserved check
    if (RESERVED_USERNAMES.has(normalized)) {
      return {
        available: false,
        reason: 'This username is reserved by the platform',
      };
    }

    // Bloom filter rapid pre-check
    const possiblyTaken = this.bloomFilter.has(normalized);

    // If Bloom filter says false, it is 100% definitely NOT taken (zero database lookups needed)
    if (!possiblyTaken) {
      return { available: true };
    }

    // If Bloom filter indicates possibly taken, confirm with MongoDB to rule out false positives
    const existing = await User.findOne({ username: normalized }).select('_id').lean();
    if (existing) {
      return {
        available: false,
        reason: 'Username is already taken',
      };
    }

    // False positive in Bloom filter, but available in DB
    return { available: true };
  }

  public getBloomFilter(): BloomFilter {
    return this.bloomFilter;
  }
}

export const usernameService = new UsernameService();

