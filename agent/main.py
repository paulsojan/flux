from __future__ import annotations

import logging
import os

import uvicorn
from ag_ui_adk import add_adk_fastapi_endpoint
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from googleapiclient.errors import HttpError

from agent import adk_email_agent
from api import router

load_dotenv()


logger = logging.getLogger(__name__)

app = FastAPI(title="AI Mail Agent")
app.include_router(router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(HttpError)
async def google_api_error_handler(exc: HttpError):
    status = exc.resp.status
    detail = exc._get_reason() or str(exc)
    logger.error("Gmail API error [%s]: %s", status, detail)
    if status == 404:
        return JSONResponse(status_code=404, content={"error": "Resource not found"})
    return JSONResponse(status_code=status, content={"error": detail})


@app.exception_handler(Exception)
async def generic_error_handler(request: Request):
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"error": "Internal server error"})


add_adk_fastapi_endpoint(app, adk_email_agent, path="/")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
