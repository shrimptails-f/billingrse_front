import type { JSX } from 'react';
import { GmailIcon } from '@/components/ui/icons/GmailIcon';
import { MailFallbackIcon } from '@/components/ui/icons/MailFallbackIcon';
import type {
  ManualMailWorkflowHistoryItem,
  ManualMailWorkflowStageKey,
  ManualMailWorkflowStageSummary,
  ManualMailWorkflowStatusValue,
} from '../manual-mail-workflow.types';

const providerIconMap = {
  gmail: GmailIcon,
} as const;

export const stageDefinitions: Array<{ key: ManualMailWorkflowStageKey; label: string }> = [
  { key: 'fetch', label: '取得' },
  { key: 'analysis', label: 'AI解析' },
  { key: 'vendor_resolution', label: '決済会社判定' },
  { key: 'billing_eligibility', label: '請求成立可否判定' },
  { key: 'billing', label: '請求保存' },
];

export const getStageLabel = (stage: ManualMailWorkflowStageKey): string => {
  if (stage === 'fetch') {
    return '取得';
  }

  if (stage === 'analysis') {
    return 'AI解析';
  }

  if (stage === 'vendor_resolution') {
    return '決済会社判定';
  }

  if (stage === 'billing_eligibility') {
    return '請求成立可否判定';
  }

  return '請求保存';
};

export const getStatusLabel = (status: ManualMailWorkflowStatusValue): string => {
  if (status === 'queued') {
    return '受付済み';
  }

  if (status === 'running') {
    return '実行中';
  }

  if (status === 'succeeded') {
    return '完了';
  }

  if (status === 'partial_success') {
    return '一部成功';
  }

  return '失敗';
};

export const getCurrentStageLabel = (history: ManualMailWorkflowHistoryItem): string => {
  if (history.current_stage) {
    return getStageLabel(history.current_stage);
  }

  if (history.status === 'queued') {
    return '未着手';
  }

  return 'なし';
};

export const getStatusClassName = (status: ManualMailWorkflowStatusValue): string => {
  if (status === 'queued') {
    return 'border-sky-200 bg-sky-50 text-sky-700';
  }

  if (status === 'running') {
    return 'border-amber-200 bg-amber-50 text-amber-700';
  }

  if (status === 'succeeded') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }

  if (status === 'partial_success') {
    return 'border-orange-200 bg-orange-50 text-orange-700';
  }

  return 'border-red-200 bg-red-50 text-red-700';
};

export const formatDateTime = (value: string | null): string => {
  if (!value) {
    return '未完了';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Tokyo',
  }).format(date);
};

export const formatDateRange = (since: string, until: string): string =>
  `${since.slice(0, 10)} ～ ${until.slice(0, 10)}`;

export const getProviderLabel = (provider: string | null | undefined): string => {
  const trimmedProvider = provider?.trim();
  return trimmedProvider ? trimmedProvider : '不明';
};

export const getAccountIdentifierLabel = (accountIdentifier: string | null | undefined): string => {
  const trimmedAccountIdentifier = accountIdentifier?.trim();
  return trimmedAccountIdentifier ? trimmedAccountIdentifier : '不明';
};

export const ProviderWithIcon = (props: { provider: string | null | undefined }): JSX.Element => {
  const { provider } = props;
  const normalizedProvider = provider?.toLowerCase().trim() ?? '';
  const Icon =
    providerIconMap[normalizedProvider as keyof typeof providerIconMap] ?? MailFallbackIcon;

  return (
    <span className="inline-flex items-center gap-2 text-slate-900">
      <Icon />
      <span>{getProviderLabel(provider)}</span>
    </span>
  );
};

export const formatMessages = (stage: ManualMailWorkflowStageSummary): JSX.Element => {
  if (stage.failures.length === 0) {
    return <span className="text-slate-500">なし</span>;
  }

  return (
    <div className="space-y-2">
      {stage.failures.map((failure, index) => (
        <p key={`${failure.created_at}-${failure.reason_code}-${index}`} className="leading-6">
          {failure.message}
        </p>
      ))}
    </div>
  );
};
