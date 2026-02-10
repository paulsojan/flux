from google.adk.tools import ToolContext

from gmail_service import GmailService


def list_sent(tool_context: ToolContext, max_results: int = 20) -> dict:
    """List sent emails. Returns sent email summaries."""

    gmail = GmailService.get_instance()
    if not gmail.is_authenticated:
        return {"status": "error", "message": "Not authenticated."}

    result = gmail.list_messages(label="SENT", max_results=max_results)
    tool_context.state["sent_emails"] = result["messages"]
    tool_context.state["next_page_token"] = result.get("nextPageToken")
    tool_context.state["current_view"] = "sent"
    return {
        "status": "success",
        "count": len(result["messages"]),
        "emails": result["messages"],
    }
