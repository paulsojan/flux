"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AgentState } from "@/lib/types";

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

export function useAgentSync(state?: AgentState) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const stateRef = useRef(state);
  const prevViewRef = useRef<string | undefined>(state?.current_view);

  const navigate = useCallback(
    (view: string, emailId?: string) => {
      const target = resolveRoute(view, emailId);
      if (!target) return;

      const current = window.location.pathname + window.location.search;

      if (current !== target) {
        router.push(target);
      }
    },
    [router],
  );

  // agent-driven navigation
  useEffect(() => {
    const view = state?.current_view;
    if (!view || view === prevViewRef.current) return;

    prevViewRef.current = view;
    navigate(view, state?.current_email?.id);
  }, [state?.current_view, state?.current_email?.id, navigate]);

  const handleSyncToUI = useCallback(
    async ({ target, query }: { target: string; query?: string }) => {
      const currentState = stateRef.current;
      if (!currentState) return "No state available";

      if (target === "inbox" && query) {
        const route = `/inbox?query=${encodeURIComponent(query)}`;
        router.replace(route);
      }

      if (target === "sent" && query) {
        const route = `/sent?query=${encodeURIComponent(query)}`;
        router.replace(route);
      }

      if (target === "email_detail" && currentState.current_email?.id) {
        queryClient.setQueryData(
          ["email", currentState.current_email.id],
          currentState.current_email,
        );
      }

      return `Synced ${target} to UI`;
    },
    [queryClient, router],
  );

  const handleNavigateTo = useCallback(
    async ({ view }: { view: string }) => {
      navigate(view);
      return `Navigated to ${view}`;
    },
    [navigate],
  );

  const handleRefreshEmails = useCallback(
    async ({ list }: { list: "inbox" | "sent" }) => {
      const queryKey = list === "inbox" ? ["emails"] : ["send-emails"];
      await queryClient.invalidateQueries({ queryKey });
      return `Refreshed ${list} emails`;
    },
    [queryClient],
  );

  return {
    handleNavigateTo,
    handleRefreshEmails,
    handleSyncToUI,
  };
}
