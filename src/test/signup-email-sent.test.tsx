import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { EmailSentContent } from '@/features/auth/components/EmailSentContent';

let initialEntries: string[] = ['/'];

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useSearchParams: () => {
      const url = new URL(`http://localhost${initialEntries[0]}`);
      const params = new URLSearchParams(url.search);
      return [params];
    },
  };
});

describe('EmailSentContent', () => {
  beforeEach(() => {
    sessionStorage.clear();
    initialEntries = ['/'];
  });

  it('displays email address from query params when available', () => {
    initialEntries = ['/?email=user@example.com'];

    render(
      <MemoryRouter initialEntries={initialEntries}>
        <EmailSentContent />
      </MemoryRouter>
    );

    expect(screen.getByText('user@example.com')).toBeInTheDocument();
  });

  it('falls back to sessionStorage when query param is missing', () => {
    sessionStorage.setItem('lastRegisteredEmail', 'stored@example.com');

    render(
      <MemoryRouter initialEntries={initialEntries}>
        <EmailSentContent />
      </MemoryRouter>
    );

    expect(screen.getByText('stored@example.com')).toBeInTheDocument();
  });

  it('renders guidance without email when none is available', () => {
    render(
      <MemoryRouter initialEntries={initialEntries}>
        <EmailSentContent />
      </MemoryRouter>
    );

    expect(screen.queryByText(/@/)).not.toBeInTheDocument();
    expect(screen.getByText('確認メールをチェックしてください')).toBeInTheDocument();
    expect(screen.getByText('メールが届かない場合は、以下をご確認ください：')).toBeInTheDocument();
  });
});
