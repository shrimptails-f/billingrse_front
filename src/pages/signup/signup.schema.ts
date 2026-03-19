import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(1, '氏名を入力してください。'),
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください。')
    .email('有効なメールアドレスを入力してください。'),
  password: z.string().min(1, 'パスワードを入力してください。'),
});

export type SignupFormValues = z.infer<typeof signupSchema>;
