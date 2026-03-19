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
