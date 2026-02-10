from google.adk.tools import ToolContext

from gmail_service import GmailService


def list_inbox(tool_context: ToolContext, max_results: int = 20) -> dict:
    """List emails in the inbox. Returns email summaries with id, from, subject, date, snippet."""

    gmail = GmailService.get_instance()
    if not gmail.is_authenticated:
        return {
            "status": "error",
            "message": "Not authenticated. User must sign in first.",
        }
    result = gmail.list_messages(label="INBOX", max_results=max_results)
    tool_context.state["emails"] = result["messages"]
    tool_context.state["next_page_token"] = result.get("nextPageToken")
    tool_context.state["current_view"] = "inbox"
    return {
        "status": "success",
        "count": len(result["messages"]),
        "emails": result["messages"],
    }
