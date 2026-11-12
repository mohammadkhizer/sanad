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
  get auth() {
    return apiConfig.auth === 'http' ? httpAdapter.auth : mockAdapter.auth;
  },
  get users() {
    return apiConfig.users === 'http' ? httpAdapter.users : mockAdapter.users;
  },
  get content() {
    return apiConfig.content === 'http' ? httpAdapter.content : mockAdapter.content;
  },
  get verification() {
    return apiConfig.verification === 'http' ? httpAdapter.verification : mockAdapter.verification;
  },
  get chat() {
    return apiConfig.chat === 'http' ? httpAdapter.chat : mockAdapter.chat;
  },
  get live() {
    return apiConfig.live === 'http' ? httpAdapter.live : mockAdapter.live;
  },
  get calls() {
    return apiConfig.calls === 'http' ? httpAdapter.calls : mockAdapter.calls;
  },
  get moderation() {
    return apiConfig.moderation === 'http' ? httpAdapter.moderation : mockAdapter.moderation;
  },
  get notifications() {
    return apiConfig.notifications === 'http' ? httpAdapter.notifications : mockAdapter.notifications;
  },
};

export { devSettings };
