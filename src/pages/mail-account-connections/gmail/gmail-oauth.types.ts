import type {
  MailAccountConnectionItem,
  MailAccountConnectionListResponse,
} from '@/lib/api/mail-account-connections';

export type GmailAuthorizeResponse = {
  authorization_url: string;
  expires_at: string;
};

export type GmailOAuthCallbackPayload = {
  code: string;
  state: string;
};

export type GmailOAuthCallbackResponse = {
  message: string;
};

export type GmailOAuthErrorCode =
  | 'invalid_request'
  | 'unauthorized'
  | 'oauth_state_mismatch'
  | 'oauth_state_expired'
  | 'gmail_oauth_exchange_failed'
  | 'gmail_profile_fetch_failed'
  | 'internal_server_error';

export type GmailOAuthErrorBody = {
  code?: GmailOAuthErrorCode | string;
  message?: string;
  error?: {
    code?: GmailOAuthErrorCode | string;
    message?: string;
  };
};

// 一覧 API レスポンス
export type ConnectionItem = MailAccountConnectionItem;

export type ConnectionListResponse = MailAccountConnectionListResponse;

// 解除 API エラー
export type DisconnectErrorCode =
  | 'invalid_request'
  | 'unauthorized'
  | 'mail_account_connection_not_found'
  | 'internal_server_error';
