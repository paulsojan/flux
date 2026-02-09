"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AgentState } from "@/lib/types";

const VIEW_TO_ROUTE: Record<string, string> = {
  inbox: "/inbox",
  sent: "/sent",
  compose: "/compose",
};

export function useAgentUiSync(state: AgentState | undefined) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const prevViewRef = useRef(state?.current_view);

  const navigate = useCallback(
    (view: string, emailId?: string) => {
      if (view === "detail" && emailId) {
        const target = `/inbox/${emailId}`;
        if (pathname !== target) router.push(target);
      } else if (view === "sent_detail" && emailId) {
        const target = `/sent/${emailId}`;
        if (pathname !== target) router.push(target);
      } else if (view in VIEW_TO_ROUTE) {
        const target = VIEW_TO_ROUTE[view];
        if (pathname !== target) router.push(target);
      }
    },
    [pathname, router],
  );

  useEffect(() => {
    const view = state?.current_view;
    if (!view || view === prevViewRef.current) return;

    prevViewRef.current = view;
    navigate(view, state?.current_email?.id);
  }, [state?.current_view, state?.current_email?.id, navigate]);

  useEffect(() => {
    if (!state) return;

    if (state.emails?.length > 0) {
      queryClient.setQueryData(["emails"], { emails: state.emails });
    }

    if (state.sent_emails?.length > 0) {
      queryClient.setQueryData(["send-emails"], {
        emails: state.sent_emails,
      });
    }

    if (state.current_email?.id) {
      queryClient.setQueryData(
        ["email", state.current_email.id],
        state.current_email,
      );
    }
  }, [state?.emails, state?.sent_emails, state?.current_email, queryClient]);

  const handleNavigateTo = useCallback(
    async ({ view }: { view: string }) => {
      navigate(view);
      return `Navigated to ${view}`;
    },
    [navigate],
  );

  const handleRefreshEmails = useCallback(
    async ({ list }: { list: string }) => {
      const queryKey = list === "inbox" ? ["emails"] : ["send-emails"];
      await queryClient.invalidateQueries({ queryKey });
      return `Refreshed ${list} emails`;
    },
    [queryClient],
  );

  return {
    handleNavigateTo,
    handleRefreshEmails,
  };
}
