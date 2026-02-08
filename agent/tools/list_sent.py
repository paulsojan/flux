
from google.adk.tools import ToolContext

from gmail_service import GmailService


def list_sent(tool_context: ToolContext, max_results: int = 20) -> dict:
    """List sent emails. Returns sent email summaries."""

    gmail = GmailService.get_instance()
    if not gmail.is_authenticated:
        return {"status": "error", "message": "Not authenticated."}

    emails = gmail.list_messages(label="SENT", max_results=max_results)
    tool_context.state["sent_emails"] = emails
    tool_context.state["current_view"] = "sent"
    return {"status": "success", "count": len(emails), "emails": emails}
