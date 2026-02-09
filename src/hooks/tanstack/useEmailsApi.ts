import emailsApi from "@/app/api/emails";
import { useQuery, useMutation } from "@tanstack/react-query";

export const useFetchInboxEmailsApi = () =>
  useQuery({
    queryKey: ["emails"],
    queryFn: () => emailsApi.fetchInboxEmails(),
  });

export const useFetchSendEmailsApi = () =>
  useQuery({
    queryKey: ["send-emails"],
    queryFn: () => emailsApi.fetchSendEmails(),
  });

export const useFetchEmailApi = (emailId: string) =>
  useQuery({
    queryKey: ["email", emailId],
    queryFn: () => emailsApi.show(emailId),
  });

export const useCreateEmailApi = () =>
  useMutation({
    mutationFn: (data: object) => emailsApi.create(data),
  });
