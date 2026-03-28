import { describe, expect, it } from 'vitest';
import { ApiError } from './client';
import { toFriendlyMessage } from './errors';

describe('toFriendlyMessage', () => {
  it('prefers the backend message when the API returns a structured error body', () => {
    const error = new ApiError({
      status: 400,
      code: 'invalid_request',
      message: '入力値が不正です。',
      body: {
        error: {
          code: 'invalid_request',
          message: '入力値が不正です。',
        },
      },
    });

    expect(toFriendlyMessage(error)).toBe('入力値が不正です。');
  });

  it('falls back to the generic unauthorized message when no backend message exists', () => {
    const error = new ApiError({
      status: 401,
      code: 'unauthorized',
      body: {
        error: {
          code: 'unauthorized',
        },
      },
    });

    expect(toFriendlyMessage(error)).toBe('認証エラーが発生しました。再度ログインしてください。');
  });
});
