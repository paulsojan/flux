from __future__ import annotations

from ag_ui_adk import ADKAgent
from google.adk.agents import LlmAgent
from google.adk.agents.callback_context import CallbackContext
from google.adk.models.llm_request import LlmRequest
from google.adk.models.llm_response import LlmResponse

from tools.list_inbox import list_inbox
from tools.list_sent import list_sent
from tools.read_email import read_email
from tools.reply_email import reply_email
from tools.search_emails import search_emails


def inject_ui_state(
    callback_context: CallbackContext, llm_request: LlmRequest
) -> LlmResponse | None:
    """Inject current UI state (current_email + current_view) into system context."""

    state = callback_context.state or {}

    current_email = state.get("current_email")
    current_view = state.get("current_view")

    context_parts = []

    if current_view:
        context_parts.append(f"\n\n--- CURRENT VIEW ---\nView: {current_view}\n")

    if current_email:
        context_parts.append(
            f"\n\n--- CURRENTLY OPEN EMAIL ---\n"
            f"ID: {current_email.get('id', 'N/A')}\n"
            f"From: {current_email.get('from', 'N/A')}\n"
            f"To: {current_email.get('to', 'N/A')}\n"
            f"Subject: {current_email.get('subject', 'N/A')}\n"
            f"Date: {current_email.get('date', 'N/A')}\n"
            f"Body:\n{current_email.get('body', '(empty)')}\n"
        )

    if context_parts:
        existing = llm_request.config.system_instruction or ""
        llm_request.config.system_instruction = existing + "".join(context_parts)

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
        7. Forward the currently open email using forward_email (opens the compose form pre-filled with "Fwd:" subject and quoted original body so the user can add a recipient and review before sending)
        8. Sync data to UI using sync_emails_to_ui (updates the displayed email list or detail)
        9. Should know about the current view.

        RULES:
        - If the user is not authenticated, tell them to click "Sign in with Google" first.
        - When the user is viewing an email, its full content (from, to, subject, date, body) is provided to you automatically in the system context under "CURRENTLY OPEN EMAIL". Use this to answer any questions about the email (summarize, who sent it, who it's to, what it says, etc.) WITHOUT calling read_email again.
        - When listing emails, provide a concise summary of the results.
        - When the user wants to read an email, use read_email with the email ID.
        - When the user wants to send a new email, ALWAYS use compose_email to open the compose form with pre-filled data. Never send emails directly without showing the compose UI first. This lets the user review and edit before sending.
        - When the user asks to reply to an email, use the current_email from state to identify which email to reply to. Do not ask for the email ID.
        - When the user asks to forward an email, use forward_email to open the compose form with the forwarded content pre-filled. If the user specifies a recipient, pass it as the "to" parameter. If the user provides an additional message, pass it as the "body" parameter.
        - For search, use Gmail search syntax (from:, to:, subject:, is:unread, has:attachment, etc.)
        - Be concise but include key information when summarizing.
        - Match the user's tone when drafting emails; default to professional.
        - Only call sync_emails_to_ui after search_emails (filtering). Use target "inbox" when searching inbox, or "sent" when searching sent. Always pass the same search query string you used with search_emails as the "query" parameter.
        - After calling read_email, use navigate_to to show the email detail view.
    """,
    tools=[
        list_inbox,
        list_sent,
        read_email,
        reply_email,
        search_emails,
    ],
    before_model_callback=inject_ui_state,
)

adk_email_agent = ADKAgent(
    adk_agent=email_agent,
    user_id="demo_user",
    session_timeout_seconds=3600,
    use_in_memory_services=True,
)
