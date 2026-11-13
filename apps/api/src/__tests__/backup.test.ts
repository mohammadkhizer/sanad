import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { createMongoBackup, restoreMongoBackup } from '../scripts/backup.js';

describe('MongoDB Backup & Restore Verification', () => {
  const testBackupDir = path.resolve(process.cwd(), './backups-test');

  afterAll(() => {
    if (fs.existsSync(testBackupDir)) {
      fs.rmSync(testBackupDir, { recursive: true, force: true });
    }
  });

  it('creates timestamped JSON backup archive without throwing', async () => {
    const backup = await createMongoBackup(testBackupDir);

    expect(backup.backupFile).toBeDefined();
    expect(fs.existsSync(backup.backupFile)).toBe(true);

    const content = JSON.parse(fs.readFileSync(backup.backupFile, 'utf8'));
    expect(typeof content).toBe('object');
  });

  it('restores database state from generated backup archive successfully', async () => {
    const backup = await createMongoBackup(testBackupDir);
    const restoreResult = await restoreMongoBackup(backup.backupFile);

    expect(restoreResult.success).toBe(true);
    expect(restoreResult.collections).toBeDefined();
  });
});
