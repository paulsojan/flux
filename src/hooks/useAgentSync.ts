"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

const VIEW_TO_ROUTE: Record<string, string> = {
  inbox: "/inbox",
  sent: "/sent",
  compose: "/compose",
};

function resolveRoute(view: string, emailId?: string): string | null {
  if (view === "detail" && emailId) return `/inbox/${emailId}`;
  if (view === "sent_detail" && emailId) return `/sent/${emailId}`;
  return VIEW_TO_ROUTE[view] ?? null;
}

export function useAgentSync() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleNavigateTo = useCallback(
    async ({ view, emailId }: { view: string; emailId?: string }) => {
      const target = resolveRoute(view, emailId);
      if (!target) return "Invalid view";

      router.push(target);
      return `Navigated to ${view}`;
    },
    [router],
  );

  const handleSyncToUI = useCallback(
    async ({ target, query }: { target: string; query?: string }) => {
      if (target === "inbox" && query) {
        router.replace(`/inbox?query=${encodeURIComponent(query)}`);
      }

      if (target === "sent" && query) {
        router.replace(`/sent?query=${encodeURIComponent(query)}`);
      }

      return `Synced ${target} to UI`;
    },
    [router],
  );

  const handleRefreshEmails = useCallback(
    ({ list }: { list: "inbox" | "sent" }) => {
      const queryKey = list === "inbox" ? ["emails"] : ["send-emails"];
      queryClient.invalidateQueries({ queryKey });
      return `Refreshed ${list} emails`;
    },
    [queryClient],
  );

  const handleComposeEmail = useCallback(
    ({ to, subject, body }: { to: string; subject: string; body: string }) => {
      const params = new URLSearchParams();
      if (to) params.set("to", to);
      if (subject) params.set("subject", subject);
      if (body) params.set("body", body);

      router.push(`/compose?${params.toString()}`);

      return "Opened compose form with pre-filled data";
    },
    [router],
  );

  return {
    handleNavigateTo,
    handleRefreshEmails,
    handleSyncToUI,
    handleComposeEmail,
  };
}
