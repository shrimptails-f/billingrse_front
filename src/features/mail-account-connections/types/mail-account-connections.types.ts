export type MailAccountConnectionItem = {
  id: number;
  provider: string;
  account_identifier: string;
  created_at: string;
  updated_at: string;
};

export type MailAccountConnectionListResponse = {
  items: MailAccountConnectionItem[];
};
