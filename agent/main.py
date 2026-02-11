from __future__ import annotations

import os

import uvicorn
from ag_ui_adk import ADKAgent, add_adk_fastapi_endpoint
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from google.adk.agents import LlmAgent
from google.adk.agents.callback_context import CallbackContext
from google.adk.models.llm_request import LlmRequest
from google.adk.models.llm_response import LlmResponse

from api import router
from tools.list_inbox import list_inbox
from tools.list_sent import list_sent
from tools.read_email import read_email
from tools.reply_email import reply_email
from tools.search_emails import search_emails

load_dotenv()


def inject_current_email(
    callback_context: CallbackContext, llm_request: LlmRequest
) -> LlmResponse | None:
    """Inject the currently open email into the LLM context so it can answer
    questions about it (summarize, from/to, etc.) without needing a tool call."""
    current_email = callback_context.state.get("current_email")
    if current_email:
        email_context = (
            f"\n\n--- CURRENTLY OPEN EMAIL ---\n"
            f"ID: {current_email.get('id', 'N/A')}\n"
            f"From: {current_email.get('from', 'N/A')}\n"
            f"To: {current_email.get('to', 'N/A')}\n"
            f"Subject: {current_email.get('subject', 'N/A')}\n"
            f"Date: {current_email.get('date', 'N/A')}\n"
            f"Body:\n{current_email.get('body', '(empty)')}\n"
        )
        existing = llm_request.config.system_instruction or ""
        llm_request.config.system_instruction = existing + email_context
    return None


email_agent = LlmAgent(
    name="EmailAgent",
    model="gemini-2.5-flash",
    instruction="""
        You are a helpful Gmail assistant. You help users manage their email.

        CAPABILITIES:
        1. List inbox emails using list_inbox
        2. List sent emails using list_sent
        3. Read a specific email using read_email (requires the email ID)
        4. Compose/send emails using compose_email (opens the compose form pre-filled with to, subject, body so the user can review and send from the UI)
        5. Search emails using search_emails (supports Gmail search syntax)
        6. Reply to the currently open email using reply_email (only requires the reply body text)
        7. Sync data to UI using sync_emails_to_ui (updates the displayed email list or detail)

        RULES:
        - If the user is not authenticated, tell them to click "Sign in with Google" first.
        - When the user is viewing an email, its full content (from, to, subject, date, body) is provided to you automatically in the system context under "CURRENTLY OPEN EMAIL". Use this to answer any questions about the email (summarize, who sent it, who it's to, what it says, etc.) WITHOUT calling read_email again.
        - When listing emails, provide a concise summary of the results.
        - When the user wants to read an email, use read_email with the email ID.
        - When the user wants to send a new email, ALWAYS use compose_email to open the compose form with pre-filled data. Never send emails directly without showing the compose UI first. This lets the user review and edit before sending.
        - When the user asks to reply to an email, use the current_email from state to identify which email to reply to. Do not ask for the email ID.
        - For search, use Gmail search syntax (from:, to:, subject:, is:unread, has:attachment, etc.)
        - Be concise but include key information when summarizing.
        - Match the user's tone when drafting emails; default to professional.
        - Only call sync_emails_to_ui after search_emails (filtering). Use target "inbox" when searching inbox, or "sent" when searching sent. Always pass the same search query string you used with search_emails as the "query" parameter.
        - After calling read_email, use navigate_to to show the email detail view.
    """,
    tools=[list_inbox, list_sent, read_email, reply_email, search_emails],
    before_model_callback=inject_current_email,
)

adk_email_agent = ADKAgent(
    adk_agent=email_agent,
    user_id="demo_user",
    session_timeout_seconds=3600,
    use_in_memory_services=True,
)

app = FastAPI(title="AI Mail Agent")
app.include_router(router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

add_adk_fastapi_endpoint(app, adk_email_agent, path="/")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
