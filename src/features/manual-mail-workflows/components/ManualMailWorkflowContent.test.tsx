import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Providers } from '@/app/providers/Providers';
import { ApiError } from '@/shared/api/client';
import { ManualMailWorkflowContent } from './ManualMailWorkflowContent';

const mutateMock = vi.fn();
const connectionRefetchMock = vi.fn();
const historyRefetchMock = vi.fn();
const useManualMailWorkflowHistoriesMock = vi.fn();
const navigateMock = vi.fn();

let isLoading = false;
let isError = false;
let isPending = false;
let historyIsLoading = false;
let historyIsError = false;
let historyIsFetching = false;
let connectionError: unknown;
let historyError: unknown;
let connectionData:
  | {
      items: Array<{
        id: number;
        provider: string;
        account_identifier: string;
        created_at: string;
        updated_at: string;
      }>;
    }
  | undefined;
let connectionOptions: Array<{
  value: string;
  label: string;
  provider: string;
  accountIdentifier: string;
}>;
let historyData:
  | {
      items: Array<{
        workflow_id: string;
        error_message?: string | null;
        connection_id: number;
        provider?: string | null;
        account_identifier?: string | null;
        label_name: string;
        since: string;
        until: string;
        status: 'queued' | 'running' | 'succeeded' | 'partial_success' | 'failed';
        current_stage:
          | 'fetch'
          | 'analysis'
          | 'vendor_resolution'
          | 'billing_eligibility'
          | 'billing'
          | null;
        queued_at: string;
        finished_at: string | null;
        fetch: {
          success_count: number;
          business_failure_count: number;
          technical_failure_count: number;
          failures: Array<{
            external_message_id: string | null;
            reason_code: string;
            message: string;
            created_at: string;
          }>;
        };
        analysis: {
          success_count: number;
          business_failure_count: number;
          technical_failure_count: number;
          failures: Array<{
            external_message_id: string | null;
            reason_code: string;
            message: string;
            created_at: string;
          }>;
        };
        vendor_resolution: {
          success_count: number;
          business_failure_count: number;
          technical_failure_count: number;
          failures: Array<{
            external_message_id: string | null;
            reason_code: string;
            message: string;
            created_at: string;
          }>;
        };
        billing_eligibility: {
          success_count: number;
          business_failure_count: number;
          technical_failure_count: number;
          failures: Array<{
            external_message_id: string | null;
            reason_code: string;
            message: string;
            created_at: string;
          }>;
        };
        billing: {
          success_count: number;
          business_failure_count: number;
          technical_failure_count: number;
          failures: Array<{
            external_message_id: string | null;
            reason_code: string;
            message: string;
            created_at: string;
          }>;
        };
      }>;
      total_count: number;
    }
  | undefined;

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('../hooks/useConnectionOptions', () => ({
  useConnectionOptions: () => ({
    data: connectionData,
    options: connectionOptions,
    isLoading,
    isError,
    error: connectionError,
    refetch: connectionRefetchMock,
  }),
}));

vi.mock('../hooks/useStartManualMailWorkflow', () => ({
  useStartManualMailWorkflow: () => ({
    mutate: mutateMock,
    isPending,
  }),
}));

vi.mock('../hooks/useManualMailWorkflowHistories', () => ({
  useManualMailWorkflowHistories: (params: { limit: number; offset: number }) => {
    useManualMailWorkflowHistoriesMock(params);

    return {
      data: historyData,
      isLoading: historyIsLoading,
      isError: historyIsError,
      isFetching: historyIsFetching,
      error: historyError,
      refetch: historyRefetchMock,
    };
  },
}));

const fillAndSubmit = async (): Promise<void> => {
  fireEvent.change(screen.getByLabelText('メール連携'), { target: { value: '1' } });
  fireEvent.change(screen.getByLabelText('ラベル名'), { target: { value: 'INBOX' } });
  fireEvent.change(screen.getByLabelText('開始日'), { target: { value: '2026-03-25' } });
  fireEvent.change(screen.getByLabelText('終了日'), { target: { value: '2026-03-27' } });
  fireEvent.click(screen.getByRole('button', { name: '解析実行' }));

  await waitFor(() => expect(mutateMock).toHaveBeenCalledTimes(1));
};

