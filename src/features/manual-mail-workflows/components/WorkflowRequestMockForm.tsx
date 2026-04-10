import type { ChangeEvent, FormEvent, JSX, ReactNode, SelectHTMLAttributes } from 'react';
import { forwardRef, type Ref, useState } from 'react';
import { Button } from '@/shared/ui/primitives/Button';
import { TextField } from '@/shared/ui/primitives/TextField';
import type { MockConnectionOption } from '../lib/manual-mail-workflow.mock';

type Props = {
  connectionOptions: MockConnectionOption[];
  onSubmit: (values: {
    connectionId: string;
    accountIdentifier: string;
    labelName: string;
    since: string;
    until: string;
  }) => void;
};

type SelectFieldProps = {
  id: string;
  label: string;
  helperText?: string;
  children: ReactNode;
} & SelectHTMLAttributes<HTMLSelectElement>;

const panelClassName =
  'rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg backdrop-blur md:p-8';
const selectClassName =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-inner transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100';

const SelectFieldInner = (props: SelectFieldProps, ref: Ref<HTMLSelectElement>): JSX.Element => {
  const { id, label, helperText, children, className, ...rest } = props;
  const helperId = helperText ? `${id}-helper` : undefined;

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-800" htmlFor={id}>
        {label}
      </label>
      <select
        {...rest}
        id={id}
        ref={ref}
        className={[selectClassName, className].filter(Boolean).join(' ')}
        aria-describedby={helperId}
      >
        {children}
      </select>
      {helperText ? (
        <p id={helperId} className="text-sm text-slate-500">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};

const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(SelectFieldInner);

SelectField.displayName = 'WorkflowRequestMockFormSelectField';

const getCurrentMonthDateRange = (): { since: string; until: string } => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const formatDate = (value: Date): string => {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  return {
    since: formatDate(firstDay),
    until: formatDate(lastDay),
  };
};

export const WorkflowRequestMockForm = ({ connectionOptions, onSubmit }: Props): JSX.Element => {
  const defaultRange = getCurrentMonthDateRange();
  const [connectionId, setConnectionId] = useState(connectionOptions[0]?.value ?? '');
  const [labelName, setLabelName] = useState('INBOX');
  const [since, setSince] = useState(defaultRange.since);
  const [until, setUntil] = useState(defaultRange.until);
  const [isAccepted, setIsAccepted] = useState(false);

  const selectedConnection =
    connectionOptions.find((option) => option.value === connectionId) ?? connectionOptions[0];

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    if (!selectedConnection) {
      return;
    }

    onSubmit({
      connectionId,
      accountIdentifier: selectedConnection.accountIdentifier,
      labelName,
      since,
      until,
    });
    setIsAccepted(true);
  };

  const handleFieldChange = (
    setter: (value: string) => void,
    nextValue: string,
    resetAccepted = true
  ): void => {
    setter(nextValue);

    if (resetAccepted) {
      setIsAccepted(false);
    }
  };

  return (
    <section className={panelClassName}>
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">
          実行条件
        </p>
        <p className="text-sm leading-7 text-slate-600">
          メール連携、ラベル名、取得期間を指定して解析を開始します。
        </p>
      </div>

      {isAccepted ? (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
          解析実行を受け付けました。最新の状況は履歴一覧をご確認ください。
        </div>
      ) : null}

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        <SelectField
          id="mock-connection-id"
          label="メール連携"
          value={connectionId}
          helperText="解析対象の Gmail 連携を選択してください。"
          onChange={(event: ChangeEvent<HTMLSelectElement>) => {
            handleFieldChange(setConnectionId, event.target.value);
          }}
        >
          {connectionOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>

        <TextField
          id="mock-label-name"
          label="ラベル名"
          value={labelName}
          onChange={(event) => {
            handleFieldChange(setLabelName, event.target.value);
          }}
          placeholder="例: INBOX"
        />

        <div className="grid gap-5 md:grid-cols-2">
          <TextField
            id="mock-since"
            label="開始日"
            type="date"
            value={since}
            onChange={(event) => {
              handleFieldChange(setSince, event.target.value);
            }}
          />
          <TextField
            id="mock-until"
            label="終了日"
            type="date"
            value={until}
            onChange={(event) => {
              handleFieldChange(setUntil, event.target.value);
            }}
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4 text-sm leading-6 text-slate-600">
          条件例:
          {` ${selectedConnection?.accountIdentifier ?? 'billing-team@example.com'} / ${labelName || 'INBOX'} / ${since} - ${until}`}
        </div>

        <Button type="submit">解析実行</Button>
      </form>
    </section>
  );
};
