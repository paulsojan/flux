import type { EmailDetail } from "@/lib/types";
import axios from "./axios";

const fetchInboxEmails = ({ pageParam = "", query = "" }) => {
  const params = {
    label: "INBOX",
    max_results: "20",
    page_token: pageParam,
    query: query,
  };

  return axios.get("api/emails", { params });
};

const fetchSendEmails = ({ pageParam = "", query = "" }) => {
  const params = {
    label: "SENT",
    max_results: "20",
    page_token: pageParam,
    query: query,
  };
  return axios.get("api/emails", { params });
};

const show = (emailId: string) =>
  axios.get(`api/emails/${emailId}`) as Promise<EmailDetail>;

const create = (payload: object) => axios.post("api/emails/send", payload);

const emailsApi = { fetchInboxEmails, fetchSendEmails, show, create };

export default emailsApi;
