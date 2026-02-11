from unittest.mock import MagicMock, patch

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from api.emails.get_email import router


@pytest.fixture
def client():
    app = FastAPI()
    app.include_router(router)
    return TestClient(app)


def test_get_email_returns_message(client):
    mock_gmail = MagicMock()
    mock_gmail.is_authenticated = True
    mock_gmail.get_message.return_value = {
        "id": "abc123",
        "subject": "Test Email",
        "from": "sender@example.com",
    }

    with patch(
        "api.emails.get_email.GmailService.get_instance",
        return_value=mock_gmail,
    ):
        response = client.get("/api/emails/abc123")

        assert response.status_code == 200
        assert response.json()["id"] == "abc123"
        assert response.json()["subject"] == "Test Email"
        mock_gmail.get_message.assert_called_once_with("abc123")


def test_get_email_not_authenticated(client):
    mock_gmail = MagicMock()
    mock_gmail.is_authenticated = False

    with patch(
        "api.emails.get_email.GmailService.get_instance",
        return_value=mock_gmail,
    ):
        response = client.get("/api/emails/abc123")

        assert response.status_code == 200
        assert response.json() == {"error": "Not authenticated"}
        mock_gmail.get_message.assert_not_called()
