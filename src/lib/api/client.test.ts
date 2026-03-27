import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, get, post } from './client';
import { clearAuthToken, getAuthToken, setAuthSession } from '@/lib/auth/token';

const createJsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });

describe('http wrappers', () => {
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

    await get<{ ok: boolean }>('/protected');

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

    await expect(
      post<void, { token: string }>('/auth/email/verify', {
        body: { token: 'verify-token' },
        attachAuthToken: false,
      })
    ).resolves.toBeUndefined();
  });

  it('normalizes nested API error responses', async () => {
    fetchMock.mockResolvedValueOnce(
      createJsonResponse(
        {
          error: {
            code: 'invalid_request',
            message: '入力値が不正です。',
            details: [
              {
                field: 'email',
                reason: 'required',
              },
            ],
          },
        },
        400
      )
    );

    try {
      await post('/auth/register', {
        body: {
          email: '',
        },
        attachAuthToken: false,
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);

      if (!(error instanceof ApiError)) {
        throw error;
      }

      expect(error.status).toBe(400);
      expect(error.message).toBe('入力値が不正です。');
      expect(error.code).toBe('invalid_request');
      expect(error.details).toEqual([
        {
          field: 'email',
          reason: 'required',
        },
      ]);

      return;
    }

    throw new Error('Expected apiFetch to throw ApiError');
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

    const response = await get<{ ok: boolean }>('/auth/check', {
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
      get('/auth/check', {
        retryOnUnauthorized: true,
      })
    ).rejects.toBeInstanceOf(ApiError);

    expect(getAuthToken()).toBeUndefined();
  });
});
