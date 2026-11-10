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
};

