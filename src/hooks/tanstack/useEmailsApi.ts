import emailsApi from "@/app/api/emails";
import { useQuery, useMutation, useInfiniteQuery } from "@tanstack/react-query";

export const useFetchInboxEmailsApi = (query: string = "") =>
  useInfiniteQuery({
    queryKey: ["emails", { query }],
    queryFn: ({ pageParam }) =>
      emailsApi.fetchInboxEmails({ pageParam, query }),
    initialPageParam: "",
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
  });

export const useFetchSendEmailsApi = (query: string = "") =>
  useInfiniteQuery({
    queryKey: ["send-emails", { query }],
    queryFn: ({ pageParam }) => emailsApi.fetchSendEmails({ pageParam, query }),
    initialPageParam: "",
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
  });

export const useFetchEmailApi = (emailId: string) =>
  useQuery({
    queryKey: ["emails", emailId],
    queryFn: () => emailsApi.show(emailId),
  });

export const useCreateEmailApi = () =>
  useMutation({
    mutationFn: (data: object) => emailsApi.create(data),
  });
