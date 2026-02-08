
from google.adk.tools import ToolContext

from gmail_service import GmailService


def send_email(tool_context: ToolContext, to: str, subject: str, body: str) -> dict:
    """Send an email. Requires recipient address, subject, and body text."""

    gmail = GmailService.get_instance()
    if not gmail.is_authenticated:
        return {"status": "error", "message": "Not authenticated."}

    result = gmail.send_message(to=to, subject=subject, body=body)
    if "error" in result:
        return {"status": "error", "message": result["error"]}
    return {"status": "success", "message": f"Email sent to {to}", "id": result["id"]}
