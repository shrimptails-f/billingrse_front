import type { JSX, ReactNode, SelectHTMLAttributes } from 'react';
import { forwardRef, useEffect, useRef, useState, type Ref } from 'react';
import { Link } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ApiError } from '@/shared/api/client';
import { Spinner } from '@/shared/ui/Spinner';
import { Button } from '@/shared/ui/primitives/Button';
import { TextField } from '@/shared/ui/primitives/TextField';
import {
  manualMailWorkflowSchema,
  toJstEndOfDayString,
  toJstStartOfDayString,
  type ManualMailWorkflowFormValues,
} from '../schema/manual-mail-workflow.schema';
import { useConnectionOptions } from '../hooks/useConnectionOptions';
import { useStartManualMailWorkflow } from '../hooks/useStartManualMailWorkflow';

type Props = {
  onWorkflowAccepted: () => void | Promise<void>;
  onUnauthorized: () => void;
};

type SelectFieldProps = {
  id: string;
  label: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  children: ReactNode;
} & SelectHTMLAttributes<HTMLSelectElement>;

const panelClassName =
  'rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg backdrop-blur md:p-8';
const selectClassName =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-inner transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400';

const mapStartError = (error: unknown): string => {
  if (error instanceof ApiError && error.status === 401) {
    return '認証エラーが発生しました。再度ログインしてください。';
  }

  return '受付に失敗しました。時間をおいて再度お試しください。';
};

const formatDateInputValue = (value: Date): string => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const getCurrentMonthDateRange = (): Pick<ManualMailWorkflowFormValues, 'since' | 'until'> => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    since: formatDateInputValue(firstDay),
    until: formatDateInputValue(lastDay),
  };
};