describe('ManualMailWorkflowContent', () => {
  beforeEach(() => {
    mutateMock.mockReset();
    connectionRefetchMock.mockReset();
    historyRefetchMock.mockReset();
    useManualMailWorkflowHistoriesMock.mockReset();
    navigateMock.mockReset();
    historyRefetchMock.mockResolvedValue(undefined);
    isLoading = false;
    isError = false;
    isPending = false;
    historyIsLoading = false;
    historyIsError = false;
    historyIsFetching = false;
    connectionError = undefined;
    historyError = undefined;
    connectionData = {
      items: [
        {
          id: 1,
          provider: 'gmail',
          account_identifier: 'user@gmail.com',
          created_at: '2026-03-25T00:00:00Z',
          updated_at: '2026-03-25T00:00:00Z',
        },
      ],
    };
    connectionOptions = [
      {
        value: '1',
        label: 'GMAIL / user@gmail.com',
        provider: 'gmail',
        accountIdentifier: 'user@gmail.com',
      },
    ];
    historyData = {
      items: [
        {
          workflow_id: 'wf_history_1',
          error_message: null,
          connection_id: 1,
          provider: 'gmail',
          account_identifier: 'user@gmail.com',
          label_name: 'INBOX',
          since: '2026-03-25T00:00:00Z',
          until: '2026-03-27T23:59:00Z',
          status: 'queued',
          current_stage: 'analysis',
          queued_at: '2026-03-25T09:00:00Z',
          finished_at: null,
          fetch: {
            success_count: 10,
            business_failure_count: 0,
            technical_failure_count: 1,
            failures: [
              {
                external_message_id: null,
                reason_code: 'fetch_failed',
                message: 'メール取得に失敗しました。',
                created_at: '2026-03-25T09:01:00Z',
              },
            ],
          },
          analysis: {
            success_count: 9,
            business_failure_count: 0,
            technical_failure_count: 0,
            failures: [],
          },
          vendor_resolution: {
            success_count: 0,
            business_failure_count: 0,
            technical_failure_count: 0,
            failures: [],
          },
          billing_eligibility: {
            success_count: 0,
            business_failure_count: 0,
            technical_failure_count: 0,
            failures: [],
          },
          billing: {
            success_count: 0,
            business_failure_count: 0,
            technical_failure_count: 0,
            failures: [],
          },
        },
      ],
      total_count: 41,
    };
  });

  it('shows a loading state while connections are being fetched', () => {
    isLoading = true;

    render(
      <MemoryRouter>
        <Providers>
          <ManualMailWorkflowContent />
        </Providers>
      </MemoryRouter>
    );

    expect(screen.getByRole('status', { name: 'メール連携を読み込み中' })).toBeInTheDocument();
  });

  it('shows the manual execution history table instead of the accepted card', () => {
    render(
      <MemoryRouter>
        <Providers>
          <ManualMailWorkflowContent />
        </Providers>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: '実行履歴' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: '受付日時' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'メールアドレス' })).toBeInTheDocument();
    expect(screen.getByText('受付済み')).toBeInTheDocument();
    expect(screen.getByText('AI解析')).toBeInTheDocument();
    expect(screen.getByText('user@gmail.com')).toBeInTheDocument();
    expect(screen.queryByText('受付結果')).not.toBeInTheDocument();
    expect(screen.getByText('手動メール取得の実行履歴を表示します。')).toBeInTheDocument();
  });

  it('sets the current month date range as the default form values', () => {
    const now = new Date();
    const expectedSince = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const expectedUntil = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()).padStart(2, '0')}`;

    render(
      <MemoryRouter>
        <Providers>
          <ManualMailWorkflowContent />
        </Providers>
      </MemoryRouter>
    );

    expect(screen.getByLabelText('開始日')).toHaveValue(expectedSince);
    expect(screen.getByLabelText('終了日')).toHaveValue(expectedUntil);
  });

  it('opens a detail modal from the history table', () => {
    render(
      <MemoryRouter>
        <Providers>
          <ManualMailWorkflowContent />
        </Providers>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: '詳細' }));

    const dialog = screen.getByRole('dialog');

    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByRole('heading', { name: '履歴詳細' })).toBeInTheDocument();
    expect(within(dialog).getByText('実行日時')).toBeInTheDocument();
    expect(within(dialog).getByText('メールサービス')).toBeInTheDocument();
    expect(within(dialog).getByText('メールアドレス')).toBeInTheDocument();
    expect(within(dialog).getByText('gmail')).toBeInTheDocument();
    expect(within(dialog).getByText('user@gmail.com')).toBeInTheDocument();
    expect(within(dialog).queryByText('エラーメッセージ')).not.toBeInTheDocument();
    expect(within(dialog).getByRole('columnheader', { name: 'ステージ' })).toBeInTheDocument();
    expect(within(dialog).getByText('決済会社判定')).toBeInTheDocument();
    expect(within(dialog).getByText('請求成立可否判定')).toBeInTheDocument();
    expect(within(dialog).getByText('メール取得に失敗しました。')).toBeInTheDocument();
  });

  it('shows a workflow-level error message in the detail modal when present', () => {
    if (!historyData) {
      throw new Error('historyData must be defined for this test');
    }

    historyData = {
      ...historyData,
      items: historyData.items.map((item) => ({
        ...item,
        error_message: '履歴全体の処理に失敗しました。',
      })),
    };

    render(
      <MemoryRouter>
        <Providers>
          <ManualMailWorkflowContent />
        </Providers>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: '詳細' }));

    const dialog = screen.getByRole('dialog');
    const alert = within(dialog).getByRole('alert');
    const executedAtTerm = within(dialog).getByText('実行日時');

    expect(alert).toBeInTheDocument();
    expect(within(dialog).getByText('エラーメッセージ')).toBeInTheDocument();
    expect(within(dialog).getByText('履歴全体の処理に失敗しました。')).toBeInTheDocument();
    expect(alert.compareDocumentPosition(executedAtTerm) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  it('updates the query offset when moving to the next page', () => {
    render(
      <MemoryRouter>
        <Providers>
          <ManualMailWorkflowContent />
        </Providers>
      </MemoryRouter>
    );

    expect(useManualMailWorkflowHistoriesMock).toHaveBeenLastCalledWith({
      limit: 20,
      offset: 0,
    });

    fireEvent.click(screen.getByRole('button', { name: '次へ' }));

    expect(useManualMailWorkflowHistoriesMock).toHaveBeenLastCalledWith({
      limit: 20,
      offset: 20,
    });
    expect(screen.getByText('2 / 3 ページ')).toBeInTheDocument();
  });

  it('shows an empty-state guide and disables submit when no connections exist', () => {
    connectionData = { items: [] };
    connectionOptions = [];

    render(
      <MemoryRouter>
        <Providers>
          <ManualMailWorkflowContent />
        </Providers>
      </MemoryRouter>
    );

    expect(screen.getByText('先に Gmail 連携を追加してください。')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '解析実行' })).toBeDisabled();
    expect(screen.getByRole('link', { name: 'Gmail 連携画面へ移動する' })).toHaveAttribute(
      'href',
      '/mail-account-connections/gmail'
    );
  });

  it('validates that until is later than since before submitting', async () => {
    render(
      <MemoryRouter>
        <Providers>
          <ManualMailWorkflowContent />
        </Providers>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('メール連携'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('ラベル名'), { target: { value: 'INBOX' } });
    fireEvent.change(screen.getByLabelText('開始日'), { target: { value: '2026-03-26' } });
    fireEvent.change(screen.getByLabelText('終了日'), { target: { value: '2026-03-25' } });
    fireEvent.click(screen.getByRole('button', { name: '解析実行' }));

    await waitFor(() =>
      expect(screen.getByText('終了日は開始日以降にしてください。')).toBeInTheDocument()
    );
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it('submits workflow parameters and refetches the history list on success', async () => {
    render(
      <MemoryRouter>
        <Providers>
          <ManualMailWorkflowContent />
        </Providers>
      </MemoryRouter>
    );

    await fillAndSubmit();

    expect(mutateMock).toHaveBeenCalledWith(
      {
        connection_id: 1,
        label_name: 'INBOX',
        since: '2026-03-25T00:00:00+09:00',
        until: '2026-03-27T23:59:00+09:00',
      },
      expect.any(Object)
    );

    const options = mutateMock.mock.calls[0][1] as {
      onSuccess: (payload: { message: string; workflow_id: string; status: 'queued' }) => void;
    };

    act(() => {
      options.onSuccess({
        message: 'workflow を受け付けました。',
        workflow_id: 'wf_12345',
        status: 'queued',
      });
    });

    await waitFor(() => expect(historyRefetchMock).toHaveBeenCalledTimes(1));

    expect(screen.getByRole('button', { name: '受付済み' })).toBeDisabled();
    expect(
      screen.getByText('解析実行を受け付けました。最新の状況は履歴一覧をご確認ください。')
    ).toBeInTheDocument();

    const submitButton = screen.getByRole('button', { name: '受付済み' });
    expect(submitButton).toBeDisabled();

    const form = submitButton.closest('form');
    expect(form).not.toBeNull();

    if (form) {
      fireEvent.submit(form);
    }

    expect(mutateMock).toHaveBeenCalledTimes(1);
  });

  it('shows a retry action when fetching connections fails', () => {
    isError = true;

    render(
      <MemoryRouter>
        <Providers>
          <ManualMailWorkflowContent />
        </Providers>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: '再読み込み' }));

    expect(
      screen.getByText('メール連携一覧の取得に失敗しました。時間をおいて再度お試しください。')
    ).toBeInTheDocument();
    expect(connectionRefetchMock).toHaveBeenCalledTimes(1);
  });

  it('redirects to login when workflow start fails with 401', async () => {
    render(
      <MemoryRouter>
        <Providers>
          <ManualMailWorkflowContent />
        </Providers>
      </MemoryRouter>
    );

    await fillAndSubmit();

    const options = mutateMock.mock.calls[0][1] as {
      onError: (error: unknown) => void;
    };

    act(() => {
      options.onError(new ApiError({ status: 401, body: { code: 'unauthorized' } }));
    });

    expect(navigateMock).toHaveBeenCalledWith('/login', { replace: true });
  });

  it('redirects to login when the history query returns 401', async () => {
    historyIsError = true;
    historyError = new ApiError({ status: 401, body: { code: 'unauthorized' } });

    render(
      <MemoryRouter>
        <Providers>
          <ManualMailWorkflowContent />
        </Providers>
      </MemoryRouter>
    );

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/login', { replace: true }));
  });
});
