import crypto from 'crypto';
import { config } from '../config';
import { Post } from '../models/Post';
import { AuditLog } from '../models/Moderation';
import { AppError, UnauthorizedError } from '../utils/errors';

export interface MuxWebhookEvent {
  type: string;
  id: string;
  created_at: string;
  data: {
    id?: string;
    upload_id?: string;
    playback_ids?: Array<{ id: string; policy: string }>;
    duration?: number;
    status?: string;
    passthrough?: string;
    errors?: Array<{ type: string; message: string }>;
    [key: string]: unknown;
  };
}

export class MuxService {
  private webhookSecret: string;

  constructor() {
    this.webhookSecret = config.mux.webhookSecret;
  }

  public createDirectUpload(
    authorId: string,
    postType: 'reel' | 'video'
  ): { uploadUrl: string; assetId: string; uploadId: string } {
    const assetId = crypto.randomUUID();
    const uploadId = `mux_upload_${crypto.randomUUID()}`;

    // Direct upload URL structure
    const uploadUrl = `https://video.sanad.app/v1/uploads/${uploadId}?token=${crypto.randomBytes(24).toString('hex')}`;

    return {
      uploadUrl,
      assetId,
      uploadId,
    };
  }

  public verifyWebhookSignature(payload: string | Buffer, signatureHeader: string): boolean {
    if (!signatureHeader) {
      return false;
    }

    const parts = signatureHeader.split(',');
    let timestamp: string | undefined;
    let signature: string | undefined;

    for (const part of parts) {
      const [key, value] = part.split('=');
      if (key === 't') timestamp = value;
      if (key === 'v1') signature = value;
    }

    if (!timestamp || !signature) {
      return false;
    }

    // Guard against replay attacks: reject timestamps older than 300 seconds
    const parsedTime = parseInt(timestamp, 10);
    const currentTime = Math.floor(Date.now() / 1000);
    if (Math.abs(currentTime - parsedTime) > 300) {
      return false;
    }

    const payloadString = Buffer.isBuffer(payload) ? payload.toString('utf8') : payload;
    const signedPayload = `${timestamp}.${payloadString}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(signedPayload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  public async processWebhook(event: MuxWebhookEvent): Promise<{ handled: boolean; action?: string }> {
    const { type, data } = event;

    if (type === 'video.asset.ready') {
      const muxAssetId = data.id;
      const playbackId = data.playback_ids?.[0]?.id || data.id;

      // Find processing or live post associated with this Mux Asset or Upload ID
      const post = await Post.findOne({
        $or: [{ muxAssetId }, { playbackId: data.upload_id }],
      });

      if (post) {
        post.status = 'live';
        post.playbackId = playbackId;
        await post.save();

        await AuditLog.create({
          action: 'video:transcoded_ready',
          targetType: 'post',
          targetId: post.id,
          meta: { muxAssetId, playbackId, duration: data.duration },
        });

        return { handled: true, action: 'post_marked_live' };
      }
    }

    if (type === 'video.asset.errored') {
      const muxAssetId = data.id;
      const post = await Post.findOne({ muxAssetId });

      if (post) {
        post.status = 'removed';
        await post.save();

        await AuditLog.create({
          action: 'video:transcoding_error',
          targetType: 'post',
          targetId: post.id,
          meta: { muxAssetId, errors: data.errors },
        });

        return { handled: true, action: 'post_marked_removed' };
      }
    }

    return { handled: true, action: 'ignored' };
  }
}

export const muxService = new MuxService();

