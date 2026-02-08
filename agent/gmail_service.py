import base64
import os
from email.mime.text import MIMEText
from typing import Optional

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build

SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
]


def _client_config() -> dict:
    return {
        "web": {
            "client_id": os.getenv("GMAIL_CLIENT_ID"),
            "client_secret": os.getenv("GMAIL_CLIENT_SECRET"),
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [
                os.getenv(
                    "GMAIL_REDIRECT_URI",
                )
            ],
        }
    }


class GmailService:
    _instance: Optional["GmailService"] = None

    def __init__(self):
        self.creds: Optional[Credentials] = None
        self.service = None

    @classmethod
    def get_instance(cls) -> "GmailService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    @property
    def is_authenticated(self) -> bool:
        return self.creds is not None and self.creds.valid

    def get_auth_url(self) -> str:
        flow = Flow.from_client_config(_client_config(), scopes=SCOPES)
        flow.redirect_uri = os.getenv("GMAIL_REDIRECT_URI")
        auth_url, _ = flow.authorization_url(
            access_type="offline",
            include_granted_scopes="true",
            prompt="consent",
        )
        return auth_url

    def handle_callback(self, code: str):
        flow = Flow.from_client_config(_client_config(), scopes=SCOPES)
        flow.redirect_uri = os.getenv("GMAIL_REDIRECT_URI")
        flow.fetch_token(code=code)
        self.creds = flow.credentials
        self.service = build("gmail", "v1", credentials=self.creds)

    def list_messages(
        self, label: str = "INBOX", max_results: int = 20, query: str = ""
    ) -> list[dict]:
        if not self.is_authenticated:
            return []
        results = (
            self.service.users()
            .messages()
            .list(userId="me", labelIds=[label], maxResults=max_results, q=query)
            .execute()
        )
        messages = results.get("messages", [])
        email_list = []
        for msg in messages:
            msg_data = (
                self.service.users()
                .messages()
                .get(
                    userId="me",
                    id=msg["id"],
                    format="metadata",
                    metadataHeaders=["From", "To", "Subject", "Date"],
                )
                .execute()
            )
            headers = {
                h["name"]: h["value"]
                for h in msg_data.get("payload", {}).get("headers", [])
            }
            email_list.append(
                {
                    "id": msg["id"],
                    "threadId": msg_data.get("threadId"),
                    "from": headers.get("From", ""),
                    "to": headers.get("To", ""),
                    "subject": headers.get("Subject", "(no subject)"),
                    "date": headers.get("Date", ""),
                    "snippet": msg_data.get("snippet", ""),
                }
            )
        return email_list

    def get_message(self, message_id: str) -> dict:
        if not self.is_authenticated:
            return {"error": "Not authenticated"}
        msg = (
            self.service.users()
            .messages()
            .get(userId="me", id=message_id, format="full")
            .execute()
        )
        headers = {
            h["name"]: h["value"] for h in msg.get("payload", {}).get("headers", [])
        }
        body = self._extract_body(msg.get("payload", {}))
        return {
            "id": msg["id"],
            "threadId": msg.get("threadId"),
            "from": headers.get("From", ""),
            "to": headers.get("To", ""),
            "subject": headers.get("Subject", "(no subject)"),
            "date": headers.get("Date", ""),
            "body": body,
            "labelIds": msg.get("labelIds", []),
        }

    def _extract_body(self, payload: dict) -> str:
        if payload.get("mimeType") == "text/plain" and payload.get("body", {}).get(
            "data"
        ):
            return base64.urlsafe_b64decode(payload["body"]["data"]).decode(
                "utf-8", errors="replace"
            )
        if payload.get("mimeType", "").startswith("multipart"):
            for part in payload.get("parts", []):
                text = self._extract_body(part)
                if text:
                    return text
        if payload.get("mimeType") == "text/html" and payload.get("body", {}).get(
            "data"
        ):
            return base64.urlsafe_b64decode(payload["body"]["data"]).decode(
                "utf-8", errors="replace"
            )
        return ""

    def send_message(self, to: str, subject: str, body: str) -> dict:
        if not self.is_authenticated:
            return {"error": "Not authenticated"}
        message = MIMEText(body)
        message["to"] = to
        message["subject"] = subject
        raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
        sent = (
            self.service.users()
            .messages()
            .send(userId="me", body={"raw": raw})
            .execute()
        )
        return {"id": sent["id"], "status": "sent"}

    def search_messages(self, query: str, max_results: int = 10) -> list[dict]:
        if not self.is_authenticated:
            return []
        results = (
            self.service.users()
            .messages()
            .list(userId="me", maxResults=max_results, q=query)
            .execute()
        )
        messages = results.get("messages", [])
        email_list = []
        for msg in messages:
            msg_data = (
                self.service.users()
                .messages()
                .get(
                    userId="me",
                    id=msg["id"],
                    format="metadata",
                    metadataHeaders=["From", "To", "Subject", "Date"],
                )
                .execute()
            )
            headers = {
                h["name"]: h["value"]
                for h in msg_data.get("payload", {}).get("headers", [])
            }
            email_list.append(
                {
                    "id": msg["id"],
                    "from": headers.get("From", ""),
                    "to": headers.get("To", ""),
                    "subject": headers.get("Subject", "(no subject)"),
                    "date": headers.get("Date", ""),
                    "snippet": msg_data.get("snippet", ""),
                }
            )
        return email_list
