export type AuthSessionResponse = {
  accessToken?: string;
  access_token?: string;
  tokenType?: string;
  token_type?: string;
};

const AUTH_ACCESS_TOKEN_STORAGE_KEY = 'authAccessToken';
const AUTH_TOKEN_TYPE_STORAGE_KEY = 'authTokenType';
const DEFAULT_TOKEN_TYPE = 'Bearer';

let memoryAccessToken: string | null = null;
let memoryTokenType: string = DEFAULT_TOKEN_TYPE;

const readStorageValue = (key: string): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStorageValue = (key: string, value: string): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(key, value);
  } catch {
    // no-op
  }
};

const removeStorageValue = (key: string): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch {
    // no-op
  }
};

const getAccessTokenFromSession = (session: AuthSessionResponse): string | null => {
  const token = session.accessToken ?? session.access_token;

  if (typeof token === 'string' && token.trim().length > 0) {
    return token;
  }

  return null;
};

const getTokenTypeFromSession = (session: AuthSessionResponse): string => {
  const tokenType = session.tokenType ?? session.token_type;

  if (typeof tokenType === 'string' && tokenType.trim().length > 0) {
    return tokenType;
  }

  return DEFAULT_TOKEN_TYPE;
};

const readAccessToken = (): string | null => {
  const storedToken = readStorageValue(AUTH_ACCESS_TOKEN_STORAGE_KEY);

  if (storedToken) {
    memoryAccessToken = storedToken;
    return storedToken;
  }

  return memoryAccessToken;
};

const readTokenType = (): string => {
  const storedTokenType = readStorageValue(AUTH_TOKEN_TYPE_STORAGE_KEY);

  if (storedTokenType) {
    memoryTokenType = storedTokenType;
    return storedTokenType;
  }

  return memoryTokenType;
};

export const setAuthSession = (session: AuthSessionResponse): void => {
  const accessToken = getAccessTokenFromSession(session);

  if (!accessToken) {
    clearAuthToken();
    return;
  }

  const tokenType = getTokenTypeFromSession(session);

  memoryAccessToken = accessToken;
  memoryTokenType = tokenType;
  writeStorageValue(AUTH_ACCESS_TOKEN_STORAGE_KEY, accessToken);
  writeStorageValue(AUTH_TOKEN_TYPE_STORAGE_KEY, tokenType);
};

export const clearAuthToken = (): void => {
  memoryAccessToken = null;
  memoryTokenType = DEFAULT_TOKEN_TYPE;
  removeStorageValue(AUTH_ACCESS_TOKEN_STORAGE_KEY);
  removeStorageValue(AUTH_TOKEN_TYPE_STORAGE_KEY);
};

export const hasAuthToken = (): boolean => {
  return readAccessToken() !== null;
};

export const getAuthorizationHeaderValue = (): string | undefined => {
  const accessToken = readAccessToken();

  if (!accessToken) {
    return undefined;
  }

  return `${readTokenType()} ${accessToken}`;
};
