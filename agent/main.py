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

from api import router
from gmail_service import GmailService
from tools.list_inbox import list_inbox
from tools.list_sent import list_sent
from tools.read_email import read_email
from tools.search_emails import search_emails
from tools.send_email import send_email

load_dotenv()


def on_before_agent(callback_context: CallbackContext):
    gmail = GmailService.get_instance()
    state = callback_context.state

    state.setdefault("emails", [])
    state.setdefault("sent_emails", [])
    state.setdefault("current_email", None)
    state.setdefault("current_view", "inbox")

    state["is_authenticated"] = gmail.is_authenticated
    state["auth_url"] = (
        "" if gmail.is_authenticated else gmail.get_auth_url(silent_fail=True)
    )
    return None


def before_model_modifier(
    callback_context: CallbackContext, llm_request: LlmRequest
) -> LlmResponse | None:
    if callback_context.agent_name != "EmailAgent":
        return None

    state = callback_context.state
    context_summary = f"""
        Current state:
        - Authenticated: {state.get("is_authenticated", False)}
        - Current view: {state.get("current_view", "inbox")}
        - Emails loaded: {len(state.get("emails", []))}
    """

    original_instruction = llm_request.config.system_instruction
    if not isinstance(original_instruction, types.Content):
        original_instruction = types.Content(
            role="system", parts=[types.Part(text=str(original_instruction) or "")]
        )

    if original_instruction.parts:
        original_instruction.parts[0].text = context_summary + (
            original_instruction.parts[0].text or ""
        )
    llm_request.config.system_instruction = original_instruction
    return None


def simple_after_model_modifier(
    callback_context: CallbackContext, llm_response: LlmResponse
) -> LlmResponse | None:
    if callback_context.agent_name == "EmailAgent":
        content = llm_response.content
        if (
            content
            and content.parts
            and content.role == "model"
            and content.parts[0].text
        ):
            callback_context._invocation_context.end_invocation = True
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
    # Uncomment callbacks when ready
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
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
