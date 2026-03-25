import { describe, expect, it } from 'vitest';
import {
  manualMailWorkflowSchema,
  toJstEndOfDayString,
  toJstStartOfDayString,
} from './manual-mail-workflow.schema';

describe('manualMailWorkflowSchema', () => {
  it('normalizes date values into day-range RFC3339 strings with JST offset', () => {
    expect(toJstStartOfDayString('2026-03-25')).toBe('2026-03-25T00:00:00+09:00');
    expect(toJstEndOfDayString('2026-03-25')).toBe('2026-03-25T23:59:00+09:00');
  });

  it('rejects when until is earlier than since', () => {
    const result = manualMailWorkflowSchema.safeParse({
      connectionId: '1',
      labelName: 'INBOX',
      since: '2026-03-26',
      until: '2026-03-25',
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.until).toContain(
      '終了日は開始日以降にしてください。'
    );
  });
});
