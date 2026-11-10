import { useAuthStore } from '../store/authStore';
import { ApiErrorResponse } from '@sanad/types';

declare const process: {
  env: {
    EXPO_PUBLIC_API_URL?: string;
    [key: string]: string | undefined;
  };
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

export class ApiError extends Error {
  code: string;
  statusCode: number;
  details?: unknown;

  constructor(errorResponse: ApiErrorResponse, statusCode: number) {
    super(errorResponse.message || 'API request failed');
    this.name = 'ApiError';
    this.code = errorResponse.code || 'UNKNOWN_ERROR';
    this.statusCode = statusCode;
    this.details = errorResponse.details;
  }
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  failedQueue = [];
};

export async function apiFetch<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { skipAuth = false, headers: customHeaders, ...restOptions } = options;
  const store = useAuthStore.getState();

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  if (!skipAuth && store.accessToken) {
    headers['Authorization'] = `Bearer ${store.accessToken}`;
  }

  const response = await fetch(url, {
    headers,
    ...restOptions,
  });

  // Handle Token Expiration and Refresh Rotation
  if (response.status === 401 && !skipAuth && store.refreshToken) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: store.refreshToken }),
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          const newTokens = refreshData.data.tokens;
          if (store.user) {
            await store.setAuth(store.user, newTokens.accessToken, newTokens.refreshToken);
          }
          processQueue(null);

          // Retry original request with new access token
          headers['Authorization'] = `Bearer ${newTokens.accessToken}`;
          const retryResponse = await fetch(url, { headers, ...restOptions });
          return handleResponse<T>(retryResponse);
        } else {
          // Token refresh failed or compromised; clear auth
          await store.logout();
          processQueue(new Error('Session expired'));
        }
      } catch (err: any) {
        await store.logout();
        processQueue(err);
      } finally {
        isRefreshing = false;
      }
    } else {
      // Wait for refresh to complete then retry
      return new Promise<T>((resolve, reject) => {
        failedQueue.push({
          resolve: async () => {
            try {
              const currentToken = useAuthStore.getState().accessToken;
              headers['Authorization'] = `Bearer ${currentToken}`;
              const retryResponse = await fetch(url, { headers, ...restOptions });
              resolve(await handleResponse<T>(retryResponse));
            } catch (retryError) {
              reject(retryError);
            }
          },
          reject,
        });
      });
    }
  }

  return handleResponse<T>(response);
}

async function handleResponse<T>(response: Response): Promise<T> {
  const json = await response.json();
  if (!response.ok) {
    throw new ApiError(json, response.status);
  }
  return json;
}
