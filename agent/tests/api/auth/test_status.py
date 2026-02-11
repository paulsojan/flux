from unittest.mock import MagicMock, patch

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from api.auth.status import router


@pytest.fixture
def client():
    app = FastAPI()
    app.include_router(router)
    return TestClient(app)


def test_auth_status_authenticated(client):
    mock_gmail = MagicMock()
    mock_gmail.is_authenticated = True

    with patch(
        "api.auth.status.GmailService.get_instance",
        return_value=mock_gmail,
    ):
        response = client.get("/auth/status")

        assert response.status_code == 200
        assert response.json() == {"authenticated": True}


def test_auth_status_not_authenticated(client):
    mock_gmail = MagicMock()
    mock_gmail.is_authenticated = False

    with patch(
        "api.auth.status.GmailService.get_instance",
        return_value=mock_gmail,
    ):
        response = client.get("/auth/status")

        assert response.status_code == 200
        assert response.json() == {"authenticated": False}
