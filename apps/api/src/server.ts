import http from 'node:http';
import { Server } from 'socket.io';
import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { connectDB, disconnectDB } from './config/db.js';
import { setupSocketIO } from './realtime/socket.js';
import { usernameService } from './services/bloomFilter.service.js';

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
    credentials: true,
  },
});

setupSocketIO(io);

async function bootstrap() {
  try {
    const dbOk = await connectDB();
    await usernameService.initialize();
    server.listen(env.PORT, () => {
      logger.info(
        `Sanad API server running on port ${env.PORT} in ${env.NODE_ENV} mode [DB: ${dbOk ? 'connected' : 'offline-fallback'}]`
      );
    });
  } catch (error) {
    logger.error({ error }, 'Failed to bootstrap server');
    process.exit(1);
  }
}

async function shutdown(signal: string) {
  logger.info(`${signal} received, closing server...`);
  server.close(async () => {
    logger.info('HTTP server closed');
    await disconnectDB();
    logger.info('Database connection closed. Exiting process.');
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

if (process.env.NODE_ENV !== 'test') {
  bootstrap();
}

export { server, io };

