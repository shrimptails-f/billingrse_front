import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearAuthToken, getAuthorizationHeaderValue, hasAuthToken, setAuthSession } from './token';

describe('token', () => {
  afterEach(() => {
    clearAuthToken();
    vi.restoreAllMocks();
  });

  it('keeps the auth session only in memory', () => {
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');

    setAuthSession({
      accessToken: 'access-token',
      tokenType: 'Bearer',
    });

    expect(hasAuthToken()).toBe(true);
    expect(getAuthorizationHeaderValue()).toBe('Bearer access-token');
    expect(getItemSpy).not.toHaveBeenCalled();
    expect(setItemSpy).not.toHaveBeenCalled();
    expect(removeItemSpy).not.toHaveBeenCalled();
  });

  it('clears the in-memory auth session', () => {
    setAuthSession({
      access_token: 'access-token',
      token_type: 'Token',
    });

    clearAuthToken();

    expect(hasAuthToken()).toBe(false);
    expect(getAuthorizationHeaderValue()).toBeUndefined();
  });

  it('clears the session when the response has no access token', () => {
    setAuthSession({
      accessToken: 'access-token',
    });

    setAuthSession({});

    expect(hasAuthToken()).toBe(false);
    expect(getAuthorizationHeaderValue()).toBeUndefined();
  });
});
