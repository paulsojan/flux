from fastapi import APIRouter

from gmail_service import GmailService

router = APIRouter()


@router.get("/api/emails")
async def api_list_emails(
    label: str = "INBOX",
    max_results: int = 20,
    page_token: str | None = None,
    query: str = "",
):
    gmail = GmailService.get_instance()

    if not gmail.is_authenticated:
        return {"error": "Not authenticated", "emails": [], "nextPageToken": None}

    result = gmail.list_messages(
        label=label, max_results=max_results, page_token=page_token
    )
    return {
        "emails": result["messages"],
        "nextPageToken": result["nextPageToken"],
    }
