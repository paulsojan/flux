from google.adk.tools import ToolContext

from gmail_service import GmailService


def search_emails(
    tool_context: ToolContext, query: str, max_results: int = 10, label: str = "INBOX"
) -> dict:
    """Search emails using Gmail search syntax (from:, subject:, is:unread, has:attachment, etc.)."""

    gmail = GmailService.get_instance()
    if not gmail.is_authenticated:
        return {"status": "error", "message": "Not authenticated."}

    emails = gmail.search_messages(query=query, max_results=max_results, label=label)

    if label == "SENT":
        tool_context.state["sent_emails"] = emails
        tool_context.state["current_view"] = "sent"
    else:
        tool_context.state["emails"] = emails
        tool_context.state["current_view"] = "inbox"

    return {"status": "success", "count": len(emails), "query": query, "emails": emails}
