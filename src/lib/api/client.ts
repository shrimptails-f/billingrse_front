// apiClient.ts

// API でよくあるエラーレスポンスの例
import { authRefreshEndpoint } from './auth.shared';
import {
  clearAuthToken,
  getAuthorizationHeaderValue,
  hasAuthToken,
  setAuthSession,
  type AuthSessionResponse,
} from '@/lib/auth/token';

export type ApiErrorResponse = {
  code: string;
  message: string;
  details?: unknown;
};

// Fetch / Query が投げるエラー型
export class ApiError extends Error {
  public status: number;
  public body?: ApiErrorResponse | unknown;

  constructor(status: number, body?: ApiErrorResponse | unknown) {
    const message =
      (body as ApiErrorResponse | undefined)?.message ?? `API Error (status: ${status})`;
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL ?? 'http://localhost:8080/api/v1';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type FetcherOptions<TBody> = {
  body?: TBody;
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
  credentials?: RequestCredentials;
  attachAuthToken?: boolean;
  retryOnUnauthorized?: boolean;
};

type RequestOptions<TBody> = FetcherOptions<TBody> & {
  _retriedAfterRefresh?: boolean;
};

const buildQueryString = (query?: FetcherOptions<unknown>['query']): string => {
  if (!query) return '';
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    params.append(key, String(value));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
};

const resolveUrl = (endpoint: string, query?: FetcherOptions<unknown>['query']): string => {
  const qs = buildQueryString(query);
  if (/^https?:\/\//i.test(endpoint)) {
    return `${endpoint}${qs}`;
  }
  const base = BACKEND_API_URL.replace(/\/+$/, '');
  const path = endpoint.replace(/^\/+/, '');
  return `${base}/${path}${qs}`;
};

export const apiFetch = async <TResponse, TBody>(
  method: HttpMethod,
  endpoint: string,
  options: FetcherOptions<TBody> = {}
): Promise<TResponse> => executeRequest(method, endpoint, options);

let refreshRequest: Promise<boolean> | null = null;

const refreshAuthSession = async (): Promise<boolean> => {
  if (!refreshRequest) {
    refreshRequest = (async () => {
      try {
        const response = await executeRequest<AuthSessionResponse, undefined>(
          'POST',
          authRefreshEndpoint,
          {
            attachAuthToken: false,
            retryOnUnauthorized: false,
          }
        );

        setAuthSession(response);

        return true;
      } catch {
        clearAuthToken();
        return false;
      } finally {
        refreshRequest = null;
      }
    })();
  }

  return refreshRequest;
};

const executeRequest = async <TResponse, TBody>(
  method: HttpMethod,
  endpoint: string,
  options: RequestOptions<TBody> = {}
): Promise<TResponse> => {
  const {
    body,
    headers,
    query,
    signal,
    credentials = 'include',
    attachAuthToken = true,
    retryOnUnauthorized = false,
    _retriedAfterRefresh = false,
  } = options;

  const url = resolveUrl(endpoint, query);
  const shouldSendBody = method !== 'GET' && body !== undefined && body !== null;
  const authorizationHeader = attachAuthToken ? getAuthorizationHeaderValue() : undefined;
  const requestHeaders = {
    ...(shouldSendBody ? { 'Content-Type': 'application/json' } : {}),
    ...headers,
    ...(authorizationHeader ? { Authorization: authorizationHeader } : {}),
  };

  const res = await fetch(url, {
    method,
    headers: requestHeaders,
    body: shouldSendBody ? JSON.stringify(body) : undefined,
    signal,
    credentials,
  });

  const contentType = res.headers.get('Content-Type') ?? '';
  const isJson = contentType.includes('application/json');
  const isNoContentStatus = res.status === 204 || res.status === 304;

  let responseBody: unknown;
  if (!isNoContentStatus) {
    const rawBody = await res.text();

    if (rawBody.trim() !== '') {
      if (isJson) {
        try {
          responseBody = JSON.parse(rawBody);
        } catch (error) {
          throw new ApiError(res.status, {
            message: 'Failed to parse JSON response',
            details: error,
          });
        }
      } else {
        responseBody = rawBody;
      }
    }
  }

  if (!res.ok) {
    if (
      res.status === 401 &&
      retryOnUnauthorized &&
      !_retriedAfterRefresh &&
      endpoint !== authRefreshEndpoint
    ) {
      const refreshed = await refreshAuthSession();

      if (refreshed && hasAuthToken()) {
        return executeRequest(method, endpoint, {
          ...options,
          _retriedAfterRefresh: true,
        });
      }
    }

    throw new ApiError(res.status, responseBody);
  }

  return responseBody as TResponse;
};
