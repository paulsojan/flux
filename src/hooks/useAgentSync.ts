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

function resolveRoute(view: string, emailId?: string): string | null {
  if (view === "detail" && emailId) return `/inbox/${emailId}`;
  if (view === "sent_detail" && emailId) return `/sent/${emailId}`;
  return VIEW_TO_ROUTE[view] ?? null;
}

export function useAgentSync(state?: AgentState) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

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

  // Sync agent data into React Query cache
  useEffect(() => {
    if (!state) return;

    const clearFiltersIfNeeded = (route: string) => {
      if (pathname === route && window.location.search) {
        window.dispatchEvent(new CustomEvent("agent:clear-filters"));
        router.replace(route);
      }
    };

    if (state.emails?.length) {
      queryClient.setQueryData(["emails", { query: "" }], {
        pages: [
          {
            emails: state.emails,
            nextPageToken: state.next_page_token,
          },
        ],
        pageParams: [""],
      });
      clearFiltersIfNeeded("/inbox");
    }

    if (state.sent_emails?.length) {
      queryClient.setQueryData(["send-emails", { query: "" }], {
        pages: [
          {
            emails: state.sent_emails,
            nextPageToken: state.next_page_token,
          },
        ],
        pageParams: [""],
      });
      clearFiltersIfNeeded("/sent");
    }

    if (state.current_email?.id) {
      queryClient.setQueryData(
        ["email", state.current_email.id],
        state.current_email,
      );
    }
  }, [pathname, queryClient, router, state]);

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
  };
}
