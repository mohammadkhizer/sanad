import mongoose from 'mongoose';
import fs from 'node:fs';
import path from 'node:path';
import { connectDB, disconnectDB } from '../config/db.js';
import { logger } from '../config/logger.js';

export interface BackupResult {
  timestamp: string;
  backupFile: string;
  collections: Record<string, number>;
}

export interface RestoreResult {
  timestamp: string;
  collections: Record<string, number>;
  success: boolean;
}

export async function createMongoBackup(outputDir = './backups'): Promise<BackupResult> {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.resolve(outputDir, `sanad-backup-${timestamp}.json`);
  const collectionsData: Record<string, any[]> = {};
  const stats: Record<string, number> = {};

  const collectionNames = Object.keys(mongoose.connection.collections);
  for (const name of collectionNames) {
    const coll = mongoose.connection.collections[name];
    const docs = await coll.find({}).toArray();
    collectionsData[name] = docs;
    stats[name] = docs.length;
  }

  fs.writeFileSync(backupFile, JSON.stringify(collectionsData, null, 2), 'utf8');
  logger.info({ backupFile, stats }, 'MongoDB backup created successfully');

  return {
    timestamp,
    backupFile,
    collections: stats,
  };
}

export async function restoreMongoBackup(backupFile: string): Promise<RestoreResult> {
  if (!fs.existsSync(backupFile)) {
    throw new Error(`Backup file does not exist: ${backupFile}`);
  }

  const raw = fs.readFileSync(backupFile, 'utf8');
  const collectionsData: Record<string, any[]> = JSON.parse(raw);
  const stats: Record<string, number> = {};

  for (const [name, docs] of Object.entries(collectionsData)) {
    let coll = mongoose.connection.collections[name];
    if (!coll) {
      await mongoose.connection.createCollection(name);
      coll = mongoose.connection.collections[name];
    }
    await coll.deleteMany({});
    if (docs.length > 0) {
      // Re-hydrate ObjectIds and Dates where applicable
      const rehydrated = docs.map((doc) => {
        if (doc._id && typeof doc._id === 'string' && /^[0-9a-fA-F]{24}$/.test(doc._id)) {
          doc._id = new mongoose.Types.ObjectId(doc._id);
        }
        return doc;
      });
      await coll.insertMany(rehydrated);
    }
    stats[name] = docs.length;
  }

  logger.info({ backupFile, stats }, 'MongoDB restore completed successfully');

  return {
    timestamp: new Date().toISOString(),
    collections: stats,
    success: true,
  };
}

// Standalone execution
if (process.argv[1] && process.argv[1].endsWith('backup.ts')) {
  (async () => {
    try {
      await connectDB();
      const action = process.argv[2] || 'backup';
      if (action === 'backup') {
        const result = await createMongoBackup();
        console.log('Backup finished:', result);
      } else if (action === 'restore') {
        const file = process.argv[3];
        if (!file) {
          console.error('Specify backup file path to restore');
          process.exit(1);
        }
        const result = await restoreMongoBackup(file);
        console.log('Restore finished:', result);
      }
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      console.error('Backup/Restore error:', err);
      process.exit(1);
    }
  })();
}
