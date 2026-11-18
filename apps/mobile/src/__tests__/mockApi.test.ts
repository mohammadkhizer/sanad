(globalThis as any).__DEV__ = true;

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { can, ROLE_PERMISSIONS, Role } from '@sanad/shared';
import { api } from '../api';
import { getApiBaseUrl, getApiMode } from '../api/config';

describe('Sanad Mobile Live API Contracts & RBAC Matrix', () => {
  it('initializes API client targeting live backend', () => {
    assert.equal(getApiMode(), 'http');
    const baseUrl = getApiBaseUrl();
    assert.ok(baseUrl.length > 0);
    assert.ok(baseUrl.includes('/api/v1'));
  });

  it('exposes all required API client service modules', () => {
    assert.ok(api.auth);
    assert.ok(api.users);
    assert.ok(api.content);
    assert.ok(api.verification);
    assert.ok(api.chat);
    assert.ok(api.live);
    assert.ok(api.calls);
    assert.ok(api.moderation);
    assert.ok(api.notifications);
  });

  it('enforces RBAC matrix for all client persona switches', () => {
    const roles: Role[] = ['guest', 'member', 'scholar', 'moderator', 'admin'];

    for (const role of roles) {
      const allowed = ROLE_PERMISSIONS[role];
      assert.ok(allowed);

      if (role === 'guest') {
        assert.equal(can([role], 'content:view'), true);
        assert.equal(can([role], 'content:create'), false);
        assert.equal(can([role], 'live:host'), false);
        assert.equal(can([role], 'role:assign'), false);
      } else if (role === 'scholar') {
        assert.equal(can([role], 'content:create'), true);
        assert.equal(can([role], 'live:host'), true);
        assert.equal(can([role], 'call:initiate'), true);
        assert.equal(can([role], 'role:assign'), false);
      } else if (role === 'member') {
        assert.equal(can([role], 'content:create'), false);
        assert.equal(can([role], 'application:submit'), true);
      } else if (role === 'moderator') {
        assert.equal(can([role], 'application:review'), true);
        assert.equal(can([role], 'user:suspend'), true);
      } else if (role === 'admin') {
        assert.equal(can([role], 'role:assign'), true);
        assert.equal(can([role], 'application:approve'), true);
      }
    }
  });
});
