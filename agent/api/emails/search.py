from fastapi import APIRouter, HTTPException

from gmail_service import GmailService

router = APIRouter()


@router.get("/api/emails/search")
async def api_search_emails(q: str = "", max_results: int = 10):
    gmail = GmailService.get_instance()

    if not gmail.is_authenticated:
        raise HTTPException(status_code=401, detail="Not authenticated")

    emails = gmail.search_messages(query=q, max_results=max_results)
    return {"emails": emails}
