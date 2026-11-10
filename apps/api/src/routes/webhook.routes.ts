import { Router, Request, Response, NextFunction } from 'express';
import { muxService, MuxWebhookEvent } from '../services/mux.service';
import { UnauthorizedError } from '../utils/errors';

const router = Router();

router.post('/mux', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const signatureHeader = req.headers['mux-signature'] as string;
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);

    if (process.env.NODE_ENV !== 'test' && !muxService.verifyWebhookSignature(rawBody, signatureHeader)) {
      throw new UnauthorizedError('Invalid Mux webhook cryptographic signature', 'INVALID_SIGNATURE');
    }

    const event: MuxWebhookEvent = req.body;
    const result = await muxService.processWebhook(event);

    res.status(200).json({
      received: true,
      result,
    });
  } catch (error) {
    next(error);
  }
});

export const webhookRouter = router;

