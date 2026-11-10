import { Router } from 'express';
import { createReport } from '../controllers/moderation.controller';
import { authenticate } from '../middlewares/auth';
import { validateBody } from '../middlewares/validate';
import { CreateReportSchema } from '@sanad/types';

const router = Router();

router.post('/', authenticate, validateBody(CreateReportSchema), createReport);

export const moderationRouter = router;

