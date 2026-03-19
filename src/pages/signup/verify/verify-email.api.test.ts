import { describe, expect, it, vi } from 'vitest';
import { verifyEmail } from './verify-email.api';

const apiFetchMock = vi.fn();

vi.mock('@/lib/api/client', () => ({
  apiFetch: (...args: unknown[]) => apiFetchMock(...args),
}));

describe('verifyEmail', () => {
  it('posts the token in the request body', async () => {
    apiFetchMock.mockResolvedValueOnce({
      message: 'ok',
      user: {
        id: 1,
        name: 'test',
        email: 'user@example.com',
        email_verified: true,
        email_verified_at: null,
        created_at: new Date().toISOString(),
      },
    });

    await verifyEmail('verify-token');

    expect(apiFetchMock).toHaveBeenCalledWith('POST', '/auth/email/verify', {
      body: { token: 'verify-token' },
      attachAuthToken: false,
      credentials: 'omit',
    });
  });
});
