export const authRefreshEndpoint = import.meta.env.VITE_AUTH_REFRESH_ENDPOINT ?? '/auth/refresh';

export const authSessionQueryKey = ['auth', 'session'] as const;
