import request from 'supertest';
import { app } from '../app';
import { User } from '../models/User';
import { Post } from '../models/Post';
import { Notification } from '../models/Notification';
import { storageService } from '../services/storage.service';
import { livekitService } from '../services/livekit.service';
import { generateAccessToken } from '../utils/tokens';

describe('Media Pipeline, LiveKit RTC, and Notification Engine', () => {
  let memberUser: any;
  let scholarUser: any;
  let memberToken: string;
  let scholarToken: string;

  beforeEach(async () => {
    memberUser = await User.create({
      email: 'media_member@sanad.app',
      passwordHash: 'dummy_hash_for_test',
      phone: '+966500000021',
      username: 'media_member',
      displayName: 'Media Member',
      roles: ['member'],
      status: 'active',
      tokenVersion: 1,
    });
    memberToken = generateAccessToken(
      memberUser.id,
      memberUser.roles,
      memberUser.tokenVersion
    );

    scholarUser = await User.create({
      email: 'media_scholar@sanad.app',
      passwordHash: 'dummy_hash_for_test',
      phone: '+966500000022',
      username: 'media_scholar',
      displayName: 'Media Scholar',
      roles: ['scholar'],
      status: 'active',
      tokenVersion: 1,
      isTwoFactorEnabled: true,
      scholarProfile: {
        title: 'Sheikh',
        specialization: ['hadith'],
        verificationBadge: true,
      },
    });
    scholarToken = generateAccessToken(
      scholarUser.id,
      scholarUser.roles,
      scholarUser.tokenVersion
    );
  });

  describe('Storage Service and MIME Validation', () => {
    it('generates valid signed upload URL for allowed media MIME types', () => {
      const allowedMimes = [
        { mime: 'application/pdf', ext: 'pdf' },
        { mime: 'image/jpeg', ext: 'jpg' },
        { mime: 'image/png', ext: 'png' },
        { mime: 'image/webp', ext: 'webp' },
      ];

      for (const item of allowedMimes) {
        const upload = storageService.generateCredentialUploadUrl(
          memberUser.id,
          item.mime,
          item.ext
        );
        expect(upload).toHaveProperty('uploadUrl');
        expect(upload).toHaveProperty('fileKey');
        expect(upload.uploadUrl).toContain('https://');
        expect(upload.fileKey).toContain(memberUser.id);
      }
    });

    it('rejects disallowed or dangerous MIME types', () => {
      const dangerousMimes = ['application/x-msdownload', 'text/html', 'application/javascript'];
      for (const mime of dangerousMimes) {
        expect(() => {
          storageService.generateCredentialUploadUrl(memberUser.id, mime, 'exe');
        }).toThrow('Unsupported document format');
      }
    });

    it('generates signed download URL for staff with expiration', () => {
      const download = storageService.generateCredentialDownloadUrl(
        'credentials/user-123/doc.pdf',
        ['admin']
      );
      expect(download).toHaveProperty('downloadUrl');
      expect(download.downloadUrl).toContain('credentials/user-123/doc.pdf');
    });

    it('forbids non-staff from generating credential download URLs', () => {
      expect(() => {
        storageService.generateCredentialDownloadUrl('credentials/user-123/doc.pdf', ['member']);
      }).toThrow();
    });
  });

  describe('LiveKit Scoped Media Grants', () => {
    it('creates host token with full publishing permissions', () => {
      const hostPayload = livekitService.createHostToken(
        scholarUser.id,
        scholarUser.displayName,
        'live-room-101'
      );
      expect(hostPayload.role).toBe('host');
      expect(hostPayload.roomName).toBe('live-room-101');

      const claims = livekitService.decodeAndVerifyToken(hostPayload.token);
      expect(claims.video.room).toBe('live-room-101');
      expect(claims.video.canPublish).toBe(true);
      expect(claims.video.canSubscribe).toBe(true);
      expect(claims.video.canPublishData).toBe(true);
    });

    it('creates viewer token with subscriber-only permissions (cannot publish video/audio)', () => {
      const viewerPayload = livekitService.createViewerToken(
        memberUser.id,
        memberUser.displayName,
        'live-room-101'
      );
      expect(viewerPayload.role).toBe('viewer');

      const claims = livekitService.decodeAndVerifyToken(viewerPayload.token);
      expect(claims.video.room).toBe('live-room-101');
      expect(claims.video.canPublish).toBe(false);
      expect(claims.video.canSubscribe).toBe(true);
      expect(claims.video.canPublishData).toBe(true);
    });

    it('creates 1:1 call token with bidirectional audio/video grants', () => {
      const callPayload = livekitService.createCallToken(
        memberUser.id,
        memberUser.displayName,
        'call-room-202'
      );
      const claims = livekitService.decodeAndVerifyToken(callPayload.token);
      expect(claims.video.canPublish).toBe(true);
      expect(claims.video.canSubscribe).toBe(true);
    });
  });

  describe('Mux Video Webhook Processing', () => {
    it('updates post status to live when video.asset.ready event is received', async () => {
      const testPost = await Post.create({
        authorId: scholarUser._id,
        type: 'reel',
        caption: 'Hadith Explanation Reel',
        muxAssetId: 'mux-asset-123',
        status: 'processing',
      });

      const webhookEvent = {
        type: 'video.asset.ready',
        id: 'evt-123',
        created_at: new Date().toISOString(),
        data: {
          id: 'mux-asset-123',
          playback_ids: [{ id: 'playback-789', policy: 'public' }],
          duration: 45.5,
          status: 'ready',
        },
      };

      const res = await request(app)
        .post('/api/v1/webhooks/mux')
        .send(webhookEvent)
        .expect(200);

      expect(res.body.received).toBe(true);

      const updatedPost = await Post.findById(testPost.id);
      expect(updatedPost?.status).toBe('live');
      expect(updatedPost?.playbackId).toBe('playback-789');
    });

    it('marks post as removed when video.asset.errored event is received', async () => {
      const failedPost = await Post.create({
        authorId: scholarUser._id,
        type: 'video',
        caption: 'Corrupted Video Lecture',
        muxAssetId: 'mux-asset-bad',
        status: 'processing',
      });

      const webhookEvent = {
        type: 'video.asset.errored',
        id: 'evt-456',
        created_at: new Date().toISOString(),
        data: {
          id: 'mux-asset-bad',
        },
      };

      await request(app)
        .post('/api/v1/webhooks/mux')
        .send(webhookEvent)
        .expect(200);

      const updatedPost = await Post.findById(failedPost.id);
      expect(updatedPost?.status).toBe('removed');
    });
  });

  describe('Notification Engine API Endpoints', () => {
    it('returns user notifications and unread count', async () => {
      await Notification.create([
        {
          recipientId: memberUser._id,
          title: 'Live Session Started',
          body: 'Sheikh has started a live lecture',
          type: 'live_started',
          isRead: false,
        },
        {
          recipientId: memberUser._id,
          title: 'Welcome to Sanad',
          body: 'Account setup complete',
          type: 'verification_update',
          isRead: true,
        },
      ]);

      const res = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
      expect(res.body.meta.unreadCount).toBe(1);
    });

    it('marks a single notification as read', async () => {
      const notif = await Notification.create({
        recipientId: memberUser._id,
        title: 'New Chat Request',
        body: 'A member sent you a message request',
        type: 'chat_request',
        isRead: false,
      });

      const res = await request(app)
        .patch(`/api/v1/notifications/${notif.id}/read`)
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.isRead).toBe(true);

      const updated = await Notification.findById(notif.id);
      expect(updated?.isRead).toBe(true);
    });

    it('marks all notifications as read', async () => {
      await Notification.create([
        {
          recipientId: memberUser._id,
          title: 'Notification 1',
          body: 'Body 1',
          type: 'new_lecture',
          isRead: false,
        },
        {
          recipientId: memberUser._id,
          title: 'Notification 2',
          body: 'Body 2',
          type: 'live_started',
          isRead: false,
        },
      ]);

      const res = await request(app)
        .post('/api/v1/notifications/mark-all-read')
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);

      const unreadCount = await Notification.countDocuments({
        recipientId: memberUser._id,
        isRead: false,
      });
      expect(unreadCount).toBe(0);
    });
  });
});
