"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { API_BASE } from "@/app/constants";

export function useEmailStream() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const url = `${API_BASE}api/emails/stream`;
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "new_emails" || data.type === "deleted_emails") {
        queryClient.invalidateQueries({ queryKey: ["emails"] });
        queryClient.invalidateQueries({ queryKey: ["send-emails"] });
      }
    };

    return () => eventSource.close();
  }, [queryClient]);
}
