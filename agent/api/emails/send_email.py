from fastapi import APIRouter, HTTPException, Request

from gmail_service import GmailService

router = APIRouter()


@router.post("/api/emails/send")
async def api_send_email(request: Request):
    gmail = GmailService.get_instance()

    if not gmail.is_authenticated:
        raise HTTPException(status_code=401, detail="Not authenticated")

    body = await request.json()
    return gmail.send_message(
        to=body.get("to", ""),
        subject=body.get("subject", ""),
        body=body.get("body", ""),
    )
