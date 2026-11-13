import { JobModel, IJob } from './jobs.model.js';
import { logger } from '../../config/logger.js';
import { PostModel } from '../content/content.model.js';
import { UserModel } from '../auth/auth.model.js';
import { createAndSendNotification } from '../../services/notification.service.js';

export type JobHandler = (payload: any) => Promise<void>;

export class JobsService {
  private handlers: Map<string, JobHandler> = new Map();
  private isRunning = false;
  private workerTimer: NodeJS.Timeout | null = null;
  private workerId = `worker_${process.pid}_${Math.random().toString(36).substring(2, 7)}`;

  constructor() {
    this.registerDefaultHandlers();
  }

  registerHandler(type: string, handler: JobHandler) {
    this.handlers.set(type, handler);
  }

  private registerDefaultHandlers() {
    // 1. Notification dispatch job
    this.registerHandler('notification:send', async (payload) => {
      await createAndSendNotification({
        recipientId: payload.userId,
        actorId: payload.actorId,
        type: payload.type || 'system_alert',
        title: payload.title,
        body: payload.body,
        data: payload.data,
      } as any);
    });

    // 2. Upload sweeper: clean or flag posts left in 'processing' older than 24 hours
    this.registerHandler('upload:sweep', async () => {
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const stalePosts = await PostModel.updateMany(
        { status: 'processing', createdAt: { $lt: dayAgo } },
        { status: 'removed', moderationReason: 'stale_upload_abandoned_24h' }
      ).exec();
      logger.info({ swept: stalePosts.modifiedCount }, 'Stale upload sweeper executed');
    });

    // 3. Scholar periodic re-verification check (every 12 months)
    this.registerHandler('scholar:reverification_check', async () => {
      const yearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      const expiredScholars = await UserModel.find({
        roles: 'scholar',
        'scholarProfile.verified': true,
        'scholarProfile.verifiedAt': { $lt: yearAgo },
      }).exec();

      for (const scholar of expiredScholars) {
        logger.warn({ scholarId: scholar._id }, 'Scholar due for annual credential re-verification');
      }
    });
  }

  async enqueue(type: string, payload: Record<string, any> = {}, delayMs = 0, maxAttempts = 3): Promise<IJob> {
    const runAt = new Date(Date.now() + delayMs);
    const job = await JobModel.create({
      type,
      payload,
      status: 'pending',
      runAt,
      maxAttempts,
    });
    return job;
  }

  async processNextJob(): Promise<boolean> {
    if (JobModel.db.readyState !== 1) return false;

    const now = new Date();
    // Atomic fetch-and-lock to prevent double execution across workers
    const job = await JobModel.findOneAndUpdate(
      {
        status: 'pending',
        runAt: { $lte: now },
      },
      {
        $set: {
          status: 'processing',
          lockedAt: now,
          lockedBy: this.workerId,
        },
      },
      { sort: { runAt: 1 }, new: true }
    ).exec();

    if (!job) return false;

    const handler = this.handlers.get(job.type);
    if (!handler) {
      job.status = 'failed';
      job.lastError = `No handler registered for job type: ${job.type}`;
      await job.save();
      return true;
    }

    try {
      await handler(job.payload);
      job.status = 'completed';
      job.lockedAt = undefined;
      job.lockedBy = undefined;
      await job.save();
      return true;
    } catch (err: any) {
      job.attempts += 1;
      job.lastError = err?.message || String(err);
      job.lockedAt = undefined;
      job.lockedBy = undefined;

      if (job.attempts >= job.maxAttempts) {
        job.status = 'failed';
      } else {
        // Exponential backoff retry: 2^attempts seconds
        job.status = 'pending';
        job.runAt = new Date(Date.now() + Math.pow(2, job.attempts) * 1000);
      }

      await job.save();
      return true;
    }
  }

  startWorker(pollIntervalMs = 5000) {
    if (this.isRunning) return;
    this.isRunning = true;

    const loop = async () => {
      try {
        let processed = true;
        // Drain pending queue batches
        while (processed && this.isRunning) {
          processed = await this.processNextJob();
        }
      } catch (err) {
        logger.error({ err }, 'Error in jobs worker processing loop');
      } finally {
        if (this.isRunning) {
          this.workerTimer = setTimeout(loop, pollIntervalMs);
        }
      }
    };

    loop();
  }

  stopWorker() {
    this.isRunning = false;
    if (this.workerTimer) {
      clearTimeout(this.workerTimer);
      this.workerTimer = null;
    }
  }
}

export const jobsService = new JobsService();
