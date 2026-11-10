import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User';
import { BloomFilter, usernameService, RESERVED_USERNAMES } from '../services/bloomFilter.service';
import { hashPassword } from '../utils/crypto';

describe('Username Bloom Filter and Multi-Role RBAC Availability Engine', () => {
  beforeEach(async () => {
    const passwordHash = await hashPassword('Password123456!');

    // Create users representing all RBAC roles
    await User.create([
      {
        email: 'member1@sanad.app',
        username: 'learner_bilal',
        displayName: 'Bilal Learner',
        passwordHash,
        roles: ['member'],
        status: 'active',
        tokenVersion: 1,
      },
      {
        email: 'scholar1@sanad.app',
        username: 'scholar_ahmad',
        displayName: 'Sheikh Ahmad',
        passwordHash,
        roles: ['scholar'],
        scholarProfile: { verified: true, specialties: ['Fiqh'], languages: ['Arabic'] },
        twoFA: { enabled: true },
        status: 'active',
        tokenVersion: 1,
      },
      {
        email: 'mod1@sanad.app',
        username: 'moderator_omar',
        displayName: 'Omar Moderator',
        passwordHash,
        roles: ['moderator'],
        status: 'active',
        tokenVersion: 1,
      },
      {
        email: 'admin1@sanad.app',
        username: 'admin_khalid',
        displayName: 'Khalid Admin',
        passwordHash,
        roles: ['admin'],
        status: 'active',
        tokenVersion: 1,
      },
    ]);

    // Initialize username service with DB data
    await usernameService.initialize();
  });

  describe('Pure Bloom Filter Mathematical Properties', () => {
    it('guarantees zero false negatives and recognizes inserted items', () => {
      const filter = new BloomFilter(1024, 5);
      const testUsernames = ['alim_hassan', 'mufti_tariq', 'ustadh_salman', 'student_zayd'];

      for (const u of testUsernames) {
        expect(filter.has(u)).toBe(false);
        filter.add(u);
        expect(filter.has(u)).toBe(true);
      }

      // Negative check
      expect(filter.has('completely_unregistered_name_12345')).toBe(false);
    });
  });

  describe('RBAC Roles Username Check Integration', () => {
    it('detects existing usernames for all RBAC roles (member, scholar, moderator, admin)', async () => {
      const rolesToCheck = [
        'learner_bilal', // member
        'scholar_ahmad', // scholar
        'moderator_omar', // moderator
        'admin_khalid', // admin
      ];

      for (const username of rolesToCheck) {
        const check = await usernameService.checkAvailability(username);
        expect(check.available).toBe(false);
        expect(check.reason).toBe('Username is already taken');
      }
    });

    it('blocks reserved system usernames from being registered', async () => {
      const reserved = ['admin', 'moderator', 'scholar', 'sanad', 'official', 'support', 'system'];

      for (const name of reserved) {
        const check = await usernameService.checkAvailability(name);
        expect(check.available).toBe(false);
        expect(check.reason).toBe('This username is reserved by the platform');
      }
    });

    it('identifies available usernames instantly', async () => {
      const check = await usernameService.checkAvailability('unique_new_student_786');
      expect(check.available).toBe(true);
    });

    it('rejects invalid username formats prior to filter checks', async () => {
      const invalidShort = await usernameService.checkAvailability('ab');
      expect(invalidShort.available).toBe(false);

      const invalidSymbols = await usernameService.checkAvailability('user@invalid!');
      expect(invalidSymbols.available).toBe(false);
    });
  });

  describe('HTTP API Endpoints for Username Bloom Filter', () => {
    it('GET /api/v1/auth/check-username returns available true for free usernames', async () => {
      const res = await request(app)
        .get('/api/v1/auth/check-username?username=open_scholar_name')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.available).toBe(true);
      expect(res.body.data.username).toBe('open_scholar_name');
    });

    it('GET /api/v1/auth/check-username returns available false for taken usernames', async () => {
      const res = await request(app)
        .get('/api/v1/auth/check-username?username=scholar_ahmad')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.available).toBe(false);
      expect(res.body.data.reason).toBe('Username is already taken');
    });

    it('registration with taken username fails and registration with new username registers it in filter', async () => {
      // 1. Attempt registering with taken username
      const conflictRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'newuser@sanad.app',
          username: 'learner_bilal',
          displayName: 'Duplicate Bilal',
          passwordHash: 'ValidPassword123!',
          password: 'ValidPassword123!',
        });

      expect(conflictRes.status).toBe(409);
      expect(conflictRes.body.code).toBe('USERNAME_UNAVAILABLE');

      // 2. Register with brand new username
      const successRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'brandnew@sanad.app',
          username: 'student_farooq',
          displayName: 'Farooq Student',
          password: 'ValidPassword123!',
        });

      expect(successRes.status).toBe(201);
      expect(successRes.body.data.user.username).toBe('student_farooq');

      // 3. Bloom filter should now indicate student_farooq is taken
      const recheck = await request(app)
        .get('/api/v1/auth/check-username?username=student_farooq')
        .expect(200);

      expect(recheck.body.data.available).toBe(false);
    });
  });
});
