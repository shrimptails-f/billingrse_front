import type { ComponentType } from 'react';
import { GmailIcon } from './icons/GmailIcon';
import { MailFallbackIcon } from './icons/MailFallbackIcon';

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
  const Icon = providerIconMap[provider] ?? MailFallbackIcon;

  return (
    <div className="flex items-center gap-3 py-3">
      <Icon />
      <span className="text-sm text-slate-900">{accountIdentifier}</span>
      <span className="flex-1" />
      <button
        type="button"
        className="text-sm text-red-600 hover:text-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={isDisconnecting}
        onClick={onDisconnect}
      >
        {isDisconnecting ? '解除中...' : '解除'}
      </button>
    </div>
  );
};
