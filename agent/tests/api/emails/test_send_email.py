from unittest.mock import MagicMock, patch

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from api.emails.send_email import router


@pytest.fixture
def client():
    app = FastAPI()
    app.include_router(router)
    return TestClient(app)


def test_send_email_success(client):
    mock_gmail = MagicMock()
    mock_gmail.is_authenticated = True
    mock_gmail.send_message.return_value = {"id": "sent123", "labelIds": ["SENT"]}

    with patch(
        "api.emails.send_email.GmailService.get_instance",
        return_value=mock_gmail,
    ):
        response = client.post(
            "/api/emails/send",
            json={
                "to": "recipient@example.com",
                "subject": "Test Subject",
                "body": "Test body content",
            },
        )

        assert response.status_code == 200
        assert response.json()["id"] == "sent123"
        mock_gmail.send_message.assert_called_once_with(
            to="recipient@example.com",
            subject="Test Subject",
            body="Test body content",
        )


def test_send_email_with_missing_fields(client):
    mock_gmail = MagicMock()
    mock_gmail.is_authenticated = True
    mock_gmail.send_message.return_value = {"id": "sent456"}

    with patch(
        "api.emails.send_email.GmailService.get_instance",
        return_value=mock_gmail,
    ):
        response = client.post("/api/emails/send", json={})

        assert response.status_code == 200
        mock_gmail.send_message.assert_called_once_with(to="", subject="", body="")


def test_send_email_not_authenticated(client):
    mock_gmail = MagicMock()
    mock_gmail.is_authenticated = False

    with patch(
        "api.emails.send_email.GmailService.get_instance",
        return_value=mock_gmail,
    ):
        response = client.post(
            "/api/emails/send",
            json={"to": "test@example.com", "subject": "Hi", "body": "Hello"},
        )

        assert response.status_code == 401
        assert response.json()["detail"] == "Not authenticated"
        mock_gmail.send_message.assert_not_called()
