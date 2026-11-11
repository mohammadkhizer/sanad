import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

if (env.NODE_ENV === 'test') {
  mongoose.set('bufferCommands', false);
}

let isConnected = false;

export async function connectDB(retries = 5, delay = 2000): Promise<void> {
  if (isConnected || mongoose.connection.readyState === 1) {
    return;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(env.MONGODB_URI);
      isConnected = true;
      logger.info('MongoDB connected successfully');
      return;
    } catch (error) {
      logger.warn({ attempt, error }, 'MongoDB connection attempt failed');
      if (attempt === retries) {
        if (env.NODE_ENV === 'test') {
          logger.warn('Running tests without persistent MongoDB connection');
          return;
        }
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

export async function disconnectDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
  }
}

