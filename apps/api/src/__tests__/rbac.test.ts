import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User';
import { Post } from '../models/Post';
import { RefreshToken } from '../models/RefreshToken';
import { ScholarApplication } from '../models/ScholarApplication';
import { generateAccessToken } from '../utils/tokens';
import { hashPassword, hashToken } from '../utils/crypto';

describe('Sanad RBAC, Security and Core Workflow Tests', () => {
  let memberUser: any;
  let memberToken: string;

  let scholarUser: any;
  let scholarToken: string;

  let scholarNo2FaUser: any;
  let scholarNo2FaToken: string;

  let moderatorUser: any;
  let moderatorToken: string;

  let adminUser: any;
  let adminToken: string;

  beforeEach(async () => {
    const defaultPasswordHash = await hashPassword('SecurePass123!');

    // 1. Member
    memberUser = await User.create({
      email: 'member@sanad.app',
      displayName: 'Learner Member',
      passwordHash: defaultPasswordHash,
      roles: ['member'],
      status: 'active',
      tokenVersion: 1,
    });
    memberToken = generateAccessToken(memberUser.id, memberUser.roles, memberUser.tokenVersion);

    // 2. Scholar with 2FA
    scholarUser = await User.create({
      email: 'scholar@sanad.app',
      displayName: 'Sheikh Ahmad',
      passwordHash: defaultPasswordHash,
      roles: ['member', 'scholar'],
      scholarProfile: {
        verified: true,
        verifiedAt: new Date(),
        institution: 'Al-Azhar University',
        specialties: ['Hadith', 'Fiqh'],
        languages: ['Arabic', 'English'],
      },
      twoFA: { enabled: true, secretEnc: 'mock-encrypted-secret' },
      status: 'active',
      tokenVersion: 1,
    });
    scholarToken = generateAccessToken(scholarUser.id, scholarUser.roles, scholarUser.tokenVersion);

    // 3. Scholar without 2FA
    scholarNo2FaUser = await User.create({
      email: 'scholarno2fa@sanad.app',
      displayName: 'Scholar Pending 2FA',
      passwordHash: defaultPasswordHash,
      roles: ['member', 'scholar'],
      scholarProfile: { verified: true, specialties: [], languages: [] },
      twoFA: { enabled: false },
      status: 'active',
      tokenVersion: 1,
    });
    scholarNo2FaToken = generateAccessToken(
      scholarNo2FaUser.id,
      scholarNo2FaUser.roles,
      scholarNo2FaUser.tokenVersion
    );

    // 4. Moderator
    moderatorUser = await User.create({
      email: 'moderator@sanad.app',
      displayName: 'Reviewer Omar',
      passwordHash: defaultPasswordHash,
      roles: ['member', 'moderator'],
      twoFA: { enabled: true },
      status: 'active',
      tokenVersion: 1,
    });
    moderatorToken = generateAccessToken(
      moderatorUser.id,
      moderatorUser.roles,
      moderatorUser.tokenVersion
    );

    // 5. Admin
    adminUser = await User.create({
      email: 'admin@sanad.app',
      displayName: 'Super Admin',
      passwordHash: defaultPasswordHash,
      roles: ['member', 'admin'],
      twoFA: { enabled: true },
      status: 'active',
      tokenVersion: 1,
    });
    adminToken = generateAccessToken(adminUser.id, adminUser.roles, adminUser.tokenVersion);
  });

  describe('Post Creation RBAC & Policy', () => {
    it('member cannot post video/reel (must return 403 FORBIDDEN)', async () => {
      const res = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          type: 'reel',
          caption: 'Member attempting to post',
        });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN');
    });

    it('scholar without 2FA cannot post (must return 403 TWO_FACTOR_REQUIRED)', async () => {
      const res = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${scholarNo2FaToken}`)
        .send({
          type: 'reel',
          caption: 'Scholar without 2FA attempting to post',
        });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('TWO_FACTOR_REQUIRED');
    });

    it('verified scholar with 2FA can successfully create a post', async () => {
      const res = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${scholarToken}`)
        .send({
          type: 'reel',
          caption: 'Explanation of Hadith 1 from 40 Nawawi',
          tags: ['hadith', 'fiqh'],
          language: 'en',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.caption).toBe('Explanation of Hadith 1 from 40 Nawawi');
      expect(res.body.data.authorId).toBe(scholarUser.id);
    });

    it('revoked scholar cannot post after revocation', async () => {
      // Admin revokes scholar
      await request(app)
        .post(`/api/v1/admin/users/${scholarUser.id}/revoke-scholar`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Verification credentials could not be validated' });

      // Attempt to post with newly issued token for the revoked user
      const updatedScholar = await User.findById(scholarUser.id);
      expect(updatedScholar?.roles).not.toContain('scholar');

      const newToken = generateAccessToken(
        updatedScholar!.id,
        updatedScholar!.roles,
        updatedScholar!.tokenVersion
      );

      const res = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${newToken}`)
        .send({
          type: 'reel',
          caption: 'Post after revocation',
        });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN');
    });
  });

  describe('Post Editing Ownership Check', () => {
    it('scholar cannot edit another scholar post', async () => {
      const otherScholar = await User.create({
        email: 'other_scholar@sanad.app',
        displayName: 'Sheikh Zaid',
        passwordHash: await hashPassword('Pass1234567!'),
        roles: ['scholar'],
        status: 'active',
        tokenVersion: 1,
      });

      const post = await Post.create({
        authorId: otherScholar._id,
        type: 'video',
        caption: 'Original Post',
        status: 'live',
      });

      const res = await request(app)
        .patch(`/api/v1/posts/${post.id}`)
        .set('Authorization', `Bearer ${scholarToken}`)
        .send({ caption: 'Tampered caption' });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('NOT_OWNER');
    });
  });

  describe('Scholar Verification & Separation of Duties', () => {
    it('moderator cannot approve scholar application (only Admin can approve)', async () => {
      const appDoc = await ScholarApplication.create({
        userId: memberUser._id,
        credentials: [
          {
            type: 'Ijazah',
            fileKey: 'credentials/member/ijazah.pdf',
            institution: 'Al-Azhar',
            year: 2020,
          },
        ],
        statement: 'Statement of scholarly qualification',
        institution: 'Al-Azhar',
        specialties: ['Tafsir'],
        languages: ['Arabic', 'English'],
        status: 'pending',
      });

      const res = await request(app)
        .post(`/api/v1/admin/applications/${appDoc.id}/decision`)
        .set('Authorization', `Bearer ${moderatorToken}`)
        .send({ status: 'approved', reviewNote: 'Reviewed by moderator' });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('ADMIN_APPROVAL_REQUIRED');
    });

    it('admin can approve scholar application and updates user role and badge', async () => {
      const appDoc = await ScholarApplication.create({
        userId: memberUser._id,
        credentials: [
          {
            type: 'Degree',
            fileKey: 'credentials/member/degree.pdf',
            institution: 'Medina Islamic University',
            year: 2018,
          },
        ],
        statement: 'Statement of scholarly qualification',
        institution: 'Medina Islamic University',
        specialties: ['Hadith'],
        languages: ['Arabic', 'Urdu'],
        status: 'pending',
      });

      const res = await request(app)
        .post(`/api/v1/admin/applications/${appDoc.id}/decision`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'approved', reviewNote: 'Credentials verified by board' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('approved');

      const promotedUser = await User.findById(memberUser.id);
      expect(promotedUser?.roles).toContain('scholar');
      expect(promotedUser?.scholarProfile.verified).toBe(true);
      expect(promotedUser?.scholarProfile.institution).toBe('Medina Islamic University');
    });
  });

  describe('Token Rotation and Reuse Detection', () => {
    it('rotating refresh token works and reuse detection revokes entire token family', async () => {
      // 1. Initial login
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'member@sanad.app', password: 'SecurePass123!' });

      expect(loginRes.status).toBe(200);
      const firstRefreshToken = loginRes.body.data.tokens.refreshToken;

      // 2. Refresh token rotation (exchange firstRefreshToken for secondRefreshToken)
      const refreshRes1 = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: firstRefreshToken });

      expect(refreshRes1.status).toBe(200);
      const secondRefreshToken = refreshRes1.body.data.tokens.refreshToken;
      expect(secondRefreshToken).not.toBe(firstRefreshToken);

      // 3. Attempting to reuse the now revoked firstRefreshToken (Simulate theft/replay attack)
      const reuseRes = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: firstRefreshToken });

      expect(reuseRes.status).toBe(401);
      expect(reuseRes.body.code).toBe('TOKEN_REUSE_DETECTED');

      // 4. Verify that secondRefreshToken from the same family is now also revoked!
      const refreshRes2 = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: secondRefreshToken });

      expect(refreshRes2.status).toBe(401);
    });
  });

  describe('Account Deletion and Suspended User Enforcement', () => {
    it('user can delete their account per UGC compliance', async () => {
      const res = await request(app)
        .delete('/api/v1/users/me')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(200);

      const deleted = await User.findById(memberUser.id);
      expect(deleted?.status).toBe('deleted');

      // Subsequent authenticated requests must fail
      const subsequent = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(subsequent.status).toBe(401);
    });

    it('moderator suspension immediately blocks user access', async () => {
      // Moderator suspends scholar
      const suspendRes = await request(app)
        .post(`/api/v1/admin/users/${scholarUser.id}/suspend`)
        .set('Authorization', `Bearer ${moderatorToken}`)
        .send({ reason: 'Repeated violation of sectarian peace policy' });

      expect(suspendRes.status).toBe(200);

      // Scholar cannot access feed/posting anymore
      const tryAccess = await request(app)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${scholarToken}`)
        .send({ type: 'reel', caption: 'Banned post' });

      expect(tryAccess.status).toBe(403);
      expect(tryAccess.body.code).toBe('ACCOUNT_SUSPENDED');
    });
  });
});
