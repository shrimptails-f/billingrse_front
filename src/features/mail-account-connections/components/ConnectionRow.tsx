import type { ComponentType, JSX } from 'react';
import { GmailIcon } from '@/shared/ui/icons/GmailIcon';
import { MailFallbackIcon } from '@/shared/ui/icons/MailFallbackIcon';

const providerIconMap: Record<string, ComponentType> = {
  gmail: GmailIcon,
};

type Props = {
  provider: string;
  accountIdentifier: string;
  onDisconnect: () => void;
  isDisconnecting: boolean;
};

export const ConnectionRow = ({
  provider,
  accountIdentifier,
  onDisconnect,
  isDisconnecting,
}: Props): JSX.Element => {
  const normalizedProvider = provider.toLowerCase();
  const Icon = providerIconMap[normalizedProvider] ?? MailFallbackIcon;

  return (
    <div className="flex items-center gap-3 py-3">
      <Icon />
      <span className="text-sm text-slate-900">{accountIdentifier}</span>
      <span className="flex-1" />
      <button
        type="button"
        className="text-sm text-red-600 transition hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isDisconnecting}
        onClick={onDisconnect}
      >
        {isDisconnecting ? '解除中...' : '解除'}
      </button>
    </div>
  );
};
