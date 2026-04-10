import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { DashboardSummaryResponse } from '../types/dashboard-summary.types';
import { DashboardEntryCard } from './DashboardEntryCard';

const summaryResponse: DashboardSummaryResponse = {
  current_month_analysis_success_count: 1280,
  current_month_fallback_billing_count: 96,
  total_saved_billing_count: 842,
};

const emptySummaryResponse: DashboardSummaryResponse = {
  current_month_analysis_success_count: 0,
  current_month_fallback_billing_count: 0,
  total_saved_billing_count: 0,
};

describe('DashboardEntryCard', () => {
  it('renders three KPI items and dashboard links', () => {
    render(
      <MemoryRouter>
        <DashboardEntryCard summary={summaryResponse} />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: '解析・保存サマリー' })).toBeInTheDocument();
    expect(screen.getByText('今月の解析成功件数')).toBeInTheDocument();
    expect(screen.getByText('1,280件')).toBeInTheDocument();
    expect(screen.getByText('今月の補完件数')).toBeInTheDocument();
    expect(screen.getByText('96件')).toBeInTheDocument();
    expect(screen.getByText('累計保存請求件数')).toBeInTheDocument();
    expect(screen.getByText('842件')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '今月の解析成功件数の説明を表示' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '累計保存請求件数の説明を表示' })
    ).not.toBeInTheDocument();

    expect(screen.getByRole('link', { name: '請求集計を開く' })).toHaveAttribute(
      'href',
      '/billing-summary'
    );
    expect(screen.getByRole('link', { name: '手動メール取得を開く' })).toHaveAttribute(
      'href',
      '/manual-mail-workflows'
    );
  });

  it('opens the fallback billing tooltip', () => {
    render(
      <MemoryRouter>
        <DashboardEntryCard summary={summaryResponse} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: '今月の補完件数の説明を表示' }));

    expect(screen.getByRole('tooltip')).toHaveTextContent(
      '請求日がメールに無いため、メール受信日で判定した件数'
    );
  });

  it('renders zero counts as valid KPI values', () => {
    render(
      <MemoryRouter>
        <DashboardEntryCard summary={emptySummaryResponse} />
      </MemoryRouter>
    );

    expect(screen.getAllByText('0件')).toHaveLength(3);
  });
});
