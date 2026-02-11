from unittest.mock import MagicMock, patch

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from api.auth.google_login import router


@pytest.fixture
def client():
    app = FastAPI()
    app.include_router(router)
    return TestClient(app)


def test_auth_login_redirects_to_google(client):
    mock_gmail = MagicMock()
    mock_gmail.get_auth_url.return_value = "https://accounts.google.com/o/oauth2/auth"

    with patch(
        "api.auth.google_login.GmailService.get_instance",
        return_value=mock_gmail,
    ):
        response = client.get("/auth/login", follow_redirects=False)

        assert response.status_code in (302, 307)
        assert (
            response.headers["location"] == "https://accounts.google.com/o/oauth2/auth"
        )

        mock_gmail.get_auth_url.assert_called_once()
