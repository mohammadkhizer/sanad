import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { mockAdapter } from '../api/mock/adapter';
import { devSettings } from '../api/config';
import { can, ROLE_PERMISSIONS, Role } from '@sanad/shared';

describe('Sanad Mobile Frontend Mock API & RBAC Matrix', () => {
  beforeEach(() => {
    devSettings.latencyMs = 0;
    devSettings.forceError = false;
    devSettings.emptyData = false;
  });

  it('authenticates user and returns session tokens and profile', async () => {
    const res = await mockAdapter.auth.login({
      identifier: 'scholar1@sanad.app',
      password: 'password123',
    });

    assert.ok(res.user);
    assert.ok(res.user.roles.includes('scholar'));
    assert.equal(res.user.displayName, 'Dr. Omar Farooq');
    assert.ok(res.accessToken);
    assert.ok(res.refreshToken);
  });

  it('retrieves content feed conforming to post entity contract', async () => {
    const feed = await mockAdapter.content.getFeed({ tab: 'discover', limit: 10 });

    assert.ok(feed.items);
    assert.ok(feed.items.length > 0);
    const post = feed.items[0];
    assert.ok(post._id);
    assert.equal(post.visibility, 'public');
    assert.ok(post.counts.likes >= 0);
  });

  it('respects empty data simulation toggle', async () => {
    devSettings.emptyData = true;
    const feed = await mockAdapter.content.getFeed({ tab: 'discover', limit: 10 });
    assert.deepEqual(feed.items, []);
    assert.equal(feed.nextCursor, undefined);
  });

  it('respects force error simulation toggle', async () => {
    devSettings.forceError = true;
    await assert.rejects(
      async () => {
        await mockAdapter.content.getFeed({ tab: 'discover', limit: 10 });
      },
      {
        message: 'Simulation Error: Forced failure mode is enabled in Dev Settings',
      }
    );
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

  it('handles scholar application status and triage queue', async () => {
    const app = await mockAdapter.verification.getApplication('app_001');
    assert.ok(app);
    assert.equal(app?.status, 'pending');
    assert.ok(app?.credentials.length > 0);
  });

  it('handles live circles and active room fetching', async () => {
    const circles = await mockAdapter.live.getLiveSessions();
    assert.ok(Array.isArray(circles));
    assert.ok(circles.length > 0);
    assert.equal(circles[0].status, 'live');
  });

  it('handles conversations and inquiry requests', async () => {
    const inquiries = await mockAdapter.chat.getConversations('requests');
    assert.ok(Array.isArray(inquiries));
    assert.ok(inquiries.length > 0);
    assert.equal(inquiries[0].isRequest, true);
    assert.equal(inquiries[0].requestStatus, 'pending');
  });
});
