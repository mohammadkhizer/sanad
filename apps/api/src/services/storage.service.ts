import crypto from 'crypto';
import { config } from '../config';
import { ValidationError, ForbiddenError } from '../utils/errors';

export const ALLOWED_CREDENTIAL_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export const MAX_CREDENTIAL_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 Megabytes

export class StorageService {
  private endpoint: string;
  private bucket: string;

  constructor() {
    this.endpoint = config.storage.endpoint;
    this.bucket = config.storage.bucket;
  }

  public generateCredentialUploadUrl(
    userId: string,
    mimeType: string,
    fileExtension: string = 'pdf'
  ): { fileKey: string; uploadUrl: string; expiresIn: number } {
    if (!ALLOWED_CREDENTIAL_MIME_TYPES.has(mimeType.toLowerCase())) {
      throw new ValidationError(
        `Unsupported document format. Allowed formats: PDF, JPEG, PNG, WEBP. Received: ${mimeType}`
      );
    }

    const cleanExt = fileExtension.replace(/^\./, '').toLowerCase();
    const fileId = crypto.randomUUID();
    const fileKey = `credentials/${userId}/${fileId}.${cleanExt}`;

    // HMAC token generation simulating cloud signed URLs (S3/Cloudflare R2 compatible)
    const expiresIn = 900; // 15 minutes
    const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;
    const stringToSign = `PUT\n${this.bucket}\n${fileKey}\n${mimeType}\n${expiresAt}`;
    const signature = crypto
      .createHmac('sha256', config.storage.secretKey)
      .update(stringToSign)
      .digest('hex');

    const uploadUrl = `${this.endpoint}/${this.bucket}/${fileKey}?expires=${expiresAt}&sig=${signature}&accessKey=${config.storage.accessKey}`;

    return {
      fileKey,
      uploadUrl,
      expiresIn,
    };
  }

  public generateCredentialDownloadUrl(
    fileKey: string,
    requesterRoles: string[]
  ): { downloadUrl: string; expiresIn: number } {
    const isStaff = requesterRoles.some((role) => ['moderator', 'admin'].includes(role));
    if (!isStaff) {
      throw new ForbiddenError(
        'Access denied: Credential documents are confidential PII and accessible solely to verification staff.'
      );
    }

    const expiresIn = 900; // 15 minutes
    const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;
    const stringToSign = `GET\n${this.bucket}\n${fileKey}\n${expiresAt}`;
    const signature = crypto
      .createHmac('sha256', config.storage.secretKey)
      .update(stringToSign)
      .digest('hex');

    const downloadUrl = `${this.endpoint}/${this.bucket}/${fileKey}?expires=${expiresAt}&sig=${signature}&accessKey=${config.storage.accessKey}`;

    return {
      downloadUrl,
      expiresIn,
    };
  }
}

export const storageService = new StorageService();

