import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { BloomFilter, usernameService, RESERVED_USERNAMES } from '../services/bloomFilter.service.js';

describe('Username Bloom Filter Availability Engine', () => {
  beforeEach(async () => {
    await usernameService.initialize();
  });

  describe('Bloom Filter Core Properties', () => {
    it('guarantees zero false negatives and recognizes added items', () => {
      const filter = new BloomFilter(1024, 5);
      const testUsernames = ['scholar_tariq', 'learner_zayd', 'ustadh_ahmad'];

      for (const username of testUsernames) {
        expect(filter.has(username)).toBe(false);
        filter.add(username);
        expect(filter.has(username)).toBe(true);
      }

      expect(filter.has('completely_unregistered_name_999')).toBe(false);
    });

    it('clears correctly', () => {
      const filter = new BloomFilter(1024, 5);
      filter.add('temp_user');
      expect(filter.has('temp_user')).toBe(true);
      filter.clear();
      expect(filter.has('temp_user')).toBe(false);
    });
  });

  describe('Username Availability Logic', () => {
    it('blocks reserved system usernames', async () => {
      for (const reserved of Array.from(RESERVED_USERNAMES).slice(0, 5)) {
        const check = await usernameService.checkAvailability(reserved);
        expect(check.available).toBe(false);
        expect(check.reason).toBe('This username is reserved by the platform');
      }
    });

    it('rejects invalid username formats prior to filter checks', async () => {
      const short = await usernameService.checkAvailability('ab');
      expect(short.available).toBe(false);

      const invalidChars = await usernameService.checkAvailability('user@invalid!');
      expect(invalidChars.available).toBe(false);
    });

    it('identifies available usernames instantly', async () => {
      const check = await usernameService.checkAvailability('unique_new_scholar_2026');
      expect(check.available).toBe(true);
    });

    it('registers a username and subsequently flags it as unavailable', async () => {
      const name = 'scholar_hasan';
      usernameService.registerUsername(name);
      const check = await usernameService.checkAvailability(name);
      expect(check.available).toBe(false);
    });
  });

  describe('HTTP Endpoints for Username Availability', () => {
    it('GET /api/v1/auth/check-username returns available true for free usernames', async () => {
      const res = await request(app)
        .get('/api/v1/auth/check-username?username=open_scholar_name')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.available).toBe(true);
      expect(res.body.data.username).toBe('open_scholar_name');
    });

    it('GET /api/v1/auth/check-username returns available false for reserved usernames', async () => {
      const res = await request(app)
        .get('/api/v1/auth/check-username?username=admin')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.available).toBe(false);
      expect(res.body.data.reason).toBe('This username is reserved by the platform');
    });

    it('registration with taken username fails with 409 conflict', async () => {
      usernameService.registerUsername('existing_scholar');

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'existing_scholar',
          email: 'test_taken@example.com',
          password: 'Password12345!',
          displayName: 'Test Scholar',
        });

      expect(res.status).toBe(409);
      expect(res.body.code).toBe('USERNAME_UNAVAILABLE');
    });
  });
});

