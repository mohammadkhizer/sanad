import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

if (env.NODE_ENV === 'test') {
  mongoose.set('bufferCommands', false);
}

let isConnected = false;

export function isDbConnected(): boolean {
  return isConnected || mongoose.connection.readyState === 1;
}

export async function connectDB(retries = 3, delay = 1000): Promise<boolean> {
  if (isConnected || mongoose.connection.readyState === 1) {
    return true;
  }

  const timeoutMs = env.NODE_ENV === 'production' ? 10000 : 3000;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(env.MONGODB_URI, {
        dbName: 'sanad',
        serverSelectionTimeoutMS: timeoutMs,
        connectTimeoutMS: timeoutMs,
      });
      isConnected = true;
      logger.info('MongoDB connected successfully to ' + env.MONGODB_URI);
      return true;
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      logger.warn({ attempt, error: errMsg }, 'MongoDB connection attempt failed');
      if (attempt === retries) {
        if (env.NODE_ENV === 'test' || env.NODE_ENV === 'development') {
          logger.warn(
            `MongoDB unreachable at ${env.MONGODB_URI}. Continuing in offline/mock-fallback mode. Configure MONGODB_URI in apps/api/.env with your MongoDB Atlas connection string when ready.`
          );
          return false;
        }
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  return false;
}

export async function disconnectDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
  }
}