const SelectFieldInner = (props: SelectFieldProps, ref: Ref<HTMLSelectElement>): JSX.Element => {
  const { id, label, error, helperText, children, className, ...rest } = props;
  const errorId = error ? `${id}-error` : undefined;
  const helperId = helperText && !error ? `${id}-helper` : undefined;
  const describedBy = errorId ?? helperId;

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
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
      >
        {children}
      </select>
      {error ? (
        <p id={errorId} className="text-sm text-red-600">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-sm text-slate-500">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};

const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(SelectFieldInner);

SelectField.displayName = 'SelectField';

export const WorkflowRequestForm = (props: Props): JSX.Element => {
  const { onWorkflowAccepted, onUnauthorized } = props;
  const defaultDateRange = getCurrentMonthDateRange();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isAccepted, setIsAccepted] = useState(false);
  const [isSubmittingLocally, setIsSubmittingLocally] = useState(false);
  const submitGuardRef = useRef(false);
  const connectionQuery = useConnectionOptions();
  const startMutation = useStartManualMailWorkflow();
  const isSubmitting = startMutation.isPending || isSubmittingLocally;
  const hasNoConnections =
    !connectionQuery.isLoading && !connectionQuery.isError && connectionQuery.options.length === 0;
  const isExecutionLocked = isAccepted || isSubmitting;
  const isFormUnavailable =
    isExecutionLocked || connectionQuery.isLoading || connectionQuery.isError || hasNoConnections;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ManualMailWorkflowFormValues>({
    resolver: zodResolver(manualMailWorkflowSchema),
    defaultValues: {
      connectionId: '',
      labelName: '',
      since: defaultDateRange.since,
      until: defaultDateRange.until,
    },
    mode: 'onBlur',
  });

  useEffect(() => {
    if (connectionQuery.error instanceof ApiError && connectionQuery.error.status === 401) {
      onUnauthorized();
    }
  }, [connectionQuery.error, onUnauthorized]);

  const onSubmit = (values: ManualMailWorkflowFormValues): void => {
    if (
      submitGuardRef.current ||
      isAccepted ||
      connectionQuery.isLoading ||
      connectionQuery.isError ||
      hasNoConnections
    ) {
      return;
    }

    const since = toJstStartOfDayString(values.since);
    const until = toJstEndOfDayString(values.until);

    if (!since || !until) {
      setServerError('日付の形式が不正です。入力内容を確認してください。');
      return;
    }

    submitGuardRef.current = true;
    setIsSubmittingLocally(true);
    setServerError(null);
    startMutation.mutate(
      {
        connection_id: Number(values.connectionId),
        label_name: values.labelName,
        since,
        until,
      },
      {
        onSuccess: () => {
          setIsAccepted(true);
          setIsSubmittingLocally(false);
          void onWorkflowAccepted();
        },
        onError: (error: unknown) => {
          if (error instanceof ApiError && error.status === 401) {
            setIsSubmittingLocally(false);
            onUnauthorized();
            return;
          }

          submitGuardRef.current = false;
          setIsSubmittingLocally(false);
          setServerError(mapStartError(error));
        },
      }
    );
  };

  return (
    <section className={panelClassName}>
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">
          実行条件
        </p>
      </div>

      {connectionQuery.isLoading ? (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
          <Spinner size={18} label="メール連携を読み込み中" />
          メール連携を読み込み中です。
        </div>
      ) : null}

      {connectionQuery.isError ? (
        <div
          role="alert"
          aria-live="polite"
          className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700"
        >
          <div className="flex items-start gap-3">
            <span className="mt-2 h-2 w-2 rounded-full bg-red-500" />
            <div className="flex-1 space-y-3">
              <p>メール連携一覧の取得に失敗しました。時間をおいて再度お試しください。</p>
              <Button
                type="button"
                variant="secondary"
                fullWidth={false}
                onClick={() => {
                  void connectionQuery.refetch();
                }}
              >
                再読み込み
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {hasNoConnections ? (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-7 text-amber-900">
          <p className="font-semibold">先に Gmail 連携を追加してください。</p>
          <p className="mt-1">
            手動メール取得を実行するには、メールサービス連携が 1 件以上必要です。
          </p>
          <Link
            to="/mail-account-connections/gmail"
            className="mt-3 inline-flex text-sm font-semibold text-emerald-700 underline decoration-emerald-200 underline-offset-4 transition hover:text-emerald-900"
          >
            Gmail 連携画面へ移動する
          </Link>
        </div>
      ) : null}

      {serverError ? (
        <div
          role="alert"
          aria-live="polite"
          className="mt-6 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700"
        >
          <span className="h-2 w-2 rounded-full bg-red-500" />
          {serverError}
        </div>
      ) : null}

      <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <SelectField
          id="connectionId"
          label="メール連携"
          error={errors.connectionId?.message}
          disabled={isFormUnavailable}
          defaultValue=""
          {...register('connectionId')}
        >
          <option value="" disabled>
            メール連携を選択してください
          </option>
          {connectionQuery.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>

        <TextField
          id="labelName"
          label="ラベル名"
          placeholder="INBOX"
          autoComplete="off"
          error={errors.labelName?.message}
          disabled={isFormUnavailable}
          {...register('labelName')}
        />

        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-800">検索日付範囲</p>
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-start">
            <TextField
              id="since"
              type="date"
              aria-label="開始日"
              error={errors.since?.message}
              disabled={isFormUnavailable}
              {...register('since')}
            />
            <div
              aria-hidden="true"
              className="flex h-12 items-center justify-center text-lg font-semibold text-slate-400"
            >
              ～
            </div>
            <TextField
              id="until"
              type="date"
              aria-label="終了日"
              error={errors.until?.message}
              disabled={isFormUnavailable}
              {...register('until')}
            />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <Button
            type="submit"
            disabled={isFormUnavailable}
            leftIcon={isSubmitting ? <Spinner size={16} className="text-white" /> : null}
          >
            {isSubmitting ? '解析実行中...' : isAccepted ? '受付済み' : '解析実行'}
          </Button>

          {isAccepted ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-7 text-emerald-900">
              解析実行を受け付けました。最新の状況は履歴一覧をご確認ください。
            </div>
          ) : null}
        </div>
      </form>
    </section>
  );
};
