import {
  clearAuthToken,
  getAuthorizationHeaderValue,
  hasAuthToken,
  setAuthSession,
  type AuthSessionResponse,
} from '@/lib/auth/token';
import { Client, type RequestOptions } from './client';

type BodyLessRequestOptions = Omit<RequestOptions<never>, 'body'>;

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

const AUTH_REFRESH_ENDPOINT = '/auth/refresh';

const refreshClient = new Client({
  baseUrl: BACKEND_API_URL,
  defaultCredentials: 'include',
});

const refreshAuthSession = async (): Promise<boolean> => {
  try {
    const session = await refreshClient.request<AuthSessionResponse>(
      'POST',
      AUTH_REFRESH_ENDPOINT,
      {
        attachAuthToken: false,
        retryOnUnauthorized: false,
      }
    );

    setAuthSession(session);

    return true;
  } catch {
    clearAuthToken();
    return false;
  }
};

export const apiClient = new Client({
  baseUrl: BACKEND_API_URL,
  defaultCredentials: 'include',
  auth: {
    refreshEndpoint: AUTH_REFRESH_ENDPOINT,
    getAuthorizationHeaderValue,
    hasAuthToken,
    refreshAuthSession,
  },
});

export const get = <TResponse>(
  endpoint: string,
  options: BodyLessRequestOptions = {}
): Promise<TResponse> => {
  return apiClient.request<TResponse>('GET', endpoint, options);
};

export const post = <TResponse, TBody = unknown>(
  endpoint: string,
  options: RequestOptions<TBody> = {}
): Promise<TResponse> => {
  return apiClient.request<TResponse, TBody>('POST', endpoint, options);
};

export const put = <TResponse, TBody = unknown>(
  endpoint: string,
  options: RequestOptions<TBody> = {}
): Promise<TResponse> => {
  return apiClient.request<TResponse, TBody>('PUT', endpoint, options);
};

export const patch = <TResponse, TBody = unknown>(
  endpoint: string,
  options: RequestOptions<TBody> = {}
): Promise<TResponse> => {
  return apiClient.request<TResponse, TBody>('PATCH', endpoint, options);
};

export const deleteRequest = <TResponse>(
  endpoint: string,
  options: BodyLessRequestOptions = {}
): Promise<TResponse> => {
  return apiClient.request<TResponse>('DELETE', endpoint, options);
};

export const http = {
  get,
  post,
  put,
  patch,
  delete: deleteRequest,
};
