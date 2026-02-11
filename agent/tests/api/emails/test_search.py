from unittest.mock import MagicMock, patch

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from api.emails.search import router


@pytest.fixture
def client():
    app = FastAPI()
    app.include_router(router)
    return TestClient(app)


def test_search_emails_returns_results(client):
    mock_gmail = MagicMock()
    mock_gmail.is_authenticated = True
    mock_gmail.search_messages.return_value = [
        {"id": "1", "subject": "Match 1"},
        {"id": "2", "subject": "Match 2"},
    ]

    with patch(
        "api.emails.search.GmailService.get_instance",
        return_value=mock_gmail,
    ):
        response = client.get("/api/emails/search?q=hello")

        assert response.status_code == 200
        data = response.json()
        assert len(data["emails"]) == 2
        mock_gmail.search_messages.assert_called_once_with(
            query="hello", max_results=10
        )


def test_search_emails_with_custom_max_results(client):
    mock_gmail = MagicMock()
    mock_gmail.is_authenticated = True
    mock_gmail.search_messages.return_value = []

    with patch(
        "api.emails.search.GmailService.get_instance",
        return_value=mock_gmail,
    ):
        response = client.get("/api/emails/search?q=test&max_results=5")

        assert response.status_code == 200
        mock_gmail.search_messages.assert_called_once_with(
            query="test", max_results=5
        )


def test_search_emails_not_authenticated(client):
    mock_gmail = MagicMock()
    mock_gmail.is_authenticated = False

    with patch(
        "api.emails.search.GmailService.get_instance",
        return_value=mock_gmail,
    ):
        response = client.get("/api/emails/search?q=hello")

        assert response.status_code == 200
        assert response.json() == {"error": "Not authenticated", "emails": []}
        mock_gmail.search_messages.assert_not_called()
