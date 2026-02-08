from fastapi import APIRouter

from gmail_service import GmailService

router = APIRouter()


@router.get("/auth/status")
async def auth_status():
    gmail = GmailService.get_instance()

    return {"authenticated": gmail.is_authenticated}
