import { ApiClientModules } from './types';
import { apiConfig, devSettings } from './config';
import { mockAdapter, setMockUser } from './mock/adapter';
import { httpAdapter } from './http/adapter';

export * from './types';
export * from './config';
export * from './realtime';
export * from './media';
export { setMockUser } from './mock/adapter';

export const api: ApiClientModules = {
  auth: apiConfig.auth === 'http' ? httpAdapter.auth : mockAdapter.auth,
  users: apiConfig.users === 'http' ? httpAdapter.users : mockAdapter.users,
  content: apiConfig.content === 'http' ? httpAdapter.content : mockAdapter.content,
  verification: apiConfig.verification === 'http' ? httpAdapter.verification : mockAdapter.verification,
  chat: apiConfig.chat === 'http' ? httpAdapter.chat : mockAdapter.chat,
  live: apiConfig.live === 'http' ? httpAdapter.live : mockAdapter.live,
  calls: apiConfig.calls === 'http' ? httpAdapter.calls : mockAdapter.calls,
  moderation: apiConfig.moderation === 'http' ? httpAdapter.moderation : mockAdapter.moderation,
  notifications: apiConfig.notifications === 'http' ? httpAdapter.notifications : mockAdapter.notifications,
};

export { devSettings };

