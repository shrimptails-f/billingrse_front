export type AuthSessionResponse = {
  accessToken?: string;
  access_token?: string;
  tokenType?: string;
  token_type?: string;
};

const DEFAULT_TOKEN_TYPE = 'Bearer';

let memoryAccessToken: string | null = null;
let memoryTokenType: string = DEFAULT_TOKEN_TYPE;

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

export const setAuthSession = (session: AuthSessionResponse): void => {
  const accessToken = getAccessTokenFromSession(session);

  if (!accessToken) {
    clearAuthToken();
    return;
  }

  const tokenType = getTokenTypeFromSession(session);

  memoryAccessToken = accessToken;
  memoryTokenType = tokenType;
};

export const clearAuthToken = (): void => {
  memoryAccessToken = null;
  memoryTokenType = DEFAULT_TOKEN_TYPE;
};

export const hasAuthToken = (): boolean => {
  return memoryAccessToken !== null;
};

export const getAuthorizationHeaderValue = (): string | undefined => {
  if (!memoryAccessToken) {
    return undefined;
  }

  return `${memoryTokenType} ${memoryAccessToken}`;
};
