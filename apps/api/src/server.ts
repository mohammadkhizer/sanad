import http from 'http';
import mongoose from 'mongoose';
import { app } from './app';
import { config } from './config';
import { setupSocketIO } from './realtime/socket';
import { usernameService } from './services/bloomFilter.service';

async function bootstrap() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(config.mongodbUri);
    console.log('Connected to MongoDB successfully.');

    await usernameService.initialize();
    console.log('Username Bloom Filter initialized with reserved words and RBAC user catalogue.');

    const server = http.createServer(app);
    setupSocketIO(server);

    server.listen(config.port, () => {
      console.log(`Sanad API service listening on port ${config.port} in ${config.nodeEnv} mode`);
    });
  } catch (error) {
    console.error('Fatal initialization error:', error);
    process.exit(1);
  }
}

bootstrap();

