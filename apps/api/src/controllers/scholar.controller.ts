import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { ScholarApplication } from '../models/ScholarApplication';
import { AuditLog } from '../models/Moderation';
import { storageService } from '../services/storage.service';
import { UnauthorizedError, ConflictError, NotFoundError, AppError } from '../utils/errors';

export async function submitApplication(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();

    // Check if user already is a verified scholar
    if (req.user.roles.includes('scholar')) {
      throw new AppError('ALREADY_SCHOLAR', 'User is already a verified scholar', 400);
    }

    // Check if there is already a pending application
    const existing = await ScholarApplication.findOne({
      userId: req.user._id,
      status: 'pending',
    });
    if (existing) {
      throw new ConflictError(
        'An application is already currently under review',
        'APPLICATION_PENDING'
      );
    }

    const { credentials, statement, institution, specialties, languages } = req.body;

    const application = await ScholarApplication.create({
      userId: req.user._id,
      credentials,
      statement,
      institution,
      specialties,
      languages,
      status: 'pending',
    });

    await AuditLog.create({
      actorId: req.user._id,
      action: 'scholar_application:submit',
      targetType: 'scholar_application',
      targetId: application.id,
      ip: req.ip,
    });

    res.status(201).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyApplication(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();

    const application = await ScholarApplication.findOne({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: application || null,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCredentialUploadUrl(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();

    const mimeType = (req.body?.mimeType as string) || 'application/pdf';
    const extension = (req.body?.extension as string) || 'pdf';

    const uploadPayload = storageService.generateCredentialUploadUrl(
      req.user.id,
      mimeType,
      extension
    );

    res.status(200).json({
      success: true,
      data: uploadPayload,
    });
  } catch (error) {
    next(error);
  }
}

export async function endorseApplication(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError();

    const { id } = req.params;
    const application = await ScholarApplication.findById(id);
    if (!application) {
      throw new NotFoundError('Scholar application not found');
    }

    // Check if scholar already endorsed
    const alreadyEndorsed = application.endorsements.some(
      (e) => e.scholarId.toString() === req.user?.id
    );
    if (alreadyEndorsed) {
      throw new ConflictError('You have already endorsed this application', 'ALREADY_ENDORSED');
    }

    application.endorsements.push({
      scholarId: req.user._id,
      note: req.body.note,
      createdAt: new Date(),
    });
    await application.save();

    await AuditLog.create({
      actorId: req.user._id,
      action: 'scholar_application:endorse',
      targetType: 'scholar_application',
      targetId: application.id,
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
}

