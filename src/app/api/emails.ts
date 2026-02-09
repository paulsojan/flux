import type { EmailSummary, EmailDetail } from "@/lib/types";
import axios from "./axios";

type EmailListResponse = { emails: EmailSummary[] };

const fetchInboxEmails = () =>
  axios.get(
    "api/emails?label=INBOX&max_results=20",
  ) as Promise<EmailListResponse>;

const fetchSendEmails = () =>
  axios.get(
    "api/emails?label=SENT&max_results=20",
  ) as Promise<EmailListResponse>;

const show = (emailId: string) =>
  axios.get(`api/emails/${emailId}`) as Promise<EmailDetail>;

const create = (payload: object) => axios.post("api/emails/send", payload);

const emailsApi = { fetchInboxEmails, fetchSendEmails, show, create };

export default emailsApi;
