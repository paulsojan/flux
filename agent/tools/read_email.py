
from google.adk.tools import ToolContext

from gmail_service import GmailService


def read_email(tool_context: ToolContext, email_id: str) -> dict:
    """Read the full content of an email by its ID."""

    gmail = GmailService.get_instance()
    if not gmail.is_authenticated:
        return {"status": "error", "message": "Not authenticated."}

    email = gmail.get_message(email_id)
    if "error" in email:
        return {"status": "error", "message": email["error"]}
    tool_context.state["current_email"] = email
    tool_context.state["current_view"] = "detail"

    return {"status": "success", "email": email}
