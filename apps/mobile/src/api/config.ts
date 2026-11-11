export type AdapterMode = 'mock' | 'http';

const defaultMode: AdapterMode =
  (process.env.EXPO_PUBLIC_API_MODE as AdapterMode) || 'mock';

export interface ModuleConfig {
  auth: AdapterMode;
  users: AdapterMode;
  content: AdapterMode;
  verification: AdapterMode;
  chat: AdapterMode;
  live: AdapterMode;
  calls: AdapterMode;
  moderation: AdapterMode;
  notifications: AdapterMode;
}

export const apiConfig: ModuleConfig = {
  auth: defaultMode,
  users: defaultMode,
  content: defaultMode,
  verification: defaultMode,
  chat: defaultMode,
  live: defaultMode,
  calls: defaultMode,
  moderation: defaultMode,
  notifications: defaultMode,
};

export const devSettings = {
  latencyMs: 300,
  forceError: false,
  emptyData: false,
};

