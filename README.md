# Flux

Flux is an intelligent context aware email agent that allows you to manage your inbox using natural language.

Demo: https://drive.google.com/file/d/1uz_hw33jHji-6-pjzixXsAKPgKpiRGse/view?usp=sharing

## Architecture

The app consists of two services: a **Next.js frontend** (`src/`) on `localhost:3000` and a **FastAPI backend** (`agent/`) on `localhost:8000`.

### Google ADK (Agent Development Kit)

The backend AI agent is built with [Google ADK](https://google.github.io/adk-docs/). ADK provides a structured framework for defining tools, managing tool-calling workflows, and handling the full LLM execution lifecycle. The agent is configured with tools such as: `list_inbox`, `list_sent`, `read_email`, `reply_email`, `search_emails`. Each of these tools internally interacts with the Gmail service.

Also, ADK callbacks are used, that runs before every LLM invocation. It reads the current UI state from the tool context and appends it to the system prompt. This ensures the model has awareness of the active view, selected email, and other relevant UI state.

### CopilotKit

[CopilotKit](https://copilotkit.ai/) provides the orchestration layer between the React frontend and the ADK agent. It provides the chat UI components, runtime bridge that connects to the backend agent.

I have also used CopilotKit **frontend tools**, allowing the ADK agent to trigger client-side actions. I have used frontend tools to trigger frontend actions such as navigating to a page, pre-filling a compose form, or syncing search results into the UI.

Because the current UI state is injected into the agent’s system, the agent can coordinate both backend Gmail operations and frontend UI updates in a single conversational flow.

### Request flow

When the user types a message in the chat sidebar:

1. The user sends a message via a CopilotKit React component.
2. CopilotKit forwards the request to the Next.js API route, which is send it to the FastAPI backend via AG-UI.
3. ADK's `inject_ui_state` callback appends the current UI context to the system prompt.
4. Gemini receives the prompt along with the available backend and frontend tool definitions.
5. The model either responds directly or invokes tools. If a backend tool is called, ADK executes it on the server. If a frontend tool is called, ADK does not execute it instead, it returns the tool call as structured output. CopilotKit receives this tool call in the browser and executes.
6. Finally, the model’s response along with any tool call events, streams back through AG-UI and CopilotKit to the chat sidebar.

### GmailService

On the backend, `GmailService` wraps the Gmail API. It handles:

- OAuth

- Email listing

- Reading messages

- Sending and replying

- Searching emails

Real-time updates are handled via Server-Sent Events. The backend polls Gmail history every 10 seconds and pushes events when new or deleted emails are detected, which the frontend uses to invalidate its React Query cache and refresh the UI.

## Trade-offs

The current architecture stores OAuth tokens in memory on the backend, so only one Gmail account can be connected at a time. Supporting multiple accounts would require a persistent database to store per-user tokens to route requests to the correct credentials. Since I focused on the core architecture, this can be implemented later.

## Prerequisites

- **Node.js** >= 22
- **Python** >= 3.12
- **[uv](https://docs.astral.sh/uv/)** — Python package manager (used for the agent)

## Local Setup

### 1. Clone the repository

### 2. Configure environment variables

Create a `.env` file in the project root with your Google Cloud credentials:

```env
GOOGLE_API_KEY="your-google-api-key"
GMAIL_CLIENT_ID="your-oauth-client-id"
GMAIL_CLIENT_SECRET="your-oauth-client-secret"
GMAIL_REDIRECT_URI="http://localhost:8000/auth/callback"
```

> Your OAuth client must have `http://localhost:8000/auth/callback` as an authorized redirect URI and `http://localhost:3000` as an authorized JavaScript origin.

### 3. Install dependencies

```bash
yarn install
```

This installs both the Node.js dependencies and the Python agent dependencies (via the `postinstall` script which runs `uv sync` in the `agent/` directory).

### 4. Start the development servers

```bash
yarn dev
```

This starts both services concurrently:

[http://localhost:3000](http://localhost:3000)

### 5. Authenticate with Gmail

Open [http://localhost:3000](http://localhost:3000) and click "Sign in with Google" to authorize the app to access your Gmail account.

## To run tests

```bash
uv run pytest
```

## Improvements

- Implement email threading/grouping
- No attachment support
- No CC/BCC fields in compose
- No draft saving
- No delete, archive, or spam actions on emails
