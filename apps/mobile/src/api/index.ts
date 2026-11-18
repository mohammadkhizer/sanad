import { ApiClientModules } from './types';
import { devSettings } from './config';
import { httpAdapter } from './http/adapter';

export * from './types';
export * from './config';
export * from './realtime';
export * from './media';

// Direct cutover to live backend HTTP API connected to MongoDB Atlas
export const api: ApiClientModules = httpAdapter;

export { devSettings };
