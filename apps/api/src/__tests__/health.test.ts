import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

describe('API Foundation and Health', () => {
  it('GET /health returns 200 with status ok and uptime', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
    expect(res.body.uptime).toBeTypeOf('number');
  });

  it('GET non-existent endpoint returns 404 with uniform error format', async () => {
    const res = await request(app).get('/api/v1/unknown-endpoint');
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('ROUTE_NOT_FOUND');
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('ROUTE_NOT_FOUND');
    expect(res.body.error.message).toBeDefined();
  });
});

