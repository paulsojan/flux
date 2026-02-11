from unittest.mock import MagicMock, patch

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from api.auth.callback import router


@pytest.fixture
def client():
    app = FastAPI()
    app.include_router(router)
    return TestClient(app)


def test_auth_callback_success(client):
    mock_gmail = MagicMock()

    with patch(
        "api.auth.callback.GmailService.get_instance",
        return_value=mock_gmail,
    ):
        response = client.get("/auth/callback?code=test_auth_code")

        assert response.status_code == 200
        assert "Authentication successful!" in response.text
        mock_gmail.handle_callback.assert_called_once_with("test_auth_code")


def test_auth_callback_no_code(client):
    response = client.get("/auth/callback")

    assert response.status_code == 400
    assert "No authorization code received" in response.text
