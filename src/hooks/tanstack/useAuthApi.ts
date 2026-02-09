import authApi from "@/app/api/auth";
import { useQuery } from "@tanstack/react-query";

export const useFetchAuthStatusApi = () =>
  useQuery({
    queryKey: ["auth-status"],
    queryFn: () => authApi.status(),
  });
