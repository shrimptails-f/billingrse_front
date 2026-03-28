import { ApiError } from './client';

export const toFriendlyMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return error.apiMessage ?? '認証エラーが発生しました。再度ログインしてください。';
    }

    if (error.apiMessage) {
      return error.apiMessage;
    }

    if (error.status === 400) {
      return '不明なリクエストです。入力内容をご確認ください。';
    }

    if (error.status >= 500) {
      return '致命的なエラーが発生しました。管理者にお問い合わせください。';
    }
  }

  return 'エラーが発生しました。時間をおいて再度お試しください。';
};
