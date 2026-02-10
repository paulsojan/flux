from google.adk.tools import ToolContext

from gmail_service import GmailService


def search_emails(
    tool_context: ToolContext, query: str, max_results: int = 10, label: str = "INBOX"
) -> dict:
    """Search emails using Gmail search syntax (from:, subject:, is:unread, has:attachment, etc.)."""

    gmail = GmailService.get_instance()
    if not gmail.is_authenticated:
        return {"status": "error", "message": "Not authenticated."}

    result = gmail.search_messages(query=query, max_results=max_results, label=label)

    if label == "SENT":
        tool_context.state["sent_emails"] = result["messages"]
        tool_context.state["current_view"] = "sent"
    else:
        tool_context.state["emails"] = result["messages"]
        tool_context.state["current_view"] = "inbox"

    tool_context.state["next_page_token"] = result.get("nextPageToken")

    return {
        "status": "success",
        "count": len(result["messages"]),
        "emails": result["messages"],
    }
