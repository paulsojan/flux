import { useFrontendTool } from "@copilotkit/react-core";
import { useAgentSync } from "./useAgentSync";

export function useAgentTools() {
  const {
    handleNavigateTo,
    handleRefreshEmails,
    handleSyncToUI,
    handleComposeEmail,
    handleForwardEmail,
  } = useAgentSync();

  useFrontendTool({
    name: "navigate_to",
    description:
      "Navigate to a view. For detail or sent_detail you MUST provide emailId.",
    parameters: [
      { name: "view", type: "string", required: true },
      { name: "emailId", type: "string", required: false },
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

  useFrontendTool({
    name: "sync_emails_to_ui",
    description:
      "Sync filtered/searched email data to the UI. Only call this after search_emails to update the displayed data with filtered results. Do NOT call this after list_inbox, list_sent, or read_email. You MUST pass the same search query you used with search_emails.",
    parameters: [
      {
        name: "target",
        type: "string",
        description:
          "What to sync: 'inbox' (after search_emails for inbox), 'sent' (after search_emails for sent), or 'email_detail' (after read_email)",
        required: true,
      },
      {
        name: "query",
        type: "string",
        description:
          "The Gmail search query used with search_emails (e.g. 'from:john subject:meeting'). Required for inbox/sent targets.",
        required: true,
      },
    ],
    handler: handleSyncToUI,
  });

  useFrontendTool({
    name: "compose_email",
    description:
      "Open the compose form pre-filled with email details. Use this when the user wants to send or draft an email.",
    parameters: [
      {
        name: "to",
        type: "string",
        description: "Recipient email address",
        required: true,
      },
      {
        name: "subject",
        type: "string",
        description: "Email subject line",
        required: true,
      },
      {
        name: "body",
        type: "string",
        description: "Email body content",
        required: true,
      },
    ],
    handler: handleComposeEmail,
  });

  useFrontendTool({
    name: "forward_email",
    description:
      "Forward the currently open email. Opens the compose form pre-filled with 'Fwd:' subject and quoted original body so the user can review before sending.",
    parameters: [
      {
        name: "to",
        type: "string",
        description: "Recipient email address (optional if user hasn't specified one)",
        required: false,
      },
      {
        name: "body",
        type: "string",
        description: "Optional personal message to include above the forwarded content",
        required: false,
      },
    ],
    handler: handleForwardEmail,
  });
}
