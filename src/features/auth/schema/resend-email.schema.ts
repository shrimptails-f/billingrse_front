import { z } from 'zod';

export const resendEmailSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください。')
    .email('有効なメールアドレスを入力してください。'),
  password: z.string().min(1, 'パスワードを入力してください。'),
});

export type ResendEmailFormValues = z.infer<typeof resendEmailSchema>;
