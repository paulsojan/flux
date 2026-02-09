from google.adk.tools import ToolContext

from gmail_service import GmailService


def reply_email(tool_context: ToolContext, body: str) -> dict:
    """Reply to the currently open email. Only requires the reply body text."""

    gmail = GmailService.get_instance()
    if not gmail.is_authenticated:
        return {"status": "error", "message": "Not authenticated."}

    current_email = tool_context.state.get("current_email")
    if not current_email:
        return {
            "status": "error",
            "message": "No email is currently open. Ask the user to open an email first.",
        }

    email_id = current_email.get("id")
    result = gmail.reply_message(message_id=email_id, body=body)
    if "error" in result:
        return {"status": "error", "message": result["error"]}

    return {
        "status": "success",
        "message": "Reply sent successfully",
        "id": result["id"],
    }
