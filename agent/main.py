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
from google.genai import types
from pydantic import BaseModel, Field

from api import router
from gmail_service import GmailService
from tools.list_inbox import list_inbox
from tools.list_sent import list_sent
from tools.read_email import read_email
from tools.search_emails import search_emails
from tools.send_email import send_email

load_dotenv()


# --- State Model ---
class EmailState(BaseModel):
    emails: list[dict] = Field(default_factory=list)
    sent_emails: list[dict] = Field(default_factory=list)
    current_email: dict | None = Field(default=None)
    current_view: str = Field(default="inbox")
    is_authenticated: bool = Field(default=False)
    auth_url: str = Field(default="")


# --- Callbacks ---
def on_before_agent(callback_context: CallbackContext):
    gmail = GmailService.get_instance()
    if "emails" not in callback_context.state:
        callback_context.state["emails"] = []
    if "sent_emails" not in callback_context.state:
        callback_context.state["sent_emails"] = []
    if "current_email" not in callback_context.state:
        callback_context.state["current_email"] = None
    if "current_view" not in callback_context.state:
        callback_context.state["current_view"] = "inbox"
    callback_context.state["is_authenticated"] = gmail.is_authenticated
    if not gmail.is_authenticated:
        try:
            callback_context.state["auth_url"] = gmail.get_auth_url()
        except Exception:
            callback_context.state["auth_url"] = ""
    else:
        callback_context.state["auth_url"] = ""
    return None


def before_model_modifier(
    callback_context: CallbackContext, llm_request: LlmRequest
) -> LlmResponse | None:
    agent_name = callback_context.agent_name
    if agent_name == "EmailAgent":
        is_auth = callback_context.state.get("is_authenticated", False)
        current_view = callback_context.state.get("current_view", "inbox")
        email_count = len(callback_context.state.get("emails", []))

        context = f"""
                Current state:
                - Authenticated: {is_auth}
                - Current view: {current_view}
                - Emails loaded: {email_count}
                """
        original_instruction = llm_request.config.system_instruction or types.Content(
            role="system", parts=[]
        )
        if not isinstance(original_instruction, types.Content):
            original_instruction = types.Content(
                role="system", parts=[types.Part(text=str(original_instruction))]
            )
        if not original_instruction.parts:
            original_instruction.parts = [types.Part(text="")]
        if original_instruction.parts and len(original_instruction.parts) > 0:
            modified_text = context + (original_instruction.parts[0].text or "")
            original_instruction.parts[0].text = modified_text
        llm_request.config.system_instruction = original_instruction
    return None


def simple_after_model_modifier(
    callback_context: CallbackContext, llm_response: LlmResponse
) -> LlmResponse | None:
    agent_name = callback_context.agent_name
    if agent_name == "EmailAgent":
        if llm_response.content and llm_response.content.parts:
            if (
                llm_response.content.role == "model"
                and llm_response.content.parts[0].text
            ):
                callback_context._invocation_context.end_invocation = True
    return None


email_agent = LlmAgent(
    name="EmailAgent",
    model="gemini-2.5-flash",
    instruction="""You are a helpful Gmail assistant. You help users manage their email.

    CAPABILITIES:
    1. List inbox emails using list_inbox
    2. List sent emails using list_sent
    3. Read a specific email using read_email (requires the email ID)
    4. Send emails using send_email (requires to, subject, body)
    5. Search emails using search_emails (supports Gmail search syntax)

    RULES:
    - If the user is not authenticated, tell them to click "Sign in with Google" first.
    - When listing emails, provide a concise summary of the results.
    - When the user wants to read an email, use read_email with the email ID.
    - Before sending, confirm the recipient, subject, and body with the user.
    - For search, use Gmail search syntax (from:, to:, subject:, is:unread, has:attachment, etc.)
    - Be concise but include key information when summarizing.
    - Match the user's tone when drafting emails; default to professional.
    """,
    tools=[list_inbox, list_sent, read_email, send_email, search_emails],
    # before_agent_callback=on_before_agent,
    # before_model_callback=before_model_modifier,
    # after_model_callback=simple_after_model_modifier,
)

adk_email_agent = ADKAgent(
    adk_agent=email_agent,
    user_id="demo_user",
    session_timeout_seconds=3600,
    use_in_memory_services=True,
)

app = FastAPI(title="ADK Gmail Agent")
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
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
