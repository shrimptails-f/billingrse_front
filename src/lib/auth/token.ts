export type AuthSessionResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

type AuthSession = {
  accessToken: string;
  tokenType: string;
  expiresAt: number | null;
};

let currentAuthSession: AuthSession | null = null;

export const setAuthSession = (session: AuthSessionResponse): void => {
  currentAuthSession = {
    accessToken: session.access_token,
    tokenType: session.token_type,
    expiresAt: session.expires_in > 0 ? Date.now() + session.expires_in * 1000 : null,
  };
};

export const getAuthSession = (): AuthSession | null => currentAuthSession;

export const setAuthToken = (token: string, tokenType = 'Bearer'): void => {
  currentAuthSession = {
    accessToken: token,
    tokenType,
    expiresAt: null,
  };
};

export const getAuthToken = (): string | undefined => currentAuthSession?.accessToken;

export const getAuthTokenType = (): string | undefined => currentAuthSession?.tokenType;

export const getAuthorizationHeaderValue = (): string | undefined => {
  if (!currentAuthSession) return undefined;

  return `${currentAuthSession.tokenType} ${currentAuthSession.accessToken}`;
};

export const clearAuthToken = (): void => {
  currentAuthSession = null;
};

export const hasAuthToken = (): boolean => Boolean(currentAuthSession?.accessToken);
