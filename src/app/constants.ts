export const API_BASE = "http://localhost:8000/";

export const SIDEBAR_CONFIG = {
  disableSystemMessage: true,
  clickOutsideToClose: false,
  defaultOpen: true,
  labels: {
    title: "Email Assistant",
    initial:
      "Hi! I can help you manage your emails. Try asking me to check your inbox, search for emails, or compose a message.",
  },
  suggestions: [
    { title: "Check Inbox", message: "Show me my latest emails." },
    { title: "Search", message: "Search for emails from my manager." },
    {
      title: "Compose",
      message: "Help me write an email to schedule a meeting.",
    },
    { title: "Summarize", message: "Summarize my unread emails." },
  ],
};
