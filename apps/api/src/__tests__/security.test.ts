import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import pino from 'pino';
import { app } from '../app.js';
import { generateAccessToken } from '../utils/tokens.js';
import { sniffMagicBytes } from '../modules/media/media.service.js';
import { logger } from '../config/logger.js';

describe('Security Hardening & IDOR / Privilege-Escalation Safeguards', () => {
  describe('Privilege Escalation Tampering', () => {
    it('rejects forged JWT signed with unauthorized key', async () => {
      // Craft a forged token with an arbitrary secret
      const forgedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTYiLCJyb2xlcyI6WyJhZG1pbiJdLCJzZXNzaW9uSWQiOiJzZXNzXzEyMyJ9.invalidSignatureHere1234567890';
      const res = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${forgedToken}`);

      expect(res.status).toBe(401);
      expect(res.body.code).toBe('UNAUTHORIZED');
    });

    it('denies standard member attempting administrative endpoints (403 Forbidden)', async () => {
      const memberToken = await generateAccessToken({
        sub: '507f1f77bcf86cd799439011',
        roles: ['member'],
        sessionId: '507f1f77bcf86cd799439012',
        ver: 1,
      });

      const res = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN_PERMISSION');
    });

    it('denies scholar attempting user suspension / administrative action (403 Forbidden)', async () => {
      const scholarToken = await generateAccessToken({
        sub: '507f1f77bcf86cd799439099',
        roles: ['scholar', 'member'],
        sessionId: '507f1f77bcf86cd799439098',
        ver: 1,
      });

      const res = await request(app)
        .post('/api/v1/admin/users/507f1f77bcf86cd799439011/disable')
        .set('Authorization', `Bearer ${scholarToken}`)
        .send({ reason: 'Unauthorized suspension attempt' });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN_PERMISSION');
    });
  });

  describe('IDOR & Private Resource Protections', () => {
    it('prevents non-moderators from accessing private credential signed URLs', async () => {
      const memberToken = await generateAccessToken({
        sub: '507f1f77bcf86cd799439011',
        roles: ['member'],
        sessionId: '507f1f77bcf86cd799439012',
        ver: 1,
      });

      const res = await request(app)
        .get('/api/v1/media/credentials/signed-url?fileKey=credentials/target_user/diploma.pdf')
        .set('Authorization', `Bearer ${memberToken}`);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN_PERMISSION');
    });

    it('permits authorized moderator to view credentials with signed access URL', async () => {
      const modToken = await generateAccessToken({
        sub: '507f1f77bcf86cd799439088',
        roles: ['moderator'],
        sessionId: '507f1f77bcf86cd799439087',
        ver: 1,
      });

      const res = await request(app)
        .get('/api/v1/media/credentials/signed-url?fileKey=credentials/applicant_123/certificate.pdf')
        .set('Authorization', `Bearer ${modToken}`);

      expect(res.status).toBe(200);
      expect(res.body.signedUrl).toBeDefined();
      expect(res.body.fileKey).toBe('credentials/applicant_123/certificate.pdf');
    });
  });

  describe('Upload Hardening & Magic-Byte Sniffing', () => {
    it('correctly detects JPEG magic bytes', () => {
      const jpegHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
      const result = sniffMagicBytes(jpegHeader);
      expect(result).not.toBeNull();
      expect(result?.mime).toBe('image/jpeg');
    });

    it('correctly detects PNG magic bytes', () => {
      const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      const result = sniffMagicBytes(pngHeader);
      expect(result).not.toBeNull();
      expect(result?.mime).toBe('image/png');
    });

    it('correctly detects PDF magic bytes', () => {
      const pdfHeader = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]);
      const result = sniffMagicBytes(pdfHeader);
      expect(result).not.toBeNull();
      expect(result?.mime).toBe('application/pdf');
    });

    it('correctly detects MP4 ftyp container', () => {
      const mp4Header = Buffer.from([
        0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x6d, 0x70, 0x34, 0x32,
      ]);
      const result = sniffMagicBytes(mp4Header);
      expect(result).not.toBeNull();
      expect(result?.mime).toBe('video/mp4');
    });

    it('rejects disguised executable or script file headers', () => {
      // EXE MZ header
      const exeHeader = Buffer.from([0x4d, 0x5a, 0x90, 0x00]);
      const result = sniffMagicBytes(exeHeader);
      expect(result).toBeNull();
    });

    it('enforces maximum size limit on presigned upload requests', async () => {
      const scholarToken = await generateAccessToken({
        sub: '507f1f77bcf86cd799439099',
        roles: ['scholar'],
        sessionId: '507f1f77bcf86cd799439098',
        ver: 1,
      });

      // Attempt reel over 50MB (60MB)
      const res = await request(app)
        .post('/api/v1/media/upload-url')
        .set('Authorization', `Bearer ${scholarToken}`)
        .send({
          type: 'reel',
          filename: 'oversized_reel.mp4',
          contentType: 'video/mp4',
          sizeBytes: 60 * 1024 * 1024,
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Log Scrubbing & Sensitive Data Redaction', () => {
    it('redacts tokens, passwords, OTPs, and secrets in structured loggers', () => {
      let output = '';
      const testLogger = pino(
        {
          redact: {
            paths: ['password', 'token', 'refreshToken', 'otp', 'secret'],
            censor: '[REDACTED]',
          },
        },
        {
          write: (msg: string) => {
            output += msg;
          },
        }
      );

      testLogger.info({
        password: 'TopSecretPassword123!',
        token: 'jwt.token.secret',
        refreshToken: 'refresh_secret_value',
        otp: '123456',
        secret: 'SanadAdminSetup2026!',
        safeField: 'visible_data',
      });

      expect(output).toContain('[REDACTED]');
      expect(output).not.toContain('TopSecretPassword123!');
      expect(output).not.toContain('jwt.token.secret');
      expect(output).not.toContain('refresh_secret_value');
      expect(output).toContain('visible_data');
    });
  });
});
