import { Request, Response, NextFunction } from 'express';
import { mediaService, sniffMagicBytes } from './media.service.js';
import { ValidationError } from '../../utils/errors.js';

export class MediaController {
  async getUploadUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, filename, contentType, sizeBytes } = req.body;
      if (!type || !filename || !contentType || !sizeBytes) {
        throw new ValidationError('Missing required upload parameters (type, filename, contentType, sizeBytes)');
      }

      const result = await mediaService.generateUploadUrl({
        userId: req.user!.id,
        type,
        filename,
        contentType,
        sizeBytes: Number(sizeBytes),
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async completeUpload(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileKey, sizeBytes, contentType } = req.body;
      if (!fileKey || !sizeBytes || !contentType) {
        throw new ValidationError('Missing fileKey, sizeBytes, or contentType');
      }

      const result = await mediaService.completeUpload(
        req.user!.id,
        fileKey,
        Number(sizeBytes),
        contentType
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async verifySniff(req: Request, res: Response, next: NextFunction) {
    try {
      const { base64Sample } = req.body;
      if (!base64Sample) {
        throw new ValidationError('Missing base64Sample byte chunk');
      }

      const buffer = Buffer.from(base64Sample, 'base64');
      const sniffResult = sniffMagicBytes(buffer);

      if (!sniffResult) {
        throw new ValidationError('Failed magic-byte inspection: unrecognized or corrupt binary header');
      }

      res.status(200).json({
        verified: true,
        detectedMime: sniffResult.mime,
        detectedExt: sniffResult.ext,
      });
    } catch (error) {
      next(error);
    }
  }

  async getReviewerCredentialSignedUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const fileKey = req.query.fileKey as string;
      if (!fileKey) {
        throw new ValidationError('Missing fileKey query parameter');
      }

      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await mediaService.getReviewerCredentialUrl(
        req.user!.id,
        fileKey,
        ip,
        userAgent
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const mediaController = new MediaController();
