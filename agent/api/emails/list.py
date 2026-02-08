from fastapi import APIRouter
from gmail_service import GmailService

router = APIRouter()


@router.get("/api/emails")
async def api_list_emails(label: str = "INBOX", max_results: int = 20):
    gmail = GmailService.get_instance()

    if not gmail.is_authenticated:
        return {"error": "Not authenticated", "emails": []}

    emails = gmail.list_messages(label=label, max_results=max_results)
    return {"emails": emails}
