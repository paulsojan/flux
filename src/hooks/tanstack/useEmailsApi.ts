import emailsApi from "@/app/api/emails";
import { useQuery, useMutation, useInfiniteQuery } from "@tanstack/react-query";

export const useFetchInboxEmailsApi = () =>
  useInfiniteQuery({
    queryKey: ["emails"],
    queryFn: ({ pageParam }) => emailsApi.fetchInboxEmails({ pageParam }),
    initialPageParam: "",
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
  });

export const useFetchSendEmailsApi = () =>
  useInfiniteQuery({
    queryKey: ["send-emails"],
    queryFn: ({ pageParam }) => emailsApi.fetchSendEmails({ pageParam }),
    initialPageParam: "",
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
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
