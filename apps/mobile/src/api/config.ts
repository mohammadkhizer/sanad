export type AdapterMode = 'mock' | 'http';

function getExpoHostUri(): string | null {
  try {
    // Dynamic resolution so pure Node unit tests don't break when expo native modules are absent
    const Constants = require('expo-constants')?.default || require('expo-constants');
    return (
      Constants?.expoConfig?.hostUri ||
      Constants?.manifest?.debuggerHost ||
      Constants?.manifest2?.extra?.expoGo?.debuggerHost ||
      null
    );
  } catch {
    return null;
  }
}

function getPlatformOS(): string {
  try {
    const { Platform } = require('react-native');
    return Platform?.OS || 'web';
  } catch {
    return 'node';
  }
}

let currentGlobalMode: AdapterMode =
  (process.env.EXPO_PUBLIC_API_MODE as AdapterMode) || 'http';

type ModeListener = (mode: AdapterMode) => void;
const modeListeners: Set<ModeListener> = new Set();

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
  auth: currentGlobalMode,
  users: currentGlobalMode,
  content: currentGlobalMode,
  verification: currentGlobalMode,
  chat: currentGlobalMode,
  live: currentGlobalMode,
  calls: currentGlobalMode,
  moderation: currentGlobalMode,
  notifications: currentGlobalMode,
};

export function getApiMode(): AdapterMode {
  return currentGlobalMode;
}

export function setApiMode(mode: AdapterMode): void {
  currentGlobalMode = mode;
  (Object.keys(apiConfig) as Array<keyof ModuleConfig>).forEach((key) => {
    apiConfig[key] = mode;
  });
  modeListeners.forEach((listener) => {
    try {
      listener(mode);
    } catch {
      // Ignore listener error
    }
  });
}

export function subscribeApiMode(listener: ModeListener): () => void {
  modeListeners.add(listener);
  return () => {
    modeListeners.delete(listener);
  };
}

export function getApiBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }

  const os = getPlatformOS();
  if (os === 'web' || os === 'node') {
    return envUrl || 'http://localhost:4000/api/v1';
  }

  const hostUri = getExpoHostUri();
  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    if (hostIp) {
      return `http://${hostIp}:4000/api/v1`;
    }
  }

  if (os === 'android') {
    return 'http://10.0.2.2:4000/api/v1';
  }

  return envUrl || 'http://localhost:4000/api/v1';
}

export async function checkBackendHealth(): Promise<{
  ok: boolean;
  database?: string;
  uptime?: number;
  latencyMs?: number;
  error?: string;
}> {
  const startTime = Date.now();
  const rawBase = getApiBaseUrl();
  const healthUrl = rawBase.replace(/\/api\/v1\/?$/, '') + '/health';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(healthUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      return {
        ok: false,
        latencyMs: Date.now() - startTime,
        error: `HTTP ${res.status}: ${res.statusText}`,
      };
    }

    const data = await res.json();
    return {
      ok: true,
      database: data.database || 'unknown',
      uptime: data.uptime,
      latencyMs: Date.now() - startTime,
    };
  } catch (err) {
    return {
      ok: false,
      latencyMs: Date.now() - startTime,
      error: err instanceof Error ? err.message : 'Backend unreachable',
    };
  }
}

export const devSettings = {
  latencyMs: 300,
  forceError: false,
  emptyData: false,
};
