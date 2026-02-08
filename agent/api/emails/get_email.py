from fastapi import APIRouter

from gmail_service import GmailService

router = APIRouter()


@router.get("/api/emails/{email_id}")
async def api_get_email(email_id: str):
    gmail = GmailService.get_instance()

    if not gmail.is_authenticated:
        return {"error": "Not authenticated"}

    return gmail.get_message(email_id)
