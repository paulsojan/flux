"use client";

import { AgentState, EmailDetail } from "@/lib/types";
import { Sidebar } from "@/components/Sidebar";
import { EmailList } from "@/components/EmailList";
import { EmailDetailView } from "@/components/EmailDetail";
import { ComposeEmail } from "@/components/ComposeEmail";
import { AuthGate } from "@/components/AuthGate";
import { useCoAgent } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { useCallback, useEffect, useRef, useState } from "react";

const API_BASE = "http://localhost:8000";

export default function EmailClientPage() {
  return (
    <main className="h-screen">
      <CopilotSidebar
        disableSystemMessage={true}
        clickOutsideToClose={false}
        defaultOpen={true}
        labels={{
          title: "Email Assistant",
          initial:
            "Hi! I can help you manage your emails. Try asking me to check your inbox, search for emails, or compose a message.",
        }}
        suggestions={[
          { title: "Check Inbox", message: "Show me my latest emails." },
          { title: "Search", message: "Search for emails from my manager." },
          {
            title: "Compose",
            message: "Help me write an email to schedule a meeting.",
          },
          { title: "Summarize", message: "Summarize my unread emails." },
        ]}
      >
        <EmailClientContent />
      </CopilotSidebar>
    </main>
  );
}

function EmailClientContent() {
  const { state, setState } = useCoAgent<AgentState>({
    name: "my_agent",
    initialState: {
      emails: [],
      sent_emails: [],
      current_email: null,
      current_view: "inbox",
      is_authenticated: false,
      auth_url: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const lastView = useRef(state.current_view);

  // Poll for auth status until authenticated
  useEffect(() => {
    if (state.is_authenticated) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/status`);
        const data = await res.json();
        if (data.authenticated) {
          setState((prev) => ({
            ...prev,
            is_authenticated: true,
            auth_url: "",
          }));
        }
      } catch {
        // backend not ready yet
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [state.is_authenticated, setState]);

  // Auto-load emails when authenticated or when switching views
  useEffect(() => {
    if (!state.is_authenticated) return;

    const view = state.current_view;
    if (view === "detail" || view === "compose") return;

    // Only fetch when the view actually changes or on first auth
    if (
      lastView.current === view &&
      state.emails.length > 0 &&
      view === "inbox"
    )
      return;
    if (
      lastView.current === view &&
      state.sent_emails.length > 0 &&
      view === "sent"
    )
      return;

    lastView.current = view;
    const label = view === "sent" ? "SENT" : "INBOX";
    setLoading(true);
    fetch(`${API_BASE}/api/emails?label=${label}&max_results=20`)
      .then((res) => res.json())
      .then((data) => {
        if (data.emails) {
          if (view === "sent") {
            setState((prev) => ({ ...prev, sent_emails: data.emails }));
          } else {
            setState((prev) => ({ ...prev, emails: data.emails }));
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [state.is_authenticated, state.current_view, setState]);

  const handleNavigate = useCallback(
    (view: "inbox" | "sent" | "compose") => {
      setState((prev) => ({
        ...prev,
        current_view: view,
        current_email: null,
      }));
    },
    [setState],
  );

  const handleSelectEmail = useCallback(
    async (emailId: string) => {
      setState((prev) => ({
        ...prev,
        current_view: "detail",
        current_email: {
          id: emailId,
          from: "",
          to: "",
          subject: "Loading...",
          date: "",
          body: "",
        } as EmailDetail,
      }));
      try {
        const res = await fetch(`${API_BASE}/api/emails/${emailId}`);
        const data = await res.json();
        if (!data.error) {
          setState((prev) => ({ ...prev, current_email: data }));
        }
      } catch {
        // fallback - email stays as "Loading..."
      }
    },
    [setState],
  );

  const handleSend = useCallback(
    async (to: string, subject: string, body: string) => {
      const res = await fetch(`${API_BASE}/api/emails/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, body }),
      });
      const data = await res.json();
      if (data.error) {
        alert(`Failed to send: ${data.error}`);
        return;
      }
      setState((prev) => ({ ...prev, current_view: "sent", sent_emails: [] }));
    },
    [setState],
  );

  if (!state.is_authenticated) {
    return (
      <div className="h-screen flex">
        <Sidebar currentView={state.current_view} onNavigate={handleNavigate} />
        <AuthGate />
      </div>
    );
  }

  return (
    <div className="h-screen flex">
      <Sidebar currentView={state.current_view} onNavigate={handleNavigate} />
      {state.current_view === "inbox" && (
        <EmailList
          emails={state.emails}
          title="Inbox"
          onSelectEmail={handleSelectEmail}
          loading={loading}
        />
      )}
      {state.current_view === "sent" && (
        <EmailList
          emails={state.sent_emails}
          title="Sent"
          onSelectEmail={handleSelectEmail}
          loading={loading}
        />
      )}
      {state.current_view === "detail" && state.current_email && (
        <EmailDetailView
          email={state.current_email}
          onBack={() => handleNavigate("inbox")}
        />
      )}
      {state.current_view === "compose" && (
        <ComposeEmail
          onSend={handleSend}
          onCancel={() => handleNavigate("inbox")}
        />
      )}
    </div>
  );
}
