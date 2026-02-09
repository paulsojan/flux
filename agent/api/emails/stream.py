import asyncio
import json
import logging

from fastapi import APIRouter
from starlette.responses import StreamingResponse

from gmail_service import GmailService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/api/emails/stream")
async def email_stream():
    async def event_generator():
        gmail = GmailService.get_instance()

        if not gmail.is_authenticated:
            yield f"data: {json.dumps({'type': 'error', 'message': 'Not authenticated'})}\n\n"
            return

        profile = gmail.get_profile()
        last_history_id = profile.get("historyId")

        while True:
            await asyncio.sleep(10)
            try:
                history = gmail.list_history(
                    last_history_id,
                    history_types=["messageAdded", "messageDeleted", "labelAdded"],
                )
                new_history_id = history.get("historyId")
                if history.get("history"):
                    last_history_id = new_history_id
                    for entry in history["history"]:
                        if "messagesAdded" in entry:
                            yield f"data: {json.dumps({'type': 'new_emails'})}\n\n"
                        if "labelsAdded" in entry:
                            yield f"data: {json.dumps({'type': 'deleted_emails'})}\n\n"

                else:
                    last_history_id = new_history_id
            except Exception:
                logger.exception("Error checking Gmail history")

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
