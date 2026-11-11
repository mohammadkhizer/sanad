import { useAuthStore } from '../store/authStore';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

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
  const authState = useAuthStore.getState();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (authState.accessToken) {
    headers['Authorization'] = `Bearer ${authState.accessToken}`;
  }

  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  let res = await fetch(url, { ...options, headers });

  // Handle 401 auto-refresh token rotation
  if (res.status === 401 && authState.refreshToken) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
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
    res = await fetch(url, { ...options, headers });
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error?.message || 'Network request failed');
  }

  return data as T;
}

