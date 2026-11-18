import { useAuthStore } from '../store/authStore';
import { getApiBaseUrl } from './config';

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const authState = useAuthStore.getState();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (authState.accessToken) {
    headers['Authorization'] = `Bearer ${authState.accessToken}`;
  }

  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  let res: Response;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Network request failed';
    throw new Error(`Could not connect to server at ${baseUrl}. Ensure the API server is running on port 4000. (${errorMsg})`);
  }

  // Handle 401 auto-refresh token rotation
  if (res.status === 401 && authState.refreshToken) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshRes = await fetch(`${baseUrl}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: authState.refreshToken }),
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          await authState.updateAccessToken(data.accessToken);
          onRefreshed(data.accessToken);
        } else {
          await authState.logout();
          throw new Error('Session expired');
        }
      } catch (err) {
        await authState.logout();
        throw err;
      } finally {
        isRefreshing = false;
      }
    }

    // Wait for the new token
    const retryToken = await new Promise<string>((resolve) => {
      subscribeTokenRefresh((token) => resolve(token));
    });

    headers['Authorization'] = `Bearer ${retryToken}`;
    try {
      res = await fetch(url, { ...options, headers });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Network request failed';
      throw new Error(`Could not connect to server at ${baseUrl}. (${errorMsg})`);
    }
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error?.message || 'Network request failed');
  }

  return data as T;
}

