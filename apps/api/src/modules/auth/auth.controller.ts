import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import { UserModel, SessionModel } from './auth.model.js';
import { usernameService } from '../../services/bloomFilter.service.js';

export class AuthController {
  async checkUsername(req: Request, res: Response, next: NextFunction) {
    try {
      const username = req.query.username as string;
      if (!username) {
        return res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Username parameter is required',
        });
      }
      const result = await usernameService.checkAvailability(username);
      res.status(200).json({
        success: true,
        data: {
          username,
          available: result.available,
          reason: result.reason,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { identifier, code } = req.body;
      const userAgent = req.headers['user-agent'];
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      const result = await authService.verifyOtp(identifier, code, userAgent, ip);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const userAgent = req.headers['user-agent'];
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      const result = await authService.login(req.body, userAgent, ip);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const userAgent = req.headers['user-agent'];
      const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
      const result = await authService.rotateRefreshToken(refreshToken, userAgent, ip);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user?.sessionId) {
        await authService.logout(req.user.sessionId);
      }
      res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  async logoutAll(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user?.id) {
        await authService.logoutAll(req.user.id);
      }
      res.status(200).json({ success: true, message: 'All sessions terminated' });
    } catch (error) {
      next(error);
    }
  }

  async setup2FA(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.setup2FA(req.user!.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async verify2FA(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.body;
      const result = await authService.verifyAndEnable2FA(req.user!.id, code);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const sessions = await SessionModel.find({
        userId: req.user!.id,
        revokedAt: { $exists: false },
      })
        .select('deviceId ip userAgent lastUsedAt createdAt')
        .sort({ lastUsedAt: -1 })
        .exec();

      res.status(200).json({ sessions });
    } catch (error) {
      next(error);
    }
  }

  async deleteAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      await UserModel.findByIdAndUpdate(userId, {
        status: 'deleted',
        email: undefined,
        phone: undefined,
      }).exec();

      await authService.logoutAll(userId);

      res.status(200).json({ success: true, message: 'Account deleted permanently' });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();

