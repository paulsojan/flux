"use client";

import { AgentState } from "@/lib/types";
import { Sidebar } from "@/components/Sidebar";
import { AuthGate } from "@/components/AuthGate";
import { useCoAgent, useFrontendTool } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { useFetchAuthStatusApi } from "@/hooks/tanstack/useAuthApi";
import { SIDEBAR_CONFIG } from "@/app/constants";
import { useAgentSync } from "@/hooks/useAgentSync";
import { useEmailStream } from "@/hooks/useEmailStream";

export default function EmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data, isLoading } = useFetchAuthStatusApi();
  const authenticated = data?.authenticated ?? false;

  const { state } = useCoAgent<AgentState>({
    name: "my_agent",
    initialState: {
      emails: [],
      sent_emails: [],
      current_email: null,
      current_view: "inbox",
    },
  });

  const { handleNavigateTo, handleRefreshEmails } = useAgentSync(state);

  useEmailStream();

  useFrontendTool({
    name: "navigate_to",
    description:
      "Navigate the user to a specific view: inbox, sent, or compose",
    parameters: [
      {
        name: "view",
        type: "string",
        description: "The view to navigate to: 'inbox', 'sent', or 'compose'",
        required: true,
      },
    ],
    handler: handleNavigateTo,
  });

  useFrontendTool({
    name: "refresh_emails",
    description: "Refresh the email list by re-fetching from the server",
    parameters: [
      {
        name: "list",
        type: "string",
        description: "Which list to refresh: 'inbox' or 'sent'",
        required: true,
      },
    ],
    handler: handleRefreshEmails,
  });

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="h-screen flex">
        <Sidebar />
        <AuthGate />
      </div>
    );
  }

  return (
    <CopilotSidebar {...SIDEBAR_CONFIG}>
      <div className="h-screen flex">
        <Sidebar />
        {children}
      </div>
    </CopilotSidebar>
  );
}
