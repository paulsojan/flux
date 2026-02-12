"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useCoAgent } from "@copilotkit/react-core";
import { AgentState } from "@/lib/types";
import { useComposeStore } from "@/store/composeStore";

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
  const { state } = useCoAgent<AgentState>({ name: "ai_mail_agent" });
  const { setEmail } = useComposeStore();

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

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
      setEmail({
        to,
        subject,
        body,
      });

      router.push("/compose");

      return "Opened compose form with pre-filled data";
    },
    [router, setEmail],
  );

  const handleForwardEmail = useCallback(
    ({ to, body }: { to?: string; body?: string }) => {
      const email = stateRef.current.current_email;
      if (!email) return "No email is currently open";

      const subject = email.subject.toLowerCase().startsWith("fwd:")
        ? email.subject
        : `Fwd: ${email.subject}`;

      const forwarded =
        `${body ?? ""}\n\n` +
        `---------- Forwarded message ----------\n` +
        `From: ${email.from}\n` +
        `Date: ${email.date}\n` +
        `Subject: ${email.subject}\n` +
        `To: ${email.to}\n\n` +
        `${email.body}`;

      setEmail({
        to,
        subject,
        body: forwarded,
      });

      router.push("/compose");

      return "Opened compose form with forwarded email";
    },
    [router, setEmail],
  );

  return {
    handleNavigateTo,
    handleRefreshEmails,
    handleSyncToUI,
    handleComposeEmail,
    handleForwardEmail,
  };
}
