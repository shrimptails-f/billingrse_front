import { describe, expect, it } from 'vitest';
import { loginSchema } from './login.schema';

describe('loginSchema', () => {
  it('rejects empty values with required messages', () => {
    const result = loginSchema.safeParse({ email: '', password: '' });

    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.format();
      expect(errors.email?._errors).toContain('メールアドレスを入力してください。');
      expect(errors.password?._errors).toContain('パスワードを入力してください。');
    }
  });

  it('rejects invalid email format', () => {
    const result = loginSchema.safeParse({ email: 'invalid-email', password: 'password123' });

    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.format();
      expect(errors.email?._errors).toContain('有効なメールアドレスを入力してください。');
    }
  });

  it('accepts valid values', () => {
    expect(() =>
      loginSchema.parse({ email: 'user@example.com', password: 'password123' })
    ).not.toThrow();
  });
});
