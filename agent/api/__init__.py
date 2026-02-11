from fastapi import APIRouter

from .auth.callback import router as callback_router
from .auth.google_login import router as google_login_router
from .auth.status import router as status_router
from .emails.get_email import router as get_email_router
from .emails.list import router as list_emails_router
from .emails.search import router as search_emails_router
from .emails.stream import router as stream_emails_router

router = APIRouter()

router.include_router(google_login_router)
router.include_router(callback_router)
router.include_router(status_router)
router.include_router(list_emails_router)
router.include_router(search_emails_router)
router.include_router(stream_emails_router)
router.include_router(get_email_router)
