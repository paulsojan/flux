export type EmailSummary = {
  id: string;
  threadId?: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  snippet: string;
};

export type EmailDetail = {
  id: string;
  threadId?: string;
  messageId?: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  body: string;
  labelIds?: string[];
};

export type EmailFilters = {
  keyword: string;
  readStatus: "all" | "read" | "unread";
};

export type AgentState = {
  emails: EmailSummary[];
  sent_emails: EmailSummary[];
  current_email: EmailDetail | null;
  current_view: "inbox" | "sent" | "compose" | "detail" | "sent_detail";
  next_page_token?: string;
};
