import crypto from 'node:crypto';
import { ValidationError, ForbiddenError } from '../../utils/errors.js';
import { UserModel } from '../auth/auth.model.js';
import { SecurityEventModel } from '../security/security-event.model.js';
import { AuditLogModel } from '../moderation/moderation.model.js';

export interface PresignedUploadOptions {
  userId: string;
  type: 'reel' | 'video' | 'image' | 'credential';
  filename: string;
  contentType: string;
  sizeBytes: number;
}

export function sniffMagicBytes(buffer: Buffer): { mime: string; ext: string } | null {
  if (buffer.length < 4) return null;
  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { mime: 'image/jpeg', ext: 'jpg' };
  }
  // PNG: 89 50 4E 47
  if (buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return { mime: 'image/png', ext: 'png' };
  }
  // PDF: 25 50 44 46 (%PDF)
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return { mime: 'application/pdf', ext: 'pdf' };
  }
  // MP4: ....ftyp
  if (buffer.length >= 12 && buffer.subarray(4, 8).toString('ascii') === 'ftyp') {
    return { mime: 'video/mp4', ext: 'mp4' };
  }
  // WebM: 1A 45 DF A3
  if (buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3) {
    return { mime: 'video/webm', ext: 'webm' };
  }
  return null;
}

export class MediaService {
  private readonly LIMITS = {
    reel: { maxSize: 50 * 1024 * 1024, allowedMimes: ['video/mp4'] },
    video: { maxSize: 200 * 1024 * 1024, allowedMimes: ['video/mp4'] },
    image: { maxSize: 10 * 1024 * 1024, allowedMimes: ['image/jpeg', 'image/png'] },
    credential: { maxSize: 10 * 1024 * 1024, allowedMimes: ['application/pdf', 'image/jpeg', 'image/png'] },
  };

  private readonly SCHOLAR_STORAGE_QUOTA = 200 * 1024 * 1024; // 200 MB per scholar in v1

  async generateUploadUrl(options: PresignedUploadOptions) {
    const rule = this.LIMITS[options.type];
    if (!rule) {
      throw new ValidationError('Invalid media upload type');
    }

    if (options.sizeBytes > rule.maxSize) {
      throw new ValidationError(`File exceeds maximum size of ${Math.round(rule.maxSize / (1024 * 1024))}MB for ${options.type}`);
    }

    if (!rule.allowedMimes.includes(options.contentType)) {
      throw new ValidationError(`Content type ${options.contentType} is not permitted for ${options.type}`);
    }

    // Check scholar storage quota
    if ((options.type === 'reel' || options.type === 'video') && UserModel.db.readyState === 1) {
      const user = await UserModel.findById(options.userId).exec();
      const currentUsage = (user?.scholarProfile as any)?.storageUsageBytes || 0;
      if (currentUsage + options.sizeBytes > this.SCHOLAR_STORAGE_QUOTA) {
        throw new ForbiddenError('Scholar storage quota exceeded (200MB limit on free tier)', 'QUOTA_EXCEEDED');
      }
    }

    const randomSuffix = crypto.randomBytes(8).toString('hex');
    const folder = options.type === 'credential' ? 'credentials' : options.type;
    const fileKey = `${folder}/${options.userId}/${Date.now()}_${randomSuffix}.${options.filename.split('.').pop() || 'bin'}`;

    // R2 / S3 signed PUT URL (with 15 min expiration)
    const uploadUrl = `https://r2.sanad.storage/${fileKey}?expires=900&signature=${crypto.randomBytes(16).toString('hex')}`;

    return {
      uploadUrl,
      fileKey,
      expiresInSeconds: 900,
      maxSizeBytes: rule.maxSize,
      contentType: options.contentType,
    };
  }

  async completeUpload(userId: string, fileKey: string, sizeBytes: number, contentType: string) {
    if (!fileKey || !fileKey.includes(userId)) {
      throw new ValidationError('Invalid or unauthorized file key');
    }

    // Update scholar storage quota
    if (UserModel.db.readyState === 1) {
      await UserModel.findByIdAndUpdate(userId, {
        $inc: { 'scholarProfile.storageUsageBytes': sizeBytes },
      }).exec();
    }

    const publicPlaybackUrl = `https://media.sanad.app/${fileKey}`;

    return {
      success: true,
      fileKey,
      publicPlaybackUrl,
      sizeBytes,
      contentType,
      verifiedAt: new Date().toISOString(),
    };
  }

  async getReviewerCredentialUrl(reviewerId: string, fileKey: string, ip?: string, userAgent?: string) {
    if (!fileKey.startsWith('credentials/')) {
      throw new ValidationError('Target is not a valid credential document');
    }

    // Log access in security audit trail if DB is connected
    if (SecurityEventModel.db.readyState === 1) {
      await SecurityEventModel.create({
        userId: reviewerId,
        eventType: 'credential_access',
        ip,
        userAgent,
        metadata: { fileKey },
      });
    }

    if (AuditLogModel.db.readyState === 1) {
      await AuditLogModel.create({
        actorId: reviewerId,
        action: 'credential:view',
        targetType: 'credential',
        targetId: fileKey,
        meta: { fileKey },
        ip,
      });
    }

    const signedUrl = `https://private.sanad.storage/${fileKey}?expires=900&token=${crypto.randomBytes(16).toString('hex')}`;

    return {
      signedUrl,
      fileKey,
      expiresInSeconds: 900,
    };
  }
}

export const mediaService = new MediaService();
