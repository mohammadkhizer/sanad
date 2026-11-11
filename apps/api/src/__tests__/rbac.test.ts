import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { generateAccessToken } from '../utils/tokens.js';

describe('RBAC and Authorization Guards', () => {
  it('member cannot create posts (returns 403 Forbidden)', async () => {
    const memberToken = await generateAccessToken({
      sub: '507f1f77bcf86cd799439011',
      roles: ['member'],
      sessionId: '507f1f77bcf86cd799439012',
    });

    const res = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({
        type: 'text',
        caption: 'Unauthorized test post',
      });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN_PERMISSION');
    expect(res.body.error).toBeDefined();
  });

  it('unauthenticated guest cannot access member endpoints', async () => {
    const res = await request(app).get('/api/v1/users/me');
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('UNAUTHORIZED');
  });

  it('unauthenticated guest cannot submit scholar application', async () => {
    const res = await request(app).post('/api/v1/scholar/applications').send({
      credentials: [{ type: 'degree', fileKey: 'test.pdf', institution: 'Al-Azhar', year: 2020 }],
      statement: 'I am a scholar of Islamic jurisprudence.',
      institution: 'Al-Azhar',
      specialties: ['Fiqh'],
      languages: ['Arabic', 'English'],
    });

    expect(res.status).toBe(401);
  });
});

