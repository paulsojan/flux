import base64
import json
import os
from email.mime.text import MIMEText
from typing import Optional

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build

SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
]

TOKEN_PATH = "gmail_token.json"


def client_config() -> dict:
    return {
        "web": {
            "client_id": os.environ["GMAIL_CLIENT_ID"],
            "client_secret": os.environ["GMAIL_CLIENT_SECRET"],
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [os.environ["GMAIL_REDIRECT_URI"]],
        }
    }


class GmailService:
    _instance: Optional["GmailService"] = None

    def __init__(self):
        self.creds = self._load_token()
        self.service = self._build_service()

    @classmethod
    def get_instance(cls) -> "GmailService":
        if not cls._instance:
            cls._instance = cls()
        return cls._instance

    @property
    def is_authenticated(self) -> bool:
        return bool(self.creds and self.creds.valid)

    def get_auth_url(self) -> str:
        flow = Flow.from_client_config(client_config(), SCOPES)
        flow.redirect_uri = os.environ["GMAIL_REDIRECT_URI"]

        url, _ = flow.authorization_url(
            access_type="offline",
            prompt="consent",
        )
        return url

    def handle_callback(self, code: str) -> None:
        flow = Flow.from_client_config(client_config(), SCOPES)
        flow.redirect_uri = os.environ["GMAIL_REDIRECT_URI"]
        flow.fetch_token(code=code)

        self.creds = flow.credentials
        self._save_token(self.creds)
        self.service = self._build_service()

    def list_messages(
        self,
        label: str = "INBOX",
        query: str = "",
        max_results: int = 20,
        page_token: str | None = None,
    ) -> dict:
        self._require_auth()

        res = (
            self.service.users()
            .messages()
            .list(
                userId="me",
                labelIds=[label] if label else None,
                q=query or None,
                maxResults=max_results,
                pageToken=page_token,
            )
            .execute()
        )

        return {
            "messages": [
                self._get_message_metadata(m["id"]) for m in res.get("messages", [])
            ],
            "nextPageToken": res.get("nextPageToken"),
        }

    def get_message(self, message_id: str) -> dict:
        self._require_auth()

        msg = (
            self.service.users()
            .messages()
            .get(userId="me", id=message_id, format="full")
            .execute()
        )

        headers = self._headers_dict(msg)

        return {
            "id": msg["id"],
            "threadId": msg.get("threadId"),
            "messageId": headers.get("message-id", ""),
            "from": headers.get("from", ""),
            "to": headers.get("to", ""),
            "subject": headers.get("subject", "(no subject)"),
            "date": headers.get("date", ""),
            "body": self._extract_body(msg["payload"]),
            "labelIds": msg.get("labelIds", []),
        }

    def send_message(self, to: str, subject: str, body: str) -> dict:
        self._require_auth()

        msg = MIMEText(body)
        msg["to"] = to
        msg["subject"] = subject

        raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
        sent = (
            self.service.users()
            .messages()
            .send(userId="me", body={"raw": raw})
            .execute()
        )

        return {"id": sent["id"]}

    def reply_message(self, message_id: str, body: str) -> dict:
        self._require_auth()

        original = self.get_message(message_id)
        thread_id = original.get("threadId")
        original_message_id = original.get("messageId", "")
        label_ids = original.get("labelIds", [])
        if "SENT" in label_ids:
            recipient = original.get("to", "")
        else:
            recipient = original.get("from", "")
        subject = original.get("subject", "")

        if not subject.lower().startswith("re:"):
            subject = f"Re: {subject}"

        msg = MIMEText(body)
        msg["to"] = recipient
        msg["subject"] = subject
        if original_message_id:
            msg["In-Reply-To"] = original_message_id
            msg["References"] = original_message_id

        raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
        send_body: dict = {"raw": raw}
        if thread_id:
            send_body["threadId"] = thread_id

        sent = (
            self.service.users().messages().send(userId="me", body=send_body).execute()
        )

        return {"id": sent["id"]}

    def search_messages(
        self, query: str, max_results: int = 20, label: str = "INBOX"
    ) -> dict:
        return self.list_messages(query=query, max_results=max_results, label=label)

    def get_profile(self) -> dict:
        self._require_auth()
        return self.service.users().getProfile(userId="me").execute()

    def list_history(
        self, start_history_id: str, history_types: list[str] | None = None
    ) -> dict:
        self._require_auth()
        kwargs: dict = {"userId": "me", "startHistoryId": start_history_id}
        if history_types:
            kwargs["historyTypes"] = history_types
        return self.service.users().history().list(**kwargs).execute()

    def _build_service(self):
        if not self.creds:
            return None

        if self.creds.expired and self.creds.refresh_token:
            self.creds.refresh(Request())
            self._save_token(self.creds)

        return build("gmail", "v1", credentials=self.creds)

    def _require_auth(self):
        if not self.service:
            raise RuntimeError("Gmail not authenticated")

    def _save_token(self, creds: Credentials):
        with open(TOKEN_PATH, "w") as f:
            f.write(creds.to_json())

    def _load_token(self) -> Credentials | None:
        if not os.path.exists(TOKEN_PATH):
            return None

        with open(TOKEN_PATH) as f:
            return Credentials.from_authorized_user_info(json.load(f), SCOPES)

    def _headers_dict(self, msg: dict) -> dict[str, str]:
        return {
            h["name"].lower(): h["value"]
            for h in msg.get("payload", {}).get("headers", [])
        }

    def _get_message_metadata(self, msg_id: str) -> dict:
        msg = (
            self.service.users()
            .messages()
            .get(
                userId="me",
                id=msg_id,
                format="metadata",
                metadataHeaders=["From", "To", "Subject", "Date"],
            )
            .execute()
        )

        headers = self._headers_dict(msg)

        return {
            "id": msg_id,
            "threadId": msg.get("threadId"),
            "from": headers.get("from", ""),
            "to": headers.get("to", ""),
            "subject": headers.get("subject", "(no subject)"),
            "date": headers.get("date", ""),
            "snippet": msg.get("snippet", ""),
        }

    def _extract_body(self, payload: dict) -> str:
        def decode(data: str) -> str:
            return base64.urlsafe_b64decode(data).decode("utf-8", errors="replace")

        if data := payload.get("body", {}).get("data"):
            if payload.get("mimeType", "") in ("text/plain", "text/html"):
                return decode(data)

        html, plain = "", ""
        for part in payload.get("parts", []):
            if part.get("mimeType", "").startswith("multipart/"):
                if body := self._extract_body(part):
                    return body
            elif part.get("mimeType") == "text/html" and part.get("body", {}).get(
                "data"
            ):
                html = decode(part["body"]["data"])
            elif part.get("mimeType") == "text/plain" and part.get("body", {}).get(
                "data"
            ):
                plain = decode(part["body"]["data"])

        return html or plain
