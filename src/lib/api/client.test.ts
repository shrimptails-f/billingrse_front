import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiFetch, ApiError } from './client';
import { clearAuthToken, getAuthToken, setAuthSession } from '@/lib/auth/token';

const createJsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });

describe('apiFetch', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    fetchMock.mockReset();
    clearAuthToken();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    clearAuthToken();
  });

  it('attaches the Authorization header when an access token exists', async () => {
    setAuthSession({
      access_token: 'access-token',
      token_type: 'Bearer',
      expires_in: 900,
    });
    fetchMock.mockResolvedValueOnce(createJsonResponse({ ok: true }));

    await apiFetch<{ ok: boolean }, undefined>('GET', '/protected');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toEqual(expect.stringMatching(/\/protected$/));
    expect(fetchMock.mock.calls[0]?.[1]).toEqual(
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer access-token',
        }),
      })
    );
  });

  it('treats an empty 200 JSON response as success', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('', {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );

    await expect(apiFetch<void, { token: string }>('POST', '/auth/email/verify', {
      body: { token: 'verify-token' },
      attachAuthToken: false,
    })).resolves.toBeUndefined();
  });

  it('refreshes the session and retries once after a 401 response', async () => {
    setAuthSession({
      access_token: 'expired-token',
      token_type: 'Bearer',
      expires_in: 1,
    });
    fetchMock
      .mockResolvedValueOnce(createJsonResponse({ message: 'Unauthorized' }, 401))
      .mockResolvedValueOnce(
        createJsonResponse({
          access_token: 'fresh-token',
          token_type: 'Bearer',
          expires_in: 900,
        })
      )
      .mockResolvedValueOnce(createJsonResponse({ ok: true }));

    const response = await apiFetch<{ ok: boolean }, undefined>('GET', '/auth/check', {
      retryOnUnauthorized: true,
    });

    expect(response).toEqual({ ok: true });
    expect(fetchMock.mock.calls[1]?.[0]).toEqual(expect.stringMatching(/\/auth\/refresh$/));
    expect(fetchMock.mock.calls[1]?.[1]).toEqual(
      expect.objectContaining({
        headers: {},
      })
    );
    expect(fetchMock.mock.calls[2]?.[0]).toEqual(expect.stringMatching(/\/auth\/check$/));
    expect(fetchMock.mock.calls[2]?.[1]).toEqual(
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer fresh-token',
        }),
      })
    );
    expect(getAuthToken()).toBe('fresh-token');
  });

  it('clears the access token when refresh fails', async () => {
    setAuthSession({
      access_token: 'expired-token',
      token_type: 'Bearer',
      expires_in: 1,
    });
    fetchMock
      .mockResolvedValueOnce(createJsonResponse({ message: 'Unauthorized' }, 401))
      .mockResolvedValueOnce(createJsonResponse({ message: 'Refresh failed' }, 401));

    await expect(
      apiFetch('GET', '/auth/check', {
        retryOnUnauthorized: true,
      })
    ).rejects.toBeInstanceOf(ApiError);

    expect(getAuthToken()).toBeUndefined();
  });
});
