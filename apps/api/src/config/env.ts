import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  MONGODB_URI: z.string().default('mongodb://localhost:27017/sanad'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_ACCESS_SECRET: z.string().min(32).default('development_access_secret_key_minimum_32_chars_long'),
  JWT_REFRESH_SECRET: z.string().min(32).default('development_refresh_secret_key_minimum_32_chars_long'),
  CORS_ORIGIN: z.string().default('*'),
  MUX_TOKEN_ID: z.string().optional().default('mock_mux_token_id'),
  MUX_TOKEN_SECRET: z.string().optional().default('mock_mux_token_secret'),
  LIVEKIT_API_KEY: z.string().optional().default('mock_livekit_key'),
  LIVEKIT_API_SECRET: z.string().optional().default('mock_livekit_secret'),
  LIVEKIT_URL: z.string().optional().default('https://livekit.example.com'),
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().default('sanad-uploads'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  throw new Error('Environment configuration error');
}

export const env = parsed.data;

