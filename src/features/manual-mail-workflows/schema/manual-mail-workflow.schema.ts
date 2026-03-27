import { z } from 'zod';

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export const isValidJstDate = (value: string): boolean => datePattern.test(value);

export const toJstStartOfDayString = (value: string): string | null => {
  if (!isValidJstDate(value)) {
    return null;
  }

  return `${value}T00:00:00+09:00`;
};

export const toJstEndOfDayString = (value: string): string | null => {
  if (!isValidJstDate(value)) {
    return null;
  }

  return `${value}T23:59:00+09:00`;
};

export const manualMailWorkflowSchema = z
  .object({
    connectionId: z.string().min(1, 'メール連携を選択してください。'),
    labelName: z.string().trim().min(1, 'ラベル名を入力してください。'),
    since: z
      .string()
      .min(1, '開始日を入力してください。')
      .refine(isValidJstDate, '開始日の形式が不正です。'),
    until: z
      .string()
      .min(1, '終了日を入力してください。')
      .refine(isValidJstDate, '終了日の形式が不正です。'),
  })
  .superRefine((values, ctx) => {
    if (!isValidJstDate(values.since) || !isValidJstDate(values.until)) {
      return;
    }

    if (values.since > values.until) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['until'],
        message: '終了日は開始日以降にしてください。',
      });
    }
  });

export type ManualMailWorkflowFormValues = z.infer<typeof manualMailWorkflowSchema>;
