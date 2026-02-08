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
  from: string;
  to: string;
  subject: string;
  date: string;
  body: string;
  labelIds?: string[];
};

export type AgentState = {
  emails: EmailSummary[];
  sent_emails: EmailSummary[];
  current_email: EmailDetail | null;
  current_view: "inbox" | "sent" | "compose" | "detail";
  is_authenticated: boolean;
  auth_url: string;
};
