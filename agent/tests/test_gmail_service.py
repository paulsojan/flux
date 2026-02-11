import base64
from unittest.mock import MagicMock, patch

import pytest

from gmail_service import GmailService


@pytest.fixture
def env_vars(monkeypatch):
    monkeypatch.setenv("GMAIL_CLIENT_ID", "test-client-id")
    monkeypatch.setenv("GMAIL_CLIENT_SECRET", "test-client-secret")
    monkeypatch.setenv("GMAIL_REDIRECT_URI", "http://localhost/callback")


@pytest.fixture
def mock_build():
    with patch("gmail_service.build") as mock:
        yield mock


@pytest.fixture
def mock_service():
    service = MagicMock()
    users = service.users.return_value
    messages = users.messages.return_value
    history = users.history.return_value

    service.users.return_value.messages.return_value = messages
    service.users.return_value.history.return_value = history

    return service


def test_is_authenticated_false_when_no_token(monkeypatch):
    monkeypatch.setattr("gmail_service.os.path.exists", lambda _: False)
    service = GmailService()
    assert not service.is_authenticated


def test_list_messages(mock_service, monkeypatch):
    monkeypatch.setattr("gmail_service.os.path.exists", lambda _: False)

    instance = GmailService.__new__(GmailService)
    instance.creds = MagicMock(valid=True)
    instance.service = mock_service

    mock_service.users().messages().list().execute.return_value = {
        "messages": [{"id": "123"}],
        "nextPageToken": "next-token",
    }

    mock_service.users().messages().get().execute.return_value = {
        "id": "123",
        "threadId": "t1",
        "payload": {"headers": []},
        "snippet": "hello",
    }

    result = instance.list_messages()

    assert result["nextPageToken"] == "next-token"
    assert result["messages"][0]["id"] == "123"


def test_get_message(mock_service):
    instance = GmailService.__new__(GmailService)
    instance.creds = MagicMock(valid=True)
    instance.service = mock_service

    encoded_body = base64.urlsafe_b64encode(b"Hello World").decode()

    mock_service.users().messages().get().execute.return_value = {
        "id": "1",
        "threadId": "t1",
        "labelIds": [],
        "payload": {
            "headers": [
                {"name": "From", "value": "a@test.com"},
                {"name": "Subject", "value": "Test"},
            ],
            "body": {"data": encoded_body},
            "mimeType": "text/plain",
        },
    }

    result = instance.get_message("1")

    assert result["id"] == "1"
    assert result["from"] == "a@test.com"
    assert result["subject"] == "Test"
    assert result["body"] == "Hello World"


def test_send_message(mock_service):
    instance = GmailService.__new__(GmailService)
    instance.creds = MagicMock(valid=True)
    instance.service = mock_service

    mock_service.users().messages().send().execute.return_value = {"id": "sent123"}

    result = instance.send_message("to@test.com", "Subject", "Body")

    assert result["id"] == "sent123"
    mock_service.users().messages().send.assert_called()


def test_reply_message(mock_service):
    instance = GmailService.__new__(GmailService)
    instance.creds = MagicMock(valid=True)
    instance.service = mock_service

    instance.get_message = MagicMock(
        return_value={
            "threadId": "thread123",
            "messageId": "<msg@test>",
            "labelIds": [],
            "from": "sender@test.com",
            "to": "me@test.com",
            "subject": "Hello",
        }
    )

    mock_service.users().messages().send().execute.return_value = {"id": "reply123"}

    result = instance.reply_message("1", "Reply body")

    assert result["id"] == "reply123"
    mock_service.users().messages().send.assert_called()


def test_search_messages():
    instance = GmailService.__new__(GmailService)
    instance.list_messages = MagicMock(return_value={"messages": []})

    result = instance.search_messages("from:test")

    instance.list_messages.assert_called()
    assert result == {"messages": []}
