from unittest.mock import MagicMock, patch

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from api.emails.list import router


@pytest.fixture
def client():
    app = FastAPI()
    app.include_router(router)
    return TestClient(app)


def test_list_emails_returns_messages(client):
    mock_gmail = MagicMock()
    mock_gmail.is_authenticated = True
    mock_gmail.list_messages.return_value = {
        "messages": [{"id": "1", "subject": "Email 1"}],
        "nextPageToken": "token123",
    }

    with patch(
        "api.emails.list.GmailService.get_instance",
        return_value=mock_gmail,
    ):
        response = client.get("/api/emails")

        assert response.status_code == 200
        data = response.json()
        assert len(data["emails"]) == 1
        assert data["nextPageToken"] == "token123"
        mock_gmail.list_messages.assert_called_once_with(
            label="INBOX", max_results=20, page_token=None, query=""
        )


def test_list_emails_with_params(client):
    mock_gmail = MagicMock()
    mock_gmail.is_authenticated = True
    mock_gmail.list_messages.return_value = {
        "messages": [],
        "nextPageToken": None,
    }

    with patch(
        "api.emails.list.GmailService.get_instance",
        return_value=mock_gmail,
    ):
        response = client.get(
            "/api/emails?label=SENT&max_results=5&page_token=abc&query=test"
        )

        assert response.status_code == 200
        mock_gmail.list_messages.assert_called_once_with(
            label="SENT", max_results=5, page_token="abc", query="test"
        )


def test_list_emails_not_authenticated(client):
    mock_gmail = MagicMock()
    mock_gmail.is_authenticated = False

    with patch(
        "api.emails.list.GmailService.get_instance",
        return_value=mock_gmail,
    ):
        response = client.get("/api/emails")

        assert response.status_code == 200
        assert response.json() == {
            "error": "Not authenticated",
            "emails": [],
            "nextPageToken": None,
        }
        mock_gmail.list_messages.assert_not_called()
