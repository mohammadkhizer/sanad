import { describe, it } from 'node:test';
import assert from 'node:assert';
import { can, PERMISSIONS, ROLE_PERMISSIONS } from './permissions.js';
import { ROLES, Role } from './roles.js';

describe('RBAC Permission Matrix', () => {
  it('every defined role has an entry in ROLE_PERMISSIONS', () => {
    for (const role of ROLES) {
      assert.ok(role in ROLE_PERMISSIONS, `Missing role in matrix: ${role}`);
    }
  });

  it('scholar can create content, host live, and initiate calls', () => {
    assert.strictEqual(can(['scholar'], 'content:create'), true);
    assert.strictEqual(can(['scholar'], 'live:host'), true);
    assert.strictEqual(can(['scholar'], 'call:initiate'), true);
  });

  it('member can submit application and like/comment, but cannot create content', () => {
    assert.strictEqual(can(['member'], 'application:submit'), true);
    assert.strictEqual(can(['member'], 'content:like_comment'), true);
    assert.strictEqual(can(['member'], 'content:create'), false);
    assert.strictEqual(can(['member'], 'live:host'), false);
    assert.strictEqual(can(['member'], 'call:initiate'), false);
  });

  it('guest has only read-only access to view content', () => {
    assert.strictEqual(can(['guest'], 'content:view'), true);
    assert.strictEqual(can(['guest'], 'content:like_comment'), false);
    assert.strictEqual(can(['guest'], 'content:create'), false);
    assert.strictEqual(can([], 'content:view'), true);
  });

  it('moderator can review applications, suspend users, and remove any content', () => {
    assert.strictEqual(can(['moderator'], 'application:review'), true);
    assert.strictEqual(can(['moderator'], 'user:suspend'), true);
    assert.strictEqual(can(['moderator'], 'content:remove_any'), true);
    assert.strictEqual(can(['moderator'], 'application:approve'), false);
    assert.strictEqual(can(['moderator'], 'role:assign'), false);
  });

  it('admin can approve applications, assign roles, and revoke scholar', () => {
    assert.strictEqual(can(['admin'], 'application:approve'), true);
    assert.strictEqual(can(['admin'], 'role:assign'), true);
    assert.strictEqual(can(['admin'], 'role:revoke_scholar'), true);
    assert.strictEqual(can(['admin'], 'audit:view'), true);
    assert.strictEqual(can(['admin'], 'content:remove_any'), true);
    assert.strictEqual(can(['admin'], 'application:submit'), false);
  });
});
