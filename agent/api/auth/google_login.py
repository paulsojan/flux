from fastapi import APIRouter
from gmail_service import GmailService
from fastapi.responses import RedirectResponse

router = APIRouter()


@router.get("/auth/login")
async def auth_login():
    gmail = GmailService.get_instance()
    auth_url = gmail.get_auth_url()
    return RedirectResponse(url=auth_url)
