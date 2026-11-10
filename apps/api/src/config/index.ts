import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/sanad',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'sanad_access_secret_super_secure_key_2026',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'sanad_refresh_secret_super_secure_key_2026',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresDays: parseInt(process.env.JWT_REFRESH_EXPIRES_DAYS || '30', 10),
  },
  totpEncryptionKey: process.env.TOTP_ENCRYPTION_KEY || 'sanad_32_byte_totp_encryption_secret_key!',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  storage: {
    endpoint: process.env.STORAGE_ENDPOINT || 'https://storage.sanad.app',
    bucket: process.env.STORAGE_BUCKET || 'sanad-private-credentials',
    accessKey: process.env.STORAGE_ACCESS_KEY || 'sanad_storage_access_key',
    secretKey: process.env.STORAGE_SECRET_KEY || 'sanad_storage_secret_key',
  },
  mux: {
    tokenId: process.env.MUX_TOKEN_ID || 'mock_mux_token_id',
    tokenSecret: process.env.MUX_TOKEN_SECRET || 'mock_mux_token_secret',
    webhookSecret: process.env.MUX_WEBHOOK_SECRET || 'mock_mux_webhook_secret_key_123',
  },
  livekit: {
    apiKey: process.env.LIVEKIT_API_KEY || 'sanad_livekit_api_key',
    apiSecret: process.env.LIVEKIT_API_SECRET || 'sanad_livekit_api_secret_key_very_long_and_secure',
  },
};

