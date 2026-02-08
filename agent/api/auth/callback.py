from fastapi import APIRouter, Request
from gmail_service import GmailService
from fastapi.responses import HTMLResponse

router = APIRouter()


@router.get("/auth/callback")
async def auth_callback(request: Request):
    code = request.query_params.get("code")

    if not code:
        return HTMLResponse(
            "<h1>Error: No authorization code received</h1>", status_code=400
        )

    gmail = GmailService.get_instance()
    gmail.handle_callback(code)
    return HTMLResponse(
        "<html><body><h1>Authentication successful!</h1>"
        "<p>You can close this window and return to the app.</p>"
        "<script>window.close();</script></body></html>"
    )
